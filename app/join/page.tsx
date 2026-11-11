'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
    Anchor,
    Camera,
    Check,
    Store,
    ArrowLeft,
    Loader2,
    CheckCircle2,
} from 'lucide-react'
import { Logo } from '@/components/logo'
import { AnimatedThemeToggler } from '@/registry/magicui/animated-theme-toggler'
import { INITIAL_LOCATIONS, INITIAL_CATEGORIES } from '@/lib/types'

function JoinContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const initialRole = searchParams.get('role') === 'business' || searchParams.get('role') === 'creator'
        ? (searchParams.get('role') as 'business' | 'creator')
        : null

    const [selectedRole, setSelectedRole] = useState<'business' | 'creator'>(initialRole || 'business')
    const [step, setStep] = useState<'select' | 'form'>('select')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    // Business form fields
    const [businessName, setBusinessName] = useState('')
    const [industry, setIndustry] = useState('Food & Dining')
    const [bizLocation, setBizLocation] = useState('loc-2')
    const [bizPhone, setBizPhone] = useState('')
    const [bizInstagram, setBizInstagram] = useState('')

    // Creator form fields
    const [fullName, setFullName] = useState('')
    const [creatorCategory, setCreatorCategory] = useState('cat-1')
    const [creatorLocation, setCreatorLocation] = useState('loc-1')
    const [creatorInstagram, setCreatorInstagram] = useState('')
    const [acceptsBarter, setAcceptsBarter] = useState(true)
    const [minPaidRate, setMinPaidRate] = useState('8500')
    const [creatorBio, setCreatorBio] = useState('')

    // Common auth fields
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleContinue = (role: 'business' | 'creator') => {
        if (role === 'business') {
            router.push('/register/business')
            return
        }
        setSelectedRole(role)
        setError(null)
        setStep('form')
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const payload = {
                email,
                password,
                role: selectedRole,
                businessData: selectedRole === 'business'
                    ? {
                        business_name: businessName,
                        industry,
                        location_id: bizLocation,
                        contact_phone: bizPhone,
                        instagram_handle: bizInstagram.startsWith('@') ? bizInstagram : `@${bizInstagram}`,
                    }
                    : undefined,
                creatorData: selectedRole === 'creator'
                    ? {
                        full_name: fullName,
                        location_id: creatorLocation,
                        category_id: creatorCategory,
                        bio: creatorBio,
                        accepts_barter: acceptsBarter,
                        min_paid_rate: parseInt(minPaidRate, 10) || 0,
                        instagram_handle: creatorInstagram.startsWith('@') ? creatorInstagram : `@${creatorInstagram}`,
                    }
                    : undefined,
            }

            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            const data = await res.json()
            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Registration failed')
            }

            setSuccessMessage(`Welcome to GoaConnect, ${selectedRole === 'business' ? businessName : fullName}! Your account has been created.`)
            setTimeout(() => {
                router.push(`/login?registered=${selectedRole}&email=${encodeURIComponent(email.trim())}&name=${encodeURIComponent(selectedRole === 'business' ? businessName : fullName)}`)
            }, 1200)
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'An error occurred'
            setError(msg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
            {/* Top Navigation */}
            <header className="border-b border-border/60 bg-background/90 backdrop-blur-md sticky top-0 z-30">
                <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <Logo />
                    </Link>

                    <div className="flex items-center gap-3">
                        <AnimatedThemeToggler className="flex size-9 items-center justify-center rounded-full border border-border bg-background text-foreground hover:bg-muted duration-150 cursor-pointer" />
                        <Link
                            href="/login"
                            className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Sign In
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 sm:py-16">
                <div className="w-full max-w-5xl">
                    {step === 'select' ? (
                        <>
                            {/* Header Section */}
                            <div className="flex flex-col items-center text-center space-y-3 mb-10 sm:mb-12">
                                {/* Top Badge */}
                                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                                    <Anchor className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                                    <span>COASTAL CREATIVE MARKETPLACE</span>
                                </div>

                                {/* Main Title */}
                                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
                                    Join GoaConnect
                                </h1>

                                {/* Subtitle */}
                                <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
                                    Select how you would like to use GoaConnect. Choose your account type to get started.
                                </p>
                            </div>

                            {/* Two Role Selection Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                                {/* Card 1: Business / Brand */}
                                <div
                                    onClick={() => setSelectedRole('business')}
                                    className={`relative rounded-3xl border bg-card p-8 sm:p-10 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                                        selectedRole === 'business'
                                            ? 'border-emerald-600/70 ring-2 ring-emerald-600/30'
                                            : 'border-border/80 hover:border-emerald-600/40'
                                    }`}
                                >
                                    <div>
                                        {/* Top Row: Icon + Radio Indicator */}
                                        <div className="flex items-center justify-between">
                                            <div className="size-12 rounded-2xl bg-teal-100 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300 flex items-center justify-center">
                                                <Store className="size-6" />
                                            </div>

                                            <div
                                                className={`size-5 rounded-full border-2 flex items-center justify-center ${
                                                    selectedRole === 'business'
                                                        ? 'border-emerald-700 dark:border-emerald-400'
                                                        : 'border-border'
                                                }`}
                                            >
                                                {selectedRole === 'business' && (
                                                    <span className="size-2.5 rounded-full bg-emerald-700 dark:bg-emerald-400" />
                                                )}
                                            </div>
                                        </div>

                                        {/* Title & Description */}
                                        <div className="mt-6 space-y-2">
                                            <h2 className="text-xl font-bold tracking-tight text-foreground">
                                                I&apos;m a Business / Brand
                                            </h2>
                                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                                For restaurants, cafes, hotels, nightlife spots, festivals, and brands in Goa looking to hire local creators.
                                            </p>
                                        </div>

                                        {/* Checklist */}
                                        <ul className="mt-6 space-y-3">
                                            {[
                                                'Discover 450+ verified creators in Panjim, Calangute, Assagao & more',
                                                'Direct booking with fixed deliverables & transparent pricing',
                                                'Filter by audience demographics, engagement rate, & Goan taluka',
                                                'Secure payments with campaign milestones & invoice management',
                                            ].map((text, idx) => (
                                                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90">
                                                    <span className="size-4 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300 flex items-center justify-center p-0.5 shrink-0 mt-0.5">
                                                        <Check className="size-3 stroke-[2.5]" />
                                                    </span>
                                                    <span>{text}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Action Button */}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleContinue('business')
                                        }}
                                        className="mt-8 w-full bg-[#0c4e40] hover:bg-[#08382e] text-white font-semibold rounded-xl h-12 text-sm flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors duration-150"
                                    >
                                        <span>Continue as Business</span>
                                        <span>&rarr;</span>
                                    </button>
                                </div>

                                {/* Card 2: Content Creator */}
                                <div
                                    onClick={() => setSelectedRole('creator')}
                                    className={`relative rounded-3xl border bg-card p-8 sm:p-10 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                                        selectedRole === 'creator'
                                            ? 'border-sky-600/70 ring-2 ring-sky-600/30'
                                            : 'border-border/80 hover:border-sky-600/40'
                                    }`}
                                >
                                    <div>
                                        {/* Top Row: Icon + Radio Indicator */}
                                        <div className="flex items-center justify-between">
                                            <div className="size-12 rounded-2xl bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300 flex items-center justify-center">
                                                <Camera className="size-6" />
                                            </div>

                                            <div
                                                className={`size-5 rounded-full border-2 flex items-center justify-center ${
                                                    selectedRole === 'creator'
                                                        ? 'border-sky-700 dark:border-sky-400'
                                                        : 'border-border'
                                                }`}
                                            >
                                                {selectedRole === 'creator' && (
                                                    <span className="size-2.5 rounded-full bg-sky-700 dark:bg-sky-400" />
                                                )}
                                            </div>
                                        </div>

                                        {/* Title & Description */}
                                        <div className="mt-6 space-y-2">
                                            <h2 className="text-xl font-bold tracking-tight text-foreground">
                                                I&apos;m a Content Creator
                                            </h2>
                                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                                For influencers, photographers, videographers, foodies, and storytellers based in or covering Goa.
                                            </p>
                                        </div>

                                        {/* Checklist */}
                                        <ul className="mt-6 space-y-3">
                                            {[
                                                'Get inbound booking requests from top Goan venues & brands',
                                                'Set your own rates (paid gigs and curated barter stays)',
                                                'Guaranteed on-time payouts with no payment chasing',
                                                'Professional portfolio page and verified badge',
                                            ].map((text, idx) => (
                                                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90">
                                                    <span className="size-4 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300 flex items-center justify-center p-0.5 shrink-0 mt-0.5">
                                                        <Check className="size-3 stroke-[2.5]" />
                                                    </span>
                                                    <span>{text}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Action Button */}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleContinue('creator')
                                        }}
                                        className="mt-8 w-full bg-[#035f85] hover:bg-[#024966] text-white font-semibold rounded-xl h-12 text-sm flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors duration-150"
                                    >
                                        <span>Continue as Creator</span>
                                        <span>&rarr;</span>
                                    </button>
                                </div>
                            </div>

                            {/* Sign In Link */}
                            <div className="mt-10 text-center text-xs sm:text-sm text-muted-foreground">
                                Already have an account?{' '}
                                <Link
                                    href="/login"
                                    className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                                >
                                    <span>Sign in here</span>
                                    <span>&rarr;</span>
                                </Link>
                            </div>
                        </>
                    ) : (
                        /* Step 2: Role-Specific Registration Form */
                        <div className="max-w-xl mx-auto rounded-3xl border border-border/80 bg-card p-8 sm:p-10 shadow-lg animate-in fade-in duration-200">
                            <button
                                type="button"
                                onClick={() => setStep('select')}
                                className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-6 cursor-pointer"
                            >
                                <ArrowLeft className="size-3.5" />
                                <span>Change account type</span>
                            </button>

                            <div className="space-y-2 mb-6">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                                    {selectedRole === 'business' ? 'Business Profile Registration' : 'Creator Profile Registration'}
                                </span>
                                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                                    {selectedRole === 'business' ? 'Set Up Your Brand on GoaConnect' : 'Create Your Creator Profile'}
                                </h2>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                    Fill in your details to start connecting across Goa.
                                </p>
                            </div>

                            {error && (
                                <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive mb-6">
                                    {error}
                                </div>
                            )}

                            {successMessage && (
                                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-center space-y-2 mb-6">
                                    <CheckCircle2 className="size-6 text-emerald-600 dark:text-emerald-400 mx-auto" />
                                    <div className="text-sm font-bold text-foreground">{successMessage}</div>
                                    <p className="text-xs text-muted-foreground">Redirecting you to the platform...</p>
                                </div>
                            )}

                            {!successMessage && (
                                <form onSubmit={handleRegister} className="space-y-4">
                                    {selectedRole === 'business' ? (
                                        <>
                                            <div className="space-y-1">
                                                <label className="text-xs font-medium text-foreground">Business / Brand Name</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={businessName}
                                                    onChange={(e) => setBusinessName(e.target.value)}
                                                    placeholder="e.g. Café Palmeira, Antares, Assagao Boutique Villa"
                                                    className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <label className="text-xs font-medium text-foreground">Industry</label>
                                                    <select
                                                        value={industry}
                                                        onChange={(e) => setIndustry(e.target.value)}
                                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                    >
                                                        <option value="Food & Dining">Café &amp; Dining</option>
                                                        <option value="Boutique Resorts">Boutique Stays &amp; Villas</option>
                                                        <option value="Nightlife & Music">Nightlife &amp; Beach Club</option>
                                                        <option value="Travel & Adventure">Water Sports &amp; Adventure</option>
                                                        <option value="Fashion & Lifestyle">Lifestyle &amp; Fashion Brand</option>
                                                        <option value="Yoga & Wellness">Spa &amp; Wellness</option>
                                                    </select>
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="text-xs font-medium text-foreground">Location in Goa</label>
                                                    <select
                                                        value={bizLocation}
                                                        onChange={(e) => setBizLocation(e.target.value)}
                                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                    >
                                                        {INITIAL_LOCATIONS.map((loc) => (
                                                            <option key={loc.location_id} value={loc.location_id}>
                                                                {loc.area_name} ({loc.district})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <label className="text-xs font-medium text-foreground">Contact Phone</label>
                                                    <input
                                                        type="tel"
                                                        required
                                                        value={bizPhone}
                                                        onChange={(e) => setBizPhone(e.target.value)}
                                                        placeholder="+91 98221 00000"
                                                        className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                    />
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="text-xs font-medium text-foreground">Instagram Handle</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={bizInstagram}
                                                        onChange={(e) => setBizInstagram(e.target.value)}
                                                        placeholder="@yourbrand"
                                                        className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="space-y-1">
                                                <label className="text-xs font-medium text-foreground">Full Name</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={fullName}
                                                    onChange={(e) => setFullName(e.target.value)}
                                                    placeholder="e.g. Rahul Naik, Sneha Fernandes"
                                                    className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-sky-500"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <label className="text-xs font-medium text-foreground">Primary Niche</label>
                                                    <select
                                                        value={creatorCategory}
                                                        onChange={(e) => setCreatorCategory(e.target.value)}
                                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-sky-500"
                                                    >
                                                        {INITIAL_CATEGORIES.map((cat) => (
                                                            <option key={cat.category_id} value={cat.category_id}>
                                                                {cat.category_name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="text-xs font-medium text-foreground">Base Location</label>
                                                    <select
                                                        value={creatorLocation}
                                                        onChange={(e) => setCreatorLocation(e.target.value)}
                                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-sky-500"
                                                    >
                                                        {INITIAL_LOCATIONS.map((loc) => (
                                                            <option key={loc.location_id} value={loc.location_id}>
                                                                {loc.area_name} ({loc.district})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <label className="text-xs font-medium text-foreground">Instagram Handle</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={creatorInstagram}
                                                        onChange={(e) => setCreatorInstagram(e.target.value)}
                                                        placeholder="@rahul.goanbites"
                                                        className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-sky-500"
                                                    />
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="text-xs font-medium text-foreground">Base Rate per Reel (₹)</label>
                                                    <input
                                                        type="number"
                                                        required
                                                        value={minPaidRate}
                                                        onChange={(e) => setMinPaidRate(e.target.value)}
                                                        placeholder="8500"
                                                        className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-sky-500"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-xs font-medium text-foreground">Short Bio</label>
                                                <textarea
                                                    rows={2}
                                                    value={creatorBio}
                                                    onChange={(e) => setCreatorBio(e.target.value)}
                                                    placeholder="Tell Goan brands what you create (e.g. Goan culinary heritage & cafe reviews)"
                                                    className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-sky-500"
                                                />
                                            </div>

                                            <div className="flex items-center gap-2 pt-1">
                                                <input
                                                    type="checkbox"
                                                    id="barter"
                                                    checked={acceptsBarter}
                                                    onChange={(e) => setAcceptsBarter(e.target.checked)}
                                                    className="size-4 rounded border-border text-sky-600 focus:ring-sky-500 cursor-pointer"
                                                />
                                                <label htmlFor="barter" className="text-xs text-foreground cursor-pointer select-none">
                                                    Open to curated barter collaborations (resort stays &amp; dining experiences)
                                                </label>
                                            </div>
                                        </>
                                    )}

                                    {/* Account Credentials */}
                                    <div className="pt-2 border-t border-border/60 space-y-3">
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-foreground">Email Address</label>
                                            <input
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="you@domain.com"
                                                className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-foreground">Password (min 6 chars)</label>
                                            <input
                                                type="password"
                                                required
                                                minLength={6}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`w-full font-semibold rounded-xl h-12 text-sm flex items-center justify-center gap-2 shadow-xs cursor-pointer text-white mt-6 transition-colors duration-150 ${
                                            selectedRole === 'business'
                                                ? 'bg-[#0c4e40] hover:bg-[#08382e]'
                                                : 'bg-[#035f85] hover:bg-[#024966]'
                                        }`}
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="size-4 animate-spin" />
                                                <span>Creating Account...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Complete {selectedRole === 'business' ? 'Business' : 'Creator'} Registration</span>
                                                <span>&rarr;</span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

export default function JoinPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
                <Loader2 className="size-6 animate-spin text-emerald-700 dark:text-emerald-400" />
            </div>
        }>
            <JoinContent />
        </Suspense>
    )
}
