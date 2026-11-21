import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Header } from '@/components/Header';
import { CreatorCard } from '@/components/CreatorCard';
import { BookingModal } from '@/components/BookingModal';
import { CyberGlowBackground } from '@/components/CyberGlowBackground';
import { ExploreSearchBar } from '@/components/explore/ExploreSearchBar';
import { RegionTabs, DistrictType } from '@/components/explore/RegionTabs';
import { ExploreFilterToggles } from '@/components/explore/ExploreFilterToggles';
import { EmptyExploreState } from '@/components/explore/EmptyExploreState';
import { MOCK_CREATORS, NICHES, Creator } from '@/constants/mock-data';
import { useTheme } from '@/hooks/use-theme';
import { api } from '@/services/api';

export default function ExploreScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ q?: string }>();

  const [searchQuery, setSearchQuery] = useState(params.q || '');
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictType>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [selectedNiche, setSelectedNiche] = useState<string>('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [barterOnly, setBarterOnly] = useState(false);
  const [creatorsList, setCreatorsList] = useState<Creator[]>(MOCK_CREATORS);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);

  useEffect(() => {
    api.getCreators({
      q: searchQuery,
      district: selectedDistrict,
      category: selectedNiche,
      collabType: barterOnly ? 'barter' : undefined,
      verifiedOnly,
    }).then((data) => {
      if (data && data.length > 0) {
        setCreatorsList(data);
      }
    });
  }, [searchQuery, selectedDistrict, selectedNiche, barterOnly, verifiedOnly]);

  const locations = useMemo(() => {
    if (selectedDistrict === 'North Goa') return ['All', 'Assagao', 'Panjim', 'Anjuna', 'Morjim', 'Mandrem'];
    if (selectedDistrict === 'South Goa') return ['All', 'Palolem', 'Margao', 'Colva', 'Agonda'];
    return ['All', 'Assagao', 'Panjim', 'Anjuna', 'Morjim', 'Palolem', 'Margao', 'Mandrem'];
  }, [selectedDistrict]);

  const filteredCreators = useMemo(() => {
    return creatorsList.filter((c) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesHandle = c.handle.toLowerCase().includes(q);
        const matchesTag = c.tag.toLowerCase().includes(q);
        const matchesLoc = c.location.toLowerCase().includes(q);
        if (!matchesName && !matchesHandle && !matchesTag && !matchesLoc) return false;
      }
      if (selectedDistrict !== 'All' && c.district !== selectedDistrict) return false;
      if (selectedLocation !== 'All' && c.location !== selectedLocation) return false;
      if (selectedNiche !== 'all') {
        const tag = c.tag.toLowerCase();
        if (selectedNiche === 'food-dining' && !tag.includes('food') && !tag.includes('dining')) return false;
        if (selectedNiche === 'boutique-resorts' && !tag.includes('resort') && !tag.includes('stay')) return false;
        if (selectedNiche === 'nightlife-music' && !tag.includes('nightlife') && !tag.includes('cocktail')) return false;
        if (selectedNiche === 'travel-adventure' && !tag.includes('travel') && !tag.includes('adventure')) return false;
        if (selectedNiche === 'yoga-wellness' && !tag.includes('yoga') && !tag.includes('wellness')) return false;
      }
      if (verifiedOnly && !c.verified) return false;
      if (barterOnly && c.collabType !== 'BARTER FRIENDLY') return false;
      return true;
    });
  }, [creatorsList, searchQuery, selectedDistrict, selectedLocation, selectedNiche, verifiedOnly, barterOnly]);

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
      [{ text: 'Great' }]
    );
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedDistrict('All');
    setSelectedLocation('All');
    setSelectedNiche('all');
    setVerifiedOnly(false);
    setBarterOnly(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <CyberGlowBackground glowIntensity="subtle" />
      <Header />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Search Bar */}
        <ExploreSearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery('')}
        />

        {/* Region Tabs: All Goa / North Goa / South Goa */}
        <RegionTabs
          selectedDistrict={selectedDistrict}
          onSelectDistrict={(dist) => {
            setSelectedDistrict(dist);
            setSelectedLocation('All');
          }}
        />

        {/* Local Area Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScroll}>
          {locations.map((loc) => {
            const active = selectedLocation === loc;
            return (
              <TouchableOpacity
                key={loc}
                activeOpacity={0.8}
                onPress={() => setSelectedLocation(loc)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: active ? theme.primaryLight : theme.surface,
                    borderColor: active ? theme.primary : theme.border,
                  },
                ]}>
                <Text
                  style={[
                    styles.filterChipText,
                    { color: active ? theme.primary : theme.text },
                  ]}>
                  {loc === 'All' ? 'All Areas' : loc}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Niches Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScroll}>
          {NICHES.map((niche) => {
            const active = selectedNiche === niche.slug;
            return (
              <TouchableOpacity
                key={niche.slug}
                activeOpacity={0.8}
                onPress={() => setSelectedNiche(niche.slug)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: active ? theme.primaryLight : theme.surface,
                    borderColor: active ? theme.primary : theme.border,
                  },
                ]}>
                <Text
                  style={[
                    styles.filterChipText,
                    { color: active ? '#FFFFFF' : theme.text },
                  ]}>
                  {niche.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Fast Filter Toggles: Verified & Barter */}
        <ExploreFilterToggles
          verifiedOnly={verifiedOnly}
          onToggleVerified={() => setVerifiedOnly(!verifiedOnly)}
          barterOnly={barterOnly}
          onToggleBarter={() => setBarterOnly(!barterOnly)}
        />

        {/* Results Counter */}
        <View style={styles.resultsCounterRow}>
          <Text style={[styles.resultsCount, { color: theme.textSecondary }]}>
            Showing <Text style={{ color: theme.text, fontWeight: '800' }}>{filteredCreators.length}</Text> verified Goan creators
          </Text>
        </View>

        {/* Creators List */}
        <View style={styles.listContainer}>
          {filteredCreators.length === 0 ? (
            <EmptyExploreState onReset={handleResetFilters} />
          ) : (
            filteredCreators.map((creator) => (
              <CreatorCard
                key={creator.id}
                creator={creator}
                onBookPress={handleBook}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Booking Proposal Modal */}
      <BookingModal
        visible={bookingModalVisible}
        creator={selectedCreator}
        onClose={() => setBookingModalVisible(false)}
        onSubmit={handleBookingSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  chipsScroll: {
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 10,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 0,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  resultsCounterRow: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  resultsCount: {
    fontSize: 12,
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: 20,
  },
});
