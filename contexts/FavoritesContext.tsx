import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = '@favorites';

export interface Favorites {
  laws: string[];
  questions: string[];
}

export const [FavoritesProvider, useFavorites] = createContextHook(() => {
  const [favorites, setFavorites] = useState<Favorites>({
    laws: [],
    questions: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setFavorites(parsed);
        } catch (parseError) {
          console.error('Failed to parse favorites, using defaults:', parseError);
          await AsyncStorage.removeItem(FAVORITES_KEY);
        }
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveFavorites = async (newFavorites: Favorites) => {
    try {
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } catch (error) {
      console.error('Failed to save favorites:', error);
    }
  };

  const toggleLawFavorite = async (lawId: string) => {
    const isCurrentlyFavorited = favorites.laws.includes(lawId);
    const newLaws = isCurrentlyFavorited
      ? favorites.laws.filter(id => id !== lawId)
      : [...favorites.laws, lawId];
    
    await saveFavorites({ ...favorites, laws: newLaws });
  };

  const toggleQuestionFavorite = async (questionId: string) => {
    const isCurrentlyFavorited = favorites.questions.includes(questionId);
    const newQuestions = isCurrentlyFavorited
      ? favorites.questions.filter(id => id !== questionId)
      : [...favorites.questions, questionId];
    
    await saveFavorites({ ...favorites, questions: newQuestions });
  };

  const isLawFavorited = (lawId: string) => {
    return favorites.laws.includes(lawId);
  };

  const isQuestionFavorited = (questionId: string) => {
    return favorites.questions.includes(questionId);
  };

  const clearAllFavorites = async () => {
    await saveFavorites({ laws: [], questions: [] });
  };

  return {
    favorites,
    isLoading,
    toggleLawFavorite,
    toggleQuestionFavorite,
    isLawFavorited,
    isQuestionFavorited,
    clearAllFavorites,
  };
});
