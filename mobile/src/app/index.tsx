import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Header } from '@/components/Header';
import { SpotlightCard } from '@/components/SpotlightCard';
import { CreatorCard } from '@/components/CreatorCard';
import { BookingModal } from '@/components/BookingModal';
import { AuthModal } from '@/components/AuthModal';
import { WelcomeHero } from '@/components/WelcomeHero';
import { BrandRevealIntro } from '@/components/BrandRevealIntro';
import { TrendingPostCard } from '@/components/TrendingPostCard';
import { CyberGlowBackground } from '@/components/CyberGlowBackground';
import { HomeSearchBar } from '@/components/home/HomeSearchBar';
import { CategoryPills } from '@/components/home/CategoryPills';
import { TrustMetricsGrid } from '@/components/home/TrustMetricsGrid';
import { JoinBanner } from '@/components/home/JoinBanner';
import {
  MOCK_CREATORS,
  TRUST_METRICS,
  Creator,
} from '@/constants/mock-data';
import { useTheme } from '@/hooks/use-theme';
import { api } from '@/services/api';

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedNiche, setSelectedNiche] = useState('all');
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [welcomeVisible, setWelcomeVisible] = useState(true);
  const [revealVisible, setRevealVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [metrics, setMetrics] = useState(TRUST_METRICS);
  const [creatorsList, setCreatorsList] = useState<Creator[]>(MOCK_CREATORS);

  useEffect(() => {
    // Check authenticated user
    api.getMe().then((data) => {
      if (data && data.authenticated && data.user) {
        setCurrentUser(data.user);
      }
    });

    // Load live platform stats
    api.getPublicStats().then((data) => {
      if (data && data.length > 0) setMetrics(data);
    });

    // Load creators from backend
    api.getCreators().then((data) => {
      if (data && data.length > 0) setCreatorsList(data);
    });
  }, []);

  const handleBook = (creator: Creator) => {
    setSelectedCreator(creator);
    setBookingModalVisible(true);
  };

  const handleBookingSubmit = async (details: any) => {
    await api.sendCollabRequest({
      creatorId: details.creatorId,
      campaignTitle: details.campaignTitle,
      collabType: details.collabType,
      offeredAmount: Number(details.budget.replace(/[^0-9]/g, '')) || 0,
      deliverables: details.selectedDeliverable,
      message: details.notes,
    });

    Alert.alert(
      'Proposal Dispatched! 🎉',
      `Your collaboration brief for "${details.campaignTitle}" has been sent to ${details.creatorName}.`,
      [{ text: 'Awesome' }]
    );
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      router.push({
        pathname: '/explore',
        params: { q: searchQuery.trim() },
      });
    } else {
      router.push('/explore');
    }
  };

  const spotlightCreator = creatorsList[0] || MOCK_CREATORS[0];

  const filteredCreators =
    selectedNiche === 'all'
      ? creatorsList.slice(1)
      : creatorsList.filter((c) => {
          const matchTag = c.tag.toLowerCase();
          if (selectedNiche === 'food-dining') return matchTag.includes('food') || matchTag.includes('dining');
          if (selectedNiche === 'boutique-resorts') return matchTag.includes('resort') || matchTag.includes('stay');
          if (selectedNiche === 'nightlife-music') return matchTag.includes('nightlife') || matchTag.includes('cocktail');
          if (selectedNiche === 'travel-adventure') return matchTag.includes('travel') || matchTag.includes('adventure');
          if (selectedNiche === 'yoga-wellness') return matchTag.includes('yoga') || matchTag.includes('wellness');
          return true;
        });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Edge-to-edge Cyber Ambient Background */}
      <CyberGlowBackground glowIntensity="subtle" />

      <Header
        user={currentUser}
        onMenuPress={() => {
          Alert.alert('GoaCreatorDB Menu', 'Select an option:', [
            { text: '🎬 Replay Brand Reveal (8s)', onPress: () => setRevealVisible(true) },
            { text: '✨ Screen 1: Shop Creators Hero', onPress: () => setWelcomeVisible(true) },
            { text: '🔑 Screen 3: Start Exploring (Sign Up)', onPress: () => setAuthModalVisible(true) },
            { text: 'Cancel', style: 'cancel' },
          ]);
        }}
        onNotificationPress={() =>
          Alert.alert('Notifications', 'You have 2 pending collaboration requests in your pipeline.')
        }
        onAvatarPress={() => {
          if (currentUser) {
            router.push('/profile');
          } else {
            setAuthModalVisible(true);
          }
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Personalized Greeting (from Screen 2 of design reference) */}
        <View style={styles.greetingSection}>
          <Text style={[styles.welcomeText, { color: theme.text }]}>
            Welcome {currentUser?.email ? currentUser.email.split('@')[0] : 'James'}
          </Text>
          <Text style={[styles.subGreeting, { color: theme.textSecondary }]}>
            Made For Your Feed
          </Text>
        </View>

        {/* Modular Search Bar */}
        <HomeSearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmit={handleSearchSubmit}
        />

        {/* Hero Spotlight Creator Card ('Jack John' in Screen 2) */}
        <View style={styles.spotlightWrapper}>
          <SpotlightCard
            creator={spotlightCreator}
            onPress={(c) => {
              router.push({ pathname: '/explore', params: { q: c.name } });
            }}
            onBookPress={handleBook}
          />
        </View>

        {/* Section Header: "Trending Creators" */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Trending Creators</Text>
            <Text style={[styles.sectionSub, { color: theme.textSecondary }]}>
              Verified coastal creators with authentic Goan engagement
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/explore')}>
            <Text style={[styles.seeAllText, { color: theme.primary }]}>See all →</Text>
          </TouchableOpacity>
        </View>

        {/* Modular Category Pills */}
        <CategoryPills
          selectedNiche={selectedNiche}
          onSelectNiche={setSelectedNiche}
        />

        {/* Creator Feed Cards with Screen 2 Post */}
        <View style={styles.feedContainer}>
          <TrendingPostCard
            author="James Cameron"
            handle="@jihyo_james"
            timeAgo="6 hour ago"
            avatarUri="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop"
            imageUri="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000&auto=format&fit=crop"
            caption="Neutral tones, maximum impact. This drop is crafted for luxury stays and boutique spaces."
            onPress={() => router.push('/explore')}
          />
          {filteredCreators.map((creator) => (
            <CreatorCard
              key={creator.id}
              creator={creator}
              onBookPress={handleBook}
              onCardPress={(c) => {
                router.push({
                  pathname: '/explore',
                  params: { q: c.name },
                });
              }}
            />
          ))}
        </View>

        {/* Modular Trust Metrics Bar */}
        <TrustMetricsGrid metrics={metrics} />

        {/* Modular Bottom Join Banner */}
        {!currentUser && (
          <JoinBanner onPressAuth={() => setAuthModalVisible(true)} />
        )}
      </ScrollView>

      {/* Booking Proposal Modal */}
      <BookingModal
        visible={bookingModalVisible}
        creator={selectedCreator}
        onClose={() => setBookingModalVisible(false)}
        onSubmit={handleBookingSubmit}
      />

      {/* Sign In & Register Modal */}
      <AuthModal
        visible={authModalVisible}
        onClose={() => setAuthModalVisible(false)}
        onSuccess={(user) => setCurrentUser(user)}
      />

      {/* Welcome Onboarding Modal */}
      <WelcomeHero
        visible={welcomeVisible}
        onContinue={() => setWelcomeVisible(false)}
      />

      {/* Brand Reveal Animation Replay */}
      {revealVisible && (
        <BrandRevealIntro onFinish={() => setRevealVisible(false)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  scrollContent: {
    paddingBottom: 36,
  },
  greetingSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  subGreeting: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  spotlightWrapper: {
    paddingHorizontal: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  sectionSub: {
    fontSize: 12,
    marginTop: 2,
    maxWidth: 240,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
  },
  feedContainer: {
    paddingHorizontal: 20,
  },
});
