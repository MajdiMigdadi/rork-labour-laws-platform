import { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Platform, Alert, Animated } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Calendar, ExternalLink, FileText, Bookmark, Share2, Copy, ArrowLeft, Scale, Clock, Globe } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import { useData } from '@/contexts/DataContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useTheme } from '@/hooks/useTheme';
import { useLanguage } from '@/contexts/LanguageContext';
import { useReadingHistory } from '@/contexts/ReadingHistoryContext';
import FlagDisplay from '@/components/FlagDisplay';
import ShareModal from '@/components/ShareModal';
import RelatedLaws from '@/components/RelatedLaws';

export default function LawDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { laws, countries, categories } = useData();
  const { toggleLawFavorite, isLawFavorited } = useFavorites();
  const theme = useTheme();
  const { getTranslatedName } = useLanguage();
  const { addToHistory } = useReadingHistory();
  const [shareModalVisible, setShareModalVisible] = useState(false);
  
  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  
  const law = laws.find(l => l.id === id);
  const country = law ? countries.find(c => c.id === law.countryId) : null;
  const category = law ? categories.find(c => c.id === law.categoryId) : null;
  
  useEffect(() => {
    if (law) {
      // Track in reading history
      addToHistory(law.id, 'law');
      
      Animated.stagger(100, [
        Animated.spring(headerAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(contentAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [law, headerAnim, contentAnim]);
  
  if (!law) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.backgroundSecondary }]}>
        <Text style={[styles.errorText, { color: theme.textSecondary }]}>Law not found</Text>
      </View>
    );
  }

  const handleShare = () => {
    setShareModalVisible(true);
  };

  const handleCopyLink = async () => {
    try {
      const link = `https://dlilk.me/law/${law.id}`;
      await Clipboard.setStringAsync(link);
      Alert.alert('Success', 'Link copied to clipboard!');
    } catch (error) {
      console.error('Copy error:', error);
      Alert.alert('Error', 'Failed to copy link');
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: '', 
          headerShown: true,
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.push('/(tabs)/laws')} style={styles.headerBtn}>
              <ArrowLeft size={20} color={theme.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={styles.headerRightRow}>
              <TouchableOpacity style={styles.headerBtn} onPress={handleShare}>
                <Share2 size={18} color={theme.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => toggleLawFavorite(law.id)}
                style={[styles.headerBtn, isLawFavorited(law.id) && styles.headerBtnActive]}
              >
                <Bookmark
                  size={18}
                  color={isLawFavorited(law.id) ? '#6366f1' : theme.textSecondary}
                  fill={isLawFavorited(law.id) ? '#6366f1' : 'transparent'}
                />
              </TouchableOpacity>
            </View>
          ),
        }} 
      />
      <ScrollView style={[styles.container, { backgroundColor: theme.backgroundSecondary }]} showsVerticalScrollIndicator={false}>
        {/* Stats Header */}
        <Animated.View
          style={[
            styles.statsSection,
            {
              opacity: headerAnim,
              transform: [{ translateY: headerAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, 0],
              })}],
            },
          ]}
        >
          <LinearGradient
            colors={['#6366f1', '#8b5cf6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statsCard}
          >
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <View style={styles.statIconBg}>
                  <Globe size={14} color="#6366f1" />
                </View>
                <View style={styles.statItemCenter}>
                  <FlagDisplay flag={country?.flag || ''} size="large" />
                  <Text style={styles.statLabel}>Country</Text>
                </View>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <View style={[styles.statIconBg, { backgroundColor: '#dbeafe' }]}>
                  <Scale size={14} color="#3b82f6" />
                </View>
                <View>
                  <Text style={styles.statValue} numberOfLines={1}>{category ? getTranslatedName(category).split(' ')[0] : ''}</Text>
                  <Text style={styles.statLabel}>Category</Text>
                </View>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <View style={[styles.statIconBg, { backgroundColor: '#dcfce7' }]}>
                  <Clock size={14} color="#22c55e" />
                </View>
                <View>
                  <Text style={styles.statValue}>Active</Text>
                  <Text style={styles.statLabel}>Status</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Law Content */}
        <Animated.View
          style={[
            styles.contentSection,
            { backgroundColor: theme.card },
            {
              opacity: contentAnim,
              transform: [{ translateY: contentAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              })}],
            },
          ]}
        >
          {/* Country & Category Badges */}
          <View style={styles.badgesRow}>
            <View style={[styles.badge, { backgroundColor: theme.backgroundSecondary }]}>
              <Text style={styles.badgeFlag}>{country?.flag}</Text>
              <Text style={[styles.badgeText, { color: theme.text }]}>{country ? getTranslatedName(country) : ''}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: '#8b5cf6' }]}>
              <Text style={styles.badgeTextWhite}>{category ? getTranslatedName(category) : ''}</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: theme.text }]}>{law.title}</Text>
          
          {/* Description */}
          <Text style={[styles.description, { color: theme.textSecondary }]}>{law.description}</Text>

          {/* Dates */}
          <View style={[styles.datesRow, { borderTopColor: theme.border }]}>
            <View style={styles.dateItem}>
              <Calendar size={14} color="#6366f1" />
              <Text style={[styles.dateLabel, { color: theme.textSecondary }]}>Effective</Text>
              <Text style={[styles.dateValue, { color: theme.text }]}>
                {new Date(law.effectiveDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
            </View>
            <View style={[styles.dateDivider, { backgroundColor: theme.border }]} />
            <View style={styles.dateItem}>
              <FileText size={14} color="#22c55e" />
              <Text style={[styles.dateLabel, { color: theme.textSecondary }]}>Updated</Text>
              <Text style={[styles.dateValue, { color: theme.text }]}>
                {new Date(law.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Full Content Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Full Content</Text>
          <View style={[styles.contentCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.contentText, { color: theme.text }]}>{law.content}</Text>
          </View>
        </View>

        {/* Source Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Official Source</Text>
          <TouchableOpacity style={[styles.sourceCard, { backgroundColor: theme.card }]} activeOpacity={0.7}>
            <View style={styles.sourceIconBg}>
              <ExternalLink size={16} color="#6366f1" />
            </View>
            <Text style={[styles.sourceText, { color: theme.primary }]} numberOfLines={1}>
              {law.source}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <View style={styles.actionsRow}>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.card }]} onPress={handleShare}>
              <Share2 size={16} color="#6366f1" />
              <Text style={styles.actionBtnText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.card }]} onPress={handleCopyLink}>
              <Copy size={16} color="#6366f1" />
              <Text style={styles.actionBtnText}>Copy</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Related Laws */}
        <RelatedLaws 
          currentLawId={law.id}
          categoryId={law.categoryId}
          countryId={law.countryId}
        />

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={[styles.disclaimerText, { color: theme.textSecondary }]}>
            This information is provided for reference purposes only. Please consult with legal professionals for advice specific to your situation.
          </Text>
        </View>
      </ScrollView>

      {/* Share Modal */}
      <ShareModal
        visible={shareModalVisible}
        onClose={() => setShareModalVisible(false)}
        title={law.title}
        content={law.description}
        type="law"
        url={`https://dlilk.me/law/${law.id}`}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
  },
  
  // Header
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  headerBtnActive: {
    backgroundColor: '#eef2ff',
  },
  headerRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  // Stats Section
  statsSection: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
  },
  statsCard: {
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    gap: 10,
  },
  statIconBg: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 16,
  },
  statValueFlag: {
    fontSize: 22,
  },
  statItemCenter: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  
  // Content Section
  contentSection: {
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  badgeFlag: {
    fontSize: 14,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  badgeTextWhite: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
    lineHeight: 23,
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 12,
  },
  datesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  dateItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateLabel: {
    fontSize: 10,
  },
  dateValue: {
    fontSize: 11,
    fontWeight: '600',
  },
  dateDivider: {
    width: 1,
    height: 24,
    marginHorizontal: 10,
  },
  
  // Sections
  section: {
    paddingHorizontal: 12,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  contentCard: {
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  contentText: {
    fontSize: 13,
    lineHeight: 21,
  },
  sourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  sourceIconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sourceText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  
  // Actions
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 10,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6366f1',
  },
  
  // Disclaimer
  disclaimer: {
    padding: 12,
    paddingTop: 20,
    paddingBottom: 120,
  },
  disclaimerText: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 17,
    fontStyle: 'italic',
  },
});
