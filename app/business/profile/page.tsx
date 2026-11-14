'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
    Store,
    MapPin,
    Phone,
    Camera,
    Building2,
    FileText,
    ShieldCheck,
    CheckCircle2,
    AlertCircle,
    Loader2,
    RefreshCw,
    Save,
    RotateCcw,
    ExternalLink,
    Mail,
    Check,
} from 'lucide-react'

function InstagramIcon({ className = 'size-4' }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
    )
}

interface UserData {
    user_id: number
    email: string
    role: string
    is_verified: boolean
    created_at?: string
}

interface BusinessProfile {
    business_id: number
    user_id: number
    business_name: string
    industry: string
    description: string | null
    contact_phone: string | null
    instagram_handle: string | null
    location_id: number
    area_name?: string
    taluka?: string
    district?: string
}

interface LocationOption {
    location_id: number
    area_name: string
    taluka: string
    district: string
}

type GroupedLocations = Record<string, Record<string, { location_id: number; area_name: string }[]>>

interface FormErrors {
    business_name?: string
    industry?: string
    contact_phone?: string
    instagram_handle?: string
    location_id?: string
    description?: string
}

const COMMON_INDUSTRIES = [
    'Food & Beach Dining',
    'Hospitality & Luxury Stays',
    'Nightlife & Sunsets',
    'Wellness, Yoga & Surf',
    'Goan Heritage & Culture',
    'Resort Fashion & Boutiques',
    'Artisanal Goods & Cafes',
    'Adventure & Water Sports',
    'Real Estate & Architecture',
    'Events & Live Entertainment',
]

