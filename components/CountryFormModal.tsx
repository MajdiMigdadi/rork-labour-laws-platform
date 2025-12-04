import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Country } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface CountryFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: Omit<Country, 'id' | 'lawCount'>) => Promise<void>;
  country?: Country;
}

// Common country flags for quick selection
const COMMON_FLAGS = [
  { code: 'SA', flag: '🇸🇦' },
  { code: 'AE', flag: '🇦🇪' },
  { code: 'EG', flag: '🇪🇬' },
  { code: 'QA', flag: '🇶🇦' },
  { code: 'KW', flag: '🇰🇼' },
  { code: 'OM', flag: '🇴🇲' },
  { code: 'BH', flag: '🇧🇭' },
  { code: 'JO', flag: '🇯🇴' },
  { code: 'LB', flag: '🇱🇧' },
  { code: 'US', flag: '🇺🇸' },
  { code: 'GB', flag: '🇬🇧' },
  { code: 'CA', flag: '🇨🇦' },
  { code: 'DE', flag: '🇩🇪' },
  { code: 'FR', flag: '🇫🇷' },
  { code: 'AU', flag: '🇦🇺' },
  { code: 'JP', flag: '🇯🇵' },
  { code: 'IN', flag: '🇮🇳' },
  { code: 'CN', flag: '🇨🇳' },
  { code: 'BR', flag: '🇧🇷' },
  { code: 'IT', flag: '🇮🇹' },
  { code: 'ES', flag: '🇪🇸' },
  { code: 'NL', flag: '🇳🇱' },
  { code: 'KR', flag: '🇰🇷' },
  { code: 'MX', flag: '🇲🇽' },
  { code: 'RU', flag: '🇷🇺' },
  { code: 'ZA', flag: '🇿🇦' },
  { code: 'SE', flag: '🇸🇪' },
  { code: 'CH', flag: '🇨🇭' },
  { code: 'PL', flag: '🇵🇱' },
  { code: 'TR', flag: '🇹🇷' },
  { code: 'SG', flag: '🇸🇬' },
  { code: 'MY', flag: '🇲🇾' },
  { code: 'TH', flag: '🇹🇭' },
  { code: 'PH', flag: '🇵🇭' },
  { code: 'ID', flag: '🇮🇩' },
  { code: 'PK', flag: '🇵🇰' },
];

export default function CountryFormModal({ visible, onClose, onSave, country }: CountryFormModalProps) {
  const { t, isRTL } = useLanguage();
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [code, setCode] = useState('');
  const [flag, setFlag] = useState('');
  const [loading, setLoading] = useState(false);
  const [showFlagPicker, setShowFlagPicker] = useState(false);

  useEffect(() => {
    if (country) {
      setNameEn(country.nameTranslations?.en || country.name);
      setNameAr(country.nameTranslations?.ar || '');
      setCode(country.code);
      setFlag(country.flag);
    } else {
      setNameEn('');
      setNameAr('');
      setCode('');
      setFlag('');
    }
    setShowFlagPicker(false);
  }, [country, visible]);

  const handleSave = async () => {
    if (!nameEn || !code || !flag) return;
    
    setLoading(true);
    try {
      await onSave({ 
        name: nameEn,
        nameTranslations: {
          en: nameEn,
          ar: nameAr || nameEn,
        },
        code, 
        flag,
      });
      onClose();
    } catch (error) {
      console.error('Failed to save country:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {country ? t.editCountry : t.addCountry}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={Colors.light.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <View style={styles.formGroup}>
              <Text style={[styles.label, isRTL && styles.rtl]}>{t.countryName} (English)</Text>
              <TextInput
                style={[styles.input, isRTL && styles.rtl]}
                value={nameEn}
                onChangeText={setNameEn}
                placeholder="Country name in English"
                placeholderTextColor={Colors.light.textSecondary}
                textAlign={isRTL ? 'right' : 'left'}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, isRTL && styles.rtl]}>{t.countryName} (العربية)</Text>
              <TextInput
                style={[styles.input, isRTL && styles.rtl]}
                value={nameAr}
                onChangeText={setNameAr}
                placeholder="اسم الدولة بالعربية"
                placeholderTextColor={Colors.light.textSecondary}
                textAlign="right"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, isRTL && styles.rtl]}>{t.countryCode}</Text>
              <TextInput
                style={[styles.input, isRTL && styles.rtl]}
                value={code}
                onChangeText={setCode}
                placeholder="US, GB, SA, etc."
                placeholderTextColor={Colors.light.textSecondary}
                autoCapitalize="characters"
                maxLength={2}
                textAlign={isRTL ? 'right' : 'left'}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, isRTL && styles.rtl]}>{t.countryFlag}</Text>
              
              {/* Selected Flag Display */}
              <TouchableOpacity 
                style={styles.flagSelector}
                onPress={() => setShowFlagPicker(!showFlagPicker)}
              >
                <Text style={styles.selectedFlag}>{flag || '🏳️'}</Text>
                <Text style={styles.selectFlagText}>
                  {flag ? 'Change Flag' : 'Select Flag'}
                </Text>
              </TouchableOpacity>
              
              {/* Flag Picker Grid */}
              {showFlagPicker && (
                <View style={styles.flagPickerContainer}>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.flagPickerScroll}
                  >
                    {COMMON_FLAGS.map((item) => (
                      <TouchableOpacity
                        key={item.code}
                        style={[
                          styles.flagOption,
                          flag === item.flag && styles.flagOptionSelected
                        ]}
                        onPress={() => {
                          setFlag(item.flag);
                          if (!code) setCode(item.code);
                          setShowFlagPicker(false);
                        }}
                      >
                        <Text style={styles.flagEmoji}>{item.flag}</Text>
                        <Text style={styles.flagCode}>{item.code}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
              
              {/* Manual Flag Input */}
              <TextInput
                style={[styles.input, styles.flagInput]}
                value={flag}
                onChangeText={setFlag}
                placeholder="Or paste flag emoji here 🏳️"
                placeholderTextColor={Colors.light.textSecondary}
                textAlign="center"
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>{t.cancel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton, loading && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={loading || !nameEn || !code || !flag}
            >
              <Text style={styles.saveButtonText}>{t.save}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.light.text,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  rtl: {
    textAlign: 'right',
  },
  input: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.light.backgroundSecondary,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.text,
  },
  saveButton: {
    backgroundColor: Colors.light.primary,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  flagSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 12,
  },
  selectedFlag: {
    fontSize: 32,
  },
  selectFlagText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  flagPickerContainer: {
    marginTop: 12,
    marginBottom: 8,
  },
  flagPickerScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  flagOption: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 10,
    backgroundColor: Colors.light.backgroundSecondary,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 56,
  },
  flagOptionSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: '#eef2ff',
  },
  flagEmoji: {
    fontSize: 28,
  },
  flagCode: {
    fontSize: 10,
    color: Colors.light.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  flagInput: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 20,
  },
});
