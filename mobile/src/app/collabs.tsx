import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Header } from '@/components/Header';
import { CyberGlowBackground } from '@/components/CyberGlowBackground';
import { MOCK_COLLABS } from '@/constants/mock-data';
import { useTheme } from '@/hooks/use-theme';
import { api } from '@/services/api';

export default function CollabsScreen() {
  const theme = useTheme();
  const [filter, setFilter] = useState<'all' | 'active' | 'pending' | 'completed'>('all');
  const [collabs, setCollabs] = useState(MOCK_COLLABS);

  useEffect(() => {
    api.getCollaborations().then((data) => {
      if (data && data.length > 0) {
        setCollabs(data);
      }
    });
  }, []);

  const filteredCollabs = collabs.filter((item) => {
    if (filter === 'active') return item.status === 'In Progress' || item.status === 'Accepted';
    if (filter === 'pending') return item.status === 'Pending';
    if (filter === 'completed') return item.status === 'Completed';
    return true;
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'In Progress':
        return { bg: theme.primaryLight, text: theme.primary, border: theme.primaryBorder };
      case 'Accepted':
        return { bg: 'rgba(16,185,129,0.15)', text: '#10B981', border: 'rgba(16,185,129,0.3)' };
      case 'Pending':
        return { bg: theme.goldLight, text: theme.gold, border: theme.goldBorder };
      case 'Completed':
        return { bg: 'rgba(255,255,255,0.08)', text: '#9497A8', border: theme.border };
      default:
        return { bg: theme.surface, text: theme.text, border: theme.border };
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <CyberGlowBackground glowIntensity="subtle" />
      <Header />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Title */}
        <View style={styles.headerBox}>
          <Text style={[styles.title, { color: theme.text }]}>Collaboration Pipeline</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Active briefs, deliverable submissions, and campaign milestones.
          </Text>
        </View>

        {/* Filter Bar with sharp 8px corners */}
        <View style={[styles.filterBar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'active', label: 'Active' },
              { id: 'pending', label: 'Pending' },
              { id: 'completed', label: 'Done' },
            ] as const
          ).map((t) => {
            const active = filter === t.id;
            return (
              <TouchableOpacity
                key={t.id}
                activeOpacity={0.8}
                onPress={() => setFilter(t.id)}
                style={[
                  styles.filterTab,
                  { backgroundColor: active ? theme.primary : 'transparent' },
                ]}>
                <Text
                  style={[
                    styles.filterTabText,
                    { color: active ? '#FFFFFF' : theme.textSecondary },
                  ]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Collab Cards */}
        <View style={styles.listContainer}>
          {filteredCollabs.map((collab) => {
            const statusStyle = getStatusStyle(collab.status);
            return (
              <View
                key={collab.id}
                style={[
                  styles.card,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                  },
                ]}>
                {/* Header: Creator & Status */}
                <View style={styles.cardHeader}>
                  <Image source={{ uri: collab.creatorAvatar }} style={styles.avatar} />
                  <View style={styles.creatorInfo}>
                    <Text style={[styles.creatorName, { color: theme.text }]}>{collab.creatorName}</Text>
                    <Text style={[styles.businessText, { color: theme.primary }]}>
                      {collab.businessName}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: statusStyle.bg,
                        borderColor: statusStyle.border,
                      },
                    ]}>
                    <Text style={[styles.statusText, { color: statusStyle.text }]}>
                      {collab.status}
                    </Text>
                  </View>
                </View>

                {/* Campaign Title & Deliverables */}
                <View style={styles.bodyBox}>
                  <Text style={[styles.campaignTitle, { color: theme.text }]}>
                    {collab.campaignTitle}
                  </Text>
                  <View style={styles.detailRow}>
                    <Feather name="layers" size={12} color={theme.textSecondary} />
                    <Text style={[styles.detailText, { color: theme.textSecondary }]}>
                      {collab.deliverables}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Feather name="calendar" size={12} color={theme.textSecondary} />
                    <Text style={[styles.detailText, { color: theme.textSecondary }]}>
                      {collab.dates}
                    </Text>
                  </View>
                </View>

                {/* Footer: Compensation & Actions */}
                <View style={[styles.footerRow, { borderTopColor: theme.borderSubtle }]}>
                  <View>
                    <Text style={[styles.compLabel, { color: theme.textMuted }]}>Terms</Text>
                    <Text style={[styles.compValue, { color: theme.primary }]}>
                      {collab.compensation}
                    </Text>
                  </View>

                  <View style={styles.actionBtns}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => Alert.alert('Chat', `Open messaging with ${collab.creatorName}`)}
                      style={[styles.smallBtn, { borderColor: theme.border, backgroundColor: theme.surface }]}>
                      <Feather name="message-square" size={12} color={theme.text} />
                      <Text style={[styles.smallBtnText, { color: theme.text }]}>Chat</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.88}
                      onPress={() =>
                        Alert.alert('Deliverables', `Viewing deliverable files for ${collab.campaignTitle}`)
                      }
                      style={[styles.smallBtnPrimary, { backgroundColor: theme.primary }]}>
                      <Text style={styles.smallBtnPrimaryText}>Review</Text>
                    </TouchableOpacity>
                  </View>
                </View>
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
    paddingBottom: 10,
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
  filterBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    padding: 3,
    borderRadius: 0,
    borderWidth: 1,
    marginBottom: 16,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 0,
  },
  filterTabText: {
    fontSize: 11,
    fontWeight: '700',
  },
  listContainer: {
    paddingHorizontal: 16,
    gap: 14,
  },
  card: {
    borderRadius: 0,
    borderWidth: 1,
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 0,
    marginRight: 10,
  },
  creatorInfo: {
    flex: 1,
  },
  creatorName: {
    fontSize: 14,
    fontWeight: '700',
  },
  businessText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 0,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  bodyBox: {
    gap: 4,
    marginBottom: 12,
  },
  campaignTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 12,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
  },
  compLabel: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  compValue: {
    fontSize: 13,
    fontWeight: '800',
  },
  actionBtns: {
    flexDirection: 'row',
    gap: 8,
  },
  smallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 0,
    borderWidth: 1,
    gap: 4,
  },
  smallBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  smallBtnPrimary: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
