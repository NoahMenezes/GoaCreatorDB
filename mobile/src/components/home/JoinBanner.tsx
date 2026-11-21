import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

interface JoinBannerProps {
  onPressAuth: () => void;
}

export function JoinBanner({ onPressAuth }: JoinBannerProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Text style={[styles.title, { color: theme.text }]}>Join the Official GoaCreatorDB Platform</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        Create your profile to pitch Goan luxury villas, cafes, and hospitality campaigns.
      </Text>
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={onPressAuth}
        style={[styles.btn, { backgroundColor: theme.primary }]}>
        <Text style={styles.btnText}>Create Account / Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 28,
    padding: 20,
    borderWidth: 1,
    borderRadius: 0,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 16,
  },
  btn: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 0,
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});

