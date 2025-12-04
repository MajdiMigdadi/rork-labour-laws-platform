<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\CountryController;
use App\Http\Controllers\API\CategoryController;
use App\Http\Controllers\API\LawController;
use App\Http\Controllers\API\QuestionController;
use App\Http\Controllers\API\AnswerController;
use App\Http\Controllers\API\MessageController;
use App\Http\Controllers\API\SettingController;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\FavoriteController;
use App\Http\Controllers\API\StatsController;

/*
|--------------------------------------------------------------------------
| API Routes - Labour Laws Platform
|--------------------------------------------------------------------------
*/

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

// Authentication
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);

// Countries (Public read)
Route::get('/countries', [CountryController::class, 'index']);
Route::get('/countries/{id}', [CountryController::class, 'show']);

// Categories (Public read)
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);

// Laws (Public read)
Route::get('/laws', [LawController::class, 'index']);
Route::get('/laws/{id}', [LawController::class, 'show']);

// Questions (Public read)
Route::get('/questions', [QuestionController::class, 'index']);
Route::get('/questions/{id}', [QuestionController::class, 'show']);
Route::get('/questions/{questionId}/answers', [AnswerController::class, 'index']);

// Settings (Public read)
Route::get('/settings', [SettingController::class, 'index']);

// Contact Form (Public)
Route::post('/messages', [MessageController::class, 'store']);

// ============================================
// PROTECTED ROUTES (Authentication required)
// ============================================

Route::middleware('auth:sanctum')->group(function () {
    
    // Auth Profile
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/profile', [AuthController::class, 'profile']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
    Route::post('/auth/avatar', [AuthController::class, 'uploadAvatar']);

    // Questions (Create, Update own)
    Route::post('/questions', [QuestionController::class, 'store']);
    Route::put('/questions/{id}', [QuestionController::class, 'update']);
    Route::delete('/questions/{id}', [QuestionController::class, 'destroy']);
    Route::post('/questions/{id}/upvote', [QuestionController::class, 'upvote']);
    Route::post('/questions/{id}/downvote', [QuestionController::class, 'downvote']);

    // Answers
    Route::post('/questions/{questionId}/answers', [AnswerController::class, 'store']);
    Route::put('/answers/{id}', [AnswerController::class, 'update']);
    Route::delete('/answers/{id}', [AnswerController::class, 'destroy']);
    Route::post('/questions/{questionId}/answers/{answerId}/accept', [AnswerController::class, 'accept']);
    Route::post('/answers/{id}/upvote', [AnswerController::class, 'upvote']);
    Route::post('/answers/{id}/downvote', [AnswerController::class, 'downvote']);

    // Favorites
    Route::get('/favorites/laws', [FavoriteController::class, 'getLaws']);
    Route::get('/favorites/questions', [FavoriteController::class, 'getQuestions']);
    Route::post('/favorites/laws', [FavoriteController::class, 'addLaw']);
    Route::delete('/favorites/laws/{id}', [FavoriteController::class, 'removeLaw']);
    Route::post('/favorites/questions', [FavoriteController::class, 'addQuestion']);
    Route::delete('/favorites/questions/{id}', [FavoriteController::class, 'removeQuestion']);

    // ============================================
    // ADMIN ROUTES
    // ============================================
    
    Route::middleware('admin')->group(function () {
        
        // Countries (Admin CRUD)
        Route::post('/countries', [CountryController::class, 'store']);
        Route::put('/countries/{id}', [CountryController::class, 'update']);
        Route::delete('/countries/{id}', [CountryController::class, 'destroy']);

        // Categories (Admin CRUD)
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{id}', [CategoryController::class, 'update']);
        Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

        // Laws (Admin CRUD)
        Route::post('/laws', [LawController::class, 'store']);
        Route::put('/laws/{id}', [LawController::class, 'update']);
        Route::delete('/laws/{id}', [LawController::class, 'destroy']);

        // Users (Admin management)
        Route::get('/users', [UserController::class, 'index']);
        Route::get('/users/{id}', [UserController::class, 'show']);
        Route::put('/users/{id}', [UserController::class, 'update']);
        Route::delete('/users/{id}', [UserController::class, 'destroy']);
        Route::patch('/users/{id}/role', [UserController::class, 'updateRole']);

        // Messages (Admin management)
        Route::get('/messages', [MessageController::class, 'index']);
        Route::get('/messages/{id}', [MessageController::class, 'show']);
        Route::post('/messages/{id}/reply', [MessageController::class, 'reply']);
        Route::patch('/messages/{id}/read', [MessageController::class, 'markAsRead']);
        Route::delete('/messages/{id}', [MessageController::class, 'destroy']);

        // Settings (Admin management)
        Route::put('/settings', [SettingController::class, 'update']);
        Route::post('/settings/logo', [SettingController::class, 'uploadLogo']);

        // Dashboard Stats
        Route::get('/stats/dashboard', [StatsController::class, 'dashboard']);
        Route::get('/stats/users/{id}', [StatsController::class, 'userStats']);
    });
});

