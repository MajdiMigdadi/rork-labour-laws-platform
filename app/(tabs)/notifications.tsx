import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SectionList,
  Animated,
  Switch,
} from 'react-native';
import { showAlert, showSuccess } from '@/utils/alert';
import { useRouter } from 'expo-router';
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Trash2,
  ChevronRight,
  MessageCircle,
  Trophy,
  CheckCircle,
  FileText,
  Megaphone,
  Award,
  Hand,
  Settings,
  Volume2,
  Vibrate,
  X,
  Sparkles,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNotifications, AppNotification, NotificationType } from '@/contexts/NotificationsContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/AuthContext';
import { Swipeable } from 'react-native-gesture-handler';

export default function NotificationsScreen() {
  const router = useRouter();
  const { 
    notifications, 
    unreadCount, 
    settings,
    getGroupedNotifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    clearAllNotifications,
    updateSettings,
    permissionStatus,
    requestPermissions,
    notifyAnswerReceived,
    notifyQuestionSolved,
    notifyLawUpdated,
    notifyAdminAnnouncement,
    notifyAchievement,
  } = useNotifications();
  const { t, isRTL } = useLanguage();
  const theme = useTheme();
  const { isAdmin } = useAuth();
  const [showSettings, setShowSettings] = useState(false);

  // Demo notification functions for testing
  const sendDemoNotifications = () => {
    const demos = [
      () => notifyAnswerReceived('How to calculate overtime pay?', 'Ahmed Hassan', 'demo-q-1'),
      () => notifyQuestionSolved('What are the annual leave regulations?', 'demo-q-2', 'Legal Expert'),
      () => notifyLawUpdated('Minimum Wage Act 2024', 'demo-law-1', 'Saudi Arabia'),
      () => notifyAdminAnnouncement('System Update', 'New features have been added to improve your experience!', 'medium'),
      () => notifyAchievement('First Question', 'You asked your first question!'),
    ];

    // Send one random demo notification
    const randomDemo = demos[Math.floor(Math.random() * demos.length)];
    randomDemo();
    showSuccess('Demo', 'A demo notification has been sent!');
  };

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'new_answer':
        return { icon: MessageCircle, color: '#6366f1', bg: '#eef2ff' };
      case 'best_answer':
        return { icon: Trophy, color: '#f59e0b', bg: '#fef3c7' };
      case 'question_solved':
        return { icon: CheckCircle, color: '#22c55e', bg: '#dcfce7' };
      case 'law_updated':
        return { icon: FileText, color: '#06b6d4', bg: '#ecfeff' };
      case 'admin_announcement':
        return { icon: Megaphone, color: '#ec4899', bg: '#fce7f3' };
      case 'welcome':
        return { icon: Hand, color: '#8b5cf6', bg: '#f3e8ff' };
      case 'achievement':
        return { icon: Award, color: '#f59e0b', bg: '#fef3c7' };
      default:
        return { icon: Bell, color: '#6366f1', bg: '#eef2ff' };
    }
  };

  const handleNotificationPress = (notification: AppNotification) => {
    markAsRead(notification.id);
    
    // Navigate based on type
    if ((notification.type === 'new_answer' || notification.type === 'best_answer' || notification.type === 'question_solved') && notification.data.questionId) {
      router.push(`/(tabs)/question-detail?id=${notification.data.questionId}`);
    } else if (notification.type === 'law_updated' && notification.data.lawId) {
      router.push(`/(tabs)/law-detail?id=${notification.data.lawId}`);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 1) return t.justNow;
    if (diffMins < 60) return `${diffMins}${t.minutesAgo}`;
    if (diffHours < 24) return `${diffHours}${t.hoursAgo}`;
    return date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' });
  };

  const handleClearAll = () => {
    showAlert(
      t.clearAll,
      t.areYouSure,
      [
        { text: t.cancel, style: 'cancel' },
        { 
          text: t.clearAll, 
          style: 'destructive',
          onPress: clearAllNotifications,
        },
      ]
    );
  };

  // Translate grouped notifications section titles
  const getTranslatedSectionTitle = (title: string) => {
    switch (title) {
      case 'Today': return t.today;
      case 'Yesterday': return t.yesterday;
      case 'This Week': return t.thisWeek;
      case 'Earlier': return t.earlier;
      default: return title;
    }
  };

  const renderRightActions = (notification: AppNotification) => {
    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => deleteNotification(notification.id)}
      >
        <Trash2 size={20} color="#fff" />
      </TouchableOpacity>
    );
  };

  const renderNotificationItem = ({ item, index }: { item: AppNotification; index: number }) => {
    const { icon: Icon, color, bg } = getNotificationIcon(item.type);
    
    const itemAnim = new Animated.Value(0);
    Animated.spring(itemAnim, {
      toValue: 1,
      tension: 50,
      friction: 8,
      delay: index * 50,
      useNativeDriver: true,
    }).start();

    return (
      <Animated.View
        style={{
          opacity: itemAnim,
          transform: [{
            translateX: itemAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [isRTL ? -30 : 30, 0],
            }),
          }],
        }}
      >
        <Swipeable
          renderRightActions={() => renderRightActions(item)}
          overshootRight={false}
        >
          <TouchableOpacity
            style={[
              styles.notificationItem,
              { backgroundColor: theme.card },
              !item.read && styles.unreadItem,
            ]}
            activeOpacity={0.8}
            onPress={() => handleNotificationPress(item)}
          >
            {/* Unread indicator */}
            {!item.read && <View style={styles.unreadDot} />}
            
            {/* Icon */}
            <View style={[styles.iconContainer, { backgroundColor: bg }]}>
              <Icon size={20} color={color} />
            </View>
            
            {/* Content */}
            <View style={styles.contentContainer}>
              <View style={styles.titleRow}>
                <Text style={[styles.notifTitle, { color: theme.text }]} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={[styles.notifTime, { color: theme.textSecondary }]}>
                  {formatTime(item.createdAt)}
                </Text>
              </View>
              <Text style={[styles.notifBody, { color: theme.textSecondary }]} numberOfLines={2}>
                {item.body}
              </Text>
            </View>
            
            {/* Arrow */}
            <ChevronRight 
              size={18} 
              color={theme.textSecondary} 
              style={isRTL ? { transform: [{ rotate: '180deg' }] } : {}}
            />
          </TouchableOpacity>
        </Swipeable>
      </Animated.View>
    );
  };

  const renderSectionHeader = ({ section }: { section: { title: string } }) => (
    <View style={[styles.sectionHeader, { backgroundColor: theme.backgroundSecondary }]}>
      <Text style={[styles.sectionTitle, { color: theme.textSecondary }, isRTL && styles.rtlText]}>
        {getTranslatedSectionTitle(section.title)}
      </Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <LinearGradient
        colors={['#eef2ff', '#e0e7ff']}
        style={styles.emptyIcon}
      >
        <Bell size={40} color="#6366f1" />
      </LinearGradient>
      <Text style={[styles.emptyTitle, { color: theme.text }, isRTL && styles.rtlText]}>
        {t.noNotifications}
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.textSecondary }, isRTL && styles.rtlText]}>
        {t.notificationsDesc}
      </Text>
    </View>
  );

  const renderSettingsModal = () => (
    <Animated.View 
      style={[
        styles.settingsOverlay,
        { backgroundColor: theme.backgroundSecondary },
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={[styles.settingsHeader, { borderBottomColor: theme.border }, isRTL && styles.rtl]}>
        <Text style={[styles.settingsTitle, { color: theme.text }]}>{t.notificationSettings}</Text>
        <TouchableOpacity onPress={() => setShowSettings(false)}>
          <X size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.settingsContent}>
        {/* Permission Status */}
        {permissionStatus !== 'granted' && (
          <TouchableOpacity 
            style={[styles.permissionBanner, { backgroundColor: '#fef3c7' }, isRTL && styles.rtl]}
            onPress={requestPermissions}
          >
            <BellOff size={20} color="#f59e0b" />
            <View style={styles.permissionText}>
              <Text style={[styles.permissionTitle, isRTL && styles.rtlText]}>{t.disabled}</Text>
              <Text style={[styles.permissionSubtitle, isRTL && styles.rtlText]}>{t.enableNotifications}</Text>
            </View>
            <ChevronRight size={20} color="#f59e0b" style={isRTL ? { transform: [{ rotate: '180deg' }] } : {}} />
          </TouchableOpacity>
        )}

        {/* Master Toggle */}
        <View style={[styles.settingItem, { backgroundColor: theme.card }, isRTL && styles.rtl]}>
          <View style={[styles.settingLeft, isRTL && styles.rtl]}>
            <View style={[styles.settingIcon, { backgroundColor: '#eef2ff' }]}>
              <Bell size={18} color="#6366f1" />
            </View>
            <View>
              <Text style={[styles.settingLabel, { color: theme.text }, isRTL && styles.rtlText]}>{t.enableNotifications}</Text>
              <Text style={[styles.settingDesc, { color: theme.textSecondary }, isRTL && styles.rtlText]}>
                {t.masterToggle}
              </Text>
            </View>
          </View>
          <Switch
            value={settings.enabled}
            onValueChange={(value) => updateSettings({ enabled: value })}
            trackColor={{ false: '#e5e7eb', true: '#c7d2fe' }}
            thumbColor={settings.enabled ? '#6366f1' : '#9ca3af'}
          />
        </View>

        {/* Notification Types */}
        <Text style={[styles.settingGroupTitle, { color: theme.textSecondary }, isRTL && styles.rtlText]}>{t.notificationTypes}</Text>
        
        {[
          { key: 'answerNotifications', label: t.newAnswers, desc: t.newAnswersDesc, icon: MessageCircle, color: '#6366f1' },
          { key: 'bestAnswerNotifications', label: t.bestAnswer, desc: t.bestAnswerDesc, icon: Trophy, color: '#f59e0b' },
          { key: 'lawUpdateNotifications', label: t.lawUpdates, desc: t.lawUpdatesDesc, icon: FileText, color: '#06b6d4' },
          { key: 'announcementNotifications', label: t.announcements, desc: t.announcementsDesc, icon: Megaphone, color: '#ec4899' },
          { key: 'achievementNotifications', label: t.achievements, desc: t.achievementsDesc, icon: Award, color: '#f59e0b' },
        ].map((item) => (
          <View key={item.key} style={[styles.settingItem, { backgroundColor: theme.card }, isRTL && styles.rtl]}>
            <View style={[styles.settingLeft, isRTL && styles.rtl]}>
              <View style={[styles.settingIcon, { backgroundColor: item.color + '15' }]}>
                <item.icon size={18} color={item.color} />
              </View>
              <View>
                <Text style={[styles.settingLabel, { color: theme.text }, isRTL && styles.rtlText]}>{item.label}</Text>
                <Text style={[styles.settingDesc, { color: theme.textSecondary }, isRTL && styles.rtlText]}>{item.desc}</Text>
              </View>
            </View>
            <Switch
              value={settings[item.key as keyof typeof settings] as boolean}
              onValueChange={(value) => updateSettings({ [item.key]: value })}
              trackColor={{ false: '#e5e7eb', true: '#c7d2fe' }}
              thumbColor={settings[item.key as keyof typeof settings] ? '#6366f1' : '#9ca3af'}
              disabled={!settings.enabled}
            />
          </View>
        ))}

        {/* Sound & Vibration */}
        <Text style={[styles.settingGroupTitle, { color: theme.textSecondary }, isRTL && styles.rtlText]}>{t.preferences}</Text>
        
        <View style={[styles.settingItem, { backgroundColor: theme.card }, isRTL && styles.rtl]}>
          <View style={[styles.settingLeft, isRTL && styles.rtl]}>
            <View style={[styles.settingIcon, { backgroundColor: '#dcfce7' }]}>
              <Volume2 size={18} color="#22c55e" />
            </View>
            <View>
              <Text style={[styles.settingLabel, { color: theme.text }, isRTL && styles.rtlText]}>{t.sound}</Text>
              <Text style={[styles.settingDesc, { color: theme.textSecondary }, isRTL && styles.rtlText]}>{t.soundDesc}</Text>
            </View>
          </View>
          <Switch
            value={settings.soundEnabled}
            onValueChange={(value) => updateSettings({ soundEnabled: value })}
            trackColor={{ false: '#e5e7eb', true: '#c7d2fe' }}
            thumbColor={settings.soundEnabled ? '#6366f1' : '#9ca3af'}
            disabled={!settings.enabled}
          />
        </View>

        <View style={[styles.settingItem, { backgroundColor: theme.card }, isRTL && styles.rtl]}>
          <View style={[styles.settingLeft, isRTL && styles.rtl]}>
            <View style={[styles.settingIcon, { backgroundColor: '#fef3c7' }]}>
              <Vibrate size={18} color="#f59e0b" />
            </View>
            <View>
              <Text style={[styles.settingLabel, { color: theme.text }, isRTL && styles.rtlText]}>{t.vibration}</Text>
              <Text style={[styles.settingDesc, { color: theme.textSecondary }, isRTL && styles.rtlText]}>{t.vibrationDesc}</Text>
            </View>
          </View>
          <Switch
            value={settings.vibrationEnabled}
            onValueChange={(value) => updateSettings({ vibrationEnabled: value })}
            trackColor={{ false: '#e5e7eb', true: '#c7d2fe' }}
            thumbColor={settings.vibrationEnabled ? '#6366f1' : '#9ca3af'}
            disabled={!settings.enabled}
          />
        </View>
      </View>
    </Animated.View>
  );

  const groupedNotifications = getGroupedNotifications();

  if (showSettings) {
    return renderSettingsModal();
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
      {/* Header */}
      <Animated.View 
        style={[
          styles.header,
          { backgroundColor: theme.background },
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={[styles.headerTop, isRTL && styles.rtl]}>
          <View style={[styles.headerLeft, isRTL && styles.rtl]}>
            <LinearGradient
              colors={['#6366f1', '#8b5cf6']}
              style={styles.headerIcon}
            >
              <Bell size={20} color="#fff" />
            </LinearGradient>
            <View>
              <Text style={[styles.headerTitle, { color: theme.text }, isRTL && styles.rtlText]}>
                {t.notificationsTitle}
              </Text>
              <Text style={[styles.headerSubtitle, { color: theme.textSecondary }, isRTL && styles.rtlText]}>
                {unreadCount > 0 ? `${unreadCount} ${t.unread}` : t.allCaughtUp}
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            style={[styles.settingsBtn, { backgroundColor: theme.backgroundSecondary }]}
            onPress={() => setShowSettings(true)}
          >
            <Settings size={18} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Actions */}
        <View style={[styles.headerActions, isRTL && styles.rtl]}>
          {/* Demo button for testing (admin only) */}
          {isAdmin && (
            <TouchableOpacity style={[styles.actionBtn, styles.actionBtnDemo]} onPress={sendDemoNotifications}>
              <Sparkles size={16} color="#8b5cf6" />
              <Text style={[styles.actionBtnText, { color: '#8b5cf6' }]}>Test</Text>
            </TouchableOpacity>
          )}
          {unreadCount > 0 && (
            <TouchableOpacity style={styles.actionBtn} onPress={markAllAsRead}>
              <CheckCheck size={16} color="#6366f1" />
              <Text style={styles.actionBtnText}>{t.markAllRead}</Text>
            </TouchableOpacity>
          )}
          {notifications.length > 0 && (
            <TouchableOpacity style={[styles.actionBtn, styles.actionBtnDanger]} onPress={handleClearAll}>
              <Trash2 size={16} color="#ef4444" />
              <Text style={[styles.actionBtnText, { color: '#ef4444' }]}>{t.clearAll}</Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      {/* Notifications List */}
      <SectionList
        sections={groupedNotifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotificationItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        stickySectionHeadersEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  header: {
    padding: 16,
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#eef2ff',
  },
  actionBtnDanger: {
    backgroundColor: '#fef2f2',
  },
  actionBtnDemo: {
    backgroundColor: '#f3e8ff',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6366f1',
  },

  // List
  listContent: {
    padding: 12,
    paddingBottom: 120,
  },
  sectionHeader: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Notification Item
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  unreadItem: {
    borderLeftWidth: 3,
    borderLeftColor: '#6366f1',
  },
  unreadDot: {
    position: 'absolute',
    top: 14,
    left: 14,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6366f1',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  notifTime: {
    fontSize: 11,
  },
  notifBody: {
    fontSize: 13,
    lineHeight: 18,
  },
  deleteAction: {
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    marginBottom: 8,
    borderRadius: 14,
    marginLeft: 8,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Settings
  settingsOverlay: {
    flex: 1,
  },
  settingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  settingsContent: {
    padding: 16,
  },
  permissionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
  },
  permissionText: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
  },
  permissionSubtitle: {
    fontSize: 12,
    color: '#b45309',
  },
  settingGroupTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 20,
    marginBottom: 10,
    marginLeft: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  settingDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  
  // RTL Styles
  rtl: {
    flexDirection: 'row-reverse',
  },
  rtlText: {
    textAlign: 'right',
  },
});

