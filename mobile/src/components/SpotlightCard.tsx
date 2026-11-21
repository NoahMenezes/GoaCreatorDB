import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Creator } from '@/constants/mock-data';
import { useTheme } from '@/hooks/use-theme';

interface SpotlightCardProps {
  creator: Creator;
  onPress: (creator: Creator) => void;
  onBookPress?: (creator: Creator) => void;
}

export function SpotlightCard({ creator, onPress, onBookPress }: SpotlightCardProps) {
  const theme = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={() => onPress(creator)}
      style={[
        styles.container,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
        },
      ]}>
      {/* Cover visual with cinematic gradient */}
      <View style={styles.imageWrapper}>
        <Image source={{ uri: creator.cover }} style={styles.image} resizeMode="cover" />
        <View style={styles.gradientOverlay} />

        {/* Top Badges */}
        <View style={styles.topRow}>
          <View style={[styles.badge, { backgroundColor: 'rgba(17,18,20,0.88)', borderColor: theme.border }]}>
            <Text style={styles.badgeText}>{creator.tag}</Text>
          </View>
          <View style={[styles.locationBadge, { backgroundColor: 'rgba(17,18,20,0.88)', borderColor: theme.border }]}>
            <Feather name="map-pin" size={11} color="#F5F5F5" />
            <Text style={styles.locationText}>{creator.location}</Text>
          </View>
        </View>

        {/* Bottom Details Overlay (like 'Jack John' in the design reference) */}
        <View style={styles.bottomOverlay}>
          <View style={styles.avatarRow}>
            <Image source={{ uri: creator.avatar }} style={styles.avatar} />
            <View>
              <Text style={styles.name}>{creator.name}</Text>
              <Text style={styles.handle}>{creator.handle}</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <Text style={styles.statPill}>{creator.followers} followers</Text>
            <Text style={styles.statDot}>•</Text>
            <Text style={styles.statPill}>{creator.engagement} engagement</Text>
          </View>

          {onBookPress && (
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => onBookPress(creator)}
              style={[styles.actionBtn, { backgroundColor: theme.primary }]}>
              <Text style={styles.actionBtnText}>Book Collaboration</Text>
              <Feather name="arrow-right" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 0,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 20,
  },
  imageWrapper: {
    height: 320,
    width: '100%',
    position: 'relative',
    backgroundColor: '#111214',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    backgroundColor: 'rgba(9,9,9,0.52)',
  },
  topRow: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 0,
    borderWidth: 1,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 0,
    borderWidth: 1,
  },
  locationText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  bottomOverlay: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: '#EF1717',
  },
  name: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  handle: {
    color: '#9497A8',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 1,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  statPill: {
    color: '#D1D5DB',
    fontSize: 12,
    fontWeight: '500',
  },
  statDot: {
    color: '#6B7280',
    fontSize: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 0,
    gap: 6,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});

