import { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { RefreshControl, RefreshControlProps } from 'react-native';
import * as Haptics from 'expo-haptics';
import { RefreshCw } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';

interface HapticRefreshControlProps extends Omit<RefreshControlProps, 'refreshing' | 'onRefresh'> {
  refreshing: boolean;
  onRefresh: () => Promise<void> | void;
  showCustomIndicator?: boolean;
}

// Custom animated refresh indicator
export function CustomRefreshIndicator({ 
  refreshing, 
  progress = 0 
}: { 
  refreshing: boolean; 
  progress?: number;
}) {
  const theme = useTheme();
  const spinAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (refreshing) {
      // Start spinning
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
      
      // Scale up
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }).start();
    } else {
      // Scale down
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
      spinAnim.setValue(0);
    }
  }, [refreshing]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!refreshing && progress === 0) return null;

  return (
    <Animated.View 
      style={[
        styles.customIndicator,
        {
          transform: [
            { scale: scaleAnim },
            { rotate: spin },
          ],
        },
      ]}
    >
      <View style={[styles.indicatorCircle, { backgroundColor: '#6366f1' }]}>
        <RefreshCw size={20} color="#fff" />
      </View>
    </Animated.View>
  );
}

// Hook for pull-to-refresh with haptics
export function useHapticRefresh(
  onRefresh: () => Promise<void> | void,
  options?: {
    enableHaptics?: boolean;
    hapticType?: 'light' | 'medium' | 'heavy' | 'success';
  }
) {
  const [refreshing, setRefreshing] = useState(false);
  const hasTriggeredHaptic = useRef(false);
  const { enableHaptics = true, hapticType = 'medium' } = options || {};

  const triggerHaptic = useCallback(async () => {
    if (!enableHaptics) return;
    
    try {
      switch (hapticType) {
        case 'light':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'success':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
      }
    } catch (error) {
      // Haptics not available
    }
  }, [enableHaptics, hapticType]);

  const handleRefresh = useCallback(async () => {
    if (refreshing) return;
    
    setRefreshing(true);
    await triggerHaptic();
    
    try {
      await onRefresh();
    } finally {
      // Success haptic
      if (enableHaptics) {
        try {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error) {
          // Haptics not available
        }
      }
      setRefreshing(false);
    }
  }, [onRefresh, refreshing, triggerHaptic, enableHaptics]);

  return {
    refreshing,
    handleRefresh,
    triggerHaptic,
  };
}

// Enhanced RefreshControl component
export default function HapticRefreshControl({
  refreshing,
  onRefresh,
  showCustomIndicator = false,
  ...props
}: HapticRefreshControlProps) {
  const theme = useTheme();
  const { refreshing: isRefreshing, handleRefresh } = useHapticRefresh(onRefresh);

  // Use internal state if external refreshing isn't controlled
  const actualRefreshing = refreshing !== undefined ? refreshing : isRefreshing;
  const actualOnRefresh = refreshing !== undefined ? async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    await onRefresh();
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
  } : handleRefresh;

  return (
    <RefreshControl
      refreshing={actualRefreshing}
      onRefresh={actualOnRefresh}
      tintColor="#6366f1"
      colors={['#6366f1', '#8b5cf6', '#a855f7']}
      progressBackgroundColor={theme.card}
      title={actualRefreshing ? "Refreshing..." : "Pull to refresh"}
      titleColor={theme.textSecondary}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  customIndicator: {
    position: 'absolute',
    top: 20,
    alignSelf: 'center',
    zIndex: 100,
  },
  indicatorCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});

