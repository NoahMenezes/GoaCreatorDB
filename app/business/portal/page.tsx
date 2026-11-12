'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
    Anchor,
    Bell,
    Bookmark,
    Camera,
    Check,
    CheckCircle2,
    ChevronDown,
    Compass,
    ExternalLink,
    FileText,
    Globe,
    Heart,
    Home,
    LayoutDashboard,
    MapPin,
    MessageSquare,
    Phone,
    Plane,
    Play,
    Plus,
    Search,
    Send,
    Share2,
    ShieldCheck,
    Sparkles,
    Star,
    Store,
    TrendingUp,
    Users,
    Utensils,
    X,
    Zap,
} from 'lucide-react'
import { AnimatedThemeToggler } from '@/registry/magicui/animated-theme-toggler'
import {
    DiscoverView,
    DISCOVER_CREATORS,
    type CreatorItem,
} from '@/components/portal/discover-view'

export default function BusinessPortalPage() {
    const [activeNav, setActiveNav] = useState('discover')
    const [selectedCreator, setSelectedCreator] = useState<CreatorItem>(DISCOVER_CREATORS[0])
    const [shortlistedIds, setShortlistedIds] = useState<string[]>([
        'cr-sneha',
        'cr-rohan',
        'cr-alisha',
        'cr-keith',
    ])
    const [isShortlisted, setIsShortlisted] = useState(true)
    const [isCollabModalOpen, setIsCollabModalOpen] = useState(false)
    const [selectedAddons, setSelectedAddons] = useState<string[]>(['reel'])
    const [campaignBrief, setCampaignBrief] = useState(
        'Monsoon Weekend Tasting Menu & Heritage Sourdough Walkthrough for Café Palmeira'
    )
    const [requestSuccess, setRequestSuccess] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [locationFilter, setLocationFilter] = useState('All Goa / North & South')

    const baseRate = 14000
    const addonPrices: Record<string, number> = {
        reel: 0,
        carousel: 6000,
        stories: 4500,
        license: 0,
    }

    const calculatedTotal =
        baseRate +
        selectedAddons.reduce((acc, curr) => acc + (addonPrices[curr] || 0), 0)

    const toggleAddon = (id: string) => {
        if (id === 'reel') return // required base deliverable
        setSelectedAddons((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        )
    }

    const handleSendRequest = (e: React.FormEvent) => {
        e.preventDefault()
        setRequestSuccess(true)
        setTimeout(() => {
            setIsCollabModalOpen(false)
            setRequestSuccess(false)
        }, 1800)
    }

    return (
        <div className="min-h-screen flex bg-background text-foreground transition-colors duration-200">
            {/* LEFT SIDEBAR (Images 1, 2, 3 Left) */}
            <aside className="w-64 border-r border-border/70 bg-card/50 hidden md:flex flex-col justify-between p-4 shrink-0 sticky top-0 h-screen overflow-y-auto">
                <div className="space-y-6">
                    {/* Brand Header */}
                    <Link href="/business/portal" className="flex items-center gap-2.5 px-2 py-1">
                        <div className="size-9 rounded-xl bg-teal-800 text-white flex items-center justify-center shadow-xs">
                            <Anchor className="size-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-sans text-base font-extrabold tracking-tight text-foreground leading-none">
                                GoaConnect
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-teal-700 dark:text-teal-400 mt-1">
                                BUSINESS PORTAL
                            </span>
                        </div>
                    </Link>

                    {/* Navigation Links */}
                    <nav className="space-y-1">
                        {[
                            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                            { id: 'discover', label: 'Discover Creators', icon: Compass },
                            { id: 'shortlist', label: 'Shortlist', icon: Bookmark, badge: shortlistedIds.length.toString() },
                            { id: 'requests', label: 'My Requests', icon: Send, badge: '2 active' },
                            { id: 'reviews', label: 'Reviews', icon: Star },
                            { id: 'profile', label: 'Profile', icon: Store },
                        ].map((item) => {
                            const Icon = item.icon
                            const isActive = activeNav === item.id
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setActiveNav(item.id)}
                                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer ${
                                        isActive
                                            ? 'bg-teal-700 text-white shadow-xs'
                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon className="size-4" />
                                        <span>{item.label}</span>
                                    </div>
                                    {item.badge && (
                                        <span
                                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                                isActive
                                                    ? 'bg-white/20 text-white'
                                                    : 'bg-muted text-muted-foreground'
                                            }`}
                                        >
                                            {item.badge}
                                        </span>
                                    )}
                                </button>
                            )
                        })}
                    </nav>
                </div>

                {/* Bottom Account Card (Café Palmeira, Calangute, Goa) */}
                <div className="space-y-3 pt-4 border-t border-border/70">
                    <div className="rounded-2xl border border-border/80 bg-card p-3 flex items-center justify-between shadow-xs">
                        <div className="flex items-center gap-2.5">
                            <div className="size-9 rounded-xl bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 flex items-center justify-center shrink-0">
                                <Store className="size-4.5" />
                            </div>
                            <div className="text-left">
                                <div className="text-xs font-bold text-foreground">Café Palmeira</div>
                                <div className="text-[11px] text-muted-foreground">Calangute, Goa</div>
                            </div>
                        </div>
                        <ChevronDown className="size-4 text-muted-foreground" />
                    </div>

                    <div className="flex items-center justify-between px-2 text-[11px] text-muted-foreground">
                        <Link href="/join" className="hover:text-foreground hover:underline">
                            Switch Role
                        </Link>
                        <button
                            type="button"
                            onClick={async () => {
                                await fetch('/api/auth/logout', { method: 'POST' })
                                // eslint-disable-next-line @next/next/no-location-assign-relative-destination
                                window.location.href = '/login'
                            }}
                            className="hover:text-foreground hover:underline cursor-pointer"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* MAIN PORTAL AREA */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* TOP BAR (Image 1 Top) */}
                <header className="h-16 border-b border-border/70 bg-card/60 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-30">
                    {/* Search Input */}
                    <div className="flex items-center gap-3 flex-1 max-w-xl">
                        <div className="relative flex items-center w-full">
                            <Search className="absolute left-3.5 size-4 text-muted-foreground" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search creators by niche, taluka, name..."
                                className="w-full rounded-xl border border-border bg-background pl-10 pr-3.5 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-teal-600"
                            />
                        </div>

                        {/* Location Dropdown */}
                        <div className="hidden sm:flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground shrink-0 cursor-pointer hover:bg-muted">
                            <MapPin className="size-3.5 text-teal-700 dark:text-teal-400" />
                            <select
                                value={locationFilter}
                                onChange={(e) => setLocationFilter(e.target.value)}
                                className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
                            >
                                <option value="All Goa / North & South">All Goa / North &amp; South</option>
                                <option value="North Goa (Calangute, Assagao)">North Goa (Calangute, Assagao)</option>
                                <option value="South Goa (Margao, Salcete)">South Goa (Margao, Salcete)</option>
                                <option value="Panjim & Tiswadi">Panjim &amp; Tiswadi</option>
                            </select>
                        </div>
                    </div>

                    {/* Right Action Buttons */}
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setIsCollabModalOpen(true)}
                            className="bg-[#0c4e40] hover:bg-[#08382e] text-white text-xs font-semibold rounded-xl px-4 py-2 flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                        >
                            <Plus className="size-3.5" />
                            <span>New Request</span>
                        </button>

                        <AnimatedThemeToggler className="flex size-9 items-center justify-center rounded-xl border border-border bg-background text-foreground hover:bg-muted duration-150 cursor-pointer" />

                        <div className="relative">
                            <button
                                type="button"
                                aria-label="Notifications"
                                className="size-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                            >
                                <Bell className="size-4" />
                            </button>
                            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-emerald-500 ring-2 ring-card" />
                        </div>

                        {/* User Avatar */}
                        <div className="size-9 rounded-full bg-teal-900 border border-teal-700 text-white flex items-center justify-center font-bold text-xs">
                            CP
                        </div>
                    </div>
                </header>

                {/* CONTENT AREA */}
                <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
                    {activeNav === 'discover' ? (
                        <DiscoverView
                            onSelectCreator={(cr) => {
                                setSelectedCreator(cr)
                                setActiveNav('profile')
                                if (typeof window !== 'undefined') {
                                    window.scrollTo({ top: 0, behavior: 'smooth' })
                                }
                            }}
                            shortlistedIds={shortlistedIds}
                            onToggleShortlist={(id) => {
                                setShortlistedIds((prev) =>
                                    prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
                                )
                            }}
                        />
                    ) : (
                        <main className="space-y-8">
                            {/* Breadcrumb Back to Discover */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-border/60">
                                <button
                                    type="button"
                                    onClick={() => setActiveNav('discover')}
                                    className="inline-flex items-center gap-2 text-xs font-bold text-teal-700 dark:text-teal-400 hover:underline cursor-pointer"
                                >
                                    <span>&larr; Back to Discover Goan Creators</span>
                                </button>
                                <div className="text-xs text-muted-foreground">
                                    Viewing creator profile for <span className="font-bold text-foreground">{selectedCreator.name}</span> ({selectedCreator.location})
                                </div>
                            </div>
                    {/* 1. CREATOR HERO / COVER CARD (Image 1) */}
                    <div className="rounded-3xl border border-border/80 bg-card overflow-hidden shadow-xs">
                        {/* Cover Photo / Courtyard View */}
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

                            {/* Top Badges & Actions over cover */}
                            <div className="absolute top-4 inset-x-4 sm:inset-x-6 flex items-center justify-between z-10">
                                <div className="inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 px-3 py-1 text-xs font-bold text-white shadow-xs">
                                    <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                                    <span>VERIFIED COASTAL CREATOR</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        aria-label="Share creator profile"
                                        className="size-9 rounded-xl bg-white/90 dark:bg-black/80 backdrop-blur-md text-foreground flex items-center justify-center hover:bg-white shadow-xs cursor-pointer border border-border/50"
                                    >
                                        <Share2 className="size-4" />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setIsShortlisted(!isShortlisted)}
                                        className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors backdrop-blur-md ${
                                            isShortlisted
                                                ? 'bg-white text-teal-800 border border-teal-700/30'
                                                : 'bg-black/60 text-white border border-white/20'
                                        }`}
                                    >
                                        <Bookmark className={`size-3.5 ${isShortlisted ? 'fill-teal-800 text-teal-800' : ''}`} />
                                        <span>{isShortlisted ? 'Shortlisted' : 'Shortlist'}</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setIsCollabModalOpen(true)}
                                        className="bg-[#0c4e40] hover:bg-[#08382e] text-white text-xs font-bold rounded-xl px-4 py-2 flex items-center gap-1.5 cursor-pointer shadow-xs"
                                    >
                                        <Send className="size-3.5" />
                                        <span>Send Collab Request</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Profile Details & Bio */}
                        <div className="px-6 pb-6 pt-0 sm:px-8 sm:pb-8 relative">
                            {/* Floating Avatar & Metadata */}
                            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-6">
                                <div className="flex items-end gap-4">
                                    <div className="relative">
                                        <Image
                                            unoptimized
                                            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop"
                                            alt="Sneha Fernandes"
                                            width={200}
                                            height={200}
                                            className="size-24 sm:size-28 rounded-2xl object-cover border-4 border-card shadow-lg"
                                        />
                                        <div className="absolute -bottom-2 -right-2 size-7 rounded-full bg-teal-700 text-white flex items-center justify-center border-2 border-card shadow-xs">
                                            <Check className="size-4 stroke-[3]" />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                                                Sneha Fernandes
                                            </h1>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground font-medium">
                                            <span className="font-semibold text-foreground">@sneha_curates</span>
                                            <span>&bull;</span>
                                            <span className="flex items-center gap-1">
                                                <MapPin className="size-3 text-amber-500" />
                                                <span>Assagao, North Goa</span>
                                            </span>
                                            <span>&bull;</span>
                                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                                <span className="size-1.5 rounded-full bg-emerald-500" />
                                                <span>Active 2h ago</span>
                                            </span>
                                        </div>

                                        <div className="text-xs font-bold text-teal-800 dark:text-teal-300 flex items-center gap-1 pt-0.5">
                                            <ShieldCheck className="size-3.5 text-teal-600" />
                                            <span>18 Completed Brand Deals</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Niche Category Badges */}
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="rounded-lg border border-border bg-muted/40 px-3 py-1 text-xs font-semibold text-foreground flex items-center gap-1.5 shadow-2xs">
                                        <Utensils className="size-3 text-amber-500" />
                                        <span>Food &amp; Dining</span>
                                    </span>
                                    <span className="rounded-lg border border-border bg-muted/40 px-3 py-1 text-xs font-semibold text-foreground flex items-center gap-1.5 shadow-2xs">
                                        <Home className="size-3 text-teal-600" />
                                        <span>Boutique Stays &amp; Heritage</span>
                                    </span>
                                    <span className="rounded-lg border border-border bg-muted/40 px-3 py-1 text-xs font-semibold text-foreground flex items-center gap-1.5 shadow-2xs">
                                        <Sparkles className="size-3 text-purple-500" />
                                        <span>Lifestyle &amp; Culture</span>
                                    </span>
                                </div>
                            </div>

                            {/* Bio Text */}
                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-4xl border-t border-border/60 pt-4">
                                Visual storyteller &amp; food writer documenting Goa&apos;s emerging culinary culture, artisanal cafes, and boutique heritage stays. Featured in <strong className="text-foreground">Condé Nast Traveller</strong> &amp; <strong className="text-foreground">Nat Geo India</strong>. Specialized in cinematic vertical reels highlighting sustainable Goan hospitality.
                            </p>
                        </div>
                    </div>

                    {/* 2. AUDIENCE VITAL METRICS (Image 1 Bottom & Image 2 Top) */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="size-4 text-teal-700 dark:text-teal-400" />
                                <h2 className="text-base font-bold text-foreground">
                                    Audience Vital Metrics
                                </h2>
                            </div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2.5 py-1 rounded-md">
                                REALTIME META API SYNC &bull; OCT 2026
                            </span>
                        </div>

                        {/* 6 Metric Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                            {[
                                {
                                    label: 'Followers',
                                    value: '120.4K',
                                    sub: '↑ +3.2% this mo',
                                    icon: Users,
                                    color: 'bg-emerald-500',
                                    textColor: 'text-emerald-600 dark:text-emerald-400',
                                },
                                {
                                    label: 'Engagement Rate',
                                    value: '7.8%',
                                    sub: '⚡ 2.4x Ind. Avg',
                                    icon: Zap,
                                    color: 'bg-blue-500',
                                    textColor: 'text-blue-600 dark:text-blue-400',
                                },
                                {
                                    label: 'Avg. Likes',
                                    value: '8,920',
                                    sub: 'per feed post',
                                    icon: Heart,
                                    color: 'bg-amber-500',
                                    textColor: 'text-amber-600 dark:text-amber-400',
                                },
                                {
                                    label: 'Avg. Reel Views',
                                    value: '64.5K',
                                    sub: '📈 High virality',
                                    icon: Play,
                                    color: 'bg-teal-500',
                                    textColor: 'text-teal-600 dark:text-teal-400',
                                },
                                {
                                    label: 'Avg. Comments',
                                    value: '340',
                                    sub: 'High dialogue intent',
                                    icon: MessageSquare,
                                    color: 'bg-blue-600',
                                    textColor: 'text-blue-600 dark:text-blue-400',
                                },
                                {
                                    label: 'Goa & Travelers',
                                    value: '92%',
                                    sub: '68% Goa / 24% Fly-in',
                                    icon: Plane,
                                    color: 'bg-orange-500',
                                    textColor: 'text-orange-600 dark:text-orange-400',
                                },
                            ].map((metric, i) => {
                                const Icon = metric.icon
                                return (
                                    <div
                                        key={i}
                                        className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs flex flex-col justify-between space-y-3 relative overflow-hidden"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold text-muted-foreground">
                                                {metric.label}
                                            </span>
                                            <Icon className={`size-4 ${metric.textColor}`} />
                                        </div>

                                        <div className="space-y-0.5">
                                            <div className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
                                                {metric.value}
                                            </div>
                                            <div className="text-[11px] font-medium text-muted-foreground truncate">
                                                {metric.sub}
                                            </div>
                                        </div>

                                        {/* Bottom colored accent strip */}
                                        <div className={`h-1 w-full ${metric.color} rounded-full`} />
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* 3. MIDDLE SECTION: GROWTH TRAJECTORY + AUDIENCE PERSONA (Image 2) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* LEFT COLUMN (7 cols): Growth Trajectory & Social Channels */}
                        <div className="lg:col-span-7 space-y-6">
                            {/* Audience Growth & Engagement Chart Card */}
                            <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs space-y-5">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div>
                                        <h3 className="text-base font-bold text-foreground">
                                            Audience Growth &amp; Engagement
                                        </h3>
                                        <p className="text-xs text-muted-foreground">
                                            6-Month trajectory with hospitality campaign peaks
                                        </p>
                                    </div>

                                    {/* Legend */}
                                    <div className="flex items-center gap-3 text-xs font-medium">
                                        <div className="flex items-center gap-1.5">
                                            <span className="size-2 rounded-full bg-teal-600" />
                                            <span>Followers (k)</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="size-2 rounded-full bg-blue-500" />
                                            <span>Engagement Rate (%)</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Interactive SVG Area Chart */}
                                <div className="relative h-56 w-full pt-4">
                                    <svg viewBox="0 0 500 180" className="w-full h-full overflow-visible">
                                        <defs>
                                            <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#0d9488" stopOpacity="0.35" />
                                                <stop offset="100%" stopColor="#0d9488" stopOpacity="0.02" />
                                            </linearGradient>
                                        </defs>

                                        {/* Grid lines */}
                                        <line x1="40" y1="20" x2="480" y2="20" stroke="currentColor" strokeOpacity="0.1" />
                                        <line x1="40" y1="60" x2="480" y2="60" stroke="currentColor" strokeOpacity="0.1" />
                                        <line x1="40" y1="100" x2="480" y2="100" stroke="currentColor" strokeOpacity="0.1" />
                                        <line x1="40" y1="140" x2="480" y2="140" stroke="currentColor" strokeOpacity="0.1" />

                                        {/* Y-axis labels */}
                                        <text x="5" y="24" fontSize="9" fill="currentColor" opacity="0.5">130K</text>
                                        <text x="5" y="64" fontSize="9" fill="currentColor" opacity="0.5">100K</text>
                                        <text x="5" y="104" fontSize="9" fill="currentColor" opacity="0.5">70K</text>
                                        <text x="5" y="144" fontSize="9" fill="currentColor" opacity="0.5">40K</text>

                                        {/* Monsoon Fest Highlight Region (Aug Peak) */}
                                        <rect x="270" y="20" width="60" height="130" fill="#0ea5e9" fillOpacity="0.08" rx="6" />
                                        <text x="300" y="15" fontSize="8.5" fill="#0284c7" fontWeight="bold" textAnchor="middle">
                                            Monsoon Fest
                                        </text>

                                        {/* Followers Area & Line */}
                                        <path
                                            d="M 60 140 C 130 130, 200 115, 270 70 C 310 50, 390 35, 460 25 L 460 150 L 60 150 Z"
                                            fill="url(#growthGrad)"
                                        />
                                        <path
                                            d="M 60 140 C 130 130, 200 115, 270 70 C 310 50, 390 35, 460 25"
                                            fill="none"
                                            stroke="#0d9488"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                        />

                                        {/* Engagement Rate Line */}
                                        <path
                                            d="M 60 115 C 130 110, 200 102, 270 65 C 310 55, 390 50, 460 48"
                                            fill="none"
                                            stroke="#0ea5e9"
                                            strokeWidth="2.5"
                                            strokeDasharray="4 3"
                                            strokeLinecap="round"
                                        />

                                        {/* Data Points */}
                                        {[
                                            { x: 60, y: 140, label: 'May' },
                                            { x: 140, y: 125, label: 'Jun' },
                                            { x: 220, y: 105, label: 'Jul' },
                                            { x: 300, y: 55, label: 'Aug (Peak)' },
                                            { x: 380, y: 35, label: 'Sep' },
                                            { x: 460, y: 25, label: 'Oct (Now)' },
                                        ].map((pt, idx) => (
                                            <g key={idx}>
                                                <circle cx={pt.x} cy={pt.y} r="4.5" fill="#0d9488" stroke="#ffffff" strokeWidth="2" />
                                                <text x={pt.x} y="168" fontSize="9" fill="currentColor" opacity="0.7" textAnchor="middle">
                                                    {pt.label}
                                                </text>
                                            </g>
                                        ))}
                                    </svg>
                                </div>

                                {/* Bottom Audit Banner */}
                                <div className="rounded-2xl bg-muted/40 p-3.5 border border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                        <div>
                                            <div className="text-xs font-bold text-foreground">Consistent Organic Growth</div>
                                            <div className="text-[11px] text-muted-foreground">Zero synthetic spikes detected across 180 days audit.</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-bold text-teal-700 dark:text-teal-400">+24.8K</span>
                                        <div className="text-[10px] text-muted-foreground">New regional followers in Q3</div>
                                    </div>
                                </div>
                            </div>

                            {/* Connected Social Channels */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-bold text-foreground">Connected Social Channels</h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {/* Instagram */}
                                    <div className="rounded-2xl border border-border/80 bg-card p-3.5 flex items-center justify-between shadow-xs">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shrink-0">
                                                <Camera className="size-5" />
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-foreground flex items-center gap-1">
                                                    <span>@sneha_curates</span>
                                                    <CheckCircle2 className="size-3 text-emerald-500" />
                                                </div>
                                                <div className="text-[11px] text-muted-foreground">Instagram &bull; 120,400 Followers</div>
                                            </div>
                                        </div>
                                        <a
                                            href="https://instagram.com"
                                            target="_blank"
                                            rel="noreferrer"
                                            className="size-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted"
                                        >
                                            <ExternalLink className="size-3.5" />
                                        </a>
                                    </div>

                                    {/* YouTube */}
                                    <div className="rounded-2xl border border-border/80 bg-card p-3.5 flex items-center justify-between shadow-xs">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0">
                                                <Play className="size-4.5 fill-white" />
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-foreground">@snehafernandesgoa</div>
                                                <div className="text-[11px] text-muted-foreground">YouTube &bull; 34,200 Subscribers</div>
                                            </div>
                                        </div>
                                        <a
                                            href="https://youtube.com"
                                            target="_blank"
                                            rel="noreferrer"
                                            className="size-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted"
                                        >
                                            <ExternalLink className="size-3.5" />
                                        </a>
                                    </div>
                                </div>

                                {/* Editor's Pick Quote */}
                                <div className="rounded-2xl border border-border/80 bg-muted/20 p-4 space-y-1.5">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                                        <FileText className="size-3.5 text-teal-600" />
                                        <span>Editor&apos;s Pick 2026</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground italic leading-relaxed">
                                        &ldquo;Sneha&apos;s slow-living chronicles give travelers authentic Goa without the tourist traps.&rdquo; &mdash; Condé Nast Traveller India
                                    </p>
                                </div>

                                {/* Coverage Radius */}
                                <div className="rounded-2xl border border-border/80 bg-card p-3.5 flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <Compass className="size-4 text-teal-700 dark:text-teal-400" />
                                        <div>
                                            <div className="text-xs font-semibold text-foreground">Coverage Radius</div>
                                            <div className="text-[11px] text-muted-foreground">Assagao, Siolim, Anjuna, Panjim, Salcete</div>
                                        </div>
                                    </div>
                                    <span className="rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 px-2.5 py-1 text-[10px] font-bold border border-blue-500/20">
                                        On-site visits available
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN (5 cols): Audience Persona & Pricing Deliverables */}
                        <div className="lg:col-span-5 space-y-6">
                            {/* Audience Persona Card */}
                            <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs space-y-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-base font-bold text-foreground">Audience Persona</h3>
                                        <p className="text-xs text-muted-foreground">
                                            Demographic split tailored for hospitality marketing
                                        </p>
                                    </div>
                                    <Globe className="size-4 text-teal-700 dark:text-teal-400" />
                                </div>

                                {/* Age Brackets */}
                                <div className="space-y-3">
                                    {[
                                        { label: 'Age 24–35 yrs (Prime Spenders)', pct: 58, color: 'bg-teal-600' },
                                        { label: 'Age 36–45 yrs (Heritage Travellers)', pct: 26, color: 'bg-blue-500' },
                                        { label: 'Age 18–23 yrs', pct: 16, color: 'bg-zinc-400 dark:bg-zinc-600' },
                                    ].map((bracket, idx) => (
                                        <div key={idx} className="space-y-1">
                                            <div className="flex items-center justify-between text-xs font-semibold">
                                                <span className="text-foreground">{bracket.label}</span>
                                                <span className="text-muted-foreground">{bracket.pct}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${bracket.color} rounded-full`}
                                                    style={{ width: `${bracket.pct}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Gender Split */}
                                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/60">
                                    <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-2.5 text-center">
                                        <div className="text-base font-bold text-blue-700 dark:text-blue-300">62%</div>
                                        <div className="text-[11px] font-medium text-muted-foreground">Women</div>
                                    </div>
                                    <div className="rounded-xl bg-muted/60 border border-border p-2.5 text-center">
                                        <div className="text-base font-bold text-foreground">38%</div>
                                        <div className="text-[11px] font-medium text-muted-foreground">Men</div>
                                    </div>
                                </div>

                                {/* Top Audience Locations */}
                                <div className="pt-2 border-t border-border/60 space-y-2">
                                    <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                                        Top Audience Locations
                                    </span>
                                    <div className="space-y-1.5 text-xs text-foreground/90">
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-1.5">
                                                <span className="size-2 rounded-full bg-teal-600" />
                                                <span>Goa State (North &amp; South)</span>
                                            </span>
                                            <span className="font-bold">42%</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-1.5">
                                                <span className="size-2 rounded-full bg-blue-500" />
                                                <span>Mumbai &amp; Pune</span>
                                            </span>
                                            <span className="font-bold">26%</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-1.5">
                                                <span className="size-2 rounded-full bg-amber-500" />
                                                <span>Bengaluru (Tech Nomads)</span>
                                            </span>
                                            <span className="font-bold">18%</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-1.5">
                                                <span className="size-2 rounded-full bg-zinc-400" />
                                                <span>Delhi NCR</span>
                                            </span>
                                            <span className="font-bold">14%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Collab Pricing & Deliverables (Rate Card) */}
                            <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs space-y-5">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                                            RATE CARD &bull; COMMERCIAL TERMS
                                        </span>
                                        <h3 className="text-base font-bold text-foreground mt-0.5">
                                            Collab Pricing &amp; Deliverables
                                        </h3>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-extrabold text-teal-800 dark:text-teal-300">
                                            ₹14,000
                                        </div>
                                        <div className="text-[10px] text-muted-foreground">Base Rate / Dedicated Reel</div>
                                    </div>
                                </div>

                                {/* Barter Friendly Notice */}
                                <div className="rounded-2xl bg-amber-500/10 border border-amber-500/25 p-3.5 space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-200">
                                            <Star className="size-3.5 fill-amber-500 text-amber-500" />
                                            <span>Barter Collaboration Friendly</span>
                                        </div>
                                        <span className="bg-amber-500/20 text-amber-900 dark:text-amber-200 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded">
                                            SELECTIVELY OPEN
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-amber-900/80 dark:text-amber-200/80 leading-relaxed">
                                        Sneha accepts curated barter stays (2+ nights in heritage/boutique villas) and seasonal tasting menu experiences for verified culinary brands. Minimum follower baseline or premium property tier required.
                                    </p>
                                </div>

                                {/* Deliverable Options 2x2 Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {[
                                        {
                                            id: 'reel',
                                            title: 'Instagram Reel (30–60s)',
                                            desc: 'Cinematic 4K grade, trending coastal audio, storytelling voiceover, business co-authorship tag.',
                                            tag: 'Included in Base Tier',
                                            icon: Camera,
                                        },
                                        {
                                            id: 'carousel',
                                            title: 'Photo Carousel (6–10 slides)',
                                            desc: 'Editorial styling of signature dishes, architecture, ambiance. High-resolution raw exports provided.',
                                            tag: '+₹6,000 add-on',
                                            icon: Sparkles,
                                        },
                                        {
                                            id: 'stories',
                                            title: 'Story Sequence (3–5x frames)',
                                            desc: 'Realtime unboxing / dining walkthrough with booking CTA link sticker and location geotag.',
                                            tag: '+₹4,500 add-on',
                                            icon: Phone,
                                        },
                                        {
                                            id: 'license',
                                            title: 'Full Commercial License',
                                            desc: 'Perpetual digital rights for business website, Instagram Meta ads, and digital brochures.',
                                            tag: 'Included for 6 months',
                                            icon: ShieldCheck,
                                        },
                                    ].map((deliverable) => {
                                        const Icon = deliverable.icon
                                        const isSelected = selectedAddons.includes(deliverable.id)
                                        return (
                                            <div
                                                key={deliverable.id}
                                                onClick={() => toggleAddon(deliverable.id)}
                                                className={`rounded-xl border p-3 flex flex-col justify-between space-y-2 cursor-pointer transition-all ${
                                                    isSelected
                                                        ? 'border-teal-700/60 bg-teal-500/5 ring-1 ring-teal-600/30'
                                                        : 'border-border/80 bg-background hover:border-teal-600/30'
                                                }`}
                                            >
                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                                            <Icon className="size-3 text-teal-700 dark:text-teal-400" />
                                                            <span>{deliverable.title}</span>
                                                        </div>
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => {}}
                                                            className="size-3.5 rounded text-teal-700"
                                                        />
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                                                        {deliverable.desc}
                                                    </p>
                                                </div>
                                                <div className="text-[10px] font-bold text-teal-800 dark:text-teal-300">
                                                    {deliverable.tag}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Footer & Action */}
                                <div className="flex items-center justify-between pt-2 border-t border-border/60">
                                    <div className="text-[11px] text-muted-foreground">
                                        Standard turnaround: <strong className="text-foreground">5–7 business days</strong>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setIsCollabModalOpen(true)}
                                        className="bg-[#0c4e40] hover:bg-[#08382e] text-white text-xs font-semibold rounded-xl px-4 py-2 flex items-center gap-1.5 cursor-pointer shadow-xs"
                                    >
                                        <MessageSquare className="size-3.5" />
                                        <span>Inquire Availability</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 4. BUSINESS REVIEWS (Image 3) */}
                    <div className="space-y-4 pt-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                                <div className="flex items-center gap-2">
                                    <Star className="size-4 fill-amber-400 text-amber-400" />
                                    <h3 className="text-base font-bold text-foreground">
                                        Business Reviews
                                    </h3>
                                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                                        18 verified collabs
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Ratings provided by GoaConnect registered hospitality businesses post-campaign.
                                </p>
                            </div>

                            <div className="flex items-center gap-3 self-start sm:self-auto text-xs">
                                <div className="flex items-center gap-1 font-bold text-foreground">
                                    <span>5.0</span>
                                    <div className="flex text-amber-400">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="size-3.5 fill-amber-400" />
                                        ))}
                                    </div>
                                </div>
                                <span className="rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 text-[11px] font-bold border border-emerald-500/20">
                                    100% On-Time Delivery
                                </span>
                            </div>
                        </div>

                        {/* 2 Review Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Review 1: Café Bodega */}
                            <div className="rounded-3xl border border-border/80 bg-card p-5 space-y-4 shadow-xs">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-xl bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 flex items-center justify-center shrink-0">
                                            <Store className="size-5" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-foreground">Café Bodega</div>
                                            <div className="text-[11px] text-muted-foreground">
                                                Altinho, Panjim &bull; Monsoon Menu Campaign
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex text-amber-400">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="size-3.5 fill-amber-400" />
                                        ))}
                                    </div>
                                </div>

                                <p className="text-xs text-muted-foreground leading-relaxed italic">
                                    &ldquo;Sneha created an incredible reel on our monsoon dessert menu. Resulted in our busiest Sunday brunch of the season. She understood our heritage courtyard lighting perfectly and delivered without disrupting our seated guests.&rdquo;
                                </p>

                                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/60">
                                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                                        <CheckCircle2 className="size-3" />
                                        <span>Verified Campaign (August 2026)</span>
                                    </div>
                                    <span className="font-bold text-foreground">Result: 42K Organic Reach</span>
                                </div>
                            </div>

                            {/* Review 2: The Project Assagao */}
                            <div className="rounded-3xl border border-border/80 bg-card p-5 space-y-4 shadow-xs">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-xl bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 flex items-center justify-center shrink-0">
                                            <Home className="size-5" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-foreground">The Project Assagao</div>
                                            <div className="text-[11px] text-muted-foreground">
                                                Assagao, North Goa &bull; Boutique Villa Stay Collab
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex text-amber-400">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="size-3.5 fill-amber-400" />
                                        ))}
                                    </div>
                                </div>

                                <p className="text-xs text-muted-foreground leading-relaxed italic">
                                    &ldquo;Super professional, timely delivery of raw footage, and highly engaged Goan audience. We gained over 280 direct room inquiries over the weekend following her carousel post. Would definitely book again for our winter festival.&rdquo;
                                </p>

                                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/60">
                                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                                        <CheckCircle2 className="size-3" />
                                        <span>Verified Campaign (September 2026)</span>
                                    </div>
                                    <span className="font-bold text-foreground">Result: 18 Booking Conversions</span>
                                </div>
                            </div>
                        </div>
                    </div>
                        </main>
                    )}
                </div>
            </div>

            {/* SEND COLLAB REQUEST / BOOKING MODAL */}
            {isCollabModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
                    <div className="relative w-full max-w-xl rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <button
                            type="button"
                            onClick={() => setIsCollabModalOpen(false)}
                            className="absolute top-5 right-5 size-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                            <X className="size-4" />
                        </button>

                        <div className="flex items-center gap-3">
                            <div className="size-12 rounded-2xl bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 flex items-center justify-center shrink-0">
                                <Send className="size-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-foreground">Send Collaboration Request</h3>
                                <p className="text-xs text-muted-foreground">To Sneha Fernandes &bull; Assagao, North Goa</p>
                            </div>
                        </div>

                        {requestSuccess ? (
                            <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-6 text-center space-y-2">
                                <CheckCircle2 className="size-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
                                <div className="text-base font-bold text-foreground">Collab Request Sent!</div>
                                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                                    Your brief has been delivered to Sneha Fernandes on behalf of Café Palmeira. Funds are held securely in escrow pending acceptance.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSendRequest} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-foreground">Brand / Establishment</label>
                                    <input
                                        type="text"
                                        readOnly
                                        value="Café Palmeira (Calangute, North Goa)"
                                        className="w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2 text-xs font-medium text-muted-foreground cursor-not-allowed"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-foreground">Campaign Brief &amp; Objective</label>
                                    <textarea
                                        required
                                        rows={2}
                                        value={campaignBrief}
                                        onChange={(e) => setCampaignBrief(e.target.value)}
                                        className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-teal-600"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-foreground">Preferred Shoot Date</label>
                                        <input
                                            type="date"
                                            required
                                            defaultValue="2026-11-24"
                                            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-teal-600"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-foreground">Collaboration Type</label>
                                        <select className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-teal-600">
                                            <option value="paid">Paid Collaboration</option>
                                            <option value="hybrid">Hybrid (Paid + Tasting Experience)</option>
                                            <option value="barter">Curated Barter Stay</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Order Summary */}
                                <div className="rounded-2xl bg-muted/40 p-4 border border-border/80 space-y-2">
                                    <div className="flex items-center justify-between text-xs font-semibold">
                                        <span className="text-muted-foreground">Base Dedicated Reel:</span>
                                        <span className="text-foreground">₹{baseRate.toLocaleString()}</span>
                                    </div>
                                    {selectedAddons.filter((a) => a !== 'reel').map((addon) => (
                                        <div key={addon} className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                                            <span>+ {addon === 'carousel' ? 'Photo Carousel' : 'Story Sequence'}:</span>
                                            <span>₹{addonPrices[addon].toLocaleString()}</span>
                                        </div>
                                    ))}
                                    <div className="flex items-center justify-between pt-2 border-t border-border/60 text-sm font-bold">
                                        <span className="text-foreground">Total Escrow Budget:</span>
                                        <span className="text-teal-800 dark:text-teal-300">₹{calculatedTotal.toLocaleString()}</span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-[#0c4e40] hover:bg-[#08382e] text-white font-semibold rounded-xl h-11 text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
                                >
                                    <ShieldCheck className="size-4" />
                                    <span>Lock Deal &amp; Submit Request via Escrow</span>
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
