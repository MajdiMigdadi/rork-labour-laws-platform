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
import { X, ChevronDown } from 'lucide-react-native';
import { Law } from '@/types';
import { useData } from '@/contexts/DataContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/hooks/useTheme';

interface LawFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: Omit<Law, 'id'>) => Promise<void>;
  law?: Law;
}

export default function LawFormModal({ visible, onClose, onSave, law }: LawFormModalProps) {
  const { t, isRTL } = useLanguage();
  const { countries, categories } = useData();
  const theme = useTheme();
  const [titleEn, setTitleEn] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [contentEn, setContentEn] = useState('');
  const [contentAr, setContentAr] = useState('');
  const [countryId, setCountryId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [source, setSource] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  useEffect(() => {
    if (law) {
      setTitleEn(law.titleTranslations?.en || law.title);
      setTitleAr(law.titleTranslations?.ar || '');
      setDescriptionEn(law.descriptionTranslations?.en || law.description);
      setDescriptionAr(law.descriptionTranslations?.ar || '');
      setContentEn(law.contentTranslations?.en || law.content);
      setContentAr(law.contentTranslations?.ar || '');
      setCountryId(law.countryId);
      setCategoryId(law.categoryId);
      setEffectiveDate(law.effectiveDate);
      setSource(law.source);
    } else {
      setTitleEn('');
      setTitleAr('');
      setDescriptionEn('');
      setDescriptionAr('');
      setContentEn('');
      setContentAr('');
      setCountryId('');
      setCategoryId('');
      setEffectiveDate('');
      setSource('');
    }
  }, [law, visible]);

  const handleSave = async () => {
    if (!titleEn || !descriptionEn || !contentEn || !countryId || !categoryId || !effectiveDate || !source) return;
    
    setLoading(true);
    try {
      await onSave({
        title: titleEn,
        titleTranslations: {
          en: titleEn,
          ar: titleAr || titleEn,
        },
        description: descriptionEn,
        descriptionTranslations: {
          en: descriptionEn,
          ar: descriptionAr || descriptionEn,
        },
        content: contentEn,
        contentTranslations: {
          en: contentEn,
          ar: contentAr || contentEn,
        },
        countryId,
        categoryId,
        effectiveDate,
        lastUpdated: new Date().toISOString().split('T')[0],
        source,
      });
      onClose();
    } catch (error) {
      console.error('Failed to save law:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedCountry = countries.find(c => c.id === countryId);
  const selectedCategory = categories.find(c => c.id === categoryId);

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
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <Text style={[styles.title, { color: theme.text }]}>
              {law ? t.editLaw : t.addLaw}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text }, isRTL && styles.rtl]}>{t.lawTitle} (English)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }, isRTL && styles.rtl]}
                value={titleEn}
                onChangeText={setTitleEn}
                placeholder="Law title in English"
                placeholderTextColor={theme.textSecondary}
                textAlign={isRTL ? 'right' : 'left'}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text }, isRTL && styles.rtl]}>{t.lawTitle} (العربية)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }, isRTL && styles.rtl]}
                value={titleAr}
                onChangeText={setTitleAr}
                placeholder="عنوان القانون بالعربية"
                placeholderTextColor={theme.textSecondary}
                textAlign="right"
              />
            </View>

            <View style={[styles.formGroup, showCountryPicker && styles.formGroupOpen]}>
              <Text style={[styles.label, { color: theme.text }, isRTL && styles.rtl]}>{t.country}</Text>
              <TouchableOpacity
                style={[styles.picker, { backgroundColor: theme.card, borderColor: theme.border }, isRTL && styles.rtl]}
                onPress={() => {
                  setShowCountryPicker(!showCountryPicker);
                  setShowCategoryPicker(false);
                }}
              >
                <Text style={[styles.pickerText, { color: theme.text }, !selectedCountry && { color: theme.textSecondary }]}>
                  {selectedCountry ? `${selectedCountry.flag} ${selectedCountry.name}` : t.country}
                </Text>
                <ChevronDown 
                  size={20} 
                  color={theme.textSecondary} 
                  style={showCountryPicker ? { transform: [{ rotate: '180deg' }] } : {}}
                />
              </TouchableOpacity>
              {showCountryPicker && (
                <View style={[styles.pickerOptions, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <ScrollView 
                    style={styles.pickerScroll} 
                    nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={true}
                  >
                    {countries.map(country => (
                      <TouchableOpacity
                        key={country.id}
                        style={[
                          styles.pickerOption, 
                          { borderBottomColor: theme.border },
                          countryId === country.id && { backgroundColor: `${theme.primary}15` }
                        ]}
                        onPress={() => {
                          setCountryId(country.id);
                          setShowCountryPicker(false);
                        }}
                      >
                        <Text style={[
                          styles.pickerOptionText, 
                          { color: theme.text },
                          countryId === country.id && { color: theme.primary, fontWeight: '600' }
                        ]}>
                          {country.flag} {country.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <View style={[styles.formGroup, showCategoryPicker && styles.formGroupOpen]}>
              <Text style={[styles.label, { color: theme.text }, isRTL && styles.rtl]}>{t.category}</Text>
              <TouchableOpacity
                style={[styles.picker, { backgroundColor: theme.card, borderColor: theme.border }, isRTL && styles.rtl]}
                onPress={() => {
                  setShowCategoryPicker(!showCategoryPicker);
                  setShowCountryPicker(false);
                }}
              >
                <Text style={[styles.pickerText, { color: theme.text }, !selectedCategory && { color: theme.textSecondary }]}>
                  {selectedCategory ? selectedCategory.name : t.category}
                </Text>
                <ChevronDown 
                  size={20} 
                  color={theme.textSecondary}
                  style={showCategoryPicker ? { transform: [{ rotate: '180deg' }] } : {}}
                />
              </TouchableOpacity>
              {showCategoryPicker && (
                <View style={[styles.pickerOptions, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <ScrollView 
                    style={styles.pickerScroll} 
                    nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={true}
                  >
                    {categories.map(category => (
                      <TouchableOpacity
                        key={category.id}
                        style={[
                          styles.pickerOption, 
                          { borderBottomColor: theme.border },
                          categoryId === category.id && { backgroundColor: `${theme.primary}15` }
                        ]}
                        onPress={() => {
                          setCategoryId(category.id);
                          setShowCategoryPicker(false);
                        }}
                      >
                        <Text style={[
                          styles.pickerOptionText, 
                          { color: theme.text },
                          categoryId === category.id && { color: theme.primary, fontWeight: '600' }
                        ]}>
                          {category.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text }, isRTL && styles.rtl]}>{t.lawDescription} (English)</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }, isRTL && styles.rtl]}
                value={descriptionEn}
                onChangeText={setDescriptionEn}
                placeholder="Law description in English"
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={3}
                textAlign={isRTL ? 'right' : 'left'}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text }, isRTL && styles.rtl]}>{t.lawDescription} (العربية)</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }, isRTL && styles.rtl]}
                value={descriptionAr}
                onChangeText={setDescriptionAr}
                placeholder="وصف القانون بالعربية"
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={3}
                textAlign="right"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text }, isRTL && styles.rtl]}>{t.lawContent} (English)</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }, isRTL && styles.rtl]}
                value={contentEn}
                onChangeText={setContentEn}
                placeholder="Law content in English"
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={6}
                textAlign={isRTL ? 'right' : 'left'}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text }, isRTL && styles.rtl]}>{t.lawContent} (العربية)</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }, isRTL && styles.rtl]}
                value={contentAr}
                onChangeText={setContentAr}
                placeholder="محتوى القانون بالعربية"
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={6}
                textAlign="right"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text }, isRTL && styles.rtl]}>{t.effectiveDate}</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }, isRTL && styles.rtl]}
                value={effectiveDate}
                onChangeText={setEffectiveDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.textSecondary}
                textAlign={isRTL ? 'right' : 'left'}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text }, isRTL && styles.rtl]}>{t.source}</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }, isRTL && styles.rtl]}
                value={source}
                onChangeText={setSource}
                placeholder="https://..."
                placeholderTextColor={theme.textSecondary}
                keyboardType="url"
                autoCapitalize="none"
                textAlign={isRTL ? 'right' : 'left'}
              />
            </View>
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: theme.border }]}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { backgroundColor: theme.card }]}
              onPress={onClose}
            >
              <Text style={[styles.cancelButtonText, { color: theme.text }]}>{t.cancel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton, { backgroundColor: theme.primary }, loading && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={loading || !titleEn || !descriptionEn || !contentEn || !countryId || !categoryId}
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
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
    zIndex: 1,
  },
  formGroupOpen: {
    zIndex: 100,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  rtl: {
    textAlign: 'right',
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  picker: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerText: {
    fontSize: 16,
  },
  placeholder: {},
  pickerOptions: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    maxHeight: 200,
    zIndex: 100,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  pickerScroll: {
    maxHeight: 200,
  },
  pickerOption: {
    padding: 14,
    borderBottomWidth: 1,
  },
  pickerOptionText: {
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {},
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  saveButton: {},
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
