import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { X } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { User, UserRole, UserLevel, UserStatus } from '@/types';
import { useTheme } from '@/hooks/useTheme';

interface UserManagementModalProps {
  visible: boolean;
  onClose: () => void;
  user: User;
  onUpdate: (userId: string, updates: Partial<User>) => Promise<boolean>;
  onDelete: (userId: string) => Promise<boolean>;
  onBan: (userId: string) => Promise<boolean>;
  onUnban: (userId: string) => Promise<boolean>;
}

export default function UserManagementModal({
  visible,
  onClose,
  user,
  onUpdate,
  onDelete,
  onBan,
  onUnban,
}: UserManagementModalProps) {
  const theme = useTheme();
  const [formData, setFormData] = useState<User>(user);

  useEffect(() => {
    if (visible) {
      setFormData(user);
    }
  }, [visible, user]);

  const handleSave = async () => {
    try {
      await onUpdate(user.id, formData);
      Alert.alert('Success', 'User updated successfully!');
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to update user');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await onDelete(user.id);
              Alert.alert('Success', 'User deleted successfully');
              onClose();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete user');
            }
          },
        },
      ]
    );
  };

  const handleBanToggle = async () => {
    if (user.status === 'banned') {
      Alert.alert(
        'Unban User',
        `Restore access for ${user.name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Unban',
            onPress: async () => {
              try {
                await onUnban(user.id);
                Alert.alert('Success', 'User unbanned successfully');
                onClose();
              } catch (error) {
                Alert.alert('Error', 'Failed to unban user');
              }
            },
          },
        ]
      );
    } else {
      Alert.alert(
        'Ban User',
        `Ban ${user.name} from accessing the platform?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Ban',
            style: 'destructive',
            onPress: async () => {
              try {
                await onBan(user.id);
                Alert.alert('Success', 'User banned successfully');
                onClose();
              } catch (error) {
                Alert.alert('Error', 'Failed to ban user');
              }
            },
          },
        ]
      );
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Manage User</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={Colors.light.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>User Information</Text>
            
            <View style={styles.field}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Enter name"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                placeholder="Enter email"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.bio || ''}
                onChangeText={(text) => setFormData({ ...formData, bio: text })}
                placeholder="Enter bio"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Phone</Text>
              <TextInput
                style={styles.input}
                value={formData.phone || ''}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Company</Text>
              <TextInput
                style={styles.input}
                value={formData.company || ''}
                onChangeText={(text) => setFormData({ ...formData, company: text })}
                placeholder="Enter company"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Location</Text>
              <TextInput
                style={styles.input}
                value={formData.location || ''}
                onChangeText={(text) => setFormData({ ...formData, location: text })}
                placeholder="Enter location"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Website</Text>
              <TextInput
                style={styles.input}
                value={formData.website || ''}
                onChangeText={(text) => setFormData({ ...formData, website: text })}
                placeholder="https://example.com"
                keyboardType="url"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Permissions & Status</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Role</Text>
              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    formData.role === 'user' && { ...styles.optionButtonActive, backgroundColor: theme.primary, borderColor: theme.primary },
                  ]}
                  onPress={() => setFormData({ ...formData, role: 'user' })}
                >
                  <Text style={[styles.optionText, formData.role === 'user' && styles.optionTextActive]}>
                    User
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    formData.role === 'admin' && { ...styles.optionButtonActive, backgroundColor: theme.primary, borderColor: theme.primary },
                  ]}
                  onPress={() => setFormData({ ...formData, role: 'admin' })}
                >
                  <Text style={[styles.optionText, formData.role === 'admin' && styles.optionTextActive]}>
                    Admin
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Level</Text>
              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    formData.level === 'beginner' && { ...styles.optionButtonActive, backgroundColor: theme.secondary, borderColor: theme.secondary },
                  ]}
                  onPress={() => setFormData({ ...formData, level: 'beginner' })}
                >
                  <Text style={[styles.optionText, formData.level === 'beginner' && styles.optionTextActive]}>
                    Beginner
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    formData.level === 'intermediate' && { ...styles.optionButtonActive, backgroundColor: theme.secondary, borderColor: theme.secondary },
                  ]}
                  onPress={() => setFormData({ ...formData, level: 'intermediate' })}
                >
                  <Text style={[styles.optionText, formData.level === 'intermediate' && styles.optionTextActive]}>
                    Intermediate
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    formData.level === 'expert' && { ...styles.optionButtonActive, backgroundColor: theme.secondary, borderColor: theme.secondary },
                  ]}
                  onPress={() => setFormData({ ...formData, level: 'expert' })}
                >
                  <Text style={[styles.optionText, formData.level === 'expert' && styles.optionTextActive]}>
                    Expert
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Status</Text>
              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    formData.status === 'active' && { ...styles.optionButtonActive, backgroundColor: Colors.light.success, borderColor: Colors.light.success },
                  ]}
                  onPress={() => setFormData({ ...formData, status: 'active' })}
                >
                  <Text style={[styles.optionText, formData.status === 'active' && styles.optionTextActive]}>
                    Active
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    formData.status === 'suspended' && { ...styles.optionButtonActive, backgroundColor: Colors.light.warning, borderColor: Colors.light.warning },
                  ]}
                  onPress={() => setFormData({ ...formData, status: 'suspended' })}
                >
                  <Text style={[styles.optionText, formData.status === 'suspended' && styles.optionTextActive]}>
                    Suspended
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    formData.status === 'banned' && { ...styles.optionButtonActive, backgroundColor: Colors.light.error, borderColor: Colors.light.error },
                  ]}
                  onPress={() => setFormData({ ...formData, status: 'banned' })}
                >
                  <Text style={[styles.optionText, formData.status === 'banned' && styles.optionTextActive]}>
                    Banned
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Reputation Points</Text>
              <TextInput
                style={styles.input}
                value={formData.reputation.toString()}
                onChangeText={(text) => {
                  const rep = parseInt(text);
                  setFormData({ ...formData, reputation: isNaN(rep) ? 0 : rep });
                }}
                placeholder="0"
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Admin Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.notes || ''}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                placeholder="Internal notes about this user"
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Details</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>User ID:</Text>
              <Text style={styles.infoValue}>{user.id}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Joined:</Text>
              <Text style={styles.infoValue}>
                {new Date(user.joinedDate).toLocaleDateString()}
              </Text>
            </View>
            {user.lastLogin && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Last Login:</Text>
                <Text style={styles.infoValue}>
                  {new Date(user.lastLogin).toLocaleString()}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.primary }]} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.banButton,
                { 
                  backgroundColor: user.status === 'banned' ? Colors.light.success : Colors.light.warning,
                  borderColor: user.status === 'banned' ? Colors.light.success : Colors.light.warning,
                }
              ]}
              onPress={handleBanToggle}
            >
              <Text style={styles.banButtonText}>
                {user.status === 'banned' ? 'Unban User' : 'Ban User'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Text style={styles.deleteButtonText}>Delete User</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.light.text,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginBottom: 16,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.light.text,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.card,
  },
  optionButtonActive: {},
  optionText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.text,
  },
  optionTextActive: {
    color: '#fff',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    color: Colors.light.text,
  },
  actions: {
    gap: 12,
    marginBottom: 40,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
  banButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  banButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
  deleteButton: {
    backgroundColor: Colors.light.card,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.error,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.error,
  },
});
