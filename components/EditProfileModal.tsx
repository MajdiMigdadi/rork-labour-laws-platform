import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X, Camera, User as UserIcon, Mail, Phone, Briefcase, MapPin, Globe, Check, FileText, Sparkles } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/hooks/useTheme';
import PhotoPickerModal from '@/components/PhotoPickerModal';
import { LinearGradient } from 'expo-linear-gradient';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function EditProfileModal({ visible, onClose }: EditProfileModalProps) {
  const { user, updateUser } = useAuth();
  const { t, isRTL } = useLanguage();
  const theme = useTheme();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [photoPickerVisible, setPhotoPickerVisible] = useState(false);

  // Sync state with user data when modal opens
  useEffect(() => {
    if (visible && user) {
      setName(user.name || '');
      setBio(user.bio || '');
      setPhone(user.phone || '');
      setCompany(user.company || '');
      setLocation(user.location || '');
      setWebsite(user.website || '');
      setAvatar(user.avatar || '');
    }
  }, [visible, user]);

  const handlePhotoSelected = (uri: string) => {
    console.log('Photo selected in EditProfileModal:', uri);
    setAvatar(uri);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    setIsLoading(true);
    try {
      const updates: Partial<{
        name: string;
        bio: string;
        phone: string;
        company: string;
        location: string;
        website: string;
        avatar: string;
      }> = {
        name: name.trim(),
      };

      // Only add non-empty fields
      if (bio.trim()) updates.bio = bio.trim();
      if (phone.trim()) updates.phone = phone.trim();
      if (company.trim()) updates.company = company.trim();
      if (location.trim()) updates.location = location.trim();
      if (website.trim()) updates.website = website.trim();
      if (avatar) updates.avatar = avatar;

      console.log('Saving user updates:', updates);
      
      const success = await updateUser(updates);
      console.log('Update result:', success);
      
      if (success) {
        Alert.alert('Success', 'Profile updated successfully', [
          { text: 'OK', onPress: () => onClose() },
        ]);
      } else {
        Alert.alert('Error', 'Failed to update profile');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const showPhotoOptions = () => {
    setPhotoPickerVisible(true);
  };

  const getLevelColor = (level: string) => {
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

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.card }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>{t.editProfile}</Text>
          <TouchableOpacity 
            onPress={handleSave} 
            style={[styles.saveHeaderBtn, isLoading && styles.saveHeaderBtnDisabled]}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#6366f1" />
            ) : (
              <Check size={24} color="#6366f1" />
            )}
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.content} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar Section with Gradient Background */}
          <LinearGradient
            colors={['#1e1b4b', '#312e81', '#4338ca']}
            style={styles.avatarSection}
          >
            <View style={styles.avatarPattern}>
              {[...Array(8)].map((_, i) => (
                <View key={i} style={[styles.patternDot, { left: `${10 + i * 12}%`, top: `${15 + (i % 4) * 20}%` }]} />
              ))}
            </View>
            
            <View style={styles.avatarWrapper}>
              <TouchableOpacity onPress={showPhotoOptions} activeOpacity={0.9}>
                {avatar ? (
                  <Image source={{ uri: avatar }} style={styles.avatar} />
                ) : user?.name ? (
                  <LinearGradient
                    colors={getLevelColor(user.level)}
                    style={styles.avatar}
                  >
                    <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
                  </LinearGradient>
                ) : (
                  <View style={[styles.avatar, styles.avatarPlaceholder]}>
                    <UserIcon size={40} color="rgba(255,255,255,0.5)" />
                  </View>
                )}
                <View style={styles.cameraButton}>
                  <Camera size={18} color="#fff" />
                </View>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.avatarHint}>
              <Sparkles size={14} color="#fbbf24" /> Tap photo to change
            </Text>
          </LinearGradient>

          {/* Form Sections */}
          <View style={styles.formContainer}>
            
            {/* Basic Info Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: '#eef2ff' }]}>
                  <UserIcon size={18} color="#6366f1" />
                </View>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Basic Information</Text>
              </View>
              
              <View style={[styles.card, { backgroundColor: theme.card }]}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: theme.textSecondary }]}>Full Name *</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                    placeholder="Enter your full name"
                    value={name}
                    onChangeText={setName}
                    placeholderTextColor={theme.textSecondary}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: theme.textSecondary }]}>Email</Text>
                  <View style={[styles.disabledInputContainer, { backgroundColor: theme.backgroundSecondary }]}>
                    <Mail size={18} color={theme.textSecondary} />
                    <Text style={[styles.disabledText, { color: theme.textSecondary }]}>{user?.email}</Text>
                  </View>
                  <Text style={[styles.hint, { color: theme.textSecondary }]}>Email cannot be changed</Text>
                </View>
              </View>
            </View>

            {/* About Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: '#fef3c7' }]}>
                  <FileText size={18} color="#f59e0b" />
                </View>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>About You</Text>
              </View>
              
              <View style={[styles.card, { backgroundColor: theme.card }]}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: theme.textSecondary }]}>Bio</Text>
                  <TextInput
                    style={[styles.textArea, { backgroundColor: theme.background, color: theme.text }]}
                    placeholder="Tell us about yourself..."
                    value={bio}
                    onChangeText={setBio}
                    multiline
                    numberOfLines={4}
                    placeholderTextColor={theme.textSecondary}
                    textAlignVertical="top"
                  />
                  <Text style={[styles.charCount, { color: theme.textSecondary }]}>{bio.length}/250</Text>
                </View>
              </View>
            </View>

            {/* Contact Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: '#d1fae5' }]}>
                  <Phone size={18} color="#10b981" />
                </View>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Contact Details</Text>
              </View>
              
              <View style={[styles.card, { backgroundColor: theme.card }]}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: theme.textSecondary }]}>Phone Number</Text>
                  <View style={[styles.inputWithIcon, { backgroundColor: theme.background }]}>
                    <Phone size={18} color={theme.textSecondary} />
                    <TextInput
                      style={[styles.inputInner, { color: theme.text }]}
                      placeholder="+1 (555) 123-4567"
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                      placeholderTextColor={theme.textSecondary}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: theme.textSecondary }]}>Website</Text>
                  <View style={[styles.inputWithIcon, { backgroundColor: theme.background }]}>
                    <Globe size={18} color={theme.textSecondary} />
                    <TextInput
                      style={[styles.inputInner, { color: theme.text }]}
                      placeholder="https://yourwebsite.com"
                      value={website}
                      onChangeText={setWebsite}
                      keyboardType="url"
                      autoCapitalize="none"
                      placeholderTextColor={theme.textSecondary}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Work Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: '#fce7f3' }]}>
                  <Briefcase size={18} color="#ec4899" />
                </View>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Work & Location</Text>
              </View>
              
              <View style={[styles.card, { backgroundColor: theme.card }]}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: theme.textSecondary }]}>Company</Text>
                  <View style={[styles.inputWithIcon, { backgroundColor: theme.background }]}>
                    <Briefcase size={18} color={theme.textSecondary} />
                    <TextInput
                      style={[styles.inputInner, { color: theme.text }]}
                      placeholder="Your company name"
                      value={company}
                      onChangeText={setCompany}
                      placeholderTextColor={theme.textSecondary}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: theme.textSecondary }]}>Location</Text>
                  <View style={[styles.inputWithIcon, { backgroundColor: theme.background }]}>
                    <MapPin size={18} color={theme.textSecondary} />
                    <TextInput
                      style={[styles.inputInner, { color: theme.text }]}
                      placeholder="City, Country"
                      value={location}
                      onChangeText={setLocation}
                      placeholderTextColor={theme.textSecondary}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={isLoading}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#6366f1', '#8b5cf6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveButtonGradient}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Check size={20} color="#fff" />
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

          </View>
        </ScrollView>

        <PhotoPickerModal
          visible={photoPickerVisible}
          onClose={() => setPhotoPickerVisible(false)}
          onPhotoSelected={handlePhotoSelected}
        />
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  saveHeaderBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  saveHeaderBtnDisabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // Avatar Section
  avatarSection: {
    paddingVertical: 40,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  avatarPattern: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  patternDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  avatarWrapper: {
    marginBottom: 12,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 42,
    fontWeight: '700',
    color: '#fff',
  },
  avatarPlaceholder: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarHint: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },

  // Form Container
  formContainer: {
    padding: 16,
    marginTop: -20,
  },

  // Section
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },

  // Card
  card: {
    borderRadius: 16,
    padding: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },

  // Input Group
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 14,
    gap: 10,
  },
  inputInner: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
  },
  textArea: {
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: -4,
  },
  disabledInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
  },
  disabledText: {
    fontSize: 16,
  },
  hint: {
    fontSize: 12,
    marginLeft: 4,
  },

  // Save Button
  saveButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});
