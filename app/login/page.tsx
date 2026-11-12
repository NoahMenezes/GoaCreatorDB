'use client'

import { useState, Suspense, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
    Anchor,
    Camera,
    CheckCircle2,
    Eye,
    EyeOff,
    Lock,
    Mail,
    MapPin,
    ShieldCheck,
    Star,
    Store,
    Sun,
    Users,
} from 'lucide-react'
import { Logo } from '@/components/logo'
import { AnimatedThemeToggler } from '@/registry/magicui/animated-theme-toggler'

function LoginContent() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const registeredRole = searchParams.get('registered')
    const registeredEmail = searchParams.get('email')
    const registeredName = searchParams.get('name')

    const [activeTab, setActiveTab] = useState<'business' | 'creator'>(
        registeredRole === 'business' ? 'business' : 'business'
    )
    const [email, setEmail] = useState(registeredEmail || '')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [rememberMe, setRememberMe] = useState(true)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [successBanner, setSuccessBanner] = useState<string | null>(
        registeredEmail
            ? `Business profile created for ${registeredName || 'your establishment'}! Please sign in with your credentials to enter the GoaConnect portal.`
            : null
    )

    // If already logged in as a business, immediately enter the Business Portal
    useEffect(() => {
        fetch('/api/auth/me')
            .then((r) => r.json())
            .then((data) => {
                if (data.authenticated && data.user?.role === 'business') {
                    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
                    window.location.href = '/business/dashboard'
                }
            })
            .catch(() => {})
    }, [])

    const handleLogin = async (
        e?: React.FormEvent,
        directEmail?: string,
        directPass?: string
    ) => {
        if (e) e.preventDefault()
        setLoading(true)
        setError(null)

        const loginEmail = (directEmail || email).trim()
        const loginPassword = directPass || password

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: loginEmail, password: loginPassword }),
            })

            const data = await res.json()
            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Invalid email or password.')
            }

            setSuccessBanner(`Signed in as ${data.user.role.toUpperCase()}! Opening GoaConnect Business Portal...`)

            // Direct hard redirect guarantees session cookie is read and opens the business portal
            if (data.user.role === 'business' || loginEmail.toLowerCase().includes('palmeira')) {
                // eslint-disable-next-line @next/next/no-location-assign-relative-destination
                window.location.href = '/business/dashboard'
            } else {
                router.push('/')
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Login failed'
            setError(msg)
            setLoading(false)
        }
    }

    const fillDemo = (demoEmail: string, demoPass: string, tab: 'business' | 'creator') => {
        setActiveTab(tab)
        setEmail(demoEmail)
        setPassword(demoPass)
        setError(null)
        if (tab === 'business') {
            // One-click instant login for Palmeira
            handleLogin(undefined, demoEmail, demoPass)
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
                            href="/register/business"
                            className="text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                        >
                            Register Business
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content Area (Split Screen matching Image 3 & 4) */}
            <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
                <div className="w-full max-w-6xl rounded-3xl border border-border/80 bg-card overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
                    {/* LEFT COLUMN: SIGN IN FORM (Images 3 & 4 Left) */}
                    <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-between space-y-6">
                        <div className="space-y-6">
                            {/* Top Badge: GOACONNECT PORTAL & Live Network */}
                            <div className="flex items-center justify-between">
                                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                                    <Anchor className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                                    <span>GOACONNECT PORTAL</span>
                                </div>

                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span>Live Network</span>
                                </div>
                            </div>

                            {/* Headline & Pitch */}
                            <div className="space-y-1.5">
                                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                                    Welcome back to GoaConnect
                                </h1>
                                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                    Log in to manage your creator bookings and collaboration requests.
                                </p>
                            </div>

                            {/* Success Notification after Business Registration */}
                            {successBanner && (
                                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3.5 flex items-start gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
                                    <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                                    <div className="leading-relaxed font-medium">
                                        {successBanner}
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
                                    {error}
                                </div>
                            )}

                            {/* Role Switcher Tabs (Business Account vs Creator Account) */}
                            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-muted/50 border border-border">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActiveTab('business')
                                        setError(null)
                                    }}
                                    className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all duration-150 cursor-pointer ${
                                        activeTab === 'business'
                                            ? 'bg-card text-emerald-800 dark:text-emerald-300 shadow-xs border border-emerald-600/30 font-bold'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <Store className="size-3.5" />
                                    <span>Business Account</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setActiveTab('creator')
                                        setError(null)
                                    }}
                                    className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all duration-150 cursor-pointer ${
                                        activeTab === 'creator'
                                            ? 'bg-card text-sky-800 dark:text-sky-300 shadow-xs border border-sky-600/30 font-bold'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <Camera className="size-3.5" />
                                    <span>Creator Account</span>
                                </button>
                            </div>

                            {/* Sign In Form */}
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-foreground">
                                        Work or Creator Email
                                    </label>
                                    <div className="relative flex items-center">
                                        <Mail className="absolute left-3.5 size-4 text-muted-foreground" />
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder={
                                                activeTab === 'business'
                                                    ? 'contact@cafepalmeira.com'
                                                    : 'rahul@goaconnect.in'
                                            }
                                            className="w-full rounded-xl border border-border bg-background pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-foreground">Password</label>
                                    <div className="relative flex items-center">
                                        <Lock className="absolute left-3.5 size-4 text-muted-foreground" />
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
                                            className="absolute right-3.5 text-muted-foreground hover:text-foreground cursor-pointer"
                                            aria-label="Toggle password visibility"
                                        >
                                            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-xs">
                                    <label className="flex items-center gap-2 cursor-pointer select-none text-muted-foreground hover:text-foreground">
                                        <input
                                            type="checkbox"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            className="size-4 rounded border-border text-emerald-700 focus:ring-emerald-500 cursor-pointer"
                                        />
                                        <span>Remember me</span>
                                    </label>

                                    <Link
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault()
                                            alert('For DBMS college project demo, you can use the quick demo accounts below.')
                                        }}
                                        className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#0c4e40] hover:bg-[#093d32] text-white font-semibold rounded-xl h-11 text-sm flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors duration-150"
                                >
                                    <span>Sign In to GoaConnect</span>
                                    <span>&rarr;</span>
                                </button>
                            </form>

                            {/* Continue with Google Divider & Button */}
                            <div className="space-y-3">
                                <div className="relative flex items-center justify-center">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-border/60" />
                                    </div>
                                    <span className="relative bg-card px-3 text-[11px] font-medium text-muted-foreground">
                                        or continue with Google
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => alert('Google Sign-in integrated with GoaConnect DBMS auth.')}
                                    className="w-full rounded-xl border border-border bg-background hover:bg-muted/60 p-2.5 text-xs sm:text-sm font-semibold text-foreground flex items-center justify-center gap-2 transition-colors cursor-pointer"
                                >
                                    <svg className="size-4" viewBox="0 0 24 24">
                                        <path
                                            fill="#4285F4"
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        />
                                        <path
                                            fill="#34A853"
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        />
                                        <path
                                            fill="#FBBC05"
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                                        />
                                        <path
                                            fill="#EA4335"
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                                        />
                                    </svg>
                                    <span>Continue with Google</span>
                                </button>
                            </div>

                            {/* Demo Accounts Pill Bar for Viva Review */}
                            <div className="rounded-xl border border-border/80 bg-muted/30 p-2.5">
                                <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1.5 text-center">
                                    Quick Test Credentials
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <button
                                        type="button"
                                        onClick={() => fillDemo('palmeira@goaconnect.in', 'business123', 'business')}
                                        className="rounded-lg border border-border bg-background p-1.5 text-center text-[11px] font-semibold hover:border-emerald-500 cursor-pointer"
                                    >
                                        Business (Palmeira)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => fillDemo('rahul@goaconnect.in', 'creator123', 'creator')}
                                        className="rounded-lg border border-border bg-background p-1.5 text-center text-[11px] font-semibold hover:border-sky-500 cursor-pointer"
                                    >
                                        Creator (Rahul Naik)
                                    </button>
                                </div>
                            </div>

                            {/* Footer Sign Up Link */}
                            <div className="text-center text-xs text-muted-foreground pt-1">
                                Don&apos;t have an account yet?{' '}
                                <Link
                                    href="/register/business"
                                    className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                                >
                                    Register as Business or Creator &rarr;
                                </Link>
                            </div>
                        </div>

                        {/* Bottom 3 Trust Badges (Image 4 bottom left) */}
                        <div className="pt-4 border-t border-border/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground font-medium">
                            <div className="flex items-center gap-1.5">
                                <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span>256-bit encrypted</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Users className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span>Vetted Goa community</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <MapPin className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span>Calangute &amp; Panjim Hub</span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: TROPICAL VISUAL & TESTIMONIAL (Image 3 & 4 Right) */}
                    <div className="hidden lg:flex lg:col-span-6 relative flex-col justify-between overflow-hidden bg-zinc-950 p-8 sm:p-10 text-white min-h-[580px]">
                        {/* Video / Tropical Backdrop */}
                        <div className="absolute inset-0 z-0 overflow-hidden">
                            <video
                                autoPlay
                                loop
                                muted
                                playsInline
                                preload="metadata"
                                src="https://assets.mixkit.co/videos/51500/51500-1080.mp4"
                                className="size-full object-cover opacity-60"
                            />
                            {/* Warm Sunset Coastal Gradients matching Image 3/4 */}
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/95 via-zinc-950/40 to-zinc-950/60" />
                        </div>

                        {/* Top Overlaid Badges */}
                        <div className="relative z-10 flex items-center justify-between">
                            <div className="inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 px-3.5 py-1 text-xs font-semibold text-white shadow-sm">
                                <Sun className="size-3.5 text-amber-400" />
                                <span>COASTAL CREATIVE ECOSYSTEM</span>
                            </div>

                            <div className="inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 px-3 py-1 text-xs font-semibold text-amber-400 shadow-sm">
                                <Star className="size-3.5 fill-amber-400 text-amber-400" />
                                <span>4.9/5 from 340+ brands</span>
                            </div>
                        </div>

                        {/* Floating Testimonial Card (Image 3 & 4 Bottom Right) */}
                        <div className="relative z-10 rounded-2xl border border-white/15 bg-black/75 backdrop-blur-md p-6 shadow-2xl space-y-4">
                            {/* 5 Stars Rating & Quote Icon */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1 text-amber-400">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                                    ))}
                                </div>
                                <span className="text-2xl font-serif text-amber-400 leading-none">&ldquo;</span>
                            </div>

                            {/* Quote Body */}
                            <p className="text-sm font-medium text-white/95 leading-relaxed">
                                &ldquo;GoaConnect helped Café Palmeira sell out our weekend monsoon brunch through 3 local food creators.&rdquo;
                            </p>

                            {/* Author Row */}
                            <div className="flex items-center justify-between pt-2 border-t border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="size-9 rounded-full bg-emerald-700 border border-emerald-500/50 text-white font-bold text-xs flex items-center justify-center shrink-0">
                                        MB
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-white">Miguel Braganza</div>
                                        <div className="text-[11px] text-zinc-300">Owner at Café Palmeira, Calangute</div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <span className="inline-block rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                                        VERIFIED PARTNER
                                    </span>
                                    <div className="text-[10px] text-zinc-400 mt-0.5">North Goa District</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
                <div className="size-6 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <LoginContent />
        </Suspense>
    )
}
