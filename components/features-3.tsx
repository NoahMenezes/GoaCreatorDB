'use client'

import { Card } from '@/components/ui/card'
import { Sparkles, Volume2, VolumeX } from 'lucide-react'
import { useState } from 'react'

const categories = ['All Reels', 'Luxury Stays', 'Beach Clubs', 'Drone Cinema', 'Lifestyle']

const reels = [
    {
        category: 'Beach Clubs',
        video: 'https://assets.mixkit.co/videos/2168/2168-1080.mp4',
    },
    {
        category: 'Luxury Stays',
        video: 'https://assets.mixkit.co/videos/1191/1191-1080.mp4',
    },
    {
        category: 'Drone Cinema',
        video: 'https://assets.mixkit.co/videos/1564/1564-1080.mp4',
    },
    {
        category: 'Lifestyle',
        video: 'https://assets.mixkit.co/videos/3158/3158-1080.mp4',
    },
    {
        category: 'Luxury Stays',
        video: 'https://assets.mixkit.co/videos/3159/3159-1080.mp4',
    },
    {
        category: 'Drone Cinema',
        video: 'https://assets.mixkit.co/videos/51501/51501-1080.mp4',
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
                            <span>Creator Reels</span>
                        </div>
                        <h2 className="text-balance text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
                            Real Brand Collabs in Motion Across Goa
                        </h2>
                        <p className="text-muted-foreground text-lg">
                            Authentic reels produced by verified creators for boutique stays, beach clubs, and lifestyle brands.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground self-start md:self-end">
                        <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Updated Daily</span>
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

                {/* Clean Reels Grid without clutter/watermark text */}
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

                                    {/* Subtle gradient for depth */}
                                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

                                    {/* Minimal sound toggle */}
                                    <div className="absolute top-4 right-4 z-10">
                                        <button
                                            type="button"
                                            onClick={() => toggleMute(index)}
                                            aria-label={isMuted ? 'Unmute reel' : 'Mute reel'}
                                            className="size-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black/90 cursor-pointer duration-150 shadow-md"
                                        >
                                            {isMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4 text-amber-400" />}
                                        </button>
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
