<?php

namespace App\Filament\Resources;

use App\Filament\Resources\SettingResource\Pages;
use App\Models\Setting;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Grid;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\BooleanColumn;
use Filament\Tables\Columns\ImageColumn;

class SettingResource extends Resource
{
    protected static ?string $model = Setting::class;

    protected static ?string $navigationIcon = 'heroicon-o-cog-6-tooth';

    protected static ?string $navigationGroup = 'System';

    protected static ?int $navigationSort = 3;

    protected static ?string $slug = 'settings';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Section::make('Site Information')
                    ->description('Basic information about your website')
                    ->schema([
                        TextInput::make('site_name')
                            ->label('Site Name')
                            ->required()
                            ->maxLength(255),

                        Textarea::make('site_description')
                            ->label('Site Description')
                            ->rows(3)
                            ->maxLength(500),

                        Textarea::make('copyright_text')
                            ->label('Copyright Text')
                            ->rows(2)
                            ->maxLength(255)
                            ->placeholder('© 2025 Your Company. All rights reserved.'),
                    ]),

                Section::make('Brand Assets')
                    ->description('Upload your logo and favicon and Authentication pages Images')
                    ->schema([
                        Grid::make(2)
                            ->schema([
                                FileUpload::make('logo')
                                    ->label('Logo')
                                    ->image()
                                    ->directory('uploads/settings')
                                    ->acceptedFileTypes(['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'])
                                    ->maxSize(2048)
                                    ->imageResizeMode('contain')
                                    ->imageResizeTargetWidth('400')
                                    ->imageResizeTargetHeight('225'),

                                FileUpload::make('favicon')
                                    ->label('Favicon')
                                    ->image()
                                    ->directory('uploads/settings')
                                    ->acceptedFileTypes(['image/x-icon', 'image/png'])
                                    ->maxSize(512)
                                    ->imageResizeTargetWidth('32')
                                    ->imageResizeTargetHeight('32'),

                                FileUpload::make('authentication_page_image')
                                    ->label('Auth image')
                                    ->image()
                                    ->directory('uploads/settings')
                                    ->acceptedFileTypes(['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'])
                                    ->maxSize(20480),

                                FileUpload::make('hero_image')
                                    ->label('Hero image')
                                    ->image()
                                    ->directory('uploads/settings')
                                    ->acceptedFileTypes(['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'])
                                    ->maxSize(20480),
                            ]),
                    ]),

                Section::make('Contact Information')
                    ->description('Your business contact details')
                    ->schema([
                        Repeater::make('emails')
                            ->label('Email Addresses')
                            ->schema([
                                Grid::make(3)
                                    ->schema([
                                        Select::make('type')
                                            ->label('Type')
                                            ->options([
                                                'general' => 'General',
                                                'support' => 'Support',
                                                'sales' => 'Sales',
                                                'info' => 'Information',
                                                'contact' => 'Contact',
                                                'admin' => 'Admin',
                                                'noreply' => 'No Reply',
                                                'other' => 'Other',
                                            ])
                                            ->required()
                                            ->default('general'),

                                        TextInput::make('custom_label')
                                            ->label('Custom Label')
                                            ->visible(fn (Forms\Get $get) => $get('type') === 'other')
                                            ->maxLength(50),

                                        TextInput::make('email')
                                            ->label('Email Address')
                                            ->email()
                                            ->required()
                                            ->maxLength(255),
                                    ]),
                            ])
                            ->collapsible()
                            ->cloneable()
                            ->reorderable()
                            ->defaultItems(0)
                            ->addActionLabel('Add Email Address')
                            ->deleteAction(
                                fn ($action) => $action->requiresConfirmation()
                            ),

                        Repeater::make('phones')
                            ->label('Phone Numbers')
                            ->schema([
                                Grid::make(3)
                                    ->schema([
                                        Select::make('type')
                                            ->label('Type')
                                            ->options([
                                                'office' => 'Office',
                                                'mobile' => 'Mobile',
                                                'fax' => 'Fax',
                                                'toll_free' => 'Toll Free',
                                                'support' => 'Support',
                                                'sales' => 'Sales',
                                                'emergency' => 'Emergency',
                                                'other' => 'Other',
                                            ])
                                            ->required()
                                            ->default('office'),

                                        TextInput::make('custom_label')
                                            ->label('Custom Label')
                                            ->visible(fn (Forms\Get $get) => $get('type') === 'other')
                                            ->maxLength(50),

                                        TextInput::make('number')
                                            ->label('Phone Number')
                                            ->tel()
                                            ->required()
                                            ->maxLength(20),
                                    ]),
                            ])
                            ->collapsible()
                            ->cloneable()
                            ->reorderable()
                            ->defaultItems(0)
                            ->addActionLabel('Add Phone Number')
                            ->deleteAction(
                                fn ($action) => $action->requiresConfirmation()
                            ),

                        Repeater::make('addresses')
                            ->label('Addresses')
                            ->schema([
                                Grid::make(2)
                                    ->schema([
                                        Select::make('type')
                                            ->label('Type')
                                            ->options([
                                                'headquarters' => 'Headquarters',
                                                'office' => 'Office',
                                                'branch' => 'Branch',
                                                'warehouse' => 'Warehouse',
                                                'store' => 'Store',
                                                'mailing' => 'Mailing Address',
                                                'billing' => 'Billing Address',
                                                'other' => 'Other',
                                            ])
                                            ->required()
                                            ->default('office'),

                                        TextInput::make('custom_label')
                                            ->label('Custom Label')
                                            ->visible(fn (Forms\Get $get) => $get('type') === 'other')
                                            ->maxLength(50),
                                    ]),

                                Textarea::make('address')
                                    ->label('Full Address')
                                    ->required()
                                    ->rows(3)
                                    ->maxLength(500)
                                    ->placeholder('Street address, city, state, postal code, country'),
                            ])
                            ->collapsible()
                            ->cloneable()
                            ->reorderable()
                            ->defaultItems(0)
                            ->addActionLabel('Add Address')
                            ->deleteAction(
                                fn ($action) => $action->requiresConfirmation()
                            ),
                    ]),

