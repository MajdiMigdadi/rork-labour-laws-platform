import { Tabs } from 'expo-router';
import { Home, BookOpen, MessageCircle, User, Shield, Bookmark, Mail } from 'lucide-react-native';
import React from 'react';
import { Image, View } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/hooks/useTheme';

export default function TabLayout() {
  const { isAuthenticated, isAdmin, user } = useAuth();
  const { t } = useLanguage();
  const theme = useTheme();

  console.log('TabLayout - isAuthenticated:', isAuthenticated, 'isAdmin:', isAdmin, 'user role:', user?.role);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.tabIconDefault,
        headerShown: true,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: theme.background,
          borderBottomColor: theme.border,
          borderBottomWidth: 1,
        },
        headerTintColor: theme.text,
      }}
    >
      <Tabs.Screen name="law-detail" options={{ href: null }} />
      <Tabs.Screen name="question-detail" options={{ href: null }} />
      <Tabs.Screen name="ask-question" options={{ href: null }} />
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="laws"
        options={{
          title: t.laws,
          tabBarIcon: ({ color }) => <BookOpen size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="questions"
        options={{
          title: t.qa,
          tabBarIcon: ({ color }) => <MessageCircle size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Saved',
          tabBarIcon: ({ color }) => <Bookmark size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="contact"
        options={{
          title: 'Contact',
          tabBarIcon: ({ color }) => <Mail size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: t.admin,
          tabBarIcon: ({ color }) => <Shield size={24} color={color} />,
          href: isAdmin ? '/(tabs)/admin' : null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: isAuthenticated ? t.profile : t.login,
          tabBarIcon: ({ color }) => {
            if (user?.avatar) {
              return (
                <View style={{ width: 28, height: 28, borderRadius: 14, overflow: 'hidden', borderWidth: 2, borderColor: color }}>
                  <Image source={{ uri: user.avatar }} style={{ width: '100%', height: '100%' }} />
                </View>
              );
            }
            return <User size={24} color={color} />;
          },
        }}
      />
      <Tabs.Screen name="login" options={{ href: null }} />
    </Tabs>
  );
}
