<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Error Page Configuration
    |--------------------------------------------------------------------------
    */

    'cache_duration' => env('ERROR_CACHE_DURATION', 300), // 5 minutes

    'error_codes' => [
        404 => [
            'title' => 'Page Not Found',
            'message' => 'The page you are looking for could not be found.',
            'description' => 'The requested resource does not exist or has been moved to a different location.',
            'icon' => '404',
            'can_retry' => false,
            'show_categories' => true,
            'theme' => [
                'bg' => 'bg-gray-50 dark:bg-gray-800/50',
                'text' => 'text-gray-600 dark:text-gray-400',
                'button' => 'bg-[#333333] hover:bg-black focus:ring-0 focus:outline-none',
            ],
            'actions' => [
                ['label' => 'Go to Home', 'action' => 'home', 'primary' => true],
            ],
        ],

        403 => [
            'title' => 'Access Forbidden',
            'message' => 'You do not have permission to access this resource.',
            'description' => 'Your account does not have the necessary permissions to view this content.',
            'icon' => '403',
            'can_retry' => false,
            'show_categories' => false,
            'theme' => [
                'bg' => 'bg-red-50 dark:bg-red-900/20',
                'text' => 'text-red-600 dark:text-red-400',
                'button' => 'bg-[#333333] hover:bg-black focus:ring-0 focus:outline-none'
            ],
            'actions' => [
                ['label' => 'Go to Home', 'action' => 'home', 'primary' => true],
            ],
        ],

        500 => [
            'title' => 'Internal Server Error',
            'message' => 'An internal server error occurred.',
            'description' => 'Something went wrong on our end. Our team has been notified and is working to fix this issue.',
            'icon' => '500',
            'can_retry' => true,
            'show_categories' => false,
            'theme' => [
                'bg' => 'bg-red-50 dark:bg-red-900/20',
                'text' => 'text-red-600 dark:text-red-400',
                'button' => 'bg-[#333333] hover:bg-black focus:ring-0 focus:outline-none'
            ],
            'actions' => [
                ['label' => 'Try Again', 'action' => 'refresh', 'primary' => true],
                ['label' => 'Go to Home', 'action' => 'home', 'primary' => true],
            ],
        ],

        503 => [
            'title' => 'Service Unavailable',
            'message' => 'The service is temporarily unavailable.',
            'description' => 'We are currently performing scheduled maintenance. Please check back in a few minutes.',
            'icon' => '503',
            'can_retry' => true,
            'show_categories' => false,
            'theme' => [
                'bg' => 'bg-yellow-50 dark:bg-yellow-900/20',
                'text' => 'text-yellow-600 dark:text-yellow-400',
                'button' => 'bg-[#333333] hover:bg-black focus:ring-0 focus:outline-none'
            ],
            'actions' => [
                ['label' => 'Try Again', 'action' => 'refresh', 'primary' => true],
                ['label' => 'Go to Home', 'action' => 'home', 'primary' => true],
            ],
        ],

        419 => [
            'title' => 'Page Expired',
            'message' => 'Your session has expired.',
            'description' => 'For security reasons, your session has timed out. Please refresh the page and try again.',
            'icon' => '419',
            'can_retry' => true,
            'show_categories' => false,
            'theme' => [
                'bg' => 'bg-blue-50 dark:bg-blue-900/20',
                'text' => 'text-blue-600 dark:text-blue-400',
                'button' => 'bg-[#333333] hover:bg-black focus:ring-0 focus:outline-none'
            ],
            'actions' => [
                ['label' => 'Refresh Page', 'action' => 'refresh', 'primary' => true],
                ['label' => 'Go to Home', 'action' => 'home', 'primary' => true],
            ],
        ],

        429 => [
            'title' => 'Too Many Requests',
            'message' => 'You have made too many requests.',
            'description' => 'Please wait a moment before making another request to avoid being rate limited.',
            'icon' => '429',
            'can_retry' => true,
            'show_categories' => false,
            'theme' => [
                'bg' => 'bg-orange-50 dark:bg-orange-900/20',
                'text' => 'text-orange-600 dark:text-orange-400',
                'button' => 'bg-[#333333] hover:bg-black focus:ring-0 focus:outline-none'
            ],
            'actions' => [
                ['label' => 'Wait & Try Again', 'action' => 'refresh', 'primary' => true],
                ['label' => 'Go to Home', 'action' => 'home', 'primary' => true],
            ],
        ],
    ],

    'default' => [
        'title' => 'Something went wrong',
        'message' => 'An unexpected error occurred.',
        'description' => 'We\'re sorry, but something unexpected happened. Please try again later.',
        'icon' => 'error',
        'can_retry' => true,
        'show_categories' => false,
        'theme' => [
            'bg' => 'bg-gray-50 dark:bg-gray-800/50',
            'text' => 'text-gray-600 dark:text-gray-400',
            'button' => 'bg-[#333333] hover:bg-black focus:ring-0 focus:outline-none'
        ],
        'actions' => [
            ['label' => 'Go to Home', 'action' => 'home', 'primary' => true],
        ],
    ],

    'supported_codes' => [404, 403, 500, 503, 419, 429],

    'api' => [
        'include_trace' => env('APP_DEBUG', false),
        'include_previous' => env('APP_DEBUG', false),
    ],

    'logging' => [
        'log_error_page_data_failures' => true,
        'log_level' => 'error',
    ],
];
