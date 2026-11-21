import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';

interface HeaderProps {
  user?: any;
  onMenuPress?: () => void;
  onNotificationPress?: () => void;
  onAvatarPress?: () => void;
}

export function Header({
  user,
  onMenuPress,
  onNotificationPress,
  onAvatarPress,
}: HeaderProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, 12) + 6,
          backgroundColor: theme.background,
          borderBottomColor: theme.border,
        },
      ]}>
      {/* Left: 3 vertical dots menu (from Screen 2) */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onMenuPress}
        style={[styles.iconButton, { borderColor: theme.border, backgroundColor: theme.surface }]}>
        <Feather name="more-vertical" size={17} color={theme.text} />
      </TouchableOpacity>

      {/* Center Brand */}
      <View style={styles.brandContainer}>
        <Text style={styles.goaBrand}>
          GOA<Text style={{ color: theme.primary }}>CREATORDB</Text>
        </Text>
      </View>

      {/* Right: Notification + Profile Avatar (from Screen 2) */}
      <View style={styles.rightGroup}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onNotificationPress}
          style={[styles.iconButton, { borderColor: theme.border, backgroundColor: theme.surface }]}>
          <Feather name="bell" size={16} color={theme.text} />
          <View style={[styles.notifDot, { backgroundColor: theme.primary }]} />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onAvatarPress}
          style={[styles.avatarButton, { borderColor: theme.primary }]}>
          <Image
            source={{
              uri:
                user?.avatar_url ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
            }}
            style={styles.avatarImg}
          />
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
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 0,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goaBrand: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 0,
  },
  avatarButton: {
    width: 36,
    height: 36,
    borderRadius: 0,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
});
