<?php

namespace App\Filament\Resources;

use App\Filament\Resources\LibraryResource\Pages;
use App\Models\Library;
use App\Models\Category;
use App\Models\Platform;
use App\Models\Industry;
use App\Models\Interaction;
use App\Services\ApiImportService;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Notifications\Notification;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Response;

class LibraryResource extends Resource
{
    protected static ?string $model = Library::class;
    protected static ?string $navigationIcon = 'heroicon-o-film';
    protected static ?string $navigationGroup = 'Library Management';
    protected static ?int $navigationSort = 1;

    public static function getNavigationBadge(): ?string
    {
        return static::getModel()::count();
    }

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
                            ->afterStateUpdated(function (string $context, $state, Forms\Set $set) {
                                if ($context === 'create') {
                                    $set('slug', Str::slug($state));
                                }
                            }),

                        Forms\Components\TextInput::make('slug')
                            ->required()
                            ->maxLength(255)
                            ->unique(Library::class, 'slug', ignoreRecord: true),

                        Forms\Components\DatePicker::make('published_date')
                            ->label('Published Date')
                            ->displayFormat('Y-m-d')
                            ->native(false),

                        Forms\Components\TextInput::make('url')
                            ->url()
                            ->maxLength(500),

                        Forms\Components\TextInput::make('video_url')
                            ->required()
                            ->url()
                            ->maxLength(500)
                            ->helperText('Main video URL where the video is stored'),

                        Forms\Components\Textarea::make('description')
                            ->maxLength(1500)
                            ->rows(3),

                        Forms\Components\FileUpload::make('logo')
                            ->image()
                            ->directory('library-logos'),

                        Forms\Components\TextInput::make('video_alt_text')
                      		->label('Video Alt Text')
                            ->maxLength(255),

