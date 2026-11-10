'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { HeroHeader } from '@/components/hero-section-2-header'
import { MapPin, Sparkles, Volume2, VolumeX } from 'lucide-react'
import { useRef, useState } from 'react'

const campaigns = [
    {
        id: 'vagator',
        name: 'Vagator Cliffs',
        title: 'Sunkissed Horizons',
        brand: 'Luxury Stays Goa',
        creator: '@kabir.drone',
        location: 'Vagator Cliffs & Coastline',
        video: 'https://assets.mixkit.co/videos/51500/51500-1080.mp4',
        tag: 'Drone & Landscape',
        description: 'Cinematic golden-hour commercial shoot showcasing cliffside villas and dramatic coastline for summer 2026.',
    },
    {
        id: 'assagao',
        name: 'Assagao Estate',
        title: 'Portuguese Heritage Revival',
        brand: 'Villa Capella & Estate',
        creator: '@rohan.visuals',
        location: 'Assagao & Fontainhas Mansions',
        video: 'https://assets.mixkit.co/videos/1191/1191-1080.mp4',
        tag: 'Architecture & Stays',
        description: 'Editorial architectural walkthrough and lifestyle storytelling across restored 18th-century heritage villas.',
    },
    {
        id: 'ashwem',
        name: 'Ashwem Beach Club',
        title: 'Boho Sunset Golden Hour',
        brand: 'Boho Beach House Goa',
        creator: '@ananya.creates',
        location: 'Ashwem Beachfront & Club',
        video: 'https://assets.mixkit.co/videos/2168/2168-1080.mp4',
        tag: 'Travel & Hospitality',
        description: 'Viral lifestyle reels driving 340+ direct boutique villa bookings during peak coastal season.',
    },
    {
        id: 'morjim',
        name: 'Morjim Coastline',
        title: 'Aerial Coastal Expedition',
        brand: 'Goa Surf Collective',
        creator: '@tarun.aerial',
        location: 'Morjim Dunes & Chapora River',
        video: 'https://assets.mixkit.co/videos/1564/1564-1080.mp4',
        tag: 'Action & Adventure',
        description: 'Multi-creator coastal expedition documenting secret sandbars, river backwaters, and surf culture.',
    },
]

