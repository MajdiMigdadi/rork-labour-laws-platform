import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings } from '@/types';
import Colors from '@/constants/colors';
import { API_CONFIG } from '@/services/api';
import { showSuccess } from '@/utils/alert';

const SETTINGS_KEY = '@app_settings';
const API_BASE_URL = API_CONFIG.API_URL;

const defaultSettings: AppSettings = {
  appName: 'Labour Law Hub',
  appDescription: 'Your complete guide to labour laws worldwide',
  primaryColor: Colors.light.primary,
  secondaryColor: Colors.light.secondary,
  accentColor: Colors.light.accent,
  footerText: 'Labour Law Hub © 2024. All rights reserved.',
  seoTitle: 'Labour Law Hub - Global Labour Law Information',
  seoDescription: 'Access comprehensive labour law information from countries worldwide. Ask questions, get expert answers, and stay informed.',
  seoKeywords: 'labour law, employment law, worker rights, legal information',
  supportEmail: 'support@labourlawhub.com',
  socialLinks: {},
  socialLogin: {
    google: { enabled: false },
    facebook: { enabled: false },
    apple: { enabled: false },
  },
  recaptcha: {
    enabled: false,
  },
  maintenanceMode: false,
  allowRegistration: true,
  themeMode: 'light',
  languageSettings: {
    en: {
      appName: 'Labour Law Hub',
      appDescription: 'Your complete guide to labour laws worldwide',
      footerText: 'Labour Law Hub © 2024. All rights reserved.',
      seoTitle: 'Labour Law Hub - Global Labour Law Information',
      seoDescription: 'Access comprehensive labour law information from countries worldwide. Ask questions, get expert answers, and stay informed.',
      seoKeywords: 'labour law, employment law, worker rights, legal information',
    },
    ar: {
      appName: 'مركز قوانين العمل',
      appDescription: 'دليلك الشامل لقوانين العمل في جميع أنحاء العالم',
      footerText: 'مركز قوانين العمل © 2024. جميع الحقوق محفوظة.',
      seoTitle: 'مركز قوانين العمل - معلومات قوانين العمل العالمية',
      seoDescription: 'الوصول إلى معلومات شاملة عن قوانين العمل من دول حول العالم. اطرح الأسئلة، واحصل على إجابات من الخبراء، وابق على اطلاع.',
      seoKeywords: 'قوانين العمل، قانون التوظيف، حقوق العمال، معلومات قانونية',
    },
  },
};

// Helper to make API calls
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
  if (!API_CONFIG.USE_REAL_API) return null;
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      ...options,
    });
    
    if (!response.ok) {
      console.error(`API error ${response.status}`);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    return null;
  }
}

export const [SettingsProvider, useSettings] = createContextHook(() => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Try to load from API first
      if (API_CONFIG.USE_REAL_API) {
        console.log('📡 Loading settings from API...');
        const apiSettings = await apiCall<Record<string, string>>('/settings');
        
        if (apiSettings && Object.keys(apiSettings).length > 0) {
          console.log('✅ Settings loaded from API:', Object.keys(apiSettings).length, 'keys');
          
          // Parse API settings into AppSettings format
          const parsedSettings: Partial<AppSettings> = {};
          
          for (const [key, value] of Object.entries(apiSettings)) {
            try {
              // Try to parse JSON values
              parsedSettings[key as keyof AppSettings] = JSON.parse(value);
            } catch {
              // If not JSON, use as string
              parsedSettings[key as keyof AppSettings] = value as any;
            }
          }
          
          const mergedSettings = { ...defaultSettings, ...parsedSettings };
          setSettings(mergedSettings);
          
          // Cache locally
          await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(mergedSettings));
          setIsLoading(false);
          return;
        }
      }

      // Fallback to local storage
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      console.log('Loading settings from AsyncStorage:', stored ? 'Data found' : 'No data');
      
      if (stored) {
        if (typeof stored !== 'string') {
          console.error('Settings data is not a string, resetting to defaults');
          await AsyncStorage.removeItem(SETTINGS_KEY);
          setSettings(defaultSettings);
          return;
        }
        
        try {
          const parsed = JSON.parse(stored);
          console.log('Settings parsed successfully');
          console.log('Loaded logo:', parsed.logo ? `Found (length: ${parsed.logo.length})` : 'Not set');
          setSettings({ ...defaultSettings, ...parsed });
        } catch (parseError) {
          console.error('Failed to parse settings JSON, resetting to defaults:', parseError);
          await AsyncStorage.removeItem(SETTINGS_KEY);
          setSettings(defaultSettings);
        }
      } else {
        console.log('No stored settings found, using defaults');
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      setSettings(defaultSettings);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<AppSettings>) => {
    try {
      console.log('=== UPDATE SETTINGS ===');
      console.log('Updates received:', Object.keys(updates));
      if (updates.logo) {
        console.log('Logo being saved, length:', updates.logo.length);
      }
      
      const newSettings = { ...settings, ...updates };
      
      // Save to API
      if (API_CONFIG.USE_REAL_API) {
        console.log('📡 Saving settings to API...');
        const apiPayload: Record<string, string> = {};
        
        for (const [key, value] of Object.entries(updates)) {
          // Stringify complex objects
          apiPayload[key] = typeof value === 'object' ? JSON.stringify(value) : String(value);
        }
        
        const result = await apiCall('/settings', {
          method: 'POST',
          body: JSON.stringify(apiPayload),
        });
        
        if (result) {
          console.log('✅ Settings saved to API');
        }
      }
      
      // Save to local storage
      const jsonString = JSON.stringify(newSettings);
      console.log('Total settings data length:', jsonString.length);
      
      await AsyncStorage.setItem(SETTINGS_KEY, jsonString);
      setSettings(newSettings);
      
      console.log('Settings saved successfully');
      console.log('========================');
      return true;
    } catch (error) {
      console.error('Failed to update settings:', error);
      showSuccess('Error', 'Failed to save settings. Please try again.');
      return false;
    }
  };

  const updateLanguageSettings = async (language: 'en' | 'ar', updates: Partial<AppSettings['languageSettings']['en']>) => {
    try {
      const newSettings = {
        ...settings,
        languageSettings: {
          ...settings.languageSettings,
          [language]: {
            ...settings.languageSettings[language],
            ...updates,
          },
        },
      };
      
      // Save to API
      if (API_CONFIG.USE_REAL_API) {
        await apiCall('/settings', {
          method: 'POST',
          body: JSON.stringify({
            languageSettings: JSON.stringify(newSettings.languageSettings),
          }),
        });
      }
      
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
      return true;
    } catch (error) {
      console.error('Failed to update language settings:', error);
      return false;
    }
  };

  const resetSettings = async () => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
      setSettings(defaultSettings);
      return true;
    } catch (error) {
      console.error('Failed to reset settings:', error);
      return false;
    }
  };

  const refreshSettings = async () => {
    await loadSettings();
  };

  return {
    settings,
    isLoading,
    updateSettings,
    updateLanguageSettings,
    resetSettings,
    refreshSettings,
  };
});
