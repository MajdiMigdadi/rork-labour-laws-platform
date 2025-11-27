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

export default function CountryFormModal({ visible, onClose, onSave, country }: CountryFormModalProps) {
  const { t, isRTL } = useLanguage();
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [code, setCode] = useState('');
  const [flag, setFlag] = useState('');
  const [loading, setLoading] = useState(false);

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
        flag 
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
                placeholder="US, GB, etc."
                placeholderTextColor={Colors.light.textSecondary}
                autoCapitalize="characters"
                maxLength={2}
                textAlign={isRTL ? 'right' : 'left'}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, isRTL && styles.rtl]}>{t.countryFlag}</Text>
              <TextInput
                style={[styles.input, isRTL && styles.rtl]}
                value={flag}
                onChangeText={setFlag}
                placeholder="🇺🇸"
                placeholderTextColor={Colors.light.textSecondary}
                textAlign={isRTL ? 'right' : 'left'}
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
});
