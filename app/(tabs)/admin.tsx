import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Platform,
} from 'react-native';
import { showAlert, showSuccess } from '@/utils/alert';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Plus,
  Edit,
  Trash2,
  Globe,
  FileText,
  Users,
  Shield,
  Tag,
  Settings as SettingsIcon,
  Palette,
  Image as ImageIcon,
  Mail,
  Languages,
  Ban,
  UserCog,
  ChevronRight,
  Activity,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Sparkles,
  LayoutDashboard,
  MessageSquare,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useTheme } from '@/hooks/useTheme';
import { useContact } from '@/contexts/ContactContext';
import { Country, Law, LawCategory, User } from '@/types';
import { Image } from 'expo-image';
import FlagDisplay from '@/components/FlagDisplay';
import CountryFormModal from '@/components/CountryFormModal';
import LawFormModal from '@/components/LawFormModal';
import CategoryFormModal from '@/components/CategoryFormModal';
import SettingsEditorModal from '@/components/SettingsEditorModal';
import UserManagementModal from '@/components/UserManagementModal';
import LanguageSettingsModal from '@/components/LanguageSettingsModal';
import PhotoPickerModal from '@/components/PhotoPickerModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type AdminTab = 'dashboard' | 'countries' | 'laws' | 'categories' | 'users' | 'settings' | 'contact';

const NAV_ITEMS: { id: AdminTab; icon: any; label: string; labelAr: string }[] = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', labelAr: 'لوحة التحكم' },
  { id: 'countries', icon: Globe, label: 'Countries', labelAr: 'الدول' },
  { id: 'laws', icon: FileText, label: 'Laws', labelAr: 'القوانين' },
  { id: 'categories', icon: Tag, label: 'Categories', labelAr: 'الفئات' },
  { id: 'users', icon: Users, label: 'Users', labelAr: 'المستخدمين' },
  { id: 'contact', icon: MessageSquare, label: 'Messages', labelAr: 'الرسائل' },
  { id: 'settings', icon: SettingsIcon, label: 'Settings', labelAr: 'الإعدادات' },
];

