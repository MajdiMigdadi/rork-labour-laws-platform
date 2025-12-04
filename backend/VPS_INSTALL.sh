#!/bin/bash
# ================================================
# Labour Laws API - VPS Installation Script
# For CyberPanel / Ubuntu Server
# ================================================

echo "🚀 Starting Labour Laws API Installation..."
echo ""

# Step 1: Install Composer if not installed
if ! command -v composer &> /dev/null; then
    echo "📦 Installing Composer..."
    curl -sS https://getcomposer.org/installer | php
    mv composer.phar /usr/local/bin/composer
    chmod +x /usr/local/bin/composer
fi

# Step 2: Create Laravel Project
echo "📁 Creating Laravel project..."
composer create-project laravel/laravel api --no-interaction

# Step 3: Navigate to project
cd api

# Step 4: Install Sanctum
echo "🔐 Installing Laravel Sanctum..."
composer require laravel/sanctum --no-interaction

# Step 5: Publish Sanctum config
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"

# Step 6: Set permissions
echo "🔒 Setting permissions..."
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

echo ""
echo "✅ Laravel installed! Now configure the database..."
echo ""

