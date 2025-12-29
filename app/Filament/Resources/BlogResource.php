<?php

namespace App\Filament\Resources;

use App\Filament\Resources\BlogResource\Pages;
use App\Models\Blog;
use App\Models\BlogCategory;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Str;

class BlogResource extends Resource
{
    protected static ?string $model = Blog::class;

    protected static ?string $navigationIcon = 'heroicon-o-document-text';

    protected static ?string $navigationGroup = 'Blog Management';

    protected static ?int $navigationSort = 2;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Basic Information')
                    ->schema([
                        Forms\Components\TextInput::make('title')
                            ->required()
                            ->maxLength(255)
                            ->live(onBlur: true)
                            ->afterStateUpdated(function (string $operation, $state, Forms\Set $set) {
                                if ($operation !== 'create') {
                                    return;
                                }
                                $set('slug', Str::slug($state));
                            })
                            ->placeholder('Enter blog title')
                            ->columnSpanFull(),

                        Forms\Components\TextInput::make('slug')
                            ->required()
                            ->maxLength(255)
                            ->unique(ignoreRecord: true)
                            ->placeholder('auto-generated-slug')
                            ->helperText('Leave empty to auto-generate from title')
                            ->columnSpanFull(),

                        Forms\Components\Select::make('blog_category_id')
                            ->label('Category')
                            ->relationship('category', 'name', function ($query) {
                                return $query->where('is_active', true);
                            })
                            ->searchable()
                            ->preload()
                            ->createOptionForm([
                                Forms\Components\TextInput::make('name')
                                    ->required()
                                    ->maxLength(255)
                                    ->live(onBlur: true)
                                    ->afterStateUpdated(fn (string $state, Forms\Set $set) =>
                                        $set('slug', Str::slug($state))
                                    ),
                                Forms\Components\TextInput::make('slug')
                                    ->required()
                                    ->maxLength(255),
                                Forms\Components\Textarea::make('description')
                                    ->rows(2)
                                    ->maxLength(500),
                                Forms\Components\Toggle::make('is_active')
                                    ->default(true),
                            ])
                            ->createOptionModalHeading('Create New Category')
                            ->helperText('Select a category or create a new one')
                            ->nullable(),

                        Forms\Components\DatePicker::make('published_date')
                            ->default(now())
                            ->required()
                            ->native(false)
                            ->displayFormat('M d, Y')
                            ->helperText('When should this blog be published?'),

                        Forms\Components\TextInput::make('author')
                            ->maxLength(255)
                            ->default(function () {
                                try {
                                    return auth()->user()?->name ?? 'Admin';
                                } catch (\Exception $e) {
                                    return 'Admin';
                                }
                            })
                            ->placeholder('Author name'),

                        Forms\Components\Textarea::make('author_details')
                            ->rows(3)
                            ->maxLength(1000)
                            ->placeholder('Author Details or Bio...')
                            ->columnSpanFull(),

                        Forms\Components\Toggle::make('is_published')
                            ->label('Published')
                            ->default(false)
                            ->helperText('Make this blog publicly visible'),

                        Forms\Components\Toggle::make('is_featured')
                            ->label('Featured')
                            ->default(false)
                            ->helperText('Show this blog in featured section'),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Author Social Links')
                    ->schema([
                        Forms\Components\Repeater::make('author_social_links')
                            ->label('Social Media Links')
                            ->schema([
                                Forms\Components\Select::make('platform')
                                    ->label('Platform')
                                    ->options([
                                        'facebook' => 'Facebook',
                                        'twitter' => 'Twitter / X',
                                        'instagram' => 'Instagram',
                                        'linkedin' => 'LinkedIn',
                                        'youtube' => 'YouTube',
                                        'github' => 'GitHub',
                                        'tiktok' => 'TikTok',
                                        'pinterest' => 'Pinterest',
                                        'website' => 'Personal Website',
                                        'other' => 'Other',
                                    ])
                                    ->required()
                                    ->searchable()
                                    ->native(false)
                                    ->columnSpan(1),

                                Forms\Components\TextInput::make('url')
                                    ->label('Profile URL')
                                    ->url()
                                    ->required()
                                    ->placeholder('https://...')
                                    ->columnSpan(2),
                            ])
                            ->columns(3)
                            ->defaultItems(0)
                            ->addActionLabel('Add Social Link')
                            ->reorderable()
                            ->collapsible()
                            ->itemLabel(fn (array $state): ?string => 
                                isset($state['platform']) 
                                    ? ucfirst($state['platform']) 
                                    : null
                            )
                            ->helperText('Add social media profiles for the author')
                            ->columnSpanFull(),
                    ])
                    ->collapsed(),

                Forms\Components\Section::make('Content')
                    ->schema([
                        Forms\Components\Textarea::make('excerpt')
                            ->rows(3)
                            ->maxLength(500)
                            ->placeholder('Brief summary of the blog post...')
                            ->helperText('This will be shown in blog listings')
                            ->columnSpanFull(),

                        Forms\Components\RichEditor::make('content')
                            ->required()
                            ->fileAttachmentsDirectory('blog-content-images')
                            ->toolbarButtons([
                                'attachFiles',
                                'blockquote',
                                'bold',
                                'bulletList',
                                'codeBlock',
                                'h1',
                                'h2',
                                'h3',
                                'italic',
                                'link',
                                'orderedList',
                                'redo',
                                'strike',
                                'underline',
                                'undo',
                            ])
                            ->placeholder('Write your blog content here...')
                            ->helperText('Click the paperclip icon to attach images. Images will be automatically sized.')
                            ->columnSpanFull()
                            ->extraInputAttributes([
                                'style' => 'min-height: 400px;'
                            ]),
                    ]),

                Forms\Components\Section::make('Featured Images')
                    ->schema([
                        Forms\Components\FileUpload::make('featured_images')
                            ->label('Upload Images')
                            ->image()
                            ->multiple()
                            ->maxFiles(5)
                            ->directory('blog-images')
                            ->maxSize(5120)
                            ->imageEditor()
                            ->imageEditorAspectRatios([
                                '16:9',
                                '4:3',
                                '1:1',
                            ])
                            ->helperText('Upload up to 5 images (Max 5MB each)')
                            ->columnSpanFull()
                            ->reorderable()
                            ->visibility('public')
                            ->disk('public'),
                    ])
                    ->collapsed(),

                Forms\Components\Section::make('SEO Settings')
                    ->schema([
                        Forms\Components\TextInput::make('meta_title')
                            ->maxLength(60)
                            ->placeholder('Leave empty to use blog title')
                            ->helperText('Recommended: 50-60 characters'),

                        Forms\Components\Textarea::make('meta_description')
                            ->rows(2)
                            ->maxLength(160)
                            ->placeholder('Brief description for search engines')
                            ->helperText('Recommended: 120-160 characters')
                            ->columnSpanFull(),

                        Forms\Components\TextInput::make('meta_keywords')
                            ->maxLength(255)
                            ->placeholder('keyword1, keyword2, keyword3')
                            ->helperText('Comma-separated keywords'),

                        Forms\Components\Placeholder::make('views_count')
                            ->label('Total Views')
                            ->content(fn ($record): string => $record ? number_format($record->views_count) : '0')
                            ->visible(fn ($operation) => $operation === 'edit'),
                    ])
                    ->columns(2)
                    ->collapsed(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('title')
                    ->searchable()
                    ->sortable()
                    ->weight('bold')
                    ->wrap()
                    ->limit(50),

                Tables\Columns\TextColumn::make('category.name')
                    ->label('Category')
                    ->searchable()
                    ->sortable()
                    ->badge()
                    ->color('success')
                    ->default('Uncategorized'),

                Tables\Columns\TextColumn::make('author')
                    ->searchable()
                    ->toggleable(),

                Tables\Columns\IconColumn::make('is_published')
                    ->label('Published')
                    ->boolean()
                    ->sortable(),

                Tables\Columns\IconColumn::make('is_featured')
                    ->label('Featured')
                    ->boolean()
                    ->sortable()
                    ->toggleable(),

                Tables\Columns\TextColumn::make('views_count')
                    ->label('Views')
                    ->numeric()
                    ->sortable()
                    ->badge()
                    ->color('info')
                    ->toggleable(),

                Tables\Columns\TextColumn::make('published_date')
                    ->date('M d, Y')
                    ->sortable()
                    ->toggleable(),

                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('blog_category_id')
                    ->label('Category')
                    ->relationship('category', 'name')
                    ->searchable()
                    ->preload(),

                Tables\Filters\TernaryFilter::make('is_published')
                    ->label('Published Status')
                    ->placeholder('All posts')
                    ->trueLabel('Published only')
                    ->falseLabel('Drafts only'),

                Tables\Filters\TernaryFilter::make('is_featured')
                    ->label('Featured Status')
                    ->placeholder('All posts')
                    ->trueLabel('Featured only')
                    ->falseLabel('Non-featured only'),

                Tables\Filters\Filter::make('published_date')
                    ->form([
                        Forms\Components\DatePicker::make('published_from')
                            ->label('Published from'),
                        Forms\Components\DatePicker::make('published_until')
                            ->label('Published until'),
                    ])
                    ->query(function ($query, array $data) {
                        return $query
                            ->when(
                                $data['published_from'] ?? null,
                                fn ($query, $date) => $query->whereDate('published_date', '>=', $date),
                            )
                            ->when(
                                $data['published_until'] ?? null,
                                fn ($query, $date) => $query->whereDate('published_date', '<=', $date),
                            );
                    }),

                Tables\Filters\TrashedFilter::make(),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
                Tables\Actions\ForceDeleteAction::make(),
                Tables\Actions\RestoreAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                    Tables\Actions\ForceDeleteBulkAction::make(),
                    Tables\Actions\RestoreBulkAction::make(),
                ]),
            ])
            ->defaultSort('published_date', 'desc');
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListBlogs::route('/'),
            'create' => Pages\CreateBlog::route('/create'),
            'edit' => Pages\EditBlog::route('/{record}/edit'),
        ];
    }

    // Permission methods
    public static function canViewAny(): bool
    {
        try {
            return auth()->check() && auth()->user()->can('view_blogs');
        } catch (\Exception $e) {
            return false;
        }
    }

    public static function canCreate(): bool
    {
        try {
            return auth()->check() && auth()->user()->can('create_blogs');
        } catch (\Exception $e) {
            return false;
        }
    }

    public static function canEdit($record): bool
    {
        try {
            return auth()->check() && auth()->user()->can('edit_blogs');
        } catch (\Exception $e) {
            return false;
        }
    }

    public static function canDelete($record): bool
    {
        try {
            return auth()->check() && auth()->user()->can('delete_blogs');
        } catch (\Exception $e) {
            return false;
        }
    }

    public static function getNavigationBadge(): ?string
    {
        try {
            return static::getModel()::where('is_published', true)->count();
        } catch (\Exception $e) {
            return null;
        }
    }
}