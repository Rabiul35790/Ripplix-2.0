<?php

use App\Http\Controllers\Api\CookieController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\LibraryViewController;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\AnimationController;
use App\Http\Controllers\LibraryController;

// Animation routes
Route::prefix('ripplix/v2')->group(function () {
    // Public GET endpoint
    Route::get('/animations', [AnimationController::class, 'index']);

    // Protected POST endpoint (requires authentication)
    Route::post('/animations/bulk', [AnimationController::class, 'bulkStore'])
        ->middleware(['auth:sanctum', 'api.admin.access']);
});

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Search routes (public)
Route::get('/search', [SearchController::class, 'search'])->name('api.search');

// Library filter API endpoint
Route::get('/libraries/filter', [LibraryController::class, 'filter'])->name('api.libraries.filter');


Route::middleware(['web'])->group(function () {
    Route::post('/cookies/store', [CookieController::class, 'store'])->name('cookies.store');
    Route::get('/cookies/preferences', [CookieController::class, 'getUserPreferences'])->name('cookies.preferences');
});


// Route::post('/libraries/{library}/view', [LibraryViewController::class, 'trackView']);

// // Get viewed library IDs
// Route::get('/viewed-library-ids', [LibraryViewController::class, 'getViewedLibraryIds']);
