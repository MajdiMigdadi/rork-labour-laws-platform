import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

const BOOKMARKS_KEY = '@smart_bookmarks';

export interface BookmarkFolder {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
  color: string;
  createdAt: string;
  items: BookmarkItem[];
}

export interface BookmarkItem {
  id: string;
  type: 'law' | 'question';
  addedAt: string;
}

const defaultFolders: BookmarkFolder[] = [
  {
    id: 'work',
    name: 'Work Related',
    nameAr: 'متعلق بالعمل',
    icon: '💼',
    color: '#6366f1',
    createdAt: new Date().toISOString(),
    items: [],
  },
  {
    id: 'important',
    name: 'Important',
    nameAr: 'مهم',
    icon: '⭐',
    color: '#f59e0b',
    createdAt: new Date().toISOString(),
    items: [],
  },
  {
    id: 'reference',
    name: 'Reference',
    nameAr: 'مرجع',
    icon: '📚',
    color: '#10b981',
    createdAt: new Date().toISOString(),
    items: [],
  },
];

interface BookmarksContextType {
  folders: BookmarkFolder[];
  createFolder: (name: string, nameAr: string, icon: string, color: string) => void;
  deleteFolder: (folderId: string) => void;
  updateFolder: (folderId: string, updates: Partial<BookmarkFolder>) => void;
  addToFolder: (folderId: string, itemId: string, type: 'law' | 'question') => void;
  removeFromFolder: (folderId: string, itemId: string) => void;
  moveToFolder: (fromFolderId: string, toFolderId: string, itemId: string) => void;
  getItemFolders: (itemId: string) => BookmarkFolder[];
  isInFolder: (folderId: string, itemId: string) => boolean;
}

const BookmarksContext = createContext<BookmarksContextType | undefined>(undefined);

export function BookmarksProvider({ children }: { children: ReactNode }) {
  const [folders, setFolders] = useState<BookmarkFolder[]>(defaultFolders);

  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    try {
      const saved = await AsyncStorage.getItem(BOOKMARKS_KEY);
      if (saved) {
        setFolders(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    }
  };

  const saveFolders = async (newFolders: BookmarkFolder[]) => {
    try {
      await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(newFolders));
      setFolders(newFolders);
    } catch (error) {
      console.error('Error saving bookmarks:', error);
    }
  };

  const createFolder = useCallback((name: string, nameAr: string, icon: string, color: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newFolder: BookmarkFolder = {
      id: `folder_${Date.now()}`,
      name,
      nameAr,
      icon,
      color,
      createdAt: new Date().toISOString(),
      items: [],
    };
    saveFolders([...folders, newFolder]);
  }, [folders]);

  const deleteFolder = useCallback((folderId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    saveFolders(folders.filter(f => f.id !== folderId));
  }, [folders]);

  const updateFolder = useCallback((folderId: string, updates: Partial<BookmarkFolder>) => {
    saveFolders(folders.map(f => 
      f.id === folderId ? { ...f, ...updates } : f
    ));
  }, [folders]);

  const addToFolder = useCallback((folderId: string, itemId: string, type: 'law' | 'question') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    saveFolders(folders.map(f => {
      if (f.id !== folderId) return f;
      if (f.items.some(i => i.id === itemId)) return f;
      return {
        ...f,
        items: [...f.items, { id: itemId, type, addedAt: new Date().toISOString() }],
      };
    }));
  }, [folders]);

  const removeFromFolder = useCallback((folderId: string, itemId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    saveFolders(folders.map(f => {
      if (f.id !== folderId) return f;
      return {
        ...f,
        items: f.items.filter(i => i.id !== itemId),
      };
    }));
  }, [folders]);

  const moveToFolder = useCallback((fromFolderId: string, toFolderId: string, itemId: string) => {
    const fromFolder = folders.find(f => f.id === fromFolderId);
    const item = fromFolder?.items.find(i => i.id === itemId);
    if (!item) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    saveFolders(folders.map(f => {
      if (f.id === fromFolderId) {
        return { ...f, items: f.items.filter(i => i.id !== itemId) };
      }
      if (f.id === toFolderId) {
        if (f.items.some(i => i.id === itemId)) return f;
        return { ...f, items: [...f.items, item] };
      }
      return f;
    }));
  }, [folders]);

  const getItemFolders = useCallback((itemId: string) => {
    return folders.filter(f => f.items.some(i => i.id === itemId));
  }, [folders]);

  const isInFolder = useCallback((folderId: string, itemId: string) => {
    const folder = folders.find(f => f.id === folderId);
    return folder?.items.some(i => i.id === itemId) || false;
  }, [folders]);

  return (
    <BookmarksContext.Provider
      value={{
        folders,
        createFolder,
        deleteFolder,
        updateFolder,
        addToFolder,
        removeFromFolder,
        moveToFolder,
        getItemFolders,
        isInFolder,
      }}
    >
      {children}
    </BookmarksContext.Provider>
  );
}

export function useBookmarks() {
  const context = useContext(BookmarksContext);
  if (!context) {
    throw new Error('useBookmarks must be used within a BookmarksProvider');
  }
  return context;
}

