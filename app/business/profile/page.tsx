'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
    Bookmark,
    CheckCircle2,
    Compass,
    ExternalLink,
    MapPin,
    Send,
    Share2,
    ShieldCheck,
    Sparkles,
    Star,
    Store,
    Users,
    Utensils,
} from 'lucide-react'

export default function BusinessProfilePage() {
    const [isShortlisted, setIsShortlisted] = useState(true)

    return (
        <main className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-border">
                <Link
                    href="/business/discover"
                    className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline"
                >
                    <span>&larr; Back to Discover Goan Creators</span>
                </Link>
                <div className="text-xs text-muted-foreground">
                    Viewing creator profile for <span className="font-bold text-foreground">Sneha Fernandes</span> (Assagao, North Goa)
                </div>
            </div>

            {/* Creator Hero / Cover Card */}
            <div className="border border-border bg-card overflow-hidden">
                <div className="relative h-60 sm:h-72 w-full bg-zinc-900 overflow-hidden">
                    <Image
                        unoptimized
                        src="https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=1600&auto=format&fit=crop"
                        alt="Goa Courtyard Cafe"
                        width={1600}
                        height={600}
                        className="size-full object-cover opacity-85"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

                    <div className="absolute top-4 inset-x-4 sm:inset-x-6 flex items-center justify-between z-10">
                        <div className="inline-flex items-center gap-1.5 bg-black/70 backdrop-blur-md border border-white/20 px-3 py-1 text-xs font-bold text-white shadow-none">
                            <span className="size-2 bg-primary animate-pulse" />
                            <span>VERIFIED COASTAL CREATOR</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                aria-label="Share creator profile"
                                onClick={() => navigator.clipboard?.writeText(window.location.href)}
                                className="size-9 bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black/80 transition-colors cursor-pointer"
                            >
                                <Share2 className="size-4" />
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsShortlisted(!isShortlisted)}
                                className="bg-white text-zinc-950 font-bold text-xs px-3.5 py-2 flex items-center gap-1.5 shadow-none hover:bg-zinc-100 transition-colors cursor-pointer"
                            >
                                <Bookmark className={`size-3.5 ${isShortlisted ? 'fill-zinc-950' : ''}`} />
                                <span>{isShortlisted ? 'Shortlisted' : 'Bookmark'}</span>
                            </button>

                            <Link
                                href="/business/requests"
                                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs px-4 py-2 flex items-center gap-1.5 shadow-none transition-colors cursor-pointer"
                            >
                                <Send className="size-3.5" />
                                <span>Send Collab Request</span>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="p-6 sm:p-8 pt-0 relative">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-4">
                        <div className="relative size-24 sm:size-28 border-4 border-background bg-zinc-800 shadow-none overflow-hidden shrink-0">
                            <Image
                                unoptimized
                                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop"
                                alt="Sneha Fernandes"
                                width={120}
                                height={120}
                                className="size-full object-cover"
                            />
                            <div className="absolute bottom-1 right-1 bg-primary text-white p-0.5 border border-background shadow-none">
                                <CheckCircle2 className="size-4 fill-primary text-white" />
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1 bg-muted border border-border px-3 py-1 text-xs font-semibold text-foreground">
                                <Utensils className="size-3 text-primary" />
                                <span>Food &amp; Dining</span>
                            </span>
                            <span className="inline-flex items-center gap-1 bg-muted border border-border px-3 py-1 text-xs font-semibold text-foreground">
                                <Store className="size-3 text-primary" />
                                <span>Boutique Stays &amp; Heritage</span>
                            </span>
                            <span className="inline-flex items-center gap-1 bg-muted border border-border px-3 py-1 text-xs font-semibold text-foreground">
                                <Compass className="size-3 text-primary" />
                                <span>Lifestyle &amp; Culture</span>
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                                Sneha Fernandes
                            </h1>
                            <span className="text-xs text-muted-foreground font-mono">
                                @sneha_curates
                            </span>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="size-3.5 text-primary" />
                                <span>Assagao, North Goa</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
                                <span className="size-2 bg-primary animate-pulse" />
                                <span>Active 2h ago</span>
                            </div>
                            <span className="border border-border bg-muted px-2.5 py-0.5 text-[11px] font-bold text-foreground">
                                18 Completed Brand Deals
                            </span>
                        </div>

                        <p className="text-xs sm:text-sm text-muted-foreground max-w-4xl leading-relaxed">
                            Visual storyteller &amp; food writer documenting Goa&apos;s emerging culinary culture, artisanal cafes, and boutique heritage stays. Featured in <strong className="text-foreground font-semibold">Condé Nast Traveller</strong> &amp; <strong className="text-foreground font-semibold">Nat Geo India</strong>. Specialized in cinematic vertical reels highlighting sustainable Goan hospitality.
                        </p>
                    </div>
                </div>
            </div>

            {/* Audience Vital Metrics */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Users className="size-4 text-primary" />
                        <h2 className="text-sm font-bold text-foreground">Audience Vital Metrics</h2>
                    </div>
                    <span className="border border-border bg-muted px-2.5 py-0.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        REALTIME META API SYNC · OCT 2026
                    </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                    {[
                        { label: 'Followers', value: '120.4K', change: '↑ +3.2% this mo', color: 'border-b-4 border-b-primary', sub: 'Audience size' },
                        { label: 'Engagement Rate', value: '7.8%', change: '⚡ 2.4x Ind. Avg', color: 'border-b-4 border-b-cyan-500', sub: 'Industry benchmark' },
                        { label: 'Avg. Likes', value: '8,920', change: 'per feed post', color: 'border-b-4 border-b-amber-500', sub: 'Consistent baseline' },
                        { label: 'Avg. Reel Views', value: '64.5K', change: 'High virality', color: 'border-b-4 border-b-primary', sub: 'Video momentum' },
                        { label: 'Avg. Comments', value: '340', change: 'High dialogue intent', color: 'border-b-4 border-b-sky-500', sub: 'Community affinity' },
                        { label: 'Goa & Travelers', value: '92%', change: '68% Goa / 24% Fly-in', color: 'border-b-4 border-b-orange-500', sub: 'Target resonance' },
                    ].map((metric) => (
                        <div
                            key={metric.label}
                            className={`border border-border bg-card p-4 space-y-2 ${metric.color}`}
                        >
                            <span className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider block">
                                {metric.label}
                            </span>
                            <div className="text-2xl font-extrabold text-foreground tracking-tight leading-none">
                                {metric.value}
                            </div>
                            <div className="text-[11px] text-primary font-semibold pt-1">
                                {metric.change}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Audience Growth Chart & Persona */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-7 border border-border bg-card p-6 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
                        <div>
                            <h3 className="text-base font-bold text-foreground">
                                Audience Growth &amp; Engagement
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                6-Month trajectory with hospitality campaign peaks
                            </p>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-semibold">
                            <div className="flex items-center gap-1.5">
                                <span className="size-2 bg-primary" />
                                <span>Followers (k)</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="size-2 bg-sky-500" />
                                <span>Engagement Rate (%)</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative h-56 w-full pt-4">
                        <svg className="size-full overflow-visible" viewBox="0 0 600 200" preserveAspectRatio="none">
                            <rect x="360" y="20" width="80" height="150" fill="currentColor" className="text-primary/10" />
                            <text x="400" y="15" textAnchor="middle" className="text-[10px] font-bold fill-primary">
                                Monsoon Fest
                            </text>

                            <line x1="40" y1="30" x2="580" y2="30" stroke="currentColor" className="text-border/40" strokeDasharray="3 3" />
                            <line x1="40" y1="80" x2="580" y2="80" stroke="currentColor" className="text-border/40" strokeDasharray="3 3" />
                            <line x1="40" y1="130" x2="580" y2="130" stroke="currentColor" className="text-border/40" strokeDasharray="3 3" />
                            <line x1="40" y1="170" x2="580" y2="170" stroke="currentColor" className="text-border/80" />

                            <text x="10" y="35" className="text-[10px] fill-muted-foreground">130K</text>
                            <text x="10" y="85" className="text-[10px] fill-muted-foreground">100K</text>
                            <text x="10" y="135" className="text-[10px] fill-muted-foreground">70K</text>
                            <text x="10" y="175" className="text-[10px] fill-muted-foreground">40K</text>

                            <defs>
                                <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#0c4e40" stopOpacity="0.3" />
                                    <stop offset="100%" stopColor="#0c4e40" stopOpacity="0.0" />
                                </linearGradient>
                            </defs>
                            <path
                                d="M 60 140 C 130 138, 170 125, 230 110 C 290 95, 330 65, 400 45 C 470 35, 520 30, 560 25 L 560 170 L 60 170 Z"
                                fill="url(#growthGrad)"
                            />
                            <path
                                d="M 60 140 C 130 138, 170 125, 230 110 C 290 95, 330 65, 400 45 C 470 35, 520 30, 560 25"
                                fill="none"
                                stroke="#0c4e40"
                                strokeWidth="3"
                            />

                            <path
                                d="M 60 100 C 140 102, 220 90, 300 75 C 380 60, 460 55, 560 40"
                                fill="none"
                                stroke="#0ea5e9"
                                strokeWidth="2.5"
                                strokeDasharray="4 2"
                            />

                            {[
                                { cx: 60, cy: 140 },
                                { cx: 160, cy: 125 },
                                { cx: 260, cy: 100 },
                                { cx: 400, cy: 45 },
                                { cx: 480, cy: 32 },
                                { cx: 560, cy: 25 },
                            ].map((p, idx) => (
                                <circle key={idx} cx={p.cx} cy={p.cy} r="4" fill="#0c4e40" stroke="#fff" strokeWidth="2" />
                            ))}

                            <text x="60" y="190" textAnchor="middle" className="text-[10px] fill-muted-foreground">May</text>
                            <text x="160" y="190" textAnchor="middle" className="text-[10px] fill-muted-foreground">Jun</text>
                            <text x="260" y="190" textAnchor="middle" className="text-[10px] fill-muted-foreground">Jul</text>
                            <text x="400" y="190" textAnchor="middle" className="text-[10px] font-bold fill-primary">Aug (Peak)</text>
                            <text x="480" y="190" textAnchor="middle" className="text-[10px] fill-muted-foreground">Sep</text>
                            <text x="560" y="190" textAnchor="middle" className="text-[10px] font-bold fill-foreground">Oct (Now)</text>
                        </svg>
                    </div>

                    <div className="border border-border bg-muted p-3.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="size-4 text-primary" />
                            <span className="font-semibold text-foreground">
                                Consistent Organic Growth
                            </span>
                            <span className="text-muted-foreground hidden sm:inline">
                                • Zero synthetic spikes detected across 180 days audit.
                            </span>
                        </div>
                        <span className="font-bold text-primary">
                            +24.8K Q3
                        </span>
                    </div>
                </div>

                <div className="lg:col-span-5 border border-border bg-card p-6 space-y-6">
                    <div className="border-b border-border pb-4">
                        <h3 className="text-base font-bold text-foreground">Audience Persona</h3>
                        <p className="text-xs text-muted-foreground">
                            Demographic split tailored for hospitality marketing
                        </p>
                    </div>

                    <div className="space-y-3">
                        <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs font-semibold">
                                <span className="text-foreground">Age 24–35 yrs (Prime Spenders)</span>
                                <span className="text-primary font-bold">58%</span>
                            </div>
                            <div className="h-2 w-full bg-muted overflow-hidden">
                                <div className="h-full bg-primary w-[58%]" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs font-semibold">
                                <span className="text-foreground">Age 36–45 yrs (Heritage Travellers)</span>
                                <span className="text-primary font-bold">26%</span>
                            </div>
                            <div className="h-2 w-full bg-muted overflow-hidden">
                                <div className="h-full bg-primary w-[26%]" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs font-semibold">
                                <span className="text-foreground">Age 18–23 yrs</span>
                                <span className="text-muted-foreground font-bold">16%</span>
                            </div>
                            <div className="h-2 w-full bg-muted overflow-hidden">
                                <div className="h-full bg-primary w-[16%]" />
                            </div>
                        </div>
                    </div>

                    <div className="border border-border bg-muted/30 p-3 grid grid-cols-2 divide-x divide-border text-center">
                        <div>
                            <div className="text-xs text-muted-foreground font-semibold">Women</div>
                            <div className="text-lg font-bold text-foreground">62%</div>
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground font-semibold">Men</div>
                            <div className="text-lg font-bold text-foreground">38%</div>
                        </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-border">
                        <span className="text-xs font-bold text-foreground block">Top Audience Locations</span>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="border border-border p-2 bg-background">
                                <span className="text-muted-foreground block text-[10px]">Goa State</span>
                                <span className="font-bold text-foreground">42% (North &amp; South)</span>
                            </div>
                            <div className="border border-border p-2 bg-background">
                                <span className="text-muted-foreground block text-[10px]">Mumbai &amp; Pune</span>
                                <span className="font-bold text-foreground">26% (Weekend Tourists)</span>
                            </div>
                            <div className="border border-border p-2 bg-background">
                                <span className="text-muted-foreground block text-[10px]">Bengaluru</span>
                                <span className="font-bold text-foreground">18% (Tech Nomads)</span>
                            </div>
                            <div className="border border-border p-2 bg-background">
                                <span className="text-muted-foreground block text-[10px]">Delhi NCR</span>
                                <span className="font-bold text-foreground">14% (Seasonal Travelers)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Connected Socials & Rate Card */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-5 space-y-4">
                    <div className="border border-border bg-card p-5 space-y-3">
                        <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                            Connected Social Channels
                        </h3>

                        <a
                            href="https://instagram.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="border border-border p-3 flex items-center justify-between hover:bg-muted/50 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="size-9 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs">
                                    IG
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-foreground flex items-center gap-1">
                                        <span>@sneha_curates</span>
                                        <CheckCircle2 className="size-3 text-sky-500" />
                                    </div>
                                    <div className="text-[11px] text-muted-foreground">
                                        Instagram • 120,400 Followers
                                    </div>
                                </div>
                            </div>
                            <ExternalLink className="size-4 text-muted-foreground group-hover:text-foreground" />
                        </a>

                        <a
                            href="https://youtube.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="border border-border p-3 flex items-center justify-between hover:bg-muted/50 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="size-9 bg-red-600 text-white flex items-center justify-center font-bold text-xs">
                                    YT
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-foreground">
                                        @snehafernandesgoa
                                    </div>
                                    <div className="text-[11px] text-muted-foreground">
                                        YouTube • 34,200 Subscribers
                                    </div>
                                </div>
                            </div>
                            <ExternalLink className="size-4 text-muted-foreground group-hover:text-foreground" />
                        </a>
                    </div>

                    <div className="border border-border bg-card p-5 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                            <Star className="size-3.5 fill-amber-500 text-amber-500" />
                            <span>Editor&apos;s Pick 2024</span>
                        </div>
                        <p className="text-xs text-muted-foreground italic leading-relaxed">
                            &ldquo;Sneha&apos;s slow-living chronicles give travelers authentic Goa without the tourist traps.&rdquo;
                        </p>
                        <span className="text-[11px] font-bold text-foreground block">
                            — Condé Nast Traveller India
                        </span>
                    </div>

                    <div className="border border-border bg-card p-5 flex items-center justify-between">
                        <div>
                            <div className="text-xs font-bold text-foreground">Coverage Radius</div>
                            <div className="text-[11px] text-muted-foreground">Assagao, Siolim, Anjuna, Panjim, Salcete</div>
                        </div>
                        <span className="bg-sky-500/10 border border-sky-500/30 text-sky-800 dark:text-sky-300 text-[10px] font-bold px-2 py-1">
                            On-site visits available
                        </span>
                    </div>
                </div>

                <div className="lg:col-span-7 border border-border bg-card p-6 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                        <div>
                            <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground block">
                                RATE CARD &amp; COMMERCIAL TERMS
                            </span>
                            <h3 className="text-lg font-extrabold text-foreground tracking-tight">
                                Collab Pricing &amp; Deliverables
                            </h3>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-black text-primary leading-none">
                                ₹14,000
                            </div>
                            <span className="text-[10px] text-muted-foreground">Base Rate / Dedicated Reel</span>
                        </div>
                    </div>

                    <div className="border border-amber-500/30 bg-amber-500/10 p-3.5 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                            <Sparkles className="size-3.5" />
                            <span>Barter Collaboration Friendly · SELECTIVELY OPEN</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                            Sneha accepts curated barter stays (2+ nights in heritage/boutique villas) and seasonal tasting menu experiences for verified culinary brands. Minimum follower baseline or premium property tier required.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="border border-border p-3.5 space-y-2 bg-background">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-foreground">Instagram Reel (30–60s)</span>
                                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5">
                                    Base Tier
                                </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                Cinematic 4K grade, trending coastal audio, storytelling voiceover, business co-authorship tag.
                            </p>
                        </div>

                        <div className="border border-border p-3.5 space-y-2 bg-background">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-foreground">Photo Carousel (6–10 slides)</span>
                                <span className="text-[10px] font-bold text-foreground bg-muted px-2 py-0.5">
                                    +₹6,000
                                </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                Editorial styling of signature dishes, architecture, ambiance. High-resolution raw exports provided.
                            </p>
                        </div>

                        <div className="border border-border p-3.5 space-y-2 bg-background">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-foreground">Story Sequence (3–5x frames)</span>
                                <span className="text-[10px] font-bold text-foreground bg-muted px-2 py-0.5">
                                    +₹4,500
                                </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                Realtime unboxing / dining walkthrough with booking CTA link sticker and location geotag.
                            </p>
                        </div>

                        <div className="border border-border p-3.5 space-y-2 bg-background">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-foreground">Full Commercial License</span>
                                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5">
                                    6 Mos Included
                                </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                Perpetual digital rights for business website, Instagram Meta ads, and digital brochures.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-muted-foreground font-medium">Standard turnaround: 5–7 business days</span>
                        <Link
                            href="/business/requests"
                            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs px-5 py-2.5 cursor-pointer"
                        >
                            Inquire Availability &rarr;
                        </Link>
                    </div>
                </div>
            </div>

            {/* Business Reviews */}
            <section className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                    <div className="flex items-center gap-2">
                        <Star className="size-4 fill-amber-500 text-amber-500" />
                        <h2 className="text-sm font-bold text-foreground">
                            Business Reviews <span className="text-muted-foreground font-normal">• 18 verified collabs</span>
                        </h2>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-semibold">
                        <span className="text-amber-500 font-bold">5.0 ★★★★★</span>
                        <span className="text-primary">100% On-Time Delivery</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-border bg-card p-5 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="size-9 bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
                                    CB
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-foreground">Café Bodega</h4>
                                    <span className="text-[11px] text-muted-foreground">Altinho, Panjim • Monsoon Menu Campaign</span>
                                </div>
                            </div>
                            <div className="flex text-amber-500 text-xs">★★★★★</div>
                        </div>

                        <p className="text-xs text-muted-foreground leading-relaxed">
                            &ldquo;Sneha created an incredible reel on our monsoon dessert menu. Resulted in our busiest Sunday brunch of the season. She understood our heritage courtyard lighting perfectly and delivered without disrupting our seated guests.&rdquo;
                        </p>

                        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border">
                            <span className="text-primary font-semibold">Verified Campaign (August 2026)</span>
                            <span className="font-bold text-foreground">Result: 42K Organic Reach</span>
                        </div>
                    </div>

                    <div className="border border-border bg-card p-5 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="size-9 bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-xs">
                                    PA
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-foreground">The Project Assagao</h4>
                                    <span className="text-[11px] text-muted-foreground">Assagao, North Goa • Boutique Villa Stay Collab</span>
                                </div>
                            </div>
                            <div className="flex text-amber-500 text-xs">★★★★★</div>
                        </div>

                        <p className="text-xs text-muted-foreground leading-relaxed">
                            &ldquo;Super professional, timely delivery of raw footage, and highly engaged Goan audience. We gained over 280 direct room inquiries over the weekend following her carousel post. Would definitely book again for our winter festival.&rdquo;
                        </p>

                        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border">
                            <span className="text-primary font-semibold">Verified Campaign (September 2026)</span>
                            <span className="font-bold text-foreground">Result: 18 Booking Conversions</span>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}
