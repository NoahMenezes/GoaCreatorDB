import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { CyberGlowBackground } from '@/components/CyberGlowBackground';

interface WelcomeHeroProps {
  visible: boolean;
  onContinue: () => void;
}

export function WelcomeHero({ visible, onContinue }: WelcomeHeroProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <Modal visible={visible} animationType="fade" transparent={false}>
      <View style={[styles.container, { backgroundColor: '#090909' }]}>
        {/* Full-bleed portrait image with red/obsidian backlighting */}
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1200&auto=format&fit=crop',
          }}
          style={styles.backgroundImage}
          resizeMode="cover"
        />

        {/* Ambient Dark-Red Gradient & Cyber Laser Overlay */}
        <View style={styles.gradientOverlay} />
        <CyberGlowBackground glowIntensity="medium" />

        {/* Top Minimal Brand Row */}
        <View style={[styles.topBrandRow, { paddingTop: Math.max(insets.top, 16) + 6 }]}>
          <View style={styles.brandBadge}>
            <View style={[styles.redSquare, { backgroundColor: theme.primary }]} />
            <Text style={styles.brandTitle}>GOACREATORDB</Text>
          </View>
        </View>

        {/* Bottom Content Area */}
        <View style={[styles.content, { paddingBottom: Math.max(insets.bottom, 20) + 16 }]}>
          <Text style={styles.heroTitle}>
            Shop The Creators{'\n'}You Love.
          </Text>

          <Text style={styles.heroSubtitle}>
            Discover limited drops and verified campaigns designed by the voices shaping your feed.
          </Text>

          {/* Metrics Row (inspired by the screencast: 300+ Clients | 99% Satisfaction | $5M+ Revenue) */}
          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>300+</Text>
              <Text style={styles.metricLabel}>Creators</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>99%</Text>
              <Text style={styles.metricLabel}>Satisfaction</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>₹5M+</Text>
              <Text style={styles.metricLabel}>Collabs</Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.88}
            onPress={onContinue}
            style={[styles.continueButton, { backgroundColor: theme.primary }]}>
            <Text style={styles.continueButtonText}>Continue</Text>
            <Feather name="arrow-right" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#090909',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(9, 9, 9, 0.62)',
  },
  topBrandRow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(17, 18, 20, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#22252A',
    borderRadius: 0,
  },
  redSquare: {
    width: 6,
    height: 6,
    borderRadius: 0,
  },
  brandTitle: {
    color: '#F5F5F5',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    zIndex: 10,
  },
  heroTitle: {
    color: '#F5F5F5',
    fontSize: 34,
    fontWeight: '800',
    lineHeight: 40,
    letterSpacing: -0.8,
    marginBottom: 8,
  },
  heroSubtitle: {
    color: '#A1A1AA',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 20,
    maxWidth: 320,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(17, 18, 20, 0.85)',
    borderWidth: 1,
    borderColor: '#22252A',
    borderRadius: 0,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    color: '#F5F5F5',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  metricLabel: {
    color: '#A1A1AA',
    fontSize: 10,
    fontWeight: '500',
    marginTop: 1,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#22252A',
  },
  continueButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
