import { useEffect, useRef } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LeadCard } from '@/components/LeadCard';
import { useLeads } from '@/hooks/useLeads';
import type { Lead } from '@/types/lead';

function LiveDot({ connected }: { connected: boolean }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (connected) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.4, { duration: 700, easing: Easing.out(Easing.quad) }),
          withTiming(1, { duration: 700, easing: Easing.in(Easing.quad) })
        ),
        -1,
        false
      );
      opacity.value = withRepeat(
        withSequence(withTiming(0.4, { duration: 700 }), withTiming(1, { duration: 700 })),
        -1,
        false
      );
    } else {
      scale.value = withTiming(1);
      opacity.value = withTiming(0.4);
    }
  }, [connected]);

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.liveDot,
        { backgroundColor: connected ? '#22C55E' : '#EF4444' },
        dotStyle,
      ]}
    />
  );
}

function ConnectionBanner({ status }: { status: string }) {
  const color =
    status === 'connected' ? '#22C55E' : status === 'connecting' ? '#F59E0B' : '#EF4444';
  const label =
    status === 'connected'
      ? 'LIVE'
      : status === 'connecting'
        ? 'CONNECTING...'
        : 'DISCONNECTED';

  return (
    <View style={styles.connectionBanner}>
      <LiveDot connected={status === 'connected'} />
      <Text style={[styles.connectionLabel, { color }]}>{label}</Text>
    </View>
  );
}

function EmptyState({ status }: { status: string }) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 600 });
  }, []);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[styles.emptyContainer, style]}>
      <Text style={styles.emptyIcon}></Text>
      <Text style={styles.emptyTitle}>Waiting for leads...</Text>
      <Text style={styles.emptySubtitle}>
        {status === 'connected'
          ? 'Submit a lead via the Meta Lead Testing Tool\nor use the test button below'
          : 'Make sure your backend server is running\nand the app is connected'}
      </Text>
    </Animated.View>
  );
}

function LeadCount({ count }: { count: number }) {
  return (
    <View style={styles.countBadge}>
      <Text style={styles.countText}>{count}</Text>
    </View>
  );
}

export default function LeadsScreen() {
  const insets = useSafeAreaInsets();
  const { leads, status, newLeadId, sendTestLead } = useLeads();
  const listRef = useRef<FlatList>(null);
  const prevLeadCount = useRef(leads.length);

  useEffect(() => {
    if (leads.length > prevLeadCount.current && listRef.current) {
      listRef.current.scrollToOffset({ offset: 0, animated: true });
    }
    prevLeadCount.current = leads.length;
  }, [leads.length]);

  const renderLead = ({ item, index }: { item: Lead; index: number }) => (
    <LeadCard lead={item} isNew={item.id === newLeadId} index={index} />
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0B13" />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.metaLogo}>
            <Text style={styles.metaLogoText}>f</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Meta Leads</Text>
            <Text style={styles.headerSubtitle}>Real-time feed</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <ConnectionBanner status={status} />
          {leads.length > 0 && <LeadCount count={leads.length} />}
        </View>
      </View>

      <View style={styles.divider} />

      {leads.length === 0 ? (
        <EmptyState status={status} />
      ) : (
        <FlatList
          ref={listRef}
          data={leads}
          keyExtractor={(item) => item.id}
          renderItem={renderLead}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + (Platform.OS === 'android' ? 100 : 80) },
          ]}
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
        />
      )}

      {status === 'connected' && (
        <View style={[styles.testButtonWrapper, { bottom: insets.bottom + (Platform.OS === 'android' ? 90 : 70) }]}>
          <Pressable
            style={({ pressed }) => [styles.testButton, pressed && styles.testButtonPressed]}
            onPress={sendTestLead}
          >
            <Text style={styles.testButtonText}>Send Test Lead</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0B0B13',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaLogo: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#1877F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaLogoText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  headerTitle: {
    color: '#F0F0F8',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    color: '#5B5B78',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 6,
  },

  connectionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#161622',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#2A2A3A',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },

  countBadge: {
    backgroundColor: '#7C3AED',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: 'flex-end',
  },
  countText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },

  divider: {
    height: 1,
    backgroundColor: '#1E1E2E',
    marginHorizontal: 16,
    marginBottom: 8,
  },

  listContent: {
    paddingTop: 8,
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 52,
    marginBottom: 4,
  },
  emptyTitle: {
    color: '#F0F0F8',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubtitle: {
    color: '#5B5B78',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },

  testButtonWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  testButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 50,
    paddingHorizontal: 24,
    paddingVertical: 13,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  testButtonPressed: {
    backgroundColor: '#6D28D9',
    transform: [{ scale: 0.96 }],
  },
  testButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
