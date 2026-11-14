'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
    Camera,
    MapPin,
    CheckCircle2,
    Globe,
    Link as LinkIcon,
    User as UserIcon,
    ShieldCheck as ShieldCheckIcon,
    Link2,
    Loader2,
    AlertCircle,
    RefreshCw,
    Star,
} from 'lucide-react'

interface CategoryItem {
    category_id: number
    category_name: string
    is_primary?: boolean
}

interface LocationOption {
    location_id: number
    area_name: string
    taluka: string
    district: string
}

export default function CreatorProfilePage() {
    const [fullName, setFullName] = useState('Sneha Fernandes')
    const [handle, setHandle] = useState('sneha_curates')
    const [bio, setBio] = useState(
        "Visual storyteller & food writer documenting Goa's emerging culinary culture, artisanal cafes, and boutique heritage stays."
    )
    const [barter, setBarter] = useState(true)
    const [minFloor, setMinFloor] = useState('8000')
    const [locationId, setLocationId] = useState<number | ''>(1)
    const [locationLabel, setLocationLabel] = useState('Assagao, North Goa')
    const [completeness, setCompleteness] = useState(80)

    const [allCategories, setAllCategories] = useState<CategoryItem[]>([])
    const [selectedCatIds, setSelectedCatIds] = useState<number[]>([])
    const [primaryCatId, setPrimaryCatId] = useState<number | null>(null)
    const [allLocations, setAllLocations] = useState<LocationOption[]>([])

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const [saveMessage, setSaveMessage] = useState<string | null>(null)

    const fetchProfile = async () => {
        setLoading(true)
        setError(null)
        try {
            const [profileRes, catRes, locRes, socialRes] = await Promise.all([
                fetch('/api/profile', { credentials: 'include' }),
                fetch('/api/categories'),
                fetch('/api/locations'),
                fetch('/api/social/accounts', { credentials: 'include' }),
            ])

            if (catRes.ok) {
                const cData = await catRes.json()
                if (Array.isArray(cData.data)) {
                    setAllCategories(cData.data)
                }
            }

            if (locRes.ok) {
                const lData = await locRes.json()
                if (lData.data) {
                    const flatLocs: LocationOption[] = []
                    Object.entries(lData.data).forEach(([district, talukas]) => {
                        Object.entries(talukas as Record<string, { location_id: number; area_name: string }[]>).forEach(([taluka, areas]) => {
                            areas.forEach((a) => {
                                flatLocs.push({
                                    location_id: a.location_id,
                                    area_name: a.area_name,
                                    taluka,
                                    district,
                                })
                            })
                        })
                    })
                    setAllLocations(flatLocs)
                }
            }

            if (socialRes.ok) {
                const sData = await socialRes.json()
                if (Array.isArray(sData.data) && sData.data.length > 0) {
                    setHandle(sData.data[0].handle.replace(/^@/, ''))
                }
            }

            if (profileRes.ok) {
                const data = await profileRes.json()
                const profile = data.data?.profile
                if (profile) {
                    setFullName(profile.full_name || '')
                    setBio(profile.bio || '')
                    setBarter(Boolean(profile.accepts_barter))
                    setMinFloor(String(profile.min_paid_rate ?? 8000))
                    setLocationId(profile.location_id || '')
                    if (profile.area_name) {
                        setLocationLabel(`${profile.area_name}, ${profile.taluka}`)
                    }
                }

                if (Array.isArray(data.data?.categories) && data.data.categories.length > 0) {
                    const ids = data.data.categories.map((c: CategoryItem) => c.category_id)
                    setSelectedCatIds(ids)
                    const primary = data.data.categories.find((c: CategoryItem) => c.is_primary)
                    setPrimaryCatId(primary ? primary.category_id : ids[0])
                }

                if (typeof data.data?.completeness === 'number') {
                    setCompleteness(data.data.completeness)
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Profile fetch error')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProfile()
    }, [])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setSaveMessage(null)
        try {
            // Ensure at least one category has is_primary
            const categoryPayload = selectedCatIds.map((id) => ({
                category_id: id,
                is_primary: id === primaryCatId || (selectedCatIds.length === 1),
            }))

            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    full_name: fullName.trim(),
                    bio: bio.trim(),
                    accepts_barter: barter,
                    min_paid_rate: parseInt(minFloor, 10) || 0,
                    location_id: locationId ? Number(locationId) : undefined,
                    categories: categoryPayload.length > 0 ? categoryPayload : undefined,
                }),
            })

            const data = await res.json()
            if (res.ok && data.success) {
                setSaveMessage('Profile saved successfully!')
                setTimeout(() => setSaveMessage(null), 3000)
                await fetchProfile()
            } else {
                alert(data.error || 'Failed to save profile.')
            }
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Error saving profile.')
        } finally {
            setSaving(false)
        }
    }

    const handleDiscard = (e: React.FormEvent) => {
        e.preventDefault()
        fetchProfile()
    }

    const toggleCategory = (catId: number) => {
        setSelectedCatIds((prev) => {
            if (prev.includes(catId)) {
                const next = prev.filter((id) => id !== catId)
                if (primaryCatId === catId) {
                    setPrimaryCatId(next[0] || null)
                }
                return next
            } else {
                if (prev.length === 0) setPrimaryCatId(catId)
                return [...prev, catId]
            }
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

    return (
        <main className="space-y-10">
            {/* 1. HEADER BANNER */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="space-y-1.5">
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                        Edit Creator Profile
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage your public portfolio, verified badges, bio, and collaboration terms visible to Goan businesses.
                    </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-end">
                    <Link
                        href="/business/discover"
                        className="flex items-center gap-2 border border-border bg-background px-3.5 py-2 text-xs font-bold text-foreground hover:bg-muted transition-colors rounded-sm cursor-pointer"
                    >
                        <span>View Public Marketplace</span>
                        <Link2 className="size-3.5 text-muted-foreground" />
                    </Link>
                </div>
            </div>

            {loading ? (
                <div className="border border-border bg-card p-16 text-center rounded-sm shadow-sm flex flex-col items-center justify-center space-y-3">
                    <Loader2 className="size-8 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">Loading your profile settings...</p>
                </div>
            ) : error ? (
                <div className="border border-destructive/20 bg-destructive/5 p-8 rounded-sm text-center space-y-3">
                    <AlertCircle className="size-8 text-destructive mx-auto" />
                    <p className="text-sm font-semibold text-destructive">{error}</p>
                    <button
                        type="button"
                        onClick={fetchProfile}
                        className="inline-flex items-center gap-2 bg-background border border-border px-4 py-2 text-xs font-bold hover:bg-muted rounded-sm transition-colors cursor-pointer"
                    >
                        <RefreshCw className="size-3.5" />
                        <span>Try Again</span>
                    </button>
                </div>
            ) : (
                /* 2. TWO-COLUMN LAYOUT */
                <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* LEFT COLUMN */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Visual Identity & Biography */}
                        <section className="border border-border bg-card p-5 sm:p-6 rounded-sm shadow-sm">
                            <div className="flex items-center gap-2 mb-5">
                                <Camera className="size-4 text-primary" />
                                <h3 className="text-sm font-bold text-foreground">Visual Identity &amp; Biography</h3>
                                <span className="ml-auto text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                                    Your verified card as seen by hospitality partners.
                                </span>
                            </div>

                            {/* Profile Avatar */}
                            <div className="flex flex-col sm:flex-row sm:items-start gap-5 mb-6">
                                <div className="size-32 rounded-md border border-border/60 bg-muted flex items-center justify-center font-bold text-2xl text-muted-foreground shrink-0 shadow-sm">
                                    {getInitials(fullName || 'Goa Creator')}
                                </div>

                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-foreground">
                                            Platform Identity Avatar
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                                        Per Goan hospitality standards, your profile card renders with verified identity initials derived from your legal name.
                                    </p>
                                </div>
                            </div>

                            {/* Name + Instagram */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                                        Full Name
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <div className="size-9 border border-border bg-background rounded-sm flex items-center justify-center text-xs text-muted-foreground shrink-0">
                                            <UserIcon className="size-3.5" />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder="Your full name"
                                            className="flex-1 border border-border bg-background rounded-sm px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                                        Instagram Handle
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <div className="size-9 border border-border bg-background rounded-sm flex items-center justify-center text-xs text-muted-foreground font-mono shrink-0">
                                            @
                                        </div>
                                        <input
                                            type="text"
                                            readOnly
                                            value={handle}
                                            className="flex-1 border border-border bg-muted/40 rounded-sm px-3 py-2 text-xs text-foreground focus:outline-none cursor-default font-mono"
                                        />
                                        <CheckCircle2 className="size-4 text-primary shrink-0" />
                                    </div>
                                </div>
                            </div>

                            {/* Bio */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                                        Curated Editorial Bio
                                    </label>
                                    <span className="text-[10px] text-muted-foreground font-mono">
                                        {bio.length} / 500
                                    </span>
                                </div>
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    rows={4}
                                    placeholder="Describe your creative storytelling, focus areas, and Goan venues you collaborate with..."
                                    className="w-full border border-border bg-background rounded-sm p-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed resize-none"
                                />
                            </div>

                            <div className="mt-5 flex items-center gap-2 text-[11px]">
                                <CheckCircle2 className="size-3.5 text-primary" />
                                <span className="text-muted-foreground">
                                    Changes save directly to your database profile and sync to business discovery.
                                </span>
                            </div>
                        </section>

                        {/* Location Selection */}
                        <section className="border border-border bg-card p-5 sm:p-6 rounded-sm shadow-sm space-y-4">
                            <div className="flex items-center gap-2">
                                <Globe className="size-4 text-primary" />
                                <h3 className="text-sm font-bold text-foreground">Primary Service Location</h3>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                                    Base Taluka &amp; Area
                                </label>
                                <select
                                    value={locationId}
                                    onChange={(e) => {
                                        const val = Number(e.target.value)
                                        setLocationId(val)
                                        const found = allLocations.find((l) => l.location_id === val)
                                        if (found) setLocationLabel(`${found.area_name}, ${found.taluka}`)
                                    }}
                                    className="w-full border border-border bg-background rounded-sm px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                                >
                                    {allLocations.map((loc) => (
                                        <option key={loc.location_id} value={loc.location_id}>
                                            {loc.area_name}, {loc.taluka} ({loc.district})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                                Currently set: <strong className="text-foreground">{locationLabel}</strong>
                            </p>
                        </section>

                        {/* Niches / Categories */}
                        <section className="border border-border bg-card p-5 sm:p-6 rounded-sm shadow-sm space-y-3">
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <Star className="size-4 text-primary" />
                                    <h3 className="text-sm font-bold text-foreground">Categories &amp; Creative Domains</h3>
                                </div>
                                <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider">
                                    {selectedCatIds.length} Selected
                                </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground mb-4">
                                Click to select categories. The star marks your primary category for discovery indexing.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {allCategories.map((c) => {
                                    const isSelected = selectedCatIds.includes(c.category_id)
                                    const isPrimary = primaryCatId === c.category_id

                                    return (
                                        <div
                                            key={c.category_id}
                                            onClick={() => toggleCategory(c.category_id)}
                                            className={`p-3 rounded-sm border transition-colors cursor-pointer text-left ${
                                                isSelected
                                                    ? 'border-primary/50 bg-primary/10 text-primary'
                                                    : 'border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-primary'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        if (!isSelected) toggleCategory(c.category_id)
                                                        setPrimaryCatId(c.category_id)
                                                    }}
                                                    className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer ${
                                                        isPrimary ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                                                    }`}
                                                >
                                                    <Star className={`size-3 ${isPrimary ? 'fill-primary' : ''}`} />
                                                    <span>{isPrimary ? 'PRIMARY' : 'SET PRIMARY'}</span>
                                                </button>
                                                {isSelected && <CheckCircle2 className="size-4 text-primary" />}
                                            </div>
                                            <span className="text-xs font-medium text-foreground">{c.category_name}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </section>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="lg:col-span-4 space-y-6">
                        <section className="border border-border bg-card p-5 sm:p-6 rounded-sm shadow-sm sticky top-24 space-y-5">
                            <div className="flex items-center gap-2 mb-1">
                                <ShieldCheckIcon className="size-4 text-primary" />
                                <h3 className="text-sm font-bold text-foreground">Commercial Terms</h3>
                            </div>

                            {/* Barter toggle */}
                            <div className="p-3 rounded-sm border border-border bg-muted/50 space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <LinkIcon className="size-3 text-primary" />
                                        <span className="text-xs font-bold text-foreground">
                                            Accept Barter Collabs
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setBarter(!barter)}
                                        aria-label="Toggle Barter"
                                        className={`w-11 h-6 flex items-center p-1 cursor-pointer transition-colors duration-150 rounded-full border ${
                                            barter ? 'bg-primary border-primary' : 'bg-background border-border'
                                        }`}
                                    >
                                        <div
                                            className={`bg-white size-4 transform transition-transform duration-150 rounded-full ${
                                                barter ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                        />
                                    </button>
                                </div>
                                <p className="text-[10px] text-muted-foreground">
                                    Allow hospitality brands to offer curated complimentary experiences in place of paid rates.
                                </p>
                            </div>

                            {/* Rate inputs */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                                    Minimum Paid Rate (₹)
                                </label>
                                <div className="flex items-end gap-1">
                                    <span className="text-xs font-medium text-muted-foreground">₹</span>
                                    <input
                                        type="text"
                                        value={minFloor}
                                        onChange={(e) => setMinFloor(e.target.value.replace(/\D/g, ''))}
                                        className="text-lg font-black text-foreground border-b border-border bg-transparent focus:outline-none focus:border-primary w-28 px-1"
                                    />
                                </div>
                                <p className="text-[10px] text-muted-foreground">
                                    Collaboration offers below this threshold will be flagged.
                                </p>
                            </div>

                            {saveMessage && (
                                <div className="p-3 border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-sm">
                                    ✓ {saveMessage}
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={handleDiscard}
                                    className="flex-1 border border-border bg-background text-muted-foreground text-xs font-bold px-4 py-3 rounded-sm transition-colors hover:bg-muted cursor-pointer"
                                >
                                    Discard
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-4 py-3 rounded-sm shadow-sm transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                                >
                                    {saving && <Loader2 className="size-3.5 animate-spin" />}
                                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                                </button>
                            </div>

                            {/* Completion Score */}
                            <div className="pt-4 border-t border-border flex items-center justify-between">
                                <div>
                                    <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">
                                        Profile Score
                                    </div>
                                    <div className="text-base font-black text-foreground">
                                        {completeness}% Completed
                                    </div>
                                </div>
                                <div className="size-9 rounded-sm bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                                    {completeness}%
                                </div>
                            </div>
                        </section>
                    </div>
                </form>
            )}
        </main>
    )
}
