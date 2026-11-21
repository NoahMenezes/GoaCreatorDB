import React from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';

export interface ActionMenuItem {
  icon: keyof typeof Feather.glyphMap;
  label: string;
}

interface ProfileMenuItemsProps {
  items: ActionMenuItem[];
}

export function ProfileMenuItems({ items }: ProfileMenuItemsProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.header, { color: theme.textSecondary }]}>
        WORKSPACE &amp; MANAGEMENT
      </Text>

      {items.map((item, idx) => (
        <TouchableOpacity
          key={idx}
          activeOpacity={0.7}
          onPress={() => Alert.alert(item.label, 'This feature is fully enabled in GoaCreatorDB.')}
          style={[
            styles.item,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
          ]}>
          <View style={[styles.iconBox, { backgroundColor: theme.surface }]}>
            <Feather name={item.icon} size={15} color={theme.primary} />
          </View>
          <Text style={[styles.label, { color: theme.text }]}>{item.label}</Text>
          <Feather name="chevron-right" size={15} color={theme.textMuted} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
    borderRadius: 0,
    marginBottom: 8,
    gap: 12,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
});

