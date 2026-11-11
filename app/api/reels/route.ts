import { NextResponse } from 'next/server'

export interface ReelItem {
    id: string
    title: string
    creator: {
        name: string
        handle: string
        avatar?: string
        followers: string
        rating: number
        baseRate: string
        er: string
    }
    category: string
    categorySlug: string
    location: string
    videoUrl: string
    instagramUrl: string
    instagramEmbedUrl: string
    views: string
    likes: string
}

export const goaReels: ReelItem[] = [
    {
        id: 'reel-1',
        title: 'Assagao Cafe Hopping & Artisanal Coffee',
        creator: {
            name: 'Rahul Naik',
            handle: '@rahul.goanbites',
            followers: '85K',
            rating: 4.9,
            baseRate: '₹8,500/reel',
            er: '6.4%',
        },
        category: 'Food & Dining',
        categorySlug: 'food-dining',
        location: 'Panjim & Calangute',
        videoUrl: 'https://assets.mixkit.co/videos/810/810-1080.mp4',
        instagramUrl: 'https://www.instagram.com/reel/C3zY5zAoP1K/',
        instagramEmbedUrl: 'https://www.instagram.com/reel/C3zY5zAoP1K/embed',
        views: '1.2M',
        likes: '84K',
    },
    {
        id: 'reel-2',
        title: 'Sunset Sundowner DJ Sessions at Vagator',
        creator: {
            name: 'Zoya Alvares',
            handle: '@zoya.sundowner',
            followers: '78K',
            rating: 4.9,
            baseRate: '₹9,000/reel',
            er: '7.2%',
        },
        category: 'Nightlife & Music',
        categorySlug: 'nightlife-music',
        location: 'Vagator & Anjuna',
        videoUrl: 'https://assets.mixkit.co/videos/830/830-1080.mp4',
        instagramUrl: 'https://www.instagram.com/reel/C21Wq7MoP8L/',
        instagramEmbedUrl: 'https://www.instagram.com/reel/C21Wq7MoP8L/embed',
        views: '2.4M',
        likes: '160K',
    },
    {
        id: 'reel-3',
        title: 'Fontainhas Heritage Walk & Latin Quarter',
        creator: {
            name: 'Ananya Kamat',
            handle: '@panjimfashionista',
            followers: '94K',
            rating: 4.9,
            baseRate: '₹10,000/reel',
            er: '5.9%',
        },
        category: 'Fashion & Lifestyle',
        categorySlug: 'fashion-lifestyle',
        location: 'Panjim & Miramar',
        videoUrl: 'https://assets.mixkit.co/videos/4206/4206-1080.mp4',
        instagramUrl: 'https://www.instagram.com/reel/C14TxNBoP9M/',
        instagramEmbedUrl: 'https://www.instagram.com/reel/C14TxNBoP9M/embed',
        views: '980K',
        likes: '72K',
    },
    {
        id: 'reel-4',
        title: 'Speakeasy Craft Cocktail Tour Assagao',
        creator: {
            name: 'Rahul Naik',
            handle: '@rahul.goanbites',
            followers: '85K',
            rating: 4.9,
            baseRate: '₹8,500/reel',
            er: '6.4%',
        },
        category: 'Food & Dining',
        categorySlug: 'food-dining',
        location: 'Assagao',
        videoUrl: 'https://assets.mixkit.co/videos/4295/4295-1080.mp4',
        instagramUrl: 'https://www.instagram.com/reel/C45Pq1LoP3Q/',
        instagramEmbedUrl: 'https://www.instagram.com/reel/C45Pq1LoP3Q/embed',
        views: '840K',
        likes: '58K',
    },
    {
        id: 'reel-5',
        title: 'Luxury Villa Residency & Private Pool',
        creator: {
            name: 'Sneha Fernandes',
            handle: '@sneha_curates',
            followers: '120K',
            rating: 5.0,
            baseRate: '₹14,000/reel',
            er: '7.8%',
        },
        category: 'Boutique Resorts',
        categorySlug: 'boutique-resorts',
        location: 'Assagao',
        videoUrl: 'https://assets.mixkit.co/videos/3159/3159-1080.mp4',
        instagramUrl: 'https://www.instagram.com/reel/C57Lk4PoP5R/',
        instagramEmbedUrl: 'https://www.instagram.com/reel/C57Lk4PoP5R/embed',
        views: '1.6M',
        likes: '112K',
    },
    {
        id: 'reel-6',
        title: 'Festival Lights & Sound at HillTop',
        creator: {
            name: 'Zoya Alvares',
            handle: '@zoya.sundowner',
            followers: '78K',
            rating: 4.9,
            baseRate: '₹9,000/reel',
            er: '7.2%',
        },
        category: 'Nightlife & Music',
        categorySlug: 'nightlife-music',
        location: 'Vagator Cliffs',
        videoUrl: 'https://assets.mixkit.co/videos/4188/4188-1080.mp4',
        instagramUrl: 'https://www.instagram.com/reel/C39Mn2IoP7S/',
        instagramEmbedUrl: 'https://www.instagram.com/reel/C39Mn2IoP7S/embed',
        views: '1.9M',
        likes: '135K',
    },
    {
        id: 'reel-7',
        title: 'Morjim Coastline & Surf Lifestyle',
        creator: {
            name: 'Rohan D\'Souza',
            handle: '@wavesofgoa',
            followers: '62K',
            rating: 4.8,
            baseRate: '₹6,000/reel',
            er: '8.1%',
        },
        category: 'Travel & Adventure',
        categorySlug: 'travel-adventure',
        location: 'Morjim & Vagator',
        videoUrl: 'https://assets.mixkit.co/videos/4692/4692-1080.mp4',
        instagramUrl: 'https://www.instagram.com/reel/C41Nk5IoP2T/',
        instagramEmbedUrl: 'https://www.instagram.com/reel/C41Nk5IoP2T/embed',
        views: '1.1M',
        likes: '79K',
    },
    {
        id: 'reel-8',
        title: 'River Mangroves & Backwater Retreat',
        creator: {
            name: 'Rohan D\'Souza',
            handle: '@wavesofgoa',
            followers: '62K',
            rating: 4.8,
            baseRate: '₹6,000/reel',
            er: '8.1%',
        },
        category: 'Travel & Adventure',
        categorySlug: 'travel-adventure',
        location: 'Chapora & Siolim',
        videoUrl: 'https://assets.mixkit.co/videos/51501/51501-1080.mp4',
        instagramUrl: 'https://www.instagram.com/reel/C53Qz8IoP4U/',
        instagramEmbedUrl: 'https://www.instagram.com/reel/C53Qz8IoP4U/embed',
        views: '870K',
        likes: '64K',
    },
]

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const location = searchParams.get('location')
    const search = searchParams.get('search')

    let filtered = [...goaReels]

    if (category && category !== 'all' && category !== 'All Niches') {
        filtered = filtered.filter(
            (r) =>
                r.categorySlug.toLowerCase() === category.toLowerCase() ||
                r.category.toLowerCase() === category.toLowerCase()
        )
    }

    if (location) {
        filtered = filtered.filter((r) =>
            r.location.toLowerCase().includes(location.toLowerCase())
        )
    }

    if (search) {
        const query = search.toLowerCase()
        filtered = filtered.filter(
            (r) =>
                r.title.toLowerCase().includes(query) ||
                r.creator.name.toLowerCase().includes(query) ||
                r.creator.handle.toLowerCase().includes(query) ||
                r.location.toLowerCase().includes(query) ||
                r.category.toLowerCase().includes(query)
        )
    }

    return NextResponse.json({
        success: true,
        total: filtered.length,
        source: 'Goa Creator Instagram Network API',
        data: filtered,
    })
}
