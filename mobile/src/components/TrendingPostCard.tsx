import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';

interface TrendingPostCardProps {
  author?: string;
  handle?: string;
  timeAgo?: string;
  avatarUri?: string;
  imageUri?: string;
  caption?: string;
  onPress?: () => void;
  onBookmark?: (saved: boolean) => void;
}

export function TrendingPostCard({
  author = 'James Cameron',
  handle = '@jihyo_james',
  timeAgo = '6 hour ago',
  avatarUri = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
  imageUri = 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000&auto=format&fit=crop',
  caption = 'Neutral tones, maximum impact. This drop is crafted for luxury stays and boutique spaces.',
  onPress,
  onBookmark,
}: TrendingPostCardProps) {
  const theme = useTheme();
  const [bookmarked, setBookmarked] = useState(false);

  const toggleBookmark = () => {
    const next = !bookmarked;
    setBookmarked(next);
    onBookmark?.(next);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
        },
      ]}>
      {/* Post Top Header matching Screen 2 */}
      <View style={styles.headerRow}>
        <View style={styles.authorGroup}>
          <Image source={{ uri: avatarUri }} style={styles.avatar} />
          <View style={styles.authorMeta}>
            <View style={styles.nameTimeRow}>
              <Text style={[styles.authorName, { color: theme.text }]}>{author}</Text>
              <Text style={styles.dotSeparator}>•</Text>
              <Text style={[styles.timeAgo, { color: theme.textSecondary }]}>{timeAgo}</Text>
            </View>
            <Text style={[styles.handleText, { color: theme.textSecondary }]}>{handle}</Text>
          </View>
        </View>

        <TouchableOpacity activeOpacity={0.7} style={styles.moreBtn}>
          <Feather name="more-horizontal" size={18} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Main Image in black hoodie & sunglasses matching Screen 2 */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUri }} style={styles.postImage} resizeMode="cover" />
      </View>

      {/* Caption & Actions Footer */}
      <View style={styles.footerRow}>
        <Text style={[styles.captionText, { color: theme.textSecondary }]} numberOfLines={2}>
          {caption}
        </Text>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={toggleBookmark}
          style={[
            styles.bookmarkBtn,
            {
              backgroundColor: bookmarked ? theme.primary : theme.surface,
              borderColor: bookmarked ? theme.primary : theme.border,
            },
          ]}>
          <Feather
            name="bookmark"
            size={14}
            color={bookmarked ? '#FFFFFF' : theme.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 0,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  authorGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#EF1717',
    backgroundColor: '#17191C',
  },
  authorMeta: {
    justifyContent: 'center',
  },
  nameTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorName: {
    fontSize: 13,
    fontWeight: '700',
  },
  dotSeparator: {
    color: '#6B7280',
    fontSize: 11,
  },
  timeAgo: {
    fontSize: 11,
    fontWeight: '500',
  },
  handleText: {
    fontSize: 10,
    marginTop: 1,
  },
  moreBtn: {
    padding: 4,
  },
  imageContainer: {
    width: '100%',
    height: 280,
    backgroundColor: '#0F1016',
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  captionText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },
  bookmarkBtn: {
    width: 32,
    height: 32,
    borderRadius: 0,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

