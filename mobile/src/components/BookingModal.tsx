import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Creator } from '@/constants/mock-data';
import { useTheme } from '@/hooks/use-theme';
import { CreatorSummaryPill } from '@/components/booking/CreatorSummaryPill';
import { CollabTypeSelector } from '@/components/booking/CollabTypeSelector';
import { DeliverableOptions } from '@/components/booking/DeliverableOptions';

interface BookingModalProps {
  visible: boolean;
  creator: Creator | null;
  onClose: () => void;
  onSubmit: (details: any) => Promise<void> | void;
}

export function BookingModal({ visible, creator, onClose, onSubmit }: BookingModalProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const [collabType, setCollabType] = useState<'paid' | 'barter'>('paid');
  const [selectedDeliverable, setSelectedDeliverable] = useState<string>('1x Instagram Reel (60s)');
  const [budget, setBudget] = useState('8,000');
  const [campaignTitle, setCampaignTitle] = useState('');
  const [dates, setDates] = useState('First weekend of next month');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!creator) return null;

  const deliverables = [
    '1x Instagram Reel (60s)',
    '1x Photo Carousel + 3 Stories',
    'Full Experience UGC Package',
  ];

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit({
        creatorId: creator.id,
        creatorName: creator.name,
        collabType,
        selectedDeliverable,
        budget,
        campaignTitle: campaignTitle || 'Coastal Collaboration Brief',
        dates,
        notes,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              paddingBottom: Math.max(insets.bottom, 20) + 12,
            },
          ]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <View>
              <Text style={[styles.headerTitle, { color: theme.text }]}>Collab Proposal</Text>
              <Text style={[styles.headerSub, { color: theme.textSecondary }]}>
                Direct pitch to {creator.name}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Feather name="x" size={16} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            {/* Modular Creator Summary */}
            <CreatorSummaryPill creator={creator} />

            {/* Campaign Title */}
            <Text style={[styles.sectionLabel, { color: theme.text }]}>Campaign Objective / Title</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              placeholder="e.g. Sunset Menu Tasting & Villa Reel"
              placeholderTextColor={theme.textMuted}
              value={campaignTitle}
              onChangeText={setCampaignTitle}
            />

            {/* Modular Collab Model Selector */}
            <Text style={[styles.sectionLabel, { color: theme.text }]}>Collaboration Model</Text>
            <CollabTypeSelector value={collabType} onChange={setCollabType} />

            {/* Offer / Budget */}
            {collabType === 'paid' ? (
              <>
                <Text style={[styles.sectionLabel, { color: theme.text }]}>Budget Offer (₹)</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.border,
                      color: theme.text,
                    },
                  ]}
                  placeholder="8,000"
                  placeholderTextColor={theme.textMuted}
                  value={budget}
                  onChangeText={setBudget}
                  keyboardType="numeric"
                />
              </>
            ) : (
              <>
                <Text style={[styles.sectionLabel, { color: theme.text }]}>Barter Experience Description</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.border,
                      color: theme.text,
                    },
                  ]}
                  placeholder="e.g. 2-Night Stay at Luxury Beachfront Villa + Dinner for 2"
                  placeholderTextColor={theme.textMuted}
                  value={budget}
                  onChangeText={setBudget}
                />
              </>
            )}

            {/* Modular Deliverables */}
            <Text style={[styles.sectionLabel, { color: theme.text }]}>Requested Deliverable</Text>
            <DeliverableOptions
              options={deliverables}
              selectedOption={selectedDeliverable}
              onSelectOption={setSelectedDeliverable}
            />

            {/* Campaign Dates */}
            <Text style={[styles.sectionLabel, { color: theme.text }]}>Preferred Timeline</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              value={dates}
              onChangeText={setDates}
              placeholder="Timeline details"
              placeholderTextColor={theme.textMuted}
            />

            {/* Brief Notes */}
            <Text style={[styles.sectionLabel, { color: theme.text }]}>Brief & Deliverable Notes</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              placeholder="Include location specifics, mood board links, product details..."
              placeholderTextColor={theme.textMuted}
              multiline
              numberOfLines={3}
              value={notes}
              onChangeText={setNotes}
            />

            {/* Submit CTA */}
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleSubmit}
              disabled={submitting}
              style={[styles.submitBtn, { backgroundColor: theme.primary }]}>
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Feather name="send" size={15} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.submitBtnText}>Dispatch Campaign Proposal</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderWidth: 1,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 0,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    padding: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  input: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
    borderRadius: 0,
    fontSize: 13,
    marginBottom: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 0,
    marginTop: 8,
    marginBottom: 30,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
