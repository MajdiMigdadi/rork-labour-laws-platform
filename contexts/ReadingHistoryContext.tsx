import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_STORAGE_KEY = '@reading_history';
const MAX_HISTORY_ITEMS = 50;

export interface HistoryItem {
  id: string;
  type: 'law' | 'question';
  viewedAt: string;
  viewCount: number;
}

interface ReadingHistoryContextType {
  history: HistoryItem[];
  recentLaws: HistoryItem[];
  recentQuestions: HistoryItem[];
  addToHistory: (id: string, type: 'law' | 'question') => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;
  getViewCount: (id: string) => number;
  getLastViewed: (id: string) => string | null;
  isRecentlyViewed: (id: string) => boolean;
}

const ReadingHistoryContext = createContext<ReadingHistoryContextType | undefined>(undefined);

export function ReadingHistoryProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading reading history:', error);
    }
  };

  const saveHistory = async (newHistory: HistoryItem[]) => {
    try {
      await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(newHistory));
      setHistory(newHistory);
    } catch (error) {
      console.error('Error saving reading history:', error);
    }
  };

  const addToHistory = useCallback((id: string, type: 'law' | 'question') => {
    setHistory(prev => {
      const existingIndex = prev.findIndex(item => item.id === id);
      const now = new Date().toISOString();
      
      let newHistory: HistoryItem[];
      
      if (existingIndex !== -1) {
        // Update existing item
        const existing = prev[existingIndex];
        const updated: HistoryItem = {
          ...existing,
          viewedAt: now,
          viewCount: existing.viewCount + 1,
        };
        // Move to front
        newHistory = [updated, ...prev.filter((_, i) => i !== existingIndex)];
      } else {
        // Add new item
        const newItem: HistoryItem = {
          id,
          type,
          viewedAt: now,
          viewCount: 1,
        };
        newHistory = [newItem, ...prev];
      }
      
      // Limit history size
      newHistory = newHistory.slice(0, MAX_HISTORY_ITEMS);
      
      // Save async
      AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(newHistory)).catch(console.error);
      
      return newHistory;
    });
  }, []);

  const removeFromHistory = useCallback((id: string) => {
    setHistory(prev => {
      const newHistory = prev.filter(item => item.id !== id);
      AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(newHistory)).catch(console.error);
      return newHistory;
    });
  }, []);

  const clearHistory = useCallback(async () => {
    await AsyncStorage.removeItem(HISTORY_STORAGE_KEY);
    setHistory([]);
  }, []);

  const getViewCount = useCallback((id: string) => {
    const item = history.find(h => h.id === id);
    return item?.viewCount || 0;
  }, [history]);

  const getLastViewed = useCallback((id: string) => {
    const item = history.find(h => h.id === id);
    return item?.viewedAt || null;
  }, [history]);

  const isRecentlyViewed = useCallback((id: string) => {
    return history.some(h => h.id === id);
  }, [history]);

  // Filter by type
  const recentLaws = history.filter(item => item.type === 'law');
  const recentQuestions = history.filter(item => item.type === 'question');

  return (
    <ReadingHistoryContext.Provider
      value={{
        history,
        recentLaws,
        recentQuestions,
        addToHistory,
        removeFromHistory,
        clearHistory,
        getViewCount,
        getLastViewed,
        isRecentlyViewed,
      }}
    >
      {children}
    </ReadingHistoryContext.Provider>
  );
}

export function useReadingHistory() {
  const context = useContext(ReadingHistoryContext);
  if (!context) {
    throw new Error('useReadingHistory must be used within a ReadingHistoryProvider');
  }
  return context;
}

