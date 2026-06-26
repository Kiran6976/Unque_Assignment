import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import type { Lead } from '@/types/lead';

interface LeadCardProps {
  lead: Lead;
  isNew: boolean;
  index: number;
}

function formatTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  } catch {
    return '—';
  }
}

function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// Deterministic color from name
const AVATAR_COLORS = [
  ['#7C3AED', '#A78BFA'],
  ['#0EA5E9', '#38BDF8'],
  ['#059669', '#34D399'],
  ['#DC2626', '#F87171'],
  ['#D97706', '#FCD34D'],
  ['#DB2777', '#F472B6'],
];

function getAvatarColors(name: string): [string, string] {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx] as [string, string];
}

export function LeadCard({ lead, isNew, index }: LeadCardProps) {
  const translateY = useSharedValue(-40);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.92);
  const glowOpacity = useSharedValue(0);
  const borderOpacity = useSharedValue(isNew ? 1 : 0);

  const [avatarFrom, avatarTo] = getAvatarColors(lead.name);

  useEffect(() => {
    const delay = index * 60;

    translateY.value = withDelay(delay, withSpring(0, { damping: 18, stiffness: 200 }));
    opacity.value = withDelay(delay, withTiming(1, { duration: 350, easing: Easing.out(Easing.cubic) }));
    scale.value = withDelay(delay, withSpring(1, { damping: 16, stiffness: 180 }));

    if (isNew) {
      glowOpacity.value = withSequence(
        withTiming(1, { duration: 200 }),
        withDelay(1800, withTiming(0, { duration: 800 }))
      );
      borderOpacity.value = withDelay(
        2600,
        withTiming(0, { duration: 400 })
      );
    }
  }, []);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const borderStyle = useAnimatedStyle(() => ({
    opacity: borderOpacity.value,
  }));

  return (
    <Animated.View style={[styles.wrapper, cardStyle]}>
      {/* Animated border for new leads */}
      <Animated.View style={[styles.newBorder, borderStyle]} pointerEvents="none" />

      {/* Glow overlay */}
      <Animated.View style={[styles.glowOverlay, glowStyle]} pointerEvents="none" />

      <View style={styles.card}>
        {/* Left: Avatar */}
        <View style={[styles.avatar, { backgroundColor: avatarFrom }]}>
          <Text style={styles.avatarText}>{getInitials(lead.name)}</Text>
        </View>

        {/* Center: Lead info */}
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {lead.name}
            </Text>
            {lead.isTest && (
              <View style={styles.testBadge}>
                <Text style={styles.testBadgeText}>TEST</Text>
              </View>
            )}
          </View>

          {lead.email ? (
            <Text style={styles.detail} numberOfLines={1}>
              ✉ {lead.email}
            </Text>
          ) : null}
          {lead.phone ? (
            <Text style={styles.detail} numberOfLines={1}>
              📱 {lead.phone}
            </Text>
          ) : null}
          {lead.city ? (
            <Text style={styles.detail} numberOfLines={1}>
              📍 {lead.city}
            </Text>
          ) : null}

          <Text style={styles.adName} numberOfLines={1}>
            {lead.adName}
          </Text>
        </View>

        {/* Right: Time */}
        <View style={styles.timeCol}>
          <Text style={styles.time}>{formatTime(lead.receivedAt)}</Text>
          <Text style={styles.date}>{formatDate(lead.receivedAt)}</Text>
          {isNew && (
            <View style={styles.newDot}>
              <View style={styles.newDotInner} />
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161622',
    borderRadius: 16,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: '#2A2A3A',
  },
  newBorder: {
    position: 'absolute',
    inset: 0,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#7C3AED',
    zIndex: 10,
  },
  glowOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(124,58,237,0.08)',
    borderRadius: 16,
    zIndex: 5,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    color: '#F0F0F8',
    fontSize: 15,
    fontWeight: '700',
    flexShrink: 1,
  },
  testBadge: {
    backgroundColor: '#7C3AED22',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: '#7C3AED55',
  },
  testBadgeText: {
    color: '#A78BFA',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  detail: {
    color: '#8B8BA0',
    fontSize: 12,
    marginTop: 1,
  },
  adName: {
    color: '#5B5B78',
    fontSize: 11,
    marginTop: 4,
    fontStyle: 'italic',
  },
  timeCol: {
    alignItems: 'flex-end',
    gap: 2,
    flexShrink: 0,
  },
  time: {
    color: '#A0A0B8',
    fontSize: 11,
    fontWeight: '600',
  },
  date: {
    color: '#5B5B78',
    fontSize: 10,
  },
  newDot: {
    marginTop: 6,
    alignItems: 'center',
  },
  newDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#7C3AED',
  },
});
