import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { useData } from './DataContext';

const REPUTATION_KEY = '@reputation_data';

export type BadgeType = 
  | 'first_question'
  | 'first_answer'
  | 'helpful_answer'
  | 'expert_contributor'
  | 'popular_question'
  | 'best_answer_streak'
  | 'community_helper'
  | 'rising_star'
  | 'veteran'
  | 'reputation_master';

export interface Badge {
  id: BadgeType;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earnedAt?: string;
}

export interface UserReputation {
  userId: string;
  reputation: number;
  questionsAsked: number;
  answersGiven: number;
  bestAnswers: number;
  badges: Badge[];
  level: 'beginner' | 'intermediate' | 'expert';
}

export const BADGE_DEFINITIONS: Record<BadgeType, Omit<Badge, 'earnedAt'>> = {
  first_question: {
    id: 'first_question',
    name: 'First Steps',
    description: 'Ask your first question',
    icon: '❓',
    rarity: 'common',
  },
  first_answer: {
    id: 'first_answer',
    name: 'Helper',
    description: 'Give your first answer',
    icon: '💬',
    rarity: 'common',
  },
  helpful_answer: {
    id: 'helpful_answer',
    name: 'Helpful',
    description: 'Receive 5 upvotes on an answer',
    icon: '👍',
    rarity: 'common',
  },
  expert_contributor: {
    id: 'expert_contributor',
    name: 'Expert',
    description: 'Give 50 answers',
    icon: '🎓',
    rarity: 'rare',
  },
  popular_question: {
    id: 'popular_question',
    name: 'Popular',
    description: 'Get 10 upvotes on a question',
    icon: '🔥',
    rarity: 'rare',
  },
  best_answer_streak: {
    id: 'best_answer_streak',
    name: 'Streak Master',
    description: 'Get 5 best answers',
    icon: '⭐',
    rarity: 'epic',
  },
  community_helper: {
    id: 'community_helper',
    name: 'Community Helper',
    description: 'Help 100 people with answers',
    icon: '🤝',
    rarity: 'epic',
  },
  rising_star: {
    id: 'rising_star',
    name: 'Rising Star',
    description: 'Reach 500 reputation',
    icon: '🌟',
    rarity: 'epic',
  },
  veteran: {
    id: 'veteran',
    name: 'Veteran',
    description: 'Active for 30 days',
    icon: '🏆',
    rarity: 'legendary',
  },
  reputation_master: {
    id: 'reputation_master',
    name: 'Master',
    description: 'Reach 1000 reputation',
    icon: '👑',
    rarity: 'legendary',
  },
};

const POINTS = {
  ASK_QUESTION: 5,
  GIVE_ANSWER: 10,
  UPVOTE_RECEIVED: 10,
  DOWNVOTE_RECEIVED: -5,
  BEST_ANSWER: 50,
  BEST_ANSWER_BONUS: 25,
};

