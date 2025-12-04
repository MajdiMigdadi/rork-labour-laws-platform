# 🚀 Quick Backend Installation Guide

## Option 1: Install Fresh Laravel (Recommended)

### Step 1: Create Laravel Project
```bash
cd C:\xampp\htdocs
composer create-project laravel/laravel labourlaw-api
cd labourlaw-api
```

### Step 2: Install Sanctum
```bash
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

### Step 3: Copy Files
Copy these files from `backend/laravel-api/` to your new Laravel project:

```
📁 Your new Laravel project
├── app/
│   ├── Http/
│   │   ├── Controllers/API/     ← Copy all controllers here
│   │   └── Middleware/
│   │       └── AdminMiddleware.php  ← Create this file
│   └── Models/                  ← Copy all models here
├── database/
│   ├── migrations/              ← Copy migrations here
│   └── seeders/
│       └── DatabaseSeeder.php   ← Replace with our seeder
└── routes/
    └── api.php                  ← Replace with our routes
```

### Step 4: Create Database
1. Open phpMyAdmin: http://localhost/phpmyadmin
2. Create new database: `labourlaw_db`

### Step 5: Configure .env
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=labourlaw_db
DB_USERNAME=root
DB_PASSWORD=
```

### Step 6: Create Admin Middleware

Create file: `app/Http/Middleware/AdminMiddleware.php`
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

### Step 7: Register Middleware

For Laravel 11, edit `bootstrap/app.php`:
```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->alias([
        'admin' => \App\Http\Middleware\AdminMiddleware::class,
    ]);
})
```

For Laravel 10, edit `app/Http/Kernel.php`:
```php
protected $middlewareAliases = [
    // ... other aliases
    'admin' => \App\Http\Middleware\AdminMiddleware::class,
];
```

### Step 8: Update User Model

Edit `app/Models/User.php`:
```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'avatar',
        'bio',
        'location',
        'company',
        'reputation',
        'level',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
```

### Step 9: Run Migrations
```bash
php artisan migrate
php artisan db:seed
```

### Step 10: Enable CORS

Edit `config/cors.php`:
```php
'paths' => ['api/*'],
'allowed_origins' => ['*'],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
```

### Step 11: Start Server
```bash
php artisan serve
```

✅ API is now running at: **http://localhost:8000/api**

---

## 🔑 Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@labourlaw.com | admin123 |
| **User** | john@example.com | password |

---

## 📱 Connect Your App

Update `services/api.ts` in your React Native app:

```typescript
const CONFIG = {
  USE_REAL_API: true,
  API_URL: 'http://localhost:8000/api',
};
```

---

## 🧪 Test API

```bash
# Test login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@labourlaw.com","password":"admin123"}'

# Get countries
curl http://localhost:8000/api/countries

# Get laws
curl http://localhost:8000/api/laws
```

---

## 🌐 Deploy to VPS

1. Upload Laravel project to VPS
2. Set up MySQL database
3. Update `.env` with production settings
4. Run migrations: `php artisan migrate --seed`
5. Configure Nginx:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    root /var/www/labourlaw-api/public;

    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

6. Enable HTTPS with Certbot:
```bash
sudo certbot --nginx -d api.yourdomain.com
```

---

## ❓ Need Help?

- Laravel Docs: https://laravel.com/docs
- Sanctum Docs: https://laravel.com/docs/sanctum

