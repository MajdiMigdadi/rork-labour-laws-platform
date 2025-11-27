import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { X, Globe } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useSettings } from '@/contexts/SettingsContext';
import { useTheme } from '@/hooks/useTheme';
import { LanguageSpecificSettings } from '@/types';

interface LanguageSettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function LanguageSettingsModal({
  visible,
  onClose,
}: LanguageSettingsModalProps) {
  const { settings, updateLanguageSettings } = useSettings();
  const theme = useTheme();
  const [activeLanguage, setActiveLanguage] = useState<'en' | 'ar'>('en');
  const [enFormData, setEnFormData] = useState<LanguageSpecificSettings>(settings.languageSettings.en);
  const [arFormData, setArFormData] = useState<LanguageSpecificSettings>(settings.languageSettings.ar);

  useEffect(() => {
    if (visible) {
      setEnFormData(settings.languageSettings.en);
      setArFormData(settings.languageSettings.ar);
    }
  }, [visible, settings]);

  const handleSave = async () => {
    try {
      await updateLanguageSettings('en', enFormData);
      await updateLanguageSettings('ar', arFormData);
      Alert.alert('Success', 'Language settings updated successfully!');
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to update language settings');
    }
  };

  const currentFormData = activeLanguage === 'en' ? enFormData : arFormData;
  const setCurrentFormData = activeLanguage === 'en' ? setEnFormData : setArFormData;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Language-Specific Settings</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={Colors.light.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.languageTabs}>
          <TouchableOpacity
            style={[
              styles.languageTab,
              activeLanguage === 'en' && { ...styles.languageTabActive, backgroundColor: theme.primary, borderColor: theme.primary },
            ]}
            onPress={() => setActiveLanguage('en')}
          >
            <Globe size={16} color={activeLanguage === 'en' ? '#fff' : Colors.light.text} />
            <Text style={[styles.languageTabText, activeLanguage === 'en' && styles.languageTabTextActive]}>
              English
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.languageTab,
              activeLanguage === 'ar' && { ...styles.languageTabActive, backgroundColor: theme.primary, borderColor: theme.primary },
            ]}
            onPress={() => setActiveLanguage('ar')}
          >
            <Globe size={16} color={activeLanguage === 'ar' ? '#fff' : Colors.light.text} />
            <Text style={[styles.languageTabText, activeLanguage === 'ar' && styles.languageTabTextActive]}>
              العربية (Arabic)
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {activeLanguage === 'en' ? 'English Content' : 'Arabic Content (محتوى عربي)'}
            </Text>

            <View style={styles.field}>
              <Text style={styles.label}>App Name</Text>
              <TextInput
                style={[styles.input, activeLanguage === 'ar' && styles.rtlText]}
                value={currentFormData.appName}
                onChangeText={(text) => setCurrentFormData({ ...currentFormData, appName: text })}
                placeholder="Enter app name"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>App Description</Text>
              <TextInput
                style={[styles.input, styles.textArea, activeLanguage === 'ar' && styles.rtlText]}
                value={currentFormData.appDescription}
                onChangeText={(text) => setCurrentFormData({ ...currentFormData, appDescription: text })}
                placeholder="Enter app description"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Footer Text</Text>
              <TextInput
                style={[styles.input, activeLanguage === 'ar' && styles.rtlText]}
                value={currentFormData.footerText}
                onChangeText={(text) => setCurrentFormData({ ...currentFormData, footerText: text })}
                placeholder="© 2024 Your Company"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>SEO Title</Text>
              <TextInput
                style={[styles.input, activeLanguage === 'ar' && styles.rtlText]}
                value={currentFormData.seoTitle}
                onChangeText={(text) => setCurrentFormData({ ...currentFormData, seoTitle: text })}
                placeholder="Enter SEO title"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>SEO Description</Text>
              <TextInput
                style={[styles.input, styles.textArea, activeLanguage === 'ar' && styles.rtlText]}
                value={currentFormData.seoDescription}
                onChangeText={(text) => setCurrentFormData({ ...currentFormData, seoDescription: text })}
                placeholder="Enter SEO description"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>SEO Keywords</Text>
              <TextInput
                style={[styles.input, activeLanguage === 'ar' && styles.rtlText]}
                value={currentFormData.seoKeywords}
                onChangeText={(text) => setCurrentFormData({ ...currentFormData, seoKeywords: text })}
                placeholder="keyword1, keyword2, keyword3"
              />
            </View>
          </View>

          <View style={styles.info}>
            <Text style={styles.infoText}>
              These settings are specific to {activeLanguage === 'en' ? 'English' : 'Arabic'} language.
              They will be displayed when users select this language.
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.primary }]} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save All Languages</Text>
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
  languageTabs: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  languageTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  languageTabActive: {},
  languageTabText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.text,
  },
  languageTabTextActive: {
    color: '#fff',
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
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  info: {
    backgroundColor: Colors.light.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  infoText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  actions: {
    gap: 12,
    marginBottom: 40,
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
});
