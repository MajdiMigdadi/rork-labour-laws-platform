import { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ScrollView,
  Image,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  MessageCircle,
  ThumbsUp,
  MessageSquare,
  CheckCircle,
  TrendingUp,
  Clock,
  Bookmark,
  Search,
  X,
  Sparkles,
  HelpCircle,
  Zap,
  Plus,
  ChevronRight,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/hooks/useTheme';
import { useFavorites } from '@/contexts/FavoritesContext';
import FlagDisplay from '@/components/FlagDisplay';
import { SkeletonQuestionsList } from '@/components/Skeleton';
import SearchWithHistory from '@/components/SearchWithHistory';
import HapticRefreshControl from '@/components/HapticRefreshControl';

type SortType = 'recent' | 'popular' | 'unanswered';

export default function QAScreen() {
  const router = useRouter();
  const { questions, countries, categories, isLoading } = useData();
  const [sortBy, setSortBy] = useState<SortType>('recent');
  const { user, users } = useAuth();
  const { isRTL, t, getTranslatedName } = useLanguage();
  const theme = useTheme();
  const { toggleQuestionFavorite, isQuestionFavorited } = useFavorites();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const fabAnim = useRef(new Animated.Value(0)).current;
  const fabPulse = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.spring(headerAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(fabAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Pulse animation for FAB
    Animated.loop(
      Animated.sequence([
        Animated.timing(fabPulse, {
          toValue: 1.08,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(fabPulse, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

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

  // Stats
  const totalQuestions = questions.length;
  const resolvedQuestions = questions.filter(q => q.isResolved).length;
  const unansweredQuestions = questions.filter(q => q.answerCount === 0).length;

  const getUser = (userId: string) => {
    return users.find(u => u.id === userId);
  };

  const getCountry = (countryId: string) => {
    return countries.find(c => c.id === countryId);
  };

  const getCategory = (categoryId: string) => {
    return categories.find(c => c.id === categoryId);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return '#94a3b8';
      case 'intermediate':
        return '#3b82f6';
      case 'expert':
        return '#f59e0b';
      default:
        return '#94a3b8';
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCountry(null);
    setSelectedCategory(null);
  };

  const hasActiveFilters = searchQuery !== '' || selectedCountry || selectedCategory;

  // Pull-to-refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate data refresh (in real app, this would refetch from API)
    await new Promise(resolve => setTimeout(resolve, 1200));
    setRefreshing(false);
  };

  const renderQuestionItem = ({ item, index }: { item: typeof questions[0]; index: number }) => {
    const questionUser = getUser(item.userId);
    const userName = questionUser?.name || 'Anonymous';
    const userLevel = questionUser?.level || 'beginner';
    const country = getCountry(item.countryId);
    const category = getCategory(item.categoryId);
    
    const cardAnim = new Animated.Value(0);
    Animated.spring(cardAnim, {
      toValue: 1,
      tension: 50,
      friction: 8,
      delay: index * 40,
      useNativeDriver: true,
    }).start();

    return (
      <Animated.View
        style={[
          styles.questionItem,
          {
            opacity: cardAnim,
            transform: [
              { translateX: cardAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, 0],
              })},
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.questionItemInner, { backgroundColor: theme.card }]}
          activeOpacity={0.8}
          onPress={() => router.push(`/(tabs)/question-detail?id=${item.id}`)}
        >
          {/* Left: Status line */}
          <View style={[
            styles.statusLine,
            { backgroundColor: item.isResolved ? '#22c55e' : '#6366f1' }
          ]} />
          
          {/* Avatar */}
          <View style={styles.itemAvatar}>
            {questionUser?.avatar ? (
              <Image source={{ uri: questionUser.avatar }} style={styles.avatarImg} />
            ) : (
              <LinearGradient
                colors={[getLevelColor(userLevel), getLevelColor(userLevel) + 'bb']}
                style={styles.avatarImg}
              >
                <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
              </LinearGradient>
            )}
          </View>
          
          {/* Content */}
          <View style={styles.itemContent}>
            <View style={styles.itemMeta}>
              <FlagDisplay flag={country?.flag || ''} size="small" />
              <Text style={[styles.itemCategory, { color: theme.primary }]}>{category ? getTranslatedName(category) : ''}</Text>
              <Text style={[styles.itemDot, { color: theme.textSecondary }]}>•</Text>
              <Text style={[styles.itemDate, { color: theme.textSecondary }]}>
                {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
            </View>
            <Text style={[styles.itemTitle, { color: theme.text }]} numberOfLines={1}>
              {item.title}
            </Text>
            <View style={styles.itemStats}>
              <View style={styles.itemStat}>
                <ThumbsUp size={12} color="#6366f1" />
                <Text style={styles.itemStatText}>{item.votes}</Text>
              </View>
              <View style={styles.itemStat}>
                <MessageSquare size={12} color="#06b6d4" />
                <Text style={[styles.itemStatText, { color: '#06b6d4' }]}>{item.answerCount}</Text>
              </View>
              {item.isResolved && (
                <View style={styles.itemResolved}>
                  <CheckCircle size={12} color="#22c55e" />
                  <Text style={styles.itemResolvedText}>{t.solved}</Text>
                </View>
              )}
            </View>
          </View>
          
          {/* Right actions */}
          <View style={styles.itemActions}>
            <TouchableOpacity
              style={[
                styles.bookmarkBtn,
                isQuestionFavorited(item.id) && styles.bookmarkBtnActive
              ]}
              onPress={() => toggleQuestionFavorite(item.id)}
              activeOpacity={0.7}
            >
              <Bookmark
                size={16}
                color={isQuestionFavorited(item.id) ? '#6366f1' : theme.textSecondary}
                fill={isQuestionFavorited(item.id) ? '#6366f1' : 'transparent'}
              />
            </TouchableOpacity>
            <ChevronRight size={18} color={theme.textSecondary} />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Show skeleton while loading
  if (isLoading) {
    return <SkeletonQuestionsList />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
      {/* Stats Header */}
      <Animated.View 
        style={[
          styles.statsHeader,
          { backgroundColor: theme.background },
          {
            opacity: headerAnim,
            transform: [{ translateY: headerAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-15, 0],
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
                <HelpCircle size={14} color="#6366f1" />
              </View>
              <View style={styles.statTextCol}>
                <Text style={styles.statNumber}>{totalQuestions}</Text>
                <Text style={styles.statLabel}>{t.total}</Text>
              </View>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={[styles.statIconBg, { backgroundColor: '#dcfce7' }]}>
                <CheckCircle size={14} color="#22c55e" />
              </View>
              <View style={styles.statTextCol}>
                <Text style={styles.statNumber}>{resolvedQuestions}</Text>
                <Text style={styles.statLabel}>{t.solved}</Text>
              </View>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={[styles.statIconBg, { backgroundColor: '#fef3c7' }]}>
                <Zap size={14} color="#f59e0b" />
              </View>
              <View style={styles.statTextCol}>
                <Text style={styles.statNumber}>{unansweredQuestions}</Text>
                <Text style={styles.statLabel}>{t.open}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Search */}
      <View style={[styles.searchSection, { backgroundColor: theme.background }]}>
        <SearchWithHistory
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t.searchQuestions}
          storageKey="questions"
          suggestions={questions.map(q => q.title)}
          popularSearches={['Overtime Pay', 'Contract', 'Resignation', 'Sick Leave', 'Salary Delay', 'Benefits']}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
        />
      </View>

      {/* Filter Row 1: Countries */}
      <View style={[styles.filterSection, { backgroundColor: theme.background }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {hasActiveFilters && (
            <TouchableOpacity style={styles.clearChip} onPress={clearFilters}>
              <X size={12} color="#fff" />
            </TouchableOpacity>
          )}
          {countries.map(country => (
            <TouchableOpacity
              key={country.id}
              style={[
                styles.countryChip,
                { backgroundColor: theme.card, borderColor: selectedCountry === country.id ? '#6366f1' : theme.border },
                selectedCountry === country.id && styles.countryChipActive,
              ]}
              onPress={() => setSelectedCountry(country.id === selectedCountry ? null : country.id)}
            >
              <FlagDisplay flag={country.flag} size="small" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Filter Row 2: Categories */}
      <View style={[styles.filterSection, { backgroundColor: theme.background, paddingTop: 0 }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                { backgroundColor: theme.card, borderColor: selectedCategory === category.id ? '#8b5cf6' : theme.border },
                selectedCategory === category.id && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(category.id === selectedCategory ? null : category.id)}
            >
              <Text style={[
                styles.categoryText,
                { color: selectedCategory === category.id ? '#fff' : theme.text },
              ]}>
                {getTranslatedName(category)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Sort Bar */}
      <View style={[styles.sortBar, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
        <View style={styles.sortButtons}>
          {[
            { key: 'recent', icon: Clock, label: t.recent },
            { key: 'popular', icon: TrendingUp, label: t.popular },
            { key: 'unanswered', icon: MessageSquare, label: t.unanswered },
          ].map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.sortButton,
                sortBy === item.key && styles.sortButtonActive,
              ]}
              onPress={() => setSortBy(item.key as SortType)}
            >
              <item.icon size={12} color={sortBy === item.key ? '#fff' : theme.textSecondary} />
              <Text style={[
                styles.sortButtonText,
                { color: sortBy === item.key ? '#fff' : theme.textSecondary }
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[styles.resultsCount, { color: theme.textSecondary }]}>
          {filteredAndSortedQuestions.length}
        </Text>
      </View>

      {/* Questions List */}
      <FlatList
        data={filteredAndSortedQuestions}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={renderQuestionItem}
        refreshControl={
          <HapticRefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <LinearGradient colors={['#eef2ff', '#e0e7ff']} style={styles.emptyIconBg}>
              <MessageCircle size={36} color="#6366f1" />
            </LinearGradient>
            <Text style={[styles.emptyStateText, { color: theme.text }]}>{t.noQuestionsFound}</Text>
            <Text style={[styles.emptyStateSubtext, { color: theme.textSecondary }]}>
              {hasActiveFilters ? t.tryAdjustingFilters : t.beFirstToAsk}
            </Text>
            {!hasActiveFilters && user && (
              <TouchableOpacity style={styles.emptyAskButton} onPress={() => router.push('/(tabs)/ask-question')}>
                <LinearGradient colors={['#6366f1', '#8b5cf6']} style={styles.emptyAskButtonGradient}>
                  <Sparkles size={16} color="#fff" />
                  <Text style={styles.emptyAskButtonText}>{t.askQuestion}</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {/* FAB */}
      {user && (
        <Animated.View
          style={[
            styles.fabContainer,
            {
              opacity: fabAnim,
              transform: [
                { scale: Animated.multiply(fabAnim, fabPulse) },
                { translateY: fabAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [40, 0],
                })},
              ],
            },
          ]}
        >
          <TouchableOpacity activeOpacity={0.9} onPress={() => router.push('/(tabs)/ask-question')}>
            <LinearGradient
              colors={['#6366f1', '#8b5cf6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.fab}
            >
              <Plus size={24} color="#fff" strokeWidth={2.5} />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Stats Header
  statsHeader: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
  },
  statsCard: {
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
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
    gap: 8,
  },
  statIconBg: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statTextCol: {
    alignItems: 'flex-start',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 18,
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  
  // Search Section
  searchSection: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1.5,
  },
  searchBarFocused: {
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    paddingVertical: 0,
  },
  clearButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Filter Sections (2 rows)
  filterSection: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  clearChip: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countryChip: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5,
    minWidth: 38,
  },
  countryChipActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  countryEmoji: {
    fontSize: 16,
  },
  categoryChip: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  categoryChipActive: {
    backgroundColor: '#8b5cf6',
    borderColor: '#8b5cf6',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  
  // Sort Bar
  sortBar: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 4,
    backgroundColor: 'transparent',
  },
  sortButtonActive: {
    backgroundColor: '#6366f1',
  },
  sortButtonText: {
    fontSize: 11,
    fontWeight: '600',
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: '700',
  },
  
  // List Content
  listContent: {
    padding: 12,
    paddingBottom: 140,
    gap: 8,
  },
  
  // Question Item (Single Line)
  questionItem: {
    marginBottom: 0,
  },
  questionItemInner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statusLine: {
    width: 4,
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  itemAvatar: {
    marginLeft: 12,
    marginRight: 10,
    paddingVertical: 10,
  },
  avatarImg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  itemContent: {
    flex: 1,
    paddingVertical: 10,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  itemFlag: {
    fontSize: 12,
  },
  itemCategory: {
    fontSize: 11,
    fontWeight: '600',
  },
  itemDot: {
    fontSize: 8,
  },
  itemDate: {
    fontSize: 10,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
    marginBottom: 4,
    paddingRight: 4,
  },
  itemStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  itemStatText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6366f1',
  },
  itemResolved: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  itemResolvedText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#22c55e',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingRight: 10,
  },
  bookmarkBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookmarkBtnActive: {
    backgroundColor: '#eef2ff',
  },
  
  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    paddingHorizontal: 24,
  },
  emptyIconBg: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptyStateSubtext: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyAskButton: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  emptyAskButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    gap: 6,
  },
  emptyAskButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // FAB
  fabContainer: {
    position: 'absolute',
    bottom: 95,
    right: 16,
  },
  fab: {
    width: 54,
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  
  // RTL
  rtl: {
    flexDirection: 'row-reverse',
  },
  rtlText: {
    textAlign: 'right',
  },
});

