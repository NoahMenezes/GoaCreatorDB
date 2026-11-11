export interface UserRecord {
    user_id: string
    email: string
    password_hash: string
    role: 'admin' | 'business' | 'creator'
    is_verified: boolean
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface BusinessRecord {
    business_id: string
    user_id: string
    location_id: string
    business_name: string
    industry: string
    description: string
    contact_phone: string
    instagram_handle: string
    avatar_url?: string
}

export interface CreatorRecord {
    creator_id: string
    user_id: string
    location_id: string
    full_name: string
    bio: string
    accepts_barter: boolean
    min_paid_rate: number
    avatar_url?: string
    created_at: string
}

export interface LocationRecord {
    location_id: string
    area_name: string
    taluka: string
    district: 'North Goa' | 'South Goa'
}

export interface CategoryRecord {
    category_id: string
    category_name: string
}

export const INITIAL_LOCATIONS: LocationRecord[] = [
    { location_id: 'loc-1', area_name: 'Panjim', taluka: 'Tiswadi', district: 'North Goa' },
    { location_id: 'loc-2', area_name: 'Calangute', taluka: 'Bardez', district: 'North Goa' },
    { location_id: 'loc-3', area_name: 'Assagao', taluka: 'Bardez', district: 'North Goa' },
    { location_id: 'loc-4', area_name: 'Morjim', taluka: 'Pernem', district: 'North Goa' },
    { location_id: 'loc-5', area_name: 'Vagator', taluka: 'Bardez', district: 'North Goa' },
    { location_id: 'loc-6', area_name: 'Margao', taluka: 'Salcete', district: 'South Goa' },
    { location_id: 'loc-7', area_name: 'Vasco da Gama', taluka: 'Mormugao', district: 'South Goa' },
    { location_id: 'loc-8', area_name: 'Mapusa', taluka: 'Bardez', district: 'North Goa' },
]

export const INITIAL_CATEGORIES: CategoryRecord[] = [
    { category_id: 'cat-1', category_name: 'Food & Dining' },
    { category_id: 'cat-2', category_name: 'Boutique Resorts' },
    { category_id: 'cat-3', category_name: 'Nightlife & Music' },
    { category_id: 'cat-4', category_name: 'Travel & Adventure' },
    { category_id: 'cat-5', category_name: 'Fashion & Lifestyle' },
    { category_id: 'cat-6', category_name: 'Yoga & Wellness' },
]

