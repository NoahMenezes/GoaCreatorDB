'use client'

import { Card } from '@/components/ui/card'
import { Eye, MapPin, Sparkles, Volume2, VolumeX } from 'lucide-react'
import { useState } from 'react'

const categories = ['All Reels', 'Luxury Stays', 'Beach Clubs', 'Drone Cinema', 'Music & Mixers']

const reels = [
    {
        title: 'Sunset Beach Club Collab',
        category: 'Beach Clubs',
        location: 'Ashwem Beach, North Goa',
        creator: '@ananya.creates',
        views: '1.2M',
        likes: '84K',
        brand: 'Boho Beach House Goa',
        deal: '₹85,000 Escrow',
        video: 'https://assets.mixkit.co/videos/2168/2168-1080.mp4',
        niche: 'Travel & Lifestyle',
        permit: 'Verified Beach Permit',
    },
    {
        title: '18th Century Portuguese Villa Tour',
        category: 'Luxury Stays',
        location: 'Assagao & Fontainhas',
        creator: '@rohan.visuals',
        views: '1.6M',
        likes: '112K',
        brand: 'Villa Capella Assagao',
        deal: '₹1,20,000 Escrow',
        video: 'https://assets.mixkit.co/videos/1191/1191-1080.mp4',
        niche: 'Heritage & Stays',
        permit: 'Heritage Pass #GA-21',
    },
    {
        title: 'Sunset Clifftop DJ Set & Mixers',
        category: 'Music & Mixers',
        location: 'Vagator Cliffs & Lounge',
        creator: '@goa.underground',
        views: '2.4M',
        likes: '180K',
        brand: 'Sundowner Sessions',
        deal: '₹1,50,000 Escrow',
        video: 'https://assets.mixkit.co/videos/4344/4344-1080.mp4',
        niche: 'Music & Festival',
        permit: 'Sound Clearance Approved',
    },
    {
        title: 'Morning Surf & Coastal Wellness',
        category: 'Drone Cinema',
        location: 'Morjim Coastline',
        creator: '@zoya.surf',
        views: '890K',
        likes: '62K',
        brand: 'Morjim Wave House',
        deal: '₹75,000 Escrow',
        video: 'https://assets.mixkit.co/videos/3162/3162-1080.mp4',
        niche: 'Surf & Wellness',
        permit: 'Coastline Drone Zone',
    },
    {
        title: 'Private Pool & Palms Aerial Shoot',
        category: 'Luxury Stays',
        location: 'Siolim Riverbanks',
        creator: '@kabir.drone',
        views: '1.8M',
        likes: '124K',
        brand: 'Siolim Palms Estate',
        deal: '₹1,10,000 Escrow',
        video: 'https://assets.mixkit.co/videos/1564/1564-1080.mp4',
        niche: 'Aerial & Architecture',
        permit: 'Private Estate Drone Pass',
    },
    {
        title: 'Golden Hour Cocktail Storytelling',
        category: 'Beach Clubs',
        location: 'Anjuna Sunset Point',
        creator: '@nikita.foodie',
        views: '940K',
        likes: '71K',
        brand: 'Susegado Craft Lounge',
        deal: '₹65,000 Escrow',
        video: 'https://assets.mixkit.co/videos/4436/4436-1080.mp4',
        niche: 'Culinary & Mixology',
        permit: 'Commercial Dining Pass',
    },
]

export default function FeaturesThree() {
    const [activeCategory, setActiveCategory] = useState('All Reels')
    const [mutedStates, setMutedStates] = useState<Record<number, boolean>>({})

    const toggleMute = (index: number) => {
        setMutedStates((prev) => ({
            ...prev,
            [index]: !prev[index],
        }))
    }

    const filteredReels = activeCategory === 'All Reels'
        ? reels
        : reels.filter((r) => r.category === activeCategory)

    return (
        <section className="py-20 md:py-28 scroll-mt-16" id="reels">
            <span id="features" className="sr-only" />
            <div className="mx-auto max-w-7xl px-6">
                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
                    <div className="space-y-3 max-w-2xl">
                        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-500">
                            <Sparkles className="size-3.5" />
                            <span>Creator Reels &amp; Brand Collabs</span>
                        </div>
                        <h2 className="text-balance text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
                            Real Brand Collabs in Motion Across Goa
                        </h2>
                        <p className="text-muted-foreground text-lg">
                            Watch authentic reels produced by verified creators for boutique stays, beach clubs, and lifestyle brands — backed by guaranteed escrow payouts.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground self-start md:self-end">
                        <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Updated Daily &bull; 6 New Collabs Live Today</span>
                    </div>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-6 scrollbar-none">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`cursor-pointer whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 border ${
                                activeCategory === cat
                                    ? 'bg-amber-500 text-black border-amber-500 shadow-sm'
                                    : 'bg-muted/40 text-muted-foreground border-border hover:bg-muted hover:text-foreground'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Reels Grid (Vertical 9:16 cards showcasing actual brand reels) */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredReels.map((reel, index) => {
                        const isMuted = mutedStates[index] ?? true

                        return (
                            <Card
                                key={index}
                                className="group relative overflow-hidden rounded-3xl border border-border/70 bg-black shadow-xl transition-all duration-300 hover:border-amber-500/40 hover:shadow-2xl hover:shadow-amber-500/10"
                            >
                                <div className="relative aspect-9/14 sm:aspect-9/15 w-full overflow-hidden">
                                    <video
                                        autoPlay
                                        loop
                                        muted={isMuted}
                                        playsInline
                                        preload="metadata"
                                        src={reel.video}
                                        className="size-full object-cover group-hover:scale-105 duration-700 transition-transform"
                                    />

                                    {/* Ambient gradient */}
                                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/40" />

                                    {/* Top Badges */}
                                    <div className="absolute top-4 inset-x-4 flex items-center justify-between z-10">
                                        <span className="rounded-full bg-black/60 backdrop-blur-md border border-white/20 px-3 py-1 text-xs font-medium text-white">
                                            {reel.niche}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 px-2.5 py-1 text-xs text-white">
                                                <Eye className="size-3 text-amber-400" />
                                                <span>{reel.views}</span>
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => toggleMute(index)}
                                                aria-label={isMuted ? 'Unmute reel' : 'Mute reel'}
                                                className="size-7 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black/90 cursor-pointer duration-150"
                                            >
                                                {isMuted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5 text-amber-400" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Bottom Information */}
                                    <div className="absolute bottom-4 inset-x-4 space-y-2.5 text-white z-10">
                                        <div className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-1.5 text-amber-300 font-medium">
                                                <MapPin className="size-3.5 shrink-0" />
                                                <span className="truncate">{reel.location}</span>
                                            </div>
                                            <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[11px] font-semibold text-emerald-300 shrink-0">
                                                {reel.deal}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-bold leading-snug drop-shadow-sm">
                                            {reel.title}
                                        </h3>

                                        <div className="pt-2 flex items-center justify-between text-xs text-zinc-300 border-t border-white/15">
                                            <span className="font-semibold text-white">{reel.creator}</span>
                                            <span className="text-zinc-400">{reel.brand}</span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
