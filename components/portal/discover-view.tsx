'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
    Bookmark,
    Check,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Coffee,
    Compass,
    Flame,
    Heart,
    LayoutGrid,
    List,
    MapPin,
    Play,
    ShieldCheck,
    SlidersHorizontal,
    Sparkles,
    Sun,
    Utensils,
    Waves,
    Wine,
} from 'lucide-react'

export interface CreatorItem {
    id: string
    name: string
    displayName: string
    handle: string
    avatar: string
    coverImage: string
    tag: string
    tagType: 'food' | 'heritage' | 'cocktail' | 'cafe' | 'bbq' | 'stay'
    views: string
    highlightBadge: string
    location: string
    nicheBadge: string
    followers: string
    followersNum: number
    engagementRate: string
    engagementNum: number
    reviewsCount: number
    startingRate: string
    startingRateNum: number
    collabBadge: 'BARTER FRIENDLY' | 'PAID ONLY'
    collabType: 'hybrid' | 'paid' | 'barter'
    category: string
    district: 'North Goa' | 'South Goa'
}

export const DISCOVER_CREATORS: CreatorItem[] = [
    {
        id: 'cr-sneha',
        name: 'Sneha Fernandes',
        displayName: 'Sneha Fern...',
        handle: '@sneha.tastesgoa',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
        coverImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=900&auto=format&fit=crop',
        tag: 'FOOD & DINING',
        tagType: 'food',
        views: '45K avg views',
        highlightBadge: 'REEL SPECIALIST',
        location: 'Assagao',
        nicheBadge: 'Boutique Stays',
        followers: '120K',
        followersNum: 120000,
        engagementRate: '7.8%',
        engagementNum: 7.8,
        reviewsCount: 38,
        startingRate: '₹8,000 / reel',
        startingRateNum: 8000,
        collabBadge: 'BARTER FRIENDLY',
        collabType: 'hybrid',
        category: 'Food & Dining',
        district: 'North Goa',
    },
    {
        id: 'cr-rahul',
        name: 'Rahul Naik',
        displayName: 'Rahul Naik',
        handle: '@rahul_eats_goa',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
        coverImage: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=900&auto=format&fit=crop',
        tag: 'HERITAGE DINING',
        tagType: 'heritage',
        views: '62K avg views',
        highlightBadge: 'TOP RATED',
        location: 'Panjim & Miramar',
        nicheBadge: 'Local Seafood',
        followers: '85K',
        followersNum: 85000,
        engagementRate: '9.2%',
        engagementNum: 9.2,
        reviewsCount: 52,
        startingRate: '₹6,500 / reel',
        startingRateNum: 6500,
        collabBadge: 'PAID ONLY',
        collabType: 'paid',
        category: 'Food & Dining',
        district: 'North Goa',
    },
    {
        id: 'cr-rohan',
        name: 'Rohan D\'Souza',
        displayName: 'Rohan D\'So...',
        handle: '@rohan.cocktailchronicles',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop',
        coverImage: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=900&auto=format&fit=crop',
        tag: 'COCKTAILS & VIBE',
        tagType: 'cocktail',
        views: '88K avg views',
        highlightBadge: 'VIRAL MAKER',
        location: 'Anjuna & Vagator',
        nicheBadge: 'Nightlife',
        followers: '195K',
        followersNum: 195000,
        engagementRate: '6.5%',
        engagementNum: 6.5,
        reviewsCount: 64,
        startingRate: '₹14,000 / reel',
        startingRateNum: 14000,
        collabBadge: 'BARTER FRIENDLY',
        collabType: 'hybrid',
        category: 'Nightlife & Music',
        district: 'North Goa',
    },
    {
        id: 'cr-alisha',
        name: 'Alisha D\'Cruz',
        displayName: 'Alisha D\'Cr...',
        handle: '@alishacafecrawls',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop',
        coverImage: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=900&auto=format&fit=crop',
        tag: 'CAFES & BAKERY',
        tagType: 'cafe',
        views: '54K avg views',
        highlightBadge: 'RISING STAR',
        location: 'Fontainhas',
        nicheBadge: 'Coffee Culture',
        followers: '68K',
        followersNum: 68000,
        engagementRate: '8.4%',
        engagementNum: 8.4,
        reviewsCount: 29,
        startingRate: '₹5,500 / reel',
        startingRateNum: 5500,
        collabBadge: 'BARTER FRIENDLY',
        collabType: 'hybrid',
        category: 'Food & Dining',
        district: 'North Goa',
    },
    {
        id: 'cr-keith',
        name: 'Keith Sequeira',
        displayName: 'Keith Seque...',
        handle: '@chefkeith_goa',
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=400&auto=format&fit=crop',
        coverImage: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=900&auto=format&fit=crop',
        tag: 'LIVE FIRE & BBQ',
        tagType: 'bbq',
        views: '72K avg views',
        highlightBadge: 'CHEF INFLUENCER',
        location: 'Morjim',
        nicheBadge: 'Gourmet Dining',
        followers: '142K',
        followersNum: 142000,
        engagementRate: '7.1%',
        engagementNum: 7.1,
        reviewsCount: 41,
        startingRate: '₹11,000 / reel',
        startingRateNum: 11000,
        collabBadge: 'BARTER FRIENDLY',
        collabType: 'hybrid',
        category: 'Food & Dining',
        district: 'North Goa',
    },
    {
        id: 'cr-tanya',
        name: 'Tanya Rebelo',
        displayName: 'Tanya Rebe...',
        handle: '@tanya_southgoanotes',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop',
        coverImage: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=900&auto=format&fit=crop',
        tag: 'STAYS & DINING',
        tagType: 'stay',
        views: '39K avg views',
        highlightBadge: 'SOUTH GOA PRO',
        location: 'Palolem & Agonda',
        nicheBadge: 'Slow Travel',
        followers: '52K',
        followersNum: 52000,
        engagementRate: '9.8%',
        engagementNum: 9.8,
        reviewsCount: 22,
        startingRate: '₹6,000 / reel',
        startingRateNum: 6000,
        collabBadge: 'BARTER FRIENDLY',
        collabType: 'hybrid',
        category: 'Travel & Stays',
        district: 'South Goa',
    },
]

