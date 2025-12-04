import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Mail, User, MessageSquare, Send, ArrowRight, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/AuthContext';
import { useContact } from '@/contexts/ContactContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ContactScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const { sendMessage } = useContact();
  const { settings } = useSettings();
  const { t, isRTL } = useLanguage();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    try {
      await sendMessage({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
        userId: user?.id,
      });

      Alert.alert(
        'Success',
        'Your message has been sent successfully! We will get back to you soon.',
        [
          {
            text: 'OK',
            onPress: () => {
              setSubject('');
              setMessage('');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = name.trim() && email.trim() && subject.trim() && message.trim();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Header */}
          <View style={styles.header}>
            <LinearGradient
              colors={['#6366f1', '#8b5cf6']}
              style={styles.headerIconBg}
            >
              <Sparkles size={24} color="#fff" />
            </LinearGradient>
            <Text style={[styles.headerTitle, { color: theme.text }, isRTL && styles.rtlText]}>{t.getInTouch}</Text>
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }, isRTL && styles.rtlText]}>
              {t.weLoveToHear}
            </Text>
          </View>

          {/* Quick Email Action */}
          <TouchableOpacity style={[styles.emailAction, { backgroundColor: theme.card }, isRTL && styles.rtl]} activeOpacity={0.8}>
            <View style={[styles.emailActionLeft, isRTL && styles.rtl]}>
              <View style={[styles.emailDot, { backgroundColor: '#22c55e' }]} />
              <Text style={[styles.emailActionLabel, { color: theme.textSecondary }]}>{t.emailUsDirectly}</Text>
            </View>
            <View style={[styles.emailActionRight, isRTL && styles.rtl]}>
              <Text style={[styles.emailActionValue, { color: theme.primary }]}>{settings.supportEmail}</Text>
              <ArrowRight size={16} color={theme.primary} style={isRTL ? { transform: [{ rotate: '180deg' }] } : {}} />
            </View>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
            <Text style={[styles.dividerText, { color: theme.textSecondary }]}>{t.orSendMessage}</Text>
            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
          </View>

          {/* Form */}
          <View style={[styles.formContainer, { backgroundColor: theme.card }]}>
            {/* Row 1: Name & Email */}
            <View style={[styles.formRow, isRTL && styles.rtl]}>
              <View style={styles.formRowItem}>
                <Text style={[styles.label, { color: theme.textSecondary }, isRTL && styles.rtlText]}>{t.yourName}</Text>
                <View style={[
                  styles.inputContainer,
                  { backgroundColor: theme.backgroundSecondary },
                  focusedField === 'name' && styles.inputFocused,
                  isRTL && styles.rtl
                ]}>
                  <User size={14} color={focusedField === 'name' ? '#6366f1' : theme.textSecondary} />
                  <TextInput
                    style={[styles.input, { color: theme.text }, isRTL && styles.rtlText]}
                    placeholder="John Doe"
                    placeholderTextColor={theme.textSecondary}
                    value={name}
                    onChangeText={setName}
                    editable={!user}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    textAlign={isRTL ? 'right' : 'left'}
                  />
                </View>
              </View>
              <View style={styles.formRowItem}>
                <Text style={[styles.label, { color: theme.textSecondary }, isRTL && styles.rtlText]}>{t.yourEmail}</Text>
                <View style={[
                  styles.inputContainer,
                  { backgroundColor: theme.backgroundSecondary },
                  focusedField === 'email' && styles.inputFocused,
                  isRTL && styles.rtl
                ]}>
                  <Mail size={14} color={focusedField === 'email' ? '#6366f1' : theme.textSecondary} />
                  <TextInput
                    style={[styles.input, { color: theme.text }, isRTL && styles.rtlText]}
                    placeholder="you@email.com"
                    placeholderTextColor={theme.textSecondary}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!user}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    textAlign={isRTL ? 'right' : 'left'}
                  />
                </View>
              </View>
            </View>

            {/* Subject */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }, isRTL && styles.rtlText]}>{t.subject}</Text>
              <View style={[
                styles.inputContainer,
                { backgroundColor: theme.backgroundSecondary },
                focusedField === 'subject' && styles.inputFocused,
                isRTL && styles.rtl
              ]}>
                <MessageSquare size={14} color={focusedField === 'subject' ? '#6366f1' : theme.textSecondary} />
                <TextInput
                  style={[styles.input, { color: theme.text }, isRTL && styles.rtlText]}
                  placeholder={t.whatsThisAbout}
                  placeholderTextColor={theme.textSecondary}
                  value={subject}
                  onChangeText={setSubject}
                  onFocus={() => setFocusedField('subject')}
                  onBlur={() => setFocusedField(null)}
                  textAlign={isRTL ? 'right' : 'left'}
                />
              </View>
            </View>

            {/* Message */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }, isRTL && styles.rtlText]}>{t.yourMessage}</Text>
              <View style={[
                styles.textAreaContainer,
                { backgroundColor: theme.backgroundSecondary },
                focusedField === 'message' && styles.inputFocused
              ]}>
                <TextInput
                  style={[styles.textArea, { color: theme.text }, isRTL && styles.rtlText]}
                  placeholder={t.tellUsMore}
                  placeholderTextColor={theme.textSecondary}
                  value={message}
                  onChangeText={setMessage}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  onFocus={() => setFocusedField('message')}
                  onBlur={() => setFocusedField(null)}
                  textAlign={isRTL ? 'right' : 'left'}
                />
              </View>
              <Text style={[styles.charCount, { color: theme.textSecondary }]}>
                {message.length}/500
              </Text>
            </View>

            {/* Submit */}
            <TouchableOpacity
              style={[styles.submitBtn, !isFormValid && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting || !isFormValid}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={isFormValid ? ['#6366f1', '#8b5cf6'] : ['#cbd5e1', '#94a3b8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitBtnGradient}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Send size={16} color="#fff" />
                    <Text style={styles.submitBtnText}>{t.sendMessage}</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 120,
  },
  
  // Header
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerIconBg: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  
  // Email Action
  emailAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  emailActionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emailDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emailActionLabel: {
    fontSize: 13,
  },
  emailActionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  emailActionValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  
  // Divider
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '500',
  },
  
  // Form Container
  formContainer: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  formRowItem: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 42,
  },
  inputFocused: {
    borderWidth: 1.5,
    borderColor: '#6366f1',
  },
  input: {
    flex: 1,
    fontSize: 13,
    marginLeft: 8,
    paddingVertical: 0,
  },
  textAreaContainer: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 90,
  },
  textArea: {
    fontSize: 13,
    minHeight: 70,
    lineHeight: 20,
  },
  charCount: {
    fontSize: 10,
    textAlign: 'right',
    marginTop: 4,
  },
  submitBtn: {
    borderRadius: 10,
    marginTop: 4,
    overflow: 'hidden',
  },
  submitBtnDisabled: {
    opacity: 0.8,
  },
  submitBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  rtl: {
    flexDirection: 'row-reverse',
  },
  rtlText: {
    textAlign: 'right',
  },
});
