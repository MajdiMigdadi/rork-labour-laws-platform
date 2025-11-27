import { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Search, ChevronRight, BookOpen, Bookmark, Clock, TrendingUp, X } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useData } from '@/contexts/DataContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/hooks/useTheme';
import { useFavorites } from '@/contexts/FavoritesContext';

export default function LawsScreen() {
  const router = useRouter();
  const { countries, laws, categories } = useData();
  const { isRTL } = useLanguage();
  const theme = useTheme();
  const { toggleLawFavorite, isLawFavorited } = useFavorites();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCountry(null);
    setSelectedCategory(null);
  };

  const hasActiveFilters = searchQuery !== '' || selectedCountry || selectedCategory;

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

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || '';
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
      <View style={[styles.searchSection, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
        <View style={[styles.searchBar, { backgroundColor: theme.card, borderColor: theme.border }, isRTL && styles.rtl]}>
          <Search size={18} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }, isRTL && styles.rtlText]}
            placeholder="Search laws..."
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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        >
          {hasActiveFilters && (
            <TouchableOpacity
              style={[styles.filterChip, { backgroundColor: theme.error, borderColor: theme.error }]}
              onPress={clearFilters}
            >
              <X size={14} color="#fff" />
            </TouchableOpacity>
          )}

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

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

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
        </View>
        <Text style={[styles.resultsCount, { color: theme.textSecondary }, isRTL && styles.rtlText]}>
          {filteredLaws.length}
        </Text>
      </View>

      <FlatList
        data={filteredLaws}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.lawsList}
        renderItem={({ item }) => {
          const country = countries.find(c => c.id === item.countryId);

          return (
            <View style={[styles.lawCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <TouchableOpacity
                style={styles.lawCardContent}
                activeOpacity={0.7}
                onPress={() => router.push(`/(tabs)/law-detail?id=${item.id}`)}
              >
                <View style={[styles.lawHeader, isRTL && styles.rtl]}>
                  <View style={[styles.countryInfo, isRTL && styles.rtl]}>
                    <Text style={styles.countryFlag}>{country?.flag}</Text>
                    <View style={[styles.countryDetails, isRTL && styles.rtl]}>
                      <View style={[styles.countryRow, isRTL && styles.rtl]}>
                        <Text style={[styles.countryCode, { color: theme.text }, isRTL && styles.rtlText]}>{country?.code}</Text>
                        <Text style={[styles.dot, { color: theme.textSecondary }]}>•</Text>
                        <View style={[styles.categoryBadge, { backgroundColor: theme.secondary }]}>
                          <Text style={styles.categoryBadgeText}>{getCategoryName(item.categoryId)}</Text>
                        </View>
                      </View>
                      <Text style={[styles.lawTime, { color: theme.textSecondary }, isRTL && styles.rtlText]}>
                        {new Date(item.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </Text>
                    </View>
                  </View>
                </View>

                <Text style={[styles.lawTitle, { color: theme.text }, isRTL && styles.rtlText]} numberOfLines={2}>{item.title}</Text>
                <Text style={[styles.lawDescription, { color: theme.textSecondary }, isRTL && styles.rtlText]} numberOfLines={2}>
                  {item.description}
                </Text>

                <View style={[styles.lawFooter, isRTL && styles.rtl]}>
                  <View style={[styles.lawMeta, isRTL && styles.rtl]}>
                    <BookOpen size={16} color={theme.textSecondary} />
                    <Text style={[styles.lawMetaText, { color: theme.textSecondary }, isRTL && styles.rtlText]}>View Details</Text>
                  </View>
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
                  color={isLawFavorited(item.id) ? theme.primary : theme.textSecondary}
                  fill={isLawFavorited(item.id) ? theme.primary : 'transparent'}
                />
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <BookOpen size={48} color={theme.textSecondary} />
            <Text style={[styles.emptyStateText, { color: theme.text }, isRTL && styles.rtlText]}>No laws found</Text>
            <Text style={[styles.emptyStateSubtext, { color: theme.textSecondary }, isRTL && styles.rtlText]}>
              {hasActiveFilters ? 'Try adjusting your filters' : 'No laws available'}
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
  filtersContent: {
    paddingHorizontal: 16,
    gap: 6,
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
  divider: {
    width: 1,
    backgroundColor: Colors.light.border,
    marginHorizontal: 4,
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
  lawsList: {
    padding: 12,
    gap: 10,
    paddingBottom: 100,
  },
  lawCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    flexDirection: 'row',
  },
  lawCardContent: {
    flex: 1,
    padding: 12,
  },
  bookmarkButton: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lawHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  countryInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  countryFlag: {
    fontSize: 28,
    marginRight: 10,
  },
  countryDetails: {
    flex: 1,
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  countryCode: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.light.text,
  },
  dot: {
    fontSize: 11,
    color: Colors.light.textSecondary,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#fff',
  },
  lawTime: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  lawTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginBottom: 8,
    lineHeight: 21,
  },
  lawDescription: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    lineHeight: 18,
    marginBottom: 10,
  },
  lawFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lawMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lawMetaText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.light.textSecondary,
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
