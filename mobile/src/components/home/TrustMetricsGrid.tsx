import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

interface TrustMetricsGridProps {
  metrics: { value: string; title: string; subtitle: string }[];
}

export function TrustMetricsGrid({ metrics }: TrustMetricsGridProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { borderColor: theme.border, backgroundColor: theme.card }]}>
      <View style={styles.grid}>
        {metrics.map((metric, index) => (
          <View
            key={index}
            style={[
              styles.card,
              {
                borderRightColor: index % 2 === 0 ? theme.border : 'transparent',
                borderBottomColor: index < 2 ? theme.border : 'transparent',
              },
            ]}>
            <View style={[styles.square, { backgroundColor: theme.primaryLight, borderColor: theme.primaryBorder }]}>
              <Text style={[styles.squareText, { color: theme.primary }]}>{metric.value}</Text>
            </View>
            <View style={styles.textCol}>
              <Text style={[styles.title, { color: theme.text }]}>{metric.title}</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                {metric.subtitle}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderRadius: 0,
    overflow: 'hidden',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  card: {
    width: '50%',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRightWidth: 1,
    borderBottomWidth: 1,
  },
  square: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 0,
    borderWidth: 1,
  },
  squareText: {
    fontSize: 12,
    fontWeight: '800',
  },
  textCol: {
    flex: 1,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 10,
    marginTop: 1,
  },
});
