import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { router } from 'expo-router';

const NOTIFICATION_SETTINGS_KEY = '@notification_settings';
const NOTIFICATIONS_STORAGE_KEY = '@notifications_list';

// Notification Types
export type NotificationType = 
  | 'new_answer'
  | 'best_answer'
  | 'question_solved'
  | 'law_updated'
  | 'admin_announcement'
  | 'welcome'
  | 'achievement';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, any>;
  read: boolean;
  createdAt: string;
  icon?: string;
}

export interface NotificationSettings {
  enabled: boolean;
  answerNotifications: boolean;
  bestAnswerNotifications: boolean;
  lawUpdateNotifications: boolean;
  announcementNotifications: boolean;
  achievementNotifications: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

const defaultSettings: NotificationSettings = {
  enabled: true,
  answerNotifications: true,
  bestAnswerNotifications: true,
  lawUpdateNotifications: true,
  announcementNotifications: true,
  achievementNotifications: true,
  soundEnabled: true,
  vibrationEnabled: true,
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const [NotificationsProvider, useNotifications] = createContextHook(() => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    loadSettings();
    loadNotifications();
    
    if (Platform.OS !== 'web') {
      registerForPushNotifications();
      
      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        console.log('Notification received:', notification);
        // Add to in-app notifications
        const data = notification.request.content.data;
        addNotification({
          type: data.type as NotificationType || 'admin_announcement',
          title: notification.request.content.title || '',
          body: notification.request.content.body || '',
          data: data,
        });
      });

      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('Notification response:', response);
        handleNotificationResponse(response);
      });

      return () => {
        if (notificationListener.current) {
          notificationListener.current.remove();
        }
        if (responseListener.current) {
          responseListener.current.remove();
        }
      };
    }
  }, []);

  // Send welcome notification for new users
  useEffect(() => {
    if (user && notifications.length === 0) {
      // Check if this is a new user session
      const hasWelcomeNotification = notifications.some(n => n.type === 'welcome' && n.data.userId === user.id);
      if (!hasWelcomeNotification) {
        addNotification({
          type: 'welcome',
          title: `Welcome, ${user.name}! 👋`,
          body: 'Start exploring labour laws and ask questions to our community.',
          data: { userId: user.id },
        });
      }
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setSettings({ ...defaultSettings, ...parsed });
        } catch (parseError) {
          console.error('Failed to parse notification settings, using defaults:', parseError);
          await AsyncStorage.removeItem(NOTIFICATION_SETTINGS_KEY);
          setSettings(defaultSettings);
        }
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setNotifications(parsed);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const saveNotifications = async (newNotifications: AppNotification[]) => {
    try {
      // Keep only last 50 notifications
      const trimmed = newNotifications.slice(0, 50);
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(trimmed));
      setNotifications(trimmed);
    } catch (error) {
      console.error('Failed to save notifications:', error);
    }
  };

  const saveSettings = async (newSettings: NotificationSettings) => {
    try {
      await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Failed to save notification settings:', error);
    }
  };

  const registerForPushNotifications = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      setPermissionStatus(finalStatus);

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }

      try {
        const token = await Notifications.getExpoPushTokenAsync({
          projectId: process.env.EXPO_PUBLIC_PROJECT_ID || undefined,
        });
        
        console.log('Expo push token:', token.data);
        setExpoPushToken(token.data);
      } catch (tokenError: any) {
        console.log('Could not get push token (this is normal in development):', tokenError.message);
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
    } catch (error) {
      console.error('Error registering for push notifications:', error);
    }
  };

  const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
    const data = response.notification.request.content.data;
    
    // Mark notification as read
    const notificationId = data.notificationId;
    if (notificationId) {
      markAsRead(notificationId);
    }
    
    // Navigate based on type
    if ((data.type === 'new_answer' || data.type === 'best_answer' || data.type === 'question_solved') && data.questionId) {
      router.push(`/(tabs)/question-detail?id=${data.questionId}`);
    } else if (data.type === 'law_updated' && data.lawId) {
      router.push(`/(tabs)/law-detail?id=${data.lawId}`);
    } else if (data.type === 'admin_announcement') {
      router.push('/(tabs)/notifications');
    }
  };

  const getNotificationIcon = (type: NotificationType): string => {
    switch (type) {
      case 'new_answer': return '💬';
      case 'best_answer': return '🏆';
      case 'question_solved': return '✅';
      case 'law_updated': return '📜';
      case 'admin_announcement': return '📢';
      case 'welcome': return '👋';
      case 'achievement': return '🎖️';
      default: return '🔔';
    }
  };

  const addNotification = useCallback(async (notification: Omit<AppNotification, 'id' | 'read' | 'createdAt' | 'icon'>) => {
    const newNotification: AppNotification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      read: false,
      createdAt: new Date().toISOString(),
      icon: getNotificationIcon(notification.type),
    };

    const updated = [newNotification, ...notifications];
    await saveNotifications(updated);

    return newNotification;
  }, [notifications]);

  const scheduleNotification = async (
    title: string,
    body: string,
    data: Record<string, any>,
  ) => {
    if (!settings.enabled) {
      console.log('Notifications are disabled in settings');
      return;
    }

    // Add to in-app notifications
    const appNotification = await addNotification({
      type: data.type as NotificationType || 'admin_announcement',
      title,
      body,
      data,
    });

    if (Platform.OS === 'web') {
      console.log('Push notifications not supported on web');
      return appNotification;
    }

    // Check type-specific settings
    if (data.type === 'new_answer' && !settings.answerNotifications) return appNotification;
    if (data.type === 'best_answer' && !settings.bestAnswerNotifications) return appNotification;
    if (data.type === 'law_updated' && !settings.lawUpdateNotifications) return appNotification;
    if (data.type === 'admin_announcement' && !settings.announcementNotifications) return appNotification;
    if (data.type === 'achievement' && !settings.achievementNotifications) return appNotification;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { ...data, notificationId: appNotification.id },
          sound: settings.soundEnabled,
        },
        trigger: null,
      });
      console.log('Notification scheduled:', { title, body, data });
    } catch (error) {
      console.error('Failed to schedule notification:', error);
    }

    return appNotification;
  };

  // Notification helpers
  const notifyAnswerReceived = async (questionTitle: string, answerUserName: string, questionId: string) => {
    return scheduleNotification(
      'New Answer! 💬',
      `${answerUserName} answered your question: "${questionTitle}"`,
      {
        type: 'new_answer',
        questionId,
      },
    );
  };

  const notifyBestAnswer = async (questionTitle: string, questionId: string) => {
    return scheduleNotification(
      'Your Answer is Best! 🏆',
      `Your answer was selected as the best answer for: "${questionTitle}"`,
      {
        type: 'best_answer',
        questionId,
      },
    );
  };

  const notifyQuestionSolved = async (questionTitle: string, questionId: string, solverName: string) => {
    return scheduleNotification(
      'Question Solved! ✅',
      `"${questionTitle}" has been marked as solved by ${solverName}`,
      {
        type: 'question_solved',
        questionId,
      },
    );
  };

  const notifyLawUpdated = async (lawTitle: string, lawId: string, countryName: string) => {
    return scheduleNotification(
      'Law Updated! 📜',
      `"${lawTitle}" in ${countryName} has been updated`,
      {
        type: 'law_updated',
        lawId,
        countryName,
      },
    );
  };

  const notifyAdminAnnouncement = async (title: string, message: string, priority: 'low' | 'medium' | 'high' = 'medium') => {
    return scheduleNotification(
      `📢 ${title}`,
      message,
      {
        type: 'admin_announcement',
        priority,
      },
    );
  };

  const notifyAchievement = async (achievementTitle: string, achievementDesc: string) => {
    return scheduleNotification(
      `Achievement Unlocked! 🎖️`,
      `${achievementTitle}: ${achievementDesc}`,
      {
        type: 'achievement',
      },
    );
  };

  // Notification management
  const markAsRead = useCallback(async (notificationId: string) => {
    const updated = notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    await saveNotifications(updated);
  }, [notifications]);

  const markAllAsRead = useCallback(async () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    await saveNotifications(updated);
  }, [notifications]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    const updated = notifications.filter(n => n.id !== notificationId);
    await saveNotifications(updated);
  }, [notifications]);

  const clearAllNotifications = useCallback(async () => {
    await saveNotifications([]);
  }, []);

  const updateSettings = async (updates: Partial<NotificationSettings>) => {
    const newSettings = { ...settings, ...updates };
    await saveSettings(newSettings);
  };

  const requestPermissions = async () => {
    if (Platform.OS === 'web') {
      return false;
    }
    
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      setPermissionStatus(status);
      return status === 'granted';
    } catch (error) {
      console.error('Failed to request notification permissions:', error);
      return false;
    }
  };

  // Get notifications grouped by date
  const getGroupedNotifications = useCallback(() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const groups: { title: string; data: AppNotification[] }[] = [
      { title: 'Today', data: [] },
      { title: 'Yesterday', data: [] },
      { title: 'This Week', data: [] },
      { title: 'Earlier', data: [] },
    ];

    notifications.forEach(notification => {
      const notifDate = new Date(notification.createdAt);
      
      if (notifDate.toDateString() === today.toDateString()) {
        groups[0].data.push(notification);
      } else if (notifDate.toDateString() === yesterday.toDateString()) {
        groups[1].data.push(notification);
      } else if (notifDate > lastWeek) {
        groups[2].data.push(notification);
      } else {
        groups[3].data.push(notification);
      }
    });

    // Filter out empty groups
    return groups.filter(group => group.data.length > 0);
  }, [notifications]);

  return {
    // State
    settings,
    notifications,
    unreadCount,
    permissionStatus,
    expoPushToken,
    
    // Grouped data
    getGroupedNotifications,
    
    // Settings
    updateSettings,
    requestPermissions,
    
    // Notification triggers
    notifyAnswerReceived,
    notifyBestAnswer,
    notifyQuestionSolved,
    notifyLawUpdated,
    notifyAdminAnnouncement,
    notifyAchievement,
    addNotification,
    
    // Notification management
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  };
});
