import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';

// Redirect /auth to /(auth)/login
export default function AuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/(auth)/login');
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#6366F1" />
    </View>
  );
}
