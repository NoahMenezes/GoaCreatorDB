import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';

export interface ProfileDetails {
  name: string;
  handle: string;
  avatar: string;
  location: string;
  bio: string;
  tier: string;
  stats: { label: string; value: string }[];
}

interface ProfileCardProps {
  profile: ProfileDetails;
  children?: React.ReactNode;
}

export function ProfileCard({ profile, children }: ProfileCardProps) {
  const theme = useTheme();

  return (
    <View style={[styles.profileCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      {children}

      {/* Avatar & Details */}
      <View style={styles.userRow}>
        <View style={styles.avatarBox}>
          <Image source={{ uri: profile.avatar }} style={styles.avatar} />
          <View style={[styles.verifiedCheck, { backgroundColor: theme.primary }]}>
            <Feather name="check" size={9} color="#FFFFFF" />
          </View>
        </View>

        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: theme.text }]}>{profile.name}</Text>
          <Text style={[styles.userHandle, { color: theme.primary }]}>{profile.handle}</Text>
          <View style={styles.locRow}>
            <Feather name="map-pin" size={11} color={theme.textSecondary} />
            <Text style={[styles.locText, { color: theme.textSecondary }]}>
              {profile.location}
            </Text>
          </View>
        </View>

        <View style={[styles.tierBadge, { backgroundColor: theme.primaryLight, borderColor: theme.primaryBorder }]}>
          <Text style={[styles.tierText, { color: theme.primary }]}>{profile.tier}</Text>
        </View>
      </View>

      <Text style={[styles.bioText, { color: theme.textSecondary }]}>{profile.bio}</Text>

      {/* Stats Row */}
      <View style={[styles.statsRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {profile.stats.map((s, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <View style={[styles.statSep, { backgroundColor: theme.border }]} />}
            <View style={styles.statCol}>
              <Text style={[styles.statVal, { color: theme.text }]}>{s.value}</Text>
              <Text style={[styles.statLbl, { color: theme.textSecondary }]}>{s.label}</Text>
            </View>
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    padding: 20,
    borderWidth: 1,
    borderRadius: 0,
    marginBottom: 24,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  avatarBox: {
    position: 'relative',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#EF1717',
  },
  verifiedCheck: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    width: 16,
    height: 16,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  userHandle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 1,
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locText: {
    fontSize: 11,
  },
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 0,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  tierText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  bioText: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 0,
    paddingVertical: 12,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 15,
    fontWeight: '800',
  },
  statLbl: {
    fontSize: 10,
    marginTop: 2,
  },
  statSep: {
    width: 1,
    height: '100%',
  },
});
