import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';

interface ExploreSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
}

export function ExploreSearchBar({ value, onChangeText, onClear }: ExploreSearchBarProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.searchBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Feather name="search" size={16} color={theme.textMuted} style={styles.icon} />
        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholder="Filter by name, niche, or location..."
          placeholderTextColor={theme.textMuted}
          value={value}
          onChangeText={onChangeText}
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={onClear}>
            <Feather name="x" size={15} color={theme.textMuted} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 0,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 13,
  },
});
