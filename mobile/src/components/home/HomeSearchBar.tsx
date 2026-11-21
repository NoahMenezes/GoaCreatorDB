import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';

interface HomeSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
}

export function HomeSearchBar({ value, onChangeText, onSubmit }: HomeSearchBarProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.searchBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Feather name="search" size={16} color={theme.textMuted} style={styles.icon} />
        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholder="Search Goan creators, villas, food bistros..."
          placeholderTextColor={theme.textMuted}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          returnKeyType="search"
        />
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={onSubmit}
          style={[styles.actionBtn, { backgroundColor: theme.primary }]}>
          <Feather name="arrow-right" size={13} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 20,
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
  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 0,
    marginLeft: 6,
  },
});
