import { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Animated,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  BookOpen, 
  MessageCircle, 
  ChevronRight, 
  Heart,
  Trash2,
  ThumbsUp,
  MessageSquare,
  Sparkles,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import HapticRefreshControl from '@/components/HapticRefreshControl';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/hooks/useTheme';
import FlagDisplay from '@/components/FlagDisplay';

type TabType = 'laws' | 'questions';

export default function FavoritesScreen() {
  const router = useRouter();
  const { laws, questions, countries, categories } = useData();
  const { users } = useAuth();
  const { favorites, toggleLawFavorite, toggleQuestionFavorite } = useFavorites();
  const { isRTL, t, getTranslatedName } = useLanguage();
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('laws');
  const [refreshing, setRefreshing] = useState(false);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Pull-to-refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const favoritedLaws = useMemo(() => {
    return laws.filter(law => favorites.laws.includes(law.id));
  }, [laws, favorites.laws]);

  const favoritedQuestions = useMemo(() => {
    return questions.filter(question => favorites.questions.includes(question.id));
  }, [questions, favorites.questions]);

  const totalSaved = favoritedLaws.length + favoritedQuestions.length;

  const getCountry = (countryId: string) => {
    return countries.find(c => c.id === countryId);
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? getTranslatedName(category) : '';
  };

  const getUser = (userId: string) => {
    return users.find(u => u.id === userId);
  };

  const renderLawItem = ({ item, index }: { item: typeof laws[0]; index: number }) => {
    const itemAnim = new Animated.Value(0);
    Animated.spring(itemAnim, {
      toValue: 1,
      tension: 50,
      friction: 8,
      delay: index * 50,
      useNativeDriver: true,
    }).start();
    
    return (
      <Animated.View
        style={{
          opacity: itemAnim,
          transform: [{ translateX: itemAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [-20, 0],
          })}],
        }}
      >
        <View style={[styles.listItem, { backgroundColor: theme.card }, isRTL && styles.listItemRTL]}>
          <View style={[styles.statusLine, { backgroundColor: '#6366f1' }, isRTL && styles.statusLineRTL]} />
          
          <View style={styles.itemFlag}>
            <FlagDisplay flag={getCountry(item.countryId)?.flag || '🌍'} size="medium" />
          </View>
          
          <TouchableOpacity
            style={styles.itemContent}
            activeOpacity={0.8}
            onPress={() => router.push(`/(tabs)/law-detail?id=${item.id}`)}
          >
            <View style={[styles.itemMeta, isRTL && styles.itemMetaRTL]}>
              <FlagDisplay flag={getCountry(item.countryId)?.flag || '🌍'} size="small" />
              <Text style={[styles.dot, { color: theme.textSecondary }]}>•</Text>
              <Text style={[styles.itemCategory, { color: theme.secondary }]}>{getCategoryName(item.categoryId)}</Text>
            </View>
            <Text style={[styles.itemTitle, { color: theme.text }, isRTL && styles.textRTL]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={[styles.itemDate, { color: theme.textSecondary }, isRTL && styles.textRTL]}>
              {new Date(item.lastUpdated).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' })}
            </Text>
          </TouchableOpacity>
          
          <View style={[styles.itemActions, isRTL && styles.itemActionsRTL]}>
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => toggleLawFavorite(item.id)}
            >
              <Trash2 size={16} color="#ef4444" />
            </TouchableOpacity>
            <ChevronRight size={18} color={theme.textSecondary} style={isRTL ? { transform: [{ rotate: '180deg' }] } : {}} />
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderQuestionItem = ({ item, index }: { item: typeof questions[0]; index: number }) => {
    const questionUser = getUser(item.userId);
    const itemAnim = new Animated.Value(0);
    Animated.spring(itemAnim, {
      toValue: 1,
      tension: 50,
      friction: 8,
      delay: index * 50,
      useNativeDriver: true,
    }).start();
    
    return (
      <Animated.View
        style={{
          opacity: itemAnim,
          transform: [{ translateX: itemAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [-20, 0],
          })}],
        }}
      >
        <View style={[styles.listItem, { backgroundColor: theme.card }, isRTL && styles.listItemRTL]}>
          <View style={[styles.statusLine, { backgroundColor: item.isResolved ? '#22c55e' : '#06b6d4' }, isRTL && styles.statusLineRTL]} />
          
          <View style={styles.itemAvatar}>
            {questionUser?.avatar ? (
              <Image source={{ uri: questionUser.avatar }} style={styles.avatarImg} />
            ) : (
              <View style={[styles.avatarImg, { backgroundColor: '#6366f1' }]}>
                <Text style={styles.avatarText}>{questionUser?.name?.charAt(0) || '?'}</Text>
              </View>
            )}
          </View>
          
          <TouchableOpacity
            style={styles.itemContent}
            activeOpacity={0.8}
            onPress={() => router.push(`/(tabs)/question-detail?id=${item.id}`)}
          >
            <View style={[styles.itemMeta, isRTL && styles.itemMetaRTL]}>
              <FlagDisplay flag={getCountry(item.countryId)?.flag || '🌍'} size="small" />
              <Text style={[styles.dot, { color: theme.textSecondary }]}>•</Text>
              <Text style={[styles.itemCategory, { color: '#06b6d4' }]}>{getCategoryName(item.categoryId)}</Text>
            </View>
            <Text style={[styles.itemTitle, { color: theme.text }, isRTL && styles.textRTL]} numberOfLines={1}>
              {item.title}
            </Text>
            <View style={[styles.itemStats, isRTL && styles.itemStatsRTL]}>
              <View style={styles.stat}>
                <ThumbsUp size={12} color="#6366f1" />
                <Text style={styles.statText}>{item.votes}</Text>
              </View>
              <View style={styles.stat}>
                <MessageSquare size={12} color="#06b6d4" />
                <Text style={[styles.statText, { color: '#06b6d4' }]}>{item.answerCount}</Text>
              </View>
            </View>
          </TouchableOpacity>
          
          <View style={[styles.itemActions, isRTL && styles.itemActionsRTL]}>
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => toggleQuestionFavorite(item.id)}
            >
              <Trash2 size={16} color="#ef4444" />
            </TouchableOpacity>
            <ChevronRight size={18} color={theme.textSecondary} style={isRTL ? { transform: [{ rotate: '180deg' }] } : {}} />
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderEmptyState = () => {
    const isLawsTab = activeTab === 'laws';
    
    return (
      <View style={styles.emptyState}>
        <LinearGradient
          colors={isLawsTab ? ['#6366f1', '#8b5cf6'] : ['#06b6d4', '#22d3ee']}
          style={styles.emptyIcon}
        >
          {isLawsTab ? (
            <BookOpen size={32} color="#fff" />
          ) : (
            <MessageCircle size={32} color="#fff" />
          )}
        </LinearGradient>
        <Text style={[styles.emptyTitle, { color: theme.text }, isRTL && styles.textRTL]}>
          {isLawsTab ? t.noLawsSaved : t.noQuestionsSaved}
        </Text>
        <Text style={[styles.emptySubtitle, { color: theme.textSecondary }, isRTL && styles.textRTL]}>
          {t.bookmarkToSave}
        </Text>
        <TouchableOpacity
          style={styles.emptyBtn}
          onPress={() => router.push(isLawsTab ? '/(tabs)/laws' : '/(tabs)/questions')}
        >
          <LinearGradient
            colors={isLawsTab ? ['#6366f1', '#8b5cf6'] : ['#06b6d4', '#22d3ee']}
            style={styles.emptyBtnGradient}
          >
            <Sparkles size={16} color="#fff" />
            <Text style={styles.emptyBtnText}>
              {isLawsTab ? t.browseLaws : t.browseQuestions}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
      {/* Header */}
      <Animated.View style={[styles.header, { backgroundColor: theme.background, opacity: fadeAnim }]}>
        <View style={[styles.headerTop, isRTL && styles.headerTopRTL]}>
          <View style={styles.headerIconBg}>
            <Heart size={20} color="#ef4444" fill="#ef4444" />
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: theme.text }, isRTL && styles.textRTL]}>
              {t.favorites}
            </Text>
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }, isRTL && styles.textRTL]}>
              {totalSaved} {t.savedItems}
            </Text>
          </View>
        </View>
        
        {/* Quick Stats */}
        <View style={[styles.quickStats, isRTL && styles.quickStatsRTL]}>
          <View style={[styles.quickStatItem, { backgroundColor: '#eef2ff' }]}>
            <BookOpen size={14} color="#6366f1" />
            <Text style={[styles.quickStatText, { color: '#6366f1' }]}>{favoritedLaws.length}</Text>
          </View>
          <View style={[styles.quickStatItem, { backgroundColor: '#ecfeff' }]}>
            <MessageCircle size={14} color="#06b6d4" />
            <Text style={[styles.quickStatText, { color: '#06b6d4' }]}>{favoritedQuestions.length}</Text>
          </View>
        </View>
      </Animated.View>

      {/* Tabs */}
      <View style={[styles.tabsContainer, { backgroundColor: theme.background }, isRTL && styles.tabsContainerRTL]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'laws' && styles.tabActive]}
          onPress={() => setActiveTab('laws')}
        >
          <BookOpen size={16} color={activeTab === 'laws' ? '#fff' : theme.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'laws' && styles.tabTextActive]}>
            {t.laws}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'questions' && styles.tabActiveQ]}
          onPress={() => setActiveTab('questions')}
        >
          <MessageCircle size={16} color={activeTab === 'questions' ? '#fff' : theme.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'questions' && styles.tabTextActive]}>
            {t.qa}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'laws' ? (
        <FlatList
          data={favoritedLaws}
          keyExtractor={item => item.id}
          renderItem={renderLawItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <HapticRefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
        />
      ) : (
        <FlatList
          data={favoritedQuestions}
          keyExtractor={item => item.id}
          renderItem={renderQuestionItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <HapticRefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Header
  header: {
    padding: 16,
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  headerIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  quickStats: {
    flexDirection: 'row',
    gap: 8,
  },
  quickStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  quickStatText: {
    fontSize: 13,
    fontWeight: '700',
  },
  
  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
  },
  tabActive: {
    backgroundColor: '#6366f1',
  },
  tabActiveQ: {
    backgroundColor: '#06b6d4',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#fff',
  },
  
  // List
  list: {
    padding: 12,
    paddingBottom: 120,
    gap: 8,
  },
  listItem: {
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
  },
  itemFlag: {
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 12,
  },
  flag: {
    fontSize: 24,
  },
  itemAvatar: {
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 12,
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
  itemFlag2: {
    fontSize: 12,
  },
  itemCountry: {
    fontSize: 11,
    fontWeight: '700',
  },
  itemFlagSmall: {
    fontSize: 14,
  },
  itemCategory: {
    fontSize: 11,
    fontWeight: '600',
  },
  dot: {
    fontSize: 8,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
    marginBottom: 2,
  },
  itemDate: {
    fontSize: 11,
  },
  itemStats: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6366f1',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 12,
  },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  emptyBtn: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  emptyBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  emptyBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // RTL Styles
  listItemRTL: {
    flexDirection: 'row-reverse',
  },
  statusLineRTL: {
    left: undefined,
    right: 0,
  },
  itemMetaRTL: {
    flexDirection: 'row-reverse',
  },
  itemStatsRTL: {
    flexDirection: 'row-reverse',
  },
  itemActionsRTL: {
    flexDirection: 'row-reverse',
  },
  textRTL: {
    textAlign: 'right',
  },
  headerTopRTL: {
    flexDirection: 'row-reverse',
  },
  quickStatsRTL: {
    flexDirection: 'row-reverse',
  },
  tabsContainerRTL: {
    flexDirection: 'row-reverse',
  },
});
