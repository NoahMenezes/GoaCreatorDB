import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

interface ProfileRoleSwitchProps {
  role: 'business' | 'creator';
  onSelectRole: (role: 'business' | 'creator') => void;
}

export function ProfileRoleSwitch({ role, onSelectRole }: ProfileRoleSwitchProps) {
  const theme = useTheme();

  return (
    <View style={[styles.roleSwitch, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onSelectRole('business')}
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
        onPress={() => onSelectRole('creator')}
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
  );
}

const styles = StyleSheet.create({
  roleSwitch: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 0,
    padding: 3,
    marginBottom: 20,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 0,
  },
  roleOptionText: {
    fontSize: 12,
    fontWeight: '700',
  },
});

