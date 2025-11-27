import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Switch } from 'react-native';
import { LogOut, Award, TrendingUp, MessageCircle, Languages, Edit2, MapPin, Briefcase, Phone, Globe, Scale, Mail, Lock, User as UserIcon, Moon, Sun, Bell, Trophy, Sparkles } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'expo-router';
import EditProfileModal from '@/components/EditProfileModal';
import { useTheme } from '@/hooks/useTheme';
import { useSettings } from '@/contexts/SettingsContext';
import { useNotifications } from '@/contexts/NotificationsContext';
import { useReputation } from '@/contexts/ReputationContext';
import { useData } from '@/contexts/DataContext';

export default function ProfileScreen() {
  const { user, users, login, register, logout } = useAuth();
  const { t, language, changeLanguage, isRTL } = useLanguage();
  const { getUserReputation, getLeaderboard, getRarityColor } = useReputation();
  const { questions, answers } = useData();
  const router = useRouter();
  const theme = useTheme();
  const { settings, updateSettings } = useSettings();
  const { settings: notificationSettings, updateSettings: updateNotificationSettings, permissionStatus, requestPermissions } = useNotifications();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEditProfile = () => {
    setEditModalVisible(true);
  };

  const handleLogout = () => {
    Alert.alert(t.logout, t.areYouSure, [
      { text: t.cancel, style: 'cancel' },
      {
        text: t.logout,
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/auth');
        },
      },
    ]);
  };

  const handleLanguageToggle = () => {
    const newLang = language === 'en' ? 'ar' : 'en';
    Alert.alert(
      'Change Language',
      'The app will reload to apply the new language. Continue?',
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: 'OK',
          onPress: () => {
            changeLanguage(newLang);
            Alert.alert('Success', 'Please reload the app for changes to take effect.');
          },
        },
      ]
    );
  };

  const handleThemeToggle = async () => {
    const newTheme = settings.themeMode === 'light' ? 'dark' : 'light';
    await updateSettings({ themeMode: newTheme });
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return theme.secondary;
      case 'intermediate':
        return theme.primary;
      case 'expert':
        return theme.accent;
      default:
        return theme.secondary;
    }
  };

  const handleSubmit = async () => {
    setError('');
    
    if (!email || !password || (!isLogin && !name)) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      let success;
      if (isLogin) {
        success = await login(email, password);
        if (!success) {
          setError('Invalid credentials. Try: admin@labourlaw.com or john@example.com');
        }
      } else {
        success = await register(email, password, name);
      }

      if (success) {
        setEmail('');
        setPassword('');
        setName('');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Auth error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: theme.backgroundSecondary }]}>
              <Scale size={48} color={theme.primary} strokeWidth={2} />
            </View>
            <Text style={[styles.title, { color: theme.text }]}>Labour Law Hub</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Access labour laws worldwide
            </Text>
          </View>

          <View style={styles.form}>
            <View style={[styles.tabs, { backgroundColor: theme.backgroundSecondary }]}>
              <TouchableOpacity
                style={[styles.tab, isLogin && { ...styles.activeTab, backgroundColor: theme.primary }]}
                onPress={() => {
                  setIsLogin(true);
                  setError('');
                }}
              >
                <Text style={[styles.tabText, { color: theme.textSecondary }, isLogin && styles.activeTabText]}>
                  Login
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, !isLogin && { ...styles.activeTab, backgroundColor: theme.primary }]}
                onPress={() => {
                  setIsLogin(false);
                  setError('');
                }}
              >
                <Text style={[styles.tabText, { color: theme.textSecondary }, !isLogin && styles.activeTabText]}>
                  Register
                </Text>
              </TouchableOpacity>
            </View>

            {!isLogin && (
              <View style={[styles.inputContainer, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
                <UserIcon size={20} color={theme.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Full Name"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  placeholderTextColor={theme.textSecondary}
                />
              </View>
            )}

            <View style={[styles.inputContainer, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
              <Mail size={20} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <View style={[styles.inputContainer, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
              <Lock size={20} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.primary }]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  {isLogin ? 'Login' : 'Create Account'}
                </Text>
              )}
            </TouchableOpacity>

            {isLogin && (
              <View style={[styles.demoContainer, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
                <Text style={[styles.demoText, { color: theme.text }]}>Demo accounts:</Text>
                <Text style={[styles.demoEmail, { color: theme.textSecondary }]}>admin@labourlaw.com (Admin)</Text>
                <Text style={[styles.demoEmail, { color: theme.textSecondary }]}>john@example.com (User)</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
      <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
        <View style={styles.avatarWrapper}>
          {user.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
              <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <TouchableOpacity style={[styles.editAvatarButton, { backgroundColor: theme.primary, borderColor: theme.background }]} onPress={handleEditProfile}>
            <Edit2 size={16} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={[styles.name, { color: theme.text }, isRTL && styles.rtlText]}>{user.name}</Text>
        <Text style={[styles.email, { color: theme.textSecondary }, isRTL && styles.rtlText]}>{user.email}</Text>
        <View style={[styles.levelBadge, { backgroundColor: getLevelColor(user.level) }]}>
          <Text style={styles.levelText}>
            {user.level === 'beginner' ? t.beginner : user.level === 'intermediate' ? t.intermediate : t.expert}
          </Text>
        </View>
        <TouchableOpacity style={[styles.editButton, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]} onPress={handleEditProfile}>
          <Edit2 size={18} color={theme.primary} />
          <Text style={[styles.editButtonText, { color: theme.primary }]}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsSection}>
        <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Award size={32} color={theme.accent} />
          <Text style={[styles.statNumber, { color: theme.text }]}>{user.reputation}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }, isRTL && styles.rtlText]}>{t.reputation}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <MessageCircle size={32} color={theme.primary} />
          <Text style={[styles.statNumber, { color: theme.text }]}>{questions.filter(q => q.userId === user.id).length}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }, isRTL && styles.rtlText]}>{t.questions}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <TrendingUp size={32} color={theme.secondary} />
          <Text style={[styles.statNumber, { color: theme.text }]}>{answers.filter(a => a.userId === user.id).length}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }, isRTL && styles.rtlText]}>{t.answers}</Text>
        </View>
      </View>

      {getUserReputation(user.id).badges.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }, isRTL && styles.rtlText]}>Badges Earned</Text>
          <View style={[styles.badgesContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {getUserReputation(user.id).badges.map((badge) => (
              <View key={badge.id} style={[styles.badgeItem, { backgroundColor: theme.backgroundSecondary, borderColor: getRarityColor(badge.rarity) }]}>
                <Text style={styles.badgeIcon}>{badge.icon}</Text>
                <Text style={[styles.badgeName, { color: theme.text }]}>{badge.name}</Text>
                <Text style={[styles.badgeDescription, { color: theme.textSecondary }]}>{badge.description}</Text>
                <View style={[styles.badgeRarity, { backgroundColor: getRarityColor(badge.rarity) }]}>
                  <Text style={styles.badgeRarityText}>{badge.rarity}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.section}>
        <View style={[styles.leaderboardHeader, isRTL && styles.rtl]}>
          <Trophy size={24} color={theme.primary} />
          <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 0 }, isRTL && styles.rtlText]}>Leaderboard</Text>
        </View>
        <View style={[styles.leaderboardContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {getLeaderboard().slice(0, 5).map((userData, index) => {
            const userInfo = users.find(u => u.id === userData.userId);
            if (!userInfo) return null;
            return (
              <View key={userData.userId} style={[styles.leaderboardItem, isRTL && styles.rtl]}>
                <View style={[styles.leaderboardRank, { backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : theme.backgroundSecondary }]}>
                  <Text style={[styles.leaderboardRankText, { color: index < 3 ? '#000' : theme.text }]}>#{index + 1}</Text>
                </View>
                {userInfo.avatar ? (
                  <Image source={{ uri: userInfo.avatar }} style={styles.leaderboardAvatar} />
                ) : (
                  <View style={[styles.leaderboardAvatar, { backgroundColor: theme.primary }]}>
                    <Text style={styles.leaderboardAvatarText}>{userInfo.name.charAt(0).toUpperCase()}</Text>
                  </View>
                )}
                <View style={styles.leaderboardInfo}>
                  <Text style={[styles.leaderboardName, { color: theme.text }]}>{userInfo.name}</Text>
                  <View style={[styles.leaderboardStats, isRTL && styles.rtl]}>
                    <Award size={14} color={theme.accent} />
                    <Text style={[styles.leaderboardReputation, { color: theme.textSecondary }]}>{userData.reputation} pts</Text>
                    <Sparkles size={14} color={theme.secondary} style={{ marginLeft: 8 }} />
                    <Text style={[styles.leaderboardBadges, { color: theme.textSecondary }]}>{userData.badges.length} badges</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {(user.bio || user.phone || user.company || user.location || user.website) && (
        <View style={[styles.infoSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {user.bio && (
            <View style={styles.infoItem}>
              <Text style={[styles.bioText, { color: theme.text }, isRTL && styles.rtlText]}>{user.bio}</Text>
            </View>
          )}
          {user.location && (
            <View style={[styles.infoItem, isRTL && styles.rtl]}>
              <MapPin size={16} color={theme.textSecondary} />
              <Text style={[styles.infoText, { color: theme.text }]}>{user.location}</Text>
            </View>
          )}
          {user.company && (
            <View style={[styles.infoItem, isRTL && styles.rtl]}>
              <Briefcase size={16} color={theme.textSecondary} />
              <Text style={[styles.infoText, { color: theme.text }]}>{user.company}</Text>
            </View>
          )}
          {user.phone && (
            <View style={[styles.infoItem, isRTL && styles.rtl]}>
              <Phone size={16} color={theme.textSecondary} />
              <Text style={[styles.infoText, { color: theme.text }]}>{user.phone}</Text>
            </View>
          )}
          {user.website && (
            <View style={[styles.infoItem, isRTL && styles.rtl]}>
              <Globe size={16} color={theme.textSecondary} />
              <Text style={[styles.infoText, { color: theme.primary }]}>{user.website}</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.section}>
        <TouchableOpacity 
          style={[styles.settingCard, { backgroundColor: theme.card, borderColor: theme.border }, isRTL && styles.rtl]}
          onPress={handleThemeToggle}
        >
          <View style={[styles.settingLeft, isRTL && styles.rtl]}>
            {theme.isDark ? (
              <Moon size={24} color={theme.primary} fill={theme.primary} />
            ) : (
              <Sun size={24} color={theme.primary} />
            )}
            <View>
              <Text style={[styles.settingTitle, { color: theme.text }, isRTL && styles.rtlText]}>Theme</Text>
              <Text style={[styles.settingSubtitle, { color: theme.textSecondary }, isRTL && styles.rtlText]}>
                {theme.isDark ? 'Dark Mode' : 'Light Mode'}
              </Text>
            </View>
          </View>
          <View style={[styles.settingBadge, { backgroundColor: theme.primary }]}>
            <Text style={styles.settingBadgeText}>
              {theme.isDark ? 'Light' : 'Dark'}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.settingCard, { backgroundColor: theme.card, borderColor: theme.border }, isRTL && styles.rtl]}
          onPress={handleLanguageToggle}
        >
          <View style={[styles.settingLeft, isRTL && styles.rtl]}>
            <Languages size={24} color={theme.primary} />
            <View>
              <Text style={[styles.settingTitle, { color: theme.text }, isRTL && styles.rtlText]}>Language</Text>
              <Text style={[styles.settingSubtitle, { color: theme.textSecondary }, isRTL && styles.rtlText]}>
                {language === 'en' ? 'English' : 'العربية'}
              </Text>
            </View>
          </View>
          <View style={[styles.settingBadge, { backgroundColor: theme.primary }]}>
            <Text style={styles.settingBadgeText}>
              {language === 'en' ? 'العربية' : 'English'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }, isRTL && styles.rtlText]}>Notifications</Text>
        
        {permissionStatus === 'denied' && (
          <TouchableOpacity
            style={[styles.permissionCard, { backgroundColor: theme.card, borderColor: theme.accent, borderWidth: 2 }]}
            onPress={async () => {
              const granted = await requestPermissions();
              if (!granted) {
                Alert.alert('Permission Denied', 'Please enable notifications in your device settings to receive updates.');
              }
            }}
          >
            <Bell size={24} color={theme.accent} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.settingTitle, { color: theme.text }]}>Enable Notifications</Text>
              <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>
                Get notified about answers and activity
              </Text>
            </View>
          </TouchableOpacity>
        )}

        <View style={[styles.settingCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={[styles.settingLeft, isRTL && styles.rtl]}>
            <Bell size={24} color={theme.primary} />
            <View>
              <Text style={[styles.settingTitle, { color: theme.text }, isRTL && styles.rtlText]}>All Notifications</Text>
              <Text style={[styles.settingSubtitle, { color: theme.textSecondary }, isRTL && styles.rtlText]}>
                Enable or disable all notifications
              </Text>
            </View>
          </View>
          <Switch
            value={notificationSettings.enabled}
            onValueChange={(value) => updateNotificationSettings({ enabled: value })}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor="#fff"
          />
        </View>

        {notificationSettings.enabled && (
          <>
            <View style={[styles.settingCard, { backgroundColor: theme.card, borderColor: theme.border, marginTop: 8 }]}>
              <View style={[styles.settingLeft, isRTL && styles.rtl]}>
                <MessageCircle size={20} color={theme.textSecondary} style={{ marginLeft: 32 }} />
                <View>
                  <Text style={[styles.settingTitle, { color: theme.text, fontSize: 15 }, isRTL && styles.rtlText]}>Answer Notifications</Text>
                  <Text style={[styles.settingSubtitle, { color: theme.textSecondary, fontSize: 13 }, isRTL && styles.rtlText]}>
                    When someone answers your question
                  </Text>
                </View>
              </View>
              <Switch
                value={notificationSettings.answerNotifications}
                onValueChange={(value) => updateNotificationSettings({ answerNotifications: value })}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor="#fff"
              />
            </View>

            <View style={[styles.settingCard, { backgroundColor: theme.card, borderColor: theme.border, marginTop: 8 }]}>
              <View style={[styles.settingLeft, isRTL && styles.rtl]}>
                <Award size={20} color={theme.textSecondary} style={{ marginLeft: 32 }} />
                <View>
                  <Text style={[styles.settingTitle, { color: theme.text, fontSize: 15 }, isRTL && styles.rtlText]}>Best Answer Notifications</Text>
                  <Text style={[styles.settingSubtitle, { color: theme.textSecondary, fontSize: 13 }, isRTL && styles.rtlText]}>
                    When your answer is marked as best
                  </Text>
                </View>
              </View>
              <Switch
                value={notificationSettings.bestAnswerNotifications}
                onValueChange={(value) => updateNotificationSettings({ bestAnswerNotifications: value })}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor="#fff"
              />
            </View>
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }, isRTL && styles.rtlText]}>{t.level} {t.categories}</Text>
        <View style={[styles.levelInfo, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={[styles.levelItem, isRTL && styles.rtl]}>
            <View style={[styles.levelDot, { backgroundColor: theme.secondary }]} />
            <View style={styles.levelDetails}>
              <Text style={[styles.levelName, { color: theme.text }, isRTL && styles.rtlText]}>{t.beginner}</Text>
              <Text style={[styles.levelDescription, { color: theme.textSecondary }, isRTL && styles.rtlText]}>0-100 {t.reputation}</Text>
            </View>
          </View>
          <View style={[styles.levelItem, isRTL && styles.rtl]}>
            <View style={[styles.levelDot, { backgroundColor: theme.primary }]} />
            <View style={styles.levelDetails}>
              <Text style={[styles.levelName, { color: theme.text }, isRTL && styles.rtlText]}>{t.intermediate}</Text>
              <Text style={[styles.levelDescription, { color: theme.textSecondary }, isRTL && styles.rtlText]}>101-500 {t.reputation}</Text>
            </View>
          </View>
          <View style={[styles.levelItem, isRTL && styles.rtl]}>
            <View style={[styles.levelDot, { backgroundColor: theme.accent }]} />
            <View style={styles.levelDetails}>
              <Text style={[styles.levelName, { color: theme.text }, isRTL && styles.rtlText]}>{t.expert}</Text>
              <Text style={[styles.levelDescription, { color: theme.textSecondary }, isRTL && styles.rtlText]}>500+ {t.reputation}</Text>
            </View>
          </View>
        </View>
      </View>

      <TouchableOpacity style={[styles.logoutButton, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={handleLogout}>
        <LogOut size={20} color={theme.error} />
        <Text style={[styles.logoutText, { color: theme.error }]}>{t.logout}</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: theme.textSecondary }, isRTL && styles.rtlText]}>Labour Law Hub v1.0</Text>
        <Text style={[styles.footerSubtext, { color: theme.textSecondary }, isRTL && styles.rtlText]}>
          {user.role === 'admin' && t.adminRole}
        </Text>
      </View>

      <EditProfileModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    marginBottom: 12,
  },
  levelBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#fff',
    textTransform: 'uppercase' as const,
  },
  statsSection: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  infoSection: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
  },

  section: {
    padding: 16,
  },
  settingCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  settingSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  settingBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  settingBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 16,
  },
  levelInfo: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    gap: 16,
  },
  levelItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  levelDetails: {
    flex: 1,
  },
  levelName: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  levelDescription: {
    fontSize: 14,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.error,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 14,
  },
  footerSubtext: {
    fontSize: 12,
    marginTop: 4,
  },
  rtl: {
    flexDirection: 'row-reverse',
  },
  rtlText: {
    textAlign: 'right',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 24,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {},
  tabText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  activeTabText: {
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  errorText: {
    color: Colors.light.error,
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  demoContainer: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  demoText: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  demoEmail: {
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 4,
  },
  permissionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgeItem: {
    width: '47%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  badgeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: '700' as const,
    marginBottom: 4,
    textAlign: 'center',
  },
  badgeDescription: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 8,
  },
  badgeRarity: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeRarityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700' as const,
    textTransform: 'uppercase' as const,
  },
  leaderboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  leaderboardContainer: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  leaderboardRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaderboardRankText: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  leaderboardAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaderboardAvatarText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#fff',
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardName: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  leaderboardStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  leaderboardReputation: {
    fontSize: 13,
  },
  leaderboardBadges: {
    fontSize: 13,
  },
});
