import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Camera, Image as ImageIcon, X } from 'lucide-react-native';
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

  const requestPermissions = async (type: 'camera' | 'library') => {
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
      const hasPermission = await requestPermissions('library');
      if (!hasPermission) {
        Alert.alert(
          'Permission Denied',
          'Photo library permission is required to choose photos.'
        );
        return;
      }

      setIsLoading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
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
      console.error('Error picking photo:', error);
      Alert.alert('Error', 'Failed to pick photo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Choose Photo</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={Colors.light.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.options}>
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
              <Text style={styles.optionText}>Choose from Library</Text>
            </TouchableOpacity>
          </View>
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
    width: '85%',
    maxWidth: 400,
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
    padding: 20,
    gap: 16,
    justifyContent: 'center',
  },
  option: {
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.text,
    textAlign: 'center',
  },
});
