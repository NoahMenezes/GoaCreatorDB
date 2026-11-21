import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
const videoSource = require('@/assets/GoaCreatorDB_brand_reveal_animation_c61b18c5.mp4');
interface BrandRevealIntroProps {
  onFinish: () => void;
}
export function BrandRevealIntro({ onFinish }: BrandRevealIntroProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const [timeLeft, setTimeLeft] = useState(8);
  const [fadeAnim] = useState(() => new Animated.Value(1));
  const [progressAnim] = useState(() => new Animated.Value(0));

  const player = useVideoPlayer(videoSource, (p) => {
    p.loop = true;
    p.muted = true;
    try {
      p.play();
    } catch { }
  });
  const handleComplete = useCallback(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      try {
        player.pause();
      } catch { }
      onFinish();
    });
  }, [fadeAnim, onFinish, player]);
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 8000,
      useNativeDriver: false,
    }).start();
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [handleComplete, progressAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const videoUri =
    (typeof (Image as any).resolveAssetSource === 'function'
      ? (Image as any).resolveAssetSource(videoSource)?.uri
      : null) ||
    (typeof videoSource === 'string'
      ? videoSource
      : videoSource?.default || videoSource?.uri || '');

  return (
    <Animated.View
      style={[
        styles.fullScreenOverlay,
        {
          opacity: fadeAnim,
          backgroundColor: '#090909',
        },
      ]}>

      <View style={StyleSheet.absoluteFill}>
        {Platform.OS === 'web' ? (
          <video
            src={videoUri}
            autoPlay
            muted
            playsInline
            loop
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              backgroundColor: '#090909',
            }}
          />
        ) : (
          <VideoView
            player={player}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            nativeControls={false}
          />
        )}
        <View style={styles.vignetteOverlay} pointerEvents="none" />
      </View>

      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 16) + 8 }]}>
        <View style={styles.brandBadge}>
          <View style={[styles.redSquare, { backgroundColor: theme.primary }]} />
          <Text style={styles.brandTitleText}>GOACREATORDB</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleComplete}
          style={[styles.skipButton, { borderColor: theme.border, backgroundColor: 'rgba(17,18,20,0.85)' }]}>
          <Text style={styles.skipButtonText}>Skip ({timeLeft}s)</Text>
          <Feather name="arrow-right" size={13} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Bottom Progress Bar respecting safe-area insets */}
      <View style={[styles.bottomSection, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
        <View style={styles.progressLabelRow}>
          <Text style={styles.progressLabel}>BRAND REVEAL ANIMATION</Text>
          <Text style={[styles.timerNumber, { color: theme.primary }]}>0:0{timeLeft}</Text>
        </View>

        <View style={styles.progressBarTrack}>
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                width: progressWidth,
                backgroundColor: theme.primary,
              },
            ]}
          />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fullScreenOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 9999,
    justifyContent: 'space-between',
  },
  vignetteOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(9, 9, 9, 0.25)',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 2,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(17, 18, 20, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#22252A',
    borderRadius: 0,
  },
  redSquare: {
    width: 7,
    height: 7,
    borderRadius: 0,
  },
  brandTitleText: {
    color: '#F5F5F5',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 0,
    gap: 6,
  },
  skipButtonText: {
    color: '#F5F5F5',
    fontSize: 12,
    fontWeight: '700',
  },
  bottomSection: {
    paddingHorizontal: 20,
    zIndex: 2,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    color: '#A1A1AA',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  timerNumber: {
    fontSize: 12,
    fontWeight: '900',
  },
  progressBarTrack: {
    height: 3,
    width: '100%',
    backgroundColor: '#17191C',
    borderRadius: 0,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 0,
  },
});
