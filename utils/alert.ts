import { Alert, Platform } from 'react-native';

interface AlertButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

export const showAlert = (
  title: string,
  message?: string,
  buttons?: AlertButton[]
) => {
  if (Platform.OS === 'web') {
    // For web, use window.confirm for destructive actions
    const hasDestructive = buttons?.some(b => b.style === 'destructive');
    const destructiveButton = buttons?.find(b => b.style === 'destructive');
    const cancelButton = buttons?.find(b => b.style === 'cancel');
    
    if (hasDestructive && destructiveButton) {
      const confirmed = window.confirm(`${title}\n\n${message || ''}`);
      if (confirmed) {
        destructiveButton.onPress?.();
      } else {
        cancelButton?.onPress?.();
      }
    } else if (buttons && buttons.length > 0) {
      // For non-destructive alerts with buttons
      window.alert(`${title}\n\n${message || ''}`);
      // Call the first non-cancel button's onPress
      const actionButton = buttons.find(b => b.style !== 'cancel');
      actionButton?.onPress?.();
    } else {
      window.alert(`${title}\n\n${message || ''}`);
    }
  } else {
    // For native platforms, use Alert.alert
    Alert.alert(title, message, buttons);
  }
};

export const showConfirm = (
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void,
  confirmText: string = 'OK',
  cancelText: string = 'Cancel'
) => {
  showAlert(title, message, [
    { text: cancelText, style: 'cancel', onPress: onCancel },
    { text: confirmText, style: 'destructive', onPress: onConfirm },
  ]);
};

export const showSuccess = (title: string, message?: string) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message || ''}`);
  } else {
    Alert.alert(title, message);
  }
};

