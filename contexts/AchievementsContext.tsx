import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

const ACHIEVEMENTS_KEY = '@achievements';
const STATS_KEY = '@user_stats';

export interface Achievement {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  icon: string;
  color: string;
  requirement: number;
  type: 'laws_read' | 'questions_asked' | 'answers_given' | 'streak' | 'favorites' | 'first_action';
  unlockedAt?: string;
}

export interface UserStats {
  lawsRead: number;
  questionsAsked: number;
  answersGiven: number;
  currentStreak: number;
  longestStreak: number;
  totalFavorites: number;
  lastActiveDate: string;
  joinDate: string;
}

const defaultStats: UserStats = {
  lawsRead: 0,
  questionsAsked: 0,
  answersGiven: 0,
  currentStreak: 0,
  longestStreak: 0,
  totalFavorites: 0,
  lastActiveDate: new Date().toISOString(),
  joinDate: new Date().toISOString(),
};

export const achievementsList: Achievement[] = [
  // First Actions
  { id: 'first_law', title: 'First Steps', titleAr: 'الخطوة الأولى', description: 'Read your first law', descriptionAr: 'اقرأ أول قانون', icon: '📖', color: '#10b981', requirement: 1, type: 'laws_read' },
  { id: 'first_question', title: 'Curious Mind', titleAr: 'عقل فضولي', description: 'Ask your first question', descriptionAr: 'اطرح أول سؤال', icon: '❓', color: '#6366f1', requirement: 1, type: 'questions_asked' },
  { id: 'first_answer', title: 'Helper', titleAr: 'المساعد', description: 'Give your first answer', descriptionAr: 'قدم أول إجابة', icon: '💡', color: '#f59e0b', requirement: 1, type: 'answers_given' },
  
  // Laws Read
  { id: 'laws_5', title: 'Law Student', titleAr: 'طالب قانون', description: 'Read 5 laws', descriptionAr: 'اقرأ 5 قوانين', icon: '📚', color: '#06b6d4', requirement: 5, type: 'laws_read' },
  { id: 'laws_25', title: 'Legal Eagle', titleAr: 'نسر قانوني', description: 'Read 25 laws', descriptionAr: 'اقرأ 25 قانون', icon: '🦅', color: '#8b5cf6', requirement: 25, type: 'laws_read' },
  { id: 'laws_50', title: 'Law Expert', titleAr: 'خبير قانوني', description: 'Read 50 laws', descriptionAr: 'اقرأ 50 قانون', icon: '🎓', color: '#ec4899', requirement: 50, type: 'laws_read' },
  { id: 'laws_100', title: 'Legal Master', titleAr: 'سيد القانون', description: 'Read 100 laws', descriptionAr: 'اقرأ 100 قانون', icon: '👨‍⚖️', color: '#f97316', requirement: 100, type: 'laws_read' },
  
  // Questions Asked
  { id: 'questions_5', title: 'Inquisitive', titleAr: 'المستفسر', description: 'Ask 5 questions', descriptionAr: 'اطرح 5 أسئلة', icon: '🔍', color: '#14b8a6', requirement: 5, type: 'questions_asked' },
  { id: 'questions_20', title: 'Question Master', titleAr: 'سيد الأسئلة', description: 'Ask 20 questions', descriptionAr: 'اطرح 20 سؤال', icon: '🎯', color: '#a855f7', requirement: 20, type: 'questions_asked' },
  
  // Answers Given
  { id: 'answers_5', title: 'Contributor', titleAr: 'المساهم', description: 'Give 5 answers', descriptionAr: 'قدم 5 إجابات', icon: '🤝', color: '#22c55e', requirement: 5, type: 'answers_given' },
  { id: 'answers_25', title: 'Community Hero', titleAr: 'بطل المجتمع', description: 'Give 25 answers', descriptionAr: 'قدم 25 إجابة', icon: '🦸', color: '#3b82f6', requirement: 25, type: 'answers_given' },
  { id: 'answers_50', title: 'Sage', titleAr: 'الحكيم', description: 'Give 50 answers', descriptionAr: 'قدم 50 إجابة', icon: '🧙', color: '#eab308', requirement: 50, type: 'answers_given' },
  
  // Streaks
  { id: 'streak_3', title: 'Getting Started', titleAr: 'البداية', description: '3 day streak', descriptionAr: 'سلسلة 3 أيام', icon: '🔥', color: '#ef4444', requirement: 3, type: 'streak' },
  { id: 'streak_7', title: 'Week Warrior', titleAr: 'محارب الأسبوع', description: '7 day streak', descriptionAr: 'سلسلة 7 أيام', icon: '⚡', color: '#f59e0b', requirement: 7, type: 'streak' },
  { id: 'streak_30', title: 'Dedicated', titleAr: 'مخلص', description: '30 day streak', descriptionAr: 'سلسلة 30 يوم', icon: '💎', color: '#06b6d4', requirement: 30, type: 'streak' },
  
  // Favorites
  { id: 'favorites_10', title: 'Collector', titleAr: 'الجامع', description: 'Save 10 favorites', descriptionAr: 'احفظ 10 مفضلات', icon: '⭐', color: '#fbbf24', requirement: 10, type: 'favorites' },
  { id: 'favorites_50', title: 'Archivist', titleAr: 'الأرشيفي', description: 'Save 50 favorites', descriptionAr: 'احفظ 50 مفضلة', icon: '🏆', color: '#f97316', requirement: 50, type: 'favorites' },
];

