import { Tabs } from 'expo-router';
import { Home, BookOpen, MessageCircle, User, Shield, Bookmark, Mail, Bell } from 'lucide-react-native';
import React from 'react';
import { Image, View, StyleSheet, Platform, Text } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/hooks/useTheme';
import { useNotifications } from '@/contexts/NotificationsContext';
import { LinearGradient } from 'expo-linear-gradient';
import NotificationBell from '@/components/NotificationBell';

// Custom Tab Icon with active background
const TabIcon = ({ icon: Icon, color, focused, size = 22 }: { icon: any, color: string, focused: boolean, size?: number }) => {
  if (focused) {
    return (
      <View style={styles.activeIconContainer}>
        <LinearGradient
          colors={['#6366f1', '#8b5cf6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.activeIconBg}
        >
          <Icon size={size} color="#fff" strokeWidth={2.5} />
        </LinearGradient>
      </View>
    );
  }
  return <Icon size={size} color={color} strokeWidth={2} />;
};

// Tab Icon with Badge for Notifications
const NotificationTabIcon = ({ color, focused }: { color: string, focused: boolean }) => {
  const { unreadCount } = useNotifications();
  
  if (focused) {
    return (
      <View style={styles.activeIconContainer}>
        <LinearGradient
          colors={['#6366f1', '#8b5cf6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.activeIconBg}
        >
          <Bell size={22} color="#fff" strokeWidth={2.5} />
          {unreadCount > 0 && (
            <View style={styles.tabBadgeActive}>
              <Text style={styles.tabBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          )}
        </LinearGradient>
      </View>
    );
  }
  
  return (
    <View style={styles.bellContainer}>
      <Bell size={22} color={color} strokeWidth={2} />
      {unreadCount > 0 && (
        <View style={styles.tabBadge}>
          <Text style={styles.tabBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
        </View>
      )}
    </View>
  );
};

export default function TabLayout() {
  const { isAuthenticated, isAdmin, user } = useAuth();
  const { t } = useLanguage();
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#9ca3af',
        headerShown: true,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 88 : 70,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          paddingTop: 12,
          paddingHorizontal: 8,
          shadowColor: '#6366f1',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 20,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        headerStyle: {
          backgroundColor: theme.background,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 4,
          borderBottomWidth: 0,
        },
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
        },
        headerTintColor: theme.text,
        headerRight: () => isAuthenticated ? <NotificationBell /> : null,
      }}
    >
      <Tabs.Screen name="law-detail" options={{ href: null }} />
      <Tabs.Screen name="question-detail" options={{ href: null }} />
      <Tabs.Screen name="ask-question" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="history" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="calculators" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="settings" options={{ href: null, headerShown: false }} />
      <Tabs.Screen
        name="home"
        options={{
          title: t.home,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={Home} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="laws"
        options={{
          title: t.laws,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={BookOpen} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="questions"
        options={{
          title: t.qa,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={MessageCircle} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: t.favorites,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={Bookmark} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="contact"
        options={{
          title: t.contact,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={Mail} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: t.admin,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={Shield} color={color} focused={focused} />
          ),
          href: isAdmin ? '/(tabs)/admin' : null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: isAuthenticated ? t.profile : t.login,
          tabBarIcon: ({ color, focused }) => {
            // Show user avatar if available
            if (user?.avatar) {
              return (
                <View style={[
                  styles.avatarContainer,
                  focused && styles.avatarContainerActive
                ]}>
                  <Image source={{ uri: user.avatar }} style={styles.avatar} />
                </View>
              );
            }
            // Show initials when logged in but no avatar
            if (isAuthenticated && user?.name) {
              const initials = user.name
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);
              return (
                <View style={[
                  styles.initialsContainer,
                  focused && styles.initialsContainerActive
                ]}>
                  <Text style={[
                    styles.initialsText,
                    focused && styles.initialsTextActive
                  ]}>
                    {initials}
                  </Text>
                </View>
              );
            }
            // Default user icon when not logged in
            return <TabIcon icon={User} color={color} focused={focused} />;
          },
        }}
      />
      <Tabs.Screen name="login" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  activeIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  bellContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  tabBadgeActive: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  tabBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  avatarContainerActive: {
    borderColor: '#6366f1',
    borderWidth: 3,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  initialsContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#c7d2fe',
  },
  initialsContainerActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  initialsText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6366f1',
  },
  initialsTextActive: {
    color: '#fff',
  },
});
