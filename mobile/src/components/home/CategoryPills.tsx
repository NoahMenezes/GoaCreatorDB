import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { NICHES } from '@/constants/mock-data';
import { useTheme } from '@/hooks/use-theme';

interface CategoryPillsProps {
  selectedNiche: string;
  onSelectNiche: (slug: string) => void;
}

export function CategoryPills({ selectedNiche, onSelectNiche }: CategoryPillsProps) {
  const theme = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scroll}>
      {NICHES.map((niche) => {
        const isSelected = selectedNiche === niche.slug;
        return (
          <TouchableOpacity
            key={niche.slug}
            activeOpacity={0.8}
            onPress={() => onSelectNiche(niche.slug)}
            style={[
              styles.pill,
              {
                backgroundColor: isSelected ? theme.primary : theme.surface,
                borderColor: isSelected ? theme.primary : theme.border,
              },
            ]}>
            <Feather
              name={niche.icon}
              size={12}
              color={isSelected ? '#FFFFFF' : theme.textSecondary}
              style={{ marginRight: 5 }}
            />
            <Text
              style={[
                styles.text,
                { color: isSelected ? '#FFFFFF' : theme.text },
              ]}>
              {niche.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 16,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 0,
    borderWidth: 1,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});

