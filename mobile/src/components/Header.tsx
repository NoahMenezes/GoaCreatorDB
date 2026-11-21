import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GoaLogo } from './GoaLogo';
import { useTheme } from '@/hooks/use-theme';

interface HeaderProps {
  onSearchPress?: () => void;
  onNotificationPress?: () => void;
  activeRole?: 'business' | 'creator';
  onRoleToggle?: () => void;
}

export function Header({
  onSearchPress,
  onNotificationPress,
  activeRole = 'business',
  onRoleToggle,
}: HeaderProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, 12) + 8,
          backgroundColor: theme.background,
          borderBottomColor: theme.border,
        },
      ]}>
      <GoaLogo />

      <View style={styles.actions}>
        {onRoleToggle && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onRoleToggle}
            style={[
              styles.roleBadge,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}>
            <Text style={[styles.roleText, { color: theme.textSecondary }]}>
              {activeRole === 'business' ? '🏨 Brand' : '✨ Creator'}
            </Text>
          </TouchableOpacity>
        )}

        {onSearchPress && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onSearchPress}
            style={[styles.iconButton, { borderColor: theme.border, backgroundColor: theme.surface }]}>
            <Feather name="search" size={16} color={theme.text} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onNotificationPress}
          style={[styles.iconButton, { borderColor: theme.border, backgroundColor: theme.surface }]}>
          <Feather name="bell" size={16} color={theme.text} />
          <View style={[styles.notifDot, { backgroundColor: theme.primary }]} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

