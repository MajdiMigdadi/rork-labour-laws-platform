import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { ArrowLeft, MessageCircle, X } from 'lucide-react-native';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { useReputation } from '@/contexts/ReputationContext';
import { useLanguage } from '@/contexts/LanguageContext';
import FlagDisplay from '@/components/FlagDisplay';

export default function AskQuestionScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user } = useAuth();
  const { countries, categories, addQuestion } = useData();
  const { t, isRTL, getTranslatedName } = useLanguage();
  const { onQuestionAsked } = useReputation();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.replace('/(auth)/login?from=ask-question');
    }
  }, [user, router]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const handleAddTag = () => {
    if (tagInput.trim() && tags.length < 5 && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert(t.error || 'Error', t.errorEnterTitle || 'Please enter a question title');
      return;
    }
    if (!content.trim()) {
      Alert.alert(t.error || 'Error', t.errorEnterDetails || 'Please enter question details');
      return;
    }
    if (!selectedCountry) {
      Alert.alert(t.error || 'Error', t.errorSelectCountry || 'Please select a country');
      return;
    }
    if (!selectedCategory) {
      Alert.alert(t.error || 'Error', t.errorSelectCategory || 'Please select a category');
      return;
    }

    try {
      await addQuestion({
        userId: user.id,
        title,
        content,
        countryId: selectedCountry,
        categoryId: selectedCategory,
        tags,
      });

      await onQuestionAsked(user.id);

      // Navigate to Q&A page immediately
      router.push('/(tabs)/questions');
      
      // Show success message
      Alert.alert(t.success || 'Success', t.successQuestionPosted || 'Your question has been posted! You earned 5 reputation points.');
    } catch (error) {
      console.error('Failed to submit question:', error);
      Alert.alert(t.error || 'Error', t.errorPostQuestion || 'Failed to post question. Please try again.');
    }
  };

  const handleGoBack = () => {
    router.push('/(tabs)/questions');
  };

  // Don't render if user is not logged in (will redirect)
  if (!user) {
    return null;
  }

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: t.askQuestion || 'Ask a Question', 
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity onPress={handleGoBack} style={{ marginLeft: 8 }}>
              <ArrowLeft size={24} color={theme.text} style={isRTL && { transform: [{ rotate: '180deg' }] }} />
            </TouchableOpacity>
          ),
        }} 
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}
      >
        <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <View style={styles.header}>
              <MessageCircle size={32} color={theme.primary} />
              <Text style={[styles.headerTitle, { color: theme.text }]}>{t.askCommunity || 'Ask the Community'}</Text>
              <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
                {t.getExpertAnswers || 'Get expert answers to your labour law questions'}
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.text }, isRTL && styles.rtlText]}>{t.questionTitle || 'Question Title'} *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }, isRTL && styles.rtlText]}
                  placeholder={t.whatIsYourQuestion || 'What is your question?'}
                  value={title}
                  onChangeText={setTitle}
                  placeholderTextColor={theme.textSecondary}
                  textAlign={isRTL ? 'right' : 'left'}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.text }, isRTL && styles.rtlText]}>{t.details || 'Details'} *</Text>
                <TextInput
                  style={[styles.input, styles.textArea, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }, isRTL && styles.rtlText]}
                  placeholder={t.provideContext || 'Provide more context and details...'}
                  value={content}
                  onChangeText={setContent}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  placeholderTextColor={theme.textSecondary}
                  textAlign={isRTL ? 'right' : 'left'}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.text }, isRTL && styles.rtlText]}>{t.country || 'Country'} *</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.chipContainer}
                >
                  {countries.map(country => (
                    <TouchableOpacity
                      key={country.id}
                      style={[
                        styles.chip,
                        { backgroundColor: theme.card, borderColor: theme.border },
                        selectedCountry === country.id && { backgroundColor: theme.primary, borderColor: theme.primary },
                      ]}
                      onPress={() => setSelectedCountry(country.id)}
                    >
                      <FlagDisplay flag={country.flag} size="small" />
                      <Text
                        style={[
                          styles.chipText,
                          { color: theme.text },
                          selectedCountry === country.id && styles.chipTextSelected,
                        ]}
                      >
                        {getTranslatedName(country)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.text }, isRTL && styles.rtlText]}>{t.category || 'Category'} *</Text>
                <View style={[styles.categoryGrid, isRTL && styles.rtlWrap]}>
                  {categories.map(category => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryChip,
                        { backgroundColor: theme.card, borderColor: theme.border },
                        selectedCategory === category.id && { backgroundColor: theme.accent, borderColor: theme.accent },
                      ]}
                      onPress={() => setSelectedCategory(category.id)}
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          { color: theme.text },
                          selectedCategory === category.id && styles.categoryChipTextSelected,
                        ]}
                      >
                        {getTranslatedName(category)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.text }, isRTL && styles.rtlText]}>{t.tagsOptional || 'Tags (Optional)'}</Text>
                <View style={[styles.tagInputContainer, isRTL && styles.rtl]}>
                  <TextInput
                    style={[styles.tagInput, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }, isRTL && styles.rtlText]}
                    placeholder={t.addTag || 'Add a tag...'}
                    value={tagInput}
                    onChangeText={setTagInput}
                    onSubmitEditing={handleAddTag}
                    placeholderTextColor={theme.textSecondary}
                    textAlign={isRTL ? 'right' : 'left'}
                  />
                  <TouchableOpacity
                    style={[styles.addTagButton, { backgroundColor: theme.secondary }]}
                    onPress={handleAddTag}
                    disabled={!tagInput.trim() || tags.length >= 5}
                  >
                    <Text style={styles.addTagButtonText}>{t.add || 'Add'}</Text>
                  </TouchableOpacity>
                </View>
                {tags.length > 0 && (
                  <View style={[styles.tagsContainer, isRTL && styles.rtlWrap]}>
                    {tags.map(tag => (
                      <View key={tag} style={[styles.tag, { backgroundColor: theme.primary }, isRTL && styles.rtl]}>
                        <Text style={styles.tagText}>{tag}</Text>
                        <TouchableOpacity
                          onPress={() => handleRemoveTag(tag)}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <X size={14} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
                <Text style={[styles.hint, { color: theme.textSecondary }, isRTL && styles.rtlText]}>
                  {tags.length}/5 {t.tagsHint || 'tags • Press Add or Enter to add a tag'}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: theme.primary }]}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>{t.postQuestion || 'Post Question'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 15,
    marginTop: 8,
    textAlign: 'center',
  },
  form: {
    gap: 20,
  },
  formGroup: {
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  input: {
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    borderWidth: 1,
  },
  textArea: {
    minHeight: 120,
    paddingTop: 14,
  },
  chipContainer: {
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
    borderWidth: 1,
  },
  chipEmoji: {
    fontSize: 18,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  chipTextSelected: {
    color: '#fff',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  categoryChipTextSelected: {
    color: '#fff',
  },
  tagInputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tagInput: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    borderWidth: 1,
  },
  addTagButton: {
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
  },
  addTagButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600' as const,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: '#fff',
  },
  hint: {
    fontSize: 12,
    marginTop: 4,
  },
  footer: {
    padding: 16,
    paddingBottom: 100,
    borderTopWidth: 1,
  },
  submitButton: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  rtl: {
    flexDirection: 'row-reverse',
  },
  rtlText: {
    textAlign: 'right',
  },
  rtlWrap: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
  },
});
