import { useState } from 'react';
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
} from 'react-native';
import { Mail, User, MessageSquare, Send } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/AuthContext';
import { useContact } from '@/contexts/ContactContext';
import { useSettings } from '@/contexts/SettingsContext';
import Colors from '@/constants/colors';

export default function ContactScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const { sendMessage } = useContact();
  const { settings } = useSettings();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.header, { backgroundColor: theme.background }]}>
          <View style={[styles.iconContainer, { backgroundColor: theme.primary }]}>
            <Mail size={32} color="#fff" />
          </View>
          <Text style={[styles.title, { color: theme.text }]}>Contact Us</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Have questions or feedback? We&apos;d love to hear from you!
          </Text>
          <View style={[styles.supportEmailContainer, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
            <Text style={[styles.supportEmailLabel, { color: theme.textSecondary }]}>
              Or email us at:
            </Text>
            <Text style={[styles.supportEmail, { color: theme.primary }]}>
              {settings.supportEmail}
            </Text>
          </View>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Your Name</Text>
            <View style={[styles.inputContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
              <User size={20} color={theme.textSecondary} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Enter your name"
                placeholderTextColor={theme.textSecondary}
                value={name}
                onChangeText={setName}
                editable={!user}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Your Email</Text>
            <View style={[styles.inputContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
              <Mail size={20} color={theme.textSecondary} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Enter your email"
                placeholderTextColor={theme.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!user}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Subject</Text>
            <View style={[styles.inputContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
              <MessageSquare size={20} color={theme.textSecondary} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="What is this about?"
                placeholderTextColor={theme.textSecondary}
                value={subject}
                onChangeText={setSubject}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Message</Text>
            <View style={[styles.textAreaContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
              <TextInput
                style={[styles.textArea, { color: theme.text }]}
                placeholder="Tell us more about your inquiry..."
                placeholderTextColor={theme.textSecondary}
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: theme.primary }]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Send size={20} color="#fff" />
                <Text style={styles.submitButtonText}>Send Message</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
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
  },
  header: {
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  supportEmailContainer: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  supportEmailLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  supportEmail: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  form: {
    padding: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    height: 56,
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  textAreaContainer: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    minHeight: 150,
  },
  textArea: {
    fontSize: 16,
    minHeight: 126,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
