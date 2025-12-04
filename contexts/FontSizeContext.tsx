import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FONT_SIZE_KEY = '@font_size_setting';

export type FontSizeLevel = 'small' | 'medium' | 'large' | 'xlarge';

interface FontSizes {
  xs: number;
  sm: number;
  base: number;
  lg: number;
  xl: number;
  '2xl': number;
  '3xl': number;
  '4xl': number;
}

const fontSizeScales: Record<FontSizeLevel, FontSizes> = {
  small: {
    xs: 10,
    sm: 12,
    base: 14,
    lg: 16,
    xl: 18,
    '2xl': 22,
    '3xl': 26,
    '4xl': 32,
  },
  medium: {
    xs: 11,
    sm: 13,
    base: 15,
    lg: 17,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  large: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 22,
    '2xl': 28,
    '3xl': 34,
    '4xl': 42,
  },
  xlarge: {
    xs: 14,
    sm: 16,
    base: 18,
    lg: 20,
    xl: 24,
    '2xl': 32,
    '3xl': 40,
    '4xl': 48,
  },
};

interface FontSizeContextType {
  fontSizeLevel: FontSizeLevel;
  setFontSizeLevel: (level: FontSizeLevel) => void;
  fontSize: FontSizes;
  fontScale: number;
}

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined);

export function FontSizeProvider({ children }: { children: ReactNode }) {
  const [fontSizeLevel, setFontSizeLevelState] = useState<FontSizeLevel>('medium');

  useEffect(() => {
    loadFontSize();
  }, []);

  const loadFontSize = async () => {
    try {
      const saved = await AsyncStorage.getItem(FONT_SIZE_KEY);
      if (saved) {
        setFontSizeLevelState(saved as FontSizeLevel);
      }
    } catch (error) {
      console.error('Error loading font size:', error);
    }
  };

  const setFontSizeLevel = async (level: FontSizeLevel) => {
    try {
      await AsyncStorage.setItem(FONT_SIZE_KEY, level);
      setFontSizeLevelState(level);
    } catch (error) {
      console.error('Error saving font size:', error);
    }
  };

  const fontScale = fontSizeLevel === 'small' ? 0.9 : fontSizeLevel === 'large' ? 1.1 : fontSizeLevel === 'xlarge' ? 1.2 : 1;

  return (
    <FontSizeContext.Provider
      value={{
        fontSizeLevel,
        setFontSizeLevel,
        fontSize: fontSizeScales[fontSizeLevel],
        fontScale,
      }}
    >
      {children}
    </FontSizeContext.Provider>
  );
}

export function useFontSize() {
  const context = useContext(FontSizeContext);
  if (!context) {
    throw new Error('useFontSize must be used within a FontSizeProvider');
  }
  return context;
}

