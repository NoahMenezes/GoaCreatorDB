import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Creator } from '@/constants/mock-data';
import { useTheme } from '@/hooks/use-theme';

interface CreatorCardProps {
  creator: Creator;
  onBookPress: (creator: Creator) => void;
  onCardPress?: (creator: Creator) => void;
}

export function CreatorCard({ creator, onBookPress, onCardPress }: CreatorCardProps) {
  const theme = useTheme();
  const [bookmarked, setBookmarked] = useState(false);

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={() => onCardPress?.(creator)}
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
        },
      ]}>
      {/* Cover Image & Badges */}
      <View style={styles.coverContainer}>
        <Image source={{ uri: creator.cover }} style={styles.coverImage} resizeMode="cover" />
        <View style={styles.coverOverlay} />

        {/* Niche & District pills */}
        <View style={styles.topBadgesRow}>
          <View style={[styles.pillBadge, { backgroundColor: 'rgba(0,0,0,0.65)' }]}>
            <Text style={styles.pillText}>{creator.tag}</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setBookmarked(!bookmarked)}
            style={[
              styles.bookmarkBtn,
              { backgroundColor: bookmarked ? theme.primary : 'rgba(0,0,0,0.6)' },
            ]}>
            <Feather
              name="bookmark"
              size={14}
              color={bookmarked ? '#FFFFFF' : '#FFFFFF'}
            />
          </TouchableOpacity>
        </View>

        {/* Collab model badge */}
        <View style={styles.bottomBadgesRow}>
          <View
            style={[
              styles.collabBadge,
              {
                backgroundColor:
                  creator.collabType === 'BARTER FRIENDLY'
                    ? theme.badgeBarterBg
                    : theme.badgePaidBg,
              },
            ]}>
            <Text
              style={[
                styles.collabBadgeText,
                {
                  color:
                    creator.collabType === 'BARTER FRIENDLY'
                      ? theme.badgeBarter
                      : theme.badgePaid,
                },
              ]}>
              {creator.collabType}
            </Text>
          </View>
        </View>
      </View>

      {/* Creator Details */}
      <View style={styles.content}>
        <View style={styles.profileRow}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: creator.avatar }} style={styles.avatar} />
            {creator.verified && (
              <View style={[styles.verifiedBadge, { backgroundColor: theme.primary }]}>
                <Feather name="check" size={10} color="#FFFFFF" />
              </View>
            )}
          </View>

          <View style={styles.infoCol}>
            <View style={styles.nameRow}>
              <Text style={[styles.nameText, { color: theme.text }]} numberOfLines={1}>
                {creator.name}
              </Text>
            </View>
            <Text style={[styles.handleText, { color: theme.secondary }]}>
              {creator.handle}
            </Text>
          </View>

          <View style={styles.locationPill}>
            <Feather name="map-pin" size={11} color={theme.textSecondary} />
            <Text style={[styles.locationText, { color: theme.textSecondary }]}>
              {creator.location}
            </Text>
          </View>
        </View>

        {/* Stats Row: Followers, Engagement, Min Rate */}
        <View style={[styles.statsRow, { borderColor: theme.border, backgroundColor: theme.surface }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.text }]}>{creator.followers}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Followers</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.primary }]}>{creator.engagement}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Engagement</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.text }]}>{creator.rate}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Starting Rate</Text>
          </View>
        </View>

        {/* Action Button: Book Collab */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => onBookPress(creator)}
          style={[styles.bookButton, { backgroundColor: theme.primary }]}>
          <Feather name="send" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.bookButtonText}>Send Collab Request</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  coverContainer: {
    height: 140,
    width: '100%',
    position: 'relative',
    backgroundColor: '#333',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  topBadgesRow: {
    position: 'absolute',
    top: 10,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pillBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  pillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  bookmarkBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBadgesRow: {
    position: 'absolute',
    bottom: 10,
    right: 12,
  },
  collabBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  collabBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  content: {
    padding: 14,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameText: {
    fontSize: 15,
    fontWeight: '700',
  },
  handleText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 1,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  locationText: {
    fontSize: 11,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 20,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
