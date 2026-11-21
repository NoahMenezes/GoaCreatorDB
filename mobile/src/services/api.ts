import { Platform } from 'react-native';
import { MOCK_CREATORS, TRUST_METRICS } from '@/constants/mock-data';
import { saveToken, getToken, removeToken } from './storage';
import { formatFollowers, mapBackendCreator } from './mappers';

export { saveToken, getToken, removeToken, formatFollowers, mapBackendCreator };

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

export const api = {
  // Authentication: Login
  async login(email: string, pass: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: pass }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.token) {
          await saveToken(data.token);
        }
        return { success: true, user: data.user, profile: data.profile };
      }
      return { success: false, error: data.error || 'Invalid credentials' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error connecting to GoaConnect backend' };
    }
  },

  // Authentication: Register
  async register(payload: {
    email: string;
    password: string;
    role: 'business' | 'creator';
    fullName?: string;
    locationId?: number;
    businessName?: string;
    industry?: string;
  }) {
    try {
      const body: any = {
        email: payload.email.trim(),
        password: payload.password,
        role: payload.role,
        location_id: payload.locationId || 1,
      };

      if (payload.role === 'business') {
        body.businessData = {
          business_name: payload.businessName || payload.fullName || 'Goan Hospitality Venue',
          industry: payload.industry || 'Food & Beach Dining',
        };
      } else {
        body.creatorData = {
          full_name: payload.fullName || 'Goa Creator',
          bio: 'Verified Goan storyteller and content creator',
          accepts_barter: true,
          min_paid_rate: 6500,
        };
      }

      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.token) {
          await saveToken(data.token);
        }
        return { success: true, user: data.user, profile: data.profile };
      }
      return { success: false, error: data.error || 'Registration failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during registration' };
    }
  },

  // Authentication: Current User
  async getMe() {
    try {
      const token = await getToken();
      const headers: Record<string, string> = { Accept: 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, { headers });
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch {}
    return { authenticated: false, user: null, profile: null };
  },

  // Authentication: Logout
  async logout() {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, { method: 'POST' });
    } catch {}
    await removeToken();
  },

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
      const token = await getToken();
      const headers: Record<string, string> = { Accept: 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/api/collaborations`, { headers });
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
      const token = await getToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 14);
      const deadlineStr = futureDate.toISOString().split('T')[0];

      const res = await fetch(`${API_BASE_URL}/api/requests`, {
        method: 'POST',
        headers,
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
      // Offline simulation
    }
    return { success: true, simulated: true };
  },
};
