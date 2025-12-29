<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Industry;
use App\Models\Interaction;
use Illuminate\Http\JsonResponse;

class LookupController extends Controller
{
    /**
     * Get all categories
     */
    public function categories(): JsonResponse
    {
        $categories = Category::where('is_active', true)
            ->select('id', 'name', 'slug', 'image', 'product_url')
            ->orderBy('name')
            ->get();

        return response()->json([
            'apps' => $categories
        ], 200);
    }

    /**
     * Get all industries
     */
    public function industries(): JsonResponse
    {
        $industries = Industry::where('is_active', true)
            ->select('id', 'name', 'slug')
            ->orderBy('name')
            ->get();

        return response()->json([
            'industries' => $industries
        ], 200);
    }

    /**
     * Get all interactions
     */
    public function interactions(): JsonResponse
    {
        $interactions = Interaction::where('is_active', true)
            ->select('id', 'name', 'slug')
            ->orderBy('name')
            ->get();

        return response()->json([
            'elements' => $interactions
        ], 200);
    }
}
