import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useSettings } from '@/contexts/SettingsContext';
import { useLanguage } from '@/contexts/LanguageContext';

export function useDocumentTitle() {
  const { settings } = useSettings();
  const { language } = useLanguage();

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    
    // Use Arabic or English app name based on language
    const appName = language === 'ar' 
      ? (settings.appNameAr || settings.appName || 'Labour Laws Platform')
      : (settings.appName || 'Labour Laws Platform');
    
    if (appName) {
      document.title = appName;
      console.log('📝 Document title updated:', appName);
    }
  }, [settings.appName, settings.appNameAr, language]);
}

