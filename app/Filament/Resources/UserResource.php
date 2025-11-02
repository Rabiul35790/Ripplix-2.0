<?php
// app/Filament/Resources/UserResource.php

namespace App\Filament\Resources;

use App\Filament\Resources\UserResource\Pages;
use App\Models\User;
use App\Models\PricingPlan;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserResource extends Resource
{
    protected static ?string $model = User::class;
    // protected static ?string $navigationIcon = 'heroicon-o-users';
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

                Forms\Components\Section::make('Pricing Plan Assignment')
                    ->schema([
                        Forms\Components\Select::make('pricing_plan_id')
                            ->label('Pricing Plan')
                            ->relationship('pricingPlan', 'name')
                            ->searchable()
                            ->preload()
                            ->live()
                            ->helperText('Optional: Assign a pricing plan to this user')
                            ->placeholder('Select a pricing plan (optional)')
                            ->getOptionLabelFromRecordUsing(fn (PricingPlan $record): string =>
                                "{$record->name} ({$record->formatted_price})"
                            ),

                        Forms\Components\DateTimePicker::make('plan_updated_at')
                            ->label('Plan Start Date')
                            ->default(now())
                            ->helperText('When the plan starts for this user')
                            ->visible(fn (Forms\Get $get): bool => filled($get('pricing_plan_id')))
                            ->required(fn (Forms\Get $get): bool => filled($get('pricing_plan_id'))),

                        Forms\Components\DateTimePicker::make('plan_expires_at')
                            ->label('Plan Expiry Date')
                            ->helperText('When the plan expires (leave empty for lifetime/free plans)')
                            ->visible(fn (Forms\Get $get): bool => filled($get('pricing_plan_id')))
                            ->afterStateUpdated(function (Forms\Get $get, Forms\Set $set, $state) {
                                // Auto-set expiry based on plan billing period if not manually set
                                $planId = $get('pricing_plan_id');
                                $startDate = $get('plan_updated_at');

                                if ($planId && $startDate && !$state) {
                                    $plan = PricingPlan::find($planId);
                                    if ($plan) {
                                        $start = \Carbon\Carbon::parse($startDate);

                                        if ($plan->billing_period === 'monthly') {
                                            $set('plan_expires_at', $start->copy()->addMonth());
                                        } elseif ($plan->billing_period === 'yearly') {
                                            $set('plan_expires_at', $start->copy()->addYear());
                                        }
                                        // For 'free' and 'lifetime', leave null (no expiry)
                                    }
                                }
                            }),

                        Forms\Components\Placeholder::make('plan_preview')
                            ->label('Plan Duration Preview')
                            ->content(function (Forms\Get $get) {
                                $planId = $get('pricing_plan_id');
                                $startDate = $get('plan_updated_at');
                                $endDate = $get('plan_expires_at');

                                if (!$planId || !$startDate) {
                                    return 'Select a plan and start date to see duration';
                                }

                                $plan = PricingPlan::find($planId);
                                if (!$plan) {
                                    return 'Invalid plan selected';
                                }

                                $start = \Carbon\Carbon::parse($startDate);

                                if (!$endDate) {
                                    return "Plan: {$plan->name} | Duration: Lifetime/Permanent";
                                }

                                $end = \Carbon\Carbon::parse($endDate);
                                $duration = $start->diffForHumans($end, true);

                                return "Plan: {$plan->name} | Duration: {$duration} ({$start->format('M d, Y')} - {$end->format('M d, Y')})";
                            })
                            ->visible(fn (Forms\Get $get): bool => filled($get('pricing_plan_id'))),
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

                Tables\Columns\TextColumn::make('pricingPlan.name')
                    ->label('Pricing Plan')
                    ->badge()
                    ->color(fn ($state, $record) => match (true) {
                        !$record->pricingPlan => 'gray',
                        $record->pricingPlan->price == 0 => 'success',
                        $record->pricingPlan->billing_period === 'lifetime' => 'warning',
                        $record->isSubscriptionExpired() => 'danger',
                        $record->subscriptionExpiresSoon() => 'warning',
                        default => 'primary'
                    })
                    ->formatStateUsing(function ($state, $record) {
                        if (!$record->pricingPlan) {
                            return 'No Plan';
                        }

                        $planName = $record->pricingPlan->name;

                        if ($record->plan_expires_at) {
                            if ($record->isSubscriptionExpired()) {
                                return $planName . ' (Expired)';
                            } elseif ($record->subscriptionExpiresSoon()) {
                                $days = $record->daysUntilExpiry();
                                return $planName . " ({$days}d left)";
                            }
                        }

                        return $planName;
                    })
                    ->searchable(),

                Tables\Columns\TextColumn::make('plan_updated_at')
                    ->label('Plan Started')
                    ->dateTime('M d, Y')
                    ->sortable()
                    ->placeholder('Not set')
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('plan_expires_at')
                    ->label('Plan Expires')
                    ->dateTime('M d, Y')
                    ->sortable()
                    ->placeholder('Never')
                    ->color(fn ($record) => match (true) {
                        !$record->plan_expires_at => 'success',
                        $record->isSubscriptionExpired() => 'danger',
                        $record->subscriptionExpiresSoon() => 'warning',
                        default => 'gray'
                    })
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

                Tables\Filters\SelectFilter::make('pricing_plan_id')
                    ->label('Pricing Plan')
                    ->relationship('pricingPlan', 'name')
                    ->searchable()
                    ->preload(),

                Tables\Filters\TernaryFilter::make('is_active')
                    ->label('Status')
                    ->boolean()
                    ->trueLabel('Active Users')
                    ->falseLabel('Inactive Users')
                    ->native(false),

                Tables\Filters\Filter::make('expired_plans')
                    ->label('Expired Plans')
                    ->query(fn (Builder $query): Builder =>
                        $query->whereNotNull('plan_expires_at')
                              ->where('plan_expires_at', '<', now())
                    ),

                Tables\Filters\Filter::make('expiring_soon')
                    ->label('Expiring Soon (7 days)')
                    ->query(fn (Builder $query): Builder =>
                        $query->whereNotNull('plan_expires_at')
                              ->where('plan_expires_at', '>', now())
                              ->where('plan_expires_at', '<=', now()->addDays(7))
                    ),

                Tables\Filters\Filter::make('no_plan')
                    ->label('No Pricing Plan')
                    ->query(fn (Builder $query): Builder =>
                        $query->whereNull('pricing_plan_id')
                    ),
            ])
            ->actions([
                Tables\Actions\Action::make('extend_plan')
                    ->label('Extend Plan')
                    ->icon('heroicon-o-clock')
                    ->color('success')
                    ->visible(fn ($record) => $record->pricingPlan && $record->plan_expires_at)
                    ->form([
                        Forms\Components\Select::make('extension_type')
                            ->label('Extension Type')
                            ->options([
                                'days' => 'Days',
                                'weeks' => 'Weeks',
                                'months' => 'Months',
                                'years' => 'Years',
                            ])
                            ->required()
                            ->default('days'),

                        Forms\Components\TextInput::make('extension_amount')
                            ->label('Amount')
                            ->numeric()
                            ->required()
                            ->minValue(1)
                            ->default(7),
                    ])
                    ->action(function ($record, array $data) {
                        $currentExpiry = $record->plan_expires_at ?: now();
                        $extension = match($data['extension_type']) {
                            'days' => $currentExpiry->addDays($data['extension_amount']),
                            'weeks' => $currentExpiry->addWeeks($data['extension_amount']),
                            'months' => $currentExpiry->addMonths($data['extension_amount']),
                            'years' => $currentExpiry->addYears($data['extension_amount']),
                        };

                        $record->update(['plan_expires_at' => $extension]);
                    }),

                Tables\Actions\Action::make('remove_plan')
                    ->label('Remove Plan')
                    ->icon('heroicon-o-x-mark')
                    ->color('danger')
                    ->visible(fn ($record) => $record->pricingPlan)
                    ->requiresConfirmation()
                    ->modalDescription('This will remove the pricing plan from this user.')
                    ->action(function ($record) {
                        $record->update([
                            'pricing_plan_id' => null,
                            'plan_updated_at' => null,
                            'plan_expires_at' => null,
                        ]);
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
                            Forms\Components\Select::make('pricing_plan_id')
                                ->label('Pricing Plan')
                                ->relationship('pricingPlan', 'name')
                                ->searchable()
                                ->preload()
                                ->required()
                                ->getOptionLabelFromRecordUsing(fn (PricingPlan $record): string =>
                                    "{$record->name} ({$record->formatted_price})"
                                ),

                            Forms\Components\DateTimePicker::make('plan_updated_at')
                                ->label('Plan Start Date')
                                ->default(now())
                                ->required(),

                            Forms\Components\DateTimePicker::make('plan_expires_at')
                                ->label('Plan Expiry Date')
                                ->helperText('Leave empty for lifetime/free plans'),
                        ])
                        ->action(function ($records, array $data) {
                            foreach ($records as $record) {
                                $record->update($data);
                            }
                        })
                        ->deselectRecordsAfterCompletion(),

                    Tables\Actions\BulkAction::make('bulk_remove_plan')
                        ->label('Remove Plan from Selected')
                        ->icon('heroicon-o-x-mark')
                        ->color('danger')
                        ->requiresConfirmation()
                        ->action(function ($records) {
                            foreach ($records as $record) {
                                $record->update([
                                    'pricing_plan_id' => null,
                                    'plan_updated_at' => null,
                                    'plan_expires_at' => null,
                                ]);
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
