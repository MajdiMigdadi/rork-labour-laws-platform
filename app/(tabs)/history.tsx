import { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Animated,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Clock, 
  BookOpen, 
  MessageCircle, 
  ChevronRight,
  Trash2,
  Eye,
  Calendar,
  Sparkles,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useReadingHistory, HistoryItem } from '@/contexts/ReadingHistoryContext';
import { useData } from '@/contexts/DataContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/hooks/useTheme';
import FlagDisplay from '@/components/FlagDisplay';
import HapticRefreshControl from '@/components/HapticRefreshControl';
import * as Haptics from 'expo-haptics';

type TabType = 'all' | 'laws' | 'questions';

export default function HistoryScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { isRTL, t, getTranslatedName } = useLanguage();
  const { history, recentLaws, recentQuestions, removeFromHistory, clearHistory } = useReadingHistory();
  const { laws, questions, countries, categories } = useData();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [refreshing, setRefreshing] = useState(false);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setRefreshing(false);
  };

  const handleClearHistory = () => {
    Alert.alert(
      t.clearHistory || 'Clear History',
      t.clearHistoryConfirm || 'Are you sure you want to clear all reading history?',
      [
        { text: t.cancel || 'Cancel', style: 'cancel' },
        { 
          text: t.clear || 'Clear', 
          style: 'destructive',
          onPress: async () => {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            clearHistory();
          }
        },
      ]
    );
  };

  const handleRemoveItem = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    removeFromHistory(id);
  };

  const filteredHistory = useMemo(() => {
    switch (activeTab) {
      case 'laws':
        return recentLaws;
      case 'questions':
        return recentQuestions;
      default:
        return history;
    }
  }, [activeTab, history, recentLaws, recentQuestions]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t.justNow || 'Just now';
    if (diffMins < 60) return `${diffMins}m ${t.ago || 'ago'}`;
    if (diffHours < 24) return `${diffHours}h ${t.ago || 'ago'}`;
    if (diffDays < 7) return `${diffDays}d ${t.ago || 'ago'}`;
    return date.toLocaleDateString();
  };

  const renderHistoryItem = ({ item, index }: { item: HistoryItem; index: number }) => {
    const isLaw = item.type === 'law';
    const data = isLaw 
      ? laws.find(l => l.id === item.id)
      : questions.find(q => q.id === item.id);
    
    if (!data) return null;

    const country = countries.find(c => c.id === data.countryId);
    const category = categories.find(c => c.id === data.categoryId);

    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <TouchableOpacity
          style={[styles.historyCard, { backgroundColor: theme.card }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            if (isLaw) {
              router.push(`/law/${item.id}`);
            } else {
              router.push(`/question/${item.id}`);
            }
          }}
          activeOpacity={0.7}
        >
          {/* Type Badge */}
          <View style={[styles.typeBadge, { backgroundColor: isLaw ? '#eef2ff' : '#fef3c7' }]}>
            {isLaw ? (
              <BookOpen size={14} color="#6366f1" />
            ) : (
              <MessageCircle size={14} color="#f59e0b" />
            )}
          </View>

          {/* Content */}
          <View style={[styles.cardContent, isRTL && styles.rtl]}>
            <View style={styles.cardHeader}>
              {country && (
                <View style={styles.countryBadge}>
                  <FlagDisplay countryCode={country.code} size={14} />
                  <Text style={[styles.countryText, { color: theme.textSecondary }]}>
                    {getTranslatedName(country)}
                  </Text>
                </View>
              )}
              {category && (
                <View style={[styles.categoryBadge, { backgroundColor: theme.backgroundSecondary }]}>
                  <Text style={[styles.categoryText, { color: theme.textSecondary }]}>
                    {getTranslatedName(category)}
                  </Text>
                </View>
              )}
            </View>

            <Text 
              style={[styles.title, { color: theme.text }, isRTL && styles.rtlText]} 
              numberOfLines={2}
            >
              {data.title}
            </Text>

            <View style={[styles.metaRow, isRTL && styles.rtl]}>
              <View style={styles.metaItem}>
                <Clock size={12} color={theme.textSecondary} />
                <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                  {formatTimeAgo(item.viewedAt)}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Eye size={12} color={theme.textSecondary} />
                <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                  {item.viewCount} {item.viewCount === 1 ? (t.view || 'view') : (t.views || 'views')}
                </Text>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => handleRemoveItem(item.id)}
            >
              <Trash2 size={16} color="#ef4444" />
            </TouchableOpacity>
            <ChevronRight size={18} color={theme.textSecondary} />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <LinearGradient 
        colors={['#f0f9ff', '#e0f2fe']} 
        style={styles.emptyIconBg}
      >
        <Clock size={40} color="#0ea5e9" />
      </LinearGradient>
      <Text style={[styles.emptyTitle, { color: theme.text }]}>
        {t.noHistory || 'No Reading History'}
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
        {t.noHistoryDesc || 'Laws and questions you view will appear here'}
      </Text>
      <TouchableOpacity
        style={styles.exploreBtnContainer}
        onPress={() => router.push('/(tabs)/laws')}
      >
        <LinearGradient
          colors={['#6366f1', '#8b5cf6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.exploreBtn}
        >
          <Sparkles size={16} color="#fff" />
          <Text style={styles.exploreBtnText}>{t.exploreLaws || 'Explore Laws'}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: 'all', label: t.all || 'All', count: history.length },
    { key: 'laws', label: t.laws || 'Laws', count: recentLaws.length },
    { key: 'questions', label: t.questions || 'Questions', count: recentQuestions.length },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <LinearGradient
        colors={['#0ea5e9', '#0284c7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={[styles.headerContent, isRTL && styles.rtl]}>
          <View>
            <Text style={styles.headerTitle}>{t.readingHistory || 'Reading History'}</Text>
            <Text style={styles.headerSubtitle}>
              {history.length} {history.length === 1 ? (t.item || 'item') : (t.items || 'items')}
            </Text>
          </View>
          {history.length > 0 && (
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={handleClearHistory}
            >
              <Trash2 size={18} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={[styles.tabsContainer, { backgroundColor: theme.background }]}>
        <View style={[styles.tabs, isRTL && styles.rtl]}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                activeTab === tab.key && styles.activeTab,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveTab(tab.key);
              }}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === tab.key ? '#0ea5e9' : theme.textSecondary },
                ]}
              >
                {tab.label}
              </Text>
              {tab.count > 0 && (
                <View style={[
                  styles.tabBadge,
                  { backgroundColor: activeTab === tab.key ? '#0ea5e9' : theme.backgroundSecondary }
                ]}>
                  <Text style={[
                    styles.tabBadgeText,
                    { color: activeTab === tab.key ? '#fff' : theme.textSecondary }
                  ]}>
                    {tab.count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Content */}
      <FlatList
        data={filteredHistory}
        keyExtractor={item => `${item.type}-${item.id}`}
        renderItem={renderHistoryItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <HapticRefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  clearBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#e0f2fe',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  tabBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  typeBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  countryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  countryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 8,
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  exploreBtnContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  exploreBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  rtl: {
    flexDirection: 'row-reverse',
  },
  rtlText: {
    textAlign: 'right',
  },
});

