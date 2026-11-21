import React from 'react';
import { View, TouchableOpacity, Text, Alert, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';

export function SocialAuthButtons() {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.socialDivider}>
        <Text style={[styles.socialText, { color: theme.textSecondary }]}>Or Signup in with</Text>
      </View>

      <View style={styles.socialRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => Alert.alert('Google Sign In', 'Connecting to Google OAuth...')}
          style={styles.socialBtn}>
          <FontAwesome name="google" size={17} color="#000000" />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => Alert.alert('Apple Sign In', 'Connecting to Apple ID...')}
          style={styles.socialBtn}>
          <FontAwesome name="apple" size={19} color="#000000" />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => Alert.alert('X Sign In', 'Connecting to X OAuth...')}
          style={styles.socialBtn}>
          <Text style={styles.socialXText}>𝕏</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  socialDivider: {
    alignItems: 'center',
    marginBottom: 16,
  },
  socialText: {
    fontSize: 11,
    fontWeight: '600',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
  },
  socialBtn: {
    width: 44,
    height: 44,
    borderRadius: 0,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialXText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '800',
  },
});

