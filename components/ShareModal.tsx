import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Share,
  Alert,
  Linking,
  Animated,
  Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import {
  X,
  Share2,
  Copy,
  MessageCircle,
  Mail,
  Twitter,
  Linkedin,
  Facebook,
  Check,
  Link,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { useLanguage } from '@/contexts/LanguageContext';

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  content: string;
  type: 'law' | 'question';
  url?: string;
}

interface ShareOption {
  id: string;
  label: string;
  icon: any;
  color: string;
  bgColor: string;
  action: () => void;
}

export default function ShareModal({ visible, onClose, title, content, type, url }: ShareModalProps) {
  const theme = useTheme();
  const { t, isRTL } = useLanguage();
  const [copied, setCopied] = useState(false);

  const shareText = `${title}\n\n${content.substring(0, 200)}${content.length > 200 ? '...' : ''}\n\n${url || 'Labour Law Hub App'}`;
  const encodedText = encodeURIComponent(shareText);
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url || 'https://labourlawapp.com');

  const handleNativeShare = async () => {
    try {
      await Share.share({
        message: shareText,
        title: title,
      });
      onClose();
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleCopyLink = async () => {
    try {
      await Clipboard.setStringAsync(shareText);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        onClose();
      }, 1500);
    } catch (error) {
      Alert.alert('Error', 'Failed to copy to clipboard');
    }
  };

  const handleWhatsApp = async () => {
    const whatsappUrl = `whatsapp://send?text=${encodedText}`;
    const canOpen = await Linking.canOpenURL(whatsappUrl);
    if (canOpen) {
      await Linking.openURL(whatsappUrl);
      onClose();
    } else {
      Alert.alert('WhatsApp not installed', 'Please install WhatsApp to share via this option.');
    }
  };

  const handleEmail = async () => {
    const emailUrl = `mailto:?subject=${encodedTitle}&body=${encodedText}`;
    await Linking.openURL(emailUrl);
    onClose();
  };

  const handleTwitter = async () => {
    const twitterText = `${title}\n\n${content.substring(0, 100)}...`;
    const twitterUrl = `twitter://post?message=${encodeURIComponent(twitterText)}`;
    const webUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}`;
    
    const canOpen = await Linking.canOpenURL(twitterUrl);
    if (canOpen) {
      await Linking.openURL(twitterUrl);
    } else {
      await Linking.openURL(webUrl);
    }
    onClose();
  };

  const handleLinkedIn = async () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    await Linking.openURL(linkedInUrl);
    onClose();
  };

  const handleFacebook = async () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`;
    await Linking.openURL(facebookUrl);
    onClose();
  };

  const shareOptions: ShareOption[] = [
    {
      id: 'native',
      label: t.shareMore || 'More Options',
      icon: Share2,
      color: '#6366f1',
      bgColor: '#eef2ff',
      action: handleNativeShare,
    },
    {
      id: 'copy',
      label: copied ? (t.copied || 'Copied!') : (t.copyLink || 'Copy Text'),
      icon: copied ? Check : Copy,
      color: copied ? '#22c55e' : '#64748b',
      bgColor: copied ? '#dcfce7' : '#f1f5f9',
      action: handleCopyLink,
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: MessageCircle,
      color: '#25D366',
      bgColor: '#dcfce7',
      action: handleWhatsApp,
    },
    {
      id: 'email',
      label: t.email || 'Email',
      icon: Mail,
      color: '#ea4335',
      bgColor: '#fef2f2',
      action: handleEmail,
    },
    {
      id: 'twitter',
      label: 'Twitter',
      icon: Twitter,
      color: '#1DA1F2',
      bgColor: '#e0f2fe',
      action: handleTwitter,
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      icon: Linkedin,
      color: '#0A66C2',
      bgColor: '#dbeafe',
      action: handleLinkedIn,
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <TouchableOpacity 
          activeOpacity={1} 
          style={[styles.container, { backgroundColor: theme.card }]}
        >
          {/* Header */}
          <View style={[styles.header, isRTL && styles.rtl]}>
            <View style={[styles.headerLeft, isRTL && styles.rtl]}>
              <LinearGradient
                colors={['#6366f1', '#8b5cf6']}
                style={styles.headerIcon}
              >
                <Share2 size={20} color="#fff" />
              </LinearGradient>
              <View>
                <Text style={[styles.headerTitle, { color: theme.text }]}>
                  {t.share || 'Share'}
                </Text>
                <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
                  {type === 'law' ? (t.shareLaw || 'Share this law') : (t.shareQuestion || 'Share this question')}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Preview */}
          <View style={[styles.preview, { backgroundColor: theme.backgroundSecondary }]}>
            <Text style={[styles.previewTitle, { color: theme.text }, isRTL && styles.rtlText]} numberOfLines={2}>
              {title}
            </Text>
            <Text style={[styles.previewContent, { color: theme.textSecondary }, isRTL && styles.rtlText]} numberOfLines={2}>
              {content}
            </Text>
          </View>

          {/* Share Options */}
          <View style={styles.optionsGrid}>
            {shareOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.optionItem}
                onPress={option.action}
                activeOpacity={0.7}
              >
                <View style={[styles.optionIcon, { backgroundColor: option.bgColor }]}>
                  <option.icon size={22} color={option.color} />
                </View>
                <Text style={[styles.optionLabel, { color: theme.text }]} numberOfLines={1}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Cancel Button */}
          <TouchableOpacity 
            style={[styles.cancelBtn, { backgroundColor: theme.backgroundSecondary }]}
            onPress={onClose}
          >
            <Text style={[styles.cancelText, { color: theme.textSecondary }]}>
              {t.cancel || 'Cancel'}
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
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
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  preview: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
  },
  previewTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  previewContent: {
    fontSize: 13,
    lineHeight: 18,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  optionItem: {
    width: '30%',
    alignItems: 'center',
    gap: 8,
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  cancelBtn: {
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
  },
  rtl: {
    flexDirection: 'row-reverse',
  },
  rtlText: {
    textAlign: 'right',
  },
});

