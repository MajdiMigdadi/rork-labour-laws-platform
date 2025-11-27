import { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  MessageCircle,
  ChevronRight,
  ThumbsUp,
  MessageSquare,
  CheckCircle,
  TrendingUp,
  Clock,
  Trophy,
  Bookmark,
  Search,
  X,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { mockUsers } from '@/mocks/data';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/hooks/useTheme';
import { useFavorites } from '@/contexts/FavoritesContext';

type SortType = 'recent' | 'popular' | 'unanswered';

export default function QAScreen() {
  const router = useRouter();
  const { questions, countries, categories } = useData();
  const [sortBy, setSortBy] = useState<SortType>('recent');
  const { user } = useAuth();
  const { isRTL } = useLanguage();
  const theme = useTheme();
  const { toggleQuestionFavorite, isQuestionFavorited } = useFavorites();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredAndSortedQuestions = useMemo(() => {
    let filtered = questions.filter(question => {
      const matchesSearch =
        searchQuery === '' ||
        question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        question.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCountry = !selectedCountry || question.countryId === selectedCountry;
      const matchesCategory = !selectedCategory || question.categoryId === selectedCategory;
      return matchesSearch && matchesCountry && matchesCategory;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'popular') {
        return b.votes - a.votes;
      } else if (sortBy === 'unanswered') {
        return a.answerCount - b.answerCount;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [questions, searchQuery, selectedCountry, selectedCategory, sortBy]);

  const getUser = (userId: string) => {
    return mockUsers.find(u => u.id === userId);
  };

  const getCountry = (countryId: string) => {
    return countries.find(c => c.id === countryId);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return theme.secondary;
      case 'intermediate':
        return theme.primary;
      case 'expert':
        return theme.accent;
      default:
        return theme.secondary;
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'expert':
        return Trophy;
      case 'intermediate':
        return TrendingUp;
      default:
        return Clock;
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCountry(null);
    setSelectedCategory(null);
  };

  const hasActiveFilters = searchQuery !== '' || selectedCountry || selectedCategory;

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
      <View style={[styles.searchSection, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
        <View style={[styles.searchBar, { backgroundColor: theme.card, borderColor: theme.border }, isRTL && styles.rtl]}>
          <Search size={18} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }, isRTL && styles.rtlText]}
            placeholder="Search..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={theme.textSecondary}
            textAlign={isRTL ? 'right' : 'left'}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={16} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={[styles.filtersSection, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
        {hasActiveFilters && (
          <View style={styles.clearFilterRow}>
            <TouchableOpacity
              style={[styles.filterChip, { backgroundColor: theme.error, borderColor: theme.error }]}
              onPress={clearFilters}
            >
              <X size={14} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        >
          {countries.map(country => (
            <TouchableOpacity
              key={country.id}
              style={[
                styles.filterChip,
                { backgroundColor: theme.card, borderColor: theme.border },
                selectedCountry === country.id && { backgroundColor: theme.primary, borderColor: theme.primary },
              ]}
              onPress={() => setSelectedCountry(country.id === selectedCountry ? null : country.id)}
            >
              <Text style={styles.filterChipEmoji}>{country.flag}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
          style={styles.tagsRow}
        >
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.filterChip,
                { backgroundColor: theme.card, borderColor: theme.border },
                selectedCategory === category.id && {
                  backgroundColor: theme.secondary,
                  borderColor: theme.secondary,
                },
              ]}
              onPress={() => setSelectedCategory(category.id === selectedCategory ? null : category.id)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  { color: theme.text },
                  selectedCategory === category.id && styles.filterChipTextActive,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={[styles.sortHeader, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
        <View style={styles.sortContainer}>
          <TouchableOpacity
            style={[styles.sortButton, { backgroundColor: theme.card, borderColor: theme.border }, sortBy === 'recent' && { backgroundColor: theme.primary, borderColor: theme.primary }]}
            onPress={() => setSortBy('recent')}
          >
            <Clock size={14} color={sortBy === 'recent' ? '#fff' : theme.text} />
            <Text style={[styles.sortButtonText, { color: theme.text }, sortBy === 'recent' && styles.sortButtonTextActive]}>
              Recent
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortButton, { backgroundColor: theme.card, borderColor: theme.border }, sortBy === 'popular' && { backgroundColor: theme.primary, borderColor: theme.primary }]}
            onPress={() => setSortBy('popular')}
          >
            <TrendingUp size={14} color={sortBy === 'popular' ? '#fff' : theme.text} />
            <Text style={[styles.sortButtonText, { color: theme.text }, sortBy === 'popular' && styles.sortButtonTextActive]}>
              Popular
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortButton, { backgroundColor: theme.card, borderColor: theme.border }, sortBy === 'unanswered' && { backgroundColor: theme.primary, borderColor: theme.primary }]}
            onPress={() => setSortBy('unanswered')}
          >
            <MessageSquare size={14} color={sortBy === 'unanswered' ? '#fff' : theme.text} />
            <Text style={[styles.sortButtonText, { color: theme.text }, sortBy === 'unanswered' && styles.sortButtonTextActive]}>
              Unanswered
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.resultsCount, { color: theme.textSecondary }, isRTL && styles.rtlText]}>
          {filteredAndSortedQuestions.length}
        </Text>
      </View>

      <FlatList
        data={filteredAndSortedQuestions}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.questionsList}
        renderItem={({ item }) => {
          const user = getUser(item.userId);
          const userName = user?.name || 'Anonymous';
          const userLevel = user?.level || 'beginner';
          const country = getCountry(item.countryId);
          const LevelIcon = getLevelIcon(userLevel);

          return (
            <View style={[styles.questionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <TouchableOpacity
                style={styles.questionCardContent}
                activeOpacity={0.7}
                onPress={() => router.push(`/(tabs)/question-detail?id=${item.id}`)}
              >
              <View style={[styles.questionHeader, isRTL && styles.rtl]}>
                <View style={[styles.userInfo, isRTL && styles.rtl]}>
                  {user?.avatar ? (
                    <Image
                      source={{ uri: user.avatar }}
                      style={styles.userAvatar}
                    />
                  ) : (
                    <View
                      style={[
                        styles.userAvatar,
                        { backgroundColor: getLevelColor(userLevel) },
                      ]}
                    >
                      <Text style={styles.userAvatarText}>
                        {userName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View style={[styles.userDetails, isRTL && styles.rtl]}>
                    <View style={[styles.userNameRow, isRTL && styles.rtl]}>
                      <Text style={[styles.userName, { color: theme.text }, isRTL && styles.rtlText]}>{userName}</Text>
                      <View style={[styles.levelBadge, { backgroundColor: getLevelColor(userLevel) }]}>
                        <LevelIcon size={10} color="#fff" />
                      </View>
                    </View>
                    <View style={[styles.countryDateRow, isRTL && styles.rtl]}>
                      <Text style={styles.countryFlag}>{country?.flag}</Text>
                      <Text style={[styles.countryCode, { color: theme.textSecondary }]}>{country?.code}</Text>
                      <Text style={[styles.dot, { color: theme.textSecondary }]}>•</Text>
                      <Text style={[styles.questionTime, { color: theme.textSecondary }, isRTL && styles.rtlText]}>
                        {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <Text style={[styles.questionTitle, { color: theme.text }, isRTL && styles.rtlText]} numberOfLines={2}>{item.title}</Text>

                <View style={[styles.questionFooter, isRTL && styles.rtl]}>
                  <View style={[styles.statsRow, isRTL && styles.rtl]}>
                    <View style={[styles.stat, isRTL && styles.rtl]}>
                      <ThumbsUp size={16} color={theme.textSecondary} />
                      <Text style={[styles.statText, { color: theme.textSecondary }]}>{item.votes}</Text>
                    </View>
                    <View style={[styles.stat, isRTL && styles.rtl]}>
                      <MessageSquare size={16} color={theme.textSecondary} />
                      <Text style={[styles.statText, { color: theme.textSecondary }]}>{item.answerCount}</Text>
                    </View>
                    {item.isResolved && (
                      <View style={[styles.resolvedBadge, { backgroundColor: `${theme.success}15` }, isRTL && styles.rtl]}>
                        <CheckCircle size={14} color={theme.success} />
                        <Text style={[styles.resolvedText, { color: theme.success }]}>Resolved</Text>
                      </View>
                    )}
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
                  color={isQuestionFavorited(item.id) ? theme.primary : theme.textSecondary}
                  fill={isQuestionFavorited(item.id) ? theme.primary : 'transparent'}
                />
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MessageCircle size={48} color={theme.textSecondary} />
            <Text style={[styles.emptyStateText, { color: theme.text }, isRTL && styles.rtlText]}>No questions found</Text>
            <Text style={[styles.emptyStateSubtext, { color: theme.textSecondary }, isRTL && styles.rtlText]}>
              {hasActiveFilters ? 'Try adjusting your filters' : 'Be the first to ask a question!'}
            </Text>
          </View>
        }
      />

      {user && (
        <TouchableOpacity
          style={[styles.askButton, { backgroundColor: theme.primary }]}
          activeOpacity={0.9}
          onPress={() => router.push('/(tabs)/ask-question')}
        >
          <MessageCircle size={24} color="#fff" />
          <Text style={styles.askButtonText}>Ask Question</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  searchSection: {
    backgroundColor: Colors.light.background,
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: Colors.light.text,
  },
  filtersSection: {
    backgroundColor: Colors.light.background,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  clearFilterRow: {
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 6,
  },
  tagsRow: {
    marginTop: 6,
  },
  filterChip: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.backgroundSecondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    minWidth: 32,
  },
  filterChipEmoji: {
    fontSize: 16,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.light.text,
  },
  filterChipTextActive: {
    color: '#fff',
  },

  sortHeader: {
    backgroundColor: Colors.light.background,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  sortContainer: {
    flexDirection: 'row',
    gap: 6,
    flex: 1,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.backgroundSecondary,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.light.text,
  },
  sortButtonTextActive: {
    color: '#fff',
  },
  resultsCount: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.light.textSecondary,
    marginLeft: 8,
  },
  questionsList: {
    padding: 12,
    gap: 10,
    paddingBottom: 100,
  },
  questionCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    flexDirection: 'row',
  },
  questionCardContent: {
    flex: 1,
    padding: 12,
  },
  bookmarkButton: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  userAvatarText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#fff',
  },
  userDetails: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.light.text,
  },
  levelBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countryDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  countryFlag: {
    fontSize: 14,
  },
  countryCode: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.light.textSecondary,
  },
  dot: {
    fontSize: 11,
    color: Colors.light.textSecondary,
  },
  questionTime: {
    fontSize: 11,
    color: Colors.light.textSecondary,
  },
  questionTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginBottom: 10,
    lineHeight: 21,
  },
  questionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.light.textSecondary,
  },
  resolvedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: `${Colors.light.success}15`,
    borderRadius: 6,
  },
  resolvedText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.light.success,
  },
  askButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  askButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  rtl: {
    flexDirection: 'row-reverse',
  },
  rtlText: {
    textAlign: 'right',
  },
});
