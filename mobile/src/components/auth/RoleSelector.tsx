import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

interface RoleSelectorProps {
  role: 'creator' | 'business';
  onSelectRole: (role: 'creator' | 'business') => void;
}

export function RoleSelector({ role, onSelectRole }: RoleSelectorProps) {
  const theme = useTheme();

  return (
    <View style={styles.roleContainer}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onSelectRole('creator')}
        style={[
          styles.roleBtn,
          {
            borderColor: role === 'creator' ? theme.primary : theme.border,
            backgroundColor: role === 'creator' ? theme.primaryLight : theme.surface,
          },
        ]}>
        <Text style={[styles.roleBtnText, { color: role === 'creator' ? theme.primary : theme.text }]}>
          ✨ I am a Creator
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onSelectRole('business')}
        style={[
          styles.roleBtn,
          {
            borderColor: role === 'business' ? theme.primary : theme.border,
            backgroundColor: role === 'business' ? theme.primaryLight : theme.surface,
          },
        ]}>
        <Text style={[styles.roleBtnText, { color: role === 'business' ? theme.primary : theme.text }]}>
          🏨 I am a Brand
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  roleContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 0,
    alignItems: 'center',
  },
  roleBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});

