<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Law;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class LawController extends Controller
{
    /**
     * Get all laws with filters
     */
    public function index(Request $request)
    {
        $query = Law::with(['country', 'category'])
            ->where('is_active', true);

        // Filter by country
        if ($request->has('country_id')) {
            $query->where('country_id', $request->country_id);
        }

        // Filter by category
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('title_ar', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%")
                  ->orWhere('content_ar', 'like', "%{$search}%")
                  ->orWhere('article_number', 'like', "%{$search}%");
            });
        }

        $laws = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $laws->items(),
            'pagination' => [
                'current_page' => $laws->currentPage(),
                'last_page' => $laws->lastPage(),
                'per_page' => $laws->perPage(),
                'total' => $laws->total(),
            ]
        ]);
    }

    /**
     * Get single law
     */
    public function show($id)
    {
        $law = Law::with(['country', 'category'])->find($id);

        if (!$law) {
            return response()->json([
                'success' => false,
                'message' => 'Law not found'
            ], 404);
        }

        // Increment views
        $law->increment('views');

        // Get related laws
        $relatedLaws = Law::where('id', '!=', $id)
            ->where('is_active', true)
            ->where(function ($query) use ($law) {
                $query->where('country_id', $law->country_id)
                      ->orWhere('category_id', $law->category_id);
            })
            ->limit(5)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $law,
            'related' => $relatedLaws
        ]);
    }

    /**
     * Create law (Admin)
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'country_id' => 'required|exists:countries,id',
            'category_id' => 'required|exists:categories,id',
            'title' => 'required|string|max:255',
            'title_ar' => 'nullable|string|max:255',
            'content' => 'required|string',
            'content_ar' => 'nullable|string',
            'article_number' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $law = Law::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Law created',
            'data' => $law->load(['country', 'category'])
        ], 201);
    }

    /**
     * Update law (Admin)
     */
    public function update(Request $request, $id)
    {
        $law = Law::find($id);

        if (!$law) {
            return response()->json([
                'success' => false,
                'message' => 'Law not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'country_id' => 'sometimes|exists:countries,id',
            'category_id' => 'sometimes|exists:categories,id',
            'title' => 'sometimes|string|max:255',
            'title_ar' => 'nullable|string|max:255',
            'content' => 'sometimes|string',
            'content_ar' => 'nullable|string',
            'article_number' => 'nullable|string|max:50',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $law->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Law updated',
            'data' => $law->load(['country', 'category'])
        ]);
    }

    /**
     * Delete law (Admin)
     */
    public function destroy($id)
    {
        $law = Law::find($id);

        if (!$law) {
            return response()->json([
                'success' => false,
                'message' => 'Law not found'
            ], 404);
        }

        $law->delete();

        return response()->json([
            'success' => true,
            'message' => 'Law deleted'
        ]);
    }
}

