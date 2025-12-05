import { useState, useEffect, useRef } from 'react';
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
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Scale, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Eye,
  EyeOff,
  ChevronLeft,
  X,
  MessageCircle,
  BookOpen,
  Award,
  Sparkles,
  Check,
  Globe,
} from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useSettings } from '@/contexts/SettingsContext';
import { useLanguage } from '@/contexts/LanguageContext';

const { width, height } = Dimensions.get('window');

type AuthMode = 'welcome' | 'login' | 'register';

export default function AuthLoginScreen() {
  const params = useLocalSearchParams();
  const [mode, setMode] = useState<AuthMode>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const { login, register, isAuthenticated } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const { settings } = useSettings();
  const { language, changeLanguage, isRTL } = useLanguage();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const logoScale = useRef(new Animated.Value(0.9)).current;
  const formSlide = useRef(new Animated.Value(height)).current;

  const langSettings = settings.languageSettings?.[language];
  
  // Check if any social login is enabled
  const socialLogin = settings.socialLogin;
  const hasSocialLogin = socialLogin?.google?.enabled || 
                         socialLogin?.facebook?.enabled || 
                         socialLogin?.apple?.enabled;

  // Check if user was redirected from asking a question
  const fromAskQuestion = params.from === 'ask-question';

  useEffect(() => {
    if (isAuthenticated) {
      if (fromAskQuestion) {
        router.replace('/(tabs)/ask-question');
      } else {
        router.replace('/(tabs)/profile');
      }
    }
  }, [isAuthenticated, router, fromAskQuestion]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const showForm = (newMode: AuthMode) => {
    setMode(newMode);
    Animated.spring(formSlide, {
      toValue: 0,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const hideForm = () => {
    Animated.timing(formSlide, {
      toValue: height,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setMode('welcome');
      resetForm();
    });
  };

  const handleSocialLogin = (provider: string) => {
    Alert.alert(
      language === 'ar' ? 'قريباً' : 'Coming Soon',
      language === 'ar' 
        ? `تسجيل الدخول عبر ${provider} قريباً`
        : `${provider} login coming soon!`,
      [{ text: language === 'ar' ? 'حسناً' : 'OK' }]
    );
  };

  const handleSubmit = async () => {
    setError('');
    
    if (!email || !password) {
      setError(language === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill all fields');
      return;
    }

    if (mode === 'register') {
      if (!name) {
        setError(language === 'ar' ? 'يرجى إدخال اسمك' : 'Please enter your name');
        return;
      }
      if (password !== confirmPassword) {
        setError(language === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
        return;
      }
      if (password.length < 6) {
        setError(language === 'ar' ? 'كلمة المرور قصيرة جداً' : 'Password too short');
        return;
      }
    }

    setIsLoading(true);

    try {
      let success;
      if (mode === 'login') {
        success = await login(email, password);
        if (!success) {
          setError(language === 'ar' ? 'بيانات غير صحيحة' : 'Invalid credentials');
        }
      } else {
        success = await register(email, password, name);
        if (!success) {
          setError(language === 'ar' ? 'فشل إنشاء الحساب' : 'Registration failed');
        }
      }

      if (success) {
        if (fromAskQuestion) {
          router.replace('/(tabs)/ask-question');
        } else {
          router.replace('/(tabs)/profile');
        }
      }
    } catch (err) {
      setError(language === 'ar' ? 'حدث خطأ' : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setError('');
    setShowPassword(false);
    setFocusedInput(null);
  };

  const handleLanguageToggle = () => {
    changeLanguage(language === 'ar' ? 'en' : 'ar');
  };

  // Welcome Screen
  if (mode === 'welcome') {
    return (
      <View style={styles.container}>
        {/* Gradient Background */}
        <LinearGradient
          colors={['#1E1B4B', '#312E81', '#4338CA']}
          style={styles.gradientBg}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        {/* Decorative circles */}
        <View style={styles.circle1} />
        <View style={styles.circle2} />

        <ScrollView 
          contentContainerStyle={styles.welcomeScroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Language Toggle */}
          <TouchableOpacity 
            style={styles.langBtn}
            onPress={handleLanguageToggle}
          >
            <Globe size={16} color="#fff" />
            <Text style={styles.langBtnText}>
              {language === 'ar' ? 'English' : 'العربية'}
            </Text>
          </TouchableOpacity>

          {/* Logo Section */}
          <Animated.View 
            style={[
              styles.logoArea,
              { 
                opacity: fadeAnim,
                transform: [{ scale: logoScale }]
              }
            ]}
          >
            {settings.logoDark ? (
              <Image 
                source={{ uri: settings.logoDark }} 
                style={styles.logo} 
                contentFit="contain"
              />
            ) : settings.logo ? (
              <Image 
                source={{ uri: settings.logo }} 
                style={styles.logo} 
                contentFit="contain"
              />
            ) : (
              <LinearGradient
                colors={['#6366F1', '#8B5CF6']}
                style={styles.logoPlaceholder}
              >
                <Scale size={44} color="#fff" strokeWidth={1.5} />
              </LinearGradient>
            )}
          </Animated.View>

          {/* Title */}
          <Animated.View 
            style={[
              styles.titleArea,
              { 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            {fromAskQuestion && (
              <View style={styles.contextTag}>
                <MessageCircle size={14} color="#fff" />
                <Text style={styles.contextTagText}>
                  {language === 'ar' ? 'سجل لطرح سؤالك' : 'Sign in to ask'}
                </Text>
              </View>
            )}

            <Text style={[styles.appTitle, isRTL && styles.rtlText]}>
              {langSettings?.appName || settings.appName || 'Labour Laws'}
            </Text>
            <Text style={[styles.appDesc, isRTL && styles.rtlText]}>
              {language === 'ar' 
                ? 'دليلك الشامل لقوانين العمل'
                : 'Your guide to labor laws'}
            </Text>
          </Animated.View>

          {/* Features - Horizontal Cards */}
          <Animated.View 
            style={[
              styles.featuresRow,
              { opacity: fadeAnim }
            ]}
          >
            <View style={styles.featureCard}>
              <View style={[styles.featureIconBg, { backgroundColor: 'rgba(99,102,241,0.2)' }]}>
                <MessageCircle size={20} color="#818CF8" />
              </View>
              <Text style={[styles.featureLabel, isRTL && styles.rtlText]}>
                {language === 'ar' ? 'اسأل' : 'Ask'}
              </Text>
            </View>

            <View style={styles.featureCard}>
              <View style={[styles.featureIconBg, { backgroundColor: 'rgba(16,185,129,0.2)' }]}>
                <BookOpen size={20} color="#34D399" />
              </View>
              <Text style={[styles.featureLabel, isRTL && styles.rtlText]}>
                {language === 'ar' ? 'تعلم' : 'Learn'}
              </Text>
            </View>

            <View style={styles.featureCard}>
              <View style={[styles.featureIconBg, { backgroundColor: 'rgba(245,158,11,0.2)' }]}>
                <Award size={20} color="#FBBF24" />
              </View>
              <Text style={[styles.featureLabel, isRTL && styles.rtlText]}>
                {language === 'ar' ? 'اكسب' : 'Earn'}
              </Text>
            </View>
          </Animated.View>

          {/* Social Login */}
          {hasSocialLogin && (
            <Animated.View style={[styles.socialArea, { opacity: fadeAnim }]}>
              <Text style={styles.socialLabel}>
                {language === 'ar' ? 'تسجيل سريع' : 'Quick sign in'}
              </Text>
              <View style={styles.socialBtns}>
                {socialLogin?.google?.enabled && (
                  <TouchableOpacity 
                    style={styles.socialBtn}
                    onPress={() => handleSocialLogin('Google')}
                  >
                    <Text style={styles.socialIcon}>G</Text>
                  </TouchableOpacity>
                )}
                {socialLogin?.facebook?.enabled && (
                  <TouchableOpacity 
                    style={[styles.socialBtn, styles.socialBtnFb]}
                    onPress={() => handleSocialLogin('Facebook')}
                  >
                    <Text style={styles.socialIconWhite}>f</Text>
                  </TouchableOpacity>
                )}
                {socialLogin?.apple?.enabled && (
                  <TouchableOpacity 
                    style={[styles.socialBtn, styles.socialBtnApple]}
                    onPress={() => handleSocialLogin('Apple')}
                  >
                    <Text style={styles.socialIconWhite}></Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>{language === 'ar' ? 'أو' : 'or'}</Text>
                <View style={styles.dividerLine} />
              </View>
            </Animated.View>
          )}

          {/* Action Buttons */}
          <Animated.View 
            style={[
              styles.actionsArea,
              { 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <TouchableOpacity 
              style={styles.primaryBtn}
              onPress={() => showForm('login')}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#6366F1', '#8B5CF6']}
                style={styles.primaryBtnInner}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Mail size={20} color="#fff" />
                <Text style={styles.primaryBtnText}>
                  {language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryBtn}
              onPress={() => showForm('register')}
              activeOpacity={0.8}
            >
              <Sparkles size={18} color="#fff" />
              <Text style={styles.secondaryBtnText}>
                {language === 'ar' ? 'إنشاء حساب' : 'Create Account'}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Skip */}
          <TouchableOpacity 
            style={styles.skipBtn}
            onPress={() => router.push('/(tabs)/home')}
          >
            <Text style={styles.skipText}>
              {language === 'ar' ? 'تخطي' : 'Skip'}
            </Text>
            <ChevronLeft 
              size={16} 
              color="rgba(255,255,255,0.5)" 
              style={!isRTL && { transform: [{ rotate: '180deg' }] }}
            />
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // Form Screen (Login/Register)
  return (
    <Animated.View 
      style={[
        styles.formContainer,
        { 
          backgroundColor: theme.background,
          transform: [{ translateY: formSlide }]
        }
      ]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.formKeyboard}
      >
        <ScrollView 
          contentContainerStyle={styles.formScroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={[styles.formHeader, isRTL && styles.rowReverse]}>
            <TouchableOpacity 
              style={[styles.backBtn, { backgroundColor: theme.backgroundSecondary }]}
              onPress={hideForm}
            >
              <ChevronLeft 
                size={24} 
                color={theme.text}
                style={isRTL && { transform: [{ rotate: '180deg' }] }}
              />
            </TouchableOpacity>
            <Text style={[styles.formHeaderTitle, { color: theme.text }]}>
              {mode === 'login' 
                ? (language === 'ar' ? 'تسجيل الدخول' : 'Sign In')
                : (language === 'ar' ? 'إنشاء حساب' : 'Create Account')}
            </Text>
            <View style={styles.backBtn} />
          </View>

          {/* Logo in Form */}
          {settings.logo && (
            <View style={styles.formLogoArea}>
              <Image 
                source={{ uri: settings.logo }} 
                style={styles.formLogo} 
                contentFit="contain"
              />
            </View>
          )}

          {/* Form Title */}
          <View style={styles.formTitleArea}>
            <Text style={[styles.formTitle, { color: theme.text }, isRTL && styles.rtlText]}>
              {mode === 'login'
                ? (language === 'ar' ? 'مرحباً بعودتك!' : 'Welcome back!')
                : (language === 'ar' ? 'انضم إلينا' : 'Join us')}
            </Text>
            <Text style={[styles.formSubtitle, { color: theme.textSecondary }, isRTL && styles.rtlText]}>
              {mode === 'login'
                ? (language === 'ar' ? 'أدخل بياناتك للمتابعة' : 'Enter your details')
                : (language === 'ar' ? 'أنشئ حسابك الآن' : 'Create your account')}
            </Text>
          </View>

          {/* Social in Form */}
          {hasSocialLogin && (
            <View style={styles.formSocialArea}>
              <View style={styles.formSocialRow}>
                {socialLogin?.google?.enabled && (
                  <TouchableOpacity 
                    style={[styles.formSocialBtn, { borderColor: theme.border }]}
                    onPress={() => handleSocialLogin('Google')}
                  >
                    <Text style={[styles.formSocialIcon, { color: '#EA4335' }]}>G</Text>
                  </TouchableOpacity>
                )}
                {socialLogin?.facebook?.enabled && (
                  <TouchableOpacity 
                    style={[styles.formSocialBtn, { backgroundColor: '#1877F2', borderColor: '#1877F2' }]}
                    onPress={() => handleSocialLogin('Facebook')}
                  >
                    <Text style={[styles.formSocialIcon, { color: '#fff' }]}>f</Text>
                  </TouchableOpacity>
                )}
                {socialLogin?.apple?.enabled && (
                  <TouchableOpacity 
                    style={[styles.formSocialBtn, { backgroundColor: '#000', borderColor: '#000' }]}
                    onPress={() => handleSocialLogin('Apple')}
                  >
                    <Text style={[styles.formSocialIcon, { color: '#fff' }]}></Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.formDivider}>
                <View style={[styles.formDividerLine, { backgroundColor: theme.border }]} />
                <Text style={[styles.formDividerText, { color: theme.textSecondary }]}>
                  {language === 'ar' ? 'أو' : 'or'}
                </Text>
                <View style={[styles.formDividerLine, { backgroundColor: theme.border }]} />
              </View>
            </View>
          )}

          {/* Form Fields */}
          <View style={styles.fieldsArea}>
            {mode === 'register' && (
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }, isRTL && styles.rtlText]}>
                  {language === 'ar' ? 'الاسم' : 'Name'}
                </Text>
                <View style={[
                  styles.inputBox,
                  { 
                    backgroundColor: theme.backgroundSecondary,
                    borderColor: focusedInput === 'name' ? theme.primary : theme.border
                  }
                ]}>
                  <User size={20} color={focusedInput === 'name' ? theme.primary : theme.textSecondary} />
                  <TextInput
                    style={[styles.input, { color: theme.text }, isRTL && styles.rtlText]}
                    placeholder={language === 'ar' ? 'اسمك الكامل' : 'Your full name'}
                    value={name}
                    onChangeText={setName}
                    placeholderTextColor={theme.textSecondary}
                    textAlign={isRTL ? 'right' : 'left'}
                    onFocus={() => setFocusedInput('name')}
                    onBlur={() => setFocusedInput(null)}
                  />
                  {name.length > 2 && <Check size={18} color="#10B981" />}
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }, isRTL && styles.rtlText]}>
                {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
              </Text>
              <View style={[
                styles.inputBox,
                { 
                  backgroundColor: theme.backgroundSecondary,
                  borderColor: focusedInput === 'email' ? theme.primary : theme.border
                }
              ]}>
                <Mail size={20} color={focusedInput === 'email' ? theme.primary : theme.textSecondary} />
                <TextInput
                  style={[styles.input, { color: theme.text }, isRTL && styles.rtlText]}
                  placeholder="email@example.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor={theme.textSecondary}
                  textAlign={isRTL ? 'right' : 'left'}
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                />
                {email.includes('@') && email.includes('.') && <Check size={18} color="#10B981" />}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }, isRTL && styles.rtlText]}>
                {language === 'ar' ? 'كلمة المرور' : 'Password'}
              </Text>
              <View style={[
                styles.inputBox,
                { 
                  backgroundColor: theme.backgroundSecondary,
                  borderColor: focusedInput === 'password' ? theme.primary : theme.border
                }
              ]}>
                <Lock size={20} color={focusedInput === 'password' ? theme.primary : theme.textSecondary} />
                <TextInput
                  style={[styles.input, { color: theme.text }, isRTL && styles.rtlText]}
                  placeholder="••••••••"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholderTextColor={theme.textSecondary}
                  textAlign={isRTL ? 'right' : 'left'}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword 
                    ? <EyeOff size={20} color={theme.textSecondary} />
                    : <Eye size={20} color={theme.textSecondary} />
                  }
                </TouchableOpacity>
              </View>
              {mode === 'register' && password.length > 0 && (
                <View style={styles.strengthRow}>
                  <View style={[styles.strengthBar, { backgroundColor: password.length >= 6 ? '#10B981' : '#EF4444' }]} />
                  <View style={[styles.strengthBar, { backgroundColor: password.length >= 8 ? '#10B981' : theme.border }]} />
                  <View style={[styles.strengthBar, { backgroundColor: password.length >= 10 ? '#10B981' : theme.border }]} />
                </View>
              )}
            </View>

            {mode === 'register' && (
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }, isRTL && styles.rtlText]}>
                  {language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                </Text>
                <View style={[
                  styles.inputBox,
                  { 
                    backgroundColor: theme.backgroundSecondary,
                    borderColor: focusedInput === 'confirm' ? theme.primary : 
                                 (confirmPassword && confirmPassword !== password) ? '#EF4444' : theme.border
                  }
                ]}>
                  <Lock size={20} color={focusedInput === 'confirm' ? theme.primary : theme.textSecondary} />
                  <TextInput
                    style={[styles.input, { color: theme.text }, isRTL && styles.rtlText]}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                    placeholderTextColor={theme.textSecondary}
                    textAlign={isRTL ? 'right' : 'left'}
                    onFocus={() => setFocusedInput('confirm')}
                    onBlur={() => setFocusedInput(null)}
                  />
                  {confirmPassword && confirmPassword === password && <Check size={18} color="#10B981" />}
                </View>
              </View>
            )}

            {/* Error */}
            {error ? (
              <View style={styles.errorBox}>
                <X size={16} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Submit */}
            <TouchableOpacity
              style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={mode === 'login' ? ['#6366F1', '#8B5CF6'] : ['#10B981', '#059669']}
                style={styles.submitBtnInner}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.submitBtnText}>
                      {mode === 'login'
                        ? (language === 'ar' ? 'دخول' : 'Sign In')
                        : (language === 'ar' ? 'إنشاء' : 'Create')}
                    </Text>
                    <ArrowRight 
                      size={20} 
                      color="#fff"
                      style={isRTL && { transform: [{ rotate: '180deg' }] }}
                    />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Switch */}
            <TouchableOpacity 
              style={styles.switchBtn}
              onPress={() => {
                resetForm();
                setMode(mode === 'login' ? 'register' : 'login');
              }}
            >
              <Text style={[styles.switchText, { color: theme.textSecondary }]}>
                {mode === 'login'
                  ? (language === 'ar' ? 'ليس لديك حساب؟' : "No account?")
                  : (language === 'ar' ? 'لديك حساب؟' : 'Have account?')}
                {' '}
                <Text style={[styles.switchLink, { color: theme.primary }]}>
                  {mode === 'login'
                    ? (language === 'ar' ? 'سجل' : 'Sign up')
                    : (language === 'ar' ? 'دخول' : 'Sign in')}
                </Text>
              </Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  circle1: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -80,
    right: -60,
  },
  circle2: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.04)',
    bottom: 200,
    left: -60,
  },
  welcomeScroll: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: Platform.OS === 'ios' ? 70 : 50,
    paddingBottom: 60,
  },
  langBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  langBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  logoArea: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  logo: {
    width: 240,
    height: 100,
  },
  logoPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleArea: {
    alignItems: 'center',
    marginBottom: 32,
  },
  contextTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99,102,241,0.25)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
    gap: 6,
  },
  contextTagText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  appTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  appDesc: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 32,
  },
  featureCard: {
    alignItems: 'center',
    gap: 8,
  },
  featureIconBg: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  socialArea: {
    marginBottom: 20,
  },
  socialLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginBottom: 12,
  },
  socialBtns: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
  },
  socialBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialBtnFb: {
    backgroundColor: '#1877F2',
  },
  socialBtnApple: {
    backgroundColor: '#000',
  },
  socialIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: '#EA4335',
  },
  socialIconWhite: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  dividerText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  actionsArea: {
    gap: 12,
    marginBottom: 24,
  },
  primaryBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  primaryBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
    gap: 8,
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  demoBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 14,
    borderRadius: 14,
    marginBottom: 20,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  demoTitle: {
    fontSize: 12,
    color: '#FBBF24',
    fontWeight: '700',
  },
  demoEmail: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  demoHint: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
  },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  skipText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
  },

  // Form Screen
  formContainer: {
    flex: 1,
  },
  formKeyboard: {
    flex: 1,
  },
  formScroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  formLogoArea: {
    alignItems: 'center',
    marginBottom: 20,
  },
  formLogo: {
    width: 120,
    height: 44,
  },
  formTitleArea: {
    alignItems: 'center',
    marginBottom: 28,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 6,
  },
  formSubtitle: {
    fontSize: 14,
  },
  formSocialArea: {
    marginBottom: 24,
  },
  formSocialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
  },
  formSocialBtn: {
    width: 56,
    height: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formSocialIcon: {
    fontSize: 20,
    fontWeight: '700',
  },
  formDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 12,
  },
  formDividerLine: {
    flex: 1,
    height: 1,
  },
  formDividerText: {
    fontSize: 12,
  },
  fieldsArea: {
    gap: 18,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    borderRadius: 14,
    paddingHorizontal: 16,
    gap: 12,
    borderWidth: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  strengthRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 14,
    borderRadius: 12,
    gap: 10,
  },
  errorText: {
    flex: 1,
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '500',
  },
  submitBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 8,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  switchBtn: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  switchText: {
    fontSize: 14,
  },
  switchLink: {
    fontWeight: '700',
  },
  formDemoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  formDemoText: {
    fontSize: 13,
  },
  rtlText: {
    textAlign: 'right',
  },
});

