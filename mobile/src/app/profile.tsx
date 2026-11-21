import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Header } from '@/components/Header';
import { AuthModal } from '@/components/AuthModal';
import { CyberGlowBackground } from '@/components/CyberGlowBackground';
import { useTheme } from '@/hooks/use-theme';
import { api } from '@/services/api';

export default function ProfileScreen() {
  const theme = useTheme();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [role, setRole] = useState<'creator' | 'business'>('business');

  useEffect(() => {
    api.getMe().then((data) => {
      if (data && data.authenticated && data.user) {
        setCurrentUser(data.user);
        if (data.user.role === 'creator') setRole('creator');
        if (data.user.role === 'business') setRole('business');
      }
    });
  }, []);

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
    Alert.alert('Signed Out', 'You have been logged out of GoaConnect.');
  };

  const profile = {
    name: currentUser?.email
      ? currentUser.email.split('@')[0]
      : role === 'business'
      ? 'Villa Morjim Heritage'
      : 'Sneha Ferns',
    handle: currentUser?.email
      ? `@${currentUser.email.split('@')[0]}`
      : role === 'business'
      ? '@villamorjim_goa'
      : '@sneha_demo',
    location: role === 'business' ? 'Morjim, North Goa' : 'Assagao, North Goa',
    avatar:
      role === 'business'
        ? 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=400&auto=format&fit=crop'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
    bio:
      role === 'business'
        ? 'Luxury beachfront heritage villa resort with private plunge pools, Goan dining, and sunset lawn events.'
        : 'Culinary explorer showcasing Goan heritage tavernas, seaside shacks, and vibrant cafe culture.',
    tier: role === 'business' ? 'Brand Partner' : 'Creator Pro',
    stats:
      role === 'business'
        ? [
            { label: 'Collabs Posted', value: '14' },
            { label: 'Completed', value: '11' },
            { label: 'Avg Rating', value: '4.9 ★' },
          ]
        : [
            { label: 'Followers', value: '120K' },
            { label: 'Engagement', value: '7.8%' },
            { label: 'Collabs Done', value: '38' },
          ],
  };

  const actionItems = [
    { icon: 'file-text' as const, label: role === 'business' ? 'Post New Campaign Brief' : 'My Live Media Kit & Rate Card' },
    { icon: 'bookmark' as const, label: 'Saved Creators & Shortlists' },
    { icon: 'credit-card' as const, label: 'Payment Terms & Milestone Escrow' },
    { icon: 'shield' as const, label: 'Verified Goa Badge Status' },
    { icon: 'settings' as const, label: 'Account & Notification Settings' },
    { icon: 'help-circle' as const, label: 'GoaCreatorDB Help & Support' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <CyberGlowBackground glowIntensity="subtle" />
      <Header user={currentUser} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {/* Role Switcher */}
          <View style={[styles.roleSwitch, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setRole('business')}
              style={[
                styles.roleOption,
                { backgroundColor: role === 'business' ? theme.primary : 'transparent' },
              ]}>
              <Text
                style={[
                  styles.roleOptionText,
                  { color: role === 'business' ? '#FFFFFF' : theme.textSecondary },
                ]}>
                🏨 Brand View
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setRole('creator')}
              style={[
                styles.roleOption,
                { backgroundColor: role === 'creator' ? theme.primary : 'transparent' },
              ]}>
              <Text
                style={[
                  styles.roleOptionText,
                  { color: role === 'creator' ? '#FFFFFF' : theme.textSecondary },
                ]}>
                ✨ Creator View
              </Text>
            </TouchableOpacity>
          </View>

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

        {/* Action Items List */}
        <View style={styles.actionsContainer}>
          <Text style={[styles.actionsHeader, { color: theme.textSecondary }]}>
            WORKSPACE &amp; MANAGEMENT
          </Text>

          {actionItems.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              activeOpacity={0.7}
              onPress={() => Alert.alert(item.label, 'This feature is fully enabled in GoaConnect.')}
              style={[
                styles.actionItem,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                },
              ]}>
              <View style={[styles.actionIconBox, { backgroundColor: theme.surface }]}>
                <Feather name={item.icon} size={15} color={theme.primary} />
              </View>
              <Text style={[styles.actionLabel, { color: theme.text }]}>{item.label}</Text>
              <Feather name="chevron-right" size={15} color={theme.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign In or Logout */}
        {currentUser ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleLogout}
            style={[styles.authActionBtn, { borderColor: theme.border, backgroundColor: theme.surface }]}>
            <Feather name="log-out" size={14} color="#EF4444" style={{ marginRight: 6 }} />
            <Text style={styles.logoutText}>Sign Out ({currentUser.email})</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => setAuthModalVisible(true)}
            style={[styles.authActionBtn, { borderColor: theme.primary, backgroundColor: theme.primary }]}>
            <Feather name="log-in" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={[styles.logoutText, { color: '#FFFFFF' }]}>Sign In / Create Account</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Auth Modal */}
      <AuthModal
        visible={authModalVisible}
        onClose={() => setAuthModalVisible(false)}
        onSuccess={(user) => setCurrentUser(user)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  profileCard: {
    margin: 16,
    borderRadius: 0,
    borderWidth: 1,
    padding: 16,
  },
  roleSwitch: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: 0,
    borderWidth: 1,
    marginBottom: 16,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 0,
  },
  roleOptionText: {
    fontSize: 11,
    fontWeight: '700',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarBox: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 0,
    borderWidth: 1.5,
    borderColor: '#232532',
  },
  verifiedCheck: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 15,
    height: 15,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
  },
  userHandle: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 1,
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  locText: {
    fontSize: 11,
  },
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 0,
    borderWidth: 1,
  },
  tierText: {
    fontSize: 10,
    fontWeight: '800',
  },
  bioText: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderRadius: 0,
    borderWidth: 1,
  },
  statCol: {
    alignItems: 'center',
    flex: 1,
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
    height: 22,
  },
  actionsContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 8,
  },
  actionsHeader: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 4,
    marginLeft: 4,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 0,
    borderWidth: 1,
  },
  actionIconBox: {
    width: 32,
    height: 32,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  authActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 0,
    borderWidth: 1,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '700',
  },
});
