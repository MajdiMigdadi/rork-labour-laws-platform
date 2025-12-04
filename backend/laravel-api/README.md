# 🔧 Labour Laws API - Laravel Backend

Complete REST API for the Labour Laws Platform mobile app.

## 🚀 Quick Install (5 minutes)

### Step 1: Copy to XAMPP
```bash
# Copy this folder to your XAMPP htdocs
# Final path should be: C:\xampp\htdocs\labourlaw-api
```

### Step 2: Install Dependencies
```bash
cd C:\xampp\htdocs\labourlaw-api
composer install
```

### Step 3: Setup Environment
```bash
copy .env.example .env
php artisan key:generate
```

### Step 4: Configure Database
1. Open **phpMyAdmin**: http://localhost/phpmyadmin
2. Create database: `labourlaw_db`
3. Edit `.env` file:
```env
DB_DATABASE=labourlaw_db
DB_USERNAME=root
DB_PASSWORD=
```

### Step 5: Run Migrations & Seed
```bash
php artisan migrate
php artisan db:seed
```

### Step 6: Start Server
```bash
php artisan serve
```

API is now running at: **http://localhost:8000/api**

---

## 📋 Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@labourlaw.com | admin123 |
| User | john@example.com | password |

---

## 🔗 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/profile` | Get profile |
| PUT | `/api/auth/profile` | Update profile |

### Countries
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/countries` | List all |
| GET | `/api/countries/{id}` | Get one |
| POST | `/api/countries` | Create (Admin) |
| PUT | `/api/countries/{id}` | Update (Admin) |
| DELETE | `/api/countries/{id}` | Delete (Admin) |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List all |
| GET | `/api/categories/{id}` | Get one |
| POST | `/api/categories` | Create (Admin) |
| PUT | `/api/categories/{id}` | Update (Admin) |
| DELETE | `/api/categories/{id}` | Delete (Admin) |

### Laws
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/laws` | List all |
| GET | `/api/laws?country_id=1` | Filter by country |
| GET | `/api/laws?search=wage` | Search |
| GET | `/api/laws/{id}` | Get one |
| POST | `/api/laws` | Create (Admin) |
| PUT | `/api/laws/{id}` | Update (Admin) |
| DELETE | `/api/laws/{id}` | Delete (Admin) |

### Questions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/questions` | List all |
| GET | `/api/questions/{id}` | Get one with answers |
| POST | `/api/questions` | Create (Auth) |
| PUT | `/api/questions/{id}` | Update (Owner) |
| DELETE | `/api/questions/{id}` | Delete (Owner) |
| POST | `/api/questions/{id}/upvote` | Upvote |
| POST | `/api/questions/{id}/downvote` | Downvote |

### Answers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/questions/{id}/answers` | List answers |
| POST | `/api/questions/{id}/answers` | Add answer |
| POST | `/api/.../answers/{id}/accept` | Accept answer |

### Messages (Contact)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/messages` | Send message |
| GET | `/api/messages` | List all (Admin) |
| POST | `/api/messages/{id}/reply` | Reply (Admin) |

### Settings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/settings` | Get settings |
| PUT | `/api/settings` | Update (Admin) |

---

## 🔒 Authentication

Use Bearer Token in headers:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 📱 Connect Mobile App

In your React Native app, update `services/api.ts`:

```typescript
const CONFIG = {
  USE_REAL_API: true,
  API_URL: 'http://YOUR_SERVER_IP:8000/api',
};
```

For Android Emulator use: `http://10.0.2.2:8000/api`
For iOS Simulator use: `http://localhost:8000/api`
For real device use: `http://YOUR_COMPUTER_IP:8000/api`

---

## 🌐 Deploy to VPS

1. Upload files to server
2. Set up MySQL database
3. Configure `.env` with production settings
4. Run: `php artisan migrate --seed`
5. Set up Nginx/Apache virtual host
6. Enable HTTPS with Let's Encrypt

---

## ✅ Features

- ✅ Full REST API
- ✅ JWT Authentication (Sanctum)
- ✅ Admin/User roles
- ✅ Multi-language support (EN/AR)
- ✅ Search & filtering
- ✅ Pagination
- ✅ File uploads
- ✅ CORS enabled
- ✅ Input validation

