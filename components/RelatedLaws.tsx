import { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { BookOpen, ChevronRight, Sparkles } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useLanguage } from '@/contexts/LanguageContext';
import { useData } from '@/contexts/DataContext';
import FlagDisplay from '@/components/FlagDisplay';
import * as Haptics from 'expo-haptics';

interface RelatedLawsProps {
  currentLawId: string;
  categoryId?: string;
  countryId?: string;
  limit?: number;
}

export default function RelatedLaws({ 
  currentLawId, 
  categoryId, 
  countryId,
  limit = 5 
}: RelatedLawsProps) {
  const router = useRouter();
  const theme = useTheme();
  const { t, isRTL, getTranslatedName } = useLanguage();
  const { laws, countries, categories } = useData();

  const relatedLaws = useMemo(() => {
    // Score each law for relevance
    const scoredLaws = laws
      .filter(law => law.id !== currentLawId)
      .map(law => {
        let score = 0;
        
        // Same category = high relevance
        if (categoryId && law.categoryId === categoryId) {
          score += 10;
        }
        
        // Same country = medium relevance
        if (countryId && law.countryId === countryId) {
          score += 5;
        }
        
        // Random factor for variety
        score += Math.random() * 2;
        
        return { law, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.law);

    return relatedLaws;
  }, [laws, currentLawId, categoryId, countryId, limit]);

  if (relatedLaws.length === 0) return null;

  const handlePress = (lawId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/(tabs)/law-detail?id=${lawId}`);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, isRTL && styles.rtl]}>
        <View style={[styles.headerLeft, isRTL && styles.rtl]}>
          <Sparkles size={18} color="#f59e0b" />
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            {t.relatedLaws || 'Related Laws'}
          </Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {relatedLaws.map((law) => {
          const country = countries.find(c => c.id === law.countryId);
          const category = categories.find(c => c.id === law.categoryId);

          return (
            <TouchableOpacity
              key={law.id}
              style={[styles.card, { backgroundColor: theme.card }]}
              onPress={() => handlePress(law.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.cardHeader, isRTL && styles.rtl]}>
                {country && (
                  <View style={styles.countryBadge}>
                    <FlagDisplay countryCode={country.code} size={14} />
                  </View>
                )}
                {category && (
                  <View style={[styles.categoryBadge, { backgroundColor: theme.backgroundSecondary }]}>
                    <Text style={[styles.categoryText, { color: theme.textSecondary }]} numberOfLines={1}>
                      {getTranslatedName(category)}
                    </Text>
                  </View>
                )}
              </View>

              <Text 
                style={[styles.cardTitle, { color: theme.text }, isRTL && styles.rtlText]} 
                numberOfLines={2}
              >
                {law.title}
              </Text>

              <View style={[styles.cardFooter, isRTL && styles.rtl]}>
                <View style={[styles.readMore, { backgroundColor: '#eef2ff' }]}>
                  <BookOpen size={12} color="#6366f1" />
                  <Text style={styles.readMoreText}>{t.read || 'Read'}</Text>
                </View>
                <ChevronRight size={16} color={theme.textSecondary} style={isRTL && { transform: [{ rotate: '180deg' }] }} />
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    width: 200,
    padding: 14,
    borderRadius: 16,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  countryBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    flex: 1,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: 12,
    minHeight: 40,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  readMore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  readMoreText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366f1',
  },
  rtl: {
    flexDirection: 'row-reverse',
  },
  rtlText: {
    textAlign: 'right',
  },
});

