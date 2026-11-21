import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

export type DistrictType = 'All' | 'North Goa' | 'South Goa';

interface RegionTabsProps {
  selectedDistrict: DistrictType;
  onSelectDistrict: (district: DistrictType) => void;
}

export function RegionTabs({ selectedDistrict, onSelectDistrict }: RegionTabsProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      {(['All', 'North Goa', 'South Goa'] as const).map((dist) => {
        const active = selectedDistrict === dist;
        return (
          <TouchableOpacity
            key={dist}
            activeOpacity={0.8}
            onPress={() => onSelectDistrict(dist)}
            style={[
              styles.tab,
              {
                backgroundColor: active ? theme.primary : 'transparent',
              },
            ]}>
            <Text
              style={[
                styles.tabText,
                { color: active ? '#FFFFFF' : theme.textSecondary },
              ]}>
              {dist}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderRadius: 0,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 0,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
