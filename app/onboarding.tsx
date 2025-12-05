import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  StatusBar,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Globe,
  Scale,
  MessageCircle,
  Shield,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Check,
} from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSettings } from '@/contexts/SettingsContext';

const { width, height } = Dimensions.get('window');
const ONBOARDING_KEY = '@onboarding_complete';

interface OnboardingFeature {
  id: string;
  icon: any;
  titleKey: string;
  descriptionKey: string;
  color: string;
  bgColor: string;
}

const features: OnboardingFeature[] = [
  {
    id: '1',
    icon: Globe,
    titleKey: 'onboardingTitle1',
    descriptionKey: 'onboardingDesc1',
    color: '#6366F1',
    bgColor: '#EEF2FF',
  },
  {
    id: '2',
    icon: Scale,
    titleKey: 'onboardingTitle2',
    descriptionKey: 'onboardingDesc2',
    color: '#10B981',
    bgColor: '#ECFDF5',
  },
  {
    id: '3',
    icon: MessageCircle,
    titleKey: 'onboardingTitle3',
    descriptionKey: 'onboardingDesc3',
    color: '#F59E0B',
    bgColor: '#FFFBEB',
  },
  {
    id: '4',
    icon: Shield,
    titleKey: 'onboardingTitle4',
    descriptionKey: 'onboardingDesc4',
    color: '#8B5CF6',
    bgColor: '#F5F3FF',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { t, isRTL, language } = useLanguage();
  const { settings } = useSettings();
  const [currentStep, setCurrentStep] = useState(0);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const featureAnims = useRef(features.map(() => new Animated.Value(0))).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Initial animations
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
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
      Animated.stagger(150, featureAnims.map(anim =>
        Animated.spring(anim, {
          toValue: 1,
          friction: 8,
          useNativeDriver: true,
        })
      )),
      Animated.spring(buttonAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate progress
    animateProgress(0);
  }, []);

  const animateProgress = (step: number) => {
    Animated.timing(progressAnim, {
      toValue: (step + 1) / features.length,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      router.replace('/');
    } catch (error) {
      console.error('Error saving onboarding state:', error);
      router.replace('/');
    }
  };

  const handleNext = () => {
    if (currentStep < features.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      animateProgress(nextStep);
      
      // Animate feature highlight
      Animated.sequence([
        Animated.timing(featureAnims[currentStep], {
          toValue: 0.5,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(featureAnims[nextStep], {
          toValue: 1.1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(featureAnims[nextStep], {
          toValue: 1,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      completeOnboarding();
    }
  };

  const isLastStep = currentStep === features.length - 1;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Background gradient */}
      <LinearGradient
        colors={['#F8FAFC', '#EEF2FF', '#F5F3FF']}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Decorative shapes */}
      <View style={[styles.decorCircle, styles.decorCircle1]} />
      <View style={[styles.decorCircle, styles.decorCircle2]} />
      <View style={[styles.decorCircle, styles.decorCircle3]} />

      {/* Skip button */}
      <TouchableOpacity 
        style={[styles.skipButton, isRTL && styles.skipButtonRTL]} 
        onPress={completeOnboarding}
      >
        <Text style={styles.skipText}>{t.skip || 'Skip'}</Text>
      </TouchableOpacity>

      {/* Main content */}
      <Animated.View 
        style={[
          styles.content,
          { opacity: fadeAnim }
        ]}
      >
        {/* Logo Section */}
        {settings.logo && (
          <Animated.View 
            style={[
              styles.logoSection,
              { transform: [{ scale: logoScale }] }
            ]}
          >
            <View style={styles.logoWrapper}>
              <Image 
                source={{ uri: settings.logo }} 
                style={styles.logo} 
                contentFit="contain"
              />
            </View>
          </Animated.View>
        )}

        {/* Welcome Text */}
        <Animated.View 
          style={[
            styles.welcomeSection,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          <Text style={[styles.welcomeTitle, isRTL && styles.rtlText]}>
            {language === 'ar' ? 'مرحباً بك في' : 'Welcome to'}
          </Text>
          <Text style={[styles.appName, isRTL && styles.rtlText]}>
            {settings.languageSettings?.[language]?.appName || settings.appName || 'Labour Laws'}
          </Text>
          <Text style={[styles.welcomeSubtitle, isRTL && styles.rtlText]}>
            {language === 'ar' 
              ? 'اكتشف قوانين العمل في الخليج بسهولة'
              : 'Discover Gulf labor laws with ease'}
          </Text>
        </Animated.View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <Animated.View 
              style={[
                styles.progressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {currentStep + 1} / {features.length}
          </Text>
        </View>

        {/* Features Grid */}
        <View style={styles.featuresSection}>
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isActive = index === currentStep;
            const isPassed = index < currentStep;
            
            return (
              <Animated.View
                key={feature.id}
                style={[
                  styles.featureCard,
                  isActive && styles.featureCardActive,
                  isPassed && styles.featureCardPassed,
                  {
                    opacity: featureAnims[index],
                    transform: [
                      {
                        scale: featureAnims[index].interpolate({
                          inputRange: [0, 0.5, 1, 1.1],
                          outputRange: [0.8, 0.9, 1, 1.02],
                        }),
                      },
                      {
                        translateY: featureAnims[index].interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.featureCardInner}
                  onPress={() => {
                    setCurrentStep(index);
                    animateProgress(index);
                  }}
                  activeOpacity={0.8}
                >
                  <View 
                    style={[
                      styles.featureIconContainer,
                      { backgroundColor: isActive ? feature.color : feature.bgColor }
                    ]}
                  >
                    {isPassed ? (
                      <Check size={22} color={feature.color} strokeWidth={2.5} />
                    ) : (
                      <Icon size={22} color={isActive ? '#fff' : feature.color} strokeWidth={2} />
                    )}
                  </View>
                  <View style={[styles.featureContent, isRTL && { alignItems: 'flex-end' }]}>
                    <Text 
                      style={[
                        styles.featureTitle, 
                        isActive && styles.featureTitleActive,
                        isRTL && styles.rtlText
                      ]}
                      numberOfLines={1}
                    >
                      {t[feature.titleKey as keyof typeof t] || feature.titleKey}
                    </Text>
                    <Text 
                      style={[
                        styles.featureDescription,
                        isRTL && styles.rtlText
                      ]}
                      numberOfLines={2}
                    >
                      {t[feature.descriptionKey as keyof typeof t] || feature.descriptionKey}
                    </Text>
                  </View>
                  {isActive && (
                    <View style={[styles.activeIndicator, { backgroundColor: feature.color }]} />
                  )}
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </Animated.View>

      {/* Bottom Section */}
      <Animated.View 
        style={[
          styles.bottomSection,
          {
            opacity: buttonAnim,
            transform: [
              {
                translateY: buttonAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity 
          style={styles.nextButton} 
          onPress={handleNext}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={isLastStep ? ['#10B981', '#059669'] : ['#6366F1', '#8B5CF6']}
            style={styles.nextButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {isLastStep ? (
              <>
                <Sparkles size={22} color="#fff" />
                <Text style={styles.nextButtonText}>
                  {t.getStarted || 'Get Started'}
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.nextButtonText}>
                  {t.next || 'Continue'}
                </Text>
                <ArrowRight size={22} color="#fff" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Trust indicators */}
        <View style={styles.trustSection}>
          <View style={styles.trustItem}>
            <Shield size={14} color="#6B7280" />
            <Text style={styles.trustText}>
              {language === 'ar' ? 'آمن وموثوق' : 'Secure & Trusted'}
            </Text>
          </View>
          <View style={styles.trustDot} />
          <View style={styles.trustItem}>
            <Globe size={14} color="#6B7280" />
            <Text style={styles.trustText}>
              {language === 'ar' ? '6 دول خليجية' : '6 Gulf Countries'}
            </Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  decorCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
  },
  decorCircle1: {
    width: 300,
    height: 300,
    top: -100,
    right: -100,
  },
  decorCircle2: {
    width: 200,
    height: 200,
    bottom: 100,
    left: -80,
    backgroundColor: 'rgba(139, 92, 246, 0.06)',
  },
  decorCircle3: {
    width: 150,
    height: 150,
    top: height * 0.4,
    right: -50,
    backgroundColor: 'rgba(16, 185, 129, 0.06)',
  },
  skipButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 24,
    zIndex: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  skipButtonRTL: {
    right: undefined,
    left: 24,
  },
  skipText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 100 : 80,
    paddingHorizontal: 24,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoWrapper: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  logo: {
    width: 280,
    height: 120,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  welcomeTitle: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    minWidth: 40,
    textAlign: 'right',
  },
  featuresSection: {
    gap: 12,
  },
  featureCard: {
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  featureCardActive: {
    shadowColor: '#6366F1',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  featureCardPassed: {
    opacity: 0.7,
  },
  featureCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 3,
  },
  featureTitleActive: {
    color: '#1F2937',
  },
  featureDescription: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 18,
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 50 : 32,
  },
  nextButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  nextButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  trustSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 8,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  trustText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  trustDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
  },
  rtlText: {
    textAlign: 'right',
  },
});
