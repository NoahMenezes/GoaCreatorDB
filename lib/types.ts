export interface UserRecord {
  user_id: number
  email: string
  password_hash: string
  role: 'admin' | 'business' | 'creator'
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface BusinessRecord {
  business_id: number
  user_id: number
  location_id: number
  business_name: string
  industry: string | null
  description: string | null
  contact_phone: string | null
  instagram_handle: string | null
}

export interface CreatorRecord {
  creator_id: number
  user_id: number
  location_id: number
  full_name: string
  bio: string | null
  accepts_barter: boolean
  min_paid_rate: number
  created_at: string
}

export interface LocationRecord {
  location_id: number
  area_name: string
  taluka: string
  district: 'North Goa' | 'South Goa'
}

export interface CategoryRecord {
  category_id: number
  category_name: string
}

export interface CreatorCategoryRecord {
  creator_id: number
  category_id: number
  is_primary: boolean
}

export interface SocialAccountRecord {
  account_id: number
  creator_id: number
  platform: 'instagram' | 'youtube'
  handle: string
  profile_url: string | null
}

export interface CreatorMetricRecord {
  metric_id: number
  account_id: number
  follower_count: number
  avg_likes: number | null
  avg_views: number | null
  avg_comments: number | null
  engagement_rate: number | null
  audience_goa_pct: number | null
  data_source: 'self_reported' | 'admin_verified'
  verified_by: number | null
  recorded_at: string
}

export interface CollaborationRequestRecord {
  request_id: number
  business_id: number
  creator_id: number
  collab_type: 'paid' | 'barter' | 'hybrid'
  offered_amount: number
  offer_details: string | null
  deliverables: string | null
  message: string | null
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled'
  requested_at: string
  responded_at: string | null
  deadline: string
}

export interface ReviewRecord {
  review_id: number
  request_id: number
  reviewer_id: number
  reviewee_id: number
  rating: number
  comment: string | null
  created_at: string
}

export interface ShortlistRecord {
  business_id: number
  creator_id: number
  note: string | null
  saved_at: string
}

export interface SessionRecord {
  session_id: number
  token: string
  user_id: number
  created_at: string
  expires_at: string
}

export interface PasswordResetTokenRecord {
  token_id: number
  user_id: number
  token_hash: string
  expires_at: string
  used_at: string | null
}

export interface AuditLogRecord {
  log_id: number
  table_name: string
  record_id: number
  action: 'INSERT' | 'UPDATE' | 'DELETE'
  old_data: Record<string, unknown> | null
  new_data: Record<string, unknown> | null
  changed_by: number | null
  changed_at: string
}
