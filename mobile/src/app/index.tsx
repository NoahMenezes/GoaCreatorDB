import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Header } from '@/components/Header';
import { CreatorCard } from '@/components/CreatorCard';
import { BookingModal } from '@/components/BookingModal';
import {
  MOCK_CREATORS,
  NICHES,
  TRUST_METRICS,
  HOW_IT_WORKS_STEPS,
  PRICING_PLANS,
  Creator,
} from '@/constants/mock-data';
import { useTheme } from '@/hooks/use-theme';
import { api } from '@/services/api';

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();

  const [selectedNiche, setSelectedNiche] = useState('all');
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [activeRole, setActiveRole] = useState<'business' | 'creator'>('business');
  const [searchQuery, setSearchQuery] = useState('');
  const [metrics, setMetrics] = useState(TRUST_METRICS);
  const [creatorsList, setCreatorsList] = useState<Creator[]>(MOCK_CREATORS);

  useEffect(() => {
    // Connect to live stats endpoint
    api.getPublicStats().then((data) => {
      if (data && data.length > 0) setMetrics(data);
    });

    // Connect to live creators endpoint
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
      'Proposal Sent! 🎉',
      `Your collaboration brief for "${details.campaignTitle}" has been dispatched to ${details.creatorName}. They will review and confirm shortly.`,
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

  const filteredCreators =
    selectedNiche === 'all'
      ? creatorsList.slice(0, 3)
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
      <Header
        activeRole={activeRole}
        onRoleToggle={() =>
          setActiveRole(activeRole === 'business' ? 'creator' : 'business')
        }
        onNotificationPress={() =>
          Alert.alert('Notifications', 'You have 2 pending collaboration updates.')
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Official Badge */}
        <View style={styles.badgeWrapper}>
          <View
            style={[
              styles.officialBadge,
              {
                backgroundColor: theme.primaryLight,
                borderColor: theme.primaryBorder,
              },
            ]}>
            <View style={[styles.greenDot, { backgroundColor: theme.primary }]} />
            <Text style={[styles.officialBadgeText, { color: theme.primary }]}>
              THE OFFICIAL GOA CREATOR MARKETPLACE
            </Text>
          </View>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={[styles.heroTitle, { color: theme.text }]}>
            Find the right Goa creator{'\n'}
            <Text style={{ color: theme.primary }}>in minutes</Text>
          </Text>

          <Text style={[styles.heroSubtitle, { color: theme.textSecondary }]}>
            Connecting local cafes, boutique villas, hospitality brands, and events with vetted Goan influencers across North &amp; South Goa.
          </Text>

          {/* Quick Search Bar */}
          <View style={[styles.searchBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Feather name="search" size={18} color={theme.textSecondary} style={{ marginRight: 8 }} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Search by niche, location, or handle..."
              placeholderTextColor={theme.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
            />
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSearchSubmit}
              style={[styles.searchActionBtn, { backgroundColor: theme.primary }]}>
              <Feather name="arrow-right" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Quick CTAs */}
          <View style={styles.ctaRow}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push('/explore')}
              style={[styles.primaryCta, { backgroundColor: theme.primary }]}>
              <Feather name="search" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.primaryCtaText}>Find Creators</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push('/profile')}
              style={[
                styles.secondaryCta,
                {
                  borderColor: theme.border,
                  backgroundColor: theme.surface,
                },
              ]}>
              <Feather name="user-plus" size={14} color={theme.text} style={{ marginRight: 6 }} />
              <Text style={[styles.secondaryCtaText, { color: theme.text }]}>Join as Creator</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Trust Metrics Bar */}
        <View style={[styles.metricsContainer, { borderColor: theme.border, backgroundColor: theme.card }]}>
          <View style={styles.metricsGrid}>
            {metrics.map((metric, index) => (
              <View
                key={index}
                style={[
                  styles.metricCard,
                  {
                    borderRightColor: index % 2 === 0 ? theme.border : 'transparent',
                    borderBottomColor: index < 2 ? theme.border : 'transparent',
                  },
                ]}>
                <View style={[styles.metricSquare, { backgroundColor: theme.primary }]}>
                  <Text style={styles.metricSquareText}>{metric.value}</Text>
                </View>
                <View style={styles.metricTextCol}>
                  <Text style={[styles.metricTitle, { color: theme.text }]}>{metric.title}</Text>
                  <Text style={[styles.metricSubtitle, { color: theme.textSecondary }]}>
                    {metric.subtitle}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Coastal Niches Section */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTag}>
            <View style={[styles.greenDot, { backgroundColor: theme.primary }]} />
            <Text style={[styles.sectionTagText, { color: theme.primary }]}>LIVE COLLAB ENGINE</Text>
          </View>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Explore by Goa Niches</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            Filter by coastal specialization. Real-time verified creator portfolios.
          </Text>
        </View>

        {/* Niche Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.nichesScroll}>
          {NICHES.map((niche) => {
            const isSelected = selectedNiche === niche.slug;
            return (
              <TouchableOpacity
                key={niche.slug}
                activeOpacity={0.8}
                onPress={() => setSelectedNiche(niche.slug)}
                style={[
                  styles.nichePill,
                  {
                    backgroundColor: isSelected ? theme.primary : theme.surface,
                    borderColor: isSelected ? theme.primary : theme.border,
                  },
                ]}>
                <Feather
                  name={niche.icon}
                  size={13}
                  color={isSelected ? '#FFFFFF' : theme.textSecondary}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.nicheText,
                    { color: isSelected ? '#FFFFFF' : theme.text },
                  ]}>
                  {niche.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Featured Creators List */}
        <View style={styles.creatorsWrapper}>
          <View style={styles.creatorListHeader}>
            <Text style={[styles.subSectionTitle, { color: theme.text }]}>Featured Creators</Text>
            <TouchableOpacity onPress={() => router.push('/explore')}>
              <Text style={[styles.viewAllText, { color: theme.secondary }]}>View All →</Text>
            </TouchableOpacity>
          </View>

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

        {/* How It Works Section */}
        <View style={[styles.howItWorksBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.smallPreheader, { color: theme.primary }]}>EFFORTLESS WORKFLOW</Text>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>How GoaConnect Works</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary, marginBottom: 20 }]}>
            Tailored specifically for the coastal hospitality and creator ecosystem.
          </Text>

          {HOW_IT_WORKS_STEPS.map((step, idx) => (
            <View
              key={idx}
              style={[
                styles.stepCard,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                },
              ]}>
              <View style={[styles.stepIconBox, { backgroundColor: theme.primaryLight, borderColor: theme.primaryBorder }]}>
                <Feather name={step.icon} size={16} color={theme.primary} />
              </View>
              <View style={styles.stepContent}>
                <Text style={[styles.stepNumber, { color: theme.primary }]}>{step.step}</Text>
                <Text style={[styles.stepTitle, { color: theme.text }]}>{step.title}</Text>
                <Text style={[styles.stepDesc, { color: theme.textSecondary }]}>
                  {step.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Membership Plans Summary */}
        <View style={styles.plansSection}>
          <Text style={[styles.smallPreheader, { color: theme.primary }]}>MEMBERSHIP &amp; ACCESS</Text>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Transparent Plans</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary, marginBottom: 16 }]}>
            Designed for emerging creators, seasoned influencers, and luxury stays.
          </Text>

          {PRICING_PLANS.map((plan, idx) => (
            <View
              key={idx}
              style={[
                styles.planCard,
                {
                  backgroundColor: theme.card,
                  borderColor: plan.popular ? theme.primary : theme.border,
                  borderWidth: plan.popular ? 2 : 1,
                },
              ]}>
              {plan.popular && (
                <View style={[styles.popularBadge, { backgroundColor: theme.primary }]}>
                  <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
                </View>
              )}
              <View style={styles.planHeaderRow}>
                <View>
                  <Text style={[styles.planName, { color: theme.text }]}>{plan.name}</Text>
                  <Text style={[styles.planDesc, { color: theme.textSecondary }]}>{plan.desc}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.planPrice, { color: theme.text }]}>
                    {plan.price}
                    <Text style={[styles.planPeriod, { color: theme.textSecondary }]}>
                      {plan.period}
                    </Text>
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => router.push('/pricing')}
                style={[
                  styles.planCtaBtn,
                  {
                    backgroundColor: plan.popular ? theme.primary : theme.surface,
                    borderColor: plan.popular ? theme.primary : theme.border,
                    borderWidth: 1,
                  },
                ]}>
                <Text
                  style={[
                    styles.planCtaText,
                    { color: plan.popular ? '#FFFFFF' : theme.text },
                  ]}>
                  {plan.cta}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Bottom CTA Card */}
        <View style={[styles.bottomCtaCard, { backgroundColor: theme.primary }]}>
          <Text style={styles.bottomCtaTitle}>Ready to collaborate in Goa?</Text>
          <Text style={styles.bottomCtaDesc}>
            Join over 120 verified Goan creators and 40+ hospitality venues already running campaigns.
          </Text>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push('/explore')}
            style={styles.bottomCtaBtn}>
            <Text style={styles.bottomCtaBtnText}>Explore Marketplace</Text>
            <Feather name="arrow-right" size={14} color="#0C4E40" />
          </TouchableOpacity>
        </View>

        {/* Footer brand signature */}
        <View style={styles.footerNote}>
          <Text style={[styles.footerText, { color: theme.textMuted }]}>
            GoaConnect • Official Goan Creator &amp; Brand Platform
          </Text>
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
    paddingBottom: 36,
  },
  badgeWrapper: {
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  officialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    gap: 6,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  officialBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroSection: {
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 32,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
    maxWidth: 340,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingLeft: 12,
    paddingRight: 6,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 6,
  },
  searchActionBtn: {
    width: 30,
    height: 30,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  primaryCta: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 8,
  },
  primaryCtaText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  secondaryCta: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 8,
    borderWidth: 1,
  },
  secondaryCtaText: {
    fontSize: 13,
    fontWeight: '600',
  },
  metricsContainer: {
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 24,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metricCard: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    gap: 10,
  },
  metricSquare: {
    width: 34,
    height: 34,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricSquareText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  metricTextCol: {
    flex: 1,
  },
  metricTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  metricSubtitle: {
    fontSize: 10,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  sectionTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  sectionTagText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  nichesScroll: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    marginBottom: 14,
  },
  nichePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  nicheText: {
    fontSize: 12,
    fontWeight: '600',
  },
  creatorsWrapper: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  creatorListHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  subSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
  },
  howItWorksBox: {
    marginHorizontal: 16,
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 24,
  },
  smallPreheader: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  stepCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  stepIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepContent: {
    flex: 1,
  },
  stepNumber: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  stepDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
  plansSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  planCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: 10,
    right: 12,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  popularBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  planHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  planName: {
    fontSize: 16,
    fontWeight: '700',
  },
  planDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  planPrice: {
    fontSize: 20,
    fontWeight: '800',
  },
  planPeriod: {
    fontSize: 12,
    fontWeight: '400',
  },
  planCtaBtn: {
    paddingVertical: 9,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planCtaText: {
    fontSize: 12,
    fontWeight: '700',
  },
  bottomCtaCard: {
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 24,
  },
  bottomCtaTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center',
  },
  bottomCtaDesc: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    marginBottom: 14,
  },
  bottomCtaBtn: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
    gap: 6,
  },
  bottomCtaBtnText: {
    color: '#0C4E40',
    fontSize: 13,
    fontWeight: '700',
  },
  footerNote: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 11,
  },
});
