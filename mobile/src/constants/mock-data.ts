export interface Creator {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  cover: string;
  tag: string;
  location: string;
  district: 'North Goa' | 'South Goa';
  followers: string;
  engagement: string;
  rate: string;
  collabType: 'BARTER FRIENDLY' | 'PAID ONLY';
  verified: boolean;
  reviewsCount: number;
  rating: number;
  bio: string;
  specialties: string[];
}

export const MOCK_CREATORS: Creator[] = [
  {
    id: 'c1',
    name: 'Sneha Ferns',
    handle: '@sneha_demo',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
    cover: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800&auto=format&fit=crop',
    tag: 'Food & Dining',
    location: 'Assagao',
    district: 'North Goa',
    followers: '120K',
    engagement: '7.8%',
    rate: 'Min ₹8,000',
    collabType: 'BARTER FRIENDLY',
    verified: true,
    reviewsCount: 38,
    rating: 4.9,
    bio: 'Uncovering authentic Goan heritage recipes, beachfront cafes, and modern culinary bistros across North & South Goa.',
    specialties: ['Cafe Reviews', 'Food Reels', 'Recipe Stories', 'Chef Spotlight'],
  },
  {
    id: 'c2',
    name: 'Rahul Naik',
    handle: '@rahul_demo',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
    cover: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=800&auto=format&fit=crop',
    tag: 'Heritage Dining',
    location: 'Panjim',
    district: 'North Goa',
    followers: '85K',
    engagement: '9.2%',
    rate: 'Min ₹6,500',
    collabType: 'PAID ONLY',
    verified: true,
    reviewsCount: 29,
    rating: 4.8,
    bio: 'Documenting Indo-Portuguese architecture, Latin Quarter tavernas, and secret heritage dining corners of Goa.',
    specialties: ['Architectural Reels', 'Taverna Trails', 'Cultural Storytelling'],
  },
  {
    id: 'c3',
    name: 'Rohan Tide',
    handle: '@rohan_demo',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop',
    cover: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=800&auto=format&fit=crop',
    tag: 'Cocktails & Nightlife',
    location: 'Anjuna',
    district: 'North Goa',
    followers: '195K',
    engagement: '6.5%',
    rate: 'Min ₹14,000',
    collabType: 'BARTER FRIENDLY',
    verified: true,
    reviewsCount: 45,
    rating: 5.0,
    bio: 'Craft mixology enthusiast, sunset music sessions, and nightlife event curation across coastal beach bars.',
    specialties: ['Sunset DJ Mixers', 'Bar Takeovers', 'Cocktail Photography'],
  },
  {
    id: 'c4',
    name: 'Ananya D’Souza',
    handle: '@ananya_goan',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400&auto=format&fit=crop',
    cover: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800&auto=format&fit=crop',
    tag: 'Boutique Resorts',
    location: 'Palolem',
    district: 'South Goa',
    followers: '142K',
    engagement: '8.4%',
    rate: 'Min ₹10,000',
    collabType: 'BARTER FRIENDLY',
    verified: true,
    reviewsCount: 31,
    rating: 4.9,
    bio: 'Luxury villa escapes, tranquil coastal hideaways, and slow living across pristine South Goan beaches.',
    specialties: ['Villa Video Tours', 'Resort Stay Reels', 'Aesthetic Carousels'],
  },
  {
    id: 'c5',
    name: 'Vikram Kamat',
    handle: '@vikram_waves',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop',
    cover: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop',
    tag: 'Travel & Adventure',
    location: 'Morjim',
    district: 'North Goa',
    followers: '98K',
    engagement: '7.1%',
    rate: 'Min ₹7,500',
    collabType: 'BARTER FRIENDLY',
    verified: false,
    reviewsCount: 16,
    rating: 4.7,
    bio: 'Surf instructor and eco-adventurer capturing cliff trails, hidden waterfalls, and dolphin safaris.',
    specialties: ['Drone Footage', 'Adventure Vlogs', 'Eco Tourism'],
  },
  {
    id: 'c6',
    name: 'Maya Pinto',
    handle: '@maya_zen',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=400&auto=format&fit=crop',
    cover: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&auto=format&fit=crop',
    tag: 'Yoga & Wellness',
    location: 'Mandrem',
    district: 'North Goa',
    followers: '76K',
    engagement: '10.1%',
    rate: 'Min ₹6,000',
    collabType: 'BARTER FRIENDLY',
    verified: true,
    reviewsCount: 22,
    rating: 4.9,
    bio: 'Holistic wellness guide, mindful living retreats, and sound healing sessions in North Goa beach shacks.',
    specialties: ['Wellness Workshops', 'Retreat Promotion', 'Guided Meditation'],
  },
];

