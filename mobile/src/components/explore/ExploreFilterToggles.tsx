import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';

interface ExploreFilterTogglesProps {
  verifiedOnly: boolean;
  onToggleVerified: () => void;
  barterOnly: boolean;
  onToggleBarter: () => void;
}

export function ExploreFilterToggles({
  verifiedOnly,
  onToggleVerified,
  barterOnly,
  onToggleBarter,
}: ExploreFilterTogglesProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onToggleVerified}
        style={[
          styles.toggleButton,
          {
            backgroundColor: verifiedOnly ? theme.primaryLight : theme.surface,
            borderColor: verifiedOnly ? theme.primary : theme.border,
          },
        ]}>
        <Feather
          name="check-circle"
          size={13}
          color={verifiedOnly ? theme.primary : theme.textSecondary}
          style={{ marginRight: 6 }}
        />
        <Text style={[styles.toggleText, { color: verifiedOnly ? theme.primary : theme.text }]}>
          Verified Only
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onToggleBarter}
        style={[
          styles.toggleButton,
          {
            backgroundColor: barterOnly ? theme.primaryLight : theme.surface,
            borderColor: barterOnly ? theme.primary : theme.border,
          },
        ]}>
        <Feather
          name="repeat"
          size={13}
          color={barterOnly ? theme.primary : theme.textSecondary}
          style={{ marginRight: 6 }}
        />
        <Text style={[styles.toggleText, { color: barterOnly ? theme.primary : theme.text }]}>
          Barter Friendly
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderRadius: 0,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

