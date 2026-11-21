import React, { useState } from 'react';
import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { BrandRevealIntro } from '@/components/BrandRevealIntro';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const [showIntro, setShowIntro] = useState(true);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.tabBarActive,
          tabBarInactiveTintColor: theme.tabBarInactive,
          tabBarStyle: {
            backgroundColor: theme.tabBarBackground,
            borderTopColor: theme.tabBarBorder,
            borderTopWidth: 1,
            height: 54 + insets.bottom,
            paddingBottom: Math.max(insets.bottom, 6),
            paddingTop: 6,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <Feather name="home" size={20} color={color as string} />,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explore',
            tabBarIcon: ({ color }) => <Feather name="compass" size={20} color={color as string} />,
          }}
        />
        <Tabs.Screen
          name="collabs"
          options={{
            title: 'Collabs',
            tabBarIcon: ({ color }) => (
              <View style={{ position: 'relative' }}>
                <Feather name="briefcase" size={20} color={color as string} />
                <View
                  style={{
                    position: 'absolute',
                    top: -2,
                    right: -4,
                    width: 7,
                    height: 7,
                    borderRadius: 0,
                    backgroundColor: theme.primary,
                  }}
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="pricing"
          options={{
            title: 'Pricing',
            tabBarIcon: ({ color }) => <Feather name="zap" size={20} color={color as string} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <Feather name="user" size={20} color={color as string} />,
          }}
        />
      </Tabs>

      {/* 8-Second Brand Reveal Animation at startup */}
      {showIntro && <BrandRevealIntro onFinish={() => setShowIntro(false)} />}
    </View>
  );
}
