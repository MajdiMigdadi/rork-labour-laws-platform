import { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Pressable,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Plus, X, MessageCircle, BookOpen, Calculator } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

interface FABAction {
  id: string;
  icon: any;
  label: string;
  gradient: [string, string];
  onPress: () => void;
}

export default function FloatingActionButton() {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  
  // Hide FAB on auth pages, onboarding, landing, and for guests on profile
  const isAuthPage = pathname?.includes('/(auth)') || pathname?.includes('/auth') || pathname?.includes('/login');
  const isOnboarding = pathname?.includes('/onboarding') || pathname?.includes('/landing');
  const isGuestProfile = pathname?.includes('/profile') && !user;
  
  if (isAuthPage || isOnboarding || isGuestProfile) {
    return null;
  }
  const [isOpen, setIsOpen] = useState(false);
  
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const buttonAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  const openMenu = useCallback(() => {
    setIsOpen(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Animated.parallel([
      Animated.spring(rotateAnim, { 
        toValue: 1, 
        friction: 6,
        tension: 40,
        useNativeDriver: true 
      }),
      Animated.timing(backdropAnim, { 
        toValue: 1, 
        duration: 200, 
        useNativeDriver: true 
      }),
      ...buttonAnims.map((anim, i) =>
        Animated.spring(anim, { 
          toValue: 1, 
          friction: 6,
          tension: 50,
          delay: i * 40, 
          useNativeDriver: true 
        })
      ),
    ]).start();
  }, []);

  const closeMenu = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    Animated.parallel([
      Animated.spring(rotateAnim, { 
        toValue: 0, 
        friction: 6,
        tension: 40,
        useNativeDriver: true 
      }),
      Animated.timing(backdropAnim, { 
        toValue: 0, 
        duration: 150, 
        useNativeDriver: true 
      }),
      ...buttonAnims.map((anim, i) =>
        Animated.timing(anim, { 
          toValue: 0, 
          duration: 100, 
          useNativeDriver: true 
        })
      ),
    ]).start(() => {
      setIsOpen(false);
    });
  }, []);

  const toggleMenu = useCallback(() => {
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }, [isOpen, openMenu, closeMenu]);

  const handleAction = useCallback((action: FABAction) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    closeMenu();
    setTimeout(() => action.onPress(), 250);
  }, [closeMenu]);

  const actions: FABAction[] = [
    {
      id: 'ask',
      icon: MessageCircle,
      label: t.askQuestion || 'Ask Question',
      gradient: ['#6366f1', '#8b5cf6'],
      onPress: () => {
        if (user) {
          router.push('/(tabs)/ask-question');
        } else {
          router.push('/(auth)/login');
        }
      },
    },
    {
      id: 'laws',
      icon: BookOpen,
      label: t.browseLaws || 'Browse Laws',
      gradient: ['#10b981', '#059669'],
      onPress: () => router.push('/(tabs)/laws'),
    },
    {
      id: 'calc',
      icon: Calculator,
      label: t.calculatorTools || 'Calculators',
      gradient: ['#f59e0b', '#f97316'],
      onPress: () => router.push('/(tabs)/calculators'),
    },
  ];

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const backdropOpacity = backdropAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  return (
    <>
      {/* Backdrop - Only render when open */}
      {isOpen && (
        <Pressable 
          style={styles.backdropContainer}
          onPress={closeMenu}
        >
          <Animated.View 
            style={[
              styles.backdrop,
              { opacity: backdropOpacity }
            ]}
          />
        </Pressable>
      )}

      {/* FAB Container */}
      <View 
        style={[
          styles.container, 
          isRTL ? styles.containerLeft : styles.containerRight
        ]}
        pointerEvents="box-none"
      >
        {/* Action Buttons - Only interactive when open */}
        {actions.map((action, index) => {
          const IconComponent = action.icon;
          const translateY = buttonAnims[index].interpolate({
            inputRange: [0, 1],
            outputRange: [0, -(60 * (index + 1))],
          });

          return (
            <Animated.View
              key={action.id}
              style={[
                styles.actionButton,
                {
                  transform: [{ translateY }, { scale: buttonAnims[index] }],
                  opacity: buttonAnims[index],
                },
              ]}
              pointerEvents={isOpen ? 'auto' : 'none'}
            >
              <TouchableOpacity
                style={[
                  styles.actionButtonInner,
                  isRTL ? styles.actionButtonInnerRTL : styles.actionButtonInnerLTR,
                ]}
                onPress={() => handleAction(action)}
                activeOpacity={0.8}
                disabled={!isOpen}
              >
                <View style={[
                  styles.actionLabel, 
                  { backgroundColor: theme.card },
                  isRTL ? styles.actionLabelRTL : styles.actionLabelLTR,
                ]}>
                  <Text style={[styles.actionLabelText, { color: theme.text }]}>
                    {action.label}
                  </Text>
                </View>
                <LinearGradient colors={action.gradient} style={styles.actionIcon}>
                  <IconComponent size={20} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          );
        })}

        {/* Main FAB Button */}
        <TouchableOpacity 
          onPress={toggleMenu} 
          activeOpacity={0.9} 
          style={styles.fabWrapper}
        >
          <Animated.View style={{ transform: [{ rotate: rotation }] }}>
            <LinearGradient
              colors={isOpen ? ['#ef4444', '#dc2626'] : ['#6366f1', '#8b5cf6']}
              style={styles.fab}
            >
              {isOpen ? (
                <X size={24} color="#fff" />
              ) : (
                <Plus size={24} color="#fff" />
              )}
            </LinearGradient>
          </Animated.View>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  backdropContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 998,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  container: {
    position: 'absolute',
    bottom: 100,
    alignItems: 'center',
    zIndex: 999,
  },
  containerRight: {
    right: 20,
  },
  containerLeft: {
    left: 20,
  },
  fabWrapper: {
    alignItems: 'center',
  },
  fab: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  actionButton: {
    position: 'absolute',
    bottom: 0,
  },
  actionButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonInnerLTR: {
    flexDirection: 'row',
  },
  actionButtonInnerRTL: {
    flexDirection: 'row-reverse',
  },
  actionLabel: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  actionLabelLTR: {
    marginRight: 10,
  },
  actionLabelRTL: {
    marginLeft: 10,
  },
  actionLabelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
});
