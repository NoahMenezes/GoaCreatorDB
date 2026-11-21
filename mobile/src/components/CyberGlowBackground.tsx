import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface CyberGlowBackgroundProps {
  glowIntensity?: 'subtle' | 'medium' | 'high';
}

export function CyberGlowBackground({ glowIntensity = 'subtle' }: CyberGlowBackgroundProps) {
  const [pulseAnim] = useState(() => new Animated.Value(0.4));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.85,
          duration: 3200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 3200,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  const maxOpacity = glowIntensity === 'high' ? 0.25 : glowIntensity === 'medium' ? 0.16 : 0.08;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Deep Obsidian / Charcoal Base */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#090909' }]} />

      {/* Atmospheric Top-Right Crimson Glow */}
      <Animated.View
        style={[
          styles.ambientGlowTopRight,
          {
            opacity: pulseAnim.interpolate({
              inputRange: [0.4, 0.85],
              outputRange: [maxOpacity * 0.7, maxOpacity * 1.3],
            }),
          },
        ]}
      />

      {/* Atmospheric Bottom-Left Crimson Glow */}
      <Animated.View
        style={[
          styles.ambientGlowBottomLeft,
          {
            opacity: pulseAnim.interpolate({
              inputRange: [0.4, 0.85],
              outputRange: [maxOpacity * 0.5, maxOpacity],
            }),
          },
        ]}
      />

      {/* Subtle Laser Accent Lines (inspired by Cyberpunk / Security layout) */}
      <View style={styles.laserGrid}>
        <View style={styles.verticalLaser1} />
        <View style={styles.verticalLaser2} />
        <View style={styles.horizontalLaser1} />
        <View style={styles.horizontalLaser2} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ambientGlowTopRight: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 320,
    height: 320,
    backgroundColor: '#EF1717',
    borderRadius: 0,
  },
  ambientGlowBottomLeft: {
    position: 'absolute',
    bottom: -60,
    left: -60,
    width: 260,
    height: 260,
    backgroundColor: '#B90F19',
    borderRadius: 0,
  },
  laserGrid: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
    opacity: 0.22,
  },
  verticalLaser1: {
    position: 'absolute',
    right: 48,
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#EF1717',
    opacity: 0.35,
  },
  verticalLaser2: {
    position: 'absolute',
    right: 56,
    top: 60,
    bottom: 80,
    width: 1,
    backgroundColor: '#B90F19',
    opacity: 0.2,
  },
  horizontalLaser1: {
    position: 'absolute',
    top: 140,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#EF1717',
    opacity: 0.2,
  },
  horizontalLaser2: {
    position: 'absolute',
    bottom: 240,
    left: 20,
    right: 0,
    height: 1,
    backgroundColor: '#EF1717',
    opacity: 0.15,
  },
});
