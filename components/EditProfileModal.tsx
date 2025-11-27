import { useState } from 'react';
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
} from 'react-native';
import { X, Camera, User as UserIcon, Mail, Phone, Briefcase, MapPin, Globe } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import PhotoPickerModal from '@/components/PhotoPickerModal';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function EditProfileModal({ visible, onClose }: EditProfileModalProps) {
  const { user, updateUser } = useAuth();
  const { isRTL } = useLanguage();

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [company, setCompany] = useState(user?.company || '');
  const [location, setLocation] = useState(user?.location || '');
  const [website, setWebsite] = useState(user?.website || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [isLoading, setIsLoading] = useState(false);
  const [photoPickerVisible, setPhotoPickerVisible] = useState(false);

  const handlePhotoSelected = (uri: string) => {
    setAvatar(uri);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    setIsLoading(true);
    try {
      const updates = {
        name: name.trim(),
        bio: bio.trim(),
        phone: phone.trim(),
        company: company.trim(),
        location: location.trim(),
        website: website.trim(),
        avatar: avatar || undefined,
      };

      await updateUser(updates);
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => onClose() },
      ]);
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

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={Colors.light.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isRTL && styles.rtlText]}>Edit Profile</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <UserIcon size={40} color={Colors.light.textSecondary} />
                </View>
              )}
              <TouchableOpacity
                style={styles.cameraButton}
                onPress={showPhotoOptions}
              >
                <Camera size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={[styles.avatarHint, isRTL && styles.rtlText]}>Tap to change photo</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, isRTL && styles.rtlText]}>Full Name *</Text>
              <View style={[styles.inputContainer, isRTL && styles.rtl]}>
                <UserIcon size={20} color={Colors.light.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, isRTL && styles.rtlText]}
                  placeholder="Enter your full name"
                  value={name}
                  onChangeText={setName}
                  placeholderTextColor={Colors.light.textSecondary}
                  textAlign={isRTL ? 'right' : 'left'}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, isRTL && styles.rtlText]}>Email</Text>
              <View style={[styles.inputContainer, styles.disabledInput, isRTL && styles.rtl]}>
                <Mail size={20} color={Colors.light.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.disabledText, isRTL && styles.rtlText]}
                  value={user?.email}
                  editable={false}
                  placeholderTextColor={Colors.light.textSecondary}
                  textAlign={isRTL ? 'right' : 'left'}
                />
              </View>
              <Text style={[styles.hint, isRTL && styles.rtlText]}>Email cannot be changed</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, isRTL && styles.rtlText]}>Bio</Text>
              <TextInput
                style={[styles.input, styles.textArea, isRTL && styles.rtlText]}
                placeholder="Tell us about yourself"
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={4}
                placeholderTextColor={Colors.light.textSecondary}
                textAlign={isRTL ? 'right' : 'left'}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, isRTL && styles.rtlText]}>Phone</Text>
              <View style={[styles.inputContainer, isRTL && styles.rtl]}>
                <Phone size={20} color={Colors.light.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, isRTL && styles.rtlText]}
                  placeholder="+1 (555) 123-4567"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholderTextColor={Colors.light.textSecondary}
                  textAlign={isRTL ? 'right' : 'left'}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, isRTL && styles.rtlText]}>Company</Text>
              <View style={[styles.inputContainer, isRTL && styles.rtl]}>
                <Briefcase size={20} color={Colors.light.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, isRTL && styles.rtlText]}
                  placeholder="Your company name"
                  value={company}
                  onChangeText={setCompany}
                  placeholderTextColor={Colors.light.textSecondary}
                  textAlign={isRTL ? 'right' : 'left'}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, isRTL && styles.rtlText]}>Location</Text>
              <View style={[styles.inputContainer, isRTL && styles.rtl]}>
                <MapPin size={20} color={Colors.light.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, isRTL && styles.rtlText]}
                  placeholder="City, Country"
                  value={location}
                  onChangeText={setLocation}
                  placeholderTextColor={Colors.light.textSecondary}
                  textAlign={isRTL ? 'right' : 'left'}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, isRTL && styles.rtlText]}>Website</Text>
              <View style={[styles.inputContainer, isRTL && styles.rtl]}>
                <Globe size={20} color={Colors.light.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, isRTL && styles.rtlText]}
                  placeholder="https://yourwebsite.com"
                  value={website}
                  onChangeText={setWebsite}
                  keyboardType="url"
                  autoCapitalize="none"
                  placeholderTextColor={Colors.light.textSecondary}
                  textAlign={isRTL ? 'right' : 'left'}
                />
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </ScrollView>

        <PhotoPickerModal
          visible={photoPickerVisible}
          onClose={() => setPhotoPickerVisible(false)}
          onPhotoSelected={handlePhotoSelected}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.light.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderStyle: 'dashed',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.light.backgroundSecondary,
  },
  avatarHint: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.text,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.light.text,
  },
  textArea: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.border,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  disabledInput: {
    backgroundColor: Colors.light.backgroundSecondary,
  },
  disabledText: {
    color: Colors.light.textSecondary,
  },
  hint: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: -4,
  },
  saveButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  rtl: {
    flexDirection: 'row-reverse',
  },
  rtlText: {
    textAlign: 'right',
  },
});
