import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Image,
} from 'react-native';
import { X } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useSettings } from '@/contexts/SettingsContext';
import { AppSettings } from '@/types';
import { useTheme } from '@/hooks/useTheme';

interface SettingsEditorModalProps {
  visible: boolean;
  onClose: () => void;
}

type ColorPreset = {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
};

const colorPresets: ColorPreset[] = [
  { name: 'Teal', primary: '#0f766e', secondary: '#14b8a6', accent: '#2dd4bf' },
  { name: 'Blue', primary: '#2563eb', secondary: '#3b82f6', accent: '#60a5fa' },
  { name: 'Purple', primary: '#7c3aed', secondary: '#8b5cf6', accent: '#a78bfa' },
  { name: 'Green', primary: '#059669', secondary: '#10b981', accent: '#34d399' },
  { name: 'Orange', primary: '#ea580c', secondary: '#f97316', accent: '#fb923c' },
  { name: 'Pink', primary: '#db2777', secondary: '#ec4899', accent: '#f472b6' },
  { name: 'Indigo', primary: '#4f46e5', secondary: '#6366f1', accent: '#818cf8' },
  { name: 'Red', primary: '#dc2626', secondary: '#ef4444', accent: '#f87171' },
];

export default function SettingsEditorModal({
  visible,
  onClose,
}: SettingsEditorModalProps) {
  const { settings, updateSettings } = useSettings();
  const theme = useTheme();
  const [formData, setFormData] = useState<AppSettings>(settings);

  useEffect(() => {
    if (visible) {
      setFormData(settings);
    }
  }, [visible, settings]);

  const handleSave = async () => {
    const success = await updateSettings(formData);
    if (success) {
      Alert.alert('Success', 'Settings updated successfully!');
      onClose();
    } else {
      Alert.alert('Error', 'Failed to update settings');
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to defaults?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setFormData({
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
            });
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Edit Platform Settings</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={Colors.light.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>General Information</Text>
            <View style={styles.field}>
              <Text style={styles.label}>App Name</Text>
              <TextInput
                style={styles.input}
                value={formData.appName}
                onChangeText={(text) => setFormData({ ...formData, appName: text })}
                placeholder="Enter app name"
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>App Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.appDescription}
                onChangeText={(text) => setFormData({ ...formData, appDescription: text })}
                placeholder="Enter app description"
                multiline
                numberOfLines={3}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Logo URL</Text>
              <TextInput
                style={styles.input}
                value={formData.logo || ''}
                onChangeText={(text) => setFormData({ ...formData, logo: text })}
                placeholder="https://example.com/logo.png or https://images.unsplash.com/..."
                placeholderTextColor={Colors.light.textSecondary}
              />
              <Text style={styles.helpText}>Use a URL from Unsplash, Imgur, or any public image hosting</Text>
              {formData.logo && (
                <View style={styles.imagePreviewContainer}>
                  <Text style={styles.previewLabel}>Logo Preview:</Text>
                  <Image
                    source={{ uri: formData.logo }}
                    style={styles.imagePreview}
                    resizeMode="contain"
                  />
                  <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={() => setFormData({ ...formData, logo: '' })}
                  >
                    <Text style={[styles.removeButtonText, { color: Colors.light.error }]}>Remove Logo</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Favicon URL</Text>
              <TextInput
                style={styles.input}
                value={formData.favicon || ''}
                onChangeText={(text) => setFormData({ ...formData, favicon: text })}
                placeholder="https://example.com/favicon.png"
                placeholderTextColor={Colors.light.textSecondary}
              />
              <Text style={styles.helpText}>Use a URL from Unsplash, Imgur, or any public image hosting</Text>
              {formData.favicon && (
                <View style={styles.imagePreviewContainer}>
                  <Text style={styles.previewLabel}>Favicon Preview:</Text>
                  <Image
                    source={{ uri: formData.favicon }}
                    style={styles.faviconPreview}
                    resizeMode="contain"
                  />
                  <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={() => setFormData({ ...formData, favicon: '' })}
                  >
                    <Text style={[styles.removeButtonText, { color: Colors.light.error }]}>Remove Favicon</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Brand Colors</Text>
            <View style={styles.presetsContainer}>
              <Text style={styles.presetsLabel}>Quick Presets:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetsScroll}>
                {colorPresets.map((preset) => (
                  <TouchableOpacity
                    key={preset.name}
                    style={styles.presetButton}
                    onPress={() => setFormData({
                      ...formData,
                      primaryColor: preset.primary,
                      secondaryColor: preset.secondary,
                      accentColor: preset.accent,
                    })}
                  >
                    <View style={styles.presetColors}>
                      <View style={[styles.presetColorDot, { backgroundColor: preset.primary }]} />
                      <View style={[styles.presetColorDot, { backgroundColor: preset.secondary }]} />
                      <View style={[styles.presetColorDot, { backgroundColor: preset.accent }]} />
                    </View>
                    <Text style={styles.presetName}>{preset.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Primary Color</Text>
              <View style={styles.colorRow}>
                <TextInput
                  style={styles.input}
                  value={formData.primaryColor}
                  onChangeText={(text) => setFormData({ ...formData, primaryColor: text })}
                  placeholder="#007AFF"
                />
                <View style={[styles.colorPreview, { backgroundColor: formData.primaryColor }]} />
              </View>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Secondary Color</Text>
              <View style={styles.colorRow}>
                <TextInput
                  style={styles.input}
                  value={formData.secondaryColor}
                  onChangeText={(text) => setFormData({ ...formData, secondaryColor: text })}
                  placeholder="#34C759"
                />
                <View style={[styles.colorPreview, { backgroundColor: formData.secondaryColor }]} />
              </View>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Accent Color</Text>
              <View style={styles.colorRow}>
                <TextInput
                  style={styles.input}
                  value={formData.accentColor}
                  onChangeText={(text) => setFormData({ ...formData, accentColor: text })}
                  placeholder="#FF9500"
                />
                <View style={[styles.colorPreview, { backgroundColor: formData.accentColor }]} />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SEO Settings</Text>
            <View style={styles.field}>
              <Text style={styles.label}>SEO Title</Text>
              <TextInput
                style={styles.input}
                value={formData.seoTitle}
                onChangeText={(text) => setFormData({ ...formData, seoTitle: text })}
                placeholder="Enter SEO title"
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>SEO Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.seoDescription}
                onChangeText={(text) => setFormData({ ...formData, seoDescription: text })}
                placeholder="Enter SEO description"
                multiline
                numberOfLines={3}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>SEO Keywords</Text>
              <TextInput
                style={styles.input}
                value={formData.seoKeywords}
                onChangeText={(text) => setFormData({ ...formData, seoKeywords: text })}
                placeholder="keyword1, keyword2, keyword3"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            <View style={styles.field}>
              <Text style={styles.label}>Support Email</Text>
              <TextInput
                style={styles.input}
                value={formData.supportEmail}
                onChangeText={(text) => setFormData({ ...formData, supportEmail: text })}
                placeholder="support@example.com"
                keyboardType="email-address"
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>SMTP Host (Optional)</Text>
              <TextInput
                style={styles.input}
                value={formData.smtpHost || ''}
                onChangeText={(text) => setFormData({ ...formData, smtpHost: text })}
                placeholder="smtp.example.com"
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>SMTP Port (Optional)</Text>
              <TextInput
                style={styles.input}
                value={formData.smtpPort !== undefined ? formData.smtpPort.toString() : ''}
                onChangeText={(text) => {
                  const port = parseInt(text);
                  setFormData({ ...formData, smtpPort: isNaN(port) ? undefined : port });
                }}
                placeholder="587"
                keyboardType="number-pad"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Footer</Text>
            <View style={styles.field}>
              <Text style={styles.label}>Footer Text</Text>
              <TextInput
                style={styles.input}
                value={formData.footerText}
                onChangeText={(text) => setFormData({ ...formData, footerText: text })}
                placeholder="© 2024 Your Company"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Authentication Settings</Text>
            <Text style={styles.sectionDescription}>Configure social login providers and security features</Text>
            
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Social Login</Text>
              
              <View style={styles.switchField}>
                <Text style={styles.label}>Google Login</Text>
                <Switch
                  value={formData.socialLogin?.google?.enabled || false}
                  onValueChange={(value) => setFormData({
                    ...formData,
                    socialLogin: {
                      ...formData.socialLogin,
                      google: { ...formData.socialLogin?.google, enabled: value },
                    },
                  })}
                  trackColor={{ false: Colors.light.border, true: theme.primary }}
                />
              </View>
              {formData.socialLogin?.google?.enabled && (
                <>
                  <View style={styles.field}>
                    <Text style={styles.label}>Google Client ID</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.socialLogin?.google?.clientId || ''}
                      onChangeText={(text) => setFormData({
                        ...formData,
                        socialLogin: {
                          ...formData.socialLogin,
                          google: { ...formData.socialLogin?.google, enabled: true, clientId: text },
                        },
                      })}
                      placeholder="Enter Google Client ID"
                      placeholderTextColor={Colors.light.textSecondary}
                    />
                  </View>
                  <View style={styles.field}>
                    <Text style={styles.label}>Google Client Secret</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.socialLogin?.google?.clientSecret || ''}
                      onChangeText={(text) => setFormData({
                        ...formData,
                        socialLogin: {
                          ...formData.socialLogin,
                          google: { ...formData.socialLogin?.google, enabled: true, clientSecret: text },
                        },
                      })}
                      placeholder="Enter Google Client Secret"
                      placeholderTextColor={Colors.light.textSecondary}
                      secureTextEntry
                    />
                  </View>
                </>
              )}

              <View style={styles.switchField}>
                <Text style={styles.label}>Facebook Login</Text>
                <Switch
                  value={formData.socialLogin?.facebook?.enabled || false}
                  onValueChange={(value) => setFormData({
                    ...formData,
                    socialLogin: {
                      ...formData.socialLogin,
                      facebook: { ...formData.socialLogin?.facebook, enabled: value },
                    },
                  })}
                  trackColor={{ false: Colors.light.border, true: theme.primary }}
                />
              </View>
              {formData.socialLogin?.facebook?.enabled && (
                <>
                  <View style={styles.field}>
                    <Text style={styles.label}>Facebook App ID</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.socialLogin?.facebook?.appId || ''}
                      onChangeText={(text) => setFormData({
                        ...formData,
                        socialLogin: {
                          ...formData.socialLogin,
                          facebook: { ...formData.socialLogin?.facebook, enabled: true, appId: text },
                        },
                      })}
                      placeholder="Enter Facebook App ID"
                      placeholderTextColor={Colors.light.textSecondary}
                    />
                  </View>
                  <View style={styles.field}>
                    <Text style={styles.label}>Facebook App Secret</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.socialLogin?.facebook?.appSecret || ''}
                      onChangeText={(text) => setFormData({
                        ...formData,
                        socialLogin: {
                          ...formData.socialLogin,
                          facebook: { ...formData.socialLogin?.facebook, enabled: true, appSecret: text },
                        },
                      })}
                      placeholder="Enter Facebook App Secret"
                      placeholderTextColor={Colors.light.textSecondary}
                      secureTextEntry
                    />
                  </View>
                </>
              )}

              <View style={styles.switchField}>
                <Text style={styles.label}>Apple Login</Text>
                <Switch
                  value={formData.socialLogin?.apple?.enabled || false}
                  onValueChange={(value) => setFormData({
                    ...formData,
                    socialLogin: {
                      ...formData.socialLogin,
                      apple: { ...formData.socialLogin?.apple, enabled: value },
                    },
                  })}
                  trackColor={{ false: Colors.light.border, true: theme.primary }}
                />
              </View>
              {formData.socialLogin?.apple?.enabled && (
                <>
                  <View style={styles.field}>
                    <Text style={styles.label}>Apple Client ID</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.socialLogin?.apple?.clientId || ''}
                      onChangeText={(text) => setFormData({
                        ...formData,
                        socialLogin: {
                          ...formData.socialLogin,
                          apple: { ...formData.socialLogin?.apple, enabled: true, clientId: text },
                        },
                      })}
                      placeholder="Enter Apple Client ID"
                      placeholderTextColor={Colors.light.textSecondary}
                    />
                  </View>
                  <View style={styles.field}>
                    <Text style={styles.label}>Apple Team ID</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.socialLogin?.apple?.teamId || ''}
                      onChangeText={(text) => setFormData({
                        ...formData,
                        socialLogin: {
                          ...formData.socialLogin,
                          apple: { ...formData.socialLogin?.apple, enabled: true, teamId: text },
                        },
                      })}
                      placeholder="Enter Apple Team ID"
                      placeholderTextColor={Colors.light.textSecondary}
                    />
                  </View>
                  <View style={styles.field}>
                    <Text style={styles.label}>Apple Key ID</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.socialLogin?.apple?.keyId || ''}
                      onChangeText={(text) => setFormData({
                        ...formData,
                        socialLogin: {
                          ...formData.socialLogin,
                          apple: { ...formData.socialLogin?.apple, enabled: true, keyId: text },
                        },
                      })}
                      placeholder="Enter Apple Key ID"
                      placeholderTextColor={Colors.light.textSecondary}
                    />
                  </View>
                </>
              )}
            </View>

            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>reCAPTCHA</Text>
              <View style={styles.switchField}>
                <Text style={styles.label}>Enable reCAPTCHA</Text>
                <Switch
                  value={formData.recaptcha?.enabled || false}
                  onValueChange={(value) => setFormData({
                    ...formData,
                    recaptcha: { ...formData.recaptcha, enabled: value },
                  })}
                  trackColor={{ false: Colors.light.border, true: theme.primary }}
                />
              </View>
              {formData.recaptcha?.enabled && (
                <>
                  <View style={styles.field}>
                    <Text style={styles.label}>reCAPTCHA Site Key</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.recaptcha?.siteKey || ''}
                      onChangeText={(text) => setFormData({
                        ...formData,
                        recaptcha: { ...formData.recaptcha, enabled: true, siteKey: text },
                      })}
                      placeholder="Enter reCAPTCHA Site Key"
                      placeholderTextColor={Colors.light.textSecondary}
                    />
                  </View>
                  <View style={styles.field}>
                    <Text style={styles.label}>reCAPTCHA Secret Key</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.recaptcha?.secretKey || ''}
                      onChangeText={(text) => setFormData({
                        ...formData,
                        recaptcha: { ...formData.recaptcha, enabled: true, secretKey: text },
                      })}
                      placeholder="Enter reCAPTCHA Secret Key"
                      placeholderTextColor={Colors.light.textSecondary}
                      secureTextEntry
                    />
                  </View>
                </>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>System Settings</Text>
            <View style={styles.switchField}>
              <Text style={styles.label}>Maintenance Mode</Text>
              <Switch
                value={formData.maintenanceMode}
                onValueChange={(value) => setFormData({ ...formData, maintenanceMode: value })}
                trackColor={{ false: Colors.light.border, true: theme.primary }}
              />
            </View>
            <View style={styles.switchField}>
              <Text style={styles.label}>Allow User Registration</Text>
              <Switch
                value={formData.allowRegistration}
                onValueChange={(value) => setFormData({ ...formData, allowRegistration: value })}
                trackColor={{ false: Colors.light.border, true: theme.primary }}
              />
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>Reset to Defaults</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.primary }]} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.light.text,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginBottom: 16,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.light.text,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  colorPreview: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  switchField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  actions: {
    gap: 12,
    marginBottom: 40,
  },
  resetButton: {
    backgroundColor: Colors.light.card,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.error,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.error,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
  imagePreviewContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.light.textSecondary,
    marginBottom: 8,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  faviconPreview: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  presetsContainer: {
    marginBottom: 20,
  },
  presetsLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginBottom: 12,
  },
  presetsScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  presetButton: {
    marginRight: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: Colors.light.backgroundSecondary,
    borderWidth: 2,
    borderColor: Colors.light.border,
    alignItems: 'center',
    minWidth: 100,
  },
  presetColors: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  presetColorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  presetName: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: Colors.light.text,
    textAlign: 'center',
  },
  helpText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  removeButton: {
    marginTop: 8,
    alignItems: 'center',
    paddingVertical: 8,
  },
  removeButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.light.error,
  },
  sectionDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  subsection: {
    marginTop: 16,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginBottom: 12,
  },
});
