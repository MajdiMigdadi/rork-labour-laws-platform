/**
 * Environment Configuration Example
 * 
 * Copy this file to env.ts and update the values
 */

export const ENV = {
  // API Configuration
  // Change this to your backend URL
  
  // For local development with XAMPP/Laravel:
  API_URL: 'http://localhost:8000/api',
  
  // For production:
  // API_URL: 'https://api.yourdomain.com/api',

  // App Configuration
  APP_NAME: 'Labour Laws Platform',
  APP_VERSION: '1.0.0',

  // Feature Flags
  ENABLE_PUSH_NOTIFICATIONS: true,
  ENABLE_ANALYTICS: false,
  
  // Debug Mode
  DEBUG: true,
};

export default ENV;

