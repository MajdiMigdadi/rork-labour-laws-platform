import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  Platform,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Camera, Image as ImageIcon, X, Link, Check } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import Colors from '@/constants/colors';

interface PhotoPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onPhotoSelected: (uri: string) => void;
}

export default function PhotoPickerModal({
  visible,
  onClose,
  onPhotoSelected,
}: PhotoPickerModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const requestPermissions = async (type: 'camera' | 'library') => {
    if (Platform.OS === 'web') {
      return true; // Web doesn't need explicit permissions
    }
    if (type === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      return status === 'granted';
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      return status === 'granted';
    }
  };

  const handleTakePhoto = async () => {
    try {
      const hasPermission = await requestPermissions('camera');
      if (!hasPermission) {
        Alert.alert(
          'Permission Denied',
          'Camera permission is required to take photos.'
        );
        return;
      }

      setIsLoading(true);
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onPhotoSelected(result.assets[0].uri);
        onClose();
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChooseFromLibrary = async () => {
    try {
      setIsLoading(true);
      
      // For web, we don't need permissions
      if (Platform.OS !== 'web') {
        const hasPermission = await requestPermissions('library');
        if (!hasPermission) {
          Alert.alert(
            'Permission Denied',
            'Photo library permission is required to choose photos.'
          );
          setIsLoading(false);
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: Platform.OS === 'web', // Use base64 for web
      });

      if (!result.canceled && result.assets[0]) {
        // For web, use base64 data URI if available
        const uri = Platform.OS === 'web' && result.assets[0].base64
          ? `data:image/jpeg;base64,${result.assets[0].base64}`
          : result.assets[0].uri;
        onPhotoSelected(uri);
        onClose();
      }
    } catch (error) {
      console.error('Error picking photo:', error);
      Alert.alert('Error', 'Failed to pick photo. Try using an image URL instead.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUrlSubmit = () => {
    const url = imageUrl.trim();
    console.log('Submitting URL:', url);
    
    if (!url) {
      Alert.alert('Error', 'Please enter an image URL');
      return;
    }

    // Basic URL validation
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      Alert.alert('Error', 'Please enter a valid URL starting with http:// or https://');
      return;
    }

    console.log('Calling onPhotoSelected with:', url);
    onPhotoSelected(url);
    setImageUrl('');
    setShowUrlInput(false);
    onClose();
  };

  const handleClose = () => {
    setShowUrlInput(false);
    setImageUrl('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {showUrlInput ? 'Enter Image URL' : 'Choose Photo'}
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color={Colors.light.text} />
            </TouchableOpacity>
          </View>

          {showUrlInput ? (
            <View style={styles.urlInputSection}>
              <Text style={styles.urlHint}>
                Paste an image URL from the web
              </Text>
              <View style={styles.urlInputContainer}>
                <Link size={20} color={Colors.light.textSecondary} />
                <TextInput
                  style={styles.urlInput}
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChangeText={setImageUrl}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                  placeholderTextColor={Colors.light.textSecondary}
                />
              </View>
              <View style={styles.urlButtons}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setShowUrlInput(false)}
                >
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleUrlSubmit}
                >
                  <Check size={20} color="#fff" />
                  <Text style={styles.submitButtonText}>Use This Image</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.options}>
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={Colors.light.primary} />
                  <Text style={styles.loadingText}>Loading...</Text>
                </View>
              ) : (
                <>
                  {Platform.OS !== 'web' && (
                    <TouchableOpacity
                      style={styles.option}
                      onPress={handleTakePhoto}
                      disabled={isLoading}
                    >
                      <View style={[styles.iconContainer, { backgroundColor: Colors.light.primary }]}>
                        <Camera size={32} color="#fff" />
                      </View>
                      <Text style={styles.optionText}>Take Photo</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles.option}
                    onPress={handleChooseFromLibrary}
                    disabled={isLoading}
                  >
                    <View style={[styles.iconContainer, { backgroundColor: Colors.light.secondary }]}>
                      <ImageIcon size={32} color="#fff" />
                    </View>
                    <Text style={styles.optionText}>
                      {Platform.OS === 'web' ? 'Upload Image' : 'Choose from Library'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.option}
                    onPress={() => setShowUrlInput(true)}
                    disabled={isLoading}
                  >
                    <View style={[styles.iconContainer, { backgroundColor: '#10b981' }]}>
                      <Link size={32} color="#fff" />
                    </View>
                    <Text style={styles.optionText}>Use Image URL</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: Colors.light.background,
    borderRadius: 20,
    width: '90%',
    maxWidth: 420,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.light.text,
  },
  closeButton: {
    padding: 4,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 16,
    justifyContent: 'center',
  },
  option: {
    alignItems: 'center',
    gap: 12,
    minWidth: 100,
    maxWidth: 120,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  optionText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.light.text,
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  urlInputSection: {
    padding: 20,
    gap: 16,
  },
  urlHint: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  urlInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  urlInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.light.text,
  },
  urlButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  backButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.light.text,
  },
  submitButton: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#fff',
  },
});
