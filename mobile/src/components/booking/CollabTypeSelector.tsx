import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';

interface CollabTypeSelectorProps {
  value: 'paid' | 'barter';
  onChange: (type: 'paid' | 'barter') => void;
}

export function CollabTypeSelector({ value, onChange }: CollabTypeSelectorProps) {
  const theme = useTheme();

  return (
    <View style={styles.collabTypeRow}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onChange('paid')}
        style={[
          styles.typeButton,
          {
            borderColor: value === 'paid' ? theme.primary : theme.border,
            backgroundColor: value === 'paid' ? theme.primaryLight : theme.surface,
          },
        ]}>
        <Feather
          name="dollar-sign"
          size={15}
          color={value === 'paid' ? theme.primary : theme.textSecondary}
        />
        <Text
          style={[
            styles.typeButtonText,
            { color: value === 'paid' ? theme.primary : theme.text },
          ]}>
          Paid Campaign
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onChange('barter')}
        style={[
          styles.typeButton,
          {
            borderColor: value === 'barter' ? theme.primary : theme.border,
            backgroundColor: value === 'barter' ? theme.primaryLight : theme.surface,
          },
        ]}>
        <Feather
          name="gift"
          size={15}
          color={value === 'barter' ? theme.primary : theme.textSecondary}
        />
        <Text
          style={[
            styles.typeButtonText,
            { color: value === 'barter' ? theme.primary : theme.text },
          ]}>
          Barter / Stay
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  collabTypeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 0,
    gap: 8,
  },
  typeButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
