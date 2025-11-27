import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import Colors from '@/constants/colors';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <View style={styles.container}>
        <AlertTriangle size={64} color={Colors.light.textSecondary} />
        <Text style={styles.title}>Page Not Found</Text>
        <Text style={styles.subtitle}>
          The page you&apos;re looking for doesn&apos;t exist.
        </Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go to Home</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  link: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
  },
  linkText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
});
