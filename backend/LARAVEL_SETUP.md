# 🔧 Laravel Backend Setup Guide

Since you use XAMPP, Laravel is the perfect backend choice!

## 📦 Step 1: Install Laravel

Open terminal in `C:\xampp\htdocs\` and run:

```bash
composer create-project laravel/laravel labourlaw-api
cd labourlaw-api
```

## 📊 Step 2: Create Database

1. Open phpMyAdmin: http://localhost/phpmyadmin
2. Create database: `labourlaw_db`
3. Update `.env` file:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=labourlaw_db
DB_USERNAME=root
DB_PASSWORD=
```

## 🗄️ Step 3: Create Migrations

Run these commands:

```bash
php artisan make:model Country -m
php artisan make:model Category -m
php artisan make:model Law -m
php artisan make:model Question -m
php artisan make:model Answer -m
php artisan make:model Message -m
php artisan make:model Setting -m
php artisan make:model Favorite -m
```

## 📝 Step 4: Migration Files

### database/migrations/xxxx_create_countries_table.php
```php
Schema::create('countries', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('name_ar')->nullable();
    $table->string('code', 10);
    $table->string('flag')->nullable();
    $table->text('description')->nullable();
    $table->text('description_ar')->nullable();
    $table->boolean('is_active')->default(true);
    $table->timestamps();
});
```

### database/migrations/xxxx_create_categories_table.php
```php
Schema::create('categories', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('name_ar')->nullable();
    $table->string('icon')->nullable();
    $table->text('description')->nullable();
    $table->text('description_ar')->nullable();
    $table->boolean('is_active')->default(true);
    $table->timestamps();
});
```

### database/migrations/xxxx_create_laws_table.php
```php
Schema::create('laws', function (Blueprint $table) {
    $table->id();
    $table->foreignId('country_id')->constrained()->onDelete('cascade');
    $table->foreignId('category_id')->constrained()->onDelete('cascade');
    $table->string('title');
    $table->string('title_ar')->nullable();
    $table->text('content');
    $table->text('content_ar')->nullable();
    $table->string('article_number')->nullable();
    $table->integer('views')->default(0);
    $table->boolean('is_active')->default(true);
    $table->timestamps();
});
```

### database/migrations/xxxx_create_questions_table.php
```php
Schema::create('questions', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->foreignId('country_id')->nullable()->constrained()->onDelete('set null');
    $table->foreignId('category_id')->nullable()->constrained()->onDelete('set null');
    $table->string('title');
    $table->text('content');
    $table->json('tags')->nullable();
    $table->enum('status', ['open', 'answered', 'closed'])->default('open');
    $table->integer('views')->default(0);
    $table->integer('upvotes')->default(0);
    $table->integer('downvotes')->default(0);
    $table->timestamps();
});
```

### database/migrations/xxxx_create_answers_table.php
```php
Schema::create('answers', function (Blueprint $table) {
    $table->id();
    $table->foreignId('question_id')->constrained()->onDelete('cascade');
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->text('content');
    $table->boolean('is_accepted')->default(false);
    $table->integer('upvotes')->default(0);
    $table->integer('downvotes')->default(0);
    $table->timestamps();
});
```

### database/migrations/xxxx_create_messages_table.php
```php
Schema::create('messages', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('email');
    $table->string('subject');
    $table->text('message');
    $table->text('reply')->nullable();
    $table->timestamp('replied_at')->nullable();
    $table->boolean('is_read')->default(false);
    $table->timestamps();
});
```

### database/migrations/xxxx_create_settings_table.php
```php
Schema::create('settings', function (Blueprint $table) {
    $table->id();
    $table->string('key')->unique();
    $table->text('value')->nullable();
    $table->timestamps();
});
```

### Add to users migration (modify existing)
```php
// Add these columns to users table
$table->enum('role', ['user', 'admin'])->default('user');
$table->string('avatar')->nullable();
$table->text('bio')->nullable();
$table->string('location')->nullable();
$table->string('company')->nullable();
$table->integer('reputation')->default(0);
$table->enum('level', ['beginner', 'intermediate', 'expert'])->default('beginner');
```

Run migrations:
```bash
php artisan migrate
```

## 🔐 Step 5: Install Laravel Sanctum (for API auth)

```bash
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate
```

Update `app/Models/User.php`:
```php
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;
    // ...
}
```

## 🛣️ Step 6: Create API Routes