export default function AdminScreen() {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const { isAdmin } = useAuth();
  const { t, isRTL, getTranslatedName, language } = useLanguage();
  const { settings, updateSettings, updateLanguageSettings } = useSettings();
  const theme = useTheme();
  const { 
    countries, 
    laws, 
    categories, 
    deleteCountry, 
    deleteLaw, 
    deleteCategory,
    addCountry,
    updateCountry,
    addLaw,
    updateLaw,
    addCategory,
    updateCategory,
  } = useData();

  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [lawModalVisible, setLawModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [editingCountry, setEditingCountry] = useState<Country | undefined>();
  const [editingLaw, setEditingLaw] = useState<Law | undefined>();
  const [editingCategory, setEditingCategory] = useState<LawCategory | undefined>();
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [languageSettingsModalVisible, setLanguageSettingsModalVisible] = useState(false);
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>();
  const [photoPickerVisible, setPhotoPickerVisible] = useState(false);
  const [uploadType, setUploadType] = useState<'logo' | 'favicon'>('logo');

  const { users, updateAnyUser, deleteUser, banUser, unbanUser } = useAuth();
  const { messages: contactMessages, markAsRead, replyToMessage, deleteMessage: deleteContactMessage } = useContact();

  if (!isAdmin) {
    return (
      <View style={[styles.noAccessContainer, { backgroundColor: theme.background }]}>
        <LinearGradient
          colors={[theme.primary + '20', theme.secondary + '10', 'transparent']}
          style={styles.noAccessGradient}
        />
        <View style={styles.noAccessContent}>
          <View style={[styles.noAccessIcon, { backgroundColor: theme.primary + '15' }]}>
            <Shield size={48} color={theme.primary} />
          </View>
          <Text style={[styles.noAccessTitle, { color: theme.text }]}>{t.accessDenied}</Text>
          <Text style={[styles.noAccessText, { color: theme.textSecondary }]}>
          {t.needAdminPrivileges}
        </Text>
        </View>
      </View>
    );
  }

  const handleAddCountry = () => {
    setEditingCountry(undefined);
    setCountryModalVisible(true);
  };

  const handleEditCountry = (country: Country) => {
    setEditingCountry(country);
    setCountryModalVisible(true);
  };

  const handleSaveCountry = async (data: Omit<Country, 'id' | 'lawCount'>) => {
    if (editingCountry) {
      await updateCountry(editingCountry.id, data);
    } else {
      await addCountry(data);
    }
    setCountryModalVisible(false);
  };

  const handleDeleteCountry = (country: Country) => {
    showAlert(
      t.deleteCountry,
      `${t.areYouSure} ${getTranslatedName(country)}? ${t.deleteConfirm}`,
      [
        { text: t.cancel, style: 'cancel' },
        { 
          text: t.delete, 
          style: 'destructive', 
          onPress: async () => {
            await deleteCountry(country.id);
            showSuccess(t.success, `${getTranslatedName(country)} deleted`);
          } 
        },
      ]
    );
  };

  const handleAddLaw = () => {
    setEditingLaw(undefined);
    setLawModalVisible(true);
  };

  const handleEditLaw = (law: Law) => {
    setEditingLaw(law);
    setLawModalVisible(true);
  };

  const handleSaveLaw = async (data: Omit<Law, 'id'>) => {
    if (editingLaw) {
      await updateLaw(editingLaw.id, data);
    } else {
      await addLaw(data);
    }
    setLawModalVisible(false);
  };

  const handleDeleteLaw = (law: Law) => {
    showAlert(
      t.deleteLaw,
      `${t.areYouSure} ${law.title}? ${t.deleteConfirm}`,
      [
        { text: t.cancel, style: 'cancel' },
        { 
          text: t.delete, 
          style: 'destructive', 
          onPress: async () => {
            await deleteLaw(law.id);
            showSuccess(t.success, `${law.title} deleted`);
          } 
        },
      ]
    );
  };

  const handleAddCategory = () => {
    setEditingCategory(undefined);
    setCategoryModalVisible(true);
  };

  const handleEditCategory = (category: LawCategory) => {
    setEditingCategory(category);
    setCategoryModalVisible(true);
  };

  const handleSaveCategory = async (data: Omit<LawCategory, 'id'>) => {
    if (editingCategory) {
      await updateCategory(editingCategory.id, data);
    } else {
      await addCategory(data);
    }
    setCategoryModalVisible(false);
  };

  const handleDeleteCategory = (category: LawCategory) => {
    showAlert(
      t.deleteCategory,
      `${t.areYouSure} ${getTranslatedName(category)}? ${t.deleteConfirm}`,
      [
        { text: t.cancel, style: 'cancel' },
        { 
          text: t.delete, 
          style: 'destructive', 
          onPress: async () => {
            await deleteCategory(category.id);
            showSuccess(t.success, `${getTranslatedName(category)} deleted`);
          } 
        },
      ]
    );
  };

  const getCountryName = (countryId: string) => {
    const country = countries.find(c => c.id === countryId);
    return country ? getTranslatedName(country) : '';
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? getTranslatedName(category) : '';
  };

  const handlePhotoSelected = async (uri: string) => {
    try {
      if (uri.startsWith('blob:')) {
        showAlert(
          'Warning', 
          'This image type may not persist. Please use "Use Image URL" option with a permanent URL instead.',
          [
            { text: 'Continue Anyway', onPress: () => saveImage(uri) },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
        return;
      }
      await saveImage(uri);
    } catch (error) {
      console.error('Error updating image:', error);
      showSuccess(t.error, 'Failed to update image');
    }
  };
  
  const saveImage = async (uri: string) => {
      const fieldToUpdate = uploadType === 'logo' ? 'logo' : 'favicon';
      const success = await updateSettings({ [fieldToUpdate]: uri });
    
      if (success) {
        showSuccess(t.success, `${uploadType === 'logo' ? 'Logo' : 'Favicon'} updated successfully`);
      } else {
      showSuccess(t.error, 'Failed to update image');
    }
  };

  // Quick stats for dashboard
  const unreadMessages = contactMessages.filter(m => m.status === 'unread').length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const bannedUsers = users.filter(u => u.status === 'banned').length;

  const renderDashboard = () => (
    <View style={styles.dashboardContainer}>
      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {[
          { icon: Globe, label: language === 'ar' ? 'الدول' : 'Countries', value: countries.length, color: '#6366F1', gradient: ['#6366F1', '#8B5CF6'] },
          { icon: FileText, label: language === 'ar' ? 'القوانين' : 'Laws', value: laws.length, color: '#10B981', gradient: ['#10B981', '#34D399'] },
          { icon: Tag, label: language === 'ar' ? 'الفئات' : 'Categories', value: categories.length, color: '#F59E0B', gradient: ['#F59E0B', '#FBBF24'] },
          { icon: Users, label: language === 'ar' ? 'المستخدمين' : 'Users', value: users.length, color: '#EC4899', gradient: ['#EC4899', '#F472B6'] },
        ].map((stat, index) => (
          <View 
            key={stat.label}
            style={[
              styles.statCard,
              { backgroundColor: theme.card }
            ]}
          >
            <LinearGradient
              colors={stat.gradient as [string, string]}
              style={styles.statIconContainer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <stat.icon size={22} color="#fff" />
            </LinearGradient>
            <Text style={[styles.statValue, { color: theme.text }]}>{stat.value}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
        <View style={[styles.sectionCardHeader, isRTL && styles.rtl]}>
          <View style={[styles.sectionTitleRow, isRTL && styles.rtl]}>
            <Sparkles size={20} color={theme.primary} />
            <Text style={[styles.sectionCardTitle, { color: theme.text }]}>
              {language === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}
            </Text>
          </View>
        </View>
        <View style={styles.quickActionsGrid}>
          {[
            { icon: Globe, label: language === 'ar' ? 'إضافة دولة' : 'Add Country', onPress: handleAddCountry, color: '#6366F1' },
            { icon: FileText, label: language === 'ar' ? 'إضافة قانون' : 'Add Law', onPress: handleAddLaw, color: '#10B981' },
            { icon: Tag, label: language === 'ar' ? 'إضافة فئة' : 'Add Category', onPress: handleAddCategory, color: '#F59E0B' },
            { icon: SettingsIcon, label: language === 'ar' ? 'الإعدادات' : 'Settings', onPress: () => setActiveTab('settings'), color: '#EC4899' },
          ].map((action, index) => (
            <TouchableOpacity
              key={index} 
              style={[styles.quickActionItem, { backgroundColor: action.color + '10' }]}
              onPress={action.onPress}
              activeOpacity={0.7}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: action.color + '20' }]}>
                <action.icon size={20} color={action.color} />
              </View>
              <Text style={[styles.quickActionLabel, { color: theme.text }]} numberOfLines={1}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Activity Overview */}
      <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
        <View style={[styles.sectionCardHeader, isRTL && styles.rtl]}>
          <View style={[styles.sectionTitleRow, isRTL && styles.rtl]}>
            <Activity size={20} color={theme.primary} />
            <Text style={[styles.sectionCardTitle, { color: theme.text }]}>
              {language === 'ar' ? 'نظرة عامة' : 'Activity Overview'}
              </Text>
          </View>
        </View>
        <View style={styles.activityList}>
          <View style={[styles.activityItem, isRTL && styles.rtl]}>
            <View style={[styles.activityIconContainer, { backgroundColor: '#10B98120' }]}>
              <CheckCircle size={18} color="#10B981" />
            </View>
            <View style={[styles.activityInfo, isRTL && { alignItems: 'flex-end' }]}>
              <Text style={[styles.activityTitle, { color: theme.text }]}>
                {language === 'ar' ? 'المستخدمين النشطين' : 'Active Users'}
              </Text>
              <Text style={[styles.activityValue, { color: '#10B981' }]}>{activeUsers}</Text>
            </View>
          </View>
          <View style={[styles.activityItem, isRTL && styles.rtl]}>
            <View style={[styles.activityIconContainer, { backgroundColor: '#6366F120' }]}>
              <MessageSquare size={18} color="#6366F1" />
            </View>
            <View style={[styles.activityInfo, isRTL && { alignItems: 'flex-end' }]}>
              <Text style={[styles.activityTitle, { color: theme.text }]}>
                {language === 'ar' ? 'رسائل جديدة' : 'Unread Messages'}
              </Text>
              <Text style={[styles.activityValue, { color: '#6366F1' }]}>{unreadMessages}</Text>
            </View>
          </View>
          <View style={[styles.activityItem, isRTL && styles.rtl]}>
            <View style={[styles.activityIconContainer, { backgroundColor: '#EF444420' }]}>
              <Ban size={18} color="#EF4444" />
            </View>
            <View style={[styles.activityInfo, isRTL && { alignItems: 'flex-end' }]}>
              <Text style={[styles.activityTitle, { color: theme.text }]}>
                {language === 'ar' ? 'المحظورين' : 'Banned Users'}
              </Text>
              <Text style={[styles.activityValue, { color: '#EF4444' }]}>{bannedUsers}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Recent Messages */}
      {contactMessages.length > 0 && (
        <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
          <View style={[styles.sectionCardHeader, isRTL && styles.rtl]}>
            <View style={[styles.sectionTitleRow, isRTL && styles.rtl]}>
              <Mail size={20} color={theme.primary} />
              <Text style={[styles.sectionCardTitle, { color: theme.text }]}>
                {language === 'ar' ? 'آخر الرسائل' : 'Recent Messages'}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setActiveTab('contact')}>
              <Text style={[styles.seeAllText, { color: theme.primary }]}>
                {language === 'ar' ? 'عرض الكل' : 'See All'}
              </Text>
            </TouchableOpacity>
          </View>
          {contactMessages.slice(0, 3).map((msg) => (
            <TouchableOpacity
              key={msg.id} 
              style={[styles.messagePreviewItem, isRTL && styles.rtl]}
              onPress={() => setActiveTab('contact')}
              activeOpacity={0.7}
            >
              <View style={[styles.messageAvatar, { backgroundColor: msg.status === 'unread' ? theme.primary : theme.backgroundSecondary }]}>
                <Text style={[styles.messageAvatarText, { color: msg.status === 'unread' ? '#fff' : theme.text }]}>
                  {msg.name.charAt(0).toUpperCase()}
              </Text>
              </View>
              <View style={[styles.messagePreviewContent, isRTL && { alignItems: 'flex-end' }]}>
                <View style={[styles.messagePreviewHeader, isRTL && styles.rtl]}>
                  <Text style={[styles.messagePreviewName, { color: theme.text }]} numberOfLines={1}>
                    {msg.name}
              </Text>
                  {msg.status === 'unread' && (
                    <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} />
                  )}
          </View>
                <Text style={[styles.messagePreviewSubject, { color: theme.textSecondary, textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={1}>
                  {msg.subject}
                </Text>
      </View>
              <ChevronRight size={18} color={theme.textSecondary} style={isRTL && { transform: [{ rotate: '180deg' }] }} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const renderCountries = () => (
    <View style={styles.listContainer}>
      <View style={[styles.listHeader, isRTL && styles.rtl]}>
        <Text style={[styles.listTitle, { color: theme.text }]}>{t.manageCountries}</Text>
        <TouchableOpacity 
          style={[styles.addBtn, { backgroundColor: theme.primary }]} 
          onPress={handleAddCountry}
        >
          <Plus size={18} color="#fff" />
          <Text style={styles.addBtnText}>{t.add}</Text>
              </TouchableOpacity>
            </View>

      {countries.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: theme.card }]}>
          <Globe size={48} color={theme.textSecondary} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            {language === 'ar' ? 'لا توجد دول' : 'No Countries Yet'}
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            {language === 'ar' ? 'أضف دولة للبدء' : 'Add a country to get started'}
          </Text>
                    </View>
      ) : (
        countries.map((country) => (
          <View 
            key={country.id} 
            style={[
              styles.listItem,
              { backgroundColor: theme.card }
            ]}
          >
            <View style={[styles.listItemContent, isRTL && styles.rtl]}>
              <FlagDisplay flag={country.flag} size="medium" />
              <View style={[styles.listItemInfo, isRTL && { alignItems: 'flex-end' }]}>
                <Text style={[styles.listItemTitle, { color: theme.text }]}>
                  {getTranslatedName(country)}
                </Text>
                <Text style={[styles.listItemSubtitle, { color: theme.textSecondary }]}>
                  {country.lawCount} {t.laws}
                </Text>
              </View>
            </View>
            <View style={styles.listItemActions}>
              <TouchableOpacity
                style={[styles.actionIconBtn, { backgroundColor: theme.primary + '15' }]}
                onPress={() => handleEditCountry(country)}
              >
                <Edit size={16} color={theme.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionIconBtn, { backgroundColor: '#EF444415' }]}
                onPress={() => handleDeleteCountry(country)}
              >
                <Trash2 size={16} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
          </View>
  );

  const renderLaws = () => (
    <View style={styles.listContainer}>
      <View style={[styles.listHeader, isRTL && styles.rtl]}>
        <Text style={[styles.listTitle, { color: theme.text }]}>{t.manageLaws}</Text>
        <TouchableOpacity 
          style={[styles.addBtn, { backgroundColor: theme.primary }]} 
          onPress={handleAddLaw}
        >
          <Plus size={18} color="#fff" />
          <Text style={styles.addBtnText}>{t.add}</Text>
              </TouchableOpacity>
            </View>

      {laws.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: theme.card }]}>
          <FileText size={48} color={theme.textSecondary} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            {language === 'ar' ? 'لا توجد قوانين' : 'No Laws Yet'}
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            {language === 'ar' ? 'أضف قانون للبدء' : 'Add a law to get started'}
          </Text>
        </View>
      ) : (
        laws.map((law) => (
          <View key={law.id} style={[styles.listItem, { backgroundColor: theme.card }]}>
            <View style={[styles.listItemContent, isRTL && styles.rtl, { flex: 1 }]}>
              <View style={[styles.lawIconContainer, { backgroundColor: theme.primary + '15' }]}>
                <FileText size={20} color={theme.primary} />
              </View>
              <View style={[styles.listItemInfo, isRTL && { alignItems: 'flex-end' }, { flex: 1 }]}>
                <Text style={[styles.listItemTitle, { color: theme.text }]} numberOfLines={2}>
                        {law.title}
                      </Text>
                      <View style={[styles.lawBadges, isRTL && styles.rtl]}>
                  <View style={[styles.lawBadge, { backgroundColor: '#6366F115' }]}>
                    <Text style={[styles.lawBadgeText, { color: '#6366F1' }]}>
                      {getCountryName(law.countryId)}
                    </Text>
                        </View>
                  <View style={[styles.lawBadge, { backgroundColor: '#10B98115' }]}>
                    <Text style={[styles.lawBadgeText, { color: '#10B981' }]}>
                      {getCategoryName(law.categoryId)}
                    </Text>
                        </View>
                      </View>
                    </View>
                  </View>
            <View style={styles.listItemActions}>
                    <TouchableOpacity
                style={[styles.actionIconBtn, { backgroundColor: theme.primary + '15' }]}
                      onPress={() => handleEditLaw(law)}
                    >
                <Edit size={16} color={theme.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                style={[styles.actionIconBtn, { backgroundColor: '#EF444415' }]}
                      onPress={() => handleDeleteLaw(law)}
                    >
                <Trash2 size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
        ))
      )}
          </View>
  );

  const renderCategories = () => (
    <View style={styles.listContainer}>
      <View style={[styles.listHeader, isRTL && styles.rtl]}>
        <Text style={[styles.listTitle, { color: theme.text }]}>{t.manageCategories}</Text>
        <TouchableOpacity 
          style={[styles.addBtn, { backgroundColor: theme.primary }]} 
          onPress={handleAddCategory}
        >
          <Plus size={18} color="#fff" />
          <Text style={styles.addBtnText}>{t.add}</Text>
              </TouchableOpacity>
            </View>

      {categories.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: theme.card }]}>
          <Tag size={48} color={theme.textSecondary} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            {language === 'ar' ? 'لا توجد فئات' : 'No Categories Yet'}
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            {language === 'ar' ? 'أضف فئة للبدء' : 'Add a category to get started'}
          </Text>
        </View>
      ) : (
        categories.map((category) => (
          <View key={category.id} style={[styles.listItem, { backgroundColor: theme.card }]}>
            <View style={[styles.listItemContent, isRTL && styles.rtl]}>
              <View style={[styles.categoryIcon, { backgroundColor: theme.primary + '15' }]}>
                      <Tag size={20} color={theme.primary} />
                    </View>
              <View style={[styles.listItemInfo, isRTL && { alignItems: 'flex-end' }]}>
                <Text style={[styles.listItemTitle, { color: theme.text }]}>
                  {getTranslatedName(category)}
                </Text>
                <Text style={[styles.listItemSubtitle, { color: theme.textSecondary }]}>
                  {language === 'ar' ? 'أيقونة:' : 'Icon:'} {category.icon}
                </Text>
                    </View>
                  </View>
            <View style={styles.listItemActions}>
                    <TouchableOpacity
                style={[styles.actionIconBtn, { backgroundColor: theme.primary + '15' }]}
                      onPress={() => handleEditCategory(category)}
                    >
                <Edit size={16} color={theme.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                style={[styles.actionIconBtn, { backgroundColor: '#EF444415' }]}
                      onPress={() => handleDeleteCategory(category)}
                    >
                <Trash2 size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
        ))
        )}
            </View>
  );

  const renderUsers = () => (
    <View style={styles.listContainer}>
      <View style={[styles.listHeader, isRTL && styles.rtl]}>
        <Text style={[styles.listTitle, { color: theme.text }]}>{t.manageUsers}</Text>
        <View style={[styles.userStats, isRTL && styles.rtl]}>
          <View style={[styles.userStatBadge, { backgroundColor: '#10B98120' }]}>
            <Text style={[styles.userStatText, { color: '#10B981' }]}>{activeUsers} {language === 'ar' ? 'نشط' : 'active'}</Text>
              </View>
          <View style={[styles.userStatBadge, { backgroundColor: '#EF444420' }]}>
            <Text style={[styles.userStatText, { color: '#EF4444' }]}>{bannedUsers} {language === 'ar' ? 'محظور' : 'banned'}</Text>
                </View>
              </View>
            </View>

      {users.map((user) => (
        <View key={user.id} style={[styles.userCard, { backgroundColor: theme.card }]}>
          <View style={[styles.userCardHeader, isRTL && styles.rtl]}>
            {user.avatar ? (
                      <Image
                source={{ uri: user.avatar }}
                style={styles.userAvatarImg}
                contentFit="cover"
                      />
                    ) : (
              <View style={[styles.userAvatarPlaceholder, { backgroundColor: user.role === 'admin' ? theme.primary : theme.secondary }]}>
                <Text style={styles.userAvatarLetter}>
                  {user.name.charAt(0).toUpperCase()}
                </Text>
                      </View>
                    )}
            <View style={[styles.userInfo, isRTL && { alignItems: 'flex-end' }]}>
              <View style={[styles.userNameRow, isRTL && styles.rtl]}>
                <Text style={[styles.userName, { color: theme.text }]}>{user.name}</Text>
                {user.role === 'admin' && (
                  <View style={[styles.roleBadge, { backgroundColor: theme.primary }]}>
                    <Shield size={10} color="#fff" />
                    <Text style={styles.roleBadgeText}>{t.admin.toUpperCase()}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.userEmail, { color: theme.textSecondary }]}>{user.email}</Text>
              <View style={[styles.userMeta, isRTL && styles.rtl]}>
                <Text style={[styles.userMetaText, { color: theme.textSecondary }]}>
                  {t.level}: {user.level}
                    </Text>
                <Text style={[styles.userMetaDot, { color: theme.textSecondary }]}>•</Text>
                <Text style={[styles.userMetaText, { color: theme.textSecondary }]}>
                  {user.reputation} {t.reputation}
                </Text>
                </View>
                      </View>
          </View>
          <View style={[styles.userCardFooter, isRTL && styles.rtl]}>
            <View style={[
              styles.statusBadge, 
              { backgroundColor: user.status === 'active' ? '#10B98120' : user.status === 'banned' ? '#EF444420' : '#F59E0B20' }
            ]}>
              {user.status === 'active' ? (
                <CheckCircle size={12} color="#10B981" />
              ) : user.status === 'banned' ? (
                <Ban size={12} color="#EF4444" />
              ) : (
                <AlertCircle size={12} color="#F59E0B" />
              )}
              <Text style={[
                styles.statusText, 
                { color: user.status === 'active' ? '#10B981' : user.status === 'banned' ? '#EF4444' : '#F59E0B' }
              ]}>
                {user.status === 'active' ? (language === 'ar' ? 'نشط' : 'Active') : 
                 user.status === 'banned' ? (language === 'ar' ? 'محظور' : 'Banned') : 
                 (language === 'ar' ? 'معلق' : 'Suspended')}
              </Text>
                  </View>
                  <TouchableOpacity
              style={[styles.manageBtn, { backgroundColor: theme.primary }]}
                    onPress={() => {
                setEditingUser(user);
                setUserModalVisible(true);
                    }}
                  >
              <UserCog size={16} color="#fff" />
              <Text style={styles.manageBtnText}>{language === 'ar' ? 'إدارة' : 'Manage'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
      ))}
            </View>
  );

  const renderContact = () => (
    <View style={styles.listContainer}>
      <View style={[styles.listHeader, isRTL && styles.rtl]}>
        <Text style={[styles.listTitle, { color: theme.text }]}>
          {language === 'ar' ? 'رسائل التواصل' : 'Contact Messages'}
        </Text>
        {unreadMessages > 0 && (
          <View style={[styles.unreadBadge, { backgroundColor: theme.primary }]}>
            <Text style={styles.unreadBadgeText}>{unreadMessages} {language === 'ar' ? 'جديد' : 'new'}</Text>
                </View>
              )}
            </View>

            {contactMessages.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: theme.card }]}>
                <Mail size={48} color={theme.textSecondary} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            {language === 'ar' ? 'لا توجد رسائل' : 'No Messages Yet'}
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            {language === 'ar' ? 'الرسائل ستظهر هنا' : 'Messages will appear here'}
                </Text>
              </View>
            ) : (
        contactMessages.map((msg) => (
          <View 
            key={msg.id} 
            style={[
              styles.messageCard, 
              { backgroundColor: theme.card },
              msg.status === 'unread' && { borderLeftWidth: 4, borderLeftColor: theme.primary }
            ]}
          >
            <View style={[styles.messageCardHeader, isRTL && styles.rtl]}>
              <View style={[styles.messageSenderInfo, isRTL && styles.rtl]}>
                <View style={[styles.messageSenderAvatar, { backgroundColor: msg.status === 'unread' ? theme.primary : theme.backgroundSecondary }]}>
                  <Text style={[styles.messageSenderInitial, { color: msg.status === 'unread' ? '#fff' : theme.text }]}>
                    {msg.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={isRTL && { alignItems: 'flex-end' }}>
                  <View style={[styles.messageSenderRow, isRTL && styles.rtl]}>
                    <Text style={[styles.messageSenderName, { color: theme.text }]}>{msg.name}</Text>
                        {msg.status === 'unread' && (
                      <View style={[styles.newBadge, { backgroundColor: theme.primary }]}>
                        <Text style={styles.newBadgeText}>{language === 'ar' ? 'جديد' : 'NEW'}</Text>
                          </View>
                        )}
                        {msg.status === 'replied' && (
                      <View style={[styles.repliedBadge, { backgroundColor: '#10B981' }]}>
                        <Text style={styles.repliedBadgeText}>{language === 'ar' ? 'تم الرد' : 'REPLIED'}</Text>
                          </View>
                        )}
                      </View>
                  <Text style={[styles.messageSenderEmail, { color: theme.textSecondary }]}>{msg.email}</Text>
                </View>
              </View>
                      <Text style={[styles.messageDate, { color: theme.textSecondary }]}>
                {new Date(msg.createdAt).toLocaleDateString()}
                      </Text>
                    </View>

            <Text style={[styles.messageSubject, { color: theme.text, textAlign: isRTL ? 'right' : 'left' }]}>
              {msg.subject}
            </Text>
            <Text style={[styles.messageBody, { color: theme.textSecondary, textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={2}>
              {msg.message}
            </Text>

                  {msg.adminReply && (
              <View style={[styles.replyPreview, { backgroundColor: theme.backgroundSecondary }]}>
                <Text style={[styles.replyPreviewLabel, { color: theme.textSecondary }]}>
                  {language === 'ar' ? 'ردك:' : 'Your Reply:'}
                </Text>
                <Text style={[styles.replyPreviewText, { color: theme.text, textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={2}>
                  {msg.adminReply}
                      </Text>
                    </View>
                  )}

            <View style={[styles.messageActions, isRTL && styles.rtl]}>
                    {msg.status === 'unread' && (
                      <TouchableOpacity
                  style={[styles.msgActionBtn, { backgroundColor: theme.primary + '15' }]}
                        onPress={() => markAsRead(msg.id)}
                      >
                  <Eye size={14} color={theme.primary} />
                  <Text style={[styles.msgActionText, { color: theme.primary }]}>
                    {language === 'ar' ? 'تحديد كمقروء' : 'Mark Read'}
                  </Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                style={[styles.msgActionBtn, { backgroundColor: '#10B98115' }]}
                      onPress={async () => {
                        if (Platform.OS === 'web') {
                          const text = window.prompt(
                            `${language === 'ar' ? 'الرد على' : 'Reply to'} ${msg.name}:`,
                            msg.adminReply || ''
                          );
                          if (text && text.trim()) {
                            await replyToMessage(msg.id, text.trim());
                            showSuccess(t.success, language === 'ar' ? 'تم إرسال الرد' : 'Reply sent');
                          }
                        } else {
                          const { Alert: NativeAlert } = require('react-native');
                          NativeAlert.prompt(
                            language === 'ar' ? 'الرد على الرسالة' : 'Reply to Message',
                            `${language === 'ar' ? 'الرد على' : 'Reply to'} ${msg.name}:`,
                            [
                              { text: t.cancel, style: 'cancel' },
                              {
                                text: language === 'ar' ? 'إرسال' : 'Send',
                                onPress: async (text: string | undefined) => {
                                  if (text && text.trim()) {
                                    await replyToMessage(msg.id, text.trim());
                                    showSuccess(t.success, language === 'ar' ? 'تم إرسال الرد' : 'Reply sent');
                                  }
                                },
                              },
                            ],
                            'plain-text',
                            msg.adminReply || ''
                          );
                        }
                      }}
                    >
                <Mail size={14} color="#10B981" />
                <Text style={[styles.msgActionText, { color: '#10B981' }]}>
                  {msg.adminReply ? (language === 'ar' ? 'تحديث الرد' : 'Update') : (language === 'ar' ? 'رد' : 'Reply')}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                style={[styles.msgActionBtn, { backgroundColor: '#EF444415' }]}
                      onPress={() => {
                        showAlert(
                    language === 'ar' ? 'حذف الرسالة' : 'Delete Message',
                    language === 'ar' ? 'هل أنت متأكد من حذف هذه الرسالة؟' : 'Are you sure you want to delete this message?',
                          [
                      { text: t.cancel, style: 'cancel' },
                            {
                        text: t.delete,
                              style: 'destructive',
                              onPress: async () => {
                                await deleteContactMessage(msg.id);
                              },
                            },
                          ]
                        );
                      }}
                    >
                <Trash2 size={14} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
  );

  const renderSettings = () => (
    <View style={styles.listContainer}>
      <View style={[styles.listHeader, isRTL && styles.rtl]}>
        <Text style={[styles.listTitle, { color: theme.text }]}>
          {language === 'ar' ? 'إعدادات المنصة' : 'Platform Settings'}
        </Text>
            </View>

      {/* Brand Colors */}
      <View style={[styles.settingsSection, { backgroundColor: theme.card }]}>
        <View style={[styles.settingsSectionHeader, isRTL && styles.rtl]}>
          <Palette size={22} color={theme.primary} />
          <Text style={[styles.settingsSectionTitle, { color: theme.text }]}>
            {language === 'ar' ? 'ألوان العلامة التجارية' : 'Brand Colors'}
          </Text>
        </View>
        <View style={styles.colorRow}>
          {[
            { label: language === 'ar' ? 'الأساسي' : 'Primary', value: settings.primaryColor },
            { label: language === 'ar' ? 'الثانوي' : 'Secondary', value: settings.secondaryColor },
            { label: language === 'ar' ? 'التمييز' : 'Accent', value: settings.accentColor },
          ].map((color) => (
            <View key={color.label} style={styles.colorItem}>
              <View style={[styles.colorPreviewBox, { backgroundColor: color.value }]} />
              <Text style={[styles.colorLabel, { color: theme.textSecondary }]}>{color.label}</Text>
              <Text style={[styles.colorValue, { color: theme.text }]}>{color.value}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* App Branding */}
      <View style={[styles.settingsSection, { backgroundColor: theme.card }]}>
        <View style={[styles.settingsSectionHeader, isRTL && styles.rtl]}>
          <Languages size={22} color={theme.primary} />
          <Text style={[styles.settingsSectionTitle, { color: theme.text }]}>
            {language === 'ar' ? 'هوية التطبيق' : 'App Branding'}
          </Text>
        </View>
        
        {/* English */}
        <View style={styles.brandingLang}>
          <Text style={[styles.brandingLangTitle, { color: theme.text }]}>🇬🇧 English</Text>
          <View style={styles.brandingInputGroup}>
            <Text style={[styles.brandingLabel, { color: theme.textSecondary }]}>App Name</Text>
            <TextInput
              style={[styles.brandingInput, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border }]}
              value={settings.languageSettings?.en?.appName || settings.appName}
              onChangeText={(text) => updateLanguageSettings('en', { appName: text })}
              placeholder="App name in English"
              placeholderTextColor={theme.textSecondary}
            />
          </View>
          <View style={styles.brandingInputGroup}>
            <Text style={[styles.brandingLabel, { color: theme.textSecondary }]}>Description</Text>
            <TextInput
              style={[styles.brandingInput, styles.brandingTextarea, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border }]}
              value={settings.languageSettings?.en?.appDescription || settings.appDescription}
              onChangeText={(text) => updateLanguageSettings('en', { appDescription: text })}
              placeholder="App description"
              placeholderTextColor={theme.textSecondary}
              multiline
            />
          </View>
        </View>

        {/* Arabic */}
        <View style={styles.brandingLang}>
          <Text style={[styles.brandingLangTitle, { color: theme.text, textAlign: 'right' }]}>🇸🇦 العربية</Text>
          <View style={styles.brandingInputGroup}>
            <Text style={[styles.brandingLabel, { color: theme.textSecondary, textAlign: 'right' }]}>اسم التطبيق</Text>
            <TextInput
              style={[styles.brandingInput, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border, textAlign: 'right' }]}
              value={settings.languageSettings?.ar?.appName || ''}
              onChangeText={(text) => updateLanguageSettings('ar', { appName: text })}
              placeholder="اسم التطبيق بالعربية"
              placeholderTextColor={theme.textSecondary}
            />
          </View>
          <View style={styles.brandingInputGroup}>
            <Text style={[styles.brandingLabel, { color: theme.textSecondary, textAlign: 'right' }]}>الوصف</Text>
            <TextInput
              style={[styles.brandingInput, styles.brandingTextarea, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border, textAlign: 'right' }]}
              value={settings.languageSettings?.ar?.appDescription || ''}
              onChangeText={(text) => updateLanguageSettings('ar', { appDescription: text })}
              placeholder="وصف التطبيق بالعربية"
              placeholderTextColor={theme.textSecondary}
              multiline
            />
          </View>
        </View>
      </View>

      {/* Logo & Favicon */}
      <View style={[styles.settingsSection, { backgroundColor: theme.card }]}>
        <View style={[styles.settingsSectionHeader, isRTL && styles.rtl]}>
          <ImageIcon size={22} color={theme.primary} />
          <Text style={[styles.settingsSectionTitle, { color: theme.text }]}>
            {language === 'ar' ? 'الشعار والأيقونة' : 'Logo & Favicon'}
          </Text>
        </View>
        
        <View style={styles.logoRow}>
          <View style={styles.logoUploadItem}>
            <Text style={[styles.logoUploadLabel, { color: theme.textSecondary }]}>
              {language === 'ar' ? 'شعار التطبيق' : 'App Logo'}
            </Text>
            <View style={[styles.logoPreviewContainer, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
              {settings.logo ? (
                <Image source={{ uri: settings.logo }} style={styles.logoPreviewImg} contentFit="contain" />
              ) : (
                <ImageIcon size={32} color={theme.textSecondary} />
              )}
            </View>
            <TouchableOpacity
              style={[styles.uploadBtn, { backgroundColor: theme.primary }]}
              onPress={() => {
                setUploadType('logo');
                setPhotoPickerVisible(true);
              }}
            >
              <ImageIcon size={16} color="#fff" />
              <Text style={styles.uploadBtnText}>
                {settings.logo ? (language === 'ar' ? 'تغيير' : 'Change') : (language === 'ar' ? 'رفع' : 'Upload')}
                        </Text>
            </TouchableOpacity>
                      </View>

          <View style={styles.logoUploadItem}>
            <Text style={[styles.logoUploadLabel, { color: theme.textSecondary }]}>
              {language === 'ar' ? 'الأيقونة المفضلة' : 'Favicon'}
            </Text>
            <View style={[styles.faviconPreviewContainer, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
              {settings.favicon ? (
                <Image source={{ uri: settings.favicon }} style={styles.faviconPreviewImg} contentFit="contain" />
              ) : (
                <ImageIcon size={20} color={theme.textSecondary} />
              )}
                          </View>
            <TouchableOpacity
              style={[styles.uploadBtn, { backgroundColor: theme.primary }]}
              onPress={() => {
                setUploadType('favicon');
                setPhotoPickerVisible(true);
              }}
            >
              <ImageIcon size={16} color="#fff" />
              <Text style={styles.uploadBtnText}>
                {settings.favicon ? (language === 'ar' ? 'تغيير' : 'Change') : (language === 'ar' ? 'رفع' : 'Upload')}
              </Text>
            </TouchableOpacity>
                          </View>
        </View>
      </View>

      {/* System Settings */}
      <View style={[styles.settingsSection, { backgroundColor: theme.card }]}>
        <View style={[styles.settingsSectionHeader, isRTL && styles.rtl]}>
          <Shield size={22} color={theme.primary} />
          <Text style={[styles.settingsSectionTitle, { color: theme.text }]}>
            {language === 'ar' ? 'إعدادات النظام' : 'System Settings'}
          </Text>
        </View>
        
        <View style={styles.systemSettingsList}>
          <View style={[styles.systemSettingItem, isRTL && styles.rtl]}>
            <Text style={[styles.systemSettingLabel, { color: theme.text }]}>
              {language === 'ar' ? 'وضع الصيانة' : 'Maintenance Mode'}
            </Text>
            <View style={[styles.systemSettingStatus, { backgroundColor: settings.maintenanceMode ? '#EF444420' : '#10B98120' }]}>
              {settings.maintenanceMode ? (
                <XCircle size={14} color="#EF4444" />
              ) : (
                <CheckCircle size={14} color="#10B981" />
              )}
              <Text style={[styles.systemSettingStatusText, { color: settings.maintenanceMode ? '#EF4444' : '#10B981' }]}>
                {settings.maintenanceMode ? 'ON' : 'OFF'}
              </Text>
                          </View>
          </View>
          <View style={[styles.systemSettingItem, isRTL && styles.rtl]}>
            <Text style={[styles.systemSettingLabel, { color: theme.text }]}>
              {language === 'ar' ? 'تسجيل المستخدمين' : 'User Registration'}
            </Text>
            <View style={[styles.systemSettingStatus, { backgroundColor: settings.allowRegistration ? '#10B98120' : '#EF444420' }]}>
              {settings.allowRegistration ? (
                <CheckCircle size={14} color="#10B981" />
              ) : (
                <XCircle size={14} color="#EF4444" />
              )}
              <Text style={[styles.systemSettingStatusText, { color: settings.allowRegistration ? '#10B981' : '#EF4444' }]}>
                {settings.allowRegistration ? (language === 'ar' ? 'مفعل' : 'Enabled') : (language === 'ar' ? 'معطل' : 'Disabled')}
              </Text>
                      </View>
          </View>
          <View style={[styles.systemSettingItem, isRTL && styles.rtl]}>
            <Text style={[styles.systemSettingLabel, { color: theme.text }]}>
              {language === 'ar' ? 'البريد الإلكتروني' : 'Support Email'}
                      </Text>
            <Text style={[styles.systemSettingValue, { color: theme.textSecondary }]}>
              {settings.supportEmail}
                      </Text>
                    </View>
                  </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.settingsActions}>
                  <TouchableOpacity
          style={[styles.settingsActionBtn, { backgroundColor: theme.primary }]}
          onPress={() => setSettingsModalVisible(true)}
        >
          <Edit size={18} color="#fff" />
          <Text style={styles.settingsActionBtnText}>
            {language === 'ar' ? 'تحرير الإعدادات' : 'Edit Settings'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.settingsActionBtn, { backgroundColor: theme.secondary }]}
          onPress={() => setLanguageSettingsModalVisible(true)}
                  >
          <Languages size={18} color="#fff" />
          <Text style={styles.settingsActionBtnText}>
            {language === 'ar' ? 'إعدادات اللغة' : 'Language Settings'}
          </Text>
                  </TouchableOpacity>
                </View>
              </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'countries':
        return renderCountries();
      case 'laws':
        return renderLaws();
      case 'categories':
        return renderCategories();
      case 'users':
        return renderUsers();
      case 'contact':
        return renderContact();
      case 'settings':
        return renderSettings();
      default:
        return renderDashboard();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <LinearGradient
        colors={[theme.primary, theme.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={[styles.headerContent, isRTL && styles.rtl]}>
          <View style={isRTL && { alignItems: 'flex-end' }}>
            <Text style={styles.headerTitle}>
              {language === 'ar' ? 'لوحة الإدارة' : 'Admin Panel'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {language === 'ar' ? 'إدارة المحتوى والمستخدمين' : 'Manage content & users'}
            </Text>
          </View>
          <View style={[styles.headerStats, isRTL && styles.rtl]}>
            <View style={styles.headerStatItem}>
              <Text style={styles.headerStatValue}>{laws.length}</Text>
              <Text style={styles.headerStatLabel}>{language === 'ar' ? 'قانون' : 'Laws'}</Text>
            </View>
            <View style={styles.headerStatDivider} />
            <View style={styles.headerStatItem}>
              <Text style={styles.headerStatValue}>{users.length}</Text>
              <Text style={styles.headerStatLabel}>{language === 'ar' ? 'مستخدم' : 'Users'}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Navigation */}
      <View style={[styles.navContainer, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.navScroll}>
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            const IconComponent = item.icon;
            const unreadCount = item.id === 'contact' ? unreadMessages : 0;
            
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.navItem,
                  isActive && [styles.navItemActive, { backgroundColor: theme.primary }]
                ]}
                onPress={() => setActiveTab(item.id)}
                activeOpacity={0.7}
              >
                <View style={styles.navItemInner}>
                  <IconComponent size={18} color={isActive ? '#fff' : theme.textSecondary} />
                  <Text style={[
                    styles.navItemText,
                    { color: isActive ? '#fff' : theme.textSecondary }
                  ]}>
                    {language === 'ar' ? item.labelAr : item.label}
                  </Text>
                  {unreadCount > 0 && (
                    <View style={styles.navBadge}>
                      <Text style={styles.navBadgeText}>{unreadCount}</Text>
          </View>
        )}
                </View>
              </TouchableOpacity>
            );
          })}
      </ScrollView>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentInner}
      >
        {renderContent()}
      </ScrollView>

      {/* Modals */}
      <CountryFormModal
        visible={countryModalVisible}
        onClose={() => setCountryModalVisible(false)}
        onSave={handleSaveCountry}
        country={editingCountry}
      />

      <LawFormModal
        visible={lawModalVisible}
        onClose={() => setLawModalVisible(false)}
        onSave={handleSaveLaw}
        law={editingLaw}
      />

      <CategoryFormModal
        visible={categoryModalVisible}
        onClose={() => setCategoryModalVisible(false)}
        onSave={handleSaveCategory}
        category={editingCategory}
      />

      <SettingsEditorModal
        visible={settingsModalVisible}
        onClose={() => setSettingsModalVisible(false)}
      />

      <LanguageSettingsModal
        visible={languageSettingsModalVisible}
        onClose={() => setLanguageSettingsModalVisible(false)}
      />

      {editingUser && (
        <UserManagementModal
          visible={userModalVisible}
          onClose={() => {
            setUserModalVisible(false);
            setEditingUser(undefined);
          }}
          user={editingUser}
          onUpdate={updateAnyUser}
          onDelete={deleteUser}
          onBan={banUser}
          onUnban={unbanUser}
        />
      )}

      <PhotoPickerModal
        visible={photoPickerVisible}
        onClose={() => setPhotoPickerVisible(false)}
        onPhotoSelected={handlePhotoSelected}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 0 : 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  headerStatItem: {
    alignItems: 'center',
  },
  headerStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  headerStatLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  headerStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 16,
  },
  navContainer: {
    borderBottomWidth: 1,
  },
  navScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  navItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginRight: 8,
  },
  navItemActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  navItemInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navItemText: {
    fontSize: 14,
    fontWeight: '600',
  },
  navBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  navBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  contentInner: {
    paddingBottom: 100,
  },
  rtl: {
    flexDirection: 'row-reverse',
  },

  // Dashboard
  dashboardContainer: {
    padding: 16,
    gap: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: (SCREEN_WIDTH - 44) / 2,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -1,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
  },
  sectionCard: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionCardTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickActionItem: {
    width: (SCREEN_WIDTH - 64) / 2,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    gap: 10,
  },
  quickActionIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  activityValue: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 2,
  },
  messagePreviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    gap: 12,
  },
  messageAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageAvatarText: {
    fontSize: 16,
    fontWeight: '700',
  },
  messagePreviewContent: {
    flex: 1,
  },
  messagePreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  messagePreviewName: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  messagePreviewSubject: {
    fontSize: 13,
    marginTop: 3,
  },

  // List Containers
  listContainer: {
    padding: 16,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  listItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  listItemInfo: {
    gap: 4,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  listItemSubtitle: {
    fontSize: 13,
  },
  listItemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lawIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lawBadges: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  lawBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  lawBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    padding: 48,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },

  // Users
  userStats: {
    flexDirection: 'row',
    gap: 8,
  },
  userStatBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  userStatText: {
    fontSize: 12,
    fontWeight: '600',
  },
  userCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  userCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  userAvatarImg: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userAvatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarLetter: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 13,
    marginTop: 3,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  userMetaText: {
    fontSize: 12,
  },
  userMetaDot: {
    fontSize: 12,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  roleBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
  },
  userCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 5,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  manageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  manageBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },

  // Contact Messages
  unreadBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  messageCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  messageCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  messageSenderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  messageSenderAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageSenderInitial: {
    fontSize: 16,
    fontWeight: '700',
  },
  messageSenderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  messageSenderName: {
    fontSize: 15,
    fontWeight: '600',
  },
  messageSenderEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  messageDate: {
    fontSize: 11,
  },
  newBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  newBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
  repliedBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  repliedBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
  messageSubject: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  messageBody: {
    fontSize: 13,
    lineHeight: 20,
  },
  replyPreview: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
  },
  replyPreviewLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  replyPreviewText: {
    fontSize: 13,
    lineHeight: 18,
  },
  messageActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    flexWrap: 'wrap',
  },
  msgActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  msgActionText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Settings
  settingsSection: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  settingsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  settingsSectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  colorItem: {
    alignItems: 'center',
    gap: 8,
  },
  colorPreviewBox: {
    width: 50,
    height: 50,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  colorLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  colorValue: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  brandingLang: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  brandingLangTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 14,
  },
  brandingInputGroup: {
    marginBottom: 12,
  },
  brandingLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
  },
  brandingInput: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
  },
  brandingTextarea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  logoRow: {
    flexDirection: 'row',
    gap: 20,
  },
  logoUploadItem: {
    flex: 1,
    gap: 10,
  },
  logoUploadLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  logoPreviewContainer: {
    height: 100,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoPreviewImg: {
    width: '100%',
    height: '100%',
  },
  faviconPreviewContainer: {
    width: 64,
    height: 64,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  faviconPreviewImg: {
    width: '100%',
    height: '100%',
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  uploadBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  systemSettingsList: {
    gap: 12,
  },
  systemSettingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.03)',
  },
  systemSettingLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  systemSettingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 5,
  },
  systemSettingStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  systemSettingValue: {
    fontSize: 13,
  },
  settingsActions: {
    gap: 10,
    marginTop: 4,
  },
  settingsActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  settingsActionBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },

  // No Access
  noAccessContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noAccessGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  noAccessContent: {
    alignItems: 'center',
    padding: 32,
  },
  noAccessIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  noAccessTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 10,
  },
  noAccessText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});
