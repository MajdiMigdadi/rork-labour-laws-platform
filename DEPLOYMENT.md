# 🚀 Deployment Guide - Labour Laws App

## 📋 Prerequisites

### 1. Install Required Tools
```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo
eas login
```

### 2. Create Expo Account
- Go to https://expo.dev and create an account

---

## 🌐 Part 1: Deploy to VPS (Web Version)

### Option A: Static Export (Recommended for VPS)

```bash
# Build for web
npm run build:web

# This creates a 'dist' folder with static files
```

Upload the `dist` folder to your VPS and serve with Nginx:

```nginx
# /etc/nginx/sites-available/labourlaw
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/labourlaw/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Option B: Using PM2 + Express

```bash
# Install serve globally on VPS
npm install -g serve

# Run the app
serve -s dist -l 3000

# Or with PM2 for process management
pm2 serve dist 3000 --spa
```

---

## 📱 Part 2: Build Android App

### Step 1: Configure EAS
```bash
# Initialize EAS project
eas build:configure
```

### Step 2: Build APK (for testing)
```bash
npm run build:android
# or
eas build -p android --profile preview
```

### Step 3: Build AAB (for Play Store)
```bash
npm run build:android:prod
# or
eas build -p android --profile production
```

### Step 4: Submit to Play Store
```bash
npm run submit:android
```

**Requirements for Play Store:**
- Google Play Developer Account ($25 one-time)
- App icons (512x512)
- Feature graphic (1024x500)
- Screenshots
- Privacy Policy URL

---

## 🍎 Part 3: Build iOS App

### Step 1: Requirements
- Apple Developer Account ($99/year)
- Mac computer (for final submission)

### Step 2: Build for TestFlight
```bash
npm run build:ios
# or
eas build -p ios --profile preview
```

### Step 3: Build for App Store
```bash
npm run build:ios:prod
# or
eas build -p ios --profile production
```

### Step 4: Submit to App Store
```bash
npm run submit:ios
```

**Requirements for App Store:**
- Apple Developer Account
- App icons (1024x1024)
- Screenshots for all device sizes
- Privacy Policy URL
- App description

---

## ⚠️ CRITICAL: Backend Setup Required!

### Current Problem
The app uses **mock data in memory**. This means:
- Data is lost when app restarts
- No real database
- Admin changes don't persist

### Solution: Create a Real Backend

#### Option 1: Node.js + Express + MongoDB
```javascript
// Example API structure
POST /api/auth/login
POST /api/auth/register
GET  /api/laws
POST /api/laws (admin)
GET  /api/questions
POST /api/questions
// etc.
```

#### Option 2: Laravel PHP
```php
// Use Laravel for backend API
php artisan make:model Law -mcr
php artisan make:model Question -mcr
// etc.
```

#### Option 3: Firebase (Easiest)
```bash
npm install firebase
```
- Firestore for database
- Firebase Auth for authentication
- Firebase Storage for images

---

## 🔧 Environment Variables

Create `.env` file:
```env
# API Configuration
API_URL=https://api.yourdomain.com

# For Firebase (if using)
FIREBASE_API_KEY=your_key
FIREBASE_AUTH_DOMAIN=your_domain
FIREBASE_PROJECT_ID=your_project

# For Push Notifications
EXPO_PUBLIC_PROJECT_ID=your_expo_project_id
```

---

## ✅ Deployment Checklist

### Before Web Deployment
- [ ] Set up real backend/database
- [ ] Configure API endpoints
- [ ] Set up SSL certificate
- [ ] Test all features

### Before Android Release
- [ ] Create app icons (all sizes)
- [ ] Create splash screen
- [ ] Configure `app.json` with real bundle ID
- [ ] Add privacy policy
- [ ] Test on real devices

### Before iOS Release
- [ ] Apple Developer Account active
- [ ] Create App Store Connect listing
- [ ] All screenshots ready
- [ ] Privacy policy URL
- [ ] Test on real iOS devices

---

## 📞 Need Help?

1. **Expo Documentation**: https://docs.expo.dev
2. **EAS Build**: https://docs.expo.dev/build/introduction/
3. **Play Store Guide**: https://support.google.com/googleplay/android-developer
4. **App Store Guide**: https://developer.apple.com/app-store/review/guidelines/

