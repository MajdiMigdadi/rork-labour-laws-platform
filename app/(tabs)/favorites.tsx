import { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Bookmark, BookOpen, MessageCircle, ChevronRight, Sparkles } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useData } from '@/contexts/DataContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/hooks/useTheme';

type TabType = 'laws' | 'questions';

export default function FavoritesScreen() {
  const router = useRouter();
  const { laws, questions, countries, categories } = useData();
  const { favorites, toggleLawFavorite, toggleQuestionFavorite } = useFavorites();
  const { isRTL } = useLanguage();
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('laws');

  const favoritedLaws = useMemo(() => {
    return laws.filter(law => favorites.laws.includes(law.id));
  }, [laws, favorites.laws]);

  const favoritedQuestions = useMemo(() => {
    return questions.filter(question => favorites.questions.includes(question.id));
  }, [questions, favorites.questions]);

  const getCountryName = (countryId: string) => {
    return countries.find(c => c.id === countryId)?.name || '';
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || '';
  };

  const renderLawItem = ({ item }: { item: typeof laws[0] }) => (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, shadowColor: theme.shadow }]}>
      <TouchableOpacity
        style={styles.cardContent}
        activeOpacity={0.7}
        onPress={() => router.push(`/(tabs)/law-detail?id=${item.id}`)}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.badges, isRTL && styles.rtl]}>
            <View style={[styles.countryBadge, { backgroundColor: theme.backgroundSecondary }]}>
              <Text style={[styles.countryBadgeText, { color: theme.text }]}>
                {countries.find(c => c.id === item.countryId)?.flag} {getCountryName(item.countryId)}
              </Text>
            </View>
            <View style={[styles.categoryBadge, { backgroundColor: theme.secondary }]}>
              <Text style={styles.categoryBadgeText}>{getCategoryName(item.categoryId)}</Text>
            </View>
          </View>
        </View>
        <Text style={[styles.cardTitle, { color: theme.text }, isRTL && styles.rtlText]}>{item.title}</Text>
        <Text style={[styles.cardDescription, { color: theme.textSecondary }, isRTL && styles.rtlText]} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={[styles.cardFooter, isRTL && styles.rtl]}>
          <Text style={[styles.cardMeta, { color: theme.textSecondary }, isRTL && styles.rtlText]}>
            {new Date(item.lastUpdated).toLocaleDateString()}
          </Text>
          <ChevronRight size={20} color={theme.textSecondary} style={isRTL ? { transform: [{ rotate: '180deg' }] } : {}} />
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.bookmarkButton}
        onPress={() => toggleLawFavorite(item.id)}
        activeOpacity={0.7}
      >
        <Bookmark
          size={22}
          color={theme.primary}
          fill={theme.primary}
        />
      </TouchableOpacity>
    </View>
  );

  const renderQuestionItem = ({ item }: { item: typeof questions[0] }) => (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, shadowColor: theme.shadow }]}>
      <TouchableOpacity
        style={styles.cardContent}
        activeOpacity={0.7}
        onPress={() => router.push(`/(tabs)/question-detail?id=${item.id}`)}
      >
        <View style={[styles.questionBadges, isRTL && styles.rtl]}>
          <Text style={styles.countryFlag}>
            {countries.find(c => c.id === item.countryId)?.flag}
          </Text>
          {item.tags.slice(0, 2).map(tag => (
            <View key={tag} style={[styles.tag, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
              <Text style={[styles.tagText, { color: theme.text }]}>{tag}</Text>
            </View>
          ))}
        </View>
        <Text style={[styles.cardTitle, { color: theme.text }, isRTL && styles.rtlText]}>{item.title}</Text>
        <Text style={[styles.cardDescription, { color: theme.textSecondary }, isRTL && styles.rtlText]} numberOfLines={2}>
          {item.content}
        </Text>
        <View style={[styles.cardFooter, isRTL && styles.rtl]}>
          <View style={[styles.questionStats, isRTL && styles.rtl]}>
            <Text style={[styles.statText, { color: theme.textSecondary }]}>{item.votes} votes</Text>
            <Text style={[styles.statText, { color: theme.textSecondary }]}>{item.answerCount} answers</Text>
          </View>
          <ChevronRight size={20} color={theme.textSecondary} style={isRTL ? { transform: [{ rotate: '180deg' }] } : {}} />
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.bookmarkButton}
        onPress={() => toggleQuestionFavorite(item.id)}
        activeOpacity={0.7}
      >
        <Bookmark
          size={22}
          color={theme.primary}
          fill={theme.primary}
        />
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Sparkles size={64} color={theme.primary} />
      <Text style={[styles.emptyStateTitle, { color: theme.text }, isRTL && styles.rtlText]}>
        No {activeTab === 'laws' ? 'Laws' : 'Questions'} Bookmarked
      </Text>
      <Text style={[styles.emptyStateText, { color: theme.textSecondary }, isRTL && styles.rtlText]}>
        Start bookmarking {activeTab === 'laws' ? 'laws' : 'questions'} to see them here
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
      <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              { backgroundColor: theme.backgroundSecondary, borderColor: theme.border },
              activeTab === 'laws' && [
                styles.activeTab,
                { backgroundColor: theme.primary, borderColor: theme.primary }
              ]
            ]}
            onPress={() => setActiveTab('laws')}
          >
            <BookOpen size={20} color={activeTab === 'laws' ? '#fff' : theme.text} />
            <Text style={[
              styles.tabText,
              activeTab === 'laws' && styles.activeTabText,
              isRTL && styles.rtlText
            ]}>
              Laws ({favoritedLaws.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              { backgroundColor: theme.backgroundSecondary, borderColor: theme.border },
              activeTab === 'questions' && [
                styles.activeTab,
                { backgroundColor: theme.primary, borderColor: theme.primary }
              ]
            ]}
            onPress={() => setActiveTab('questions')}
          >
            <MessageCircle size={20} color={activeTab === 'questions' ? '#fff' : theme.text} />
            <Text style={[
              styles.tabText,
              activeTab === 'questions' && styles.activeTabText,
              isRTL && styles.rtlText
            ]}>
              Questions ({favoritedQuestions.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === 'laws' ? (
        <FlatList
          data={favoritedLaws}
          keyExtractor={item => item.id}
          renderItem={renderLawItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={renderEmptyState}
        />
      ) : (
        <FlatList
          data={favoritedQuestions}
          keyExtractor={item => item.id}
          renderItem={renderQuestionItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  header: {
    backgroundColor: Colors.light.background,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.backgroundSecondary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
  },
  activeTab: {
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.light.text,
  },
  activeTabText: {
    color: '#fff',
  },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    flexDirection: 'row',
  },
  cardContent: {
    flex: 1,
    padding: 16,
  },
  cardHeader: {
    marginBottom: 12,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  countryBadge: {
    backgroundColor: Colors.light.backgroundSecondary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  countryBadgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.light.text,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#fff',
  },
  questionBadges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  countryFlag: {
    fontSize: 20,
  },
  tag: {
    backgroundColor: Colors.light.backgroundSecondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  tagText: {
    fontSize: 11,
    color: Colors.light.text,
    fontWeight: '500' as const,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginBottom: 8,
    lineHeight: 24,
  },
  cardDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardMeta: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  questionStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontWeight: '500' as const,
  },
  bookmarkButton: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginTop: 24,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  rtl: {
    flexDirection: 'row-reverse',
  },
  rtlText: {
    textAlign: 'right',
  },
});
