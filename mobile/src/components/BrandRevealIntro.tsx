import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  Image,
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

const videoSource = require('@/assets/GoaCreatorDB_brand_reveal_animation_c61b18c5.mp4');

interface BrandRevealIntroProps {
  onFinish: () => void;
}

export function BrandRevealIntro({ onFinish }: BrandRevealIntroProps) {
  const [fadeAnim] = useState(() => new Animated.Value(1));

  // Initialize native video player for iOS / Android
  const player = useVideoPlayer(videoSource, (p) => {
    p.loop = false;
    p.muted = true;
    try {
      p.play();
    } catch {}
  });

  const handleComplete = useCallback(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      try {
        player.pause();
      } catch {}
      onFinish();
    });
  }, [fadeAnim, onFinish, player]);

  useEffect(() => {
    // Automatically transition to the app after the video finishes (8s)
    const timer = setTimeout(() => {
      handleComplete();
    }, 8000);

    return () => clearTimeout(timer);
  }, [handleComplete]);

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
      {/* Tap anywhere to skip directly into the app */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleComplete}
        style={StyleSheet.absoluteFill}>
        {Platform.OS === 'web' ? (
          <video
            src={videoUri}
            autoPlay
            muted
            playsInline
            onEnded={handleComplete}
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
      </TouchableOpacity>
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
  },
});