export default function HeroSection() {
    const [selectedCampaign, setSelectedCampaign] = useState(campaigns[0])
    const videoRef = useRef<HTMLVideoElement>(null)
    const [isMuted, setIsMuted] = useState(true)

    const toggleAudio = () => {
        if (!videoRef.current) return
        videoRef.current.muted = !isMuted
        setIsMuted(!isMuted)
    }

    const handleSelectCampaign = (camp: typeof campaigns[0]) => {
        setSelectedCampaign(camp)
        if (videoRef.current) {
            videoRef.current.src = camp.video
            videoRef.current.play().catch(() => {})
        }
    }

    return (
        <>
            <HeroHeader />
            <main className="overflow-hidden">
                <section className="pt-32 sm:pt-40" id="hero-showcase">
                    <div className="mx-auto max-w-7xl px-6">
                        {/* Title & Pitch */}
                        <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-6">
                            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-500 dark:text-amber-400 backdrop-blur-md">
                                <Sparkles className="size-3.5" />
                                <span>The Premier Goa Creator &amp; Luxury Stay Collective</span>
                            </div>

                            <h1 className="text-balance text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
                                Where Goa&apos;s Top Creators &amp; Luxury Brands Connect.
                            </h1>

                            <p className="text-muted-foreground text-lg sm:text-xl leading-relaxed max-w-2xl">
                                Unlock secret heritage shoot locations, partner directly with luxury beach clubs &amp; boutique stays, and turn your Goa storytelling into high-ticket brand deals.
                            </p>

                            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                                <Button
                                    className="bg-amber-500 hover:bg-amber-600 text-black font-semibold h-11 px-7 rounded-full text-base cursor-pointer shadow-lg shadow-amber-500/20"
                                    size="lg"
                                    nativeButton={false}
                                    render={<Link href="#pricing">Join as Creator</Link>}
                                />
                                <Button
                                    variant="outline"
                                    className="h-11 px-7 rounded-full text-base cursor-pointer"
                                    size="lg"
                                    nativeButton={false}
                                    render={<Link href="#reels">Explore Creator Reels</Link>}
                                />
                            </div>
                        </div>

                        {/* Interactive Campaign Showcase */}
                        <div className="mt-12 sm:mt-16">
                            {/* Interactive Campaign Tabs */}
                            <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 scrollbar-none">
                                {campaigns.map((camp) => {
                                    const isActive = selectedCampaign.id === camp.id
                                    return (
                                        <button
                                            key={camp.id}
                                            onClick={() => handleSelectCampaign(camp)}
                                            className={`cursor-pointer whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 border ${
                                                isActive
                                                    ? 'bg-amber-500 text-black border-amber-500 shadow-md shadow-amber-500/25 scale-102'
                                                    : 'bg-muted/40 text-muted-foreground border-border hover:bg-muted hover:text-foreground'
                                            }`}
                                        >
                                            {camp.name}
                                        </button>
                                    )
                                })}
                            </div>

                            {/* Cinematic Video Showcase Monitor */}
                            <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-black shadow-2xl shadow-black/50">
                                <div className="relative aspect-16/9 sm:aspect-21/9 w-full overflow-hidden">
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        loop
                                        muted={isMuted}
                                        playsInline
                                        preload="auto"
                                        src={selectedCampaign.video}
                                        className="size-full object-cover transition-opacity duration-300"
                                    />

                                    {/* Ambient Gradients for readability */}
                                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

                                    {/* Top Location Badge */}
                                    <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2">
                                        <div className="inline-flex items-center gap-2 rounded-full bg-black/70 backdrop-blur-md border border-white/15 px-3.5 py-1.5 text-xs text-white">
                                            <MapPin className="size-3.5 text-amber-400" />
                                            <span>{selectedCampaign.location}</span>
                                        </div>
                                    </div>

                                    {/* Sound Toggle Button */}
                                    <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={toggleAudio}
                                            aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                                            className="size-10 rounded-full bg-black/70 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black/90 hover:scale-105 duration-150 cursor-pointer shadow-lg"
                                        >
                                            {isMuted ? <VolumeX className="size-4.5" /> : <Volume2 className="size-4.5 text-amber-400" />}
                                        </button>
                                    </div>

                                    {/* Bottom Information Bar */}
                                    <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 right-4 sm:right-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                                        <div className="space-y-1.5 text-white max-w-xl">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[11px] uppercase tracking-wider text-amber-400 font-bold bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                                                    {selectedCampaign.tag}
                                                </span>
                                                <span className="text-xs text-zinc-300 font-medium">
                                                    Collab: {selectedCampaign.creator} &times; {selectedCampaign.brand}
                                                </span>
                                            </div>

                                            <h3 className="text-xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-sm">
                                                {selectedCampaign.title}
                                            </h3>

                                            <p className="text-xs sm:text-sm text-zinc-300 line-clamp-2 leading-relaxed">
                                                {selectedCampaign.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Curated Creative Niches Ticker (No Emojis) */}
                        <div className="py-12 border-b border-border/50">
                            <p className="text-center text-xs uppercase tracking-widest text-muted-foreground mb-6 font-semibold">
                                Empowering All Creative Disciplines Across Goa
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm">
                                {[
                                    'Portuguese Heritage Mansions',
                                    '4K Drone & Cinematic Films',
                                    'Sunset Beach Clubs & Mixology',
                                    'Festival, Club & DJ Culture',
                                    'Boutique Cafes & Culinary Creators',
                                    'Ocean Surf & Wellness Retreats',
                                    'Coastal Fashion & Indie Labels',
                                ].map((item, index) => (
                                    <span
                                        key={index}
                                        className="rounded-full border border-border bg-muted/30 px-4 py-1.5 text-muted-foreground font-medium hover:text-foreground hover:border-amber-500/40 hover:bg-muted duration-150 select-none transition-colors"
                                    >
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}