export const [ReputationProvider, useReputation] = createContextHook(() => {
  const [reputationData, setReputationData] = useState<Record<string, UserReputation>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { users, updateAnyUser } = useAuth();
  const { questions, answers } = useData();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    syncReputationData();
  }, [questions, answers]);

  const loadData = async () => {
    try {
      const stored = await AsyncStorage.getItem(REPUTATION_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setReputationData(parsed);
        } catch (parseError) {
          console.error('Failed to parse reputation data, resetting:', parseError);
          await AsyncStorage.removeItem(REPUTATION_KEY);
          setReputationData({});
        }
      }
    } catch (error) {
      console.error('Failed to load reputation data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveData = async (data: Record<string, UserReputation>) => {
    try {
      await AsyncStorage.setItem(REPUTATION_KEY, JSON.stringify(data));
      setReputationData(data);
    } catch (error) {
      console.error('Failed to save reputation data:', error);
    }
  };

  const syncReputationData = useCallback(() => {
    const newData: Record<string, UserReputation> = { ...reputationData };

    users.forEach(user => {
      if (!newData[user.id]) {
        newData[user.id] = {
          userId: user.id,
          reputation: user.reputation,
          questionsAsked: 0,
          answersGiven: 0,
          bestAnswers: 0,
          badges: [],
          level: user.level,
        };
      }

      const userQuestions = questions.filter(q => q.userId === user.id);
      const userAnswers = answers.filter(a => a.userId === user.id);
      const userBestAnswers = userAnswers.filter(a => a.isAccepted);

      newData[user.id].questionsAsked = userQuestions.length;
      newData[user.id].answersGiven = userAnswers.length;
      newData[user.id].bestAnswers = userBestAnswers.length;
    });

    setReputationData(newData);
  }, [users, questions, answers, reputationData]);

  const getUserReputation = useCallback((userId: string): UserReputation => {
    return reputationData[userId] || {
      userId,
      reputation: 0,
      questionsAsked: 0,
      answersGiven: 0,
      bestAnswers: 0,
      badges: [],
      level: 'beginner',
    };
  }, [reputationData]);

  const awardPoints = useCallback(async (userId: string, points: number, reason: string) => {
    const userData = getUserReputation(userId);
    const newReputation = Math.max(0, userData.reputation + points);
    
    const newLevel: 'beginner' | 'intermediate' | 'expert' = newReputation >= 500 ? 'expert' : newReputation >= 101 ? 'intermediate' : 'beginner';
    
    const updatedData = {
      ...reputationData,
      [userId]: {
        ...userData,
        reputation: newReputation,
        level: newLevel,
      },
    };
    
    await saveData(updatedData);
    await updateAnyUser(userId, { reputation: newReputation, level: newLevel });
    
    await checkBadges(userId);
    
    console.log(`Awarded ${points} points to user ${userId} for: ${reason}`);
  }, [reputationData, getUserReputation, updateAnyUser]);

  const checkBadges = useCallback(async (userId: string) => {
    const userData = getUserReputation(userId);
    const newBadges: Badge[] = [...userData.badges];
    let badgesEarned = false;

    const awardBadge = (badgeType: BadgeType) => {
      if (!newBadges.find(b => b.id === badgeType)) {
        const badge = { ...BADGE_DEFINITIONS[badgeType], earnedAt: new Date().toISOString() };
        newBadges.push(badge);
        badgesEarned = true;
        console.log(`Badge earned: ${badge.name} for user ${userId}`);
      }
    };

    if (userData.questionsAsked >= 1) {
      awardBadge('first_question');
    }
    if (userData.answersGiven >= 1) {
      awardBadge('first_answer');
    }
    if (userData.answersGiven >= 50) {
      awardBadge('expert_contributor');
    }
    if (userData.answersGiven >= 100) {
      awardBadge('community_helper');
    }
    if (userData.bestAnswers >= 5) {
      awardBadge('best_answer_streak');
    }
    if (userData.reputation >= 500) {
      awardBadge('rising_star');
    }
    if (userData.reputation >= 1000) {
      awardBadge('reputation_master');
    }

    const userAnswers = answers.filter(a => a.userId === userId);
    const hasHighUpvotedAnswer = userAnswers.some(a => a.votes >= 5);
    if (hasHighUpvotedAnswer) {
      awardBadge('helpful_answer');
    }

    const userQuestions = questions.filter(q => q.userId === userId);
    const hasPopularQuestion = userQuestions.some(q => q.votes >= 10);
    if (hasPopularQuestion) {
      awardBadge('popular_question');
    }

    if (badgesEarned) {
      const updatedData = {
        ...reputationData,
        [userId]: {
          ...userData,
          badges: newBadges,
        },
      };
      await saveData(updatedData);
    }
  }, [reputationData, getUserReputation, answers, questions]);

  const onQuestionAsked = useCallback(async (userId: string) => {
    await awardPoints(userId, POINTS.ASK_QUESTION, 'Asked a question');
    const userData = getUserReputation(userId);
    const updatedData = {
      ...reputationData,
      [userId]: {
        ...userData,
        questionsAsked: userData.questionsAsked + 1,
      },
    };
    await saveData(updatedData);
    await checkBadges(userId);
  }, [awardPoints, getUserReputation, reputationData, checkBadges]);

  const onAnswerGiven = useCallback(async (userId: string) => {
    await awardPoints(userId, POINTS.GIVE_ANSWER, 'Gave an answer');
    const userData = getUserReputation(userId);
    const updatedData = {
      ...reputationData,
      [userId]: {
        ...userData,
        answersGiven: userData.answersGiven + 1,
      },
    };
    await saveData(updatedData);
    await checkBadges(userId);
  }, [awardPoints, getUserReputation, reputationData, checkBadges]);

  const onVoteReceived = useCallback(async (userId: string, isUpvote: boolean) => {
    const points = isUpvote ? POINTS.UPVOTE_RECEIVED : POINTS.DOWNVOTE_RECEIVED;
    await awardPoints(userId, points, `Received ${isUpvote ? 'upvote' : 'downvote'}`);
  }, [awardPoints]);

  const onBestAnswer = useCallback(async (userId: string) => {
    await awardPoints(userId, POINTS.BEST_ANSWER, 'Answer marked as best');
    const userData = getUserReputation(userId);
    const updatedData = {
      ...reputationData,
      [userId]: {
        ...userData,
        bestAnswers: userData.bestAnswers + 1,
      },
    };
    await saveData(updatedData);
    await checkBadges(userId);
  }, [awardPoints, getUserReputation, reputationData, checkBadges]);

  const getLeaderboard = useCallback(() => {
    return Object.values(reputationData)
      .sort((a, b) => b.reputation - a.reputation)
      .slice(0, 10);
  }, [reputationData]);

  const getRarityColor = (rarity: Badge['rarity']) => {
    switch (rarity) {
      case 'common': return '#94A3B8';
      case 'rare': return '#3B82F6';
      case 'epic': return '#A855F7';
      case 'legendary': return '#F59E0B';
      default: return '#94A3B8';
    }
  };

  return {
    reputationData,
    isLoading,
    getUserReputation,
    awardPoints,
    onQuestionAsked,
    onAnswerGiven,
    onVoteReceived,
    onBestAnswer,
    getLeaderboard,
    getRarityColor,
    checkBadges,
    BADGE_DEFINITIONS,
  };
});
