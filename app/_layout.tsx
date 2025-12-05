import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from '@/contexts/AuthContext';
import { DataProvider } from '@/contexts/DataContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { FavoritesProvider } from '@/contexts/FavoritesContext';
import { NotificationsProvider } from '@/contexts/NotificationsContext';
import { ReputationProvider } from '@/contexts/ReputationContext';
import { ContactProvider } from '@/contexts/ContactContext';
import { ReadingHistoryProvider } from '@/contexts/ReadingHistoryContext';
import { FontSizeProvider } from '@/contexts/FontSizeContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AchievementsProvider } from '@/contexts/AchievementsContext';
import { BookmarksProvider } from '@/contexts/BookmarksContext';
import FloatingActionButton from '@/components/FloatingActionButton';
import AchievementPopup from '@/components/AchievementPopup';
import { useFavicon } from '@/hooks/useFavicon';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function FaviconManager() {
  useFavicon();
  return null;
}

function RootLayoutNav() {
  return (
    <>
      <FaviconManager />
      <Stack screenOptions={{ 
        headerBackTitle: 'Back',
      }}>
        <Stack.Screen name="landing" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <FloatingActionButton />
      <AchievementPopup />
    </>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <LanguageProvider>
          <AuthProvider>
            <DataProvider>
              <ReputationProvider>
                <FavoritesProvider>
                  <NotificationsProvider>
                    <ReadingHistoryProvider>
                      <FontSizeProvider>
                        <ThemeProvider>
                          <AchievementsProvider>
                            <BookmarksProvider>
                              <ContactProvider>
                                <GestureHandlerRootView style={{ flex: 1 }}>
                                  <RootLayoutNav />
                                </GestureHandlerRootView>
                              </ContactProvider>
                            </BookmarksProvider>
                          </AchievementsProvider>
                        </ThemeProvider>
                      </FontSizeProvider>
                    </ReadingHistoryProvider>
                  </NotificationsProvider>
                </FavoritesProvider>
              </ReputationProvider>
            </DataProvider>
          </AuthProvider>
        </LanguageProvider>
      </SettingsProvider>
    </QueryClientProvider>
  );
}
