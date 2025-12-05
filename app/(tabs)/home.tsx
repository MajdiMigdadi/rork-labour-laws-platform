import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { 
  Scale, 
  Globe, 
  MessageCircle, 
  Shield, 
  ChevronRight, 
  ArrowRight,
  BookOpen,
  Users,
  Sparkles,
  Search,
  Star,
  Zap,
  TrendingUp,
  Award,
  Calculator,
  Clock,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useTheme } from '@/hooks/useTheme';
import { useData } from '@/contexts/DataContext';
import { useReadingHistory } from '@/contexts/ReadingHistoryContext';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { isRTL, language, t, changeLanguage } = useLanguage();
  const { settings, isLoading: settingsLoading } = useSettings();
  const theme = useTheme();
  const { countries, laws, categories, questions } = useData();
  const { history, recentLaws, recentQuestions } = useReadingHistory();

  const langSettings = settings.languageSettings[language];

  // Debug: Log if logo is present
  console.log('=== HOME PAGE DEBUG ===');
  console.log('Settings loading:', settingsLoading);
  console.log('Logo value:', settings.logo ? 'SET' : 'NOT SET');
  console.log('Logo length:', settings.logo?.length || 0);
  if (settings.logo) {
    console.log('Logo preview:', settings.logo.substring(0, 80) + '...');
  }
  console.log('========================');

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push('/(tabs)/laws');
    } else {
      router.push('/(tabs)/login' as any);
    }
  };

  const handleExploreLaws = () => {
    router.push('/(tabs)/laws');
  };

  const handleAskQuestion = () => {
    router.push('/(tabs)/ask-question' as any);
  };

  const quickActions = [
    {
      icon: Search,
      title: t.browseLaws,
      description: t.exploreDatabase,
      color: '#6366f1',
      gradient: ['#6366f1', '#8b5cf6'],
      onPress: handleExploreLaws,
    },
    {
      icon: MessageCircle,
      title: t.askQuestion,
      description: t.getExpertHelp,
      color: '#06b6d4',
      gradient: ['#06b6d4', '#22d3ee'],
      onPress: handleAskQuestion,
    },
    {
      icon: Globe,
      title: t.countries,
      description: `${countries.length} ${t.available}`,
      color: '#10b981',
      gradient: ['#10b981', '#34d399'],
      onPress: handleExploreLaws,
    },
    {
      icon: Calculator,
      title: t.calculatorTools || 'Calculators',
      description: t.calculateBenefits || 'Calculate benefits',
      color: '#f59e0b',
      gradient: ['#f59e0b', '#f97316'],
      onPress: () => router.push('/(tabs)/calculators'),
    },
  ];

  const features = [
    {
      icon: Globe,
      title: t.globalCoverage,
      description: t.globalCoverageDesc,
      color: '#6366f1',
      bgColor: '#eef2ff',
    },
    {
      icon: MessageCircle,
      title: t.expertCommunity,
      description: t.expertCommunityDesc,
      color: '#06b6d4',
      bgColor: '#ecfeff',
    },
    {
      icon: Shield,
      title: t.verifiedUpdated,
      description: t.verifiedUpdatedDesc,
      color: '#10b981',
      bgColor: '#ecfdf5',
    },
    {
      icon: Zap,
      title: t.fastSearch,
      description: t.fastSearchDesc,
      color: '#f59e0b',
      bgColor: '#fffbeb',
    },
  ];

  const stats = [
    { value: `${countries.length}+`, label: t.countries, icon: Globe, color: '#6366f1' },
    { value: `${laws.length}+`, label: t.laws, icon: BookOpen, color: '#06b6d4' },
    { value: `${categories.length}`, label: t.categories, icon: Award, color: '#10b981' },
    { value: '24/7', label: t.access, icon: Zap, color: '#f59e0b' },
  ];

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Section */}
      <View style={styles.heroWrapper}>
        <LinearGradient
          colors={['#1e1b4b', '#312e81', '#4338ca']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          {/* Decorative Elements */}
          <View style={styles.heroDecoration1} />
          <View style={styles.heroDecoration2} />
          <View style={styles.heroDecoration3} />
          
          {/* Language Toggle - Top Right */}
          <TouchableOpacity 
            style={styles.languageToggle}
            onPress={() => changeLanguage(language === 'en' ? 'ar' : 'en')}
            activeOpacity={0.8}
          >
            <Globe size={16} color="#fff" />
            <Text style={styles.languageToggleText}>
              {language === 'en' ? 'العربية' : 'English'}
            </Text>
          </TouchableOpacity>

          <View style={styles.heroContent}>
            {/* Badge */}
            <View style={[styles.heroBadge, isRTL && styles.rtl]}>
              <Sparkles size={14} color="#fbbf24" />
              <Text style={styles.heroBadgeText}>{t.trustedByUsers}</Text>
            </View>

            {/* Logo */}
            <View style={styles.logoContainer}>
              {settingsLoading ? (
                <View style={styles.logoFallback}>
                  <Text style={{ color: '#fff', fontSize: 12 }}>Loading...</Text>
                </View>
              ) : settings.logoDark ? (
                <Image 
                  source={{ uri: settings.logoDark }} 
                  style={styles.logo} 
                  contentFit="contain"
                  onError={(e) => {
                    console.log('Logo error:', e);
                  }}
                />
              ) : settings.logo ? (
                <Image 
                  source={{ uri: settings.logo }} 
                  style={styles.logo} 
                  contentFit="contain"
                  onError={(e) => {
                    console.log('Logo error:', e);
                  }}
                />
              ) : (
                <LinearGradient
                  colors={['#6366f1', '#8b5cf6']}
                  style={styles.logoFallbackGradient}
                >
                  <Scale size={40} color="#fff" strokeWidth={2} />
                </LinearGradient>
              )}
            </View>

            {/* Title */}
            <Text style={styles.heroTitle}>
              {langSettings?.appName || settings.appName}
            </Text>
            
            {/* Subtitle */}
            <Text style={[styles.heroSubtitle, isRTL && styles.rtlText]}>
              {langSettings?.appDescription || 'Your comprehensive guide to understanding labour laws across the globe'}
            </Text>

            {/* CTA Buttons */}
            <View style={styles.heroButtons}>
              <TouchableOpacity 
                style={styles.primaryButton} 
                onPress={handleGetStarted}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#6366f1', '#8b5cf6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.primaryButtonGradient, isRTL && styles.rtl]}
                >
                  <Text style={styles.primaryButtonText}>
                    {isAuthenticated ? t.exploreLaws : t.getStarted}
                  </Text>
                  <ArrowRight size={20} color="#fff" style={isRTL ? { transform: [{ rotate: '180deg' }] } : {}} />
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.secondaryButton} 
                onPress={handleAskQuestion}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryButtonText}>{t.askAQuestion}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsSection}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickActionsScroll}
        >
          {quickActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <TouchableOpacity 
                key={index} 
                style={styles.quickActionCard}
                onPress={action.onPress}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={action.gradient}
                  style={styles.quickActionIcon}
                >
                  <IconComponent size={24} color="#fff" />
                </LinearGradient>
                <Text style={[styles.quickActionTitle, { color: theme.text }, isRTL && styles.rtlText]}>{action.title}</Text>
                <Text style={[styles.quickActionDesc, { color: theme.textSecondary }, isRTL && styles.rtlText]}>{action.description}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Stats Section */}
      <View style={[styles.statsSection, { backgroundColor: theme.card, borderColor: theme.border }, isRTL && styles.rtl]}>
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <View key={index} style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: `${stat.color}15` }]}>
                <IconComponent size={20} color={stat.color} />
              </View>
              <Text style={[styles.statValue, { color: theme.text }, isRTL && styles.rtlText]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }, isRTL && styles.rtlText]}>{stat.label}</Text>
            </View>
          );
        })}
      </View>

      {/* Recently Viewed Section */}
      {history.length > 0 && (
        <View style={styles.recentlyViewedSection}>
          <View style={[styles.sectionHeaderRow, isRTL && styles.rtl]}>
            <View style={[styles.sectionHeaderLeft, isRTL && styles.rtl]}>
              <Clock size={18} color="#0ea5e9" />
              <Text style={[styles.recentlyViewedTitle, { color: theme.text }]}>
                {t.readingHistory || 'Recently Viewed'}
              </Text>
            </View>
            <TouchableOpacity 
              onPress={() => router.push('/(tabs)/history')}
              style={styles.viewAllBtn}
            >
              <Text style={styles.viewAllText}>{t.viewAll || 'View All'}</Text>
              <ChevronRight size={16} color="#0ea5e9" />
            </TouchableOpacity>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recentlyViewedScroll}
          >
            {history.slice(0, 5).map((item, index) => {
              const isLaw = item.type === 'law';
              const data = isLaw 
                ? laws.find(l => l.id === item.id)
                : questions.find(q => q.id === item.id);
              if (!data) return null;
              
              return (
                <TouchableOpacity
                  key={`${item.type}-${item.id}`}
                  style={[styles.recentCard, { backgroundColor: theme.card }]}
                  onPress={() => {
                    if (isLaw) {
                      router.push(`/(tabs)/law-detail?id=${item.id}`);
                    } else {
                      router.push(`/(tabs)/question-detail?id=${item.id}`);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.recentTypeBadge, { backgroundColor: isLaw ? '#eef2ff' : '#fef3c7' }]}>
                    {isLaw ? (
                      <BookOpen size={14} color="#6366f1" />
                    ) : (
                      <MessageCircle size={14} color="#f59e0b" />
                    )}
                  </View>
                  <Text style={[styles.recentCardTitle, { color: theme.text }]} numberOfLines={2}>
                    {data.title}
                  </Text>
                  <View style={[styles.recentCardMeta, isRTL && styles.rtl]}>
                    <Clock size={10} color={theme.textSecondary} />
                    <Text style={[styles.recentCardMetaText, { color: theme.textSecondary }]}>
                      {item.viewCount} {item.viewCount === 1 ? (t.view || 'view') : (t.views || 'views')}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Features Section */}
      <View style={styles.featuresSection}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTag, { color: theme.primary }, isRTL && styles.rtlText]}>{t.whyChooseUs}</Text>
          <Text style={[styles.sectionTitle, { color: theme.text }, isRTL && styles.rtlText]}>
            {t.everythingYouNeed}
          </Text>
        </View>

        <View style={styles.featuresGrid}>
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <View 
                key={index} 
                style={[
                  styles.featureCard, 
                  { backgroundColor: theme.card, borderColor: theme.border }
                ]}
              >
                <View style={[styles.featureIconContainer, { backgroundColor: feature.bgColor }]}>
                  <IconComponent size={28} color={feature.color} />
                </View>
                <Text style={[styles.featureTitle, { color: theme.text }, isRTL && styles.rtlText]}>{feature.title}</Text>
                <Text style={[styles.featureDescription, { color: theme.textSecondary }, isRTL && styles.rtlText]}>
                  {feature.description}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* How It Works */}
      <View style={[styles.howItWorksSection, { backgroundColor: theme.backgroundSecondary }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTag, { color: theme.primary }, isRTL && styles.rtlText]}>{t.howItWorks}</Text>
          <Text style={[styles.sectionTitle, { color: theme.text }, isRTL && styles.rtlText]}>
            {t.getStartedSteps}
          </Text>
        </View>

        <View style={[styles.stepsContainer, isRTL && styles.rtl]}>
          {[
            { step: '01', title: t.stepSearch, desc: t.stepSearchDesc },
            { step: '02', title: t.stepLearn, desc: t.stepLearnDesc },
            { step: '03', title: t.stepAsk, desc: t.stepAskDesc },
          ].map((item, index) => (
            <View key={index} style={[styles.stepCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.stepNumber}>
                <LinearGradient
                  colors={['#6366f1', '#8b5cf6']}
                  style={styles.stepNumberGradient}
                >
                  <Text style={styles.stepNumberText}>{item.step}</Text>
                </LinearGradient>
              </View>
              <Text style={[styles.stepTitle, { color: theme.text }, isRTL && styles.rtlText]}>{item.title}</Text>
              <Text style={[styles.stepDesc, { color: theme.textSecondary }, isRTL && styles.rtlText]}>{item.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* CTA Section */}
      <View style={styles.ctaSection}>
        <LinearGradient
          colors={['#1e1b4b', '#312e81']}
          style={styles.ctaGradient}
        >
          <View style={styles.ctaDecoration} />
          <Star size={32} color="#fbbf24" style={styles.ctaStar1} />
          <Star size={24} color="#fbbf24" style={styles.ctaStar2} />
          
          <Text style={[styles.ctaTitle, isRTL && styles.rtlText]}>{t.readyToExplore}</Text>
          <Text style={[styles.ctaSubtitle, isRTL && styles.rtlText]}>
            {t.joinThousands}
          </Text>
          
          <TouchableOpacity 
            style={styles.ctaButton} 
            onPress={handleGetStarted}
            activeOpacity={0.9}
          >
            <Text style={styles.ctaButtonText}>
              {isAuthenticated ? t.browseLawsNow : t.createFreeAccount}
            </Text>
            <ChevronRight size={20} color="#1e1b4b" style={isRTL ? { transform: [{ rotate: '180deg' }] } : {}} />
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* Footer */}
      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        <Text style={[styles.footerText, { color: theme.textSecondary }]}>
          {langSettings?.footerText || settings.footerText}
        </Text>
        <Text style={[styles.footerCopyright, { color: theme.textSecondary }]}>
          © 2024 {t.allRightsReserved}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Hero Section
  heroWrapper: {
    overflow: 'hidden',
  },
  hero: {
    paddingTop: 60,
    paddingBottom: 50,
    paddingHorizontal: 24,
    position: 'relative',
    minHeight: 480,
  },
  heroDecoration1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
  },
  heroDecoration2: {
    position: 'absolute',
    bottom: -50,
    left: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
  },
  heroDecoration3: {
    position: 'absolute',
    top: 100,
    left: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
  },
  languageToggle: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  languageToggleText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    borderRadius: 30,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
  },
  heroContent: {
    alignItems: 'center',
    zIndex: 1,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    marginBottom: 24,
  },
  heroBadgeText: {
    color: '#fbbf24',
    fontSize: 13,
    fontWeight: '600' as const,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  logoContainer: {
    width: 280,
    height: 120,
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 280,
    height: 120,
  },
  logoFallback: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoFallbackGradient: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '800' as const,
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 17,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 26,
    maxWidth: 340,
  },
  heroButtons: {
    gap: 12,
    width: '100%',
    maxWidth: 300,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700' as const,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600' as const,
  },

  // Quick Actions
  quickActionsSection: {
    marginTop: -30,
    zIndex: 10,
  },
  quickActionsScroll: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 12,
  },
  quickActionCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    width: 140,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginRight: 12,
  },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  quickActionDesc: {
    fontSize: 12,
    textAlign: 'center',
  },

  // Stats Section
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 24,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800' as const,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
  },

  // Recently Viewed Section
  recentlyViewedSection: {
    marginTop: 24,
    paddingBottom: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recentlyViewedTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0ea5e9',
  },
  recentlyViewedScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  recentCard: {
    width: 160,
    padding: 14,
    borderRadius: 16,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  recentTypeBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  recentCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
    marginBottom: 8,
  },
  recentCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recentCardMetaText: {
    fontSize: 11,
  },

  // Features Section
  featuresSection: {
    padding: 24,
    paddingTop: 40,
  },
  sectionHeader: {
    marginBottom: 24,
  },
  sectionTag: {
    fontSize: 12,
    fontWeight: '700' as const,
    letterSpacing: 1,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: '800' as const,
    lineHeight: 34,
  },
  featuresGrid: {
    gap: 16,
  },
  featureCard: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 22,
  },

  // How It Works Section
  howItWorksSection: {
    padding: 24,
    paddingVertical: 40,
  },
  stepsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  stepCard: {
    flex: 1,
    minWidth: 100,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  stepNumber: {
    marginBottom: 12,
  },
  stepNumberGradient: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800' as const,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 12,
    textAlign: 'center',
  },

  // CTA Section
  ctaSection: {
    margin: 16,
    borderRadius: 24,
    overflow: 'hidden',
  },
  ctaGradient: {
    padding: 32,
    alignItems: 'center',
    position: 'relative',
  },
  ctaDecoration: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(99, 102, 241, 0.3)',
  },
  ctaStar1: {
    position: 'absolute',
    top: 20,
    right: 30,
    opacity: 0.6,
  },
  ctaStar2: {
    position: 'absolute',
    bottom: 40,
    left: 30,
    opacity: 0.4,
  },
  ctaTitle: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  ctaSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
    maxWidth: 300,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#1e1b4b',
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderTopWidth: 1,
  },
  footerText: {
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  footerCopyright: {
    fontSize: 12,
  },

  // RTL Support
  rtl: {
    flexDirection: 'row-reverse',
  },
  rtlText: {
    textAlign: 'right',
  },
});
