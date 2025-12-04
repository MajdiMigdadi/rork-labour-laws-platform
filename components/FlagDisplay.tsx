import { Text, StyleSheet } from 'react-native';

interface FlagDisplayProps {
  flag: string; // emoji flag
  size?: 'small' | 'medium' | 'large';
}

const SIZES = {
  small: 14,
  medium: 20,
  large: 28,
};

export default function FlagDisplay({ flag, size = 'medium' }: FlagDisplayProps) {
  const fontSize = SIZES[size];
  
  return (
    <Text style={[styles.flagEmoji, { fontSize }]}>
      {flag || '🏳️'}
    </Text>
  );
}

const styles = StyleSheet.create({
  flagEmoji: {
    lineHeight: undefined,
  },
});
