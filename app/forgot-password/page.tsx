'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
    Anchor,
    ArrowLeft,
    CheckCircle2,
    KeyRound,
    Loader2,
    Mail,
    MapPin,
    ShieldCheck,
    Star,
    Sun,
    Users,
} from 'lucide-react'
import { Logo } from '@/components/logo'
import { AnimatedThemeToggler } from '@/registry/magicui/animated-theme-toggler'

function ForgotPasswordContent() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [devResetUrl, setDevResetUrl] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email.trim()) {
            setError('Please enter your account email address.')
            return
        }

        setLoading(true)
        setError(null)
        setDevResetUrl(null)

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim() }),
            })

            const data = await res.json()

            // Always show the same neutral confirmation message regardless of outcome (security best practice)
            setSubmitted(true)
            if (data.reset_url) {
                setDevResetUrl(data.reset_url)
            }
        } catch {
            // Even on network error, maintain neutral confirmation to prevent enumeration
            setSubmitted(true)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
            {/* Top Navigation */}
            <header className="border-b border-border bg-background/90 backdrop-blur-md sticky top-0 z-30">
                <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <Logo />
                    </Link>

                    <div className="flex items-center gap-3">
                        <AnimatedThemeToggler className="flex size-9 items-center justify-center rounded-none border border-border bg-background text-foreground hover:bg-muted duration-150 cursor-pointer" />
                        <Link
                            href="/login"
                            className="text-xs sm:text-sm font-medium text-primary hover:underline flex items-center gap-1"
                        >
                            <ArrowLeft className="size-3.5" />
                            <span>Back to Sign In</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
                <div className="w-full max-w-5xl rounded-none border border-border bg-card overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-2 min-h-[580px]">
                    {/* LEFT COLUMN: FORGOT PASSWORD FORM */}
                    <div className="lg:col-span-1 p-8 sm:p-12 flex flex-col justify-between space-y-6">
                        <div className="space-y-6">
                            {/* Top Badge */}
                            <div className="flex items-center justify-between">
                                <div className="inline-flex items-center gap-1.5 rounded-none bg-primary/10 border border-primary/20 px-3 py-1 text-[10px] font-bold text-primary uppercase tracking-wider">
                                    <KeyRound className="size-3.5 text-primary" />
                                    <span>ACCOUNT RECOVERY</span>
                                </div>

                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                                    <span className="size-2 rounded-none bg-primary" />
                                    <span>Live Network</span>
                                </div>
                            </div>

                            {/* Headline */}
                            <div className="space-y-1.5">
                                <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                                    Forgot your password?
                                </h1>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Enter your registered work or creator email address. We&apos;ll send you a secure link to reset your account credentials.
                                </p>
                            </div>

                            {/* Neutral Confirmation Message */}
                            {submitted ? (
                                <div className="space-y-4">
                                    <div className="rounded-none bg-primary/5 border border-primary/20 p-4 space-y-2 text-foreground">
                                        <div className="flex items-center gap-2 text-xs font-bold text-primary">
                                            <CheckCircle2 className="size-4 shrink-0" />
                                            <span>Reset link dispatched</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            If an account is associated with <span className="font-bold text-foreground font-mono">{email}</span>, a secure password reset link has been generated. Please check your inbox and spam folder.
                                        </p>
                                    </div>

                                    {/* Development mode reset quick link */}
                                    {devResetUrl && (
                                        <div className="rounded-none border border-border bg-muted/40 p-3 space-y-1.5 text-xs">
                                            <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider block">
                                                Dev Environment Reset Link
                                            </span>
                                            <Link
                                                href={devResetUrl}
                                                className="font-mono text-primary font-bold hover:underline block break-all text-xs"
                                            >
                                                {devResetUrl} &rarr;
                                            </Link>
                                        </div>
                                    )}

                                    <div className="pt-2 flex flex-col gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSubmitted(false)
                                                setEmail('')
                                                setDevResetUrl(null)
                                            }}
                                            className="text-xs text-muted-foreground hover:text-foreground font-semibold underline underline-offset-2 cursor-pointer text-left"
                                        >
                                            Enter a different email address
                                        </button>
                                        <Link
                                            href="/login"
                                            className="inline-flex items-center justify-center gap-1.5 w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-none h-10 text-xs transition-colors cursor-pointer"
                                        >
                                            <ArrowLeft className="size-3.5" />
                                            <span>Return to Sign In</span>
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {error && (
                                        <div className="rounded-none bg-destructive/5 border border-destructive/20 p-3 text-xs text-destructive">
                                            {error}
                                        </div>
                                    )}

                                    <div className="space-y-1.5">
                                        <label htmlFor="recovery-email" className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                                            Registered Account Email
                                        </label>
                                        <div className="relative flex items-center">
                                            <Mail className="absolute left-3 size-4 text-muted-foreground" />
                                            <input
                                                id="recovery-email"
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="you@palmeira.goa or creator@gmail.com"
                                                className="w-full rounded-none border border-border bg-background pl-10 pr-4 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                                            />
                                        </div>
                                        <p className="text-[11px] text-muted-foreground">
                                            Works for both Business partners and Goan creator accounts.
                                        </p>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-none h-11 text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-colors duration-150 disabled:opacity-60"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="size-4 animate-spin" />
                                                <span>Sending Recovery Link...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Send Password Reset Link</span>
                                                <span>&rarr;</span>
                                            </>
                                        )}
                                    </button>

                                    <div className="text-center pt-2">
                                        <Link
                                            href="/login"
                                            className="text-xs text-muted-foreground hover:text-foreground font-semibold inline-flex items-center gap-1 hover:underline"
                                        >
                                            <ArrowLeft className="size-3" />
                                            <span>Remembered your password? Sign In</span>
                                        </Link>
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* Bottom Security / Trust Badges */}
                        <div className="pt-4 border-t border-border/60 flex flex-wrap items-center justify-between gap-2 text-[10px] text-muted-foreground font-medium">
                            <div className="flex items-center gap-1.5">
                                <ShieldCheck className="size-3.5 text-primary" />
                                <span>256-bit encrypted tokens</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Users className="size-3.5 text-primary" />
                                <span>Vetted Goa Community</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <MapPin className="size-3.5 text-primary" />
                                <span>Calangute &amp; Panjim Hub</span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: SPLIT-SCREEN IMAGE & TESTIMONIAL */}
                    <div className="hidden lg:flex lg:col-span-1 relative overflow-hidden bg-muted">
                        <Image
                            src="https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=1200&auto=format&fit=crop"
                            alt="Goan coastal cafe"
                            width={1200}
                            height={800}
                            className="size-full object-cover opacity-85"
                        />
                        <div className="absolute inset-0 bg-white/60 dark:bg-black/60" />

                        {/* Top Overlaid Badges */}
                        <div className="absolute top-4 inset-x-4 flex items-center justify-between z-10">
                            <div className="inline-flex items-center gap-1.5 bg-background border border-border px-3.5 py-1 text-xs font-bold text-foreground shadow-sm rounded-none">
                                <Sun className="size-3.5 text-primary" />
                                <span>COASTAL CREATIVE ECOSYSTEM</span>
                            </div>

                            <div className="inline-flex items-center gap-1.5 bg-background border border-border px-3 py-1 text-xs font-bold text-primary shadow-sm rounded-none">
                                <Star className="size-3.5 text-primary" />
                                <span>GoaConnect Security</span>
                            </div>
                        </div>

                        {/* Floating Recovery Tip Card */}
                        <div className="absolute bottom-6 inset-x-6 z-10 rounded-none border border-border bg-background p-6 shadow-sm space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1 text-primary">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="size-4 fill-primary text-primary" />
                                    ))}
                                </div>
                                <Anchor className="size-4 text-primary" />
                            </div>

                            <p className="text-sm font-medium text-foreground leading-relaxed">
                                &ldquo;Account security protects your brand rate cards, verified audience insights, and active escrow collaboration contracts.&rdquo;
                            </p>

                            <div className="flex items-center justify-between pt-2 border-t border-border">
                                <div className="text-xs font-bold text-foreground">GoaConnect Security Node</div>
                                <div className="text-[10px] font-mono text-muted-foreground">Tokens expire in 60m</div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default function ForgotPasswordPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
                    <div className="size-6 border-2 border-primary border-t-transparent rounded-none animate-spin" />
                </div>
            }
        >
            <ForgotPasswordContent />
        </Suspense>
    )
}

