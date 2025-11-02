<?php

namespace App\Filament\Resources;

use App\Filament\Resources\PricingPlanResource\Pages;
use App\Models\PricingPlan;
use App\Models\VisitorSession;
use App\Models\User;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

class PricingPlanResource extends Resource
{
    protected static ?string $model = PricingPlan::class;
    protected static ?string $navigationIcon = 'heroicon-o-currency-dollar';
    protected static ?string $navigationGroup = 'Payment Management';
    protected static ?int $navigationSort = 1;
    protected static ?string $navigationLabel = 'Pricing Plans';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Plan Information')
                    ->schema([
                        Forms\Components\TextInput::make('name')
                            ->required()
                            ->live(onBlur: true)
                            ->afterStateUpdated(fn (string $context, $state, Forms\Set $set) =>
                                $context === 'create' ? $set('slug', Str::slug($state)) : null
                            ),

                        Forms\Components\TextInput::make('slug')
                            ->required()
                            ->unique(PricingPlan::class, 'slug', ignoreRecord: true)
                            ->rules(['alpha_dash']),

                        Forms\Components\Select::make('billing_period')
                            ->label('Billing Period')
                            ->options([
                                'free' => 'Free',
                                'monthly' => 'Monthly',
                                'yearly' => 'Yearly',
                                'lifetime' => 'Lifetime',
                            ])
                            ->required()
                            ->live(),

                        Forms\Components\TextInput::make('price')
                            ->numeric()
                            ->prefix('$')
                            ->step(0.01)
                            ->default(0)
                            ->live()
                            ->hidden(fn (Forms\Get $get) => $get('billing_period') === 'free'),

                        Forms\Components\TextInput::make('original_price')
                            ->label('Original Price (for crossed-out display)')
                            ->numeric()
                            ->prefix('$')
                            ->step(0.01)
                            ->hidden(fn (Forms\Get $get) => $get('billing_period') === 'free'),

                        Forms\Components\Select::make('currency')
                            ->options([
                                'USD' => 'USD ($)',
                                'EUR' => 'EUR (€)',
                                'GBP' => 'GBP (£)',
                            ])
                            ->default('USD')
                            ->hidden(fn (Forms\Get $get) => $get('billing_period') === 'free'),

                        Forms\Components\Textarea::make('description')
                            ->rows(3),

                        Forms\Components\TextInput::make('sort_order')
                            ->numeric()
                            ->default(0)
                            ->helperText('Lower numbers appear first'),

                        Forms\Components\Grid::make(3)
                            ->schema([
                                Forms\Components\Toggle::make('is_active')
                                    ->default(true),

                                Forms\Components\Toggle::make('is_featured')
                                    ->helperText('Highlight this plan'),

                                Forms\Components\Toggle::make('student_verification_required')
                                    ->label('Require Student Verification')
                                    ->hidden(fn (Forms\Get $get) => !$get('student_discount_percentage')),
                            ]),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Plan Features')
                    ->schema([
                        Forms\Components\TextInput::make('grid_list_visibility')
                            ->label('Grid / List Visibility')
                            ->placeholder('e.g., Only first 12 cards per collection'),

                        Forms\Components\TextInput::make('daily_previews')
                            ->label('Daily Previews (full-view)')
                            ->placeholder('e.g., 15 previews / day or Unlimited'),

                        Forms\Components\TextInput::make('boards_create')
                            ->label('Boards (create)')
                            ->placeholder('e.g., Up to 3 boards or Unlimited'),

                        Forms\Components\Toggle::make('board_sharing')
                            ->label('Board Sharing'),

                        Forms\Components\Toggle::make('ads')
                            ->label('Show Ads')
                            ->default(true),

                        Forms\Components\Textarea::make('extras')
                            ->label('Extra Features')
                            ->placeholder('e.g., Email digest of new clips (weekly)')
                            ->rows(3),

                        Forms\Components\Repeater::make('features')
                            ->label('Additional Features List')
                            ->schema([
                                Forms\Components\TextInput::make('feature')
                                    ->required()
                                    ->placeholder('Enter feature description'),
                            ])
                            ->addActionLabel('Add Feature')
                            ->collapsible()
                            ->itemLabel(fn (array $state): ?string => $state['feature'] ?? null),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Student Discount')
                    ->schema([
                        Forms\Components\TextInput::make('student_discount_percentage')
                            ->label('Student Discount (%)')
                            ->numeric()
                            ->suffix('%')
                            ->minValue(0)
                            ->maxValue(100)
                            ->live()
                            ->helperText('Leave empty for no student discount'),

                        Forms\Components\Placeholder::make('student_price_preview')
                            ->label('Student Price Preview')
                            ->content(function (Forms\Get $get) {
                                $price = $get('price') ?? 0;
                                $discount = $get('student_discount_percentage') ?? 0;
                                $billingPeriod = $get('billing_period');

                                if (!$discount || $billingPeriod === 'free') {
                                    return 'No student discount';
                                }

                                $studentPrice = $price * (1 - $discount / 100);
                                return '$' . number_format($studentPrice, 2) . ' (Save ' . $discount . '%)';
                            })
                            ->visible(fn (Forms\Get $get) => $get('student_discount_percentage')),
                    ])
                    ->columns(2)
                    ->hidden(fn (Forms\Get $get) => $get('billing_period') === 'free'),

                Forms\Components\Section::make('Visual Settings')
                    ->schema([
                        Forms\Components\TextInput::make('button_text')
                            ->default('Choose Plan'),

                        Forms\Components\ColorPicker::make('button_color')
                            ->default('#3B82F6'),

                        Forms\Components\ColorPicker::make('highlight_color')
                            ->label('Plan Highlight Color')
                            ->helperText('Used for featured plans'),
                    ])
                    ->columns(3)
                    ->collapsible(),

                Forms\Components\Section::make('SEO Settings')
                    ->schema([
                        Forms\Components\TextInput::make('meta_title')
                            ->maxLength(60)
                            ->helperText('Recommended: 50-60 characters'),

                        Forms\Components\Textarea::make('meta_description')
                            ->maxLength(160)
                            ->rows(3)
                            ->helperText('Recommended: 150-160 characters'),
                    ])
                    ->columns(2)
                    ->collapsible(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn (Builder $query) => $query->withCount(['users', 'activeUsers']))
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('billing_period')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'free' => 'success',
                        'monthly' => 'info',
                        'yearly' => 'warning',
                        'lifetime' => 'danger',
                        default => 'gray',
                    }),

                Tables\Columns\TextColumn::make('formatted_price')
                    ->label('Price')
                    ->badge()
                    ->color('success'),

                Tables\Columns\TextColumn::make('formatted_student_price')
                    ->label('Student Price')
                    ->badge()
                    ->color('info')
                    ->placeholder('No discount'),

                Tables\Columns\TextColumn::make('real_time_users')
                    ->label('Real-time Users')
                    ->badge()
                    ->color('primary')
                    ->formatStateUsing(function ($record) {
                        // For visitor plan, show active visitors
                        if ($record->slug === 'visitor') {
                            return VisitorSession::getActiveVisitorsCount() . ' visitors';
                        }

                        // For free-member plan
                        if ($record->slug === 'free-member') {
                            return User::getFreeMembersCount() . ' members';
                        }

                        // For lifetime-pro plan (users with roles)
                        if ($record->slug === 'lifetime-pro') {
                            $lifetimeUsers = User::active()
                                ->whereHas('roles')
                                ->count();
                            return $lifetimeUsers . ' lifetime';
                        }

                        // For other paid plans
                        return $record->active_users_count . ' users';
                    })
                    ->sortable(false),

                Tables\Columns\TextColumn::make('users_count')
                    ->label('Total Users')
                    ->badge()
                    ->color('gray')
                    ->sortable()
                    ->formatStateUsing(function ($record) {
                        // For visitor plan, always show current active visitors
                        if ($record->slug === 'visitor') {
                            return VisitorSession::getActiveVisitorsCount();
                        }

                        return $record->users_count ?: 0;
                    }),

                Tables\Columns\TextColumn::make('active_users_count')
                    ->label('Active Users')
                    ->badge()
                    ->color('success')
                    ->sortable()
                    ->formatStateUsing(function ($record) {
                        // For visitor plan, show active visitors
                        if ($record->slug === 'visitor') {
                            return VisitorSession::getActiveVisitorsCount();
                        }

                        return $record->active_users_count ?: 0;
                    }),

                Tables\Columns\TextColumn::make('role_users_count')
                    ->label('Role Users')
                    ->badge()
                    ->color('warning')
                    ->formatStateUsing(function ($record) {
                        if ($record->slug === 'lifetime-pro') {
                            $roleUsers = User::active()
                                ->whereHas('roles')
                                ->count();
                            return $roleUsers . ' with roles';
                        }
                        return 'N/A';
                    })
                    ->visible(fn ($record) => $record && $record->slug === 'lifetime-pro')
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('estimated_revenue')
                    ->label('Est. Revenue')
                    ->badge()
                    ->color('warning')
                    ->formatStateUsing(function ($record) {
                        // Visitors and free plans don't generate revenue
                        if ($record->slug === 'visitor' || $record->price == 0) {
                            return '$0.00';
                        }

                        $userCount = $record->active_users_count;
                        $revenue = $userCount * $record->price;
                        return $revenue > 0 ? '$' . number_format($revenue, 2) : '$0.00';
                    })
                    ->sortable(query: function (Builder $query, string $direction): Builder {
                        return $query->orderByRaw("(active_users_count * price) {$direction}");
                    }),

                Tables\Columns\TextColumn::make('grid_list_visibility')
                    ->label('Grid Visibility')
                    ->limit(30)
                    ->tooltip(function (Tables\Columns\TextColumn $column): ?string {
                        $state = $column->getState();
                        return strlen($state) > 30 ? $state : null;
                    })
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('daily_previews')
                    ->label('Previews')
                    ->badge()
                    ->color('primary')
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\IconColumn::make('board_sharing')
                    ->boolean()
                    ->label('Sharing')
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\IconColumn::make('ads')
                    ->boolean()
                    ->label('Ads')
                    ->trueColor('danger')
                    ->falseColor('success')
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('sort_order')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\IconColumn::make('is_featured')
                    ->boolean()
                    ->label('Featured')
                    ->sortable(),

                Tables\Columns\IconColumn::make('is_active')
                    ->boolean()
                    ->sortable(),

                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('billing_period')
                    ->options([
                        'free' => 'Free',
                        'monthly' => 'Monthly',
                        'yearly' => 'Yearly',
                        'lifetime' => 'Lifetime',
                    ]),

                Tables\Filters\TernaryFilter::make('is_active')
                    ->label('Active'),

                Tables\Filters\TernaryFilter::make('is_featured')
                    ->label('Featured'),

                Tables\Filters\Filter::make('has_student_discount')
                    ->label('Has Student Discount')
                    ->query(fn (Builder $query): Builder => $query->whereNotNull('student_discount_percentage')),

                Tables\Filters\Filter::make('has_visitors')
                    ->label('Has Active Visitors')
                    ->query(fn (Builder $query): Builder =>
                        $query->where('slug', 'visitor')
                    ),

                Tables\Filters\Filter::make('has_users')
                    ->label('Has Users')
                    ->query(fn (Builder $query): Builder =>
                        $query->whereHas('users')
                    ),

                Tables\Filters\Filter::make('no_users')
                    ->label('No Users')
                    ->query(fn (Builder $query): Builder =>
                        $query->whereDoesntHave('users')
                            ->where('slug', '!=', 'visitor')
                    ),

                Tables\Filters\Filter::make('role_based_plans')
                    ->label('Role-based Plans')
                    ->query(fn (Builder $query): Builder =>
                        $query->where('slug', 'lifetime-pro')
                    ),

                Tables\Filters\Filter::make('revenue_generating')
                    ->label('Revenue Generating')
                    ->query(fn (Builder $query): Builder =>
                        $query->where('price', '>', 0)
                            ->whereHas('activeUsers')
                    ),
            ])
            ->actions([
                Tables\Actions\Action::make('view_users')
                    ->label('View Users')
                    ->icon('heroicon-o-users')
                    ->color('info')
                    ->action(function ($record) {
                        // You can implement a modal or redirect to show users
                        return redirect()->route('filament.admin.resources.users.index', [
                            'tableFilters' => [
                                'pricing_plan_id' => ['value' => $record->id]
                            ]
                        ]);
                    })
                    ->visible(fn ($record) => $record->slug !== 'visitor'),



                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make()
                    ->requiresConfirmation()
                    ->modalDescription(function ($record) {
                        if ($record->slug === 'visitor') {
                            return 'Warning: This is the visitor tracking plan. Deleting it will disable visitor tracking.';
                        }

                        $userCount = $record->users()->count();
                        if ($userCount > 0) {
                            return "Warning: This plan has {$userCount} users. Deleting it will set their pricing_plan_id to null.";
                        }
                        return 'Are you sure you want to delete this pricing plan?';
                    }),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),

                    Tables\Actions\BulkAction::make('activate')
                        ->label('Activate Selected')
                        ->icon('heroicon-o-check-circle')
                        ->action(fn ($records) => $records->each->update(['is_active' => true]))
                        ->deselectRecordsAfterCompletion(),

                    Tables\Actions\BulkAction::make('deactivate')
                        ->label('Deactivate Selected')
                        ->icon('heroicon-o-x-circle')
                        ->action(fn ($records) => $records->each->update(['is_active' => false]))
                        ->deselectRecordsAfterCompletion(),

                    Tables\Actions\BulkAction::make('mark_featured')
                        ->label('Mark as Featured')
                        ->icon('heroicon-o-star')
                        ->action(fn ($records) => $records->each->update(['is_featured' => true]))
                        ->deselectRecordsAfterCompletion(),

                    Tables\Actions\BulkAction::make('unmark_featured')
                        ->label('Remove Featured')
                        ->icon('heroicon-o-star')
                        ->action(fn ($records) => $records->each->update(['is_featured' => false]))
                        ->deselectRecordsAfterCompletion(),

                    Tables\Actions\BulkAction::make('sync_role_users')
                        ->label('Sync Role Users to Lifetime')
                        ->icon('heroicon-o-user-group')
                        ->action(function () {
                            // Find all users with roles and assign them to lifetime-pro plan
                            $lifetimePlan = PricingPlan::where('slug', 'lifetime-pro')->first();

                            if ($lifetimePlan) {
                                $usersWithRoles = User::whereHas('roles')
                                    ->where('pricing_plan_id', '!=', $lifetimePlan->id)
                                    ->get();

                                foreach ($usersWithRoles as $user) {
                                    $user->update(['pricing_plan_id' => $lifetimePlan->id]);
                                }

                                return count($usersWithRoles) . ' users synced to lifetime plan.';
                            }

                            return 'Lifetime plan not found.';
                        })
                        ->requiresConfirmation()
                        ->modalDescription('This will assign all users with roles to the lifetime-pro plan.')
                        ->deselectRecordsAfterCompletion(),
                ]),
            ])
            ->defaultSort('sort_order')
            ->reorderable('sort_order')
            ->poll('10s'); // Auto-refresh every 10 seconds for real-time data
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListPricingPlans::route('/'),
            'create' => Pages\CreatePricingPlan::route('/create'),
            'view' => Pages\ViewPricingPlan::route('/{record}'),
            'edit' => Pages\EditPricingPlan::route('/{record}/edit'),
        ];
    }

    public static function getNavigationBadge(): ?string
    {
        $counts = PricingPlan::getUserCountsByPlan();
        $totalUsers = array_sum($counts);
        return $totalUsers > 0 ? (string) $totalUsers : null;
    }

    public static function getGlobalSearchResultTitle($record): string
    {
        return $record->name . ' (' . $record->formatted_price . ')';
    }

    public static function getGlobalSearchResultDetails($record): array
    {
        $details = ['Users: ' . $record->users_count];

        if ($record->slug === 'visitor') {
            $details[] = 'Active Visitors: ' . VisitorSession::getActiveVisitorsCount();
        }

        return $details;
    }

    // Permission methods following your CategoryResource pattern
    public static function canViewAny(): bool
    {
        return auth()->user()->can('view_pricing_plans');
    }

    public static function canCreate(): bool
    {
        return auth()->user()->can('create_pricing_plans');
    }

    public static function canEdit($record): bool
    {
        return auth()->user()->can('edit_pricing_plans');
    }

    public static function canDelete($record): bool
    {
        return auth()->user()->can('delete_pricing_plans');
    }
}


