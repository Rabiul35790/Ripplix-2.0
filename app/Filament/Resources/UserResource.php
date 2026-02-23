<?php

// File: app/Filament/Resources/UserResource.php
// UPDATED VERSION with Subscription Management

namespace App\Filament\Resources;

use App\Filament\Resources\UserResource\Pages;
use App\Models\User;
use App\Models\SubscriptionPlan;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Hash;

class UserResource extends Resource
{
    protected static ?string $model = User::class;
    protected static ?string $navigationGroup = 'User Management';
    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('User Information')
                    ->schema([
                        Forms\Components\TextInput::make('name')
                            ->required()
                            ->maxLength(255),

                        Forms\Components\TextInput::make('email')
                            ->email()
                            ->required()
                            ->unique(User::class, 'email', ignoreRecord: true)
                            ->maxLength(255),

                        Forms\Components\TextInput::make('password')
                            ->password()
                            ->required(fn (string $context): bool => $context === 'create')
                            ->dehydrated(fn ($state) => filled($state))
                            ->dehydrateStateUsing(fn ($state) => Hash::make($state))
                            ->minLength(8)
                            ->maxLength(255),

                        Forms\Components\Toggle::make('is_active')
                            ->label('Active Status')
                            ->default(true)
                            ->helperText('Inactive users cannot login to the system'),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Subscription Management')
                    ->schema([
                        Forms\Components\Select::make('subscription_plan_id')
                            ->label('Subscription Plan')
                            ->relationship('subscriptionPlan', 'name')
                            ->searchable()
                            ->preload()
                            ->helperText('Assign a subscription plan to this user')
                            ->placeholder('Select a subscription plan')
                            ->getOptionLabelFromRecordUsing(fn (SubscriptionPlan $record): string =>
                                "{$record->name} ({$record->formatted_price})"
                            )
                            ->afterStateUpdated(function ($state, Forms\Set $set) {
                                // Reset auto_renew based on plan type
                                if ($state) {
                                    $plan = SubscriptionPlan::find($state);
                                    if ($plan && ($plan->is_free_plan || $plan->is_lifetime_plan)) {
                                        $set('auto_renew', false);
                                    }
                                }
                            }),

                        Forms\Components\Toggle::make('auto_renew')
                            ->label('Auto Renewal')
                            ->default(true)
                            ->helperText('Automatically renew subscription at end of billing period')
                            ->disabled(function (Forms\Get $get): bool {
                                $planId = $get('subscription_plan_id');

                                if (!$planId) {
                                    return false;
                                }

                                $plan = SubscriptionPlan::find($planId);

                                return $plan && ($plan->is_free_plan || $plan->is_lifetime_plan);
                            }),

                        Forms\Components\Placeholder::make('stripe_customer_info')
                            ->label('Stripe Customer Info')
                            ->content(function ($record) {
                                if (!$record || !$record->hasStripeId()) {
                                    return 'No Stripe customer created yet';
                                }

                                $info = "Stripe ID: {$record->stripe_id}";

                                if ($record->hasDefaultPaymentMethod()) {
                                    $pm = $record->defaultPaymentMethod();
                                    $info .= "\nPayment Method: {$pm->card->brand} •••• {$pm->card->last4}";
                                }

                                return $info;
                            })
                            ->visible(fn ($record) => $record && $record->hasStripeId()),
                    ])
                    ->columns(2)
                    ->collapsible(),

                Forms\Components\Section::make('Role Assignment')
                    ->schema([
                        Forms\Components\Select::make('roles')
                            ->relationship('roles', 'name')
                            ->multiple()
                            ->preload()
                            ->searchable()
                            ->helperText('Select one or more roles for this user'),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('email')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('subscriptionPlan.name')
                    ->label('Subscription')
                    ->badge()
                    ->color(fn ($state, $record) => match (true) {
                        !$record->subscriptionPlan => 'gray',
                        $record->subscriptionPlan->is_free_plan => 'success',
                        $record->subscriptionPlan->is_lifetime_plan => 'warning',
                        $record->hasActiveStripeSubscription() => 'primary',
                        default => 'gray'
                    })
                    ->formatStateUsing(function ($state, $record) {
                        if (!$record->subscriptionPlan) {
                            return 'No Plan';
                        }

                        $planName = $record->subscriptionPlan->name;

                        if ($record->hasActiveStripeSubscription()) {
                            $subscription = $record->subscription('default');
                            if ($subscription->onGracePeriod()) {
                                return $planName . ' (Cancelling)';
                            }
                        }

                        return $planName;
                    })
                    ->searchable(),

                Tables\Columns\IconColumn::make('auto_renew')
                    ->label('Auto Renew')
                    ->boolean()
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('stripe_id')
                    ->label('Stripe Customer')
                    ->formatStateUsing(fn ($state) => $state ? 'Yes' : 'No')
                    ->badge()
                    ->color(fn ($state) => $state ? 'success' : 'gray')
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('pm_last_four')
                    ->label('Payment Method')
                    ->formatStateUsing(fn ($state, $record) =>
                        $state ? "{$record->pm_type} •••• {$state}" : 'None'
                    )
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\BadgeColumn::make('roles.name')
                    ->label('Roles')
                    ->separator(',')
                    ->colors([
                        'primary' => 'Super Admin',
                        'success' => 'Admin',
                        'warning' => 'Editor',
                        'secondary' => 'Viewer',
                    ]),

                Tables\Columns\IconColumn::make('is_active')
                    ->label('Status')
                    ->boolean()
                    ->trueIcon('heroicon-o-check-circle')
                    ->falseIcon('heroicon-o-x-circle')
                    ->trueColor('success')
                    ->falseColor('danger'),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Created')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('roles')
                    ->relationship('roles', 'name')
                    ->multiple()
                    ->preload(),

                Tables\Filters\SelectFilter::make('subscription_plan_id')
                    ->label('Subscription Plan')
                    ->relationship('subscriptionPlan', 'name')
                    ->searchable()
                    ->preload(),

                Tables\Filters\TernaryFilter::make('is_active')
                    ->label('Status')
                    ->boolean()
                    ->trueLabel('Active Users')
                    ->falseLabel('Inactive Users')
                    ->native(false),

                Tables\Filters\TernaryFilter::make('has_stripe_customer')
                    ->label('Stripe Customer')
                    ->queries(
                        true: fn (Builder $query) => $query->whereNotNull('stripe_id'),
                        false: fn (Builder $query) => $query->whereNull('stripe_id'),
                    )
                    ->native(false),
            ])
            ->actions([
                Tables\Actions\Action::make('assign_plan')
                    ->label('Assign Plan')
                    ->icon('heroicon-o-currency-dollar')
                    ->color('primary')
                    ->form([
                        Forms\Components\Select::make('subscription_plan_id')
                            ->label('Subscription Plan')
                            ->options(SubscriptionPlan::active()->pluck('name', 'id'))
                            ->required()
                            ->searchable()
                            ->helperText('Select a plan to assign to this user'),

                        Forms\Components\Toggle::make('auto_renew')
                            ->label('Enable Auto Renewal')
                            ->default(true)
                            ->helperText('Automatically renew subscription'),
                    ])
                    ->action(function ($record, array $data) {
                        $record->update($data);
                    }),

                Tables\Actions\Action::make('cancel_subscription')
                    ->label('Cancel Subscription')
                    ->icon('heroicon-o-x-circle')
                    ->color('danger')
                    ->visible(fn ($record) => $record->hasActiveStripeSubscription())
                    ->requiresConfirmation()
                    ->modalDescription('This will cancel the user\'s active Stripe subscription.')
                    ->action(function ($record) {
                        if ($record->hasActiveStripeSubscription()) {
                            $record->subscription('default')->cancel();
                        }
                    }),

                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make()
                    ->before(function (User $record) {
                        // Prevent deletion of the last super admin
                        $superAdmins = User::role('Super Admin')->count();
                        if ($record->hasRole('Super Admin') && $superAdmins <= 1) {
                            throw new \Exception('Cannot delete the last Super Admin user.');
                        }
                    }),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),

                    Tables\Actions\BulkAction::make('bulk_assign_plan')
                        ->label('Assign Plan to Selected')
                        ->icon('heroicon-o-currency-dollar')
                        ->form([
                            Forms\Components\Select::make('subscription_plan_id')
                                ->label('Subscription Plan')
                                ->options(SubscriptionPlan::active()->pluck('name', 'id'))
                                ->required()
                                ->searchable(),
                        ])
                        ->action(function ($records, array $data) {
                            foreach ($records as $record) {
                                $record->update($data);
                            }
                        })
                        ->deselectRecordsAfterCompletion(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListUsers::route('/'),
            'create' => Pages\CreateUser::route('/create'),
            'view' => Pages\ViewUser::route('/{record}'),
            'edit' => Pages\EditUser::route('/{record}/edit'),
        ];
    }

    public static function canViewAny(): bool
    {
        return auth()->user()->can('view_users');
    }

    public static function canCreate(): bool
    {
        return auth()->user()->can('create_users');
    }

    public static function canEdit($record): bool
    {
        return auth()->user()->can('edit_users');
    }

    public static function canDelete($record): bool
    {
        return auth()->user()->can('delete_users');
    }
}