### routes/api.php
```php
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

// Public routes
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);

// Public data
Route::get('/countries', [CountryController::class, 'index']);
Route::get('/countries/{id}', [CountryController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);
Route::get('/laws', [LawController::class, 'index']);
Route::get('/laws/{id}', [LawController::class, 'show']);
Route::get('/questions', [QuestionController::class, 'index']);
Route::get('/questions/{id}', [QuestionController::class, 'show']);
Route::get('/settings', [SettingController::class, 'index']);

// Contact form (public)
Route::post('/messages', [MessageController::class, 'store']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/profile', [AuthController::class, 'profile']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);

    // Questions (create, update own)
    Route::post('/questions', [QuestionController::class, 'store']);
    Route::put('/questions/{id}', [QuestionController::class, 'update']);
    Route::delete('/questions/{id}', [QuestionController::class, 'destroy']);
    Route::post('/questions/{id}/upvote', [QuestionController::class, 'upvote']);
    Route::post('/questions/{id}/downvote', [QuestionController::class, 'downvote']);

    // Answers
    Route::get('/questions/{questionId}/answers', [AnswerController::class, 'index']);
    Route::post('/questions/{questionId}/answers', [AnswerController::class, 'store']);
    Route::post('/questions/{questionId}/answers/{answerId}/accept', [AnswerController::class, 'accept']);

    // Favorites
    Route::get('/favorites/laws', [FavoriteController::class, 'getLaws']);
    Route::get('/favorites/questions', [FavoriteController::class, 'getQuestions']);
    Route::post('/favorites/laws', [FavoriteController::class, 'addLaw']);
    Route::delete('/favorites/laws/{id}', [FavoriteController::class, 'removeLaw']);
    Route::post('/favorites/questions', [FavoriteController::class, 'addQuestion']);
    Route::delete('/favorites/questions/{id}', [FavoriteController::class, 'removeQuestion']);

    // Admin routes
    Route::middleware('admin')->group(function () {
        // Countries
        Route::post('/countries', [CountryController::class, 'store']);
        Route::put('/countries/{id}', [CountryController::class, 'update']);
        Route::delete('/countries/{id}', [CountryController::class, 'destroy']);

        // Categories
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{id}', [CategoryController::class, 'update']);
        Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

        // Laws
        Route::post('/laws', [LawController::class, 'store']);
        Route::put('/laws/{id}', [LawController::class, 'update']);
        Route::delete('/laws/{id}', [LawController::class, 'destroy']);

        // Users
        Route::get('/users', [UserController::class, 'index']);
        Route::get('/users/{id}', [UserController::class, 'show']);
        Route::put('/users/{id}', [UserController::class, 'update']);
        Route::delete('/users/{id}', [UserController::class, 'destroy']);
        Route::patch('/users/{id}/role', [UserController::class, 'updateRole']);

        // Messages
        Route::get('/messages', [MessageController::class, 'index']);
        Route::get('/messages/{id}', [MessageController::class, 'show']);
        Route::post('/messages/{id}/reply', [MessageController::class, 'reply']);
        Route::patch('/messages/{id}/read', [MessageController::class, 'markAsRead']);
        Route::delete('/messages/{id}', [MessageController::class, 'destroy']);

        // Settings
        Route::put('/settings', [SettingController::class, 'update']);
        Route::post('/settings/logo', [SettingController::class, 'uploadLogo']);

        // Stats
        Route::get('/stats/dashboard', [StatsController::class, 'dashboard']);
    });
});
```

## 🔒 Step 7: Create Admin Middleware

```bash
php artisan make:middleware AdminMiddleware
```

### app/Http/Middleware/AdminMiddleware.php
```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if (!$request->user() || $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return $next($request);
    }
}
```

Register in `bootstrap/app.php` (Laravel 11) or `app/Http/Kernel.php` (Laravel 10):
```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->alias([
        'admin' => \App\Http\Middleware\AdminMiddleware::class,
    ]);
})
```

## 📂 Step 8: Create Controllers

```bash
php artisan make:controller API/AuthController
php artisan make:controller API/CountryController --resource
php artisan make:controller API/CategoryController --resource
php artisan make:controller API/LawController --resource
php artisan make:controller API/QuestionController --resource
php artisan make:controller API/AnswerController
php artisan make:controller API/MessageController --resource
php artisan make:controller API/SettingController
php artisan make:controller API/UserController --resource
php artisan make:controller API/FavoriteController
php artisan make:controller API/StatsController
```

## 🌐 Step 9: Enable CORS

```bash
php artisan config:publish cors
```

Update `config/cors.php`:
```php
'paths' => ['api/*'],
'allowed_origins' => ['*'],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
```

## 🚀 Step 10: Run Server

```bash
php artisan serve
```

API will be available at: `http://localhost:8000/api`

## 📱 Step 11: Update React Native App

In `services/api.ts`, change:
```typescript
const API_BASE_URL = 'http://localhost:8000/api';
// or for network access:
const API_BASE_URL = 'http://YOUR_LOCAL_IP:8000/api';
```

## ✅ Checklist

- [ ] Laravel installed
- [ ] Database created
- [ ] Migrations run
- [ ] Sanctum configured
- [ ] Controllers created
- [ ] Routes defined
- [ ] CORS enabled
- [ ] Admin middleware added
- [ ] Seed initial data

## 🌱 Optional: Seed Initial Data

```bash
php artisan make:seeder DatabaseSeeder
```

Then add sample countries, categories, and an admin user!

