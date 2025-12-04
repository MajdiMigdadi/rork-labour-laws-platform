<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Country;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CountryController extends Controller
{
    /**
     * Get all countries
     */
    public function index()
    {
        $countries = Country::where('is_active', true)
            ->withCount('laws')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $countries
        ]);
    }

    /**
     * Get single country
     */
    public function show($id)
    {
        $country = Country::with(['laws' => function ($query) {
            $query->where('is_active', true)->limit(10);
        }])->find($id);

        if (!$country) {
            return response()->json([
                'success' => false,
                'message' => 'Country not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $country
        ]);
    }

    /**
     * Create country (Admin)
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'name_ar' => 'nullable|string|max:100',
            'code' => 'required|string|max:10|unique:countries,code',
            'flag' => 'nullable|string',
            'description' => 'nullable|string',
            'description_ar' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $country = Country::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Country created',
            'data' => $country
        ], 201);
    }

    /**
     * Update country (Admin)
     */
    public function update(Request $request, $id)
    {
        $country = Country::find($id);

        if (!$country) {
            return response()->json([
                'success' => false,
                'message' => 'Country not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:100',
            'name_ar' => 'nullable|string|max:100',
            'code' => 'sometimes|string|max:10|unique:countries,code,' . $id,
            'flag' => 'nullable|string',
            'description' => 'nullable|string',
            'description_ar' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $country->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Country updated',
            'data' => $country
        ]);
    }

    /**
     * Delete country (Admin)
     */
    public function destroy($id)
    {
        $country = Country::find($id);

        if (!$country) {
            return response()->json([
                'success' => false,
                'message' => 'Country not found'
            ], 404);
        }

        $country->delete();

        return response()->json([
            'success' => true,
            'message' => 'Country deleted'
        ]);
    }
}

