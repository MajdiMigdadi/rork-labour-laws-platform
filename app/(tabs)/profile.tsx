import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, Switch } from 'react-native';
import { showAlert } from '@/utils/alert';
import { LogOut, Award, TrendingUp, MessageCircle, Edit2, MapPin, Briefcase, Globe, User as UserIcon, Moon, Sun, Bell, Sparkles, ChevronRight, Shield, Star, CheckCircle, Calendar, Languages } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'expo-router';
import EditProfileModal from '@/components/EditProfileModal';
import { useTheme } from '@/hooks/useTheme';
import { useSettings } from '@/contexts/SettingsContext';
import { useNotifications } from '@/contexts/NotificationsContext';
import { useReputation } from '@/contexts/ReputationContext';
import { useData } from '@/contexts/DataContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen() {
  const { user, users, logout } = useAuth();
  const { t, language, changeLanguage, isRTL } = useLanguage();
  const { getUserReputation, getLeaderboard, getRarityColor } = useReputation();
  const { questions, answers } = useData();
  const router = useRouter();
  const theme = useTheme();
  const { settings, updateSettings } = useSettings();
  const { settings: notificationSettings, updateSettings: updateNotificationSettings } = useNotifications();
  const [editModalVisible, setEditModalVisible] = useState(false);

  const handleEditProfile = () => {
    setEditModalVisible(true);
  };

  const handleLogout = () => {
    showAlert(t.logout, t.areYouSure, [
      { text: t.cancel, style: 'cancel' },
      {
        text: t.logout,
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const handleLanguageToggle = () => {
    const newLang = language === 'en' ? 'ar' : 'en';
    changeLanguage(newLang);
  };

  const handleThemeToggle = async () => {
    const newTheme = settings.themeMode === 'light' ? 'dark' : 'light';
    await updateSettings({ themeMode: newTheme });
  };

  const getLevelColor = (level: string): [string, string] => {
    switch (level) {
      case 'beginner':
        return ['#10b981', '#34d399'];
      case 'intermediate':
        return ['#6366f1', '#8b5cf6'];
      case 'expert':
        return ['#f59e0b', '#fbbf24'];
      default:
        return ['#10b981', '#34d399'];
    }
  };

  // Guest Screen - Redirect to Login
  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Background decorations */}
        <View style={[styles.guestBgCircle1, { backgroundColor: theme.primary + '10' }]} />
        <View style={[styles.guestBgCircle2, { backgroundColor: '#8B5CF610' }]} />
        
        <ScrollView
          contentContainerStyle={styles.guestScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Language Toggle */}
          <TouchableOpacity 
            style={[styles.guestLanguageToggle, { backgroundColor: theme.backgroundSecondary }]}
            onPress={handleLanguageToggle}
            activeOpacity={0.8}
          >
            <Globe size={16} color={theme.primary} />
            <Text style={[styles.guestLanguageText, { color: theme.text }]}>
              {language === 'en' ? 'العربية' : 'English'}
            </Text>
          </TouchableOpacity>

          {/* Icon */}
          <View style={styles.guestIconSection}>
            <LinearGradient
              colors={[theme.primary, '#8B5CF6']}
              style={styles.guestIconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <UserIcon size={48} color="#fff" strokeWidth={1.5} />
            </LinearGradient>
          </View>

          {/* Welcome Text */}
          <View style={styles.guestTextSection}>
            <Text style={[styles.guestTitle, { color: theme.text }, isRTL && styles.rtlText]}>
              {language === 'ar' ? 'مرحباً بك' : 'Welcome Guest'}
            </Text>
            <Text style={[styles.guestSubtitle, { color: theme.textSecondary }, isRTL && styles.rtlText]}>
              {language === 'ar' 
                ? 'سجل دخولك أو أنشئ حساباً للوصول إلى ملفك الشخصي'
                : 'Sign in or create an account to access your profile'}
            </Text>
          </View>

          {/* Features List */}
          <View style={styles.guestFeatures}>
            {[
              { icon: Award, text: language === 'ar' ? 'اكسب السمعة والشارات' : 'Earn reputation & badges', color: '#6366F1' },
              { icon: MessageCircle, text: language === 'ar' ? 'اسأل وأجب على الأسئلة' : 'Ask & answer questions', color: '#10B981' },
              { icon: TrendingUp, text: language === 'ar' ? 'تتبع تقدمك' : 'Track your progress', color: '#F59E0B' },
            ].map((feature, index) => (
              <View key={index} style={[styles.guestFeatureItem, { backgroundColor: theme.card }]}>
                <View style={[styles.guestFeatureIcon, { backgroundColor: feature.color + '15' }]}>
                  <feature.icon size={20} color={feature.color} />
                </View>
                <Text style={[styles.guestFeatureText, { color: theme.text }, isRTL && styles.rtlText]}>
                  {feature.text}
                </Text>
              </View>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.guestActions}>
            <TouchableOpacity 
              style={styles.guestPrimaryButton}
              onPress={() => router.push('/(auth)/login')}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[theme.primary, '#8B5CF6']}
                style={styles.guestPrimaryButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.guestPrimaryButtonText}>
                  {language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
                </Text>
                <ChevronRight size={20} color="#fff" style={isRTL && { transform: [{ rotate: '180deg' }] }} />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.guestSecondaryButton, { borderColor: theme.border }]}
              onPress={() => router.push('/(auth)/login')}
              activeOpacity={0.8}
            >
              <Sparkles size={20} color={theme.primary} />
              <Text style={[styles.guestSecondaryButtonText, { color: theme.text }]}>
                {language === 'ar' ? 'إنشاء حساب جديد' : 'Create New Account'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Continue as Guest */}
          <TouchableOpacity 
            style={styles.guestContinueButton}
            onPress={() => router.push('/(tabs)/home')}
          >
            <Text style={[styles.guestContinueText, { color: theme.textSecondary }]}>
              {language === 'ar' ? 'استمر كزائر' : 'Continue as Guest'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // Profile Screen (logged in)
  const userQuestions = questions.filter(q => q.userId === user.id).length;
  const userAnswers = answers.filter(a => a.userId === user.id).length;
  const userBadges = getUserReputation(user.id).badges;
  const acceptedAnswers = answers.filter(a => a.userId === user.id && a.isAccepted).length;
  const memberSince = new Date(user.joinedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Header - Full Width Cover */}
      <LinearGradient
        colors={['#1e1b4b', '#312e81', '#4338ca']}
        style={styles.profileHeader}
      >
        <View style={styles.headerPattern}>
          {[...Array(6)].map((_, i) => (
            <View key={i} style={[styles.patternDot, { left: `${15 + i * 15}%`, top: `${20 + (i % 3) * 25}%` }]} />
          ))}
        </View>
      </LinearGradient>

      {/* Profile Card - Overlapping */}
      <View style={styles.profileCardContainer}>
        <View style={[styles.profileCard, { backgroundColor: theme.card }]}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            {user.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <LinearGradient
                colors={getLevelColor(user.level)}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
              </LinearGradient>
            )}
            <TouchableOpacity 
              style={styles.editAvatarBtn} 
              onPress={handleEditProfile}
              activeOpacity={0.8}
            >
              <Edit2 size={12} color="#fff" />
            </TouchableOpacity>
            
            {/* Online indicator */}
            <View style={styles.onlineBadge} />
          </View>

          {/* Name & Email */}
          <Text style={[styles.userName, { color: theme.text }]}>{user.name}</Text>
          <Text style={[styles.userEmail, { color: theme.textSecondary }]}>{user.email}</Text>

          {/* Level & Role Badges */}
          <View style={styles.badgeRow}>
            <LinearGradient
              colors={getLevelColor(user.level)}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.levelPill}
            >
              <Star size={12} color="#fff" />
              <Text style={styles.levelPillText}>
                {user.level === 'beginner' ? t.beginner : user.level === 'intermediate' ? t.intermediate : t.expert}
              </Text>
            </LinearGradient>
            
            {user.role === 'admin' && (
              <View style={styles.adminPill}>
                <Shield size={12} color="#6366f1" />
                <Text style={[styles.adminPillText, { color: '#6366f1' }]}>{t.adminRole}</Text>
              </View>
            )}
          </View>

          {/* Member Since */}
          <View style={styles.memberSinceRow}>
            <Calendar size={14} color={theme.textSecondary} />
            <Text style={[styles.memberSinceText, { color: theme.textSecondary }]}>
              {t.memberSince} {memberSince}
            </Text>
          </View>

          {/* Quick Stats Row */}
          <View style={styles.quickStats}>
            <View style={styles.quickStatItem}>
              <Text style={[styles.quickStatValue, { color: theme.text }]}>{user.reputation}</Text>
              <Text style={[styles.quickStatLabel, { color: theme.textSecondary }]}>{t.reputation}</Text>
            </View>
            <View style={[styles.quickStatDivider, { backgroundColor: theme.border }]} />
            <View style={styles.quickStatItem}>
              <Text style={[styles.quickStatValue, { color: theme.text }]}>{userQuestions}</Text>
              <Text style={[styles.quickStatLabel, { color: theme.textSecondary }]}>{t.questions}</Text>
            </View>
            <View style={[styles.quickStatDivider, { backgroundColor: theme.border }]} />
            <View style={styles.quickStatItem}>
              <Text style={[styles.quickStatValue, { color: theme.text }]}>{userAnswers}</Text>
              <Text style={[styles.quickStatLabel, { color: theme.textSecondary }]}>{t.answers}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Activity Stats Cards */}
      <View style={styles.statsRow}>
        <View style={[styles.statsCard, { backgroundColor: theme.card }]}>
          <View style={[styles.statsIconBg, { backgroundColor: '#eef2ff' }]}>
            <Award size={22} color="#6366f1" />
          </View>
          <View style={styles.statsCardContent}>
            <Text style={[styles.statsCardValue, { color: theme.text }]}>{user.reputation}</Text>
            <Text style={[styles.statsCardLabel, { color: theme.textSecondary }]}>{t.reputation}</Text>
          </View>
        </View>
        
        <View style={[styles.statsCard, { backgroundColor: theme.card }]}>
          <View style={[styles.statsIconBg, { backgroundColor: '#d1fae5' }]}>
            <CheckCircle size={22} color="#10b981" />
          </View>
          <View style={styles.statsCardContent}>
            <Text style={[styles.statsCardValue, { color: theme.text }]}>{acceptedAnswers}</Text>
            <Text style={[styles.statsCardLabel, { color: theme.textSecondary }]}>{t.resolved}</Text>
          </View>
        </View>
      </View>

      {/* Edit Profile Action */}
      <View style={styles.section}>
        <TouchableOpacity 
          style={[styles.actionRow, { backgroundColor: theme.card }]}
          onPress={handleEditProfile}
          activeOpacity={0.7}
        >
          <View style={styles.actionRowLeft}>
            <View style={[styles.actionIconBg, { backgroundColor: '#eef2ff' }]}>
              <Edit2 size={18} color="#6366f1" />
            </View>
            <View>
              <Text style={[styles.actionRowTitle, { color: theme.text }]}>{t.editProfile}</Text>
              <Text style={[styles.actionRowSub, { color: theme.textSecondary }]}>{t.updateInfo}</Text>
            </View>
          </View>
          <ChevronRight size={20} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Badges Section */}
      {userBadges.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t.badgesEarned}</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.badgesScroll}
          >
            {userBadges.map((badge) => (
              <View 
                key={badge.id} 
                style={[styles.badgeCard, { backgroundColor: theme.card }]}
              >
                <View style={[styles.badgeIconBg, { backgroundColor: `${getRarityColor(badge.rarity)}15` }]}>
                  <Text style={styles.badgeIcon}>{badge.icon}</Text>
                </View>
                <Text style={[styles.badgeName, { color: theme.text }]}>{badge.name}</Text>
                <View style={[styles.badgeRarity, { backgroundColor: getRarityColor(badge.rarity) }]}>
                  <Text style={styles.badgeRarityText}>{badge.rarity}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* About Section */}
      {(user.bio || user.location || user.company) && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t.about}</Text>
          <View style={[styles.aboutCard, { backgroundColor: theme.card }]}>
            {user.bio && (
              <Text style={[styles.bioText, { color: theme.text }]}>{user.bio}</Text>
            )}
            {user.location && (
              <View style={styles.aboutRow}>
                <MapPin size={16} color={theme.textSecondary} />
                <Text style={[styles.aboutText, { color: theme.textSecondary }]}>{user.location}</Text>
              </View>
            )}
            {user.company && (
              <View style={styles.aboutRow}>
                <Briefcase size={16} color={theme.textSecondary} />
                <Text style={[styles.aboutText, { color: theme.textSecondary }]}>{user.company}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Settings Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>{t.settings}</Text>

        <View style={[styles.settingsGroup, { backgroundColor: theme.card }]}>
          {/* Theme Toggle */}
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={handleThemeToggle}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: theme.isDark ? '#312e81' : '#fef3c7' }]}>
                {theme.isDark ? <Moon size={18} color="#a78bfa" /> : <Sun size={18} color="#f59e0b" />}
              </View>
              <View>
                <Text style={[styles.settingTitle, { color: theme.text }]}>{t.theme}</Text>
                <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                  {theme.isDark ? t.darkMode : t.lightMode}
                </Text>
              </View>
            </View>
            <View style={[styles.settingAction, { backgroundColor: '#6366f1' }]}>
              <Text style={styles.settingActionText}>{theme.isDark ? t.switchToLight : t.switchToDark}</Text>
            </View>
          </TouchableOpacity>

          {/* Language Toggle */}
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={handleLanguageToggle}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#e0e7ff' }]}>
                <Languages size={18} color="#6366f1" />
              </View>
              <View>
                <Text style={[styles.settingTitle, { color: theme.text }]}>{t.language}</Text>
                <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                  {language === 'en' ? 'English' : 'العربية'}
                </Text>
              </View>
            </View>
            <View style={[styles.settingAction, { backgroundColor: '#10b981' }]}>
              <Text style={styles.settingActionText}>{language === 'en' ? 'العربية' : 'EN'}</Text>
            </View>
          </TouchableOpacity>

          {/* Notifications Toggle */}
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#fce7f3' }]}>
                <Bell size={18} color="#ec4899" />
              </View>
              <View>
                <Text style={[styles.settingTitle, { color: theme.text }]}>{t.notifications}</Text>
                <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                  {notificationSettings.enabled ? t.enabled : t.disabled}
                </Text>
              </View>
            </View>
            <Switch
              value={notificationSettings.enabled}
              onValueChange={(value) => updateNotificationSettings({ enabled: value })}
              trackColor={{ false: theme.border, true: '#6366f1' }}
              thumbColor="#fff"
            />
          </View>
        </View>
      </View>

      {/* Leaderboard Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>{t.topContributors}</Text>
        <View style={[styles.leaderboardCard, { backgroundColor: theme.card }]}>
          {getLeaderboard().slice(0, 3).map((userData, index) => {
            const userInfo = users.find(u => u.id === userData.userId);
            if (!userInfo) return null;
            const medals = ['🥇', '🥈', '🥉'];
            const bgColors = ['#fef3c7', '#e5e7eb', '#fed7aa'];
            return (
              <View key={userData.userId} style={styles.leaderboardRow}>
                <View style={[styles.leaderboardRank, { backgroundColor: bgColors[index] }]}>
                  <Text style={styles.leaderboardMedal}>{medals[index]}</Text>
                </View>
                {userInfo.avatar ? (
                  <Image source={{ uri: userInfo.avatar }} style={styles.leaderboardAvatar} />
                ) : (
                  <LinearGradient 
                    colors={getLevelColor(userInfo.level)} 
                    style={styles.leaderboardAvatar}
                  >
                    <Text style={styles.leaderboardAvatarText}>{userInfo.name.charAt(0)}</Text>
                  </LinearGradient>
                )}
                <View style={styles.leaderboardInfo}>
                  <Text style={[styles.leaderboardName, { color: theme.text }]}>{userInfo.name}</Text>
                  <Text style={[styles.leaderboardPoints, { color: theme.textSecondary }]}>
                    {userData.reputation} {t.reputation.toLowerCase()}
                  </Text>
                </View>
                <Text style={[styles.leaderboardScore, { color: theme.primary }]}>
                  #{index + 1}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Logout Button */}
      <View style={styles.section}>
        <TouchableOpacity 
          style={styles.logoutBtn} 
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <LogOut size={20} color="#ef4444" />
          <Text style={styles.logoutText}>{t.logout}</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: theme.textSecondary }]}>
          {settings.languageSettings?.[language]?.appName || settings.appName} v1.0
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
  rtl: {
    flexDirection: 'row-reverse',
  },
  rtlText: {
    textAlign: 'right',
  },

  // Guest Screen Styles
  guestBgCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    top: -100,
    right: -80,
  },
  guestBgCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    bottom: 150,
    left: -60,
  },
  guestScrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestLanguageToggle: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  guestLanguageText: {
    fontSize: 13,
    fontWeight: '600',
  },
  guestIconSection: {
    marginBottom: 28,
  },
  guestIconGradient: {
    width: 110,
    height: 110,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  guestTextSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  guestTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  guestSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  guestFeatures: {
    width: '100%',
    gap: 12,
    marginBottom: 32,
  },
  guestFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  guestFeatureIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestFeatureText: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  guestActions: {
    width: '100%',
    gap: 12,
    marginBottom: 20,
  },
  guestPrimaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  guestPrimaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  guestPrimaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  guestSecondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 10,
  },
  guestSecondaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  guestContinueButton: {
    paddingVertical: 12,
  },
  guestContinueText: {
    fontSize: 15,
    fontWeight: '500',
  },

  // Profile Header
  profileHeader: {
    height: 160,
    position: 'relative',
  },
  headerPattern: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  patternDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  // Profile Card
  profileCardContainer: {
    paddingHorizontal: 16,
    marginTop: -80,
  },
  profileCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  avatarContainer: {
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
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  onlineBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10b981',
    borderWidth: 3,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  userEmail: {
    fontSize: 14,
    marginTop: 4,
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  levelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  levelPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  adminPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    backgroundColor: '#eef2ff',
  },
  adminPillText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  memberSinceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  memberSinceText: {
    fontSize: 13,
  },
  quickStats: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  quickStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  quickStatLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  quickStatDivider: {
    width: 1,
    height: 40,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 16,
  },
  statsCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  statsIconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsCardContent: {
    flex: 1,
  },
  statsCardValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  statsCardLabel: {
    fontSize: 12,
    marginTop: 2,
  },

  // Section
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },

  // Action Row
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  actionRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRowTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  actionRowSub: {
    fontSize: 13,
    marginTop: 2,
  },

  // Badges
  badgesScroll: {
    gap: 12,
  },
  badgeCard: {
    width: 110,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  badgeIconBg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  badgeIcon: {
    fontSize: 28,
  },
  badgeName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  badgeRarity: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeRarityText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  // About Card
  aboutCard: {
    padding: 16,
    borderRadius: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  bioText: {
    fontSize: 15,
    lineHeight: 22,
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  aboutText: {
    fontSize: 14,
  },

  // Settings Group
  settingsGroup: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  settingSub: {
    fontSize: 12,
    marginTop: 2,
  },
  settingAction: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  settingActionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  // Leaderboard
  leaderboardCard: {
    padding: 16,
    borderRadius: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  leaderboardRank: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaderboardMedal: {
    fontSize: 18,
  },
  leaderboardAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaderboardAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardName: {
    fontSize: 15,
    fontWeight: '600',
  },
  leaderboardPoints: {
    fontSize: 12,
    marginTop: 2,
  },
  leaderboardScore: {
    fontSize: 14,
    fontWeight: '700',
  },

  // Logout
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    backgroundColor: '#fef2f2',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingBottom: 120,
  },
  footerText: {
    fontSize: 14,
  },
});
