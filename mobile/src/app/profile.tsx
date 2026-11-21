import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Header } from '@/components/Header';
import { AuthModal } from '@/components/AuthModal';
import { CyberGlowBackground } from '@/components/CyberGlowBackground';
import { ProfileRoleSwitch } from '@/components/profile/ProfileRoleSwitch';
import { ProfileCard, ProfileDetails } from '@/components/profile/ProfileCard';
import { ProfileMenuItems, ActionMenuItem } from '@/components/profile/ProfileMenuItems';
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
  };

  const businessProfile: ProfileDetails = {
    name: currentUser?.profile?.name || 'Sunkissed Stays Villa Group',
    handle: '@sunkissed_goa',
    avatar: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=400&auto=format&fit=crop',
    location: 'Vagator & Assagao, North Goa',
    bio: 'Luxury 4-villa portfolio in North Goa partnering with high-engagement lifestyle, dining, and travel creators.',
    tier: 'PRO BRAND',
    stats: [
      { label: 'Active Collabs', value: '4' },
      { label: 'Proposals Sent', value: '18' },
      { label: 'Creator Network', value: '32' },
    ],
  };

  const creatorProfile: ProfileDetails = {
    name: currentUser?.name || 'Sneha Ferns',
    handle: '@sneha_demo',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
    location: 'Assagao, North Goa',
    bio: 'Food writer & coastal lifestyle tastemaker. Curating high-aesthetic reels for beachfront cafes and boutique stays.',
    tier: 'VERIFIED CREATOR',
    stats: [
      { label: 'Followers', value: '120K' },
      { label: 'Avg Reach', value: '45K' },
      { label: 'Collabs Done', value: '28' },
    ],
  };

  const profile = role === 'business' ? businessProfile : creatorProfile;

  const actionItems: ActionMenuItem[] = [
    { icon: 'file-text', label: role === 'business' ? 'Post New Campaign Brief' : 'My Live Media Kit & Rate Card' },
    { icon: 'bookmark', label: 'Saved Creators & Shortlists' },
    { icon: 'credit-card', label: 'Payment Terms & Milestone Escrow' },
    { icon: 'shield', label: 'Verified Goa Badge Status' },
    { icon: 'settings', label: 'Account & Notification Settings' },
    { icon: 'help-circle', label: 'GoaCreatorDB Help & Support' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <CyberGlowBackground glowIntensity="subtle" />
      <Header user={currentUser} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Modular Profile Card with Role Switcher */}
        <ProfileCard profile={profile}>
          <ProfileRoleSwitch role={role} onSelectRole={setRole} />
        </ProfileCard>

        {/* Modular Action Menu Items */}
        <ProfileMenuItems items={actionItems} />

        {/* Sign In or Logout Button */}
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
    position: 'relative',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  authActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderWidth: 1,
    borderRadius: 0,
    marginTop: 8,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '700',
  },
});
