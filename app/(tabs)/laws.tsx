import { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Search, ChevronRight, BookOpen, Bookmark, Clock, TrendingUp, X, Scale, FileText, CheckCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useData } from '@/contexts/DataContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/hooks/useTheme';
import { useFavorites } from '@/contexts/FavoritesContext';
import FlagDisplay from '@/components/FlagDisplay';
import { SkeletonLawsList } from '@/components/Skeleton';
import SearchWithHistory from '@/components/SearchWithHistory';
import HapticRefreshControl from '@/components/HapticRefreshControl';

export default function LawsScreen() {
  const router = useRouter();
  const { countries, laws, categories, isLoading } = useData();
  const { isRTL, t, getTranslatedName } = useLanguage();
  const theme = useTheme();
  const { toggleLawFavorite, isLawFavorited } = useFavorites();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.spring(headerAnim, {
      toValue: 1,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, []);

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

  const filteredLaws = useMemo(() => {
    let filtered = laws.filter(law => {
      const matchesSearch =
        law.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        law.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCountry = !selectedCountry || law.countryId === selectedCountry;
      const matchesCategory = !selectedCategory || law.categoryId === selectedCategory;
      return matchesSearch && matchesCountry && matchesCategory;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'popular') {
        const countryA = countries.find(c => c.id === a.countryId);
        const countryB = countries.find(c => c.id === b.countryId);
        return (countryB?.lawCount || 0) - (countryA?.lawCount || 0);
      }
      return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
    });
  }, [laws, searchQuery, selectedCountry, selectedCategory, sortBy, countries]);

  // Stats
  const totalLaws = laws.length;
  const totalCountries = countries.length;
  const totalCategories = categories.length;

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? getTranslatedName(category) : '';
  };

  const renderLawItem = ({ item, index }: { item: typeof laws[0]; index: number }) => {
    const country = countries.find(c => c.id === item.countryId);
    const category = getCategoryName(item.categoryId);
    
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
          styles.lawItem,
          {
            opacity: cardAnim,
            transform: [{ translateX: cardAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-20, 0],
            })}],
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.lawItemInner, { backgroundColor: theme.card }]}
          activeOpacity={0.8}
          onPress={() => router.push(`/(tabs)/law-detail?id=${item.id}`)}
        >
          {/* Status Line */}
          <View style={styles.statusLine} />
          
          {/* Flag */}
          <View style={styles.flagContainer}>
            <FlagDisplay flag={country?.flag || ''} size="medium" />
          </View>
          
          {/* Content */}
          <View style={styles.itemContent}>
            <View style={styles.itemMeta}>
              <FlagDisplay flag={country?.flag || ''} size="small" />
              <Text style={[styles.itemDot, { color: theme.textSecondary }]}>•</Text>
              <Text style={[styles.itemCategory, { color: theme.secondary }]}>{category}</Text>
              <Text style={[styles.itemDot, { color: theme.textSecondary }]}>•</Text>
              <Text style={[styles.itemDate, { color: theme.textSecondary }]}>
                {new Date(item.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
            </View>
            <Text style={[styles.itemTitle, { color: theme.text }]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={[styles.itemDesc, { color: theme.textSecondary }]} numberOfLines={1}>
              {item.description}
            </Text>
          </View>
          
          {/* Right actions */}
          <View style={styles.itemActions}>
            <TouchableOpacity
              style={[
                styles.bookmarkBtn,
                isLawFavorited(item.id) && styles.bookmarkBtnActive
              ]}
              onPress={() => toggleLawFavorite(item.id)}
              activeOpacity={0.7}
            >
              <Bookmark
                size={16}
                color={isLawFavorited(item.id) ? '#6366f1' : theme.textSecondary}
                fill={isLawFavorited(item.id) ? '#6366f1' : 'transparent'}
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
    return <SkeletonLawsList />;
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
                <Scale size={14} color="#6366f1" />
              </View>
              <View style={styles.statTextCol}>
                <Text style={styles.statNumber}>{totalLaws}</Text>
                <Text style={styles.statLabel}>{t.laws}</Text>
              </View>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={[styles.statIconBg, { backgroundColor: '#dcfce7' }]}>
                <CheckCircle size={14} color="#22c55e" />
              </View>
              <View style={styles.statTextCol}>
                <Text style={styles.statNumber}>{totalCountries}</Text>
                <Text style={styles.statLabel}>{t.countries}</Text>
              </View>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={[styles.statIconBg, { backgroundColor: '#fef3c7' }]}>
                <FileText size={14} color="#f59e0b" />
              </View>
              <View style={styles.statTextCol}>
                <Text style={styles.statNumber}>{totalCategories}</Text>
                <Text style={styles.statLabel}>{t.categories}</Text>
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
          placeholder={t.searchLaws}
          storageKey="laws"
          suggestions={laws.map(l => l.title)}
          popularSearches={['Minimum Wage', 'Annual Leave', 'Overtime', 'Termination', 'Working Hours', 'Health Insurance']}
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
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'recent' && styles.sortButtonActive]}
            onPress={() => setSortBy('recent')}
          >
            <Clock size={12} color={sortBy === 'recent' ? '#fff' : theme.textSecondary} />
            <Text style={[styles.sortButtonText, { color: sortBy === 'recent' ? '#fff' : theme.textSecondary }]}>
              {t.recent}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'popular' && styles.sortButtonActive]}
            onPress={() => setSortBy('popular')}
          >
            <TrendingUp size={12} color={sortBy === 'popular' ? '#fff' : theme.textSecondary} />
            <Text style={[styles.sortButtonText, { color: sortBy === 'popular' ? '#fff' : theme.textSecondary }]}>
              {t.popular}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.resultsCount, { color: theme.textSecondary }]}>
          {filteredLaws.length}
        </Text>
      </View>

      {/* Laws List */}
      <FlatList
        data={filteredLaws}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={renderLawItem}
        refreshControl={
          <HapticRefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        ListEmptyComponent={
          <View style={[styles.emptyState, { backgroundColor: theme.card }]}>
            <LinearGradient colors={['#eef2ff', '#e0e7ff']} style={styles.emptyIconBg}>
              <BookOpen size={28} color="#6366f1" />
            </LinearGradient>
            <Text style={[styles.emptyStateText, { color: theme.text }]}>{t.noLawsFound}</Text>
            <Text style={[styles.emptyStateSubtext, { color: theme.textSecondary }]}>
              {hasActiveFilters ? t.tryAdjustingFilters : t.noLawsAvailable}
            </Text>
          </View>
        }
      />
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
  
  // Law Item (Single Line)
  lawItem: {
    marginBottom: 0,
  },
  lawItemInner: {
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
    backgroundColor: '#6366f1',
  },
  flagContainer: {
    marginLeft: 12,
    marginRight: 10,
    paddingVertical: 10,
  },
  flag: {
    fontSize: 26,
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
  itemCountry: {
    fontSize: 11,
    fontWeight: '700',
  },
  itemFlag: {
    fontSize: 14,
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
    marginBottom: 2,
    paddingRight: 4,
  },
  itemDesc: {
    fontSize: 12,
    lineHeight: 16,
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
    paddingVertical: 40,
    borderRadius: 14,
    marginHorizontal: 12,
  },
  emptyIconBg: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 15,
    fontWeight: '600',
  },
  emptyStateSubtext: {
    fontSize: 12,
    marginTop: 4,
  },
  
  // RTL
  rtl: {
    flexDirection: 'row-reverse',
  },
  rtlText: {
    textAlign: 'right',
  },
});
