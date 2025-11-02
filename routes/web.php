<?php

use App\Http\Controllers\AdController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\BrowseController;
use App\Http\Controllers\CollectionController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\CuratorController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FollowingController;
use App\Http\Controllers\LibraryController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PricingController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\SponsorController;
use App\Http\Controllers\SupportController;
use App\Http\Controllers\WebhookController;
use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Search Routes
|--------------------------------------------------------------------------
*/
Route::get('/search', [SearchController::class, 'index'])->name('search');
Route::get('/search/load-more', [SearchController::class, 'loadMore'])->name('search.load-more');
Route::get('/api/search', [SearchController::class, 'apiSearch'])->name('api.search');

/*
|--------------------------------------------------------------------------
| Library Routes
|--------------------------------------------------------------------------
*/
// Main routes
Route::get('/', [LibraryController::class, 'index'])
    ->middleware('verified')
    ->name('home');
Route::get('/explore', [LibraryController::class, 'explore'])->name('explore');
Route::get('/collections', [CollectionController::class, 'index'])->middleware('verified')->name('collections');
Route::get('/all-apps', [BrowseController::class, 'allApps'])->middleware('verified')->name('all-apps');
Route::get('/all-categories', [BrowseController::class, 'allCategories'])->middleware('verified')->name('all-categories');
Route::get('/all-elements', [BrowseController::class, 'allElements'])->middleware('verified')->name('all-elements');
// Route::get('/challenges', [LibraryController::class, 'challenges'])->name('challenges');
Route::get('/curators', [CuratorController::class, 'index'])->middleware('verified')->name('curators');
Route::get('/contact-us', [ContactController::class, 'index'])->middleware('verified')->name('contact-us');
Route::post('/contact-us', [ContactController::class, 'store']);
Route::get('/sponsor-us', [SponsorController::class, 'index'])->middleware('verified')->name('sponsor-us');
Route::post('/sponsor-us', [SponsorController::class, 'store']);

// FIXED: Library-specific routes with unique names
// Route::prefix('libraries')->name('libraries.')->group(function () {
//     Route::get('/', [LibraryController::class, 'index'])->name('index');
//     Route::get('/{slug}', [LibraryController::class, 'showModal'])->name('modal'); // CHANGED: from 'show' to 'modal'
// });

Route::get('/api/libraries/{slug}', [LibraryController::class, 'getLibrary'])->name('api.library');

// Main library detail route - this will handle both direct access and modal
Route::get('/library/{slug}', [LibraryController::class, 'show'])->name('library.show');


// Add this route for the home page load more functionality
Route::get('/api/home/load-more', [LibraryController::class, 'loadMore'])->name('home.load-more');

// Other library routes
Route::get('/libraries/filter', [LibraryController::class, 'filter'])->name('libraries.filter');

// FIXED: Standalone library detail route with different name


/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
*/
Route::post('/logout', function (Request $request) {
    Auth::logout();
    $request->session()->invalidate();
    $request->session()->regenerateToken();

    return redirect('/');
})->name('logout');

/*
|--------------------------------------------------------------------------
| Board Routes
|--------------------------------------------------------------------------
*/


// Protected routes for authenticated users
Route::middleware(['auth', 'verified'])->group(function () {
    // Board management routes
    Route::post('/boards', [CollectionController::class, 'store'])->name('boards.store');
    Route::put('/boards/{board}', [CollectionController::class, 'update'])->name('boards.update');
    Route::delete('/boards/{board}', [CollectionController::class, 'destroy'])->name('boards.destroy');
    Route::get('/boards/{board}', [CollectionController::class, 'show'])->name('boards.show');
    Route::post('/boards/add-library', [CollectionController::class, 'addLibraryToBoards'])->name('boards.add-library');

    // User board API routes for AJAX calls - FIXED ROUTES
    Route::get('/api/user-boards', [CollectionController::class, 'getUserBoards'])->name('api.user-boards');
    Route::get('/api/check-library-in-boards', [CollectionController::class, 'checkLibraryInBoards'])->name('api.check-library-in-boards');
    Route::get('/api/user-library-ids', [CollectionController::class, 'getUserLibraryIds'])->name('api.user-library-ids');

    // Alternative shorter routes (you can keep both or choose one)
    Route::get('/user-boards', [CollectionController::class, 'getUserBoards'])->name('user-boards');
    Route::get('/check-library-in-boards', [CollectionController::class, 'checkLibraryInBoards'])->name('check-library-in-boards');
    Route::get('/user-library-ids', [CollectionController::class, 'getUserLibraryIds'])->name('user-library-ids');
});

// Public shared board route
Route::get('/boards/shared/{token}', [CollectionController::class, 'shared'])->name('boards.shared');





Route::get('/following', [FollowingController::class, 'index'])->middleware('verified')->name('following');

// Category follow/unfollow routes
Route::post('/following/follow', [FollowingController::class, 'followCategory'])->name('following.follow');
Route::post('/following/unfollow', [FollowingController::class, 'unfollowCategory'])->name('following.unfollow');
Route::post('/following/status', [FollowingController::class, 'getFollowStatus'])->name('following.status');

