import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { Header } from '@/components/Header';
import { CreatorCard } from '@/components/CreatorCard';
import { BookingModal } from '@/components/BookingModal';
import { MOCK_CREATORS, NICHES, Creator } from '@/constants/mock-data';
import { useTheme } from '@/hooks/use-theme';
import { api } from '@/services/api';

export default function ExploreScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ q?: string }>();

  const [searchQuery, setSearchQuery] = useState(params.q || '');
  const [selectedDistrict, setSelectedDistrict] = useState<'All' | 'North Goa' | 'South Goa'>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [selectedNiche, setSelectedNiche] = useState<string>('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [barterOnly, setBarterOnly] = useState(false);
  const [creatorsList, setCreatorsList] = useState<Creator[]>(MOCK_CREATORS);

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

  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);

  const locations = useMemo(() => {
    if (selectedDistrict === 'North Goa') return ['All', 'Assagao', 'Panjim', 'Anjuna', 'Morjim', 'Mandrem'];
    if (selectedDistrict === 'South Goa') return ['All', 'Palolem', 'Margao', 'Colva', 'Agonda'];
    return ['All', 'Assagao', 'Panjim', 'Anjuna', 'Morjim', 'Palolem', 'Margao', 'Mandrem'];
  }, [selectedDistrict]);

  const filteredCreators = useMemo(() => {
    return creatorsList.filter((c) => {
      // Query search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesHandle = c.handle.toLowerCase().includes(q);
        const matchesTag = c.tag.toLowerCase().includes(q);
        const matchesLoc = c.location.toLowerCase().includes(q);
        if (!matchesName && !matchesHandle && !matchesTag && !matchesLoc) return false;
      }

      // District
      if (selectedDistrict !== 'All' && c.district !== selectedDistrict) return false;

      // Sub-location
      if (selectedLocation !== 'All' && c.location !== selectedLocation) return false;

      // Niche
      if (selectedNiche !== 'all') {
        const tag = c.tag.toLowerCase();
        if (selectedNiche === 'food-dining' && !tag.includes('food') && !tag.includes('dining')) return false;
        if (selectedNiche === 'boutique-resorts' && !tag.includes('resort') && !tag.includes('stay')) return false;
        if (selectedNiche === 'nightlife-music' && !tag.includes('nightlife') && !tag.includes('cocktail')) return false;
        if (selectedNiche === 'travel-adventure' && !tag.includes('travel') && !tag.includes('adventure')) return false;
        if (selectedNiche === 'yoga-wellness' && !tag.includes('yoga') && !tag.includes('wellness')) return false;
      }

      // Verified toggle
      if (verifiedOnly && !c.verified) return false;

      // Barter toggle
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
      'Proposal Sent! 🎉',
      `Your collaboration brief for "${details.campaignTitle}" has been dispatched to ${details.creatorName}.`,
      [{ text: 'Great' }]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Feather name="search" size={17} color={theme.textSecondary} style={{ marginRight: 8 }} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Filter by name, niche, or location..."
              placeholderTextColor={theme.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Feather name="x" size={16} color={theme.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Region Segmented Tabs: All Goa / North Goa / South Goa */}
        <View style={[styles.regionTabsContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {(['All', 'North Goa', 'South Goa'] as const).map((dist) => {
            const active = selectedDistrict === dist;
            return (
              <TouchableOpacity
                key={dist}
                activeOpacity={0.8}
                onPress={() => {
                  setSelectedDistrict(dist);
                  setSelectedLocation('All');
                }}
                style={[
                  styles.regionTab,
                  {
                    backgroundColor: active ? theme.primary : 'transparent',
                  },
                ]}>
                <Text
                  style={[
                    styles.regionTabText,
                    { color: active ? '#FFFFFF' : theme.textSecondary },
                  ]}>
                  {dist}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

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
                    backgroundColor: active ? theme.primary : theme.surface,
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
        <View style={styles.togglesRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setVerifiedOnly(!verifiedOnly)}
            style={[
              styles.toggleButton,
              {
                backgroundColor: verifiedOnly ? theme.primaryLight : theme.surface,
                borderColor: verifiedOnly ? theme.primary : theme.border,
              },
            ]}>
            <Feather
              name="check-circle"
              size={14}
              color={verifiedOnly ? theme.primary : theme.textSecondary}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.toggleText,
                { color: verifiedOnly ? theme.primary : theme.text },
              ]}>
              Verified Only
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setBarterOnly(!barterOnly)}
            style={[
              styles.toggleButton,
              {
                backgroundColor: barterOnly ? theme.badgeBarterBg : theme.surface,
                borderColor: barterOnly ? theme.badgeBarter : theme.border,
              },
            ]}>
            <Feather
              name="gift"
              size={14}
              color={barterOnly ? theme.badgeBarter : theme.textSecondary}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.toggleText,
                { color: barterOnly ? theme.badgeBarter : theme.text },
              ]}>
              Barter Friendly
            </Text>
          </TouchableOpacity>
        </View>

        {/* Results Info Bar */}
        <View style={styles.resultsInfoBar}>
          <Text style={[styles.resultsCount, { color: theme.textSecondary }]}>
            Showing <Text style={{ fontWeight: '700', color: theme.text }}>{filteredCreators.length}</Text> verified creators
          </Text>

          {(selectedNiche !== 'all' || selectedLocation !== 'All' || verifiedOnly || barterOnly) && (
            <TouchableOpacity
              onPress={() => {
                setSelectedDistrict('All');
                setSelectedLocation('All');
                setSelectedNiche('all');
                setVerifiedOnly(false);
                setBarterOnly(false);
                setSearchQuery('');
              }}>
              <Text style={[styles.resetText, { color: theme.secondary }]}>Reset Filters</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Creator List */}
        <View style={styles.listContainer}>
          {filteredCreators.map((creator) => (
            <CreatorCard
              key={creator.id}
              creator={creator}
              onBookPress={handleBook}
            />
          ))}

          {filteredCreators.length === 0 && (
            <View style={[styles.emptyBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Feather name="search" size={32} color={theme.textMuted} style={{ marginBottom: 10 }} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No Creators Found</Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                Try adjusting your filters or search for another Goa coastal area.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Booking Modal */}
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
  },
  scrollContent: {
    paddingBottom: 40,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  regionTabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    padding: 3,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
  },
  regionTab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 6,
  },
  regionTabText: {
    fontSize: 12,
    fontWeight: '700',
  },
  chipsScroll: {
    paddingHorizontal: 16,
    gap: 6,
    paddingBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  togglesRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginTop: 4,
    marginBottom: 14,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  resultsInfoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  resultsCount: {
    fontSize: 12,
  },
  resetText: {
    fontSize: 12,
    fontWeight: '700',
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  emptyBox: {
    padding: 32,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
