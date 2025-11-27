import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { router } from 'expo-router';

const NOTIFICATION_SETTINGS_KEY = '@notification_settings';

export interface NotificationSettings {
  enabled: boolean;
  answerNotifications: boolean;
  bestAnswerNotifications: boolean;
}

const defaultSettings: NotificationSettings = {
  enabled: true,
  answerNotifications: true,
  bestAnswerNotifications: true,
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
  useAuth();
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    loadSettings();
    
    if (Platform.OS !== 'web') {
      registerForPushNotifications();
      
      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        console.log('Notification received:', notification);
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

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setSettings(parsed);
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
    
    if (data.type === 'answer' && data.questionId) {
      router.push(`/(tabs)/question-detail?id=${data.questionId}`);
    } else if (data.type === 'best_answer' && data.questionId) {
      router.push(`/(tabs)/question-detail?id=${data.questionId}`);
    }
  };

  const scheduleNotification = async (
    title: string,
    body: string,
    data: Record<string, any>,
  ) => {
    if (!settings.enabled) {
      console.log('Notifications are disabled in settings');
      return;
    }

    if (Platform.OS === 'web') {
      console.log('Notifications not supported on web');
      return;
    }

    if (data.type === 'answer' && !settings.answerNotifications) {
      console.log('Answer notifications are disabled');
      return;
    }

    if (data.type === 'best_answer' && !settings.bestAnswerNotifications) {
      console.log('Best answer notifications are disabled');
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger: null,
      });
      console.log('Notification scheduled:', { title, body, data });
    } catch (error) {
      console.error('Failed to schedule notification:', error);
    }
  };

  const notifyAnswerReceived = async (questionTitle: string, answerUserName: string, questionId: string) => {
    await scheduleNotification(
      'New Answer!',
      `${answerUserName} answered your question: "${questionTitle}"`,
      {
        type: 'answer',
        questionId,
      },
    );
  };

  const notifyBestAnswer = async (questionTitle: string, questionId: string) => {
    await scheduleNotification(
      'Your Answer is Best! 🏆',
      `Your answer was selected as the best answer for: "${questionTitle}"`,
      {
        type: 'best_answer',
        questionId,
      },
    );
  };

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

  return {
    settings,
    updateSettings,
    permissionStatus,
    expoPushToken,
    notifyAnswerReceived,
    notifyBestAnswer,
    requestPermissions,
  };
});
