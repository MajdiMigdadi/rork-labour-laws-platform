import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings } from '@/types';
import Colors from '@/constants/colors';

const SETTINGS_KEY = '@app_settings';

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

export const [SettingsProvider, useSettings] = createContextHook(() => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
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
          console.error('Invalid data:', stored.substring(0, 100));
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
        console.log('Logo preview:', updates.logo.substring(0, 100));
      }
      
      const newSettings = { ...settings, ...updates };
      const jsonString = JSON.stringify(newSettings);
      console.log('Total settings data length:', jsonString.length);
      
      await AsyncStorage.setItem(SETTINGS_KEY, jsonString);
      setSettings(newSettings);
      
      console.log('Settings saved successfully');
      console.log('New logo in state:', newSettings.logo ? `Yes (${newSettings.logo.length} chars)` : 'No');
      console.log('========================');
      return true;
    } catch (error) {
      console.error('Failed to update settings:', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
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

  return {
    settings,
    isLoading,
    updateSettings,
    updateLanguageSettings,
    resetSettings,
  };
});
