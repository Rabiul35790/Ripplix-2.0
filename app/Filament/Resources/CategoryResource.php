<?php

namespace App\Filament\Resources;

use App\Filament\Resources\CategoryResource\Pages;
use App\Models\Category;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Collection;
use Filament\Actions\Action;
use Filament\Notifications\Notification;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Illuminate\Support\Facades\DB;

class CategoryResource extends Resource
{
    protected static ?string $model = Category::class;
    protected static ?string $navigationIcon = 'heroicon-o-folder';
    protected static ?string $navigationGroup = 'Library Management';
    protected static ?int $navigationSort = 2;

    public static function getNavigationBadge(): ?string
    {
        return static::getModel()::count();
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\TextInput::make('name')
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
                ->unique(Category::class, 'slug', ignoreRecord: true),

            Forms\Components\Textarea::make('description')
                ->maxLength(1500)
                ->rows(3),

            //Forms\Components\FileUpload::make('image')
            //   ->image()
            // ->directory('category-images'),

            Forms\Components\TextInput::make('product_url')
                ->label('Product URL')
                ->url()
                ->maxLength(255)
                ->placeholder('https://example.com/product')
                ->helperText('Optional URL for this category'),

            Forms\Components\TextInput::make('meta_title')
                ->maxLength(60),

            Forms\Components\Textarea::make('meta_description')
                ->maxLength(160)
                ->rows(3),

            Forms\Components\TextInput::make('focus_keyword')
                ->maxLength(60),

            Forms\Components\Select::make('schema_type')
                ->label('Schema Type')
                ->options([
                    'CollectionPage' => 'Collection Page',
                    'ItemList' => 'Item List',
                    'WebPage' => 'Web Page',
                    'Thing' => 'Thing',
                ])
                ->default('CollectionPage'),

            Forms\Components\Textarea::make('structured_data')
                ->label('Structured Data (JSON-LD)')
                ->rows(6)
                ->helperText('Paste valid JSON-LD for this category page.')
                ->formatStateUsing(function ($state) {
                    if (is_array($state)) {
                        return json_encode($state, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
                    }

                    if (is_string($state)) {
                        $decoded = json_decode($state, true);
                        if (json_last_error() === JSON_ERROR_NONE) {
                            return json_encode($decoded, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
                        }
                    }

                    return $state ?? '';
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

            Forms\Components\Repeater::make('faqs')
                ->label('FAQs')
                ->schema([
                    Forms\Components\TextInput::make('question')
                        ->required()
                        ->maxLength(255)
                        ->label('Question'),
                    Forms\Components\Textarea::make('answer')
                        ->required()
                        ->rows(3)
                        ->label('Answer'),
                ])
                ->default([])
                ->addActionLabel('Add FAQ')
                ->collapsible()
                ->itemLabel(fn(array $state): ?string => $state['question'] ?? null),

            Forms\Components\Toggle::make('is_active')
                ->label('Active')
                ->default(true),

            Forms\Components\Toggle::make('is_top')
                ->label('Is Top')
                ->default(false)
                ->helperText('Mark this category as a top category.'),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\ImageColumn::make('image')->circular()->size(40),
                Tables\Columns\TextColumn::make('name')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('slug')->searchable(),
                Tables\Columns\TextColumn::make('product_url')
                    ->label('Product URL')
                    ->limit(30)
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('libraries_count')
                    ->counts('libraries')
                    ->label('Total Libraries'),
                Tables\Columns\IconColumn::make('is_active')->boolean()->label('Active'),
                Tables\Columns\IconColumn::make('is_top')->boolean()->label('Top'),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('is_active')
                    ->label('Active Status')
                    ->trueLabel('Active')
                    ->falseLabel('Inactive')
                    ->placeholder('All'),

                Tables\Filters\TernaryFilter::make('is_top')
                    ->label('Top Category')
                    ->trueLabel('Top')
                    ->falseLabel('Non-Top')
                    ->placeholder('All'),

                Tables\Filters\Filter::make('library_count')
                    ->label('Library Count')
                    ->form([
                        Forms\Components\TextInput::make('min')->numeric()->label('Min Count'),
                        Forms\Components\TextInput::make('max')->numeric()->label('Max Count'),
                    ])
                    ->query(function ($query, array $data) {
                        return $query
                            ->when($data['min'], fn($q, $min) => $q->has('libraries', '>=', $min))
                            ->when($data['max'], fn($q, $max) => $q->has('libraries', '<=', $max));
                    }),

                Tables\Filters\Filter::make('name_search')
                    ->label('Search by Name')
                    ->form([
                        Forms\Components\TextInput::make('name')->label('Name Contains'),
                    ])
                    ->query(fn($query, $data) =>
                        $query->when($data['name'], fn($q, $name) => $q->where('name', 'like', "%{$name}%"))
                    ),
            ])
            ->headerActions([
                // ── EXPORT JSON ──────────────────────────────────────────────
                Tables\Actions\Action::make('exportJson')
                    ->label('Export JSON')
                    ->icon('heroicon-o-arrow-down-tray')
                    ->color('success')
                    ->action(function () {
                        $fields = [
                            'id', 'name', 'slug', 'image', 'product_url',
                            'is_active', 'is_top', 'description',
                            'meta_title', 'meta_description', 'focus_keyword',
                            'schema_type', 'structured_data', 'faqs',
                            'created_at', 'updated_at',
                        ];

                        $data = [];

                        // Chunk to handle 1000+ records without memory issues
                        Category::query()
                            ->select($fields)
                            ->orderBy('id')
                            ->chunk(500, function ($categories) use (&$data) {
                            $categoryIds = collect($categories)
                                ->map(fn($category) => (int) data_get($category, 'id'))
                                ->filter()
                                ->values()
                                ->all();

                            $libraryTitlesByCategory = DB::table('category_library')
                                ->join('libraries', 'libraries.id', '=', 'category_library.library_id')
                                ->whereIn('category_library.category_id', $categoryIds)
                                ->orderBy('libraries.title')
                                ->get(['category_library.category_id', 'libraries.title'])
                                ->groupBy('category_id')
                                ->map(fn($rows) => $rows->pluck('title')->filter()->values()->all());

                            foreach ($categories as $category) {
                                $record = $category instanceof Category
                                    ? $category->toArray()
                                    : (array) $category;

                                $libraryTitles = $libraryTitlesByCategory->get((int) data_get($category, 'id'), []);

                                $record['libraries_count'] = count($libraryTitles);
                                $record['library_titles'] = $libraryTitles;

                                $data[] = $record;
                            }
                        });

                        $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

                        return response()->streamDownload(function () use ($json) {
                            echo $json;
                        }, 'categories_' . now()->format('Y_m_d_His') . '.json', [
                            'Content-Type' => 'application/json',
                        ]);
                    }),

                // ── BULK UPDATE FROM JSON ─────────────────────────────────────
                Tables\Actions\Action::make('importJson')
                    ->label('Bulk Update (JSON)')
                    ->icon('heroicon-o-arrow-up-tray')
                    ->color('warning')
                    ->form([
                        Forms\Components\FileUpload::make('json_file')
                            ->label('Upload JSON File')
                            ->acceptedFileTypes(['application/json', 'text/plain'])
                            ->required()
                            ->helperText('Upload the JSON file exported earlier (with your SEO fields filled in). Records are matched by "id".'),
                    ])
                    ->action(function (array $data) {
                        $path = storage_path('app/public/' . $data['json_file']);

                        if (!file_exists($path)) {
                            Notification::make()
                                ->title('File not found.')
                                ->danger()
                                ->send();
                            return;
                        }

                        $json = file_get_contents($path);
                        $records = json_decode($json, true);

                        if (json_last_error() !== JSON_ERROR_NONE || !is_array($records)) {
                            Notification::make()
                                ->title('Invalid JSON file.')
                                ->danger()
                                ->send();
                            return;
                        }

                        // Only allow updating these fields (protect slug/name from accidental overwrite if desired)
                        $allowedFields = [
                            'name', 'slug', 'image', 'product_url',
                            'is_active', 'is_top', 'description',
                            'meta_title', 'meta_description', 'focus_keyword',
                            'schema_type', 'structured_data', 'faqs',
                        ];

                        $updated = 0;
                        $skipped = 0;

                        // Chunk the imported array to avoid long loops blocking memory
                        foreach (array_chunk($records, 200) as $chunk) {
                            foreach ($chunk as $record) {
                                if (empty($record['id'])) {
                                    $skipped++;
                                    continue;
                                }

                                $updateData = array_intersect_key($record, array_flip($allowedFields));

                                if (array_key_exists('structured_data', $updateData) && is_string($updateData['structured_data'])) {
                                    $decoded = json_decode($updateData['structured_data'], true);
                                    if (json_last_error() === JSON_ERROR_NONE) {
                                        $updateData['structured_data'] = $decoded;
                                    }
                                }

                                if (array_key_exists('faqs', $updateData) && is_string($updateData['faqs'])) {
                                    $decodedFaqs = json_decode($updateData['faqs'], true);
                                    if (json_last_error() === JSON_ERROR_NONE) {
                                        $updateData['faqs'] = $decodedFaqs;
                                    }
                                }

                                if (empty($updateData)) {
                                    $skipped++;
                                    continue;
                                }

                                $affected = Category::where('id', $record['id'])->update($updateData);
                                $affected ? $updated++ : $skipped++;
                            }
                        }

                        // Clean up uploaded file
                        @unlink($path);

                        Notification::make()
                            ->title("Bulk update complete: {$updated} updated, {$skipped} skipped.")
                            ->success()
                            ->send();
                    }),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),

                    Tables\Actions\BulkAction::make('makeActive')
                        ->label('Mark as Active')
                        ->icon('heroicon-o-check-circle')
                        ->color('success')
                        ->requiresConfirmation()
                        ->action(fn(Collection $records) => $records->each->update(['is_active' => true]))
                        ->deselectRecordsAfterCompletion()
                        ->successNotificationTitle('Categories activated successfully'),

                    Tables\Actions\BulkAction::make('makeInactive')
                        ->label('Mark as Inactive')
                        ->icon('heroicon-o-x-circle')
                        ->color('danger')
                        ->requiresConfirmation()
                        ->action(fn(Collection $records) => $records->each->update(['is_active' => false]))
                        ->deselectRecordsAfterCompletion()
                        ->successNotificationTitle('Categories deactivated successfully'),

                    Tables\Actions\BulkAction::make('makeTop')
                        ->label('Mark as Top')
                        ->icon('heroicon-o-star')
                        ->color('warning')
                        ->requiresConfirmation()
                        ->action(fn(Collection $records) => $records->each->update(['is_top' => true]))
                        ->deselectRecordsAfterCompletion()
                        ->successNotificationTitle('Categories marked as top successfully'),

                    Tables\Actions\BulkAction::make('removeTop')
                        ->label('Remove from Top')
                        ->icon('heroicon-o-minus-circle')
                        ->color('gray')
                        ->requiresConfirmation()
                        ->action(fn(Collection $records) => $records->each->update(['is_top' => false]))
                        ->deselectRecordsAfterCompletion()
                        ->successNotificationTitle('Categories removed from top successfully'),
                ]),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListCategories::route('/'),
            'create' => Pages\CreateCategory::route('/create'),
            'edit' => Pages\EditCategory::route('/{record}/edit'),
        ];
    }

    public static function canViewAny(): bool { return auth()->user()->can('view_categories'); }
    public static function canCreate(): bool { return auth()->user()->can('create_categories'); }
    public static function canEdit($record): bool { return auth()->user()->can('edit_categories'); }
    public static function canDelete($record): bool { return auth()->user()->can('delete_categories'); }
}


