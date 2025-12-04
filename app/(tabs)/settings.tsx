import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Settings,
  Type,
  Moon,
  Sun,
  Monitor,
  ChevronRight,
  Bell,
  Globe,
  Shield,
  HelpCircle,
  Info,
  Palette,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFontSize, FontSizeLevel } from '@/contexts/FontSizeContext';
import { useThemeMode, ThemeMode } from '@/contexts/ThemeContext';
import * as Haptics from 'expo-haptics';

export default function SettingsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t, isRTL, language, changeLanguage } = useLanguage();
  const { fontSizeLevel, setFontSizeLevel, fontSize } = useFontSize();
  const { themeMode, setThemeMode, isDark } = useThemeMode();

  const fontSizes: { level: FontSizeLevel; label: string; size: string }[] = [
    { level: 'small', label: t.small || 'Small', size: 'A' },
    { level: 'medium', label: t.medium || 'Medium', size: 'A' },
    { level: 'large', label: t.large || 'Large', size: 'A' },
    { level: 'xlarge', label: t.extraLarge || 'Extra Large', size: 'A' },
  ];

  const themes: { mode: ThemeMode; label: string; icon: any }[] = [
    { mode: 'light', label: t.light || 'Light', icon: Sun },
    { mode: 'dark', label: t.dark || 'Dark', icon: Moon },
    { mode: 'system', label: t.system || 'System', icon: Monitor },
  ];

  const handleFontSizeChange = (level: FontSizeLevel) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFontSizeLevel(level);
  };

  const handleThemeChange = (mode: ThemeMode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setThemeMode(mode);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <LinearGradient colors={['#6366f1', '#8b5cf6']} style={styles.headerIcon}>
          <Settings size={22} color="#fff" />
        </LinearGradient>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {t.settings || 'Settings'}
        </Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Font Size Section */}
        <View style={styles.section}>
          <View style={[styles.sectionHeader, isRTL && styles.rtl]}>
            <Type size={18} color="#6366f1" />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {t.fontSize || 'Font Size'}
            </Text>
          </View>
          
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            {/* Preview Text */}
            <View style={[styles.previewBox, { backgroundColor: theme.backgroundSecondary }]}>
              <Text style={[styles.previewText, { color: theme.text, fontSize: fontSize.base }]}>
                {t.previewText || 'Preview text - نص المعاينة'}
              </Text>
            </View>
            
            {/* Font Size Options */}
            <View style={styles.fontSizeGrid}>
              {fontSizes.map((item, index) => (
                <TouchableOpacity
                  key={item.level}
                  style={[
                    styles.fontSizeOption,
                    fontSizeLevel === item.level && styles.fontSizeOptionActive,
                  ]}
                  onPress={() => handleFontSizeChange(item.level)}
                >
                  <Text style={[
                    styles.fontSizeIcon,
                    { fontSize: 14 + (index * 4) },
                    fontSizeLevel === item.level && styles.fontSizeIconActive,
                  ]}>
                    {item.size}
                  </Text>
                  <Text style={[
                    styles.fontSizeLabel,
                    fontSizeLevel === item.level && styles.fontSizeLabelActive,
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Theme Section */}
        <View style={styles.section}>
          <View style={[styles.sectionHeader, isRTL && styles.rtl]}>
            <Palette size={18} color="#f59e0b" />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {t.theme || 'Theme'}
            </Text>
          </View>
          
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <View style={styles.themeGrid}>
              {themes.map((item) => {
                const IconComponent = item.icon;
                const isSelected = themeMode === item.mode;
                
                return (
                  <TouchableOpacity
                    key={item.mode}
                    style={[
                      styles.themeOption,
                      isSelected && styles.themeOptionActive,
                    ]}
                    onPress={() => handleThemeChange(item.mode)}
                  >
                    <View style={[
                      styles.themeIconBg,
                      { backgroundColor: isSelected ? '#6366f1' : theme.backgroundSecondary }
                    ]}>
                      <IconComponent size={22} color={isSelected ? '#fff' : theme.textSecondary} />
                    </View>
                    <Text style={[
                      styles.themeLabel,
                      { color: isSelected ? '#6366f1' : theme.textSecondary },
                    ]}>
                      {item.label}
                    </Text>
                    {isSelected && (
                      <View style={styles.themeCheck}>
                        <Text style={styles.themeCheckIcon}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Language Section */}
        <View style={styles.section}>
          <View style={[styles.sectionHeader, isRTL && styles.rtl]}>
            <Globe size={18} color="#10b981" />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {t.language || 'Language'}
            </Text>
          </View>
          
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <View style={styles.languageOptions}>
              <TouchableOpacity
                style={[
                  styles.languageOption,
                  language === 'en' && styles.languageOptionActive,
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  changeLanguage('en');
                }}
              >
                <Text style={styles.languageFlag}>🇺🇸</Text>
                <Text style={[
                  styles.languageLabel,
                  language === 'en' && styles.languageLabelActive,
                ]}>
                  English
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.languageOption,
                  language === 'ar' && styles.languageOptionActive,
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  changeLanguage('ar');
                }}
              >
                <Text style={styles.languageFlag}>🇸🇦</Text>
                <Text style={[
                  styles.languageLabel,
                  language === 'ar' && styles.languageLabelActive,
                ]}>
                  العربية
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Other Settings */}
        <View style={styles.section}>
          <View style={[styles.sectionHeader, isRTL && styles.rtl]}>
            <Settings size={18} color={theme.textSecondary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {t.more || 'More'}
            </Text>
          </View>
          
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <TouchableOpacity 
              style={[styles.menuItem, isRTL && styles.rtl]}
              onPress={() => router.push('/(tabs)/notifications')}
            >
              <View style={[styles.menuItemLeft, isRTL && styles.rtl]}>
                <View style={[styles.menuItemIcon, { backgroundColor: '#fef3c7' }]}>
                  <Bell size={18} color="#f59e0b" />
                </View>
                <Text style={[styles.menuItemLabel, { color: theme.text }]}>
                  {t.notifications || 'Notifications'}
                </Text>
              </View>
              <ChevronRight size={18} color={theme.textSecondary} style={isRTL && { transform: [{ rotate: '180deg' }] }} />
            </TouchableOpacity>

            <View style={[styles.menuDivider, { backgroundColor: theme.backgroundSecondary }]} />

            <TouchableOpacity style={[styles.menuItem, isRTL && styles.rtl]}>
              <View style={[styles.menuItemLeft, isRTL && styles.rtl]}>
                <View style={[styles.menuItemIcon, { backgroundColor: '#ecfdf5' }]}>
                  <Shield size={18} color="#10b981" />
                </View>
                <Text style={[styles.menuItemLabel, { color: theme.text }]}>
                  {t.privacy || 'Privacy'}
                </Text>
              </View>
              <ChevronRight size={18} color={theme.textSecondary} style={isRTL && { transform: [{ rotate: '180deg' }] }} />
            </TouchableOpacity>

            <View style={[styles.menuDivider, { backgroundColor: theme.backgroundSecondary }]} />

            <TouchableOpacity style={[styles.menuItem, isRTL && styles.rtl]}>
              <View style={[styles.menuItemLeft, isRTL && styles.rtl]}>
                <View style={[styles.menuItemIcon, { backgroundColor: '#eef2ff' }]}>
                  <HelpCircle size={18} color="#6366f1" />
                </View>
                <Text style={[styles.menuItemLabel, { color: theme.text }]}>
                  {t.help || 'Help & Support'}
                </Text>
              </View>
              <ChevronRight size={18} color={theme.textSecondary} style={isRTL && { transform: [{ rotate: '180deg' }] }} />
            </TouchableOpacity>

            <View style={[styles.menuDivider, { backgroundColor: theme.backgroundSecondary }]} />

            <TouchableOpacity style={[styles.menuItem, isRTL && styles.rtl]}>
              <View style={[styles.menuItemLeft, isRTL && styles.rtl]}>
                <View style={[styles.menuItemIcon, { backgroundColor: '#f3f4f6' }]}>
                  <Info size={18} color="#6b7280" />
                </View>
                <Text style={[styles.menuItemLabel, { color: theme.text }]}>
                  {t.about || 'About'}
                </Text>
              </View>
              <ChevronRight size={18} color={theme.textSecondary} style={isRTL && { transform: [{ rotate: '180deg' }] }} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Version Info */}
        <Text style={[styles.version, { color: theme.textSecondary }]}>
          {t.version || 'Version'} 1.0.0
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  previewBox: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  previewText: {
    fontWeight: '500',
  },
  fontSizeGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  fontSizeOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  fontSizeOptionActive: {
    backgroundColor: '#6366f1',
  },
  fontSizeIcon: {
    fontWeight: '700',
    color: '#6b7280',
    marginBottom: 4,
  },
  fontSizeIconActive: {
    color: '#fff',
  },
  fontSizeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
  },
  fontSizeLabelActive: {
    color: '#fff',
  },
  themeGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  themeOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    position: 'relative',
  },
  themeOptionActive: {
    backgroundColor: '#eef2ff',
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  themeIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  themeLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  themeCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeCheckIcon: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  languageOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  languageOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
  },
  languageOptionActive: {
    backgroundColor: '#ecfdf5',
    borderWidth: 2,
    borderColor: '#10b981',
  },
  languageFlag: {
    fontSize: 20,
  },
  languageLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  languageLabelActive: {
    color: '#10b981',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
    marginVertical: 4,
  },
  version: {
    textAlign: 'center',
    fontSize: 13,
    marginTop: 16,
  },
  rtl: {
    flexDirection: 'row-reverse',
  },
});