                Section::make('Social Media')
                    ->description('Add your social media links')
                    ->schema([
                        Repeater::make('social_media')
                            ->label('Social Media Links')
                            ->schema([
                                Grid::make(3)
                                    ->schema([
                                        Select::make('platform')
                                            ->label('Platform')
                                            ->options([
                                                'facebook' => 'Facebook',
                                                'twitter' => 'Twitter/X',
                                                'instagram' => 'Instagram',
                                                'linkedin' => 'LinkedIn',
                                                'youtube' => 'YouTube',
                                                'tiktok' => 'TikTok',
                                                'pinterest' => 'Pinterest',
                                                'snapchat' => 'Snapchat',
                                                'telegram' => 'Telegram',
                                                'whatsapp' => 'WhatsApp',
                                                'discord' => 'Discord',
                                                'github' => 'GitHub',
                                                'dribbble' => 'Dribbble',
                                                'behance' => 'Behance',
                                                'medium' => 'Medium',
                                                'reddit' => 'Reddit',
                                                'other' => 'Other',
                                            ])
                                            ->required()
                                            ->searchable(),

                                        TextInput::make('custom_name')
                                            ->label('Custom Name')
                                            ->visible(fn (Forms\Get $get) => $get('platform') === 'other'),

                                        TextInput::make('url')
                                            ->label('URL')
                                            ->url()
                                            ->required()
                                            ->prefix('https://')
                                            ->maxLength(500),
                                    ]),
                            ])
                            ->collapsible()
                            ->cloneable()
                            ->reorderable()
                            ->defaultItems(0)
                            ->addActionLabel('Add Social Media Link')
                            ->deleteAction(
                                fn ($action) => $action->requiresConfirmation()
                            ),
                    ]),

                Section::make('Maintenance Mode')
                    ->description('Control site maintenance mode')
                    ->schema([
                        Toggle::make('maintenance_mode')
                            ->label('Enable Maintenance Mode')
                            ->helperText('When enabled, only administrators can access the site'),

                        Textarea::make('maintenance_message')
                            ->label('Maintenance Message')
                            ->rows(3)
                            ->maxLength(500)
                            ->placeholder('We are currently performing scheduled maintenance. Please check back soon.')
                            ->visible(fn (Forms\Get $get) => $get('maintenance_mode')),
                    ]),