                        Forms\Components\Toggle::make('is_active')
                            ->default(true),
                    ])->columns(2),

                Forms\Components\Section::make('Relationships')
                    ->schema([
                        Forms\Components\Select::make('categories')
                            ->relationship('categories', 'name')
                            ->multiple()
                            ->preload()
                            ->createOptionForm([
                                Forms\Components\TextInput::make('name')
                                    ->required()
                                    ->maxLength(255),
                                Forms\Components\FileUpload::make('image')
                                    ->image()
                                    ->directory('category-images'),
                            ]),

                        Forms\Components\Select::make('platforms')
                            ->relationship('platforms', 'name')
                            ->multiple()
                            ->preload()
                            ->createOptionForm([
                                Forms\Components\TextInput::make('name')
                                    ->required()
                                    ->maxLength(255),
                            ]),

                        Forms\Components\Select::make('industries')
                            ->relationship('industries', 'name')
                            ->multiple()
                            ->preload()
                            ->createOptionForm([
                                Forms\Components\TextInput::make('name')
                                    ->required()
                                    ->maxLength(255),
                            ]),

                        Forms\Components\Select::make('interactions')
                            ->relationship('interactions', 'name')
                            ->multiple()
                            ->preload()
                            ->createOptionForm([
                                Forms\Components\TextInput::make('name')
                                    ->required()
                                    ->maxLength(255),
                            ]),
                    ])->columns(2),

                Forms\Components\Section::make('SEO Optimization')
                    ->schema([
                        Forms\Components\Grid::make(3)
                            ->schema([
                                Forms\Components\TextInput::make('seo_title')
                                    ->maxLength(70)
                                    ->live(onBlur: true)
                                    ->helperText('Recommended: 30-60 characters')
                                    ->suffixAction(
                                        Forms\Components\Actions\Action::make('generate_title')
                                            ->icon('heroicon-o-sparkles')
                                            ->action(function ($state, Forms\Set $set, Forms\Get $get) {
                                                $title = $get('title');
                                                $keyword = $get('focus_keyword');
                                                if ($keyword && stripos($title, $keyword) === false) {
                                                    $set('seo_title', $keyword . ' - ' . $title);
                                                } else {
                                                    $set('seo_title', $title);
                                                }
                                            })
                                    ),

                                Forms\Components\TextInput::make('focus_keyword')
                                    ->maxLength(100)
                                    ->live(onBlur: true)
                                    ->helperText('Primary keyword for SEO optimization'),

                                Forms\Components\Placeholder::make('seo_analysis')
                                    ->content(function ($record) {
                                        if (!$record) return 'Save record to see SEO analysis';

                                        $analysis = $record->performSeoAnalysis();
                                        $score = $analysis['score'];
                                        $grade = $analysis['grade'];

                                        return "Score: {$score}/100 (Grade: {$grade})";
                                    })
                                    ->extraAttributes(['class' => 'font-bold']),
                            ]),

                        Forms\Components\Group::make([
                            Forms\Components\Textarea::make('meta_description')
                                ->maxLength(160)
                                ->rows(3)
                                ->live(onBlur: true)
                                ->helperText('Recommended: 120-160 characters'),

                            Forms\Components\Actions::make([
                                Forms\Components\Actions\Action::make('generate_meta')
                                    ->label('Generate Meta Description')
                                    ->icon('heroicon-o-sparkles')
                                    ->color('primary')
                                    ->action(function ($state, Forms\Set $set, Forms\Get $get) {
                                        $description = $get('description');
                                        $keyword = $get('focus_keyword');

                                        if (empty($description)) {
                                            $generated = "Discover {$get('title')}" . ($keyword ? " - {$keyword}" : '') . ". Watch engaging video content.";
                                        } else {
                                            $excerpt = Str::limit(strip_tags($description), 140);
                                            $generated = $keyword && stripos($excerpt, $keyword) === false ? $keyword . ' - ' . $excerpt : $excerpt;
                                        }

                                        $set('meta_description', $generated);
                                    })
                            ])->alignEnd()
                        ]),

                        Forms\Components\TagsInput::make('keywords')
                            ->helperText('Additional keywords for SEO')
                            ->default([])
                            ->dehydrated()
                            ->columnSpanFull(),

                        Forms\Components\Grid::make(2)
                            ->schema([
                                Forms\Components\TextInput::make('canonical_url')
                                    ->url()
                                    ->maxLength(500),

                                Forms\Components\Select::make('schema_type')
                                    ->options([
                                        'VideoObject' => 'Video Object',
                                        'Article' => 'Article',
                                        'WebPage' => 'Web Page',
                                        'Product' => 'Product',
                                    ])
                                    ->default('VideoObject'),
                            ]),

                        Forms\Components\Section::make('Open Graph')
                            ->schema([
                                Forms\Components\Grid::make(2)
                                    ->schema([
                                        Forms\Components\TextInput::make('og_title')
                                            ->maxLength(70)
                                            ->helperText('Open Graph title'),

                                        Forms\Components\Select::make('og_type')
                                            ->options([
                                                'article' => 'Article',
                                                'video' => 'Video',
                                                'website' => 'Website',
                                            ])
                                            ->default('article'),
                                    ]),

                                Forms\Components\Group::make([
                                    Forms\Components\Textarea::make('og_description')
                                        ->maxLength(160)
                                        ->rows(3)
                                        ->helperText('Open Graph description'),
                                ]),

                                Forms\Components\FileUpload::make('og_image')
                                    ->image()
                                    ->directory('og-images')
                                    ->helperText('Recommended: 1200x630 pixels'),
                            ])
                            ->collapsible()
                            ->collapsed(),

                        Forms\Components\Section::make('Technical SEO')
                            ->schema([
                                Forms\Components\Grid::make(2)
                                    ->schema([
                                        Forms\Components\Toggle::make('index_follow')
                                            ->default(true)
                                            ->helperText('Allow search engines to index this page'),

                                        Forms\Components\Select::make('robots_meta')
                                            ->options([
                                                'index,follow' => 'Index, Follow',
                                                'noindex,follow' => 'No Index, Follow',
                                                'index,nofollow' => 'Index, No Follow',
                                                'noindex,nofollow' => 'No Index, No Follow',
                                            ])
                                            ->default('index,follow'),
                                    ]),

                                    // Replace the existing structured_data field in your LibraryResource.php
                                    // Inside the "Technical SEO" section

                                    Forms\Components\Group::make([
                                        Forms\Components\Textarea::make('structured_data')
                                            ->rows(6)
                                            ->helperText('JSON-LD structured data')
                                            ->formatStateUsing(function ($state) {
                                                if (is_array($state)) {
                                                    return json_encode($state, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
                                                }
                                                if (is_string($state)) {
                                                    // If it's already a string, try to prettify it
                                                    $decoded = json_decode($state, true);
                                                    if (json_last_error() === JSON_ERROR_NONE) {
                                                        return json_encode($decoded, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
                                                    }
                                                    return $state;
                                                }
                                                return '';
                                            })
                                            ->dehydrateStateUsing(function ($state) {
                                                if (empty($state)) {
                                                    return null;
                                                }
                                                if (is_string($state)) {
                                                    $decoded = json_decode($state, true);
                                                    if (json_last_error() === JSON_ERROR_NONE) {
                                                        return $decoded;
                                                    }
                                                }
                                                return $state;
                                            }),

                                        Forms\Components\Actions::make([
                                            Forms\Components\Actions\Action::make('generate_schema')
                                                ->label('Generate Schema')
                                                ->icon('heroicon-o-sparkles')
                                                ->color('primary')
                                                ->action(function ($state, Forms\Set $set, Forms\Get $get) {
                                                    $schema = [
                                                        '@context' => 'https://schema.org',
                                                        '@type' => $get('schema_type') ?: 'VideoObject',
                                                        'name' => $get('title'),
                                                        'description' => $get('description') ?: '',
                                                        'contentUrl' => $get('video_url'),
                                                        'keywords' => implode(', ', $get('keywords') ?: []),
                                                    ];

                                                    $set('structured_data', json_encode($schema, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
                                                })
                                        ])->alignEnd()
                                    ]),
                            ])
                            ->collapsible()
                            ->collapsed(),

                        Forms\Components\Section::make('SEO Recommendations')
                            ->schema([
                                Forms\Components\Placeholder::make('recommendations')
                                    ->content(function ($record) {
                                        if (!$record) return 'Save record to see recommendations';

                                        $recommendations = $record->seo_recommendations ?? [];
                                        if (empty($recommendations)) {
                                            return 'No recommendations available';
                                        }

                                        $html = '<ul class="space-y-2">';
                                        foreach ($recommendations as $rec) {
                                            $color = match($rec['type']) {
                                                'error' => 'text-red-600',
                                                'warning' => 'text-yellow-600',
                                                'info' => 'text-blue-600',
                                                default => 'text-gray-600'
                                            };
                                            $html .= "<li class=\"{$color}\">{$rec['message']}</li>";
                                        }
                                        $html .= '</ul>';

                                        return new \Illuminate\Support\HtmlString($html);
                                    })
                            ])
                            ->collapsible()
                            ->collapsed(),
                    ])
                    ->columns(1),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('title')
                    ->searchable()
                    ->sortable()
                    ->limit(50),

                Tables\Columns\ImageColumn::make('logo')
                    ->circular()
                    ->size(40),

                Tables\Columns\TextColumn::make('published_date')
                    ->date('Y-m-d')
                    ->sortable()
                    ->searchable(),

                Tables\Columns\TextColumn::make('categories.name')
                    ->badge()
                    ->separator(','),

                Tables\Columns\TextColumn::make('platforms.name')
                    ->badge()
                    ->separator(','),

                Tables\Columns\TextColumn::make('industries.name')
                    ->badge()
                    ->separator(','),
                Tables\Columns\TextColumn::make('interactions.name')
                    ->badge()
                    ->separator(','),

                Tables\Columns\TextColumn::make('views_count')
                    ->label('Views')
                    ->counts('views')
                    ->sortable()
                    ->badge()
                    ->color('info')
                    ->icon('heroicon-o-eye'),

                Tables\Columns\TextColumn::make('seo_score')
                    ->badge()
                    ->color(fn (string $state): string => match (true) {
                        $state >= 80 => 'success',
                        $state >= 60 => 'warning',
                        default => 'danger',
                    })
                    ->formatStateUsing(fn (string $state): string => $state . '/100')
                    ->sortable(),

                Tables\Columns\TextColumn::make('source')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'api' => 'info',
                        'manual' => 'success',
                        default => 'gray',
                    }),

                Tables\Columns\IconColumn::make('is_active')
                    ->boolean(),

                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('categories')
                    ->relationship('categories', 'name')
                    ->multiple(),

                Tables\Filters\SelectFilter::make('source')
                    ->options([
                        'api' => 'API Import',
                        'manual' => 'Manual Entry',
                    ]),

                Tables\Filters\TernaryFilter::make('is_active'),

                Tables\Filters\Filter::make('published_date')
                    ->form([
                        Forms\Components\DatePicker::make('published_from')
                            ->label('Published From')
                            ->native(false),
                        Forms\Components\DatePicker::make('published_until')
                            ->label('Published Until')
                            ->native(false),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when(
                                $data['published_from'],
                                fn (Builder $query, $date): Builder => $query->whereDate('published_date', '>=', $date),
                            )
                            ->when(
                                $data['published_until'],
                                fn (Builder $query, $date): Builder => $query->whereDate('published_date', '<=', $date),
                            );
                    }),
            ])
            ->actions([
                Tables\Actions\Action::make('view_video')
                    ->icon('heroicon-o-play')
                    ->color('info')
                    ->url(fn (Library $record): string => $record->video_url)
                    ->openUrlInNewTab(),

                Tables\Actions\Action::make('refresh_seo')
                    ->icon('heroicon-o-arrow-path')
                    ->color('warning')
                    ->action(function (Library $record) {
                        $record->updateSeoScore();
                        Notification::make()
                            ->title('SEO Score Updated')
                            ->success()
                            ->send();
                    }),

                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
// Add this to your LibraryResource headerActions() method
// Replace the existing headerActions with this updated version

->headerActions([
    // Download Template Actions
    Tables\Actions\Action::make('download_csv_template')
        ->label('Download CSV Template')
        ->icon('heroicon-o-document-arrow-down')
        ->color('gray')
        ->action(function () {
            $csv = \App\Services\FileImportService::generateCsvTemplate();
            return response()->streamDownload(function() use ($csv) {
                echo $csv;
            }, 'library_import_template.csv', [
                'Content-Type' => 'text/csv',
            ]);
        }),

    Tables\Actions\Action::make('download_json_template')
        ->label('Download JSON Template')
        ->icon('heroicon-o-document-arrow-down')
        ->color('gray')
        ->action(function () {
            $json = \App\Services\FileImportService::generateJsonTemplate();
            return response()->streamDownload(function() use ($json) {
                echo $json;
            }, 'library_import_template.json', [
                'Content-Type' => 'application/json',
            ]);
        }),

    // Import from File (CSV/JSON)
    Tables\Actions\Action::make('import_from_file')
        ->label('Import from File')
        ->icon('heroicon-o-arrow-up-tray')
        ->color('info')
        ->form([
            Forms\Components\FileUpload::make('import_file')
                ->label('Upload CSV or JSON File')
                ->acceptedFileTypes(['text/csv', 'application/json', 'text/json'])
                ->maxSize(20480)
                ->required()
                ->helperText('Upload a CSV or JSON file containing library data. Download a template to see the required format.'),
        ])
        ->action(function (array $data) {
            try {
                $file = $data['import_file'];

                if (!$file) {
                    throw new \Exception('No file uploaded');
                }

                // Get the uploaded file from storage
                $uploadedFile = new \Illuminate\Http\UploadedFile(
                    storage_path('app/public/' . $file),
                    basename($file)
                );

                $fileImportService = new \App\Services\FileImportService(
                    new \App\Services\ApiImportService()
                );

                $stats = $fileImportService->importFromFile($uploadedFile);

                // Clean up uploaded file
                \Illuminate\Support\Facades\Storage::disk('public')->delete($file);

                // Build notification message
                $message = "Total: {$stats['total']}, Imported: {$stats['imported']}, Updated: {$stats['updated']}, Skipped: {$stats['skipped']}";

                // Check if there are errors
                if (!empty($stats['errors'])) {
                    $errorCount = count($stats['errors']);

                    // Generate failed items report file
                    $filename = 'failed_file_imports_' . now()->format('Y-m-d_H-i-s') . '.csv';
                    $filepath = storage_path('app/public/' . $filename);

                    $reportFile = fopen($filepath, 'w');
                    fputcsv($reportFile, ['Row', 'ID', 'Title', 'Error']);

                    foreach ($stats['errors'] as $error) {
                        fputcsv($reportFile, [
                            $error['row'] ?? 'N/A',
                            $error['id'] ?? 'N/A',
                            $error['title'] ?? 'N/A',
                            $error['error'] ?? 'Unknown error'
                        ]);
                    }
                    fclose($reportFile);

                    $message .= "\n\nFailed items report saved: storage/app/public/{$filename}";

                    // Show first 3 errors in notification
                    $errorPreview = array_slice($stats['errors'], 0, 3);
                    $message .= "\n\nFirst errors:";
                    foreach ($errorPreview as $err) {
                        $message .= "\n- Row {$err['row']}: {$err['title']}";
                    }

                    if ($errorCount > 3) {
                        $message .= "\n... and " . ($errorCount - 3) . " more (check the report file)";
                    }

                    Notification::make()
                        ->title('Import Completed with Errors')
                        ->body($message)
                        ->warning()
                        ->duration(15000)
                        ->send();
                } else {
                    Notification::make()
                        ->title('Import Completed Successfully')
                        ->body($message)
                        ->success()
                        ->send();
                }

            } catch (\Exception $e) {
                Notification::make()
                    ->title('Import Failed')
                    ->body($e->getMessage())
                    ->danger()
                    ->send();
            }
        })
        ->modalHeading('Import Libraries from File')
        ->modalDescription('Upload a CSV or JSON file to import library data. Download the template first to see the required format.')
        ->modalSubmitActionLabel('Import')
        ->modalWidth('lg'),

    // Export CSV by Date (existing)
    Tables\Actions\Action::make('export_csv_by_date')
        ->label('Export CSV by Date')
        ->icon('heroicon-o-arrow-down-tray')
        ->color('success')
        ->form([
            Forms\Components\DatePicker::make('start_date')
                ->label('Start Date')
                ->required()
                ->native(false),
            Forms\Components\DatePicker::make('end_date')
                ->label('End Date')
                ->required()
                ->native(false)
                ->afterOrEqual('start_date'),
        ])
        ->action(function (array $data) {
            return static::exportLibrariesByDateRange($data['start_date'], $data['end_date']);
        })
        ->modalHeading('Export Libraries to CSV')
        ->modalDescription('Select the date range to export libraries published within that period as CSV.')
        ->modalSubmitActionLabel('Export CSV'),

    // Export JSON by Date (existing)
    Tables\Actions\Action::make('export_json_by_date')
        ->label('Export JSON by Date')
        ->icon('heroicon-o-document-arrow-down')
        ->color('info')
        ->form([
            Forms\Components\DatePicker::make('start_date')
                ->label('Start Date')
                ->required()
                ->native(false),
            Forms\Components\DatePicker::make('end_date')
                ->label('End Date')
                ->required()
                ->native(false)
                ->afterOrEqual('start_date'),
        ])
        ->action(function (array $data) {
            return static::exportLibrariesAsJson($data['start_date'], $data['end_date']);
        })
        ->modalHeading('Export Libraries to JSON')
        ->modalDescription('Select the date range to export libraries published within that period as JSON.')
        ->modalSubmitActionLabel('Export JSON'),

    // Import from API (existing)
    Tables\Actions\Action::make('import_from_api')
        ->label('Import from API')
        ->icon('heroicon-o-cloud-arrow-down')
        ->color('success')
        ->action(function () {
            try {
                $importService = new ApiImportService();
                $stats = $importService->importFromApi();

                // Build notification message
                $message = "Imported: {$stats['imported']}, Updated: {$stats['updated']}, Total: {$stats['total']}";

                // Check if there are errors
                if (!empty($stats['errors'])) {
                    $errorCount = count($stats['errors']);
                    $message .= "\n\nFailed: {$errorCount}";

                    // Generate failed items report file
                    $filename = 'failed_imports_' . now()->format('Y-m-d_H-i-s') . '.csv';
                    $filepath = storage_path('app/public/' . $filename);

                    $file = fopen($filepath, 'w');
                    fputcsv($file, ['ID', 'Title', 'Error']);

                    foreach ($stats['errors'] as $error) {
                        fputcsv($file, [
                            $error['id'] ?? 'N/A',
                            $error['title'] ?? 'N/A',
                            $error['error'] ?? 'Unknown error'
                        ]);
                    }
                    fclose($file);

                    $message .= "\n\nFailed items report saved: storage/app/public/{$filename}";

                    // Show first 3 errors in notification
                    $errorPreview = array_slice($stats['errors'], 0, 3);
                    $message .= "\n\nFirst errors:";
                    foreach ($errorPreview as $err) {
                        $message .= "\n- ID: {$err['id']}, Title: {$err['title']}";
                    }

                    if ($errorCount > 3) {
                        $message .= "\n... and " . ($errorCount - 3) . " more (check the report file)";
                    }

                    Notification::make()
                        ->title('Import Completed with Errors')
                        ->body($message)
                        ->warning()
                        ->duration(15000)
                        ->send();
                } else {
                    Notification::make()
                        ->title('Import Completed Successfully')
                        ->body($message)
                        ->success()
                        ->send();
                }

            } catch (\Exception $e) {
                Notification::make()
                    ->title('Import Failed')
                    ->body($e->getMessage())
                    ->danger()
                    ->send();
            }
        })
        ->requiresConfirmation()
        ->modalHeading('Import Libraries from API')
        ->modalDescription('This will import all libraries from the external API. Existing libraries will be updated.')
        ->modalSubmitActionLabel('Import'),
])
            ->bulkActions([
                Tables\Actions\BulkAction::make('bulk_assign_platforms')
                    ->label('Assign Platforms')
                    ->icon('heroicon-o-squares-2x2')
                    ->color('primary')
                    ->form([
                        Forms\Components\Select::make('platforms')
                            ->label('Select Platforms')
                            ->options(Platform::pluck('name', 'id'))
                            ->multiple()
                            ->required()
                            ->preload()
                            ->searchable()
                            ->helperText('Select one or more platforms to assign to the selected libraries.'),

                        Forms\Components\Radio::make('action_type')
                            ->label('Action Type')
                            ->options([
                                'add' => 'Add to existing platforms',
                                'replace' => 'Replace existing platforms',
                            ])
                            ->default('add')
                            ->required()
                            ->helperText('Choose whether to add these platforms to existing ones or replace them entirely.'),
                    ])
                    ->action(function ($records, array $data) {
                        $platformIds = $data['platforms'];
                        $actionType = $data['action_type'];
                        $count = 0;

                        foreach ($records as $record) {
                            if ($actionType === 'replace') {
                                // Replace: Sync will remove old platforms and add new ones
                                $record->platforms()->sync($platformIds);
                            } else {
                                // Add: Attach will add new platforms without removing existing ones
                                $record->platforms()->syncWithoutDetaching($platformIds);
                            }
                            $count++;
                        }

                        $platformNames = Platform::whereIn('id', $platformIds)->pluck('name')->implode(', ');
                        $action = $actionType === 'replace' ? 'replaced with' : 'added to';

                        Notification::make()
                            ->title('Platforms Assigned Successfully')
                            ->body("{$count} libraries have been {$action}: {$platformNames}")
                            ->success()
                            ->send();
                    })
                    ->deselectRecordsAfterCompletion()
                    ->modalHeading('Bulk Assign Platforms')
                    ->modalDescription('Assign platforms to multiple libraries at once.')
                    ->modalSubmitActionLabel('Assign Platforms'),

                Tables\Actions\BulkAction::make('bulk_assign_category')
                    ->label('Assign Category')
                    ->icon('heroicon-o-squares-2x2')
                    ->color('primary')
                    ->form([
                        Forms\Components\Select::make('categories')
                            ->label('Select Categories')
                            ->options(Category::pluck('name', 'id'))
                            ->multiple()
                            ->required()
                            ->preload()
                            ->searchable()
                            ->helperText('Select one or more categories to assign to the selected libraries.'),

                        Forms\Components\Radio::make('action_type')
                            ->label('Action Type')
                            ->options([
                                'add' => 'Add to existing category',
                                'replace' => 'Replace existing category',
                            ])
                            ->default('add')
                            ->required()
                            ->helperText('Choose whether to add these category to existing ones or replace them entirely.'),
                    ])
                    ->action(function ($records, array $data) {
                        $categoryIds = $data['categories'];
                        $actionType = $data['action_type'];
                        $count = 0;

                        foreach ($records as $record) {
                            if ($actionType === 'replace') {
                                // Replace: Sync will remove old platforms and add new ones
                                $record->categories()->sync($categoryIds);
                            } else {
                                // Add: Attach will add new platforms without removing existing ones
                                $record->categories()->syncWithoutDetaching($categoryIds);
                            }
                            $count++;
                        }

                        $categoryNames = Category::whereIn('id', $categoryIds)->pluck('name')->implode(', ');
                        $action = $actionType === 'replace' ? 'replaced with' : 'added to';

                        Notification::make()
                            ->title('Categories Assigned Successfully')
                            ->body("{$count} libraries have been {$action}: {$categoryNames}")
                            ->success()
                            ->send();
                    })
                    ->deselectRecordsAfterCompletion()
                    ->modalHeading('Bulk Assign Categories')
                    ->modalDescription('Assign categories to multiple libraries at once.')
                    ->modalSubmitActionLabel('Assign Categories'),

                Tables\Actions\BulkAction::make('bulk_assign_interaction')
                    ->label('Assign Interaction')
                    ->icon('heroicon-o-squares-2x2')
                    ->color('primary')
                    ->form([
                        Forms\Components\Select::make('interactions')
                            ->label('Select Interactions')
                            ->options(Interaction::pluck('name', 'id'))
                            ->multiple()
                            ->required()
                            ->preload()
                            ->searchable()
                            ->helperText('Select one or more interactions to assign to the selected libraries.'),

                        Forms\Components\Radio::make('action_type')
                            ->label('Action Type')
                            ->options([
                                'add' => 'Add to existing interaction',
                                'replace' => 'Replace existing interaction',
                            ])
                            ->default('add')
                            ->required()
                            ->helperText('Choose whether to add these interaction to existing ones or replace them entirely.'),
                    ])
                    ->action(function ($records, array $data) {
                        $interactionIds = $data['interactions'];
                        $actionType = $data['action_type'];
                        $count = 0;

                        foreach ($records as $record) {
                            if ($actionType === 'replace') {
                                // Replace: Sync will remove old platforms and add new ones
                                $record->interactions()->sync($interactionIds);
                            } else {
                                // Add: Attach will add new platforms without removing existing ones
                                $record->interactions()->syncWithoutDetaching($interactionIds);
                            }
                            $count++;
                        }

                        $interactionNames = Interaction::whereIn('id', $interactionIds)->pluck('name')->implode(', ');
                        $action = $actionType === 'replace' ? 'replaced with' : 'added to';

                        Notification::make()
                            ->title('Interactions Assigned Successfully')
                            ->body("{$count} libraries have been {$action}: {$interactionNames}")
                            ->success()
                            ->send();
                    })
                    ->deselectRecordsAfterCompletion()
                    ->modalHeading('Bulk Assign Interactions')
                    ->modalDescription('Assign interactions to multiple libraries at once.')
                    ->modalSubmitActionLabel('Assign Interactions'),

                Tables\Actions\BulkAction::make('update_seo_scores')
                    ->label('Update SEO Scores')
                    ->icon('heroicon-o-arrow-path')
                    ->color('warning')
                    ->action(function ($records) {
                        foreach ($records as $record) {
                            $record->updateSeoScore();
                        }
                        Notification::make()
                            ->title('SEO Scores Updated')
                            ->success()
                            ->send();
                    }),

                Tables\Actions\DeleteBulkAction::make(),
            ])
            ->defaultSort('created_at', 'desc');
    }

public static function exportLibrariesByDateRange($startDate, $endDate)
    {
        try {
            $libraries = Library::with(['categories', 'platforms', 'industries', 'interactions'])
                ->whereDate('published_date', '>=', $startDate)
                ->whereDate('published_date', '<=', $endDate)
                ->orderBy('published_date', 'desc')
                ->get();

            if ($libraries->isEmpty()) {
                Notification::make()
                    ->title('No Data Found')
                    ->body('No libraries found within the selected date range.')
                    ->warning()
                    ->send();
                return null;
            }

            $filename = 'libraries_' . $startDate . '_to_' . $endDate . '.csv';

            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            ];

            $callback = function() use ($libraries) {
                $file = fopen('php://output', 'w');

                // Add CSV headers matching API format
                fputcsv($file, [
                    'id',
                    'published_date',
                    'title',
                    'url',
                    'video_url',
                    'product',
                    'product_logo',
                    'product_link', // NEW: Added product_link
                    'platform',
                    'industry',
                    'interaction',
                    'logo'
                ]);

                // Add data rows
                foreach ($libraries as $library) {
                    // Get first category (product)
                    $firstCategory = $library->categories->first();

                    // Get first platform
                    $firstPlatform = $library->platforms->first();

                    // Get first industry
                    $firstIndustry = $library->industries->first();

                    // Get all interactions as comma-separated string
                    $interactions = $library->interactions->pluck('name')->implode(', ');

                    fputcsv($file, [
                        $library->external_id,
                        $library->published_date?->format('Y-m-d'),
                        $library->title,
                        $library->url,
                        $library->video_url,
                        $firstCategory?->name ?? '',
                        $firstCategory?->image ?? '',
                        $firstCategory?->product_url ?? '', // NEW: Export product_url as product_link
                        $firstPlatform?->name ?? '',
                        $firstIndustry?->name ?? '',
                        $interactions,
                        $library->logo
                    ]);
                }

                fclose($file);
            };

            return response()->stream($callback, 200, $headers);
        } catch (\Exception $e) {
            Notification::make()
                ->title('Export Failed')
                ->body($e->getMessage())
                ->danger()
                ->send();
            return null;
        }
    }