/*
|--------------------------------------------------------------------------
| Browse Routes
|--------------------------------------------------------------------------
*/
Route::get('/browse', [LibraryController::class, 'browse'])->middleware('verified')->name('browse');
Route::get('/browse/category/{slug}', [LibraryController::class, 'browseByCategory'])->name('browse.category');
Route::get('/browse/industry/{slug}', [LibraryController::class, 'browseByIndustry'])->name('browse.industry');
Route::get('/browse/interaction/{slug}', [LibraryController::class, 'browseByInteraction'])->name('browse.interaction');

/*
|--------------------------------------------------------------------------
| Support Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->group(function () {
    Route::prefix('support')->group(function () {
        Route::get('/', [SupportController::class, 'index'])->name('support.index');
        Route::post('/', [SupportController::class, 'store'])->name('support.store');
        Route::get('/unread-count', [SupportController::class, 'getUnreadCount'])->name('support.unread-count');
        Route::get('/{ticket}', [SupportController::class, 'show'])->name('support.show');
        Route::post('/{ticket}/reply', [SupportController::class, 'reply'])->name('support.reply');
    });
});

/*
|--------------------------------------------------------------------------
| Payment Routes
|--------------------------------------------------------------------------
*/
Route::prefix('api')->group(function () {
    // Public pricing information (no cache, always fresh)
    Route::get('/pricing/plans', [PricingController::class, 'getPlans'])
        ->name('api.pricing.plans');

    // Protected API routes (require authentication with auto-expiry check)
    Route::middleware(['auth:sanctum', 'auto.expired.subscriptions'])->group(function () {
        Route::get('/pricing/current-plan', [PricingController::class, 'getCurrentPlan'])
            ->name('api.pricing.current-plan');
        Route::get('/pricing/subscription-status', [PricingController::class, 'getSubscriptionStatus'])
            ->name('api.pricing.subscription-status');
        Route::post('/pricing/update-plan', [PricingController::class, 'updateUserPlan'])
            ->name('api.pricing.update-plan');

        // Add this new route for free trial
        Route::post('/pricing/start-trial', [PricingController::class, 'startFreeTrial'])
            ->name('api.pricing.start-trial');
    });
});

// Payment routes (with auto-expiry check)
Route::middleware(['auth', 'verified', 'auto.expired.subscriptions'])->prefix('payment')->name('payment.')->group(function () {
    Route::post('/initiate', [PaymentController::class, 'initiate'])->name('initiate');
    Route::post('/confirm', [PaymentController::class, 'confirm'])->name('confirm');
});

// Payment gateway callbacks (public routes - no middleware needed)
Route::prefix('payment')->name('payment.')->group(function () {
    Route::get('/success', [PaymentController::class, 'success'])->name('success');
    Route::get('/fail', [PaymentController::class, 'fail'])->name('fail');
    Route::get('/cancel', [PaymentController::class, 'cancel'])->name('cancel');
    Route::post('/webhook', [PaymentController::class, 'webhook'])->name('webhook');
});

// Debug/Test routes (can be removed in production)


// Optional: Main pricing page
Route::get('/pricing', function () {
    return Inertia::render('Pricing');
})->name('pricing.index')->middleware('auto.expired.subscriptions');
/*
|--------------------------------------------------------------------------
| Profile Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::post('/profile/update-modal', [ProfileController::class, 'updateModal'])->name('profile.update.modal');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

/*
|--------------------------------------------------------------------------
| Ad Routes
|--------------------------------------------------------------------------
*/
// Advertisement routes
Route::middleware(['web'])->prefix('ads')->group(function () {
    Route::get('/sidebar', [AdController::class, 'getSidebarAds']);
    Route::get('/modal', [AdController::class, 'getModalAds']);
    Route::get('/home', [AdController::class, 'getHomeAds']);
    Route::post('/{ad}/click', [AdController::class, 'trackClick']);
    Route::get('/stats', [AdController::class, 'getStats'])->middleware('auth');
});




/*
|--------------------------------------------------------------------------
| Contact Routes
|--------------------------------------------------------------------------
*/
// Contact routes
Route::post('/contact', [ContactController::class, 'store'])->middleware('verified')->name('contact.store');



// Route::get('/test-429', function () {
//     abort(429); // Laravel will immediately return a 500 response
// });
/*
|--------------------------------------------------------------------------
| SEO Routes
|--------------------------------------------------------------------------
*/
// SEO utility routes
Route::get('/sitemap.xml', function () {
    return response()->file(public_path('sitemap.xml'));
});

Route::get('/sitemap-video.xml', function () {
    return response()->file(public_path('sitemap-video.xml'));
});

Route::get('/sitemap-news.xml', function () {
    return response()->file(public_path('sitemap-news.xml'));
});

Route::get('/sitemap-index.xml', function () {
    return response()->file(public_path('sitemap-index.xml'));
});

Route::get('/robots.txt', function () {
    $content = "User-agent: *\n";
    $content .= "Allow: /\n";
    $content .= "Disallow: /admin/\n";
    $content .= "Disallow: /api/\n";
    $content .= "\n";
    $content .= "Sitemap: " . url('sitemap-index.xml') . "\n";

    return response($content)->header('Content-Type', 'text/plain');
});

// API routes for real-time SEO analysis
Route::prefix('api/seo')->middleware(['web', 'auth'])->group(function () {
    Route::post('/analyze/{library}', function (\App\Models\Library $library) {
        return response()->json($library->performSeoAnalysis());
    });

    Route::post('/suggestions/{library}', function (\App\Models\Library $library) {
        return response()->json($library->getAutoSuggestions());
    });
});

require __DIR__.'/auth.php';
