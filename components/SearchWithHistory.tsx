import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  Keyboard,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Search,
  X,
  Clock,
  TrendingUp,
  Trash2,
  ArrowUpRight,
} from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useLanguage } from '@/contexts/LanguageContext';

const MAX_HISTORY_ITEMS = 10;

interface SearchWithHistoryProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  storageKey: string; // Unique key for each search (laws, questions)
  suggestions?: string[]; // Auto-complete suggestions from data
  popularSearches?: string[];
  onFocus?: () => void;
  onBlur?: () => void;
}

export default function SearchWithHistory({
  value,
  onChangeText,
  placeholder = 'Search...',
  storageKey,
  suggestions = [],
  popularSearches = [],
  onFocus,
  onBlur,
}: SearchWithHistoryProps) {
  const theme = useTheme();
  const { t, isRTL } = useLanguage();
  const [isFocused, setIsFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const dropdownAnim = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  // Load search history on mount
  useEffect(() => {
    loadSearchHistory();
  }, []);

  // Animate dropdown
  useEffect(() => {
    Animated.timing(dropdownAnim, {
      toValue: showDropdown ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [showDropdown]);

  const loadSearchHistory = async () => {
    try {
      const history = await AsyncStorage.getItem(`@search_history_${storageKey}`);
      if (history) {
        setSearchHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  };

  const saveSearchHistory = async (newHistory: string[]) => {
    try {
      await AsyncStorage.setItem(
        `@search_history_${storageKey}`,
        JSON.stringify(newHistory)
      );
      setSearchHistory(newHistory);
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  };

  const addToHistory = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    
    const trimmedTerm = searchTerm.trim().toLowerCase();
    const newHistory = [
      trimmedTerm,
      ...searchHistory.filter(item => item.toLowerCase() !== trimmedTerm),
    ].slice(0, MAX_HISTORY_ITEMS);
    
    await saveSearchHistory(newHistory);
  }, [searchHistory]);

  const removeFromHistory = async (term: string) => {
    const newHistory = searchHistory.filter(item => item !== term);
    await saveSearchHistory(newHistory);
  };

  const clearAllHistory = async () => {
    await saveSearchHistory([]);
  };

  const handleFocus = () => {
    setIsFocused(true);
    setShowDropdown(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Delay hiding dropdown to allow tap events
    setTimeout(() => {
      setShowDropdown(false);
      onBlur?.();
    }, 200);
  };

  const handleSelectItem = (term: string) => {
    onChangeText(term);
    addToHistory(term);
    Keyboard.dismiss();
    setShowDropdown(false);
  };

  const handleSubmit = () => {
    if (value.trim()) {
      addToHistory(value);
    }
    Keyboard.dismiss();
    setShowDropdown(false);
  };

  const handleClear = () => {
    onChangeText('');
    inputRef.current?.focus();
  };

  // Filter suggestions based on input
  const filteredSuggestions = value.trim()
    ? suggestions
        .filter(s => s.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 5)
    : [];

  // Show history when no input, suggestions when typing
  const showHistory = !value.trim() && searchHistory.length > 0;
  const showSuggestions = value.trim() && filteredSuggestions.length > 0;
  const showPopular = !value.trim() && popularSearches.length > 0;

  const dropdownOpacity = dropdownAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const dropdownTranslate = dropdownAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-10, 0],
  });

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View
        style={[
          styles.searchBar,
          { 
            backgroundColor: theme.backgroundSecondary,
            borderColor: isFocused ? '#6366f1' : 'transparent',
          },
          isFocused && styles.searchBarFocused,
          isRTL && styles.rtl,
        ]}
      >
        <Search size={18} color={isFocused ? '#6366f1' : theme.textSecondary} />
        <TextInput
          ref={inputRef}
          style={[styles.searchInput, { color: theme.text }, isRTL && styles.rtlText]}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor={theme.textSecondary}
          textAlign={isRTL ? 'right' : 'left'}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={handleSubmit}
          returnKeyType="search"
        />
        {value !== '' && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <X size={14} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Dropdown */}
      {showDropdown && (showHistory || showSuggestions || showPopular) && (
        <Animated.View
          style={[
            styles.dropdown,
            { 
              backgroundColor: theme.card,
              opacity: dropdownOpacity,
              transform: [{ translateY: dropdownTranslate }],
            },
          ]}
        >
          <ScrollView 
            style={styles.dropdownScroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Suggestions (when typing) */}
            {showSuggestions && (
              <View style={styles.section}>
                <View style={[styles.sectionHeader, isRTL && styles.rtl]}>
                  <Search size={14} color={theme.textSecondary} />
                  <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                    {t.suggestions || 'Suggestions'}
                  </Text>
                </View>
                {filteredSuggestions.map((suggestion, index) => (
                  <TouchableOpacity
                    key={`suggestion-${index}`}
                    style={[styles.item, isRTL && styles.rtl]}
                    onPress={() => handleSelectItem(suggestion)}
                  >
                    <ArrowUpRight size={16} color="#6366f1" />
                    <Text 
                      style={[styles.itemText, { color: theme.text }]} 
                      numberOfLines={1}
                    >
                      {suggestion}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Recent Searches */}
            {showHistory && (
              <View style={styles.section}>
                <View style={[styles.sectionHeader, isRTL && styles.rtl]}>
                  <Clock size={14} color={theme.textSecondary} />
                  <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                    {t.recentSearches || 'Recent'}
                  </Text>
                  <TouchableOpacity 
                    style={styles.clearAllBtn}
                    onPress={clearAllHistory}
                  >
                    <Text style={styles.clearAllText}>{t.clearAll || 'Clear'}</Text>
                  </TouchableOpacity>
                </View>
                {searchHistory.map((term, index) => (
                  <View key={`history-${index}`} style={[styles.historyItem, isRTL && styles.rtl]}>
                    <TouchableOpacity
                      style={[styles.historyItemContent, isRTL && styles.rtl]}
                      onPress={() => handleSelectItem(term)}
                    >
                      <Clock size={14} color={theme.textSecondary} />
                      <Text 
                        style={[styles.itemText, { color: theme.text }]} 
                        numberOfLines={1}
                      >
                        {term}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.removeBtn}
                      onPress={() => removeFromHistory(term)}
                    >
                      <X size={14} color={theme.textSecondary} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Popular Searches */}
            {showPopular && (
              <View style={styles.section}>
                <View style={[styles.sectionHeader, isRTL && styles.rtl]}>
                  <TrendingUp size={14} color="#f59e0b" />
                  <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                    {t.popularSearches || 'Popular'}
                  </Text>
                </View>
                <View style={[styles.popularGrid, isRTL && styles.rtl]}>
                  {popularSearches.slice(0, 6).map((term, index) => (
                    <TouchableOpacity
                      key={`popular-${index}`}
                      style={[styles.popularChip, { backgroundColor: theme.backgroundSecondary }]}
                      onPress={() => handleSelectItem(term)}
                    >
                      <TrendingUp size={12} color="#f59e0b" />
                      <Text 
                        style={[styles.popularText, { color: theme.text }]} 
                        numberOfLines={1}
                      >
                        {term}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 100,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 2,
    gap: 10,
  },
  searchBarFocused: {
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  clearButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
    maxHeight: 300,
    overflow: 'hidden',
  },
  dropdownScroll: {
    padding: 12,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
  },
  clearAllBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ef4444',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historyItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  itemText: {
    fontSize: 14,
    flex: 1,
  },
  removeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  popularGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  popularChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  popularText: {
    fontSize: 13,
    fontWeight: '500',
  },
  rtl: {
    flexDirection: 'row-reverse',
  },
  rtlText: {
    textAlign: 'right',
  },
});

