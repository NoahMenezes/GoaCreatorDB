import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';

interface EmptyExploreStateProps {
  onReset: () => void;
}

export function EmptyExploreState({ onReset }: EmptyExploreStateProps) {
  const theme = useTheme();

  return (
    <View style={[styles.emptyBox, { borderColor: theme.border, backgroundColor: theme.card }]}>
      <Feather name="search" size={28} color={theme.textMuted} style={styles.emptyIcon} />
      <Text style={[styles.emptyTitle, { color: theme.text }]}>No matching creators</Text>
      <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
        Try tweaking your filters, searching a different Goan village, or clearing your niche query.
      </Text>
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={onReset}
        style={[styles.emptyResetBtn, { backgroundColor: theme.primary }]}>
        <Text style={styles.emptyResetText}>Reset All Filters</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyBox: {
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 0,
    marginTop: 12,
  },
  emptyIcon: {
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  emptyResetBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 0,
  },
  emptyResetText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});

