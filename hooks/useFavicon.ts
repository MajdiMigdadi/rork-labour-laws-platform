import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useSettings } from '@/contexts/SettingsContext';

export function useFavicon() {
  const { settings } = useSettings();

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    
    const favicon = settings.favicon;
    if (!favicon) return;

    // Find existing favicon link or create new one
    let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
    
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    
    // Update favicon
    link.type = 'image/png';
    link.href = favicon;

    // Also update apple-touch-icon for iOS
    let appleIcon: HTMLLinkElement | null = document.querySelector("link[rel='apple-touch-icon']");
    if (!appleIcon) {
      appleIcon = document.createElement('link');
      appleIcon.rel = 'apple-touch-icon';
      document.head.appendChild(appleIcon);
    }
    appleIcon.href = favicon;

    console.log('🎨 Favicon updated from settings');
  }, [settings.favicon]);
}

