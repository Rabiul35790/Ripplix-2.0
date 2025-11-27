<?php

// config/user.php

return [
    /*
    |--------------------------------------------------------------------------
    | User Plan Cache Settings
    |--------------------------------------------------------------------------
    |
    | Configure caching durations for user plan data to optimize performance.
    | Values are in seconds.
    |
    */

    'cache' => [
        // Cache duration for current plan data (5 minutes)
        'plan_ttl' => env('USER_PLAN_CACHE_TTL', 300),

        // Cache duration for plan limits (10 minutes)
        'limits_ttl' => env('USER_LIMITS_CACHE_TTL', 600),

        // Cache duration for board counts (5 minutes)
        'boards_ttl' => env('USER_BOARDS_CACHE_TTL', 300),
    ],

    /*
    |--------------------------------------------------------------------------
    | Plan Limit Defaults
    |--------------------------------------------------------------------------
    |
    | Default limits for different plan types
    |
    */

    'limits' => [
        'free' => [
            'max_boards' => 3,
            'max_libraries_per_board' => 6,
        ],
        'visitor' => [
            'max_boards' => 0,
            'max_libraries_per_board' => 0,
        ],
        'paid' => [
            'max_boards' => PHP_INT_MAX,
            'max_libraries_per_board' => PHP_INT_MAX,
        ],
    ],
];
