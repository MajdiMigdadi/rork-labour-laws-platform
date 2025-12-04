import { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';

const { width } = Dimensions.get('window');

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

// Base Skeleton component with shimmer effect
export function Skeleton({ width: w = '100%', height = 20, borderRadius = 8, style }: SkeletonProps) {
  const theme = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  return (
    <View
      style={[
        styles.skeleton,
        {
          width: w,
          height,
          borderRadius,
          backgroundColor: theme.backgroundSecondary,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.shimmer,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <LinearGradient
          colors={[
            'transparent',
            'rgba(255, 255, 255, 0.15)',
            'transparent',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.shimmerGradient}
        />
      </Animated.View>
    </View>
  );
}

// Skeleton for Law/Question list item
export function SkeletonListItem() {
  const theme = useTheme();

  return (
    <View style={[styles.listItem, { backgroundColor: theme.card }]}>
      {/* Status line */}
      <View style={styles.statusLine}>
        <Skeleton width={4} height="100%" borderRadius={0} />
      </View>
      
      {/* Avatar/Flag */}
      <View style={styles.listItemAvatar}>
        <Skeleton width={40} height={40} borderRadius={12} />
      </View>
      
      {/* Content */}
      <View style={styles.listItemContent}>
        <View style={styles.listItemMeta}>
          <Skeleton width={60} height={14} borderRadius={4} />
          <Skeleton width={80} height={14} borderRadius={4} />
        </View>
        <Skeleton width="90%" height={16} borderRadius={4} style={{ marginTop: 6 }} />
        <Skeleton width="70%" height={14} borderRadius={4} style={{ marginTop: 6 }} />
      </View>
      
      {/* Actions */}
      <View style={styles.listItemActions}>
        <Skeleton width={32} height={32} borderRadius={8} />
      </View>
    </View>
  );
}

// Skeleton for Stats Card
export function SkeletonStatsCard() {
  return (
    <View style={styles.statsCard}>
      <View style={styles.statsRow}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.statItem}>
            <Skeleton width={28} height={28} borderRadius={8} />
            <View style={{ marginLeft: 8 }}>
              <Skeleton width={30} height={18} borderRadius={4} />
              <Skeleton width={40} height={12} borderRadius={4} style={{ marginTop: 4 }} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

// Skeleton for Filter chips
export function SkeletonFilterChips() {
  return (
    <View style={styles.filterRow}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} width={50} height={36} borderRadius={8} />
      ))}
    </View>
  );
}

// Skeleton for Category chips
export function SkeletonCategoryChips() {
  return (
    <View style={styles.filterRow}>
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} width={80 + i * 10} height={32} borderRadius={8} />
      ))}
    </View>
  );
}

// Full page skeleton for Laws list
export function SkeletonLawsList() {
  const theme = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
      {/* Stats */}
      <View style={[styles.section, { backgroundColor: theme.background }]}>
        <SkeletonStatsCard />
      </View>
      
      {/* Search */}
      <View style={[styles.section, { backgroundColor: theme.background }]}>
        <Skeleton width="100%" height={44} borderRadius={10} />
      </View>
      
      {/* Country filters */}
      <View style={[styles.section, { backgroundColor: theme.background }]}>
        <SkeletonFilterChips />
      </View>
      
      {/* Category filters */}
      <View style={[styles.section, { backgroundColor: theme.background, paddingTop: 0 }]}>
        <SkeletonCategoryChips />
      </View>
      
      {/* Sort bar */}
      <View style={[styles.sortBar, { backgroundColor: theme.background }]}>
        <View style={styles.sortButtons}>
          <Skeleton width={70} height={32} borderRadius={8} />
          <Skeleton width={70} height={32} borderRadius={8} />
        </View>
        <Skeleton width={30} height={20} borderRadius={4} />
      </View>
      
      {/* List items */}
      <View style={styles.listContainer}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <SkeletonListItem key={i} />
        ))}
      </View>
    </View>
  );
}

// Full page skeleton for Questions list
export function SkeletonQuestionsList() {
  const theme = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
      {/* Stats */}
      <View style={[styles.section, { backgroundColor: theme.background }]}>
        <SkeletonStatsCard />
      </View>
      
      {/* Search */}
      <View style={[styles.section, { backgroundColor: theme.background }]}>
        <Skeleton width="100%" height={44} borderRadius={10} />
      </View>
      
      {/* Country filters */}
      <View style={[styles.section, { backgroundColor: theme.background }]}>
        <SkeletonFilterChips />
      </View>
      
      {/* Category filters */}
      <View style={[styles.section, { backgroundColor: theme.background, paddingTop: 0 }]}>
        <SkeletonCategoryChips />
      </View>
      
      {/* Sort bar */}
      <View style={[styles.sortBar, { backgroundColor: theme.background }]}>
        <View style={styles.sortButtons}>
          <Skeleton width={60} height={32} borderRadius={8} />
          <Skeleton width={60} height={32} borderRadius={8} />
          <Skeleton width={80} height={32} borderRadius={8} />
        </View>
        <Skeleton width={30} height={20} borderRadius={4} />
      </View>
      
      {/* List items */}
      <View style={styles.listContainer}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <SkeletonListItem key={i} />
        ))}
      </View>
    </View>
  );
}

// Skeleton for detail page header
export function SkeletonDetailHeader() {
  const theme = useTheme();
  
  return (
    <View style={[styles.detailHeader, { backgroundColor: theme.card }]}>
      <Skeleton width="100%" height={60} borderRadius={14} style={{ marginBottom: 16 }} />
      <Skeleton width="80%" height={24} borderRadius={6} />
      <Skeleton width="60%" height={18} borderRadius={4} style={{ marginTop: 8 }} />
    </View>
  );
}

// Skeleton for home page cards
export function SkeletonHomeCard() {
  const theme = useTheme();
  
  return (
    <View style={[styles.homeCard, { backgroundColor: theme.card }]}>
      <Skeleton width={48} height={48} borderRadius={14} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Skeleton width="70%" height={18} borderRadius={4} />
        <Skeleton width="50%" height={14} borderRadius={4} style={{ marginTop: 6 }} />
      </View>
      <Skeleton width={24} height={24} borderRadius={6} />
    </View>
  );
}

// Skeleton for profile stats
export function SkeletonProfileStats() {
  return (
    <View style={styles.profileStats}>
      {[1, 2, 3, 4].map((i) => (
        <View key={i} style={styles.profileStatItem}>
          <Skeleton width={50} height={50} borderRadius={14} />
          <Skeleton width={40} height={24} borderRadius={4} style={{ marginTop: 8 }} />
          <Skeleton width={60} height={14} borderRadius={4} style={{ marginTop: 4 }} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
  shimmer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  shimmerGradient: {
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statsCard: {
    borderRadius: 14,
    padding: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sortBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  listContainer: {
    padding: 12,
    gap: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statusLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    overflow: 'hidden',
  },
  listItemAvatar: {
    marginLeft: 8,
    marginRight: 12,
  },
  listItemContent: {
    flex: 1,
  },
  listItemMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  listItemActions: {
    marginLeft: 8,
  },
  detailHeader: {
    padding: 16,
    borderRadius: 16,
    margin: 12,
  },
  homeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
  },
  profileStatItem: {
    alignItems: 'center',
  },
});

