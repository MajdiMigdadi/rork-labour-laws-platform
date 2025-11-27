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

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ 
      headerBackTitle: 'Back',
    }}>
      <Stack.Screen name="landing" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
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
                    <ContactProvider>
                      <GestureHandlerRootView style={{ flex: 1 }}>
                        <RootLayoutNav />
                      </GestureHandlerRootView>
                    </ContactProvider>
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
