import { Creator, MOCK_CREATORS } from '@/constants/mock-data';

export function formatFollowers(num: number): string {
  if (!num) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return Math.round(num / 1000) + 'K';
  return String(num);
}

export function mapBackendCreator(row: any): Creator {
  const creatorId = String(row.creator_id || row.id || Math.random());
  const fallback = MOCK_CREATORS[Math.abs(Number(row.creator_id || 1)) % MOCK_CREATORS.length];

  return {
    id: creatorId,
    name: row.full_name || row.displayName || row.name || 'Goan Creator',
    handle: row.handle ? (row.handle.startsWith('@') ? row.handle : `@${row.handle}`) : fallback.handle,
    avatar: row.avatar_url || row.avatar || fallback.avatar,
    cover: row.cover_image_url || row.coverImage || fallback.cover,
    tag: row.primary_category || (Array.isArray(row.categories) ? row.categories[0] : null) || fallback.tag,
    location: row.area_name || row.location || 'Goa',
    district: row.district === 'South Goa' ? 'South Goa' : 'North Goa',
    followers: row.total_followers ? formatFollowers(Number(row.total_followers)) : fallback.followers,
    engagement: row.avg_engagement_rate ? `${Number(row.avg_engagement_rate).toFixed(1)}%` : fallback.engagement,
    rate: row.min_paid_rate ? `Min ₹${Number(row.min_paid_rate).toLocaleString('en-IN')}` : fallback.rate,
    collabType: row.accepts_barter ? 'BARTER FRIENDLY' : 'PAID ONLY',
    verified: Boolean(row.is_verified),
    reviewsCount: Number(row.review_count || row.reviewsCount || fallback.reviewsCount),
    rating: Number(row.avg_rating || fallback.rating),
    bio: row.bio || fallback.bio,
    specialties: Array.isArray(row.categories) && row.categories.length > 0 ? row.categories : fallback.specialties,
  };
}

