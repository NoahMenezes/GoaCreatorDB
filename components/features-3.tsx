'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { CreatorItem } from '@/app/api/creators/route'
import {
    CheckCircle2,
    Compass,
    ExternalLink,
    Flower2,
    Hotel,
    LayoutGrid,
    MapPin,
    Shirt,
    Star,
    Utensils,
    Volume2,
    VolumeX,
    Wine,
    X,
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

interface Creator {
    id: string
    name: string
    handle: string
    niche: string
    categorySlug: string
    location: string
    followers: string
    rating: number
    baseRate: string
    er: string
    video: string
    instagramUrl: string
    bio: string
}

const niches = [
    { name: 'All Niches', slug: 'all', icon: LayoutGrid },
    { name: 'Food & Dining', slug: 'food-dining', icon: Utensils },
    { name: 'Boutique Resorts', slug: 'boutique-resorts', icon: Hotel },
    { name: 'Nightlife & Music', slug: 'nightlife-music', icon: Wine },
    { name: 'Travel & Adventure', slug: 'travel-adventure', icon: Compass },
    { name: 'Fashion & Lifestyle', slug: 'fashion-lifestyle', icon: Shirt },
    { name: 'Yoga & Wellness', slug: 'yoga-wellness', icon: Flower2 },
]

const initialCreators: Creator[] = [
    {
        id: 'creator-1',
        name: 'Rahul Naik',
        handle: '@rahul.goanbites',
        niche: 'Food & Nightlife',
        categorySlug: 'food-dining',
        location: 'Panjim & Calangute',
        followers: '85K',
        rating: 4.9,
        baseRate: '₹8,500/reel',
        er: '6.4% ER',
        video: 'https://assets.mixkit.co/videos/810/810-1080.mp4',
        instagramUrl: 'https://instagram.com/rahul.goanbites',
        bio: 'Documenting Goan tavernas, Portuguese bakeries, and modern coastal culinary bars.',
    },
    {
        id: 'creator-2',
        name: 'Sneha Fernandes',
        handle: '@sneha_curates',
        niche: 'Boutique Stays & Lifestyle',
        categorySlug: 'boutique-resorts',
        location: 'Assagao',
        followers: '120K',
        rating: 5.0,
        baseRate: '₹14,000/reel',
        er: '7.8% ER',
        video: 'https://assets.mixkit.co/videos/3159/3159-1080.mp4',
        instagramUrl: 'https://instagram.com/sneha_curates',
        bio: 'Highlighting private Portuguese estates, heritage villas, and luxury tropical interiors.',
    },
    {
        id: 'creator-3',
        name: 'Rohan D\'Souza',
        handle: '@wavesofgoa',
        niche: 'Travel & Surf',
        categorySlug: 'travel-adventure',
        location: 'Morjim & Vagator',
        followers: '62K',
        rating: 4.8,
        baseRate: '₹6,000/reel',
        er: '8.1% ER',
        video: 'https://assets.mixkit.co/videos/4692/4692-1080.mp4',
        instagramUrl: 'https://instagram.com/wavesofgoa',
        bio: 'Surf instructor, coastal filmmaker, and backwater trail guide across North Goa.',
    },
    {
        id: 'creator-4',
        name: 'Ananya Kamat',
        handle: '@panjimfashionista',
        niche: 'Fashion & Events',
        categorySlug: 'fashion-lifestyle',
        location: 'Panjim & Miramar',
        followers: '94K',
        rating: 4.9,
        baseRate: '₹10,000/reel',
        er: '5.9% ER',
        video: 'https://assets.mixkit.co/videos/4206/4206-1080.mp4',
        instagramUrl: 'https://instagram.com/panjimfashionista',
        bio: 'Curating resort fashion, bohemian aesthetics, and luxury brand pop-ups in Panaji.',
    },
    {
        id: 'creator-5',
        name: 'Kabir Mehta',
        handle: '@kabir.drone',
        niche: 'Drone Cinema & Stays',
        categorySlug: 'boutique-resorts',
        location: 'Siolim & Chapora',
        followers: '110K',
        rating: 5.0,
        baseRate: '₹12,500/reel',
        er: '8.5% ER',
        video: 'https://assets.mixkit.co/videos/51501/51501-1080.mp4',
        instagramUrl: 'https://instagram.com/kabir.drone',
        bio: 'DGCA-certified drone cinema capturing luxury villas, clifftops, and river backwaters.',
    },
    {
        id: 'creator-6',
        name: 'Zoya Alvares',
        handle: '@zoya.sundowner',
        niche: 'Nightlife & Music',
        categorySlug: 'nightlife-music',
        location: 'Vagator & Anjuna',
        followers: '78K',
        rating: 4.9,
        baseRate: '₹9,000/reel',
        er: '7.2% ER',
        video: 'https://assets.mixkit.co/videos/830/830-1080.mp4',
        instagramUrl: 'https://instagram.com/zoya.sundowner',
        bio: 'Electronic music DJ, sunset festival curator, and music culture storyteller in Goa.',
    },
]

export default function FeaturesThree() {
    const [activeSlug, setActiveSlug] = useState('all')
    const [mutedStates, setMutedStates] = useState<Record<string, boolean>>({})
    const [creators, setCreators] = useState<Creator[]>(initialCreators)
    const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null)
    const [bookingSuccess, setBookingSuccess] = useState(false)
    const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({})

    useEffect(() => {
        // Fetch from the project API
        const fetchCreators = async () => {
            try {
                const res = await fetch(`/api/creators${activeSlug !== 'all' ? `?niche=${activeSlug}` : ''}`)
                const data = await res.json()
                if (data.success && data.data && data.data.length > 0) {
                    const mapped: Creator[] = data.data.map((c: CreatorItem) => {
                        const existing = initialCreators.find((ic) => ic.id === c.id)
                        return {
                            id: c.id,
                            name: c.name,
                            handle: c.handle,
                            niche: c.niche,
                            categorySlug: c.nicheSlug,
                            location: c.location,
                            followers: c.followers,
                            rating: c.rating,
                            baseRate: c.baseRate,
                            er: c.er,
                            video: existing ? existing.video : 'https://assets.mixkit.co/videos/810/810-1080.mp4',
                            instagramUrl: c.instagramUrl,
                            bio: c.bio,
                        }
                    })
                    setCreators(mapped)
                }
            } catch {
                // Keep local initialCreators if offline
            }
        }
        fetchCreators()
    }, [activeSlug])

    const toggleMute = (id: string) => {
        const video = videoRefs.current[id]
        if (!video) return
        const isCurrentMuted = mutedStates[id] ?? true
        video.muted = !isCurrentMuted
        setMutedStates((prev) => ({
            ...prev,
            [id]: !isCurrentMuted,
        }))
    }

    const filteredCreators = activeSlug === 'all'
        ? creators
        : creators.filter((c) => c.categorySlug === activeSlug || c.niche.toLowerCase().includes(activeSlug.replace('-', ' ')))

    return (
        <section className="py-12 sm:py-16 scroll-mt-20" id="creators">
            <span id="categories" className="sr-only" />
            <div className="mx-auto max-w-7xl px-6">
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                            Explore by Goa Niches
                        </h2>
                        <p className="text-muted-foreground text-sm sm:text-base mt-1">
                            Filter by coastal specialization and community resonance
                        </p>
                    </div>

                    <Link
                        href="#categories"
                        className="text-emerald-700 dark:text-emerald-400 hover:underline text-sm font-semibold flex items-center gap-1 self-start sm:self-auto"
                    >
                        <span>View All Niches</span>
                        <span>&rarr;</span>
                    </Link>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none">
                    {niches.map((niche) => {
                        const Icon = niche.icon
                        const isActive = activeSlug === niche.slug
                        return (
                            <button
                                key={niche.slug}
                                onClick={() => setActiveSlug(niche.slug)}
                                className={`cursor-pointer whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-medium flex items-center gap-2 transition-all duration-150 border ${
                                    isActive
                                        ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                                        : 'bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground'
                                }`}
                            >
                                <Icon className="size-3.5" />
                                <span>{niche.name}</span>
                            </button>
                        )
                    })}
                </div>

                {/* 4 Creator Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                    {filteredCreators.map((creator) => {
                        const isMuted = mutedStates[creator.id] ?? true

                        return (
                            <Card
                                key={creator.id}
                                className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card p-0 shadow-xs transition-all duration-300 hover:shadow-md hover:border-emerald-600/30 flex flex-col"
                            >
                                {/* Media Top (Video Reel) */}
                                <div className="relative aspect-4/3 sm:aspect-square w-full overflow-hidden bg-black/90">
                                    <video
                                        ref={(el) => {
                                            videoRefs.current[creator.id] = el
                                        }}
                                        autoPlay
                                        loop
                                        muted={isMuted}
                                        playsInline
                                        preload="metadata"
                                        src={creator.video}
                                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />

                                    {/* Top Left: Verified Badge */}
                                    <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-white/90 dark:bg-black/80 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold text-foreground shadow-xs">
                                        <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                                        <span>Verified</span>
                                    </div>

                                    {/* Top Right: ER Badge */}
                                    <div className="absolute top-3 right-3 rounded-full bg-emerald-700 text-white px-2.5 py-1 text-[11px] font-bold shadow-xs">
                                        {creator.er}
                                    </div>

                                    {/* Bottom Left: Location Tag */}
                                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-lg bg-black/70 backdrop-blur-md px-2.5 py-1 text-[11px] font-medium text-white shadow-xs">
                                        <MapPin className="size-3 text-amber-400" />
                                        <span>{creator.location}</span>
                                    </div>

                                    {/* Bottom Right: Audio Mute/Unmute */}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            toggleMute(creator.id)
                                        }}
                                        aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                                        className="absolute bottom-3 right-3 size-7 rounded-full bg-black/70 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/90 duration-150 cursor-pointer shadow-xs"
                                    >
                                        {isMuted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5 text-emerald-400" />}
                                    </button>
                                </div>

                                {/* Creator Details Body */}
                                <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-base font-bold text-foreground">
                                                {creator.name}
                                            </h3>
                                            <div className="flex items-center gap-1 text-xs font-semibold text-foreground">
                                                <Star className="size-3.5 fill-amber-400 text-amber-400" />
                                                <span>{creator.rating.toFixed(1)}</span>
                                            </div>
                                        </div>

                                        <p className="text-xs text-muted-foreground">
                                            {creator.handle}
                                        </p>

                                        <div className="pt-1">
                                            <span className="inline-block rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground border border-border/50">
                                                {creator.niche}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted/40 p-2 text-center border border-border/50">
                                        <div>
                                            <div className="text-[10px] uppercase font-semibold text-muted-foreground">
                                                Followers
                                            </div>
                                            <div className="text-xs font-bold text-foreground mt-0.5">
                                                {creator.followers}
                                            </div>
                                        </div>
                                        <div className="border-l border-border/50">
                                            <div className="text-[10px] uppercase font-semibold text-muted-foreground">
                                                Base Rate
                                            </div>
                                            <div className="text-xs font-bold text-foreground mt-0.5">
                                                {creator.baseRate}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <Button
                                        onClick={() => {
                                            setSelectedCreator(creator)
                                            setBookingSuccess(false)
                                        }}
                                        variant="outline"
                                        size="sm"
                                        className="w-full text-xs font-semibold rounded-lg bg-blue-50/50 hover:bg-blue-100/70 text-blue-900 dark:bg-blue-950/40 dark:text-blue-200 dark:hover:bg-blue-900/60 border-blue-200 dark:border-blue-800/60 cursor-pointer h-9"
                                    >
                                        View Profile / Book
                                    </Button>
                                </div>
                            </Card>
                        )
                    })}
                </div>
            </div>

            {/* Profile & Booking Modal */}
            {selectedCreator && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                    <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
                        {/* Close button */}
                        <button
                            onClick={() => setSelectedCreator(null)}
                            className="absolute top-4 right-4 size-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
                            aria-label="Close modal"
                        >
                            <X className="size-4" />
                        </button>

                        {/* Modal Header */}
                        <div className="flex items-start gap-3">
                            <div className="size-12 rounded-xl bg-emerald-600/15 border border-emerald-600/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-lg shrink-0">
                                {selectedCreator.name[0]}
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-bold text-foreground">{selectedCreator.name}</h3>
                                    <span className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-semibold border border-emerald-500/20">
                                        Verified
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground">{selectedCreator.handle} &bull; {selectedCreator.location}</p>
                            </div>
                        </div>

                        {/* Bio & Details */}
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {selectedCreator.bio}
                        </p>

                        <div className="grid grid-cols-3 gap-2 rounded-xl bg-muted/40 p-3 text-center border border-border">
                            <div>
                                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Followers</span>
                                <div className="text-sm font-bold text-foreground mt-0.5">{selectedCreator.followers}</div>
                            </div>
                            <div>
                                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Engagement</span>
                                <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{selectedCreator.er}</div>
                            </div>
                            <div>
                                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Base Rate</span>
                                <div className="text-sm font-bold text-foreground mt-0.5">{selectedCreator.baseRate}</div>
                            </div>
                        </div>

                        {/* Instagram Link */}
                        <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-background">
                            <div className="text-xs font-medium text-foreground">Verified Creator Instagram</div>
                            <a
                                href={selectedCreator.instagramUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
                            >
                                <span>Open Instagram</span>
                                <ExternalLink className="size-3" />
                            </a>
                        </div>

                        {/* Booking Request Form */}
                        {bookingSuccess ? (
                            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-center space-y-2">
                                <CheckCircle2 className="size-6 text-emerald-600 dark:text-emerald-400 mx-auto" />
                                <div className="text-sm font-bold text-foreground">Booking Request Sent</div>
                                <p className="text-xs text-muted-foreground">
                                    The brief has been submitted to {selectedCreator.name}. Payment is protected via escrow.
                                </p>
                            </div>
                        ) : (
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault()
                                    setBookingSuccess(true)
                                }}
                                className="space-y-3 pt-1"
                            >
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-foreground">Campaign Brief / Requirements</label>
                                    <textarea
                                        required
                                        rows={2}
                                        placeholder="e.g. 1 Instagram Reel + 3 Stories showcasing our sunset tapas menu in Assagao"
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-medium text-foreground">Target Date</label>
                                        <input
                                            type="date"
                                            required
                                            defaultValue="2026-11-20"
                                            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-foreground">Offer Budget</label>
                                        <input
                                            type="text"
                                            required
                                            defaultValue={selectedCreator.baseRate.replace('/reel', '')}
                                            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs rounded-lg h-9 cursor-pointer mt-2"
                                >
                                    Send Booking Request via Escrow
                                </Button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </section>
    )
}
