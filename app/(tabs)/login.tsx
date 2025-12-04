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
import { BlurView } from 'expo-blur';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Scale, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Eye,
  EyeOff,
  Shield,
  ChevronLeft,
  X,
  MessageCircle,
  BookOpen,
  Award,
  Sparkles,
  Check,
  Globe,
  Users,
} from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useSettings } from '@/contexts/SettingsContext';
import { useLanguage } from '@/contexts/LanguageContext';

const { width, height } = Dimensions.get('window');

type AuthMode = 'welcome' | 'login' | 'register';

export default function LoginScreen() {
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
  const { language, t, isRTL } = useLanguage();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const cardSlide = useRef(new Animated.Value(height)).current;

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
    // Staggered entrance animations
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const animateToForm = (newMode: AuthMode) => {
    setMode(newMode);
    Animated.spring(cardSlide, {
      toValue: 0,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const animateBack = () => {
    Animated.timing(cardSlide, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setMode('welcome');
      resetForm();
    });
  };

  const handleSocialLogin = (provider: string) => {
    Alert.alert(
      language === 'ar' ? 'تسجيل الدخول الاجتماعي' : 'Social Login',
      language === 'ar' 
        ? `سيتم تسجيل الدخول عبر ${provider} قريباً`
        : `${provider} login coming soon!`,
      [{ text: language === 'ar' ? 'حسناً' : 'OK' }]
    );
  };

  const handleSubmit = async () => {
    setError('');
    
    if (!email || !password) {
      setError(language === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill in all fields');
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
        setError(language === 'ar' ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
        return;
      }
    }

    setIsLoading(true);

    try {
      let success;
      if (mode === 'login') {
        success = await login(email, password);
        if (!success) {
          setError(language === 'ar' 
            ? 'بيانات غير صحيحة' 
            : 'Invalid email or password');
        }
      } else {
        success = await register(email, password, name);
        if (!success) {
          setError(language === 'ar' ? 'فشل إنشاء الحساب' : 'Failed to create account');
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
      setError(language === 'ar' ? 'حدث خطأ. حاول مرة أخرى.' : 'An error occurred');
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

  const features = [
    { 
      icon: MessageCircle, 
      title: language === 'ar' ? 'اسأل الخبراء' : 'Ask Experts',
      desc: language === 'ar' ? 'احصل على إجابات من المتخصصين' : 'Get answers from specialists',
      color: '#6366F1'
    },
    { 
      icon: BookOpen, 
      title: language === 'ar' ? 'استكشف القوانين' : 'Explore Laws',
      desc: language === 'ar' ? 'قوانين 6 دول خليجية' : 'Laws from 6 Gulf countries',
      color: '#10B981'
    },
    { 
      icon: Award, 
      title: language === 'ar' ? 'اكسب المكافآت' : 'Earn Rewards',
      desc: language === 'ar' ? 'شارات وسمعة' : 'Badges & reputation',
      color: '#F59E0B'
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Background Gradient */}
      <LinearGradient
        colors={['#1E1B4B', '#312E81', '#4338CA']}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Decorative Elements */}
      <View style={styles.decorContainer}>
        <View style={[styles.decorCircle, styles.decorCircle1]} />
        <View style={[styles.decorCircle, styles.decorCircle2]} />
        <View style={[styles.decorCircle, styles.decorCircle3]} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {mode === 'welcome' ? (
            <Animated.View 
              style={[
                styles.welcomeContainer,
                { opacity: fadeAnim }
              ]}
            >
              {/* Logo */}
              <Animated.View style={[styles.logoSection, { transform: [{ scale: logoScale }] }]}>
                {settings.logo ? (
                  <View style={styles.logoWrapper}>
                    <Image 
                      source={{ uri: settings.logo }} 
                      style={styles.logo} 
                      contentFit="contain"
                    />
                  </View>
                ) : (
                  <View style={styles.logoFallback}>
                    <Scale size={50} color="#fff" strokeWidth={1.5} />
                  </View>
                )}
              </Animated.View>

              {/* Welcome Text */}
              <Animated.View 
                style={[
                  styles.welcomeTextSection,
                  { transform: [{ translateY: slideAnim }] }
                ]}
              >
                {fromAskQuestion && (
                  <View style={styles.contextBanner}>
                    <MessageCircle size={18} color="#fff" />
                    <Text style={styles.contextBannerText}>
                      {language === 'ar' ? 'سجل دخولك لطرح سؤالك' : 'Sign in to ask your question'}
                    </Text>
                  </View>
                )}

                <Text style={[styles.welcomeTitle, isRTL && styles.rtlText]}>
                  {language === 'ar' ? 'مرحباً بك' : 'Welcome'}
                </Text>
                <Text style={[styles.appName, isRTL && styles.rtlText]}>
                  {langSettings?.appName || settings.appName || 'Labour Laws'}
                </Text>
                <Text style={[styles.welcomeSubtitle, isRTL && styles.rtlText]}>
                  {language === 'ar' 
                    ? 'دليلك الشامل لقوانين العمل في الخليج'
                    : 'Your complete guide to Gulf labor laws'}
                </Text>
              </Animated.View>

              {/* Features */}
              <View style={styles.featuresContainer}>
                {features.map((feature, index) => (
                  <Animated.View 
                    key={index}
                    style={[
                      styles.featureItem,
                      { 
                        opacity: fadeAnim,
                        transform: [{ 
                          translateY: fadeAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [30 + index * 10, 0],
                          })
                        }]
                      }
                    ]}
                  >
                    <View style={[styles.featureIcon, { backgroundColor: feature.color + '20' }]}>
                      <feature.icon size={20} color={feature.color} />
                    </View>
                    <View style={[styles.featureText, isRTL && { alignItems: 'flex-end' }]}>
                      <Text style={[styles.featureTitle, isRTL && styles.rtlText]}>{feature.title}</Text>
                      <Text style={[styles.featureDesc, isRTL && styles.rtlText]}>{feature.desc}</Text>
                    </View>
                  </Animated.View>
                ))}
              </View>

              {/* Action Buttons */}
              <View style={styles.actionsContainer}>
                {/* Social Login */}
                {hasSocialLogin && (
                  <View style={styles.socialSection}>
                    <View style={styles.socialRow}>
                      {socialLogin?.google?.enabled && (
                        <TouchableOpacity 
                          style={styles.socialBtn}
                          onPress={() => handleSocialLogin('Google')}
                        >
                          <Text style={styles.socialBtnIcon}>G</Text>
                        </TouchableOpacity>
                      )}
                      {socialLogin?.facebook?.enabled && (
                        <TouchableOpacity 
                          style={[styles.socialBtn, { backgroundColor: '#1877F2' }]}
                          onPress={() => handleSocialLogin('Facebook')}
                        >
                          <Text style={[styles.socialBtnIcon, { color: '#fff' }]}>f</Text>
                        </TouchableOpacity>
                      )}
                      {socialLogin?.apple?.enabled && (
                        <TouchableOpacity 
                          style={[styles.socialBtn, { backgroundColor: '#000' }]}
                          onPress={() => handleSocialLogin('Apple')}
                        >
                          <Text style={[styles.socialBtnIcon, { color: '#fff' }]}></Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    <View style={styles.divider}>
                      <View style={styles.dividerLine} />
                      <Text style={styles.dividerText}>
                        {language === 'ar' ? 'أو' : 'or'}
                      </Text>
                      <View style={styles.dividerLine} />
                    </View>
                  </View>
                )}

                {/* Primary Actions */}
                <TouchableOpacity 
                  style={styles.primaryBtn}
                  onPress={() => animateToForm('login')}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={['#6366F1', '#8B5CF6']}
                    style={styles.primaryBtnGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Mail size={20} color="#fff" />
                    <Text style={styles.primaryBtnText}>
                      {language === 'ar' ? 'تسجيل الدخول' : 'Sign In with Email'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.secondaryBtn}
                  onPress={() => animateToForm('register')}
                  activeOpacity={0.8}
                >
                  <Sparkles size={20} color="#fff" />
                  <Text style={styles.secondaryBtnText}>
                    {language === 'ar' ? 'إنشاء حساب جديد' : 'Create New Account'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Demo Accounts */}
              <View style={styles.demoSection}>
                <View style={styles.demoHeader}>
                  <Shield size={14} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.demoTitle}>
                    {language === 'ar' ? 'حسابات تجريبية' : 'Demo Accounts'}
                  </Text>
                </View>
                <Text style={styles.demoText}>admin@labourlaw.com • john@example.com</Text>
              </View>

              {/* Skip */}
              <TouchableOpacity 
                style={styles.skipBtn}
                onPress={() => router.push('/(tabs)/home')}
              >
                <Text style={styles.skipText}>
                  {language === 'ar' ? 'تخطي والمتابعة كزائر' : 'Skip & Continue as Guest'}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ) : (
            // Form View
            <Animated.View 
              style={[
                styles.formContainer,
                { transform: [{ translateY: cardSlide }] }
              ]}
            >
              <View style={[styles.formCard, { backgroundColor: theme.card }]}>
                {/* Form Header */}
                <View style={[styles.formHeader, isRTL && styles.rtlRow]}>
                  <TouchableOpacity 
                    style={[styles.backBtn, { backgroundColor: theme.backgroundSecondary }]}
                    onPress={animateBack}
                  >
                    <ChevronLeft 
                      size={24} 
                      color={theme.text} 
                      style={isRTL && { transform: [{ rotate: '180deg' }] }} 
                    />
                  </TouchableOpacity>
                  <View style={styles.formHeaderSpacer} />
                </View>

                {/* Form Logo */}
                {settings.logo && (
                  <View style={styles.formLogoSection}>
                    <Image 
                      source={{ uri: settings.logo }} 
                      style={styles.formLogo} 
                      contentFit="contain"
                    />
                  </View>
                )}

                {/* Form Title */}
                <View style={styles.formTitleSection}>
                  <Text style={[styles.formTitle, { color: theme.text }, isRTL && styles.rtlText]}>
                    {mode === 'login' 
                      ? (language === 'ar' ? 'مرحباً بعودتك' : 'Welcome Back')
                      : (language === 'ar' ? 'إنشاء حساب' : 'Create Account')}
                  </Text>
                  <Text style={[styles.formSubtitle, { color: theme.textSecondary }, isRTL && styles.rtlText]}>
                    {mode === 'login'
                      ? (language === 'ar' ? 'أدخل بياناتك للمتابعة' : 'Enter your details to continue')
                      : (language === 'ar' ? 'أنشئ حسابك للبدء' : 'Create your account to get started')}
                  </Text>
                </View>

                {/* Social in Form */}
                {hasSocialLogin && (
                  <View style={styles.formSocialSection}>
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
                          style={[styles.formSocialBtn, { borderColor: theme.border, backgroundColor: '#1877F2' }]}
                          onPress={() => handleSocialLogin('Facebook')}
                        >
                          <Text style={[styles.formSocialIcon, { color: '#fff' }]}>f</Text>
                        </TouchableOpacity>
                      )}
                      {socialLogin?.apple?.enabled && (
                        <TouchableOpacity 
                          style={[styles.formSocialBtn, { borderColor: theme.border, backgroundColor: '#000' }]}
                          onPress={() => handleSocialLogin('Apple')}
                        >
                          <Text style={[styles.formSocialIcon, { color: '#fff' }]}></Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    <View style={styles.formDivider}>
                      <View style={[styles.formDividerLine, { backgroundColor: theme.border }]} />
                      <Text style={[styles.formDividerText, { color: theme.textSecondary }]}>
                        {language === 'ar' ? 'أو بالبريد' : 'or with email'}
                      </Text>
                      <View style={[styles.formDividerLine, { backgroundColor: theme.border }]} />
                    </View>
                  </View>
                )}

                {/* Form Fields */}
                <View style={styles.formFields}>
                  {mode === 'register' && (
                    <View style={styles.inputGroup}>
                      <Text style={[styles.inputLabel, { color: theme.textSecondary }, isRTL && styles.rtlText]}>
                        {language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                      </Text>
                      <View style={[
                        styles.inputContainer, 
                        { 
                          backgroundColor: theme.backgroundSecondary, 
                          borderColor: focusedInput === 'name' ? theme.primary : theme.border 
                        }
                      ]}>
                        <User size={20} color={focusedInput === 'name' ? theme.primary : theme.textSecondary} />
                        <TextInput
                          style={[styles.input, { color: theme.text }, isRTL && styles.rtlText]}
                          placeholder={language === 'ar' ? 'أدخل اسمك' : 'Enter your name'}
                          value={name}
                          onChangeText={setName}
                          autoCapitalize="words"
                          placeholderTextColor={theme.textSecondary}
                          textAlign={isRTL ? 'right' : 'left'}
                          onFocus={() => setFocusedInput('name')}
                          onBlur={() => setFocusedInput(null)}
                        />
                        {name.length > 0 && (
                          <Check size={18} color="#10B981" />
                        )}
                      </View>
                    </View>
                  )}

                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: theme.textSecondary }, isRTL && styles.rtlText]}>
                      {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                    </Text>
                    <View style={[
                      styles.inputContainer, 
                      { 
                        backgroundColor: theme.backgroundSecondary, 
                        borderColor: focusedInput === 'email' ? theme.primary : theme.border 
                      }
                    ]}>
                      <Mail size={20} color={focusedInput === 'email' ? theme.primary : theme.textSecondary} />
                      <TextInput
                        style={[styles.input, { color: theme.text }, isRTL && styles.rtlText]}
                        placeholder="example@email.com"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        placeholderTextColor={theme.textSecondary}
                        textAlign={isRTL ? 'right' : 'left'}
                        onFocus={() => setFocusedInput('email')}
                        onBlur={() => setFocusedInput(null)}
                      />
                      {email.includes('@') && email.includes('.') && (
                        <Check size={18} color="#10B981" />
                      )}
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: theme.textSecondary }, isRTL && styles.rtlText]}>
                      {language === 'ar' ? 'كلمة المرور' : 'Password'}
                    </Text>
                    <View style={[
                      styles.inputContainer, 
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
                      <TouchableOpacity 
                        onPress={() => setShowPassword(!showPassword)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        {showPassword ? (
                          <EyeOff size={20} color={theme.textSecondary} />
                        ) : (
                          <Eye size={20} color={theme.textSecondary} />
                        )}
                      </TouchableOpacity>
                    </View>
                    {mode === 'register' && password.length > 0 && (
                      <View style={styles.passwordStrength}>
                        <View style={[
                          styles.strengthBar,
                          { backgroundColor: password.length >= 6 ? '#10B981' : '#EF4444' }
                        ]} />
                        <View style={[
                          styles.strengthBar,
                          { backgroundColor: password.length >= 8 ? '#10B981' : theme.border }
                        ]} />
                        <View style={[
                          styles.strengthBar,
                          { backgroundColor: password.length >= 10 && /[A-Z]/.test(password) ? '#10B981' : theme.border }
                        ]} />
                        <Text style={[styles.strengthText, { color: theme.textSecondary }]}>
                          {password.length < 6 ? (language === 'ar' ? 'ضعيفة' : 'Weak') : 
                           password.length < 8 ? (language === 'ar' ? 'متوسطة' : 'Medium') : 
                           (language === 'ar' ? 'قوية' : 'Strong')}
                        </Text>
                      </View>
                    )}
                  </View>

                  {mode === 'register' && (
                    <View style={styles.inputGroup}>
                      <Text style={[styles.inputLabel, { color: theme.textSecondary }, isRTL && styles.rtlText]}>
                        {language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                      </Text>
                      <View style={[
                        styles.inputContainer, 
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
                        {confirmPassword.length > 0 && confirmPassword === password && (
                          <Check size={18} color="#10B981" />
                        )}
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
                      style={styles.submitBtnGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      {isLoading ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <>
                          <Text style={styles.submitBtnText}>
                            {mode === 'login' 
                              ? (language === 'ar' ? 'تسجيل الدخول' : 'Sign In')
                              : (language === 'ar' ? 'إنشاء الحساب' : 'Create Account')}
                          </Text>
                          <ArrowRight size={20} color="#fff" style={isRTL && { transform: [{ rotate: '180deg' }] }} />
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Switch Mode */}
                  <TouchableOpacity 
                    style={styles.switchBtn}
                    onPress={() => {
                      resetForm();
                      setMode(mode === 'login' ? 'register' : 'login');
                    }}
                  >
                    <Text style={[styles.switchText, { color: theme.textSecondary }]}>
                      {mode === 'login'
                        ? (language === 'ar' ? 'ليس لديك حساب؟' : "Don't have an account?")
                        : (language === 'ar' ? 'لديك حساب بالفعل؟' : 'Already have an account?')}
                      {' '}
                      <Text style={[styles.switchLink, { color: theme.primary }]}>
                        {mode === 'login'
                          ? (language === 'ar' ? 'سجل الآن' : 'Sign Up')
                          : (language === 'ar' ? 'سجل دخول' : 'Sign In')}
                      </Text>
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.55,
  },
  decorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  decorCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  decorCircle1: {
    width: 300,
    height: 300,
    top: -100,
    right: -80,
  },
  decorCircle2: {
    width: 200,
    height: 200,
    top: height * 0.25,
    left: -80,
  },
  decorCircle3: {
    width: 150,
    height: 150,
    top: height * 0.4,
    right: -40,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingBottom: 40,
  },

  // Welcome Screen
  welcomeContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  logo: {
    width: 180,
    height: 70,
  },
  logoFallback: {
    width: 90,
    height: 90,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeTextSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  contextBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99,102,241,0.3)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    marginBottom: 20,
    gap: 8,
  },
  contextBannerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  appName: {
    fontSize: 34,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -1,
    marginBottom: 10,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresContainer: {
    marginBottom: 32,
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  socialSection: {
    marginBottom: 8,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialBtn: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  socialBtnIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: '#EA4335',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  dividerText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
  },
  primaryBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 12,
  },
  primaryBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    gap: 10,
  },
  secondaryBtnText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  demoSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  demoTitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  demoText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
  },

  // Form
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  formCard: {
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formHeaderSpacer: {
    flex: 1,
  },
  formLogoSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  formLogo: {
    width: 120,
    height: 48,
  },
  formTitleSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  formSubtitle: {
    fontSize: 14,
  },
  formSocialSection: {
    marginBottom: 20,
  },
  formSocialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  formSocialBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formSocialIcon: {
    fontSize: 18,
    fontWeight: '700',
  },
  formDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 10,
  },
  formDividerLine: {
    flex: 1,
    height: 1,
  },
  formDividerText: {
    fontSize: 12,
    fontWeight: '500',
  },
  formFields: {
    gap: 18,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 2,
    gap: 12,
    height: 56,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  passwordStrength: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 8,
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
  submitBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  submitBtnText: {
    fontSize: 17,
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
  rtlText: {
    textAlign: 'right',
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
});
