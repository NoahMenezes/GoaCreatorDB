import { NextResponse } from 'next/server'

export interface CreatorItem {
    id: string
    name: string
    handle: string
    niche: string
    nicheSlug: string
    location: string
    followers: string
    rating: number
    baseRate: string
    er: string
    verified: boolean
    instagramUrl: string
    bio: string
}

export const goaCreators: CreatorItem[] = [
    {
        id: 'creator-1',
        name: 'Rahul Naik',
        handle: '@rahul.goanbites',
        niche: 'Food & Nightlife',
        nicheSlug: 'food-dining',
        location: 'Panjim & Calangute',
        followers: '85K',
        rating: 4.9,
        baseRate: '₹8,500/reel',
        er: '6.4% ER',
        verified: true,
        instagramUrl: 'https://instagram.com/rahul.goanbites',
        bio: 'Documenting Goan tavernas, Portuguese bakeries, and modern coastal culinary bars.',
    },
    {
        id: 'creator-2',
        name: 'Sneha Fernandes',
        handle: '@sneha_curates',
        niche: 'Boutique Stays & Lifestyle',
        nicheSlug: 'boutique-resorts',
        location: 'Assagao',
        followers: '120K',
        rating: 5.0,
        baseRate: '₹14,000/reel',
        er: '7.8% ER',
        verified: true,
        instagramUrl: 'https://instagram.com/sneha_curates',
        bio: 'Highlighting private Portuguese estates, heritage villas, and luxury tropical interiors.',
    },
    {
        id: 'creator-3',
        name: 'Rohan D\'Souza',
        handle: '@wavesofgoa',
        niche: 'Travel & Surf',
        nicheSlug: 'travel-adventure',
        location: 'Morjim & Vagator',
        followers: '62K',
        rating: 4.8,
        baseRate: '₹6,000/reel',
        er: '8.1% ER',
        verified: true,
        instagramUrl: 'https://instagram.com/wavesofgoa',
        bio: 'Surf instructor, coastal filmmaker, and backwater trail guide across North Goa.',
    },
    {
        id: 'creator-4',
        name: 'Ananya Kamat',
        handle: '@panjimfashionista',
        niche: 'Fashion & Events',
        nicheSlug: 'fashion-lifestyle',
        location: 'Panjim & Miramar',
        followers: '94K',
        rating: 4.9,
        baseRate: '₹10,000/reel',
        er: '5.9% ER',
        verified: true,
        instagramUrl: 'https://instagram.com/panjimfashionista',
        bio: 'Curating resort fashion, bohemian aesthetics, and luxury brand pop-ups in Panaji.',
    },
    {
        id: 'creator-5',
        name: 'Kabir Mehta',
        handle: '@kabir.drone',
        niche: 'Drone Cinema & Stays',
        nicheSlug: 'boutique-resorts',
        location: 'Siolim & Chapora',
        followers: '110K',
        rating: 5.0,
        baseRate: '₹12,500/reel',
        er: '8.5% ER',
        verified: true,
        instagramUrl: 'https://instagram.com/kabir.drone',
        bio: 'DGCA-certified drone cinema capturing luxury villas, clifftops, and river backwaters.',
    },
    {
        id: 'creator-6',
        name: 'Zoya Alvares',
        handle: '@zoya.sundowner',
        niche: 'Nightlife & Music',
        nicheSlug: 'nightlife-music',
        location: 'Vagator & Anjuna',
        followers: '78K',
        rating: 4.9,
        baseRate: '₹9,000/reel',
        er: '7.2% ER',
        verified: true,
        instagramUrl: 'https://instagram.com/zoya.sundowner',
        bio: 'Electronic music DJ, sunset festival curator, and music culture storyteller in Goa.',
    },
]

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const niche = searchParams.get('niche')
    const location = searchParams.get('location')

    let filtered = [...goaCreators]

    if (niche && niche !== 'all') {
        filtered = filtered.filter(
            (c) =>
                c.nicheSlug.toLowerCase() === niche.toLowerCase() ||
                c.niche.toLowerCase().includes(niche.toLowerCase())
        )
    }

    if (location) {
        filtered = filtered.filter((c) =>
            c.location.toLowerCase().includes(location.toLowerCase())
        )
    }

    return NextResponse.json({
        success: true,
        total: filtered.length,
        data: filtered,
    })
}

