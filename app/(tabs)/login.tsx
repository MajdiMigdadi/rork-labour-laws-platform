import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import Colors from '@/constants/colors';
import { Scale, Mail, Lock, User } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useSettings } from '@/contexts/SettingsContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, register, isAuthenticated } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const { settings } = useSettings();
  const { language } = useLanguage();

  const langSettings = settings.languageSettings[language];

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)/profile');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async () => {
    setError('');
    
    if (!email || !password || (!isLogin && !name)) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      let success;
      if (isLogin) {
        success = await login(email, password);
        if (!success) {
          setError('Invalid credentials. Try: admin@labourlaw.com or john@example.com');
        }
      } else {
        success = await register(email, password, name);
      }

      if (success) {
        router.replace('/(tabs)/profile');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Auth error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          {settings.logo ? (
            <View style={styles.logoContainer}>
              <Image source={{ uri: settings.logo }} style={styles.logo} resizeMode="contain" />
            </View>
          ) : (
            <View style={[styles.iconContainer, { backgroundColor: theme.backgroundSecondary }]}>
              <Scale size={48} color={theme.primary} strokeWidth={2} />
            </View>
          )}
          <Text style={[styles.title, { color: theme.text }]}>{langSettings?.appName || settings.appName}</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {langSettings?.appDescription || settings.appDescription}
          </Text>
        </View>

        <View style={styles.form}>
          <View style={[styles.tabs, { backgroundColor: theme.backgroundSecondary }]}>
            <TouchableOpacity
              style={[styles.tab, isLogin && { backgroundColor: theme.primary }]}
              onPress={() => {
                setIsLogin(true);
                setError('');
              }}
            >
              <Text style={[styles.tabText, { color: theme.textSecondary }, isLogin && styles.activeTabText]}>
                Login
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, !isLogin && { backgroundColor: theme.primary }]}
              onPress={() => {
                setIsLogin(false);
                setError('');
              }}
            >
              <Text style={[styles.tabText, { color: theme.textSecondary }, !isLogin && styles.activeTabText]}>
                Register
              </Text>
            </TouchableOpacity>
          </View>

          {!isLogin && (
            <View style={[styles.inputContainer, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
              <User size={20} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                placeholderTextColor={theme.textSecondary}
              />
            </View>
          )}

          <View style={[styles.inputContainer, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
            <Mail size={20} color={theme.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={theme.textSecondary}
            />
          </View>

          <View style={[styles.inputContainer, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
            <Lock size={20} color={theme.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor={theme.textSecondary}
            />
          </View>

          {error ? <Text style={[styles.error, { color: theme.error }]}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {isLogin ? 'Login' : 'Create Account'}
              </Text>
            )}
          </TouchableOpacity>

          {isLogin && (
            <View style={[styles.demoContainer, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
              <Text style={[styles.demoText, { color: theme.text }]}>Demo accounts:</Text>
              <Text style={[styles.demoEmail, { color: theme.textSecondary }]}>admin@labourlaw.com (Admin)</Text>
              <Text style={[styles.demoEmail, { color: theme.textSecondary }]}>john@example.com (User)</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoContainer: {
    width: 80,
    height: 80,
    marginBottom: 16,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: Colors.light.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.textSecondary,
  },
  activeTabText: {
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: Colors.light.text,
  },
  button: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  error: {
    color: Colors.light.error,
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  demoContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  demoText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  demoEmail: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 4,
  },
});
