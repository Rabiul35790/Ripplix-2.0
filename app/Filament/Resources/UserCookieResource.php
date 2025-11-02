<?php

namespace App\Filament\Resources;

use App\Filament\Resources\UserCookieResource\Pages;
use App\Models\UserCookie;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class UserCookieResource extends Resource
{
    protected static ?string $model = UserCookie::class;
    protected static ?string $navigationIcon = 'heroicon-o-globe-alt';
    protected static ?string $navigationLabel = 'Cookie Tracking';
    protected static ?string $navigationGroup = 'Analytics';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\TextInput::make('user_id')->label('User ID')->disabled(),
            Forms\Components\TextInput::make('ip_address')->label('IP Address')->disabled(),
            Forms\Components\Textarea::make('user_agent')->label('User Agent')->disabled(),
            Forms\Components\KeyValue::make('cookie_data')->label('Cookie Data')->disabled(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')->sortable(),
                Tables\Columns\TextColumn::make('user.name')
                    ->label('User')
                    ->default('Guest')
                    ->sortable()
                    ->searchable(),
                Tables\Columns\TextColumn::make('ip_address')
                    ->label('IP Address')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\IconColumn::make('accepted_at')
                    ->label('Accepted')
                    ->boolean()
                    ->getStateUsing(fn ($record) => !is_null($record->accepted_at)),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Created')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\Filter::make('authenticated')
                    ->query(fn ($query) => $query->whereNotNull('user_id'))
                    ->label('Authenticated Users'),
                Tables\Filters\Filter::make('guests')
                    ->query(fn ($query) => $query->whereNull('user_id'))
                    ->label('Guest Users'),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListUserCookies::route('/'),
            'view' => Pages\ViewUserCookie::route('/{record}'),
        ];
    }

    // Permission methods
    public static function canViewAny(): bool
    {
        return auth()->user()->can('view_user_cookies');
    }

    public static function canView($record): bool
    {
        return auth()->user()->can('view_user_cookies');
    }

    public static function canCreate(): bool
    {
        return false; // Cookies are created by users, not manually
    }

    public static function canEdit($record): bool
    {
        return false; // Cookie records should not be edited
    }

    public static function canDelete($record): bool
    {
        return auth()->user()->can('delete_user_cookies');
    }

    public static function canDeleteAny(): bool
    {
        return auth()->user()->can('delete_user_cookies');
    }
}
