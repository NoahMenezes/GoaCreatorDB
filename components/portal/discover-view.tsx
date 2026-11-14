'use client'

import { useState, useEffect, useTransition, Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
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
    Sun,
    Utensils,
    Waves,
    Wine,
    Loader2,
    AlertCircle,
    RefreshCw,
} from 'lucide-react'

export interface CreatorItem {
    id: number | string
    creator_id: number
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
    district: string
    is_verified?: boolean
    accepts_barter?: boolean
}

export function DiscoverView() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center p-12">
                <Loader2 className="size-8 text-primary animate-spin" />
            </div>
        }>
            <DiscoverViewContent />
        </Suspense>
    )
}

function DiscoverViewContent() {
    const searchParams = useSearchParams()
    const queryParam = searchParams.get('q') || ''

    const [verifiedOnly, setVerifiedOnly] = useState(false)
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])
    const [northGoaOpen, setNorthGoaOpen] = useState(true)
    const [southGoaOpen, setSouthGoaOpen] = useState(false)
    const [selectedLocations, setSelectedLocations] = useState<string[]>([])
    const [minEngagement, setMinEngagement] = useState<number>(0)
    const [collabModel, setCollabModel] = useState<string>('All Types')
    const [sortBy, setSortBy] = useState<string>('Most Followers')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [shortlistedIds, setShortlistedIds] = useState<number[]>([])
    const [likedIds, setLikedIds] = useState<number[]>([])
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [searchQuery, setSearchQuery] = useState(queryParam)

    const [creators, setCreators] = useState<CreatorItem[]>([])
    const [totalCount, setTotalCount] = useState<number>(0)
    const [totalPages, setTotalPages] = useState<number>(1)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [categories, setCategories] = useState<string[]>([
        'Food & Beach Dining',
        'Travel & Villas',
        'Nightlife & Sunsets',
        'Resort Fashion',
        'Wellness & Surf',
        'Goan Heritage',
    ])

    const [northLocations, setNorthLocations] = useState<string[]>([
        'Assagao',
        'Panjim',
        'Anjuna',
        'Calangute',
        'Vagator',
        'Candolim',
        'Siolim',
    ])

    const [southLocations, setSouthLocations] = useState<string[]>([
        'Palolem',
        'Margao',
        'Benaulim',
        'Colva',
        'Agonda',
        'Cavelossim',
    ])

    const [, startTransition] = useTransition()

    // 1. Fetch Categories and Locations
    useEffect(() => {
        async function fetchTaxonomy() {
            try {
                const [catRes, locRes, shortRes] = await Promise.all([
                    fetch('/api/categories'),
                    fetch('/api/locations'),
                    fetch('/api/shortlist', { credentials: 'include' }),
                ])

                if (catRes.ok) {
                    const cData = await catRes.json()
                    if (cData.data && Array.isArray(cData.data)) {
                        setCategories(cData.data.map((c: { category_name: string }) => c.category_name))
                    }
                }

                if (locRes.ok) {
                    const lData = await locRes.json()
                    if (lData.data) {
                        const north = lData.data['North Goa'] || {}
                        const south = lData.data['South Goa'] || {}

                        const northAreas: string[] = []
                        Object.values(north).forEach((arr) => {
                            if (Array.isArray(arr)) {
                                arr.forEach((item: { area_name: string }) => northAreas.push(item.area_name))
                            }
                        })

                        const southAreas: string[] = []
                        Object.values(south).forEach((arr) => {
                            if (Array.isArray(arr)) {
                                arr.forEach((item: { area_name: string }) => southAreas.push(item.area_name))
                            }
                        })

                        if (northAreas.length > 0) setNorthLocations(northAreas.slice(0, 10))
                        if (southAreas.length > 0) setSouthLocations(southAreas.slice(0, 10))
                    }
                }

                if (shortRes.ok) {
                    const sData = await shortRes.json()
                    if (Array.isArray(sData.data)) {
                        setShortlistedIds(sData.data.map((item: { creator_id: number }) => item.creator_id))
                    }
                }
            } catch (err) {
                console.error('Failed to load taxonomy:', err)
            }
        }
        fetchTaxonomy()
    }, [])

    // 2. Fetch Creators based on active filters
    const fetchCreators = async () => {
        setLoading(true)
        setError(null)
        try {
            const params = new URLSearchParams()
            params.set('page', String(currentPage))
            params.set('limit', '9')

            if (searchQuery.trim()) params.set('q', searchQuery.trim())
            if (verifiedOnly) params.set('verifiedOnly', 'true')
            if (minEngagement > 0) params.set('minEngagement', String(minEngagement))

            selectedCategories.forEach((cat) => params.append('category[]', cat))
            selectedLocations.forEach((loc) => params.append('taluka[]', loc))

            if (collabModel === 'Paid Only') params.set('collabType', 'paid')
            else if (collabModel === 'Barter / Stay') params.set('collabType', 'barter')
            else if (collabModel === 'Hybrid') params.set('collabType', 'hybrid')

            if (sortBy === 'Highest Engagement') params.set('sort', 'engagement')
            else if (sortBy === 'Most Followers') params.set('sort', 'followers')
            else if (sortBy === 'Lowest Rate') params.set('sort', 'recent')
            else if (sortBy === 'Top Rated') params.set('sort', 'rating')

            const res = await fetch(`/api/creators?${params.toString()}`)
            const data = await res.json()

            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Failed to fetch creators')
            }

            const rawList: Record<string, unknown>[] = data.data || []
            const parsed: CreatorItem[] = rawList.map((r) => {
                const cid = Number(r.creator_id || r.id)
                const followersNum = Number(r.total_followers) || 0
                const engagementNum = Number(r.avg_engagement_rate) || 0
                const baseRateNum = Number(r.min_paid_rate) || 5000
                const acceptsBarter = Boolean(r.accepts_barter)
                const isVerified = Boolean(r.is_verified)
                const primaryCat = String(r.niche || 'Food & Beach Dining')

                let tagType: CreatorItem['tagType'] = 'food'
                if (primaryCat.toLowerCase().includes('cocktail') || primaryCat.toLowerCase().includes('nightlife')) tagType = 'cocktail'
                else if (primaryCat.toLowerCase().includes('heritage')) tagType = 'heritage'
                else if (primaryCat.toLowerCase().includes('travel') || primaryCat.toLowerCase().includes('villa')) tagType = 'stay'
                else if (primaryCat.toLowerCase().includes('surf') || primaryCat.toLowerCase().includes('wellness')) tagType = 'bbq'
                else if (primaryCat.toLowerCase().includes('cafe')) tagType = 'cafe'

                const mockCovers = [
                    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=900&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=900&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=900&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=900&auto=format&fit=crop',
                ]

                return {
                    id: cid,
                    creator_id: cid,
                    name: String(r.full_name || 'Creator'),
                    displayName: String(r.full_name || 'Creator'),
                    handle: String(r.handle || `@creator_${cid}`),
                    avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop`,
                    coverImage: mockCovers[cid % mockCovers.length],
                    tag: primaryCat.toUpperCase(),
                    tagType,
                    views: `${Math.round(followersNum * 0.4 / 1000)}K avg views`,
                    highlightBadge: isVerified ? 'ADMIN VERIFIED' : 'ACTIVE CREATOR',
                    location: r.area_name ? `${r.area_name}, ${r.taluka || 'Goa'}` : 'Goa',
                    nicheBadge: primaryCat,
                    followers: String(r.followers || `${Math.round(followersNum / 1000)}K`),
                    followersNum,
                    engagementRate: `${engagementNum.toFixed(1)}%`,
                    engagementNum,
                    reviewsCount: Number(r.review_count) || 0,
                    startingRate: `₹${baseRateNum.toLocaleString()} / collab`,
                    startingRateNum: baseRateNum,
                    collabBadge: acceptsBarter ? 'BARTER FRIENDLY' : 'PAID ONLY',
                    collabType: acceptsBarter ? 'hybrid' : 'paid',
                    category: primaryCat,
                    district: String(r.district || 'North Goa'),
                    is_verified: isVerified,
                    accepts_barter: acceptsBarter,
                }
            })

            setCreators(parsed)
            setTotalCount(data.pagination?.total || parsed.length)
            setTotalPages(data.pagination?.totalPages || 1)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch creators')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCreators()
    }, [currentPage, verifiedOnly, minEngagement, collabModel, sortBy, selectedCategories, selectedLocations, searchQuery])

    const toggleCategory = (cat: string) => {
        setCurrentPage(1)
        setSelectedCategories((prev) =>
            prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
        )
    }

    const toggleLocation = (loc: string) => {
        setCurrentPage(1)
        setSelectedLocations((prev) =>
            prev.includes(loc) ? prev.filter((l) => l !== loc) : [...prev, loc]
        )
    }

    const toggleShortlist = async (creatorId: number) => {
        const isSaved = shortlistedIds.includes(creatorId)
        setShortlistedIds((prev) =>
            isSaved ? prev.filter((id) => id !== creatorId) : [...prev, creatorId]
        )

        try {
            if (isSaved) {
                await fetch(`/api/shortlist/${creatorId}`, { method: 'DELETE' })
            } else {
                await fetch('/api/shortlist', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ creator_id: creatorId }),
                })
            }
        } catch (err) {
            console.error('Failed to update shortlist:', err)
            // Revert
            setShortlistedIds((prev) =>
                isSaved ? [...prev, creatorId] : prev.filter((id) => id !== creatorId)
            )
        }
    }

    const toggleLiked = (creatorId: number) => {
        setLikedIds((prev) =>
            prev.includes(creatorId) ? prev.filter((i) => i !== creatorId) : [...prev, creatorId]
        )
    }

    const handleResetAll = () => {
        startTransition(() => {
            setVerifiedOnly(false)
            setSelectedCategories([])
            setSelectedLocations([])
            setMinEngagement(0)
            setCollabModel('All Types')
            setSortBy('Most Followers')
            setSearchQuery('')
            setCurrentPage(1)
        })
    }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase()
    }

    const getTagIcon = (type: CreatorItem['tagType']) => {
        switch (type) {
            case 'food':
            case 'heritage':
                return <Utensils className="size-3 text-primary" />
            case 'cocktail':
                return <Wine className="size-3 text-primary" />
            case 'cafe':
                return <Coffee className="size-3 text-primary" />
            case 'bbq':
                return <Flame className="size-3 text-primary" />
            case 'stay':
                return <Compass className="size-3 text-primary" />
            default:
                return <Utensils className="size-3 text-primary" />
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Filters sidebar */}
            <aside className="lg:col-span-4 xl:col-span-3 border border-border bg-card p-5 rounded-sm shadow-sm sticky top-24">
                <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
                    <div className="flex items-center gap-2">
                        <SlidersHorizontal className="size-4 text-foreground" />
                        <h2 className="text-sm font-bold text-foreground">Filters</h2>
                    </div>
                    <button
                        type="button"
                        onClick={handleResetAll}
                        className="text-xs font-bold text-primary hover:underline cursor-pointer rounded-sm px-2 py-1 hover:bg-primary/5"
                    >
                        Reset All
                    </button>
                </div>

                <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                            <ShieldCheck className="size-4 text-primary" />
                            <span>Verified Only</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                setCurrentPage(1)
                                setVerifiedOnly(!verifiedOnly)
                            }}
                            aria-label="Toggle Verified Only"
                            className={`w-11 h-6 flex items-center p-1 cursor-pointer transition-colors duration-150 rounded-full border ${
                                verifiedOnly ? 'bg-primary border-primary' : 'bg-background border-border'
                            }`}
                        >
                            <div
                                className={`bg-white size-4 transform transition-transform duration-150 rounded-full ${
                                    verifiedOnly ? 'translate-x-5' : 'translate-x-0'
                                }`}
                            />
                        </button>
                    </div>
                </div>

                <div className="space-y-2.5 mb-6 border-t border-border pt-4">
                    <div className="flex items-center justify-between text-xs mb-2">
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
                                    className={`px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer rounded-sm border ${
                                        isSelected
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'bg-background text-muted-foreground border-border hover:text-foreground hover:border-primary/50'
                                    }`}
                                >
                                    <span>{cat}</span>
                                    {isSelected && <Check className="size-3 stroke-[3]" />}
                                </button>
                            )
                        })}
                    </div>
                </div>

                <div className="space-y-3 mb-6 border-t border-border pt-4">
                    <span className="text-xs font-bold text-foreground block">Location / Area</span>

                    <div className="space-y-2">
                        <button
                            type="button"
                            onClick={() => setNorthGoaOpen(!northGoaOpen)}
                            className="w-full flex items-center justify-between text-xs font-bold text-foreground hover:text-primary cursor-pointer"
                        >
                            <div className="flex items-center gap-1.5">
                                <Waves className="size-3.5 text-primary" />
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
                                                className="size-4 border-border text-primary focus:ring-primary cursor-pointer rounded-sm"
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
                            className="w-full flex items-center justify-between text-xs font-bold text-foreground hover:text-primary cursor-pointer"
                        >
                            <div className="flex items-center gap-1.5">
                                <Sun className="size-3.5 text-primary" />
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
                                                className="size-4 border-border text-primary focus:ring-primary cursor-pointer rounded-sm"
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

                <div className="space-y-2.5 mb-6 border-t border-border pt-4">
                    <span className="text-xs font-bold text-foreground block">Min. Engagement Rate</span>
                    <div className="grid grid-cols-3 gap-2">
                        {[0, 3, 5, 7].map((rate) => {
                            const isSelected = minEngagement === rate
                            return (
                                <button
                                    key={rate}
                                    type="button"
                                    onClick={() => {
                                        setCurrentPage(1)
                                        setMinEngagement(rate)
                                    }}
                                    className={`py-2 text-xs font-bold transition-colors cursor-pointer rounded-sm border ${
                                        isSelected
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'bg-background text-muted-foreground border-border hover:text-foreground hover:border-primary/50'
                                    }`}
                                >
                                    {rate === 0 ? 'Any' : `${rate}%`}
                                </button>
                            )
                        })}
                    </div>
                </div>

                <div className="space-y-2.5 border-t border-border pt-4">
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
                                        name="collabModel"
                                        checked={checked}
                                        onChange={() => {
                                            setCurrentPage(1)
                                            setCollabModel(model)
                                        }}
                                        className="size-3.5 text-primary focus:ring-primary cursor-pointer rounded-sm"
                                    />
                                    <span className={checked ? 'font-semibold text-foreground' : ''}>
                                        {model}
                                    </span>
                                </label>
                            )
                        })}
                    </div>

                    <div className="mt-4">
                        <button
                            type="button"
                            onClick={fetchCreators}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium h-11 text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors rounded-sm shadow-sm"
                        >
                            <SlidersHorizontal className="size-3.5" />
                            <span>Apply Filters ({totalCount})</span>
                        </button>
                    </div>
                </div>
            </aside>

            <main className="lg:col-span-8 xl:col-span-9 space-y-8">
                <div className="border border-border bg-card p-5 sm:p-6 rounded-sm shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                                Discover Goan Creators
                            </h1>
                            <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider">
                                {totalCount} CREATORS
                            </span>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            Showing <span className="font-semibold text-foreground">{creators.length} creators</span> specializing in coastal gastronomy, cafe crawls, and dining culture.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
                        <div className="flex items-center gap-2 text-xs">
                            <span className="text-muted-foreground font-medium">Sort by:</span>
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) => {
                                        setCurrentPage(1)
                                        setSortBy(e.target.value)
                                    }}
                                    className="border border-border bg-background rounded-sm px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
                                >
                                    <option value="Most Followers">Most Followers</option>
                                    <option value="Highest Engagement">Highest Engagement</option>
                                    <option value="Lowest Rate">Recent</option>
                                    <option value="Top Rated">Top Rated</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center border border-border bg-background p-1 rounded-sm">
                            <button
                                type="button"
                                onClick={() => setViewMode('grid')}
                                aria-label="Grid view"
                                className={`size-7 flex items-center justify-center cursor-pointer transition-colors rounded-sm ${
                                    viewMode === 'grid'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                }`}
                            >
                                <LayoutGrid className="size-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('list')}
                                aria-label="List view"
                                className={`size-7 flex items-center justify-center cursor-pointer transition-colors rounded-sm ${
                                    viewMode === 'list'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                }`}
                            >
                                <List className="size-3.5" />
                            </button>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="border border-border bg-card p-16 text-center rounded-sm shadow-sm flex flex-col items-center justify-center space-y-3">
                        <Loader2 className="size-8 text-primary animate-spin" />
                        <p className="text-sm text-muted-foreground">Discovering Goan creators...</p>
                    </div>
                ) : error ? (
                    <div className="border border-destructive/20 bg-destructive/5 p-8 rounded-sm text-center space-y-3">
                        <AlertCircle className="size-8 text-destructive mx-auto" />
                        <p className="text-sm font-semibold text-destructive">{error}</p>
                        <button
                            type="button"
                            onClick={fetchCreators}
                            className="inline-flex items-center gap-2 bg-background border border-border px-4 py-2 text-xs font-bold hover:bg-muted rounded-sm transition-colors cursor-pointer"
                        >
                            <RefreshCw className="size-3.5" />
                            <span>Try Again</span>
                        </button>
                    </div>
                ) : creators.length === 0 ? (
                    <div className="border border-border bg-card p-16 text-center rounded-sm shadow-sm space-y-3">
                        <Compass className="size-10 text-muted-foreground mx-auto stroke-1" />
                        <h3 className="text-base font-bold text-foreground">No creators found</h3>
                        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                            No creators matched your current filter combinations. Try resetting filters or widening your search criteria.
                        </p>
                        <button
                            type="button"
                            onClick={handleResetAll}
                            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 text-xs font-bold rounded-sm hover:bg-primary/90 transition-colors mt-2"
                        >
                            <RefreshCw className="size-3.5" />
                            <span>Reset Filters</span>
                        </button>
                    </div>
                ) : (
                    <>
                        <div
                            className={
                                viewMode === 'grid'
                                    ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                                    : 'space-y-4'
                            }
                        >
                            {creators.map((creator) => {
                                const isShortlisted = shortlistedIds.includes(Number(creator.id))
                                const isLiked = likedIds.includes(Number(creator.id))

                                return (
                                    <div
                                        key={creator.id}
                                        className="border border-border bg-card overflow-hidden rounded-sm shadow-sm hover:border-primary/50 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="relative h-44 sm:h-48 w-full overflow-hidden">
                                                <Image
                                                    unoptimized
                                                    src={creator.coverImage}
                                                    alt={creator.name}
                                                    width={600}
                                                    height={400}
                                                    className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />

                                                <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
                                                    <span className="inline-flex items-center gap-1.5 bg-background border border-border px-3 py-1 text-[10px] font-bold text-foreground uppercase tracking-wider rounded-sm shadow-sm">
                                                        {getTagIcon(creator.tagType)}
                                                        <span>{creator.tag}</span>
                                                    </span>

                                                    <button
                                                        type="button"
                                                        onClick={() => toggleLiked(Number(creator.id))}
                                                        aria-label="Favorite creator"
                                                        className={`size-8 flex items-center justify-center transition-colors cursor-pointer rounded-sm ${
                                                            isLiked
                                                                ? 'bg-primary text-primary-foreground'
                                                                : 'bg-background border border-border text-muted-foreground hover:text-primary hover:bg-primary/5'
                                                        }`}
                                                    >
                                                        <Heart className={`size-4 ${isLiked ? 'fill-white' : ''}`} />
                                                    </button>
                                                </div>

                                                <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-white text-[11px] font-semibold z-10">
                                                    <div className="flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-sm">
                                                        <Play className="size-3 fill-white text-white" />
                                                        <span>{creator.views}</span>
                                                    </div>

                                                    <span className="bg-black/60 px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase rounded-sm">
                                                        {creator.highlightBadge}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="p-5 space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative size-12 overflow-hidden border-2 border-background shadow-sm shrink-0 rounded-md bg-muted flex items-center justify-center font-bold text-sm text-muted-foreground">
                                                        {getInitials(creator.name)}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-1">
                                                            <h3 className="font-bold text-foreground text-sm truncate">
                                                                {creator.displayName}
                                                            </h3>
                                                            {creator.is_verified && (
                                                                <CheckCircle2 className="size-3.5 fill-primary text-white shrink-0" />
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground truncate font-mono">
                                                            {creator.handle}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between text-xs pt-1">
                                                    <div className="flex items-center gap-1 text-muted-foreground truncate">
                                                        <MapPin className="size-3.5 text-primary shrink-0" />
                                                        <span className="truncate">{creator.location}</span>
                                                    </div>
                                                    <span className="bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 text-[10px] font-bold rounded-sm">
                                                        {creator.nicheBadge}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-3 gap-2 py-3 border-y border-border text-center">
                                                    <div>
                                                        <div className="text-base font-extrabold text-foreground leading-tight">
                                                            {creator.followers}
                                                        </div>
                                                        <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mt-0.5">
                                                            Followers
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-base font-extrabold text-primary leading-tight">
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
                                                        className={`text-[10px] font-bold px-2 py-0.5 border uppercase tracking-wider rounded-sm ${
                                                            creator.collabBadge === 'BARTER FRIENDLY'
                                                                ? 'bg-primary/10 text-primary border-primary'
                                                                : 'bg-muted border-border text-muted-foreground'
                                                        }`}
                                                    >
                                                        {creator.collabBadge}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-5 pt-0 flex items-center gap-2">
                                            <Link
                                                href={`/business/requests`}
                                                className="flex-1 border border-border bg-background hover:bg-muted font-medium text-xs py-2.5 text-foreground flex items-center justify-center gap-1.5 transition-colors rounded-sm cursor-pointer"
                                            >
                                                <span>Book Collaboration</span>
                                                <span className="text-[11px]">&nearr;</span>
                                            </Link>

                                            <button
                                                type="button"
                                                onClick={() => toggleShortlist(Number(creator.id))}
                                                aria-label={isShortlisted ? 'Remove from shortlist' : 'Shortlist creator'}
                                                className={`size-10 border flex items-center justify-center cursor-pointer transition-colors shrink-0 rounded-sm ${
                                                    isShortlisted
                                                        ? 'bg-primary text-primary-foreground border-primary'
                                                        : 'border-border bg-background hover:bg-muted text-muted-foreground hover:text-primary hover:border-primary/50'
                                                }`}
                                            >
                                                <Bookmark className={`size-4 ${isShortlisted ? 'fill-white' : ''}`} />
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {totalPages > 1 && (
                            <div className="border border-border bg-card p-4 sm:p-5 rounded-sm shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-muted-foreground">
                                <div>
                                    Showing page <span className="font-semibold text-foreground">{currentPage}</span> of{' '}
                                    <span className="font-semibold text-foreground">{totalPages}</span> ({totalCount} total creators)
                                </div>

                                <div className="flex items-center gap-1.5 self-center sm:self-auto">
                                    <button
                                        type="button"
                                        disabled={currentPage <= 1}
                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        className="px-3 py-1.5 border border-border bg-background hover:bg-muted disabled:opacity-50 text-foreground font-semibold cursor-pointer rounded-sm"
                                    >
                                        &lt; Prev
                                    </button>

                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            type="button"
                                            onClick={() => setCurrentPage(page)}
                                            className={`size-8 font-bold text-xs flex items-center justify-center cursor-pointer transition-colors rounded-sm ${
                                                currentPage === page
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'border border-border bg-background hover:bg-muted text-foreground'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}

                                    <button
                                        type="button"
                                        disabled={currentPage >= totalPages}
                                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                        className="px-3 py-1.5 border border-border bg-background hover:bg-muted disabled:opacity-50 text-foreground font-semibold cursor-pointer rounded-sm"
                                    >
                                        Next &gt;
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    )
}
