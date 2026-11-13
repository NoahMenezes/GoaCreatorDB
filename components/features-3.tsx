'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
    CheckCircle2,
    Compass,
    ExternalLink,
    Hotel,
    LayoutGrid,
    MapPin,
    Utensils,
    Wine,
    Flower2,
    Shirt,
} from 'lucide-react'

const niches = [
    { name: 'All Niches', slug: 'all', icon: LayoutGrid },
    { name: 'Food & Dining', slug: 'food-dining', icon: Utensils },
    { name: 'Boutique Resorts', slug: 'boutique-resorts', icon: Hotel },
    { name: 'Nightlife & Music', slug: 'nightlife-music', icon: Wine },
    { name: 'Travel & Adventure', slug: 'travel-adventure', icon: Compass },
    { name: 'Fashion & Lifestyle', slug: 'fashion-lifestyle', icon: Shirt },
    { name: 'Yoga & Wellness', slug: 'yoga-wellness', icon: Flower2 },
]

const creators = [
    {
        id: 'f1',
        name: 'Sneha Fernandes',
        handle: '@sneha.tastesgoa',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
        cover: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800&auto=format&fit=crop',
        tag: 'Food & Dining',
        location: 'Assagao',
        followers: '120K',
        engagement: '7.8%',
        rate: '₹8,000 / reel',
    },
    {
        id: 'f2',
        name: 'Rahul Naik',
        handle: '@rahul_eats_goa',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
        cover: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=800&auto=format&fit=crop',
        tag: 'Heritage Dining',
        location: 'Panjim',
        followers: '85K',
        engagement: '9.2%',
        rate: '₹6,500 / reel',
    },
    {
        id: 'f3',
        name: 'Rohan D\'Souza',
        handle: '@rohan.cocktailchronicles',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop',
        cover: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=800&auto=format&fit=crop',
        tag: 'Cocktails & Nightlife',
        location: 'Anjuna',
        followers: '195K',
        engagement: '6.5%',
        rate: '₹14,000 / reel',
    },
]

export default function FeaturesThree() {
    return (
        <section id="creators" className="py-16 sm:py-24 scroll-mt-20">
            <div className="mx-auto max-w-7xl px-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-12 sm:mb-16">
                    <div className="space-y-1.5">
                        <div className="inline-flex items-center gap-1.5 rounded-sm bg-primary/10 border border-primary/20 px-3 py-1 text-[10px] font-bold text-primary uppercase tracking-wider">
                            <span className="size-2 rounded-full bg-primary" />
                            <span>Live Collab Engine</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                            Explore by Goa Niches
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Filter by coastal specialization. Reels and portfolios update dynamically.
                        </p>
                    </div>

                    <Link
                        href="/business/discover"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-sm px-5 py-2.5 flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
                    >
                        <span>Browse All Creators</span>
                        <span className="size-4">→</span>
                    </Link>
                </div>

                {/* Filter pills */}
                <div className="flex flex-wrap gap-2 mb-10 sm:mb-14">
                    {niches.map((niche) => {
                        const Icon = niche.icon
                        return (
                            <button
                                key={niche.slug}
                                className="rounded-sm border border-border bg-background px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer hover:border-primary/50 hover:text-primary"
                            >
                                <Icon className="size-3.5 mr-1.5" />
                                <span>{niche.name}</span>
                            </button>
                        )
                    })}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {creators.map((c) => (
                        <div
                            key={c.id}
                            className="border border-border bg-card rounded-sm shadow-sm overflow-hidden flex flex-col hover:border-primary/50 transition-colors"
                        >
                            <div className="relative h-40 w-full overflow-hidden">
                                <Image
                                    src={c.cover}
                                    alt={c.name}
                                    width={800}
                                    height={533}
                                    className="size-full object-cover"
                                />
                                <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 bg-background border border-border px-2.5 py-0.5 rounded-sm text-[10px] font-bold text-foreground shadow-sm">
                                    <MapPin className="size-3 text-primary" />
                                    <span>{c.location}</span>
                                </div>
                                <button
                                    className="absolute top-3 right-3 z-10 size-8 rounded-sm bg-background border border-border text-foreground flex items-center justify-center hover:bg-muted transition-colors cursor-pointer"
                                >
                                    <ExternalLink className="size-4" />
                                </button>
                            </div>
                            <div className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Image
                                        src={c.avatar}
                                        alt={c.name}
                                        width={32}
                                        height={32}
                                        className="size-8 rounded-md border-2 border-background object-cover"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-bold text-foreground truncate">{c.name}</h3>
                                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground truncate">
                                            <CheckCircle2 className="size-2.5 fill-primary" />
                                            <span>{c.handle}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                                    <span>{c.tag}</span>
                                    <span className="text-primary/50">•</span>
                                    <span>{c.followers} followers</span>
                                    <span className="text-primary/50">•</span>
                                    <span>{c.engagement} engagement</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Starting Rate</div>
                                    <div className="text-sm font-bold text-primary">{c.rate}</div>
                                </div>
                                <Link
                                    href="/business/profile"
                                    className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline px-2 py-1 rounded-sm hover:bg-primary/5"
                                >
                                    View Profile &rarr;
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