interface AchievementsContextType {
  achievements: Achievement[];
  unlockedAchievements: string[];
  stats: UserStats;
  checkAndUnlockAchievements: () => Achievement[];
  incrementStat: (stat: keyof Pick<UserStats, 'lawsRead' | 'questionsAsked' | 'answersGiven' | 'totalFavorites'>) => void;
  updateStreak: () => void;
  getProgress: (achievement: Achievement) => number;
  recentUnlock: Achievement | null;
  clearRecentUnlock: () => void;
}

const AchievementsContext = createContext<AchievementsContextType | undefined>(undefined);

export function AchievementsProvider({ children }: { children: ReactNode }) {
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [stats, setStats] = useState<UserStats>(defaultStats);
  const [recentUnlock, setRecentUnlock] = useState<Achievement | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [achievementsData, statsData] = await Promise.all([
        AsyncStorage.getItem(ACHIEVEMENTS_KEY),
        AsyncStorage.getItem(STATS_KEY),
      ]);
      
      if (achievementsData) {
        setUnlockedAchievements(JSON.parse(achievementsData));
      }
      
      if (statsData) {
        setStats(JSON.parse(statsData));
      }
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  };

  const saveData = async (newUnlocked: string[], newStats: UserStats) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(newUnlocked)),
        AsyncStorage.setItem(STATS_KEY, JSON.stringify(newStats)),
      ]);
    } catch (error) {
      console.error('Error saving achievements:', error);
    }
  };

  const checkAndUnlockAchievements = useCallback(() => {
    const newlyUnlocked: Achievement[] = [];
    
    achievementsList.forEach(achievement => {
      if (unlockedAchievements.includes(achievement.id)) return;
      
      let currentValue = 0;
      switch (achievement.type) {
        case 'laws_read':
          currentValue = stats.lawsRead;
          break;
        case 'questions_asked':
          currentValue = stats.questionsAsked;
          break;
        case 'answers_given':
          currentValue = stats.answersGiven;
          break;
        case 'streak':
          currentValue = stats.currentStreak;
          break;
        case 'favorites':
          currentValue = stats.totalFavorites;
          break;
      }
      
      if (currentValue >= achievement.requirement) {
        newlyUnlocked.push({
          ...achievement,
          unlockedAt: new Date().toISOString(),
        });
      }
    });
    
    if (newlyUnlocked.length > 0) {
      const newUnlockedIds = [...unlockedAchievements, ...newlyUnlocked.map(a => a.id)];
      setUnlockedAchievements(newUnlockedIds);
      saveData(newUnlockedIds, stats);
      
      // Show most recent unlock
      setRecentUnlock(newlyUnlocked[newlyUnlocked.length - 1]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    return newlyUnlocked;
  }, [unlockedAchievements, stats]);

  const incrementStat = useCallback((stat: keyof Pick<UserStats, 'lawsRead' | 'questionsAsked' | 'answersGiven' | 'totalFavorites'>) => {
    setStats(prev => {
      const newStats = { ...prev, [stat]: prev[stat] + 1 };
      saveData(unlockedAchievements, newStats);
      return newStats;
    });
  }, [unlockedAchievements]);

  const updateStreak = useCallback(() => {
    const today = new Date().toDateString();
    const lastActive = new Date(stats.lastActiveDate).toDateString();
    
    if (today === lastActive) return;
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    setStats(prev => {
      let newStreak = prev.currentStreak;
      
      if (yesterday.toDateString() === lastActive) {
        newStreak = prev.currentStreak + 1;
      } else if (today !== lastActive) {
        newStreak = 1;
      }
      
      const newStats = {
        ...prev,
        currentStreak: newStreak,
        longestStreak: Math.max(prev.longestStreak, newStreak),
        lastActiveDate: new Date().toISOString(),
      };
      
      saveData(unlockedAchievements, newStats);
      return newStats;
    });
  }, [stats.lastActiveDate, unlockedAchievements]);

  const getProgress = useCallback((achievement: Achievement) => {
    let currentValue = 0;
    switch (achievement.type) {
      case 'laws_read':
        currentValue = stats.lawsRead;
        break;
      case 'questions_asked':
        currentValue = stats.questionsAsked;
        break;
      case 'answers_given':
        currentValue = stats.answersGiven;
        break;
      case 'streak':
        currentValue = stats.currentStreak;
        break;
      case 'favorites':
        currentValue = stats.totalFavorites;
        break;
    }
    return Math.min(currentValue / achievement.requirement, 1);
  }, [stats]);

  const clearRecentUnlock = useCallback(() => {
    setRecentUnlock(null);
  }, []);

  const achievements = achievementsList.map(a => ({
    ...a,
    unlockedAt: unlockedAchievements.includes(a.id) ? 'unlocked' : undefined,
  }));

  return (
    <AchievementsContext.Provider
      value={{
        achievements,
        unlockedAchievements,
        stats,
        checkAndUnlockAchievements,
        incrementStat,
        updateStreak,
        getProgress,
        recentUnlock,
        clearRecentUnlock,
      }}
    >
      {children}
    </AchievementsContext.Provider>
  );
}

export function useAchievements() {
  const context = useContext(AchievementsContext);
  if (!context) {
    throw new Error('useAchievements must be used within an AchievementsProvider');
  }
  return context;
}

