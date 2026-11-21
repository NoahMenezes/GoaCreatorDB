import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Header } from '@/components/Header';
import { CyberGlowBackground } from '@/components/CyberGlowBackground';
import { PRICING_PLANS } from '@/constants/mock-data';
import { useTheme } from '@/hooks/use-theme';

export default function PricingScreen() {
  const theme = useTheme();

  const handleSelectPlan = (planName: string) => {
    Alert.alert(
      'Membership Tier',
      `You selected the ${planName} membership. Secure checkout and invoice generation will open next.`,
      [{ text: 'Continue' }, { text: 'Cancel', style: 'cancel' }]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <CyberGlowBackground glowIntensity="subtle" />
      <Header />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.headerBox}>
          <Text style={[styles.tracker, { color: theme.primary }]}>MEMBERSHIP &amp; ACCESS</Text>
          <Text style={[styles.title, { color: theme.text }]}>Transparent Plans</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Designed for emerging Goan creators, active influencers, and partner hotels.
          </Text>
        </View>

        {/* Plans List */}
        <View style={styles.plansContainer}>
          {PRICING_PLANS.map((plan, idx) => {
            return (
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

                <Text style={[styles.planName, { color: theme.text }]}>{plan.name}</Text>
                <Text style={[styles.planDesc, { color: theme.textSecondary }]}>{plan.desc}</Text>

                <View style={styles.priceRow}>
                  <Text style={[styles.priceNumber, { color: theme.text }]}>{plan.price}</Text>
                  <Text style={[styles.pricePeriod, { color: theme.textSecondary }]}>
                    {plan.period}
                  </Text>
                </View>

                {/* Features List */}
                <View style={[styles.featuresBox, { borderTopColor: theme.border, borderBottomColor: theme.border }]}>
                  {plan.features.map((feature, fIdx) => (
                    <View key={fIdx} style={styles.featureItem}>
                      <View style={[styles.checkCircle, { backgroundColor: theme.primaryLight }]}>
                        <Feather name="check" size={11} color={theme.primary} />
                      </View>
                      <Text style={[styles.featureText, { color: theme.text }]}>{feature}</Text>
                    </View>
                  ))}
                </View>

                {/* CTA Button */}
                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={() => handleSelectPlan(plan.name)}
                  style={[
                    styles.ctaButton,
                    {
                      backgroundColor: plan.popular ? theme.primary : theme.surface,
                      borderColor: plan.popular ? theme.primary : theme.border,
                      borderWidth: 1,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.ctaButtonText,
                      { color: plan.popular ? '#FFFFFF' : theme.text },
                    ]}>
                    {plan.cta}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </ScrollView>
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
  headerBox: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  tracker: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  plansContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 16,
  },
  planCard: {
    borderRadius: 0,
    padding: 16,
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 0,
  },
  popularBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  planName: {
    fontSize: 18,
    fontWeight: '800',
  },
  planDesc: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  priceNumber: {
    fontSize: 28,
    fontWeight: '800',
  },
  pricePeriod: {
    fontSize: 13,
    marginLeft: 3,
  },
  featuresBox: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: 14,
    gap: 10,
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkCircle: {
    width: 18,
    height: 18,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: 13,
    flex: 1,
  },
  ctaButton: {
    paddingVertical: 12,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
