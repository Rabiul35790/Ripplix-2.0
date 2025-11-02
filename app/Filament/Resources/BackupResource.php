<?php

namespace App\Filament\Resources;

use App\Filament\Resources\BackupResource\Pages;
use App\Models\Backup;
use App\Services\BackupService;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Notifications\Notification;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Storage;

class BackupResource extends Resource
{
    protected static ?string $model = Backup::class;

    protected static ?string $navigationIcon = 'heroicon-o-cloud-arrow-down';

    protected static ?string $navigationGroup = 'System';

    protected static ?int $navigationSort = 99;

    public static function canViewAny(): bool
    {
        return auth()->user()->can('view_backups');
    }

    public static function canCreate(): bool
    {
        return auth()->user()->can('create_backups');
    }

    public static function canEdit($record): bool
    {
        return false; // Backups cannot be edited
    }

    public static function canDelete($record): bool
    {
        return auth()->user()->can('delete_backups');
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('name')
                    ->required()
                    ->maxLength(255)
                    ->disabled(),

                Forms\Components\Select::make('type')
                    ->options([
                        'full' => 'Full Backup',
                        'database' => 'Database Only',
                        'files' => 'Files Only',
                    ])
                    ->required()
                    ->disabled(),

                Forms\Components\Select::make('status')
                    ->options([
                        'pending' => 'Pending',
                        'processing' => 'Processing',
                        'completed' => 'Completed',
                        'failed' => 'Failed',
                    ])
                    ->disabled(),

                Forms\Components\TextInput::make('formatted_size')
                    ->label('Size')
                    ->disabled(),

                Forms\Components\Textarea::make('error_message')
                    ->columnSpanFull()
                    ->disabled()
                    ->visible(fn($record) => $record && $record->status === 'failed'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->sortable()
                    ->limit(40),

                Tables\Columns\TextColumn::make('type')
                    ->badge()
                    ->color(fn(string $state): string => match ($state) {
                        'full' => 'success',
                        'database' => 'info',
                        'files' => 'warning',
                        default => 'gray',
                    })
                    ->sortable(),

                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->color(fn(string $state): string => match ($state) {
                        'completed' => 'success',
                        'processing' => 'warning',
                        'failed' => 'danger',
                        'pending' => 'gray',
                        default => 'gray',
                    })
                    ->sortable(),

                Tables\Columns\TextColumn::make('formatted_size')
                    ->label('Size')
                    ->sortable(query: function (Builder $query, string $direction): Builder {
                        return $query->orderBy('size', $direction);
                    }),

                Tables\Columns\TextColumn::make('creator.name')
                    ->label('Created By')
                    ->sortable()
                    ->toggleable(),

                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('type')
                    ->options([
                        'full' => 'Full Backup',
                        'database' => 'Database Only',
                        'files' => 'Files Only',
                    ]),

                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'pending' => 'Pending',
                        'processing' => 'Processing',
                        'completed' => 'Completed',
                        'failed' => 'Failed',
                    ]),

                Tables\Filters\Filter::make('created_at')
                    ->form([
                        Forms\Components\DatePicker::make('created_from'),
                        Forms\Components\DatePicker::make('created_until'),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when(
                                $data['created_from'],
                                fn(Builder $query, $date): Builder => $query->whereDate('created_at', '>=', $date),
                            )
                            ->when(
                                $data['created_until'],
                                fn(Builder $query, $date): Builder => $query->whereDate('created_at', '<=', $date),
                            );
                    }),
            ])
            ->actions([
                Tables\Actions\Action::make('download')
                    ->icon('heroicon-o-arrow-down-tray')
                    ->color('success')
                    ->visible(fn(Backup $record) => $record->status === 'completed' && $record->exists())
                    ->action(function (Backup $record) {
                        try {
                            return $record->download();
                        } catch (\Exception $e) {
                            Notification::make()
                                ->title('Download Failed')
                                ->body($e->getMessage())
                                ->danger()
                                ->send();
                        }
                    }),

                Tables\Actions\ViewAction::make(),

                Tables\Actions\DeleteAction::make()
                    ->visible(fn() => auth()->user()->can('delete_backups')),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make()
                        ->visible(fn() => auth()->user()->can('delete_backups')),
                ]),
            ])
            ->headerActions([
                Tables\Actions\Action::make('create_backup')
                    ->label('Create Backup')
                    ->icon('heroicon-o-plus-circle')
                    ->color('success')
                    ->visible(fn() => auth()->user()->can('create_backups'))
                    ->form([
                        Forms\Components\Select::make('type')
                            ->label('Backup Type')
                            ->options([
                                'full' => 'Full Backup (Database + Files)',
                                'database' => 'Database Only',
                                'files' => 'Files Only',
                            ])
                            ->default('full')
                            ->required()
                            ->helperText('Select what to include in the backup'),
                    ])
                    ->action(function (array $data) {
                        try {
                            $service = app(BackupService::class);
                            $backup = $service->createBackup(
                                $data['type'],
                                auth()->id()
                            );

                            Notification::make()
                                ->title('Backup Created Successfully')
                                ->body("Backup '{$backup->name}' has been created.")
                                ->success()
                                ->send();

                        } catch (\Exception $e) {
                            Notification::make()
                                ->title('Backup Failed')
                                ->body($e->getMessage())
                                ->danger()
                                ->send();
                        }
                    }),

                Tables\Actions\Action::make('cleanup')
                    ->label('Cleanup Old Backups')
                    ->icon('heroicon-o-trash')
                    ->color('warning')
                    ->visible(fn() => auth()->user()->can('delete_backups'))
                    ->requiresConfirmation()
                    ->modalHeading('Cleanup Old Backups')
                    ->modalDescription('This will delete backups older than 30 days. Are you sure?')
                    ->action(function () {
                        try {
                            $service = app(BackupService::class);
                            $deletedCount = $service->cleanOldBackups(30);

                            Notification::make()
                                ->title('Cleanup Completed')
                                ->body("Deleted {$deletedCount} old backup(s).")
                                ->success()
                                ->send();

                        } catch (\Exception $e) {
                            Notification::make()
                                ->title('Cleanup Failed')
                                ->body($e->getMessage())
                                ->danger()
                                ->send();
                        }
                    }),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListBackups::route('/'),
            'view' => Pages\ViewBackup::route('/{record}'),
        ];
    }

    public static function getNavigationBadge(): ?string
    {
        return static::getModel()::where('status', 'completed')->count();
    }
}