public static function exportLibrariesAsJson($startDate, $endDate)
{
    try {
        $libraries = Library::with(['categories', 'platforms', 'industries', 'interactions'])
            ->whereDate('published_date', '>=', $startDate)
            ->whereDate('published_date', '<=', $endDate)
            ->orderBy('published_date', 'desc')
            ->get();

        if ($libraries->isEmpty()) {
            Notification::make()
                ->title('No Data Found')
                ->body('No libraries found within the selected date range.')
                ->warning()
                ->send();
            return null;
        }

        // Transform libraries to match API format
        $animations = $libraries->map(function ($library) {
            // Get first category (product)
            $firstCategory = $library->categories->first();

            // Get first platform
            $firstPlatform = $library->platforms->first();

            // Get first industry
            $firstIndustry = $library->industries->first();

            // Get all interactions as array
            $interactions = $library->interactions->pluck('name')->toArray();

            return [
                'id' => $library->external_id,
                'published_date' => $library->published_date?->format('Y-m-d'),
                'title' => $library->title,
                'slug' => $library->slug,
                'url' => $library->url,
                'video_url' => $library->video_url,

                'product' => $firstCategory?->name ?? '',
                'product_logo' => $firstCategory?->image ?? '',
                'product_link' => $firstCategory?->product_url ?? '',

                'platform' => $firstPlatform?->name ?? '',
                'industry' => $firstIndustry?->name ?? '',
                'interaction' => $interactions,

                'description' => $library->description,
                'keywords' => $library->keywords,
                'focus_keyword' => $library->focus_keyword,

                'logo' => $library->logo,
                'video_alt_text' => $library->video_alt_text,

                'meta_description' => $library->meta_description,
                'seo_title' => $library->seo_title,

                'og_title' => $library->og_title,
                'og_description' => $library->og_description,
                'og_image' => $library->og_image,
                'og_type' => $library->og_type,

                'structured_data' => $library->structured_data,
            ];
        });

        $jsonData = [
            'animations' => $animations
        ];

        $filename = 'libraries_' . $startDate . '_to_' . $endDate . '.json';

        $json = json_encode(
            $jsonData,
            JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
        );

        return response()->streamDownload(function () use ($json) {
            echo $json;
        }, $filename, [
            'Content-Type' => 'application/json',
        ]);
    } catch (\Exception $e) {
        Notification::make()
            ->title('Export Failed')
            ->body($e->getMessage())
            ->danger()
            ->send();
        return null;
    }
}



    public static function getPages(): array
    {
        return [
            'index' => Pages\ListLibraries::route('/'),
            'create' => Pages\CreateLibrary::route('/create'),
            'edit' => Pages\EditLibrary::route('/{record}/edit'),
        ];
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->withCount('views') // NEW: Added to load view counts
            ->with(['categories', 'platforms', 'industries', 'interactions']);
    }

    // Permission methods
    public static function canViewAny(): bool
    {
        return auth()->user()->can('view_libraries');
    }

    public static function canCreate(): bool
    {
        return auth()->user()->can('create_libraries');
    }

    public static function canEdit($record): bool
    {
        return auth()->user()->can('edit_libraries');
    }

    public static function canDelete($record): bool
    {
        return auth()->user()->can('delete_libraries');
    }
}
