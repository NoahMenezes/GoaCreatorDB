import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Creator } from '@/constants/mock-data';
import { useTheme } from '@/hooks/use-theme';

interface BookingModalProps {
  visible: boolean;
  creator: Creator | null;
  onClose: () => void;
  onSubmit: (details: any) => void;
}

export function BookingModal({ visible, creator, onClose, onSubmit }: BookingModalProps) {
  const theme = useTheme();

  const [collabType, setCollabType] = useState<'paid' | 'barter'>('paid');
  const [selectedDeliverable, setSelectedDeliverable] = useState<string>('1x Instagram Reel (60s)');
  const [budget, setBudget] = useState('8,000');
  const [campaignTitle, setCampaignTitle] = useState('');
  const [dates, setDates] = useState('First weekend of next month');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!creator) return null;

  const deliverables = [
    '1x Instagram Reel (60s)',
    '1x Photo Carousel + 3 Stories',
    'Full Experience UGC Package',
    'Brand Event Appearance',
  ];

  const handleSend = () => {
    setSubmitted(true);
    setTimeout(() => {
      onSubmit({
        creatorId: creator.id,
        creatorName: creator.name,
        collabType,
        selectedDeliverable,
        budget,
        campaignTitle: campaignTitle || 'Goan Collaboration Request',
        dates,
        notes,
      });
      setSubmitted(false);
      onClose();
    }, 1200);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <View>
              <Text style={[styles.headerTitle, { color: theme.text }]}>Book Collaboration</Text>
              <Text style={[styles.headerSub, { color: theme.textSecondary }]}>
                Direct proposal to {creator.name}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Feather name="x" size={18} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            {/* Creator Summary Pill */}
            <View style={[styles.creatorPill, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Image source={{ uri: creator.avatar }} style={styles.creatorAvatar} />
              <View style={styles.creatorMeta}>
                <Text style={[styles.creatorName, { color: theme.text }]}>{creator.name}</Text>
                <Text style={[styles.creatorHandle, { color: theme.secondary }]}>
                  {creator.handle} • {creator.location}
                </Text>
              </View>
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor:
                      creator.collabType === 'BARTER FRIENDLY'
                        ? theme.badgeBarterBg
                        : theme.badgePaidBg,
                  },
                ]}>
                <Text
                  style={[
                    styles.badgeText,
                    {
                      color:
                        creator.collabType === 'BARTER FRIENDLY'
                          ? theme.badgeBarter
                          : theme.badgePaid,
                    },
                  ]}>
                  {creator.collabType}
                </Text>
              </View>
            </View>

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

            {/* Collab Model Selector */}
            <Text style={[styles.sectionLabel, { color: theme.text }]}>Collaboration Model</Text>
            <View style={styles.collabTypeRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setCollabType('paid')}
                style={[
                  styles.typeButton,
                  {
                    borderColor: collabType === 'paid' ? theme.primary : theme.border,
                    backgroundColor: collabType === 'paid' ? theme.primaryLight : theme.surface,
                  },
                ]}>
                <Feather
                  name="dollar-sign"
                  size={16}
                  color={collabType === 'paid' ? theme.primary : theme.textSecondary}
                />
                <Text
                  style={[
                    styles.typeButtonText,
                    { color: collabType === 'paid' ? theme.primary : theme.text },
                  ]}>
                  Paid Campaign
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setCollabType('barter')}
                style={[
                  styles.typeButton,
                  {
                    borderColor: collabType === 'barter' ? theme.primary : theme.border,
                    backgroundColor: collabType === 'barter' ? theme.primaryLight : theme.surface,
                  },
                ]}>
                <Feather
                  name="gift"
                  size={16}
                  color={collabType === 'barter' ? theme.primary : theme.textSecondary}
                />
                <Text
                  style={[
                    styles.typeButtonText,
                    { color: collabType === 'barter' ? theme.primary : theme.text },
                  ]}>
                  Barter / Stay
                </Text>
              </TouchableOpacity>
            </View>

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
                  placeholder="e.g. 2-Night Stay at Luxury Beachfront Villa + Food & Beverage for 2"
                  placeholderTextColor={theme.textMuted}
                  value={budget}
                  onChangeText={setBudget}
                />
              </>
            )}

            {/* Deliverables */}
            <Text style={[styles.sectionLabel, { color: theme.text }]}>Deliverables Requested</Text>
            {deliverables.map((item) => {
              const selected = selectedDeliverable === item;
              return (
                <TouchableOpacity
                  key={item}
                  activeOpacity={0.7}
                  onPress={() => setSelectedDeliverable(item)}
                  style={[
                    styles.deliverableItem,
                    {
                      borderColor: selected ? theme.primary : theme.border,
                      backgroundColor: selected ? theme.primaryLight : theme.surface,
                    },
                  ]}>
                  <View
                    style={[
                      styles.radioCircle,
                      {
                        borderColor: selected ? theme.primary : theme.border,
                        backgroundColor: selected ? theme.primary : 'transparent',
                      },
                    ]}>
                    {selected && <Feather name="check" size={10} color="#FFFFFF" />}
                  </View>
                  <Text
                    style={[
                      styles.deliverableText,
                      { color: selected ? theme.primary : theme.text },
                    ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {/* Shoot Dates */}
            <Text style={[styles.sectionLabel, { color: theme.text }]}>Preferred Shoot / Posting Dates</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              placeholder="e.g. Next weekend, 28th Nov"
              placeholderTextColor={theme.textMuted}
              value={dates}
              onChangeText={setDates}
            />

            {/* Extra Notes */}
            <Text style={[styles.sectionLabel, { color: theme.text }]}>Campaign Brief Notes</Text>
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
              placeholder="Share creative direction, brand hashtags, special requirements..."
              placeholderTextColor={theme.textMuted}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />

            {/* Submit Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleSend}
              disabled={submitted}
              style={[styles.submitButton, { backgroundColor: theme.primary }]}>
              {submitted ? (
                <View style={styles.btnRow}>
                  <Feather name="check" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.submitButtonText}>Request Sent Successfully!</Text>
                </View>
              ) : (
                <View style={styles.btnRow}>
                  <Feather name="send" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.submitButtonText}>Send Collaboration Request</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 24,
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
    fontWeight: '700',
  },
  headerSub: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  creatorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  creatorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  creatorMeta: {
    flex: 1,
  },
  creatorName: {
    fontSize: 14,
    fontWeight: '700',
  },
  creatorHandle: {
    fontSize: 11,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  collabTypeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    gap: 6,
  },
  typeButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  deliverableItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 6,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  deliverableText: {
    fontSize: 13,
    fontWeight: '500',
  },
  submitButton: {
    marginTop: 20,
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

