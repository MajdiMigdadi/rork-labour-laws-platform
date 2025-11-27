import { useMemo } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import Colors from '@/constants/colors';

export function useTheme() {
  const { settings } = useSettings();
  const isDark = settings.themeMode === 'dark';
  const colorScheme = isDark ? Colors.dark : Colors.light;

  const theme = useMemo(() => ({
    primary: settings.primaryColor,
    secondary: settings.secondaryColor,
    accent: settings.accentColor,
    background: colorScheme.background,
    backgroundSecondary: colorScheme.backgroundSecondary,
    card: colorScheme.card,
    text: colorScheme.text,
    textSecondary: colorScheme.textSecondary,
    border: colorScheme.border,
    error: colorScheme.error,
    success: colorScheme.success,
    warning: colorScheme.warning,
    shadow: colorScheme.shadow,
    tabIconDefault: colorScheme.tabIconDefault,
    isDark,
  }), [settings.primaryColor, settings.secondaryColor, settings.accentColor, colorScheme, isDark]);

  return theme;
}