                Section::make('SEO Settings')
                    ->description('Configure default and per-page SEO tags used by the frontend.')
                    ->schema([
                        Repeater::make('seo_settings')
                            ->label('SEO Profiles')
                            ->schema([
                                Grid::make(2)
                                    ->schema([
                                        Select::make('page_key')
                                            ->label('Page Key')
                                            ->options([
                                                'global' => 'Global Default (Fallback)',
                                                'Home' => 'Home',
                                                'Browse' => 'Browse',
                                                'BlogShow' => 'Blog Detail',
                                                'LegalShow' => 'Legal Detail',
                                                'AllApps' => 'All Apps',
                                                'AllCategories' => 'All Categories',
                                                'AllElements' => 'All Elements',
                                                'SearchResults' => 'Search Results',
                                                'Following' => 'Following',
                                                'Collections' => 'Collections',
                                                'ContactUs' => 'Contact',
                                                'SponsorUs' => 'Sponsor',
                                                'PaymentManagement' => 'Payment Management',
                                                'Dashboard' => 'Dashboard',
                                                'custom' => 'Custom Page Key',
                                            ])
                                            ->searchable()
                                            ->required(),

                                        TextInput::make('custom_page_key')
                                            ->label('Custom Page Key')
                                            ->placeholder('Example: Auth/Login')
                                            ->visible(fn (Forms\Get $get) => $get('page_key') === 'custom'),
                                    ]),

                                TextInput::make('title')
                                    ->label('Meta Title')
                                    ->maxLength(255)
                                    ->placeholder('Page title'),

                                Textarea::make('description')
                                    ->label('Meta Description')
                                    ->rows(2)
                                    ->maxLength(500),

                                TextInput::make('canonical_url')
                                    ->label('Canonical URL (optional)')
                                    ->placeholder('https://www.ripplix.com/browse'),

                                Grid::make(2)
                                    ->schema([
                                        TextInput::make('og_title')
                                            ->label('OG Title')
                                            ->maxLength(255),
                                        TextInput::make('og_type')
                                            ->label('OG Type')
                                            ->default('website')
                                            ->maxLength(50),
                                        Textarea::make('og_description')
                                            ->label('OG Description')
                                            ->rows(2)
                                            ->maxLength(500),
                                        TextInput::make('og_image')
                                            ->label('OG Image URL')
                                            ->placeholder('https://www.ripplix.com/images/og/og-default.png'),
                                        TextInput::make('og_url')
                                            ->label('OG URL (optional)'),
                                        TextInput::make('og_site_name')
                                            ->label('OG Site Name')
                                            ->maxLength(100),
                                    ]),

                                Grid::make(2)
                                    ->schema([
                                        Select::make('twitter_card')
                                            ->label('Twitter Card')
                                            ->options([
                                                'summary' => 'summary',
                                                'summary_large_image' => 'summary_large_image',
                                            ])
                                            ->default('summary_large_image'),
                                        TextInput::make('twitter_url')
                                            ->label('Twitter URL (optional)'),
                                        TextInput::make('twitter_title')
                                            ->label('Twitter Title')
                                            ->maxLength(255),
                                        Textarea::make('twitter_description')
                                            ->label('Twitter Description')
                                            ->rows(2)
                                            ->maxLength(500),
                                        TextInput::make('twitter_image')
                                            ->label('Twitter Image URL'),
                                    ]),

                                Textarea::make('notes')
                                    ->label('Notes')
                                    ->rows(2)
                                    ->maxLength(300)
                                    ->helperText('Optional internal notes for this profile.'),
                            ])
                            ->collapsible()
                            ->cloneable()
                            ->reorderable()
                            ->defaultItems(0)
                            ->addActionLabel('Add SEO Profile')
                            ->helperText('Supported placeholders: {url}, {siteName}, {filterName}, {blogTitle}, {legalTitle}.'),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('site_name')
                    ->label('Site Name')
                    ->searchable(),

                ImageColumn::make('logo')
                    ->label('Logo')
                    ->circular()
                    ->defaultImageUrl(url('/images/placeholder-logo.png')),

                ImageColumn::make('authentication_page_image')
                    ->label('Authentication Page Image')
                    ->circular()
                    ->defaultImageUrl(url('/images/placeholder-logo.png')),

                ImageColumn::make('hero_image')
                    ->label('Hero Section Image')
                    ->circular()
                    ->defaultImageUrl(url('/images/placeholder-logo.png')),

                TextColumn::make('emails_count')
                    ->label('Emails')
                    ->getStateUsing(fn ($record) => count($record->emails ?? []))
                    ->badge(),

                TextColumn::make('phones_count')
                    ->label('Phones')
                    ->getStateUsing(fn ($record) => count($record->phones ?? []))
                    ->badge(),

                TextColumn::make('addresses_count')
                    ->label('Addresses')
                    ->getStateUsing(fn ($record) => count($record->addresses ?? []))
                    ->badge(),

                BooleanColumn::make('maintenance_mode')
                    ->label('Maintenance Mode'),

                TextColumn::make('updated_at')
                    ->label('Last Updated')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                //
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                // Remove bulk delete as we only want one settings record
            ])
            ->paginated(false); // Only one record expected
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListSettings::route('/'),
            'edit' => Pages\EditSetting::route('/{record}/edit'),
        ];
    }

    // Permission Methods
    public static function canViewAny(): bool
    {
        return auth()->user()->can('view_settings');
    }

    public static function canCreate(): bool
    {
        // Prevent creating new settings - we only want one record
        return false;
    }

    public static function canEdit($record): bool
    {
        return auth()->user()->can('edit_settings');
    }

    public static function canDelete($record): bool
    {
        // Prevent deleting settings
        return false;
    }

    public static function canDeleteAny(): bool
    {
        return false;
    }

    // Custom navigation badge to show maintenance status
    public static function getNavigationBadge(): ?string
    {
        $settings = Setting::getInstance();
        return $settings->maintenance_mode ? 'Maintenance' : null;
    }

    public static function getNavigationBadgeColor(): ?string
    {
        $settings = Setting::getInstance();
        return $settings->maintenance_mode ? 'danger' : null;
    }
}
