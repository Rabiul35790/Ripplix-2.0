<?php

namespace App\Filament\Resources;

use App\Filament\Resources\LegalResource\Pages;
use App\Models\Legal;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\BadgeColumn;
use Filament\Support\Enums\FontWeight;
use Illuminate\Database\Eloquent\Builder;

class LegalResource extends Resource
{
    protected static ?string $model = Legal::class;

    protected static ?string $navigationIcon = 'heroicon-o-document-text';

    protected static ?string $navigationLabel = 'Legal Documents';

    protected static ?string $navigationGroup = 'System';

    protected static ?int $navigationSort = 2;

    protected static ?string $slug = 'legal-documents';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Card::make()
                    ->schema([
                        Select::make('type')
                            ->label('Document Type')
                            ->options([
                                'privacy_policy' => 'Privacy Policy',
                                'terms_conditions' => 'Terms of Service',
                                'cookie_policy' => 'Cookie Policy',
                                'disclaimer' => 'Disclaimer',
                                'report_content_policy' => 'Report Content Policy',
                            ])
                            ->required()
                            ->unique(ignoreRecord: true)
                            ->helperText('Select the type of legal document you want to create.')
                            ->columnSpanFull(),

                        TextInput::make('title')
                            ->label('Document Title')
                            ->required()
                            ->maxLength(255)
                            ->placeholder('Enter the title for this legal document')
                            ->columnSpanFull(),

                        Toggle::make('is_active')
                            ->label('Active Status')
                            ->helperText('Toggle to activate or deactivate this legal document.')
                            ->default(true)
                            ->columnSpanFull(),

                        RichEditor::make('content')
                            ->label('Document Content')
                            ->required()
                            ->toolbarButtons([
                                'attachFiles',
                                'blockquote',
                                'bold',
                                'bulletList',
                                'codeBlock',
                                'h2',
                                'h3',
                                'h4',
                                'italic',
                                'link',
                                'orderedList',
                                'redo',
                                'strike',
                                'table',
                                'underline',
                                'undo',
                            ])
                            ->placeholder('Enter the content for this legal document...')
                            ->helperText('Use the rich text editor to format your legal document content.')
                            ->columnSpanFull(),
                    ])
                    ->columnSpan(['lg' => 2]),

                Forms\Components\Card::make()
                    ->schema([
                        Forms\Components\Placeholder::make('created_at')
                            ->label('Created at')
                            ->content(fn (?Legal $record): string => $record?->created_at?->diffForHumans() ?? '-'),

                        Forms\Components\Placeholder::make('updated_at')
                            ->label('Last modified at')
                            ->content(fn (?Legal $record): string => $record?->updated_at?->diffForHumans() ?? '-'),
                    ])
                    ->columnSpan(['lg' => 1])
                    ->hidden(fn (?Legal $record) => $record === null),
            ])
            ->columns(3);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('type')
                    ->label('Document Type')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'privacy_policy' => 'success',
                        'terms_conditions' => 'info',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'privacy_policy' => 'Privacy Policy',
                        'terms_conditions' => 'Terms of Service',
                        default => ucfirst(str_replace('_', ' ', $state)),
                    })
                    ->sortable(),

                TextColumn::make('title')
                    ->label('Title')
                    ->searchable()
                    ->sortable()
                    ->weight(FontWeight::Medium)
                    ->limit(50),

                IconColumn::make('is_active')
                    ->label('Status')
                    ->boolean()
                    ->trueIcon('heroicon-o-check-badge')
                    ->falseIcon('heroicon-o-x-circle')
                    ->trueColor('success')
                    ->falseColor('danger')
                    ->sortable(),

                TextColumn::make('updated_at')
                    ->label('Last Updated')
                    ->dateTime('M j, Y g:i A')
                    ->sortable()
                    ->toggleable(),

                TextColumn::make('created_at')
                    ->label('Created')
                    ->dateTime('M j, Y')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('type')
                    ->label('Document Type')
                    ->options([
                        'privacy_policy' => 'Privacy Policy',
                        'terms_conditions' => 'Terms of Service',
                        'cookie_policy' => 'Cookie Policy',
                        'disclaimer' => 'Disclaimer',
                        'report_content_policy' => 'Report Content Policy',
                    ]),

                Tables\Filters\TernaryFilter::make('is_active')
                    ->label('Status')
                    ->boolean()
                    ->trueLabel('Active')
                    ->falseLabel('Inactive')
                    ->native(false),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('updated_at', 'desc')
            ->emptyStateActions([
                Tables\Actions\CreateAction::make(),
            ])
            ->emptyStateHeading('No Legal Documents')
            ->emptyStateDescription('Create your first legal document to get started.')
            ->emptyStateIcon('heroicon-o-document-text');
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
            'index' => Pages\ListLegals::route('/'),
            'create' => Pages\CreateLegal::route('/create'),
            'view' => Pages\ViewLegal::route('/{record}'),
            'edit' => Pages\EditLegal::route('/{record}/edit'),
        ];
    }

    // Permission methods
    public static function canViewAny(): bool
    {
        return auth()->user()->can('view_legals');
    }

    public static function canCreate(): bool
    {
        return auth()->user()->can('create_legals');
    }

    public static function canEdit($record): bool
    {
        return auth()->user()->can('edit_legals');
    }

    public static function canDelete($record): bool
    {
        return auth()->user()->can('delete_legals');
    }

    public static function getNavigationBadge(): ?string
    {
        return static::getModel()::count();
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return static::getModel()::count() > 0 ? 'success' : 'gray';
    }
}
