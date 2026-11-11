'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
    Building2,
    CheckCircle2,
    Eye,
    EyeOff,
    Globe,
    Key,
    Link2,
    Loader2,
    Lock,
    MapPin,
    ShieldCheck,
    Sparkles,
    Store,
} from 'lucide-react'
import { Logo } from '@/components/logo'
import { AnimatedThemeToggler } from '@/registry/magicui/animated-theme-toggler'
import { INITIAL_LOCATIONS, INITIAL_CATEGORIES } from '@/lib/types'

export default function RegisterBusinessPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Form fields matching Image 1 & 2
    const [businessName, setBusinessName] = useState('')
    const [industry, setIndustry] = useState('')
    const [locationId, setLocationId] = useState('')
    const [description, setDescription] = useState('')
    const [contactPhone, setContactPhone] = useState('')
    const [instagramHandle, setInstagramHandle] = useState('')
    const [websiteUrl, setWebsiteUrl] = useState('')
    const [workEmail, setWorkEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [agreedToTerms, setAgreedToTerms] = useState(false)

    // Password strength calculation
    const getPasswordStrength = (pass: string) => {
        if (!pass) return { label: 'EMPTY', pct: 0, color: 'bg-muted' }
        if (pass.length < 6) return { label: 'WEAK', pct: 25, color: 'bg-red-500' }
        if (pass.length < 10) return { label: 'MEDIUM', pct: 60, color: 'bg-amber-500' }
        return { label: 'STRONG', pct: 100, color: 'bg-emerald-500' }
    }

    const strength = getPasswordStrength(password)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!businessName.trim()) {
            setError('Please enter your business name.')
            return
        }
        if (!industry) {
            setError('Please select an industry category.')
            return
        }
        if (!locationId) {
            setError('Please select your location / taluka in Goa.')
            return
        }
        if (!contactPhone.trim()) {
            setError('Please enter a contact phone number.')
            return
        }
        if (!workEmail.trim()) {
            setError('Please enter your work email.')
            return
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters.')
            return
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.')
            return
        }
        if (!agreedToTerms) {
            setError('You must agree to the Terms of Service and Privacy Policy.')
            return
        }

        setLoading(true)

        try {
            const formattedInstagram = instagramHandle.trim().startsWith('@')
                ? instagramHandle.trim()
                : `@${instagramHandle.trim()}`

            const payload = {
                email: workEmail.trim(),
                password,
                role: 'business',
                businessData: {
                    business_name: businessName.trim(),
                    industry,
                    location_id: locationId,
                    description: description.trim(),
                    contact_phone: contactPhone.trim(),
                    instagram_handle: formattedInstagram,
                    website_url: websiteUrl.trim(),
                },
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

            // Successfully created business profile -> open Image 3 & 4 (Login page with pre-filled email and success banner)
            router.push(`/login?registered=business&email=${encodeURIComponent(workEmail.trim())}&name=${encodeURIComponent(businessName.trim())}`)
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Registration failed'
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
                            className="text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                        >
                            Sign In
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Form Content */}
            <main className="flex-1 flex flex-col items-center px-4 sm:px-6 py-10 sm:py-14">
                <div className="w-full max-w-3xl space-y-8">
                    {/* Header Progress Bar & Badge (Image 1 top) */}
                    <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                                <span className="size-6 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold shrink-0">
                                    1
                                </span>
                                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                                    STEP 1 OF 2: BUSINESS PROFILE INFORMATION
                                </span>
                            </div>
                            {/* Horizontal Progress Bar */}
                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-700 dark:bg-emerald-500 w-1/2 rounded-full" />
                            </div>
                        </div>

                        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 self-start sm:self-auto shrink-0">
                            <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>Verified Goan Partner Program</span>
                        </div>
                    </div>

                    {/* Main White Card (Image 1 & Image 2) */}
                    <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-10 shadow-lg space-y-8">
                        {/* Title & Pitch */}
                        <div className="space-y-2 border-b border-border/60 pb-6">
                            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                                Register Your Business
                            </h1>
                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                Connect with Goa&apos;s top creators and start launching authentic local campaigns across the sunshine coast.
                            </p>
                        </div>

                        {error && (
                            <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3.5 text-xs text-destructive">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* SECTION 1: BUSINESS BASICS */}
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="size-10 rounded-xl bg-teal-100 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300 flex items-center justify-center shrink-0">
                                        <Store className="size-5" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <h2 className="text-base font-bold text-foreground">
                                            1. Business Basics
                                        </h2>
                                        <p className="text-xs text-muted-foreground">
                                            Core details about your coastal establishment
                                        </p>
                                    </div>
                                </div>

                                {/* Business Name */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between text-xs">
                                        <label className="font-semibold text-foreground">Business Name *</label>
                                        <span className="text-muted-foreground">e.g. Café Palmeira</span>
                                    </div>
                                    <div className="relative flex items-center">
                                        <Building2 className="absolute left-3.5 size-4 text-muted-foreground" />
                                        <input
                                            type="text"
                                            required
                                            value={businessName}
                                            onChange={(e) => setBusinessName(e.target.value)}
                                            placeholder="Café Palmeira"
                                            className="w-full rounded-xl border border-border bg-background pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                        />
                                    </div>
                                </div>

                                {/* 2-column: Industry & Area */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-foreground">Industry Category *</label>
                                        <div className="relative flex items-center">
                                            <Globe className="absolute left-3.5 size-4 text-muted-foreground" />
                                            <select
                                                required
                                                value={industry}
                                                onChange={(e) => setIndustry(e.target.value)}
                                                className="w-full rounded-xl border border-border bg-background pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                                            >
                                                <option value="" disabled>Select industry</option>
                                                {INITIAL_CATEGORIES.map((cat) => (
                                                    <option key={cat.category_id} value={cat.category_name}>
                                                        {cat.category_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-foreground">Area / Taluka *</label>
                                        <div className="relative flex items-center">
                                            <MapPin className="absolute left-3.5 size-4 text-muted-foreground" />
                                            <select
                                                required
                                                value={locationId}
                                                onChange={(e) => setLocationId(e.target.value)}
                                                className="w-full rounded-xl border border-border bg-background pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                                            >
                                                <option value="" disabled>Select location in Goa</option>
                                                {INITIAL_LOCATIONS.map((loc) => (
                                                    <option key={loc.location_id} value={loc.location_id}>
                                                        {loc.area_name} ({loc.taluka}, {loc.district})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 2: ABOUT YOUR BRAND */}
                            <div className="space-y-4 pt-4 border-t border-border/60">
                                <div className="flex items-start gap-3">
                                    <div className="size-10 rounded-xl bg-teal-100 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300 flex items-center justify-center shrink-0">
                                        <Sparkles className="size-5" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <h2 className="text-base font-bold text-foreground">
                                            2. About Your Brand
                                        </h2>
                                        <p className="text-xs text-muted-foreground">
                                            Tell Goan content creators what makes your space special
                                        </p>
                                    </div>
                                </div>

                                {/* Description & Bio with 0/250 counter */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between text-xs">
                                        <label className="font-semibold text-foreground">Description &amp; Bio *</label>
                                        <span className="text-muted-foreground font-mono">{description.length} / 250</span>
                                    </div>
                                    <textarea
                                        rows={3}
                                        maxLength={250}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Heritage Portuguese-Goan cafe in Calangute serving artisanal coffees, poee sliders, and sunset sangrias."
                                        className="w-full rounded-xl border border-border bg-background p-3 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed"
                                    />
                                </div>

                                {/* 3-column: Phone, Instagram, Website */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-foreground">Contact Phone *</label>
                                        <div className="flex items-center rounded-xl border border-border bg-background overflow-hidden focus-within:ring-1 focus-within:ring-emerald-500">
                                            <span className="bg-muted px-2.5 py-2 text-xs font-semibold text-muted-foreground border-r border-border shrink-0">
                                                +91
                                            </span>
                                            <input
                                                type="tel"
                                                required
                                                value={contactPhone}
                                                onChange={(e) => setContactPhone(e.target.value)}
                                                placeholder="98221 45678"
                                                className="w-full bg-transparent px-2.5 py-2 text-xs sm:text-sm text-foreground focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-foreground">Official Instagram *</label>
                                        <div className="flex items-center rounded-xl border border-border bg-background overflow-hidden focus-within:ring-1 focus-within:ring-emerald-500">
                                            <span className="bg-muted px-2.5 py-2 text-xs font-semibold text-muted-foreground border-r border-border shrink-0">
                                                @
                                            </span>
                                            <input
                                                type="text"
                                                required
                                                value={instagramHandle}
                                                onChange={(e) => setInstagramHandle(e.target.value)}
                                                placeholder="cafepalmeiragoa"
                                                className="w-full bg-transparent px-2.5 py-2 text-xs sm:text-sm text-foreground focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-foreground">Website URL</label>
                                        <div className="relative flex items-center">
                                            <Link2 className="absolute left-3 size-3.5 text-muted-foreground" />
                                            <input
                                                type="url"
                                                value={websiteUrl}
                                                onChange={(e) => setWebsiteUrl(e.target.value)}
                                                placeholder="https://cafepalmeira.in"
                                                className="w-full rounded-xl border border-border bg-background pl-8 pr-3 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 3: ACCOUNT SECURITY (Image 2) */}
                            <div className="space-y-4 pt-4 border-t border-border/60">
                                <div className="flex items-start gap-3">
                                    <div className="size-10 rounded-xl bg-teal-100 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300 flex items-center justify-center shrink-0">
                                        <Lock className="size-5" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <h2 className="text-base font-bold text-foreground">
                                            3. Account Security
                                        </h2>
                                        <p className="text-xs text-muted-foreground">
                                            Credentials for brand campaign management
                                        </p>
                                    </div>
                                </div>

                                {/* Work Email */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-foreground">Work Email *</label>
                                    <div className="relative flex items-center">
                                        <input
                                            type="email"
                                            required
                                            value={workEmail}
                                            onChange={(e) => setWorkEmail(e.target.value)}
                                            placeholder="gm@cafepalmeira.com"
                                            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                        />
                                    </div>
                                </div>

                                {/* Password & Confirm Password */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-foreground">Password *</label>
                                        <div className="relative flex items-center">
                                            <Key className="absolute left-3.5 size-4 text-muted-foreground" />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="••••••••••••"
                                                className="w-full rounded-xl border border-border bg-background pl-10 pr-10 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 text-muted-foreground hover:text-foreground cursor-pointer"
                                                aria-label="Toggle password visibility"
                                            >
                                                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                            </button>
                                        </div>

                                        {/* Password Strength Bar */}
                                        {password && (
                                            <div className="flex items-center gap-2 pt-1">
                                                <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${strength.color} transition-all duration-300`}
                                                        style={{ width: `${strength.pct}%` }}
                                                    />
                                                </div>
                                                <span className="text-[10px] font-bold text-muted-foreground">
                                                    {strength.label}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-foreground">Confirm Password *</label>
                                        <div className="relative flex items-center">
                                            <Lock className="absolute left-3.5 size-4 text-muted-foreground" />
                                            <input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                required
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="••••••••••••"
                                                className="w-full rounded-xl border border-border bg-background pl-10 pr-10 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 text-muted-foreground hover:text-foreground cursor-pointer"
                                                aria-label="Toggle password visibility"
                                            >
                                                {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Terms & Conditions Box */}
                                <div className="rounded-xl border border-border/80 bg-muted/30 p-3.5 sm:p-4 flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="terms"
                                        checked={agreedToTerms}
                                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                                        className="size-4 rounded border-border text-emerald-700 focus:ring-emerald-500 cursor-pointer shrink-0"
                                    />
                                    <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer select-none">
                                        I agree to the{' '}
                                        <Link href="#" className="font-semibold text-foreground hover:underline">
                                            GoaConnect Terms of Service
                                        </Link>{' '}
                                        and{' '}
                                        <Link href="#" className="font-semibold text-foreground hover:underline">
                                            Privacy Policy
                                        </Link>{' '}
                                        for Goan Businesses.
                                    </label>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#0c4e40] hover:bg-[#093d32] text-white font-semibold rounded-xl h-12 text-sm flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-colors duration-150"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="size-4 animate-spin" />
                                            <span>Creating Business Profile...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Create Business Account</span>
                                            <span>&rarr;</span>
                                        </>
                                    )}
                                </button>

                                {/* OR Switch to Creator */}
                                <div className="pt-2 text-center space-y-3">
                                    <div className="relative flex items-center justify-center">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-border/60" />
                                        </div>
                                        <span className="relative bg-card px-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                                            OR
                                        </span>
                                    </div>

                                    <div className="text-xs text-muted-foreground">
                                        Looking to register as a creator instead?{' '}
                                        <Link
                                            href="/join?role=creator"
                                            className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                                        >
                                            Switch to Creator Sign Up &rarr;
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Bottom Badges (Image 2 bottom) */}
                    <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground font-medium pt-2">
                        <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                            <span>100% Curated Local Talent</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Store className="size-4 text-emerald-600 dark:text-emerald-400" />
                            <span>Zero Booking Markup in Goa</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <MapPin className="size-4 text-emerald-600 dark:text-emerald-400" />
                            <span>Local Support Office in Panjim</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
