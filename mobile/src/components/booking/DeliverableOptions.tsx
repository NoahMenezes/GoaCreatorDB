import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';

interface DeliverableOptionsProps {
  options: string[];
  selectedOption: string;
  onSelectOption: (option: string) => void;
}

export function DeliverableOptions({
  options,
  selectedOption,
  onSelectOption,
}: DeliverableOptionsProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {options.map((opt) => {
        const isSelected = selectedOption === opt;
        return (
          <TouchableOpacity
            key={opt}
            activeOpacity={0.8}
            onPress={() => onSelectOption(opt)}
            style={[
              styles.optionCard,
              {
                borderColor: isSelected ? theme.primary : theme.border,
                backgroundColor: isSelected ? theme.primaryLight : theme.surface,
              },
            ]}>
            <View style={styles.optionContent}>
              <View
                style={[
                  styles.radioOuter,
                  { borderColor: isSelected ? theme.primary : theme.textMuted },
                ]}>
                {isSelected && (
                  <View style={[styles.radioInner, { backgroundColor: theme.primary }]} />
                )}
              </View>
              <Text
                style={[
                  styles.optionText,
                  { color: isSelected ? theme.text : theme.textSecondary },
                ]}>
                {opt}
              </Text>
            </View>
            {isSelected && <Feather name="check" size={14} color={theme.primary} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    marginBottom: 20,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderWidth: 1,
    borderRadius: 0,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radioOuter: {
    width: 16,
    height: 16,
    borderWidth: 1.5,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 0,
  },
  optionText: {
    fontSize: 13,
    fontWeight: '600',
  },
});

