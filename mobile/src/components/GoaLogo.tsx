import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';

export function GoaLogo({ size = 'default' }: { size?: 'small' | 'default' | 'large' }) {
  const theme = useTheme();

  const iconSizes = {
    small: { box: 26, icon: 14, text: 15, sub: 15 },
    default: { box: 34, icon: 18, text: 19, sub: 19 },
    large: { box: 44, icon: 24, text: 24, sub: 24 },
  }[size];

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconBox,
          {
            width: iconSizes.box,
            height: iconSizes.box,
            backgroundColor: theme.primaryLight,
            borderColor: theme.primaryBorder,
          },
        ]}>
        <Feather name="activity" size={iconSizes.icon} color={theme.secondary} />
      </View>
      <View style={styles.textRow}>
        <Text style={[styles.goaText, { fontSize: iconSizes.text, color: theme.text }]}>
          Goa
        </Text>
        <Text style={[styles.connectText, { fontSize: iconSizes.sub, color: theme.secondary }]}>
          Connect
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBox: {
    borderRadius: 8,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goaText: {
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  connectText: {
    fontWeight: '800',
    letterSpacing: -0.4,
  },
});

