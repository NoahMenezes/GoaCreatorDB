import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Creator } from '@/constants/mock-data';
import { useTheme } from '@/hooks/use-theme';

interface CreatorSummaryPillProps {
  creator: Creator;
}

export function CreatorSummaryPill({ creator }: CreatorSummaryPillProps) {
  const theme = useTheme();

  return (
    <View style={[styles.creatorPill, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Image source={{ uri: creator.avatar }} style={styles.creatorAvatar} />
      <View style={styles.creatorMeta}>
        <Text style={[styles.creatorName, { color: theme.text }]}>{creator.name}</Text>
        <Text style={[styles.creatorHandle, { color: theme.textSecondary }]}>
          {creator.handle} • {creator.location}
        </Text>
      </View>
      <View
        style={[
          styles.badge,
          {
            backgroundColor:
              creator.collabType === 'BARTER FRIENDLY'
                ? theme.badgeBarterBg
                : theme.badgePaidBg,
            borderColor:
              creator.collabType === 'BARTER FRIENDLY'
                ? theme.badgeBarter
                : theme.badgePaid,
          },
        ]}>
        <Text
          style={[
            styles.badgeText,
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
  );
}

const styles = StyleSheet.create({
  creatorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 0,
    marginBottom: 18,
    gap: 12,
  },
  creatorAvatar: {
    width: 38,
    height: 38,
    borderRadius: 0,
  },
  creatorMeta: {
    flex: 1,
  },
  creatorName: {
    fontSize: 14,
    fontWeight: '700',
  },
  creatorHandle: {
    fontSize: 11,
    marginTop: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 0,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