export default function BusinessProfileEditorPage() {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)
    const [saveError, setSaveError] = useState<string | null>(null)

    // Raw loaded data
    const [user, setUser] = useState<UserData | null>(null)
    const [originalProfile, setOriginalProfile] = useState<BusinessProfile | null>(null)
    const [groupedLocations, setGroupedLocations] = useState<GroupedLocations>({})
    const [flatLocations, setFlatLocations] = useState<LocationOption[]>([])

    // Controlled Form State
    const [businessName, setBusinessName] = useState('')
    const [industry, setIndustry] = useState('')
    const [customIndustry, setCustomIndustry] = useState('')
    const [description, setDescription] = useState('')
    const [contactPhone, setContactPhone] = useState('')
    const [instagramHandle, setInstagramHandle] = useState('')
    const [locationId, setLocationId] = useState<number | ''>('')

    // Inline Errors
    const [errors, setErrors] = useState<FormErrors>({})
    const [touched, setTouched] = useState<Record<string, boolean>>({})

    const fetchProfileAndLocations = async () => {
        setLoading(true)
        setError(null)
        try {
            const [profileRes, locRes] = await Promise.all([
                fetch('/api/profile', { credentials: 'include' }),
                fetch('/api/locations'),
            ])

            if (locRes.ok) {
                const locData = await locRes.json()
                if (locData.data) {
                    setGroupedLocations(locData.data)
                    const flat: LocationOption[] = []
                    Object.entries(locData.data as GroupedLocations).forEach(([district, talukas]) => {
                        Object.entries(talukas).forEach(([taluka, areas]) => {
                            areas.forEach((a) => {
                                flat.push({
                                    location_id: a.location_id,
                                    area_name: a.area_name,
                                    taluka,
                                    district,
                                })
                            })
                        })
                    })
                    setFlatLocations(flat)
                }
            }

            if (!profileRes.ok) {
                const data = await profileRes.json().catch(() => ({}))
                throw new Error(data.error || 'Failed to load business profile.')
            }

            const pData = await profileRes.json()
            if (pData.success && pData.data) {
                setUser(pData.data.user || null)
                const prof: BusinessProfile | null = pData.data.profile || null
                setOriginalProfile(prof)

                if (prof) {
                    setBusinessName(prof.business_name || '')
                    const ind = prof.industry || ''
                    if (COMMON_INDUSTRIES.includes(ind)) {
                        setIndustry(ind)
                        setCustomIndustry('')
                    } else if (ind) {
                        setIndustry('Other')
                        setCustomIndustry(ind)
                    } else {
                        setIndustry(COMMON_INDUSTRIES[0])
                        setCustomIndustry('')
                    }
                    setDescription(prof.description || '')
                    setContactPhone(prof.contact_phone || '')
                    setInstagramHandle(prof.instagram_handle ? prof.instagram_handle.replace(/^@/, '') : '')
                    setLocationId(prof.location_id || '')
                }
            } else {
                throw new Error(pData.error || 'Invalid profile response')
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error fetching profile data')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProfileAndLocations()
    }, [])

    // Real-time validation
    const validate = (): boolean => {
        const nextErrors: FormErrors = {}

        if (!businessName.trim()) {
            nextErrors.business_name = 'Business brand name is required.'
        } else if (businessName.trim().length < 2) {
            nextErrors.business_name = 'Business name must be at least 2 characters.'
        }

        const effectiveIndustry = industry === 'Other' ? customIndustry.trim() : industry.trim()
        if (!effectiveIndustry) {
            nextErrors.industry = 'Please select or specify your primary industry.'
        }

        if (!locationId || Number(locationId) <= 0) {
            nextErrors.location_id = 'Please select a primary Goan locality/area.'
        }

        if (contactPhone.trim()) {
            // Clean phone characters
            const cleaned = contactPhone.replace(/[\s\-\(\)\+]/g, '')
            if (cleaned.length < 8 || !/^\d+$/.test(cleaned)) {
                nextErrors.contact_phone = 'Please enter a valid phone number (e.g. +91 98221 44556).'
            }
        } else {
            nextErrors.contact_phone = 'Contact phone number is required for booking confirmations.'
        }

        if (instagramHandle.trim()) {
            const handleClean = instagramHandle.trim().replace(/^@/, '')
            if (!/^[a-zA-Z0-9._]{1,30}$/.test(handleClean)) {
                nextErrors.instagram_handle = 'Valid Instagram handle without spaces (e.g. cafepalmeiragoa).'
            }
        }

        if (description.trim() && description.trim().length > 1000) {
            nextErrors.description = 'Description cannot exceed 1000 characters.'
        }

        setErrors(nextErrors)
        return Object.keys(nextErrors).length === 0
    }

    const markTouched = (field: string) => {
        setTouched((prev) => ({ ...prev, [field]: true }))
        validate()
    }

    useEffect(() => {
        if (!loading) {
            validate()
        }
    }, [businessName, industry, customIndustry, locationId, contactPhone, instagramHandle, description, loading])

    const handleDiscard = () => {
        if (!originalProfile) return
        setBusinessName(originalProfile.business_name || '')
        const ind = originalProfile.industry || ''
        if (COMMON_INDUSTRIES.includes(ind)) {
            setIndustry(ind)
            setCustomIndustry('')
        } else if (ind) {
            setIndustry('Other')
            setCustomIndustry(ind)
        } else {
            setIndustry(COMMON_INDUSTRIES[0])
            setCustomIndustry('')
        }
        setDescription(originalProfile.description || '')
        setContactPhone(originalProfile.contact_phone || '')
        setInstagramHandle(originalProfile.instagram_handle ? originalProfile.instagram_handle.replace(/^@/, '') : '')
        setLocationId(originalProfile.location_id || '')
        setErrors({})
        setTouched({})
        setSaveError(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setTouched({
            business_name: true,
            industry: true,
            contact_phone: true,
            instagram_handle: true,
            location_id: true,
            description: true,
        })

        if (!validate()) {
            setSaveError('Please resolve the highlighted validation errors below.')
            return
        }

        setSaving(true)
        setSaveSuccess(false)
        setSaveError(null)

        const effectiveIndustry = industry === 'Other' ? customIndustry.trim() : industry.trim()
        const effectiveHandle = instagramHandle.trim()
            ? `@${instagramHandle.trim().replace(/^@/, '')}`
            : null

        const payload = {
            business_name: businessName.trim(),
            industry: effectiveIndustry,
            description: description.trim() || null,
            contact_phone: contactPhone.trim() || null,
            instagram_handle: effectiveHandle,
            location_id: Number(locationId),
        }

        try {
            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload),
            })

            const data = await res.json()

            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Failed to update business profile.')
            }

            setSaveSuccess(true)
            // Update original profile
            const selectedLoc = flatLocations.find((l) => l.location_id === Number(locationId))
            setOriginalProfile((prev) =>
                prev
                    ? {
                          ...prev,
                          ...payload,
                          area_name: selectedLoc?.area_name,
                          taluka: selectedLoc?.taluka,
                          district: selectedLoc?.district,
                      }
                    : null
            )

            setTimeout(() => {
                setSaveSuccess(false)
            }, 4000)
        } catch (err) {
            setSaveError(err instanceof Error ? err.message : 'Error updating business profile.')
        } finally {
            setSaving(false)
        }
    }

    // Selected location details for live preview
    const selectedLocationObj = flatLocations.find((l) => l.location_id === Number(locationId))

    // Check completeness
    const completenessSteps = [
        { label: 'Brand Name', done: Boolean(businessName.trim()) },
        { label: 'Industry Assigned', done: Boolean(industry && (industry !== 'Other' || customIndustry.trim())) },
        { label: 'Goan Location Selected', done: Boolean(locationId) },
        { label: 'Contact Phone Verified', done: Boolean(contactPhone.trim() && !errors.contact_phone) },
        { label: 'Instagram Handle', done: Boolean(instagramHandle.trim()) },
        { label: 'Brand Story / Bio', done: Boolean(description.trim()) },
    ]
    const completedCount = completenessSteps.filter((s) => s.done).length
    const completenessPercent = Math.round((completedCount / completenessSteps.length) * 100)

    // LOADING STATE
    if (loading) {
        return (
            <main className="space-y-6">
                <div className="border border-border bg-card p-6 rounded-none animate-pulse space-y-4">
                    <div className="h-6 bg-muted w-1/4" />
                    <div className="h-4 bg-muted w-1/2" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 border border-border bg-card p-6 rounded-none animate-pulse space-y-6">
                        <div className="h-10 bg-muted w-full" />
                        <div className="h-10 bg-muted w-full" />
                        <div className="h-24 bg-muted w-full" />
                    </div>
                    <div className="border border-border bg-card p-6 rounded-none animate-pulse space-y-4">
                        <div className="h-40 bg-muted w-full" />
                    </div>
                </div>
            </main>
        )
    }

    // ERROR STATE
    if (error) {
        return (
            <main className="space-y-6">
                <div className="border border-destructive/30 bg-destructive/5 p-8 rounded-none text-center space-y-4">
                    <AlertCircle className="size-10 text-destructive mx-auto" />
                    <h2 className="text-lg font-bold text-foreground">Failed to Load Business Profile</h2>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">{error}</p>
                    <button
                        type="button"
                        onClick={fetchProfileAndLocations}
                        className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold text-xs px-4 py-2 rounded-none hover:bg-primary/90 transition-colors cursor-pointer"
                    >
                        <RefreshCw className="size-3.5" />
                        Retry Loading
                    </button>
                </div>
            </main>
        )
    }

    // EMPTY STATE (No profile record in DB)
    if (!originalProfile) {
        return (
            <main className="space-y-6">
                <div className="border border-border bg-card p-10 rounded-none text-center space-y-4 shadow-sm">
                    <Store className="size-12 text-primary mx-auto" />
                    <h2 className="text-lg font-bold text-foreground">No Business Profile Registered</h2>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        Your account ({user?.email}) is currently not linked to an active business profile record.
                    </p>
                    <Link
                        href="/business/dashboard"
                        className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-xs font-bold px-4 py-2 rounded-none hover:bg-primary/90 transition-colors"
                    >
                        Return to Dashboard
                    </Link>
                </div>
            </main>
        )
    }

    return (
        <main className="space-y-8">
            {/* Header Breadcrumb & Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                <div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <Link href="/business/dashboard" className="hover:text-primary transition-colors">
                            Business Console
                        </Link>
                        <span>/</span>
                        <span className="text-foreground font-semibold">Brand Profile Settings</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-black tracking-tight text-foreground">
                            {businessName || 'Business Profile'}
                        </h1>
                        {user?.is_verified && (
                            <span className="inline-flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold px-2 py-0.5 rounded-none uppercase tracking-wide">
                                <CheckCircle2 className="size-3" />
                                Verified Business
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Manage your official establishment details, industry focus, and contact channel shown to Goan creators.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={handleDiscard}
                        disabled={saving}
                        className="inline-flex items-center gap-1.5 border border-border bg-background hover:bg-muted text-foreground text-xs font-bold px-3 py-2 rounded-none transition-colors disabled:opacity-50 cursor-pointer"
                    >
                        <RotateCcw className="size-3.5" />
                        Reset
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={saving}
                        className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-4 py-2 rounded-none transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                    >
                        {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                        {saving ? 'Saving...' : 'Save Profile'}
                    </button>
                </div>
            </div>

            {/* Notification Banners */}
            {saveSuccess && (
                <div className="border border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 p-4 rounded-none flex items-center justify-between gap-3 text-xs font-bold">
                    <div className="flex items-center gap-2">
                        <Check className="size-4 shrink-0" />
                        <span>Business profile saved and published successfully!</span>
                    </div>
                    <span className="text-[11px] opacity-75 font-mono">Changes live immediately</span>
                </div>
            )}

            {saveError && (
                <div className="border border-destructive/30 bg-destructive/10 text-destructive p-4 rounded-none flex items-center gap-2 text-xs font-bold">
                    <AlertCircle className="size-4 shrink-0" />
                    <span>{saveError}</span>
                </div>
            )}

            {/* Main Form & Live Preview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Column (2 Cols) */}
                <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
                    {/* Establishment Core Details */}
                    <div className="border border-border bg-card p-6 rounded-none space-y-5 shadow-sm">
                        <div className="flex items-center gap-2 pb-3 border-b border-border">
                            <Store className="size-4 text-primary" />
                            <h2 className="text-sm font-extrabold uppercase tracking-wide text-foreground">
                                Establishment Details
                            </h2>
                        </div>

                        {/* Business Name */}
                        <div className="space-y-1.5">
                            <label htmlFor="business_name" className="block text-xs font-bold text-foreground">
                                Brand / Establishment Name <span className="text-destructive">*</span>
                            </label>
                            <input
                                id="business_name"
                                type="text"
                                value={businessName}
                                onChange={(e) => {
                                    setBusinessName(e.target.value)
                                    if (touched.business_name) validate()
                                }}
                                onBlur={() => markTouched('business_name')}
                                placeholder="e.g. Café Palmeira, Gunpowder, Antares"
                                className={`w-full bg-background border px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-1 rounded-none transition-colors ${
                                    touched.business_name && errors.business_name
                                        ? 'border-destructive focus:ring-destructive'
                                        : 'border-border focus:border-primary focus:ring-primary'
                                }`}
                            />
                            {touched.business_name && errors.business_name && (
                                <p className="text-[11px] font-bold text-destructive flex items-center gap-1 mt-1">
                                    <AlertCircle className="size-3 shrink-0" />
                                    {errors.business_name}
                                </p>
                            )}
                            <p className="text-[11px] text-muted-foreground">
                                The official name visible on creator requests and collaboration agreements.
                            </p>
                        </div>

                        {/* Industry */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label htmlFor="industry" className="block text-xs font-bold text-foreground">
                                    Primary Industry / Sector <span className="text-destructive">*</span>
                                </label>
                                <select
                                    id="industry"
                                    value={industry}
                                    onChange={(e) => {
                                        setIndustry(e.target.value)
                                        if (touched.industry) validate()
                                    }}
                                    onBlur={() => markTouched('industry')}
                                    className={`w-full bg-background border px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 rounded-none transition-colors ${
                                        touched.industry && errors.industry
                                            ? 'border-destructive focus:ring-destructive'
                                            : 'border-border focus:border-primary focus:ring-primary'
                                    }`}
                                >
                                    <option value="">Select industry category...</option>
                                    {COMMON_INDUSTRIES.map((ind) => (
                                        <option key={ind} value={ind}>
                                            {ind}
                                        </option>
                                    ))}
                                    <option value="Other">Other (Specify below)</option>
                                </select>
                                {touched.industry && errors.industry && (
                                    <p className="text-[11px] font-bold text-destructive flex items-center gap-1 mt-1">
                                        <AlertCircle className="size-3 shrink-0" />
                                        {errors.industry}
                                    </p>
                                )}
                            </div>

                            {/* Custom industry if Other */}
                            {industry === 'Other' && (
                                <div className="space-y-1.5">
                                    <label htmlFor="custom_industry" className="block text-xs font-bold text-foreground">
                                        Custom Industry Title <span className="text-destructive">*</span>
                                    </label>
                                    <input
                                        id="custom_industry"
                                        type="text"
                                        value={customIndustry}
                                        onChange={(e) => setCustomIndustry(e.target.value)}
                                        placeholder="e.g. Eco-Farming & Distilling"
                                        className="w-full bg-background border border-border px-3.5 py-2 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary rounded-none transition-colors"
                                    />
                                </div>
                            )}

                            {/* Goan Location */}
                            <div className={industry === 'Other' ? 'md:col-span-2 space-y-1.5' : 'space-y-1.5'}>
                                <label htmlFor="location_id" className="block text-xs font-bold text-foreground">
                                    Goa Location / Area <span className="text-destructive">*</span>
                                </label>
                                <select
                                    id="location_id"
                                    value={locationId}
                                    onChange={(e) => {
                                        setLocationId(e.target.value ? Number(e.target.value) : '')
                                        if (touched.location_id) validate()
                                    }}
                                    onBlur={() => markTouched('location_id')}
                                    className={`w-full bg-background border px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 rounded-none transition-colors ${
                                        touched.location_id && errors.location_id
                                            ? 'border-destructive focus:ring-destructive'
                                            : 'border-border focus:border-primary focus:ring-primary'
                                    }`}
                                >
                                    <option value="">Select your Goan area...</option>
                                    {Object.entries(groupedLocations).map(([district, talukas]) => (
                                        <optgroup key={district} label={`-- ${district} --`}>
                                            {Object.entries(talukas).map(([taluka, areas]) =>
                                                areas.map((a) => (
                                                    <option key={a.location_id} value={a.location_id}>
                                                        {a.area_name} ({taluka}, {district})
                                                    </option>
                                                ))
                                            )}
                                        </optgroup>
                                    ))}
                                </select>
                                {touched.location_id && errors.location_id && (
                                    <p className="text-[11px] font-bold text-destructive flex items-center gap-1 mt-1">
                                        <AlertCircle className="size-3 shrink-0" />
                                        {errors.location_id}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Description / Brand Story */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label htmlFor="description" className="block text-xs font-bold text-foreground">
                                    Brand Description / Experience Story
                                </label>
                                <span className="text-[10px] text-muted-foreground font-mono">
                                    {description.length}/1000
                                </span>
                            </div>
                            <textarea
                                id="description"
                                rows={4}
                                value={description}
                                onChange={(e) => {
                                    setDescription(e.target.value)
                                    if (touched.description) validate()
                                }}
                                onBlur={() => markTouched('description')}
                                placeholder="Highlight your heritage background, cuisine specialties, boutique amenities, ambiance, and what kind of creator collabs you welcome..."
                                className={`w-full bg-background border px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 rounded-none transition-colors resize-y ${
                                    touched.description && errors.description
                                        ? 'border-destructive focus:ring-destructive'
                                        : 'border-border focus:border-primary focus:ring-primary'
                                }`}
                            />
                            {touched.description && errors.description && (
                                <p className="text-[11px] font-bold text-destructive flex items-center gap-1 mt-1">
                                    <AlertCircle className="size-3 shrink-0" />
                                    {errors.description}
                                </p>
                            )}
                            <p className="text-[11px] text-muted-foreground">
                                This summary helps Goan creators evaluate whether your brand matches their aesthetic and audience.
                            </p>
                        </div>
                    </div>

                    {/* Contact & Social Presence */}
                    <div className="border border-border bg-card p-6 rounded-none space-y-5 shadow-sm">
                        <div className="flex items-center gap-2 pb-3 border-b border-border">
                            <Phone className="size-4 text-primary" />
                            <h2 className="text-sm font-extrabold uppercase tracking-wide text-foreground">
                                Direct Contact & Social Links
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Contact Phone */}
                            <div className="space-y-1.5">
                                <label htmlFor="contact_phone" className="block text-xs font-bold text-foreground">
                                    Establishment Phone / WhatsApp <span className="text-destructive">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                                        <Phone className="size-4" />
                                    </span>
                                    <input
                                        id="contact_phone"
                                        type="tel"
                                        value={contactPhone}
                                        onChange={(e) => {
                                            setContactPhone(e.target.value)
                                            if (touched.contact_phone) validate()
                                        }}
                                        onBlur={() => markTouched('contact_phone')}
                                        placeholder="+91 98221 44556"
                                        className={`w-full bg-background border pl-10 pr-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-1 rounded-none transition-colors ${
                                            touched.contact_phone && errors.contact_phone
                                                ? 'border-destructive focus:ring-destructive'
                                                : 'border-border focus:border-primary focus:ring-primary'
                                        }`}
                                    />
                                </div>
                                {touched.contact_phone && errors.contact_phone && (
                                    <p className="text-[11px] font-bold text-destructive flex items-center gap-1 mt-1">
                                        <AlertCircle className="size-3 shrink-0" />
                                        {errors.contact_phone}
                                    </p>
                                )}
                                <p className="text-[11px] text-muted-foreground">
                                    Used for shoot day logistics and direct coordination with confirmed creators.
                                </p>
                            </div>

                            {/* Instagram Handle */}
                            <div className="space-y-1.5">
                                <label htmlFor="instagram_handle" className="block text-xs font-bold text-foreground">
                                    Instagram Handle
                                </label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground font-mono font-bold text-xs">
                                        @
                                    </span>
                                    <input
                                        id="instagram_handle"
                                        type="text"
                                        value={instagramHandle}
                                        onChange={(e) => {
                                            setInstagramHandle(e.target.value.replace(/^@/, ''))
                                            if (touched.instagram_handle) validate()
                                        }}
                                        onBlur={() => markTouched('instagram_handle')}
                                        placeholder="cafepalmeiragoa"
                                        className={`w-full bg-background border pl-8 pr-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-1 rounded-none transition-colors font-mono ${
                                            touched.instagram_handle && errors.instagram_handle
                                                ? 'border-destructive focus:ring-destructive'
                                                : 'border-border focus:border-primary focus:ring-primary'
                                        }`}
                                    />
                                </div>
                                {touched.instagram_handle && errors.instagram_handle && (
                                    <p className="text-[11px] font-bold text-destructive flex items-center gap-1 mt-1">
                                        <AlertCircle className="size-3 shrink-0" />
                                        {errors.instagram_handle}
                                    </p>
                                )}
                                <p className="text-[11px] text-muted-foreground">
                                    Allows creators to tag your business profile in collaborated reels and stories.
                                </p>
                            </div>
                        </div>

                        {/* Account Email (Read-only) */}
                        <div className="pt-2 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Mail className="size-3.5 text-primary" />
                                <span>Login Email:</span>
                                <span className="font-mono font-bold text-foreground">{user?.email}</span>
                            </div>
                            <span className="text-[11px] text-muted-foreground">
                                (Managed via authentication account)
                            </span>
                        </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleDiscard}
                            disabled={saving}
                            className="border border-border bg-background hover:bg-muted text-foreground text-xs font-bold px-4 py-2.5 rounded-none transition-colors disabled:opacity-50 cursor-pointer"
                        >
                            Discard Changes
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-6 py-2.5 rounded-none transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                        >
                            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                            {saving ? 'Saving...' : 'Save Profile Changes'}
                        </button>
                    </div>
                </form>

                {/* Sidebar Column (1 Col): Live Preview & Readiness */}
                <div className="space-y-6">
                    {/* Live Creator-Facing Preview Card */}
                    <div className="border border-border bg-card p-6 rounded-none shadow-sm space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-border">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                                Creator View Preview
                            </span>
                            <span className="inline-flex items-center gap-1 text-[10px] text-primary font-bold">
                                Live Preview
                            </span>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <h3 className="text-base font-extrabold text-foreground leading-snug">
                                        {businessName.trim() || 'Establishment Name'}
                                    </h3>
                                    <span className="inline-block bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold px-2 py-0.5 rounded-none uppercase mt-1">
                                        {industry === 'Other' ? customIndustry.trim() || 'Other' : industry || 'Uncategorized'}
                                    </span>
                                </div>
                                {user?.is_verified && (
                                    <ShieldCheck className="size-5 text-primary shrink-0" />
                                )}
                            </div>

                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <MapPin className="size-3.5 text-primary shrink-0" />
                                <span>
                                    {selectedLocationObj
                                        ? `${selectedLocationObj.area_name}, ${selectedLocationObj.taluka} (${selectedLocationObj.district})`
                                        : 'Goa Location'}
                                </span>
                            </div>

                            {contactPhone.trim() && (
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Phone className="size-3.5 text-primary shrink-0" />
                                    <span className="font-mono">{contactPhone.trim()}</span>
                                </div>
                            )}

                            {instagramHandle.trim() && (
                                <div className="flex items-center gap-1.5 text-xs">
                                    <InstagramIcon className="size-3.5 text-primary shrink-0" />
                                    <a
                                        href={`https://instagram.com/${instagramHandle.trim().replace(/^@/, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline font-mono inline-flex items-center gap-1"
                                    >
                                        @{instagramHandle.trim().replace(/^@/, '')}
                                        <ExternalLink className="size-2.5" />
                                    </a>
                                </div>
                            )}

                            <div className="pt-2 border-t border-border">
                                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4">
                                    {description.trim() ||
                                        'Provide an establishment description and heritage context to highlight your brand story to creators.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Profile Readiness Checklist */}
                    <div className="border border-border bg-card p-6 rounded-none shadow-sm space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-border">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                                Brand Readiness
                            </span>
                            <span className="text-xs font-mono font-extrabold text-primary">
                                {completenessPercent}%
                            </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-muted h-2 rounded-none overflow-hidden">
                            <div
                                className="bg-primary h-full transition-all duration-300"
                                style={{ width: `${completenessPercent}%` }}
                            />
                        </div>

                        <div className="space-y-2 pt-1 text-xs">
                            {completenessSteps.map((step, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                    <span className={step.done ? 'text-foreground' : 'text-muted-foreground'}>
                                        {step.label}
                                    </span>
                                    {step.done ? (
                                        <CheckCircle2 className="size-3.5 text-primary" />
                                    ) : (
                                        <span className="size-2 bg-muted-foreground/30 rounded-none inline-block" />
                                    )}
                                </div>
                            ))}
                        </div>

                        <p className="text-[11px] text-muted-foreground pt-2 border-t border-border leading-normal">
                            High-completeness business profiles receive up to 3x faster collaboration responses from vetted Goan creators.
                        </p>
                    </div>

                    {/* Helpful Tips Card */}
                    <div className="border border-border bg-muted/30 p-5 rounded-none space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                            <Building2 className="size-3.5 text-primary" />
                            <span>Goan Creator Collaborations</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                            Creators browse your location and industry to ensure authentic local storytelling. Keep your phone number current for immediate on-site coordination.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    )
}
