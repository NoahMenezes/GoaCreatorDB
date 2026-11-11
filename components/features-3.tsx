'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    CheckCircle2,
    Compass,
    ExternalLink,
    Flower2,
    Heart,
    Hotel,
    LayoutGrid,
    MapPin,
    MessageCircle,
    Music,
    Play,
    RefreshCw,
    Share2,
    Shirt,
    Utensils,
    Volume2,
    VolumeX,
    Wine,
    X,
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import type { ReelItem } from '@/app/api/reels/route'
import { goaReelsPool } from '@/app/api/reels/route'

const niches = [
    { name: 'All Niches', slug: 'all', icon: LayoutGrid },
    { name: 'Food & Dining', slug: 'food-dining', icon: Utensils },
    { name: 'Boutique Resorts', slug: 'boutique-resorts', icon: Hotel },
    { name: 'Nightlife & Music', slug: 'nightlife-music', icon: Wine },
    { name: 'Travel & Adventure', slug: 'travel-adventure', icon: Compass },
    { name: 'Fashion & Lifestyle', slug: 'fashion-lifestyle', icon: Shirt },
    { name: 'Yoga & Wellness', slug: 'yoga-wellness', icon: Flower2 },
]

export default function FeaturesThree() {
    const [activeSlug, setActiveSlug] = useState('all')
    const [mutedStates, setMutedStates] = useState<Record<string, boolean>>({})
    const [playingStates, setPlayingStates] = useState<Record<string, boolean>>({})
    const [likedStates, setLikedStates] = useState<Record<string, boolean>>({})
    const [likeCounts, setLikeCounts] = useState<Record<string, number>>({})
    const [selectedReel, setSelectedReel] = useState<ReelItem | null>(null)
    const [bookingSuccess, setBookingSuccess] = useState(false)
    const [isShuffling, setIsShuffling] = useState(false)
    const [displayReels, setDisplayReels] = useState<ReelItem[]>(goaReelsPool.slice(0, 4))

    const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({})

    // Randomize reels on mount and when category changes (client-side only)
    useEffect(() => {
        const timer = setTimeout(() => {
            let pool = [...goaReelsPool]
            if (activeSlug !== 'all') {
                pool = pool.filter(
                    (r) =>
                        r.categorySlug.toLowerCase() === activeSlug.toLowerCase() ||
                        r.category.toLowerCase().includes(activeSlug.replace('-', ' '))
                )
            }
            // Client-side shuffle on page mount / reload
            const shuffled = [...pool].sort(() => Math.random() - 0.5)
            setDisplayReels(shuffled.slice(0, Math.min(4, shuffled.length)))
        }, 0)

        return () => clearTimeout(timer)
    }, [activeSlug])

    const handleShuffle = () => {
        setIsShuffling(true)
        let pool = [...goaReelsPool]
        if (activeSlug !== 'all') {
            pool = pool.filter(
                (r) =>
                    r.categorySlug.toLowerCase() === activeSlug.toLowerCase() ||
                    r.category.toLowerCase().includes(activeSlug.replace('-', ' '))
            )
        }
        const shuffled = [...pool].sort(() => Math.random() - 0.5)
        setDisplayReels(shuffled.slice(0, Math.min(4, shuffled.length)))
        setTimeout(() => setIsShuffling(false), 400)
    }

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

    const togglePlay = (id: string) => {
        const video = videoRefs.current[id]
        if (!video) return
        if (video.paused) {
            video.play().catch(() => {})
            setPlayingStates((prev) => ({ ...prev, [id]: true }))
        } else {
            video.pause()
            setPlayingStates((prev) => ({ ...prev, [id]: false }))
        }
    }

    const toggleLike = (id: string) => {
        const isLiked = likedStates[id] ?? false
        setLikedStates((prev) => ({ ...prev, [id]: !isLiked }))
        setLikeCounts((prev) => ({
            ...prev,
            [id]: (prev[id] || 0) + (isLiked ? -1 : 1),
        }))
    }

    const formatNumber = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
        return num.toString()
    }

    return (
        <section className="py-12 sm:py-16 scroll-mt-20" id="creators">
            <span id="categories" className="sr-only" />
            <div className="mx-auto max-w-7xl px-6">
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1.5">
                            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Live Instagram Collab Engine &bull; North &amp; South Goa</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                            Explore by Goa Niches
                        </h2>
                        <p className="text-muted-foreground text-xs sm:text-sm mt-1">
                            Filter by coastal specialization and community resonance. Reels update dynamically on every visit.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 self-start sm:self-auto">
                        {/* Dynamic Shuffle Reels Button */}
                        <button
                            type="button"
                            onClick={handleShuffle}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted duration-150 cursor-pointer shadow-xs"
                            title="Shuffle and pop up random reels"
                        >
                            <RefreshCw className={`size-3.5 text-emerald-600 dark:text-emerald-400 ${isShuffling ? 'animate-spin' : ''}`} />
                            <span>Shuffle Reels</span>
                        </button>

                        <Link
                            href="#categories"
                            className="text-emerald-700 dark:text-emerald-400 hover:underline text-xs sm:text-sm font-semibold flex items-center gap-1"
                        >
                            <span>View All Niches</span>
                            <span>&rarr;</span>
                        </Link>
                    </div>
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

                {/* Instagram Reels Grid (Vertical Aspect Ratio, Clean Zero-Swimwear Content) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                    {displayReels.map((reel) => {
                        const isMuted = mutedStates[reel.id] ?? true
                        const isPlaying = playingStates[reel.id] ?? true
                        const isLiked = likedStates[reel.id] ?? false
                        const currentLikes = likeCounts[reel.id] ?? reel.likes

                        return (
                            <Card
                                key={reel.id}
                                className="group relative overflow-hidden rounded-2xl border border-border/80 bg-zinc-950 p-0 shadow-lg transition-all duration-300 hover:shadow-2xl hover:border-emerald-500/40 flex flex-col justify-between"
                            >
                                {/* Media Viewport (Tall Instagram Reel Format) */}
                                <div
                                    className="relative aspect-[9/13] w-full overflow-hidden cursor-pointer select-none bg-black"
                                    onClick={() => togglePlay(reel.id)}
                                >
                                    <video
                                        ref={(el) => {
                                            videoRefs.current[reel.id] = el
                                        }}
                                        autoPlay
                                        loop
                                        muted={isMuted}
                                        playsInline
                                        preload="metadata"
                                        src={reel.videoUrl}
                                        className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />

                                    {/* Gradients for Instagram text readability */}
                                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/60" />

                                    {/* Play / Pause Animated Overlay when paused */}
                                    {!isPlaying && (
                                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40">
                                            <div className="size-12 rounded-full bg-black/70 backdrop-blur-md text-white flex items-center justify-center border border-white/20">
                                                <Play className="size-5 fill-white ml-0.5" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Top Bar: Creator Info & Sound Control */}
                                    <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
                                        {/* Creator Avatar & Handle */}
                                        <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md rounded-full py-1 pl-1 pr-3 border border-white/15">
                                            <div className="p-[1.5px] rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600">
                                                <div className="size-6 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[10px] font-bold">
                                                    {reel.creator.avatar}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="text-[11px] font-semibold text-white drop-shadow-xs">
                                                    {reel.creator.handle}
                                                </span>
                                                <CheckCircle2 className="size-3 fill-emerald-500 text-black" />
                                            </div>
                                        </div>

                                        {/* Audio Mute/Unmute */}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                toggleMute(reel.id)
                                            }}
                                            aria-label={isMuted ? 'Unmute reel audio' : 'Mute reel audio'}
                                            className="size-7 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/90 duration-150 cursor-pointer border border-white/20 shadow-xs"
                                        >
                                            {isMuted ? <VolumeX className="size-3.5 text-zinc-300" /> : <Volume2 className="size-3.5 text-emerald-400" />}
                                        </button>
                                    </div>

                                    {/* Right Floating Action Rail (Instagram Reels Style) */}
                                    <div
                                        className="absolute right-3 bottom-20 flex flex-col items-center gap-3 z-10"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {/* Like Button */}
                                        <button
                                            type="button"
                                            onClick={() => toggleLike(reel.id)}
                                            className="flex flex-col items-center gap-1 group/btn cursor-pointer"
                                            title="Like Reel"
                                        >
                                            <div className={`size-9 rounded-full bg-black/60 backdrop-blur-md border border-white/15 flex items-center justify-center transition-transform active:scale-125 ${isLiked ? 'text-rose-500' : 'text-white hover:text-rose-400'}`}>
                                                <Heart className={`size-4.5 ${isLiked ? 'fill-rose-500' : ''}`} />
                                            </div>
                                            <span className="text-[10px] font-bold text-white drop-shadow-sm">
                                                {formatNumber(currentLikes)}
                                            </span>
                                        </button>

                                        {/* Collab / Comment Button */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedReel(reel)
                                                setBookingSuccess(false)
                                            }}
                                            className="flex flex-col items-center gap-1 group/btn cursor-pointer"
                                            title="Book Creator / Collab"
                                        >
                                            <div className="size-9 rounded-full bg-black/60 backdrop-blur-md border border-white/15 flex items-center justify-center text-white hover:text-emerald-400 transition-colors">
                                                <MessageCircle className="size-4.5" />
                                            </div>
                                            <span className="text-[10px] font-bold text-white drop-shadow-sm">
                                                {reel.comments}
                                            </span>
                                        </button>

                                        {/* Direct Instagram Link */}
                                        <a
                                            href={reel.instagramUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex flex-col items-center gap-1 group/btn cursor-pointer"
                                            title="Open on Instagram"
                                        >
                                            <div className="size-9 rounded-full bg-black/60 backdrop-blur-md border border-white/15 flex items-center justify-center text-white hover:text-amber-400 transition-colors">
                                                <Share2 className="size-4.5" />
                                            </div>
                                            <span className="text-[10px] font-semibold text-zinc-300">
                                                IG
                                            </span>
                                        </a>
                                    </div>

                                    {/* Bottom Overlay: Title, Caption, Audio & Hashtags */}
                                    <div className="absolute bottom-3 inset-x-3 pr-14 z-10 space-y-1.5 text-white">
                                        {/* Location Tag */}
                                        <div className="inline-flex items-center gap-1 rounded-md bg-black/60 backdrop-blur-md px-2 py-0.5 text-[10px] text-zinc-200 border border-white/10">
                                            <MapPin className="size-2.5 text-amber-400" />
                                            <span>{reel.location}</span>
                                        </div>

                                        {/* Reel Title */}
                                        <h3 className="text-sm font-bold text-white line-clamp-1 drop-shadow-sm">
                                            {reel.title}
                                        </h3>

                                        {/* Caption */}
                                        <p className="text-[11px] text-zinc-300 line-clamp-2 leading-relaxed">
                                            {reel.caption}
                                        </p>

                                        {/* Audio Track Ticker */}
                                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-300 pt-0.5">
                                            <Music className="size-2.5 text-emerald-400 animate-bounce" />
                                            <span className="truncate">{reel.audioTrack}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom Card Footer: Rates & Booking */}
                                <div className="p-3.5 bg-card border-t border-border/80 flex items-center justify-between gap-2">
                                    <div>
                                        <span className="text-[10px] font-medium text-muted-foreground uppercase">
                                            Collab Rate
                                        </span>
                                        <div className="text-xs font-bold text-foreground">
                                            {reel.creator.baseRate}
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => {
                                            setSelectedReel(reel)
                                            setBookingSuccess(false)
                                        }}
                                        size="sm"
                                        className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg h-8 px-3 cursor-pointer shadow-xs"
                                    >
                                        <span>Book Deal</span>
                                        <span>&rarr;</span>
                                    </Button>
                                </div>
                            </Card>
                        )
                    })}
                </div>
            </div>

            {/* Instagram Reel Booking & Profile Modal */}
            {selectedReel && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
                    <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
                        {/* Close button */}
                        <button
                            onClick={() => setSelectedReel(null)}
                            className="absolute top-4 right-4 size-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
                            aria-label="Close modal"
                        >
                            <X className="size-4" />
                        </button>

                        {/* Modal Header */}
                        <div className="flex items-start gap-3">
                            <div className="p-[2px] rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shrink-0">
                                <div className="size-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold text-base">
                                    {selectedReel.creator.avatar}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-bold text-foreground">{selectedReel.creator.name}</h3>
                                    <span className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-semibold border border-emerald-500/20">
                                        Verified
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground">{selectedReel.creator.handle} &bull; {selectedReel.location}</p>
                            </div>
                        </div>

                        {/* Reel Preview Info */}
                        <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-1.5">
                            <div className="text-xs font-bold text-foreground">{selectedReel.title}</div>
                            <p className="text-xs text-muted-foreground leading-relaxed">{selectedReel.caption}</p>
                            <div className="flex flex-wrap gap-1 pt-1">
                                {selectedReel.hashtags.map((tag, i) => (
                                    <span key={i} className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Stats Bar */}
                        <div className="grid grid-cols-3 gap-2 rounded-xl bg-muted/40 p-3 text-center border border-border">
                            <div>
                                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Followers</span>
                                <div className="text-sm font-bold text-foreground mt-0.5">{selectedReel.creator.followers}</div>
                            </div>
                            <div>
                                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Engagement</span>
                                <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{selectedReel.creator.er}</div>
                            </div>
                            <div>
                                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Base Rate</span>
                                <div className="text-sm font-bold text-foreground mt-0.5">{selectedReel.creator.baseRate}</div>
                            </div>
                        </div>

                        {/* Instagram Link */}
                        <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-background">
                            <div className="text-xs font-medium text-foreground">Verified Instagram Reel</div>
                            <a
                                href={selectedReel.instagramUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
                            >
                                <span>Watch on Instagram</span>
                                <ExternalLink className="size-3" />
                            </a>
                        </div>

                        {/* Booking Request Form */}
                        {bookingSuccess ? (
                            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-center space-y-2">
                                <CheckCircle2 className="size-6 text-emerald-600 dark:text-emerald-400 mx-auto" />
                                <div className="text-sm font-bold text-foreground">Collab Request Sent!</div>
                                <p className="text-xs text-muted-foreground">
                                    Brief delivered to {selectedReel.creator.handle}. Escrow milestones will activate upon creator acceptance.
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
                                    <label className="text-xs font-medium text-foreground">Collab Brief / Deliverables</label>
                                    <textarea
                                        required
                                        rows={2}
                                        defaultValue={`1 Dedicated Instagram Reel & 3 Stories for ${selectedReel.title}`}
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-medium text-foreground">Shoot Date</label>
                                        <input
                                            type="date"
                                            required
                                            defaultValue="2026-11-20"
                                            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-foreground">Escrow Amount</label>
                                        <input
                                            type="text"
                                            required
                                            defaultValue={selectedReel.creator.baseRate.replace('/reel', '')}
                                            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs rounded-lg h-9 cursor-pointer mt-2"
                                >
                                    Book {selectedReel.creator.name} via Escrow
                                </Button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </section>
    )
}