export function DiscoverView() {
    // Filter State
    const [verifiedOnly, setVerifiedOnly] = useState(true)
    const [availableThisMonth, setAvailableThisMonth] = useState(true)
    const [selectedCategories, setSelectedCategories] = useState<string[]>(['Food & Dining'])
    const [northGoaOpen, setNorthGoaOpen] = useState(true)
    const [southGoaOpen, setSouthGoaOpen] = useState(false)
    const [selectedLocations, setSelectedLocations] = useState<string[]>([
        'Assagao',
        'Panjim & Miramar',
    ])
    const [minEngagement, setMinEngagement] = useState<number>(5)
    const [collabModel, setCollabModel] = useState<string>('Hybrid')
    const [sortBy, setSortBy] = useState<string>('Highest Engagement')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [shortlistedIds, setShortlistedIds] = useState<string[]>([
        'cr-sneha',
        'cr-rohan',
        'cr-alisha',
        'cr-keith',
    ])
    const [likedIds, setLikedIds] = useState<string[]>(['cr-sneha'])
    const [currentPage, setCurrentPage] = useState<number>(1)

    const categories = [
        'Food & Dining',
        'Travel & Stays',
        'Nightlife & Music',
        'Fashion & Lifestyle',
        'Fitness & Surf',
        'Culture & Heritage',
    ]

    const northLocations = [
        'Assagao',
        'Panjim & Miramar',
        'Anjuna & Vagator',
        'Calangute & Candolim',
    ]

    const southLocations = [
        'Palolem & Agonda',
        'Margao & Salcete',
        'Benaulim & Colva',
    ]

    const toggleCategory = (cat: string) => {
        setSelectedCategories((prev) =>
            prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
        )
    }

    const toggleLocation = (loc: string) => {
        setSelectedLocations((prev) =>
            prev.includes(loc) ? prev.filter((l) => l !== loc) : [...prev, loc]
        )
    }

    const toggleShortlist = (id: string) => {
        setShortlistedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        )
    }

    const toggleLiked = (id: string) => {
        setLikedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        )
    }

    const handleResetAll = () => {
        setVerifiedOnly(true)
        setAvailableThisMonth(true)
        setSelectedCategories(['Food & Dining'])
        setSelectedLocations(['Assagao', 'Panjim & Miramar'])
        setMinEngagement(5)
        setCollabModel('Hybrid')
        setSortBy('Highest Engagement')
    }

    const filteredCreators = DISCOVER_CREATORS.filter((c) => {
        if (minEngagement && c.engagementNum < minEngagement) {
            return false
        }
        return true
    }).sort((a, b) => {
        if (sortBy === 'Highest Engagement') return b.engagementNum - a.engagementNum
        if (sortBy === 'Most Followers') return b.followersNum - a.followersNum
        if (sortBy === 'Lowest Rate') return a.startingRateNum - b.startingRateNum
        if (sortBy === 'Top Rated') return b.reviewsCount - a.reviewsCount
        return 0
    })

    const getTagIcon = (type: CreatorItem['tagType']) => {
        switch (type) {
            case 'food':
            case 'heritage':
                return <Utensils className="size-3 text-emerald-700" />
            case 'cocktail':
                return <Wine className="size-3 text-amber-700" />
            case 'cafe':
                return <Coffee className="size-3 text-stone-700" />
            case 'bbq':
                return <Flame className="size-3 text-orange-700" />
            case 'stay':
                return <Compass className="size-3 text-sky-700" />
            default:
                return <Utensils className="size-3 text-emerald-700" />
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT FILTER SIDEBAR - ALL SHARP (rounded-none) */}
            <aside className="lg:col-span-4 xl:col-span-3 border border-border/80 bg-card p-5 space-y-6 rounded-none shadow-none sticky top-24">
                {/* Header: Filters + Reset All */}
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                    <div className="flex items-center gap-2">
                        <SlidersHorizontal className="size-4 text-foreground" />
                        <h2 className="text-sm font-bold text-foreground">Filters</h2>
                    </div>
                    <button
                        type="button"
                        onClick={handleResetAll}
                        className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline cursor-pointer"
                    >
                        Reset All
                    </button>
                </div>

                {/* 2 Switch Toggles - Sharp */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                            <ShieldCheck className="size-4 text-sky-600 dark:text-sky-400" />
                            <span>Verified Only</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setVerifiedOnly(!verifiedOnly)}
                            aria-label="Toggle Verified Only"
                            className={`w-11 h-6 flex items-center p-1 cursor-pointer transition-colors duration-150 rounded-none ${
                                verifiedOnly ? 'bg-[#0c4e40]' : 'bg-muted border border-border'
                            }`}
                        >
                            <div
                                className={`bg-white size-4 rounded-none shadow-none transform transition-transform duration-150 ${
                                    verifiedOnly ? 'translate-x-5' : 'translate-x-0'
                                }`}
                            />
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                            <Sparkles className="size-4 text-emerald-600 dark:text-emerald-400" />
                            <span>Available this month</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setAvailableThisMonth(!availableThisMonth)}
                            aria-label="Toggle Available this month"
                            className={`w-11 h-6 flex items-center p-1 cursor-pointer transition-colors duration-150 rounded-none ${
                                availableThisMonth ? 'bg-[#0c4e40]' : 'bg-muted border border-border'
                            }`}
                        >
                            <div
                                className={`bg-white size-4 rounded-none shadow-none transform transition-transform duration-150 ${
                                    availableThisMonth ? 'translate-x-5' : 'translate-x-0'
                                }`}
                            />
                        </button>
                    </div>
                </div>

                {/* Category Pills - Sharp Rectangles */}
                <div className="space-y-2.5 pt-3 border-t border-border/60">
                    <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-foreground">Category</span>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                            {selectedCategories.length} SELECTED
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => {
                            const isSelected = selectedCategories.includes(cat)
                            return (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => toggleCategory(cat)}
                                    className={`px-3 py-1.5 text-xs font-semibold transition-all duration-150 cursor-pointer flex items-center gap-1.5 rounded-none ${
                                        isSelected
                                            ? 'bg-[#0c4e40] text-white shadow-none'
                                            : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/60'
                                    }`}
                                >
                                    <span>{cat}</span>
                                    {isSelected && <Check className="size-3 stroke-[3]" />}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Location / Taluka Accordion - Sharp */}
                <div className="space-y-3 pt-3 border-t border-border/60">
                    <span className="text-xs font-bold text-foreground block">Location / Taluka</span>

                    <div className="space-y-2">
                        <button
                            type="button"
                            onClick={() => setNorthGoaOpen(!northGoaOpen)}
                            className="w-full flex items-center justify-between text-xs font-bold text-foreground hover:text-teal-700 cursor-pointer"
                        >
                            <div className="flex items-center gap-1.5">
                                <Waves className="size-3.5 text-teal-600 dark:text-teal-400" />
                                <span>North Goa</span>
                            </div>
                            {northGoaOpen ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                        </button>

                        {northGoaOpen && (
                            <div className="pl-5 space-y-2 pt-1 text-xs text-muted-foreground">
                                {northLocations.map((loc) => {
                                    const checked = selectedLocations.includes(loc)
                                    return (
                                        <label
                                            key={loc}
                                            className="flex items-center gap-2.5 cursor-pointer hover:text-foreground select-none"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => toggleLocation(loc)}
                                                className="size-4 border-border text-[#0c4e40] focus:ring-teal-700 cursor-pointer rounded-none"
                                            />
                                            <span className={checked ? 'font-semibold text-foreground' : ''}>
                                                {loc}
                                            </span>
                                        </label>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2 pt-1">
                        <button
                            type="button"
                            onClick={() => setSouthGoaOpen(!southGoaOpen)}
                            className="w-full flex items-center justify-between text-xs font-bold text-foreground hover:text-teal-700 cursor-pointer"
                        >
                            <div className="flex items-center gap-1.5">
                                <Sun className="size-3.5 text-amber-500" />
                                <span>South Goa</span>
                            </div>
                            {southGoaOpen ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                        </button>

                        {southGoaOpen && (
                            <div className="pl-5 space-y-2 pt-1 text-xs text-muted-foreground">
                                {southLocations.map((loc) => {
                                    const checked = selectedLocations.includes(loc)
                                    return (
                                        <label
                                            key={loc}
                                            className="flex items-center gap-2.5 cursor-pointer hover:text-foreground select-none"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => toggleLocation(loc)}
                                                className="size-4 border-border text-[#0c4e40] focus:ring-teal-700 cursor-pointer rounded-none"
                                            />
                                            <span className={checked ? 'font-semibold text-foreground' : ''}>
                                                {loc}
                                            </span>
                                        </label>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Followers Range - Sharp */}
                <div className="space-y-2.5 pt-3 border-t border-border/60">
                    <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-foreground">Followers</span>
                        <span className="font-bold text-teal-700 dark:text-teal-400">10K — 250K+</span>
                    </div>

                    <div className="relative pt-2 pb-1">
                        <div className="h-1.5 w-full bg-muted rounded-none relative">
                            <div className="absolute left-[8%] right-[5%] h-full bg-[#0c4e40] rounded-none" />
                            <div className="absolute left-[8%] -top-1.5 size-4 bg-white border-2 border-[#0c4e40] shadow-none cursor-pointer rounded-none" />
                            <div className="absolute right-[5%] -top-1.5 size-4 bg-white border-2 border-[#0c4e40] shadow-none cursor-pointer rounded-none" />
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>10K (Micro)</span>
                        <span>250K+ (Macro)</span>
                    </div>
                </div>

                {/* Min. Engagement Rate - Sharp */}
                <div className="space-y-2.5 pt-3 border-t border-border/60">
                    <span className="text-xs font-bold text-foreground block">Min. Engagement Rate</span>
                    <div className="grid grid-cols-3 gap-2">
                        {[3, 5, 7].map((rate) => {
                            const isSelected = minEngagement === rate
                            return (
                                <button
                                    key={rate}
                                    type="button"
                                    onClick={() => setMinEngagement(rate)}
                                    className={`py-2 text-xs font-bold transition-all duration-150 cursor-pointer border rounded-none ${
                                        isSelected
                                            ? 'bg-[#0c4e40] text-white border-[#0c4e40] shadow-none'
                                            : 'bg-muted/60 text-muted-foreground border-border hover:text-foreground'
                                    }`}
                                >
                                    {rate}%+
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Collaboration Model - Sharp */}
                <div className="space-y-2.5 pt-3 border-t border-border/60">
                    <span className="text-xs font-bold text-foreground block">Collaboration Model</span>
                    <div className="grid grid-cols-2 gap-2.5 text-xs text-muted-foreground">
                        {['All Types', 'Paid Only', 'Barter / Stay', 'Hybrid'].map((model) => {
                            const checked = collabModel === model
                            return (
                                <label
                                    key={model}
                                    className="flex items-center gap-2 cursor-pointer hover:text-foreground select-none"
                                >
                                    <input
                                        type="radio"
                                        name="collabModelSharp"
                                        checked={checked}
                                        onChange={() => setCollabModel(model)}
                                        className="size-3.5 text-[#0c4e40] focus:ring-teal-700 cursor-pointer rounded-none"
                                    />
                                    <span className={checked ? 'font-semibold text-foreground' : ''}>
                                        {model}
                                    </span>
                                </label>
                            )
                        })}
                    </div>
                </div>

                {/* Apply Filters Button - Sharp */}
                <div className="pt-2">
                    <button
                        type="button"
                        onClick={() => {}}
                        className="w-full bg-[#0c4e40] hover:bg-[#08382e] text-white font-semibold h-11 text-xs sm:text-sm flex items-center justify-center gap-2 shadow-none cursor-pointer transition-colors rounded-none"
                    >
                        <SlidersHorizontal className="size-3.5" />
                        <span>Apply Filters ({filteredCreators.length * 4})</span>
                    </button>
                </div>
            </aside>

            {/* RIGHT CREATOR GRID AREA - ALL SHARP (rounded-none) */}
            <main className="lg:col-span-8 xl:col-span-9 space-y-6">
                {/* Header Row - Sharp */}
                <div className="border border-border/80 bg-card p-5 sm:p-6 shadow-none flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-none">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
                                Discover Goan Creators
                            </h1>
                            <span className="inline-flex items-center gap-1 bg-sky-500/10 border border-sky-500/20 px-2.5 py-0.5 text-[10px] font-bold text-sky-700 dark:text-sky-300 rounded-none">
                                450+ VERIFIED
                            </span>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            Showing <span className="font-semibold text-foreground">24 creators</span> specializing in coastal gastronomy, cafe crawls, and dining culture.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
                        <div className="flex items-center gap-2 text-xs">
                            <span className="text-muted-foreground font-medium">Sort by:</span>
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-teal-700 cursor-pointer rounded-none"
                                >
                                    <option value="Highest Engagement">Highest Engagement</option>
                                    <option value="Most Followers">Most Followers</option>
                                    <option value="Lowest Rate">Lowest Rate</option>
                                    <option value="Top Rated">Top Rated</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center border border-border bg-muted/40 p-1 rounded-none">
                            <button
                                type="button"
                                onClick={() => setViewMode('grid')}
                                aria-label="Grid view"
                                className={`size-7 flex items-center justify-center cursor-pointer transition-colors rounded-none ${
                                    viewMode === 'grid'
                                        ? 'bg-card text-foreground shadow-none'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <LayoutGrid className="size-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('list')}
                                aria-label="List view"
                                className={`size-7 flex items-center justify-center cursor-pointer transition-colors rounded-none ${
                                    viewMode === 'list'
                                        ? 'bg-card text-foreground shadow-none'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <List className="size-3.5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* 6 Creator Cards Grid - ALL SHARP (rounded-none) */}
                <div
                    className={
                        viewMode === 'grid'
                            ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                            : 'space-y-4'
                    }
                >
                    {filteredCreators.map((creator) => {
                        const isShortlisted = shortlistedIds.includes(creator.id)
                        const isLiked = likedIds.includes(creator.id)

                        return (
                            <div
                                key={creator.id}
                                className="border border-border/80 bg-card overflow-hidden shadow-none hover:border-teal-700 transition-colors duration-200 flex flex-col justify-between group rounded-none"
                            >
                                <div>
                                    {/* Cover Media Banner */}
                                    <div className="relative h-44 sm:h-48 w-full bg-zinc-900 overflow-hidden rounded-none">
                                        <Image
                                            unoptimized
                                            src={creator.coverImage}
                                            alt={creator.name}
                                            width={600}
                                            height={400}
                                            className="size-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 rounded-none"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/30" />

                                        {/* Top Badges over Cover Image - Sharp */}
                                        <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
                                            <span className="inline-flex items-center gap-1.5 bg-white/95 dark:bg-zinc-900/90 px-3 py-1 text-[10px] font-bold text-foreground shadow-none uppercase tracking-wider rounded-none">
                                                {getTagIcon(creator.tagType)}
                                                <span>{creator.tag}</span>
                                            </span>

                                            <button
                                                type="button"
                                                onClick={() => toggleLiked(creator.id)}
                                                aria-label="Favorite creator"
                                                className={`size-8 flex items-center justify-center transition-colors shadow-none cursor-pointer rounded-none ${
                                                    isLiked
                                                        ? 'bg-rose-500 text-white'
                                                        : 'bg-white/90 dark:bg-zinc-900/90 text-zinc-700 dark:text-zinc-300 hover:text-rose-500'
                                                }`}
                                            >
                                                <Heart className={`size-4 ${isLiked ? 'fill-white' : ''}`} />
                                            </button>
                                        </div>

                                        {/* Bottom Bar over Cover Image - Sharp */}
                                        <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-white text-[11px] font-semibold z-10">
                                            <div className="flex items-center gap-1.5 bg-black/70 px-2.5 py-1 rounded-none">
                                                <Play className="size-3 fill-white text-white" />
                                                <span>{creator.views}</span>
                                            </div>

                                            <span className="bg-black/70 px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase rounded-none">
                                                {creator.highlightBadge}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Creator Meta Body */}
                                    <div className="p-5 space-y-4">
                                        {/* Avatar & Name - Sharp Square */}
                                        <div className="flex items-center gap-3">
                                            <div className="relative size-12 overflow-hidden border-2 border-background shadow-none shrink-0 rounded-none">
                                                <Image
                                                    unoptimized
                                                    src={creator.avatar}
                                                    alt={creator.name}
                                                    width={100}
                                                    height={100}
                                                    className="size-full object-cover rounded-none"
                                                />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-1">
                                                    <h3 className="font-bold text-foreground text-sm truncate">
                                                        {creator.displayName}
                                                    </h3>
                                                    <CheckCircle2 className="size-3.5 fill-sky-600 text-white shrink-0" />
                                                </div>
                                                <div className="text-xs text-muted-foreground truncate">
                                                    {creator.handle}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Location & Specialization - Sharp */}
                                        <div className="flex items-center justify-between text-xs pt-1">
                                            <div className="flex items-center gap-1 text-muted-foreground truncate">
                                                <MapPin className="size-3.5 text-teal-700 dark:text-teal-400 shrink-0" />
                                                <span className="truncate">{creator.location}</span>
                                            </div>
                                            <span className="bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20 px-2 py-0.5 text-[10px] font-bold shrink-0 rounded-none">
                                                {creator.nicheBadge}
                                            </span>
                                        </div>

                                        {/* 3 Metric Stats Row - Sharp */}
                                        <div className="grid grid-cols-3 gap-2 py-3 border-y border-border/60 text-center">
                                            <div>
                                                <div className="text-base font-extrabold text-foreground leading-tight">
                                                    {creator.followers}
                                                </div>
                                                <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mt-0.5">
                                                    Followers
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-base font-extrabold text-teal-700 dark:text-teal-400 leading-tight">
                                                    {creator.engagementRate}
                                                </div>
                                                <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mt-0.5">
                                                    Eng. Rate
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-base font-extrabold text-foreground leading-tight">
                                                    {creator.reviewsCount}
                                                </div>
                                                <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mt-0.5">
                                                    Reviews
                                                </div>
                                            </div>
                                        </div>

                                        {/* Rate & Collab Badge - Sharp */}
                                        <div className="flex items-center justify-between pt-1">
                                            <div>
                                                <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
                                                    Starting Rate
                                                </div>
                                                <div className="text-xs font-bold text-foreground">
                                                    {creator.startingRate}
                                                </div>
                                            </div>

                                            <span
                                                className={`text-[10px] font-bold px-2 py-0.5 border uppercase tracking-wider rounded-none ${
                                                    creator.collabBadge === 'BARTER FRIENDLY'
                                                        ? 'bg-sky-500/10 text-sky-800 dark:text-sky-300 border-sky-500/30'
                                                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                                                }`}
                                            >
                                                {creator.collabBadge}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom Action Buttons - Sharp */}
                                <div className="p-5 pt-0 flex items-center gap-2">
                                    <Link
                                        href="/business/profile"
                                        className="flex-1 border border-border bg-background hover:bg-muted font-bold text-xs py-2.5 text-foreground flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-none rounded-none"
                                    >
                                        <span>View Profile</span>
                                        <span className="text-[11px]">&nearr;</span>
                                    </Link>

                                    <button
                                        type="button"
                                        onClick={() => toggleShortlist(creator.id)}
                                        aria-label={isShortlisted ? 'Remove from shortlist' : 'Shortlist creator'}
                                        className={`size-10 border flex items-center justify-center cursor-pointer transition-colors shrink-0 shadow-none rounded-none ${
                                            isShortlisted
                                                ? 'bg-[#0c4e40] text-white border-[#0c4e40]'
                                                : 'border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        <Bookmark className={`size-4 ${isShortlisted ? 'fill-white' : ''}`} />
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Bottom Pagination - Sharp */}
                <div className="border border-border/80 bg-card p-4 sm:p-5 shadow-none flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-muted-foreground rounded-none">
                    <div>
                        Showing <span className="font-semibold text-foreground">1 – 6</span> of{' '}
                        <span className="font-semibold text-foreground">24 creators</span>
                    </div>

                    <div className="flex items-center gap-1.5 self-center sm:self-auto">
                        <button
                            type="button"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            className="px-3 py-1.5 border border-border bg-background hover:bg-muted disabled:opacity-50 text-foreground font-semibold cursor-pointer rounded-none"
                        >
                            &lt; Prev
                        </button>

                        {[1, 2, 3, 4].map((page) => (
                            <button
                                key={page}
                                type="button"
                                onClick={() => setCurrentPage(page)}
                                className={`size-8 font-bold text-xs flex items-center justify-center cursor-pointer transition-colors rounded-none ${
                                    currentPage === page
                                        ? 'bg-[#0c4e40] text-white shadow-none'
                                        : 'border border-border bg-background hover:bg-muted text-foreground'
                                }`}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            type="button"
                            disabled={currentPage === 4}
                            onClick={() => setCurrentPage((p) => Math.min(4, p + 1))}
                            className="px-3 py-1.5 border border-border bg-background hover:bg-muted disabled:opacity-50 text-foreground font-semibold cursor-pointer rounded-none"
                        >
                            Next &gt;
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )
}
