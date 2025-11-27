import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Scale, Globe, MessageCircle, Shield, ChevronRight, Check } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useTheme } from '@/hooks/useTheme';

export default function HomeScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { isRTL, language } = useLanguage();
  const { settings } = useSettings();
  const theme = useTheme();

  const langSettings = settings.languageSettings[language];

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push('/(tabs)/laws');
    } else {
      router.push('/(tabs)/login' as any);
    }
  };

  const features = [
    {
      icon: Globe,
      title: 'Global Coverage',
      description: 'Access labour laws from countries worldwide',
      color: theme.primary,
    },
    {
      icon: MessageCircle,
      title: 'Q&A Community',
      description: 'Ask questions and get expert answers',
      color: theme.secondary,
    },
    {
      icon: Shield,
      title: 'Verified Information',
      description: 'All information is verified and up-to-date',
      color: theme.accent,
    },
  ];

  const benefits = [
    'Comprehensive labour law database',
    'Expert community support',
    'Regular updates and amendments',
    'Multi-language support',
    'User reputation system',
    'Advanced search and filters',
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={[theme.primary, theme.secondary]}
        style={styles.hero}
      >
        <View style={styles.heroContent}>
          {settings.logo ? (
            <View style={styles.logoContainer}>
              <Image source={{ uri: settings.logo }} style={styles.logo} resizeMode="contain" />
            </View>
          ) : (
            <View style={styles.iconContainer}>
              <Scale size={64} color="#fff" strokeWidth={2} />
            </View>
          )}
          <Text style={styles.heroTitle}>{langSettings?.appName || settings.appName}</Text>
          <Text style={[styles.heroSubtitle, isRTL && styles.rtlText]}>
            {langSettings?.appDescription || settings.appDescription}
          </Text>
          <TouchableOpacity style={[styles.ctaButton, isRTL && styles.rtl]} onPress={handleGetStarted}>
            <Text style={[styles.ctaButtonText, { color: theme.primary }]}>Get Started</Text>
            <ChevronRight size={20} color={theme.primary} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={[styles.content, { backgroundColor: theme.background }]}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Why Choose Us</Text>
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <View key={index} style={[styles.featureCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <View style={[styles.featureIconContainer, { backgroundColor: `${feature.color}15` }]}>
                    <IconComponent size={32} color={feature.color} />
                  </View>
                  <Text style={[styles.featureTitle, { color: theme.text }, isRTL && styles.rtlText]}>{feature.title}</Text>
                  <Text style={[styles.featureDescription, { color: theme.textSecondary }, isRTL && styles.rtlText]}>{feature.description}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>What You Get</Text>
          <View style={styles.benefitsList}>
            {benefits.map((benefit, index) => (
              <View key={index} style={[styles.benefitItem, { backgroundColor: theme.card, borderColor: theme.border }, isRTL && styles.rtl]}>
                <View style={[styles.checkIcon, { backgroundColor: theme.primary }]}>
                  <Check size={16} color="#fff" />
                </View>
                <Text style={[styles.benefitText, { color: theme.text }, isRTL && styles.rtlText]}>{benefit}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.statsSection, { backgroundColor: theme.backgroundSecondary }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.primary }]}>150+</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Countries</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.primary }]}>5K+</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Laws</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.primary }]}>10K+</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Users</Text>
          </View>
        </View>

        <View style={[styles.ctaSection, { backgroundColor: theme.backgroundSecondary }]}>
          <Text style={[styles.ctaTitle, { color: theme.text }]}>Ready to get started?</Text>
          <Text style={[styles.ctaText, { color: theme.textSecondary }, isRTL && styles.rtlText]}>
            Join thousands of users accessing labour law information worldwide
          </Text>
          <TouchableOpacity style={[styles.ctaButtonSecondary, { backgroundColor: theme.primary }]} onPress={handleGetStarted}>
            <Text style={styles.ctaButtonSecondaryText}>Join Now</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>{langSettings?.footerText || settings.footerText}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  hero: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  heroContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    width: 120,
    height: 120,
    marginBottom: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '800' as const,
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 26,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    gap: 8,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.light.primary,
  },
  content: {
    padding: 24,
  },
  section: {
    marginBottom: 48,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  featuresGrid: {
    gap: 16,
  },
  featureCard: {
    backgroundColor: Colors.light.card,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  featureIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  benefitsList: {
    gap: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.light.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    fontSize: 16,
    color: Colors.light.text,
    flex: 1,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.light.backgroundSecondary,
    padding: 32,
    borderRadius: 16,
    marginBottom: 48,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '800' as const,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  ctaSection: {
    backgroundColor: Colors.light.backgroundSecondary,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 48,
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  ctaText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  ctaButtonSecondary: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
  },
  ctaButtonSecondaryText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#fff',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  rtl: {
    flexDirection: 'row-reverse',
  },
  rtlText: {
    textAlign: 'right',
  },
});
