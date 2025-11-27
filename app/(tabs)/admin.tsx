import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
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
import CountryFormModal from '@/components/CountryFormModal';
import LawFormModal from '@/components/LawFormModal';
import CategoryFormModal from '@/components/CategoryFormModal';
import SettingsEditorModal from '@/components/SettingsEditorModal';
import UserManagementModal from '@/components/UserManagementModal';
import LanguageSettingsModal from '@/components/LanguageSettingsModal';
import PhotoPickerModal from '@/components/PhotoPickerModal';

type AdminTab = 'countries' | 'laws' | 'categories' | 'users' | 'settings' | 'contact';

export default function AdminScreen() {
  const [activeTab, setActiveTab] = useState<AdminTab>('countries');
  const { isAdmin } = useAuth();
  const { t, isRTL } = useLanguage();
  const { settings, updateSettings } = useSettings();
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
      <View style={styles.noAccessContainer}>
        <Shield size={64} color={Colors.light.textSecondary} />
        <Text style={styles.noAccessTitle}>{t.accessDenied}</Text>
        <Text style={styles.noAccessText}>
          {t.needAdminPrivileges}
        </Text>
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
    Alert.alert(
      t.deleteCountry,
      `${t.areYouSure} ${country.name}? ${t.deleteConfirm}`,
      [
        { text: t.cancel, style: 'cancel' },
        { 
          text: t.delete, 
          style: 'destructive', 
          onPress: async () => {
            await deleteCountry(country.id);
            Alert.alert(t.success, `${country.name} deleted`);
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
    Alert.alert(
      t.deleteLaw,
      `${t.areYouSure} ${law.title}? ${t.deleteConfirm}`,
      [
        { text: t.cancel, style: 'cancel' },
        { 
          text: t.delete, 
          style: 'destructive', 
          onPress: async () => {
            await deleteLaw(law.id);
            Alert.alert(t.success, `${law.title} deleted`);
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
    Alert.alert(
      t.deleteCategory,
      `${t.areYouSure} ${category.name}? ${t.deleteConfirm}`,
      [
        { text: t.cancel, style: 'cancel' },
        { 
          text: t.delete, 
          style: 'destructive', 
          onPress: async () => {
            await deleteCategory(category.id);
            Alert.alert(t.success, `${category.name} deleted`);
          } 
        },
      ]
    );
  };

  const getCountryName = (countryId: string) => {
    return countries.find(c => c.id === countryId)?.name || '';
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || '';
  };

  const handlePhotoSelected = async (uri: string) => {
    try {
      const fieldToUpdate = uploadType === 'logo' ? 'logo' : 'favicon';
      const success = await updateSettings({ [fieldToUpdate]: uri });
      if (success) {
        Alert.alert(t.success, `${uploadType === 'logo' ? 'Logo' : 'Favicon'} updated successfully`);
      } else {
        Alert.alert(t.error, 'Failed to update image');
      }
    } catch (error) {
      console.error('Error updating image:', error);
      Alert.alert(t.error, 'Failed to update image');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Globe size={24} color={theme.primary} />
            <Text style={styles.statNumber}>{countries.length}</Text>
            <Text style={styles.statLabel}>{t.countries}</Text>
          </View>
          <View style={styles.statCard}>
            <FileText size={24} color={theme.secondary} />
            <Text style={styles.statNumber}>{laws.length}</Text>
            <Text style={styles.statLabel}>{t.laws}</Text>
          </View>
          <View style={styles.statCard}>
            <Tag size={24} color={theme.accent} />
            <Text style={styles.statNumber}>{categories.length}</Text>
            <Text style={styles.statLabel}>{t.categories}</Text>
          </View>
          <View style={styles.statCard}>
            <Users size={24} color={Colors.light.warning} />
            <Text style={styles.statNumber}>{users.length}</Text>
            <Text style={styles.statLabel}>{t.users}</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'countries' && { ...styles.activeTab, backgroundColor: theme.primary, borderColor: theme.primary }]}
              onPress={() => setActiveTab('countries')}
            >
              <Globe size={16} color={activeTab === 'countries' ? '#fff' : Colors.light.text} />
              <Text style={[styles.tabText, activeTab === 'countries' && styles.activeTabText]}>
                {t.countries}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'laws' && { ...styles.activeTab, backgroundColor: theme.primary, borderColor: theme.primary }]}
              onPress={() => setActiveTab('laws')}
            >
              <FileText size={16} color={activeTab === 'laws' ? '#fff' : Colors.light.text} />
              <Text style={[styles.tabText, activeTab === 'laws' && styles.activeTabText]}>
                {t.laws}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'categories' && { ...styles.activeTab, backgroundColor: theme.primary, borderColor: theme.primary }]}
              onPress={() => setActiveTab('categories')}
            >
              <Tag size={16} color={activeTab === 'categories' ? '#fff' : Colors.light.text} />
              <Text style={[styles.tabText, activeTab === 'categories' && styles.activeTabText]}>
                {t.categories}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'users' && { ...styles.activeTab, backgroundColor: theme.primary, borderColor: theme.primary }]}
              onPress={() => setActiveTab('users')}
            >
              <Users size={16} color={activeTab === 'users' ? '#fff' : Colors.light.text} />
              <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>
                {t.users}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'contact' && { ...styles.activeTab, backgroundColor: theme.primary, borderColor: theme.primary }]}
              onPress={() => setActiveTab('contact')}
            >
              <Mail size={16} color={activeTab === 'contact' ? '#fff' : Colors.light.text} />
              <Text style={[styles.tabText, activeTab === 'contact' && styles.activeTabText]}>
                Contact ({contactMessages.filter(m => m.status === 'unread').length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'settings' && { ...styles.activeTab, backgroundColor: theme.primary, borderColor: theme.primary }]}
              onPress={() => setActiveTab('settings')}
            >
              <SettingsIcon size={16} color={activeTab === 'settings' ? '#fff' : Colors.light.text} />
              <Text style={[styles.tabText, activeTab === 'settings' && styles.activeTabText]}>
                Settings
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'countries' && (
          <View style={styles.section}>
            <View style={[styles.sectionHeader, isRTL && styles.rtl]}>
              <Text style={styles.sectionTitle}>{t.manageCountries}</Text>
              <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.primary }]} onPress={handleAddCountry}>
                <Plus size={20} color="#fff" />
                <Text style={styles.addButtonText}>{t.add}</Text>
              </TouchableOpacity>
            </View>

            {countries.map(country => (
              <View key={country.id} style={styles.card}>
                <View style={[styles.cardHeader, isRTL && styles.rtl]}>
                  <View style={[styles.cardTitle, isRTL && styles.rtl]}>
                    <Text style={styles.countryFlag}>{country.flag}</Text>
                    <View>
                      <Text style={[styles.cardTitleText, isRTL && styles.rtl]}>{country.name}</Text>
                      <Text style={[styles.cardSubtext, isRTL && styles.rtl]}>{country.lawCount} {t.laws}</Text>
                    </View>
                  </View>
                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => handleEditCountry(country)}
                    >
                      <Edit size={18} color={theme.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => handleDeleteCountry(country)}
                    >
                      <Trash2 size={18} color={Colors.light.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'laws' && (
          <View style={styles.section}>
            <View style={[styles.sectionHeader, isRTL && styles.rtl]}>
              <Text style={styles.sectionTitle}>{t.manageLaws}</Text>
              <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.primary }]} onPress={handleAddLaw}>
                <Plus size={20} color="#fff" />
                <Text style={styles.addButtonText}>{t.add}</Text>
              </TouchableOpacity>
            </View>

            {laws.map(law => (
              <View key={law.id} style={styles.card}>
                <View style={[styles.cardHeader, isRTL && styles.rtl]}>
                  <View style={[styles.cardTitle, isRTL && styles.rtl]}>
                    <View style={styles.lawInfo}>
                      <Text style={[styles.cardTitleText, isRTL && styles.rtl]} numberOfLines={2}>
                        {law.title}
                      </Text>
                      <View style={[styles.lawBadges, isRTL && styles.rtl]}>
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>{getCountryName(law.countryId)}</Text>
                        </View>
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>{getCategoryName(law.categoryId)}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => handleEditLaw(law)}
                    >
                      <Edit size={18} color={theme.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => handleDeleteLaw(law)}
                    >
                      <Trash2 size={18} color={Colors.light.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'categories' && (
          <View style={styles.section}>
            <View style={[styles.sectionHeader, isRTL && styles.rtl]}>
              <Text style={styles.sectionTitle}>{t.manageCategories}</Text>
              <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.primary }]} onPress={handleAddCategory}>
                <Plus size={20} color="#fff" />
                <Text style={styles.addButtonText}>{t.add}</Text>
              </TouchableOpacity>
            </View>

            {categories.map(category => (
              <View key={category.id} style={styles.card}>
                <View style={[styles.cardHeader, isRTL && styles.rtl]}>
                  <View style={[styles.cardTitle, isRTL && styles.rtl]}>
                    <View style={styles.categoryIcon}>
                      <Tag size={20} color={theme.primary} />
                    </View>
                    <View>
                      <Text style={[styles.cardTitleText, isRTL && styles.rtl]}>{category.name}</Text>
                      <Text style={[styles.cardSubtext, isRTL && styles.rtl]}>Icon: {category.icon}</Text>
                    </View>
                  </View>
                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => handleEditCategory(category)}
                    >
                      <Edit size={18} color={theme.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => handleDeleteCategory(category)}
                    >
                      <Trash2 size={18} color={Colors.light.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'settings' && (
          <View style={styles.section}>
            <View style={[styles.sectionHeader, isRTL && styles.rtl]}>
              <Text style={styles.sectionTitle}>Platform Settings</Text>
            </View>

            <View style={styles.settingsCard}>
              <View style={styles.settingHeader}>
                <Palette size={24} color={theme.primary} />
                <Text style={styles.settingTitle}>Brand Colors</Text>
              </View>
              <View style={styles.colorGrid}>
                <View style={styles.colorItem}>
                  <Text style={styles.colorLabel}>Primary Color</Text>
                  <View style={styles.colorPreview}>
                    <View style={[styles.colorBox, { backgroundColor: settings.primaryColor }]} />
                    <Text style={styles.colorValue}>{settings.primaryColor}</Text>
                  </View>
                </View>
                <View style={styles.colorItem}>
                  <Text style={styles.colorLabel}>Secondary Color</Text>
                  <View style={styles.colorPreview}>
                    <View style={[styles.colorBox, { backgroundColor: settings.secondaryColor }]} />
                    <Text style={styles.colorValue}>{settings.secondaryColor}</Text>
                  </View>
                </View>
                <View style={styles.colorItem}>
                  <Text style={styles.colorLabel}>Accent Color</Text>
                  <View style={styles.colorPreview}>
                    <View style={[styles.colorBox, { backgroundColor: settings.accentColor }]} />
                    <Text style={styles.colorValue}>{settings.accentColor}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.settingsCard}>
              <View style={styles.settingHeader}>
                <ImageIcon size={24} color={theme.primary} />
                <Text style={styles.settingTitle}>Branding</Text>
              </View>
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>App Name</Text>
                <Text style={styles.settingValue}>{settings.appName}</Text>
              </View>
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Description</Text>
                <Text style={styles.settingValue}>{settings.appDescription}</Text>
              </View>
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Footer Text</Text>
                <Text style={styles.settingValue}>{settings.footerText}</Text>
              </View>
            </View>

            <View style={styles.settingsCard}>
              <View style={styles.settingHeader}>
                <ImageIcon size={24} color={theme.primary} />
                <Text style={styles.settingTitle}>App Icon & Logo</Text>
              </View>
              
              <View style={styles.logoSection}>
                <View style={styles.logoItem}>
                  <Text style={styles.colorLabel}>App Logo</Text>
                  <View style={styles.logoPreviewContainer}>
                    {settings.logo ? (
                      <Image
                        source={{ uri: settings.logo }}
                        style={styles.logoPreview}
                        contentFit="contain"
                      />
                    ) : (
                      <View style={styles.logoPlaceholder}>
                        <ImageIcon size={32} color={Colors.light.textSecondary} />
                        <Text style={styles.logoPlaceholderText}>No logo</Text>
                      </View>
                    )}
                  </View>
                  <TouchableOpacity
                    style={[styles.uploadButton, { backgroundColor: theme.primary }]}
                    onPress={() => {
                      setUploadType('logo');
                      setPhotoPickerVisible(true);
                    }}
                  >
                    <ImageIcon size={16} color="#fff" />
                    <Text style={styles.uploadButtonText}>
                      {settings.logo ? 'Change Logo' : 'Upload Logo'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.logoItem}>
                  <Text style={styles.colorLabel}>Favicon</Text>
                  <View style={styles.faviconPreviewContainer}>
                    {settings.favicon ? (
                      <Image
                        source={{ uri: settings.favicon }}
                        style={styles.faviconPreview}
                        contentFit="contain"
                      />
                    ) : (
                      <View style={styles.faviconPlaceholder}>
                        <ImageIcon size={16} color={Colors.light.textSecondary} />
                      </View>
                    )}
                  </View>
                  <TouchableOpacity
                    style={[styles.uploadButton, { backgroundColor: theme.primary }]}
                    onPress={() => {
                      setUploadType('favicon');
                      setPhotoPickerVisible(true);
                    }}
                  >
                    <ImageIcon size={16} color="#fff" />
                    <Text style={styles.uploadButtonText}>
                      {settings.favicon ? 'Change Favicon' : 'Upload Favicon'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.settingsCard}>
              <View style={styles.settingHeader}>
                <Mail size={24} color={theme.primary} />
                <Text style={styles.settingTitle}>Contact & Email</Text>
              </View>
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Support Email</Text>
                <Text style={styles.settingValue}>{settings.supportEmail}</Text>
              </View>
              {settings.smtpHost && (
                <View style={styles.settingItem}>
                  <Text style={styles.settingLabel}>SMTP Configured</Text>
                  <View style={styles.badgeSuccess}>
                    <Text style={styles.badgeText}>Active</Text>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.settingsCard}>
              <View style={styles.settingHeader}>
                <Globe size={24} color={theme.primary} />
                <Text style={styles.settingTitle}>SEO Settings</Text>
              </View>
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>SEO Title</Text>
                <Text style={styles.settingValue}>{settings.seoTitle}</Text>
              </View>
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>SEO Description</Text>
                <Text style={styles.settingValue}>{settings.seoDescription}</Text>
              </View>
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Keywords</Text>
                <Text style={styles.settingValue}>{settings.seoKeywords}</Text>
              </View>
            </View>

            <View style={styles.settingsCard}>
              <View style={styles.settingHeader}>
                <Shield size={24} color={theme.primary} />
                <Text style={styles.settingTitle}>System Settings</Text>
              </View>
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Maintenance Mode</Text>
                <View style={settings.maintenanceMode ? styles.badgeError : styles.badgeSuccess}>
                  <Text style={styles.badgeText}>{settings.maintenanceMode ? 'ON' : 'OFF'}</Text>
                </View>
              </View>
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>User Registration</Text>
                <View style={settings.allowRegistration ? styles.badgeSuccess : styles.badgeError}>
                  <Text style={styles.badgeText}>{settings.allowRegistration ? 'Enabled' : 'Disabled'}</Text>
                </View>
              </View>
            </View>

            <View style={styles.settingsActions}>
              <TouchableOpacity style={[styles.editSettingsButton, { backgroundColor: theme.primary }]} onPress={() => setSettingsModalVisible(true)}>
                <Edit size={20} color="#fff" />
                <Text style={styles.editSettingsButtonText}>Edit Global Settings</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.editSettingsButton, { backgroundColor: theme.secondary }]} onPress={() => setLanguageSettingsModalVisible(true)}>
                <Languages size={20} color="#fff" />
                <Text style={styles.editSettingsButtonText}>Edit Language Settings</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === 'contact' && (
          <View style={styles.section}>
            <View style={[styles.sectionHeader, isRTL && styles.rtl]}>
              <Text style={styles.sectionTitle}>Contact Messages</Text>
            </View>

            {contactMessages.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Mail size={48} color={theme.textSecondary} />
                <Text style={[styles.emptyStateText, { color: theme.text }]}>No messages yet</Text>
                <Text style={[styles.emptyStateSubtext, { color: theme.textSecondary }]}>
                  Messages from the contact form will appear here
                </Text>
              </View>
            ) : (
              contactMessages.map(msg => (
                <View key={msg.id} style={[styles.card, { borderLeftWidth: 3, borderLeftColor: msg.status === 'unread' ? theme.primary : theme.border }]}>
                  <View style={styles.messageHeader}>
                    <View style={{ flex: 1 }}>
                      <View style={styles.messageMetaRow}>
                        <Text style={[styles.messageSender, { color: theme.text }]}>{msg.name}</Text>
                        {msg.status === 'unread' && (
                          <View style={[styles.unreadBadge, { backgroundColor: theme.primary }]}>
                            <Text style={styles.unreadBadgeText}>NEW</Text>
                          </View>
                        )}
                        {msg.status === 'replied' && (
                          <View style={[styles.repliedBadge, { backgroundColor: theme.success }]}>
                            <Text style={styles.repliedBadgeText}>REPLIED</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.messageEmail, { color: theme.textSecondary }]}>{msg.email}</Text>
                      <Text style={[styles.messageSubject, { color: theme.text }]}>{msg.subject}</Text>
                      <Text style={[styles.messageDate, { color: theme.textSecondary }]}>
                        {new Date(msg.createdAt).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.messageContent, { color: theme.text }]}>{msg.message}</Text>
                  {msg.adminReply && (
                    <View style={[styles.replyContainer, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
                      <Text style={[styles.replyLabel, { color: theme.textSecondary }]}>Your Reply:</Text>
                      <Text style={[styles.replyText, { color: theme.text }]}>{msg.adminReply}</Text>
                      <Text style={[styles.replyDate, { color: theme.textSecondary }]}>
                        Replied on {new Date(msg.repliedAt!).toLocaleString()}
                      </Text>
                    </View>
                  )}
                  <View style={styles.messageActions}>
                    {msg.status === 'unread' && (
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: theme.primary }]}
                        onPress={() => markAsRead(msg.id)}
                      >
                        <Text style={styles.actionButtonText}>Mark as Read</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: theme.secondary }]}
                      onPress={() => {
                        Alert.prompt(
                          'Reply to Message',
                          `Reply to ${msg.name}:`,
                          [
                            { text: 'Cancel', style: 'cancel' },
                            {
                              text: 'Send Reply',
                              onPress: async (text: string | undefined) => {
                                if (text && text.trim()) {
                                  await replyToMessage(msg.id, text.trim());
                                  Alert.alert('Success', 'Reply sent successfully');
                                }
                              },
                            },
                          ],
                          'plain-text',
                          msg.adminReply || ''
                        );
                      }}
                    >
                      <Text style={styles.actionButtonText}>
                        {msg.adminReply ? 'Update Reply' : 'Reply'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: Colors.light.error }]}
                      onPress={() => {
                        Alert.alert(
                          'Delete Message',
                          'Are you sure you want to delete this message?',
                          [
                            { text: 'Cancel', style: 'cancel' },
                            {
                              text: 'Delete',
                              style: 'destructive',
                              onPress: async () => {
                                await deleteContactMessage(msg.id);
                                Alert.alert('Success', 'Message deleted');
                              },
                            },
                          ]
                        );
                      }}
                    >
                      <Trash2 size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'users' && (
          <View style={styles.section}>
            <View style={[styles.sectionHeader, isRTL && styles.rtl]}>
              <Text style={styles.sectionTitle}>{t.manageUsers}</Text>
            </View>

            {users.map(user => (
              <View key={user.id} style={styles.card}>
                <View style={[styles.cardHeader, isRTL && styles.rtl]}>
                  <View style={[styles.cardTitle, isRTL && styles.rtl]}>
                    {user.avatar ? (
                      <Image
                        source={{ uri: user.avatar }}
                        style={styles.userAvatarImage}
                        contentFit="cover"
                      />
                    ) : (
                      <View
                        style={[
                          styles.userAvatar,
                          { backgroundColor: user.role === 'admin' ? theme.primary : theme.secondary },
                        ]}
                      >
                        <Text style={styles.userAvatarText}>
                          {user.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <View style={styles.userNameRow}>
                        <Text style={[styles.cardTitleText, isRTL && styles.rtl]}>{user.name}</Text>
                        {user.role === 'admin' && (
                          <View style={[styles.adminBadge, { backgroundColor: theme.primary }]}>
                            <Shield size={10} color="#fff" />
                            <Text style={styles.adminBadgeText}>{t.admin.toUpperCase()}</Text>
                          </View>
                        )}
                        {user.status === 'banned' && (
                          <View style={[styles.bannedBadge, { backgroundColor: Colors.light.error }]}>
                            <Ban size={10} color="#fff" />
                            <Text style={styles.bannedBadgeText}>BANNED</Text>
                          </View>
                        )}
                        {user.status === 'suspended' && (
                          <View style={[styles.suspendedBadge, { backgroundColor: Colors.light.warning }]}>
                            <Text style={styles.suspendedBadgeText}>SUSPENDED</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.cardSubtext, isRTL && styles.rtl]}>{user.email}</Text>
                      <Text style={[styles.cardSubtext, isRTL && styles.rtl]}>
                        {t.level}: {user.level} • {user.reputation} {t.reputation}
                      </Text>
                      <Text style={[styles.cardSubtext, isRTL && styles.rtl]}>
                        Joined: {new Date(user.joinedDate).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[styles.manageButton, { backgroundColor: theme.primary }]}
                    onPress={() => {
                      setEditingUser(user);
                      setUserModalVisible(true);
                    }}
                  >
                    <UserCog size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

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
    backgroundColor: Colors.light.backgroundSecondary,
  },
  header: {
    backgroundColor: Colors.light.background,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.light.backgroundSecondary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.backgroundSecondary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  activeTab: {},
  tabText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.light.text,
  },
  activeTabText: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  rtl: {
    flexDirection: 'row-reverse',
    textAlign: 'right',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.light.text,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  countryFlag: {
    fontSize: 32,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitleText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  cardSubtext: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  lawInfo: {
    flex: 1,
  },
  lawBadges: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  badge: {
    backgroundColor: Colors.light.backgroundSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    color: Colors.light.text,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userAvatarText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  adminBadgeText: {
    fontSize: 9,
    fontWeight: '700' as const,
    color: '#fff',
  },
  noAccessContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  noAccessTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginTop: 16,
  },
  noAccessText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  settingsCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  settingTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.light.text,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.backgroundSecondary,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.light.textSecondary,
    flex: 1,
  },
  settingValue: {
    fontSize: 14,
    color: Colors.light.text,
    flex: 2,
    textAlign: 'right',
  },
  colorGrid: {
    gap: 16,
  },
  colorItem: {
    gap: 8,
  },
  colorLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.light.textSecondary,
  },
  colorPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  colorBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  colorValue: {
    fontSize: 13,
    fontFamily: 'monospace',
    color: Colors.light.text,
  },
  badgeSuccess: {
    backgroundColor: Colors.light.success,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeError: {
    backgroundColor: Colors.light.error,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  settingsActions: {
    gap: 12,
    marginTop: 8,
  },
  editSettingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  editSettingsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  bannedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  bannedBadgeText: {
    fontSize: 9,
    fontWeight: '700' as const,
    color: '#fff',
  },
  suspendedBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  suspendedBadgeText: {
    fontSize: 9,
    fontWeight: '700' as const,
    color: '#fff',
  },
  manageButton: {
    padding: 10,
    borderRadius: 8,
  },
  logoSection: {
    gap: 20,
  },
  logoItem: {
    gap: 12,
  },
  logoPreviewContainer: {
    width: '100%',
    height: 120,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    overflow: 'hidden',
  },
  logoPreview: {
    width: '100%',
    height: '100%',
  },
  logoPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoPlaceholderText: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  faviconPreviewContainer: {
    width: 64,
    height: 64,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    overflow: 'hidden',
  },
  faviconPreview: {
    width: '100%',
    height: '100%',
  },
  faviconPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  emptyState: {
    padding: 48,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  messageHeader: {
    marginBottom: 12,
  },
  messageMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  messageSender: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  messageEmail: {
    fontSize: 13,
    marginBottom: 4,
  },
  messageSubject: {
    fontSize: 15,
    fontWeight: '600' as const,
    marginTop: 4,
  },
  messageDate: {
    fontSize: 12,
    marginTop: 4,
  },
  messageContent: {
    fontSize: 14,
    lineHeight: 22,
    marginVertical: 12,
  },
  messageActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600' as const,
  },
  unreadBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  unreadBadgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#fff',
  },
  repliedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  repliedBadgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#fff',
  },
  replyContainer: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
  },
  replyLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    marginBottom: 6,
  },
  replyText: {
    fontSize: 14,
    lineHeight: 20,
  },
  replyDate: {
    fontSize: 11,
    marginTop: 6,
  },
});
