import { Platform } from 'react-native';
import { Creator, MOCK_CREATORS, TRUST_METRICS } from '@/constants/mock-data';

function getBaseUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname || 'localhost';
      return `${window.location.protocol}//${hostname}:3000`;
    }
  }
  return 'http://localhost:3000';
}

export const API_BASE_URL = getBaseUrl();

// Helper to format follower counts into e.g. 120K
function formatFollowers(num: number): string {
  if (!num) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return Math.round(num / 1000) + 'K';
  return String(num);
}

// Convert a backend creator card row to our mobile Creator model
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

export const api = {
  // Fetch live public platform KPIs
  async getPublicStats() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/stats/public`, {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return [
            {
              value: `${json.data.creators || 120}+`,
              title: 'Vetted Goa Creators',
              subtitle: 'North & South Goa',
            },
            {
              value: `${json.data.completed_collaborations || 110}+`,
              title: 'Collabs Done',
              subtitle: 'Verified campaigns',
            },
            {
              value: `${Number(json.data.platform_avg_rating || 4.4).toFixed(1)} / 5`,
              title: 'Average Rating',
              subtitle: 'Brand reviews',
            },
            {
              value: `${json.data.businesses || 40}+`,
              title: 'Hospitality Brands',
              subtitle: 'Goa partner venues',
            },
          ];
        }
      }
    } catch {
      // Offline fallback
    }
    return TRUST_METRICS;
  },

  // Fetch creators with query filters
  async getCreators(params: {
    q?: string;
    district?: string;
    category?: string;
    collabType?: string;
    verifiedOnly?: boolean;
  } = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.q) queryParams.set('q', params.q);
      if (params.district && params.district !== 'All') queryParams.set('district', params.district);
      if (params.category && params.category !== 'all') queryParams.set('category', params.category);
      if (params.collabType) queryParams.set('collabType', params.collabType);
      if (params.verifiedOnly) queryParams.set('verifiedOnly', 'true');

      const url = `${API_BASE_URL}/api/creators?${queryParams.toString()}`;
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          return json.data.map(mapBackendCreator);
        }
      }
    } catch {
      // Offline fallback
    }
    return MOCK_CREATORS;
  },

  // Fetch taxonomy (locations and categories)
  async getTaxonomy() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/taxonomy`, {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          return {
            categories: json.categories || [],
            locations: json.locations || [],
          };
        }
      }
    } catch {
      // Offline fallback
    }
    return { categories: [], locations: [] };
  },

  // Fetch collaborations
  async getCollaborations() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/collaborations`, {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          return json.data.map((c: any) => ({
            id: String(c.request_id || c.id || Math.random()),
            creatorName: c.creator_name || c.full_name || 'Goan Creator',
            creatorHandle: c.creator_handle || c.handle || '@creator',
            creatorAvatar: c.creator_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
            businessName: c.business_name || 'Partner Venue',
            campaignTitle: c.offer_details || c.campaign_name || 'Goan Hospitality Campaign',
            deliverables: typeof c.deliverables === 'string' ? c.deliverables : (Array.isArray(c.deliverables) ? c.deliverables.join(', ') : '1x Reel + 2x Stories'),
            dates: c.deadline ? `Due ${new Date(c.deadline).toLocaleDateString()}` : 'Upcoming',
            status: (c.status === 'in_progress' ? 'In Progress' : c.status === 'accepted' ? 'Accepted' : c.status === 'completed' ? 'Completed' : 'Pending') as any,
            compensation: c.offered_amount > 0 ? `₹${Number(c.offered_amount).toLocaleString('en-IN')}` : 'Barter Stay / Experience',
            isBarter: c.collab_type === 'barter',
          }));
        }
      }
    } catch {
      // Offline fallback
    }
    return null;
  },

  // Submit a collaboration request
  async sendCollabRequest(payload: {
    creatorId: string | number;
    campaignTitle: string;
    collabType: 'paid' | 'barter' | 'hybrid';
    offeredAmount: number;
    deliverables: string;
    offerDetails?: string;
    message?: string;
    deadline?: string;
  }) {
    try {
      // Future date for deadline
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 14);
      const deadlineStr = futureDate.toISOString().split('T')[0];

      const res = await fetch(`${API_BASE_URL}/api/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          creator_id: Number(payload.creatorId) || 1,
          collab_type: payload.collabType,
          offered_amount: payload.offeredAmount || 0,
          deliverables: payload.deliverables,
          offer_details: payload.offerDetails || payload.campaignTitle,
          message: payload.message || `Proposal for ${payload.campaignTitle}`,
          deadline: payload.deadline || deadlineStr,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        return { success: true, data: json };
      }
    } catch {
      // Offline fallback simulation
    }
    return { success: true, simulated: true };
  },
};