export const NICHES = [
  { name: 'All Niches', slug: 'all', icon: 'grid' as const },
  { name: 'Food & Dining', slug: 'food-dining', icon: 'coffee' as const },
  { name: 'Boutique Resorts', slug: 'boutique-resorts', icon: 'home' as const },
  { name: 'Nightlife & Music', slug: 'nightlife-music', icon: 'music' as const },
  { name: 'Travel & Adventure', slug: 'travel-adventure', icon: 'compass' as const },
  { name: 'Fashion & Lifestyle', slug: 'fashion-lifestyle', icon: 'shopping-bag' as const },
  { name: 'Yoga & Wellness', slug: 'yoga-wellness', icon: 'heart' as const },
];

export const TRUST_METRICS = [
  { value: '120+', title: 'Vetted Goa Creators', subtitle: 'North & South Goa' },
  { value: '110+', title: 'Collabs Done', subtitle: 'Verified campaigns' },
  { value: '4.4 / 5', title: 'Average Rating', subtitle: 'Brand reviews' },
  { value: '40+', title: 'Hospitality Brands', subtitle: 'Goa partner venues' },
];

export const HOW_IT_WORKS_STEPS = [
  {
    step: 'STEP 01',
    title: 'Search & Discover',
    description: 'Filter creators by Goa location (Panjim, Assagao, Palolem), niche, audience demographics, and budget.',
    icon: 'search' as const,
  },
  {
    step: 'STEP 02',
    title: 'Send Booking Request',
    description: 'Specify your campaign goals, deliverables (Reels, Carousels, Stories), dates, and offer (paid or barter).',
    icon: 'mail' as const,
  },
  {
    step: 'STEP 03',
    title: 'Seamless Collaboration',
    description: 'Connect directly, approve content, confirm delivery, and build a verified reputational track record.',
    icon: 'shield' as const,
  },
];

export const PRICING_PLANS = [
  {
    name: 'Explorer',
    desc: 'For emerging creators & nomads',
    price: '₹0',
    period: '/mo',
    popular: false,
    features: [
      'Public Goa Creator Profile',
      'Browse Open Brand Collabs',
      'Standard Collab Discovery',
      'Community Mixers Access',
      'Basic Engagement Stats',
    ],
    cta: 'Join Free',
  },
  {
    name: 'Creator Pro',
    desc: 'For active storytellers & influencers',
    price: '₹1,499',
    period: '/mo',
    popular: true,
    features: [
      'Everything in Explorer',
      'Direct Brand Pitches & Fast Approvals',
      'Free Villa Shoot Passes',
      'Verified Goa Creator Badge',
      'Real-Time Auto Media Kit',
      'Priority Campaign Payouts',
    ],
    cta: 'Upgrade to Pro',
  },
  {
    name: 'Brand & Stays',
    desc: 'For luxury villas, resorts & brands',
    price: '₹6,999',
    period: '/mo',
    popular: false,
    features: [
      'Unlimited Campaign Postings',
      'Access 450+ Verified Creators',
      'Audience Reach & Vetting',
      'Milestone & Deliverable Protection',
      'Dedicated Goa Campaign Manager',
      'Content Rights Agreements',
    ],
    cta: 'Partner as Brand',
  },
];

export const MOCK_COLLABS = [
  {
    id: 'collab-1',
    creatorName: 'Sneha Ferns',
    creatorHandle: '@sneha_demo',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
    businessName: 'Villa Morjim Heritage Resort',
    campaignTitle: 'Monsoon Culinary Retreat Reel',
    deliverables: '1x Reel (60s) + 3x Instagram Stories',
    dates: '28 Nov - 02 Dec 2026',
    status: 'In Progress' as const,
    compensation: '₹12,000 + 2-Night Heritage Stay',
    isBarter: true,
  },
  {
    id: 'collab-2',
    creatorName: 'Rahul Naik',
    creatorHandle: '@rahul_demo',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
    businessName: 'Fontainhas Tapas Bar',
    campaignTitle: 'Portuguese Tapas Menu Launch',
    deliverables: '1x Photo Carousel + 2x Stories',
    dates: '05 Dec 2026',
    status: 'Accepted' as const,
    compensation: '₹8,500 Paid',
    isBarter: false,
  },
  {
    id: 'collab-3',
    creatorName: 'Rohan Tide',
    creatorHandle: '@rohan_demo',
    creatorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop',
    businessName: 'Sundown Beach Club Anjuna',
    campaignTitle: 'Sunset Mixology Festival Showcase',
    deliverables: '2x High-Energy Reels + Live Story Takeover',
    dates: '12 Dec 2026',
    status: 'Pending' as const,
    compensation: '₹16,000 Paid',
    isBarter: false,
  },
  {
    id: 'collab-4',
    creatorName: 'Ananya D’Souza',
    creatorHandle: '@ananya_goan',
    creatorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400&auto=format&fit=crop',
    businessName: 'Palolem Eco Stays',
    campaignTitle: 'Slow Travel South Goa Series',
    deliverables: '1x Reel + 1x Carousel',
    dates: '10 Nov 2026',
    status: 'Completed' as const,
    compensation: '3-Night Villa Stay (Barter)',
    isBarter: true,
  },
];

