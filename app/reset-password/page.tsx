'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import {
    Anchor,
    ArrowLeft,
    CheckCircle2,
    Eye,
    EyeOff,
    KeyRound,
    Lock,
    Loader2,
    MapPin,
    ShieldAlert,
    ShieldCheck,
    Star,
    Sun,
    Users,
} from 'lucide-react'
import { Logo } from '@/components/logo'
import { AnimatedThemeToggler } from '@/registry/magicui/animated-theme-toggler'

function ResetPasswordContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get('token')

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    // Password strength calculation matching the design system
    const getPasswordStrength = (pass: string) => {
        if (!pass) return { label: 'EMPTY', pct: 0, color: '#D8D6D0' }
        if (pass.length < 6) return { label: 'WEAK', pct: 25, color: '#B91C1C' }
        if (pass.length < 10) return { label: 'MEDIUM', pct: 60, color: '#B98A2C' }
        return { label: 'STRONG', pct: 100, color: '#0C4E40' }
    }

    const strength = getPasswordStrength(password)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!token) {
            setError('Missing password reset token. Please request a new link.')
            return
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long.')
            return
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match. Please re-enter both passwords.')
            return
        }

        setLoading(true)

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            })

            const data = await res.json()

            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Failed to reset password.')
            }

            setSuccess(true)
            // Redirect to login after a brief moment
            setTimeout(() => {
                router.push('/login?reset=success')
            }, 1200)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error resetting password.')
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
                    {/* LEFT COLUMN: RESET PASSWORD FORM */}
                    <div className="lg:col-span-1 p-8 sm:p-12 flex flex-col justify-between space-y-6">
                        <div className="space-y-6">
                            {/* Top Badge */}
                            <div className="flex items-center justify-between">
                                <div className="inline-flex items-center gap-1.5 rounded-none bg-primary/10 border border-primary/20 px-3 py-1 text-[10px] font-bold text-primary uppercase tracking-wider">
                                    <KeyRound className="size-3.5 text-primary" />
                                    <span>CREDENTIAL RESET</span>
                                </div>

                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                                    <span className="size-2 rounded-none bg-primary" />
                                    <span>256-bit Secure</span>
                                </div>
                            </div>

                            {/* Headline */}
                            <div className="space-y-1.5">
                                <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                                    Set new password
                                </h1>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Create a strong password for your GoaConnect account to secure your bookings and credentials.
                                </p>
                            </div>

                            {/* Missing Token Screen */}
                            {!token ? (
                                <div className="space-y-4">
                                    <div className="rounded-none bg-destructive/10 border border-destructive/20 p-4 space-y-2 text-foreground">
                                        <div className="flex items-center gap-2 text-xs font-bold text-destructive">
                                            <ShieldAlert className="size-4 shrink-0" />
                                            <span>Invalid or Missing Reset Link</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            This password reset link is incomplete or missing its security token. Please request a new link from the forgot password page.
                                        </p>
                                    </div>
                                    <Link
                                        href="/forgot-password"
                                        className="inline-flex items-center justify-center gap-1.5 w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-none h-10 text-xs transition-colors cursor-pointer"
                                    >
                                        Request New Reset Link &rarr;
                                    </Link>
                                </div>
                            ) : success ? (
                                /* Success Notice */
                                <div className="space-y-4">
                                    <div className="rounded-none bg-emerald-500/10 border border-emerald-500/30 p-4 space-y-2 text-foreground">
                                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                                            <CheckCircle2 className="size-4 shrink-0" />
                                            <span>Password Reset Successful!</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            Your password has been updated. Redirecting you to the sign-in page...
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-center py-2">
                                        <Loader2 className="size-5 animate-spin text-primary" />
                                    </div>
                                </div>
                            ) : (
                                /* Form */
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {error && (
                                        <div className="rounded-none bg-destructive/10 border border-destructive/30 p-3 space-y-2 text-xs text-destructive">
                                            <div className="flex items-start gap-2">
                                                <ShieldAlert className="size-4 shrink-0 mt-0.5" />
                                                <span>{error}</span>
                                            </div>
                                            {error.toLowerCase().includes('invalid') || error.toLowerCase().includes('expired') ? (
                                                <Link
                                                    href="/forgot-password"
                                                    className="font-bold underline underline-offset-2 block text-[11px] text-destructive hover:opacity-80"
                                                >
                                                    Request a new reset link &rarr;
                                                </Link>
                                            ) : null}
                                        </div>
                                    )}

                                    {/* New Password */}
                                    <div className="space-y-1.5">
                                        <label htmlFor="new-password" className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                                            New Password
                                        </label>
                                        <div className="relative flex items-center">
                                            <Lock className="absolute left-3.5 size-4 text-muted-foreground" />
                                            <input
                                                id="new-password"
                                                type={showPassword ? 'text' : 'password'}
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Min. 6 characters"
                                                className="w-full rounded-none border border-border bg-background pl-10 pr-10 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
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

                                        {/* Password Strength Meter */}
                                        {password && (
                                            <div className="space-y-1 pt-1">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-1.5 flex-1 bg-muted rounded-none overflow-hidden">
                                                        <div
                                                            className="h-full transition-all duration-300"
                                                            style={{ width: `${strength.pct}%`, backgroundColor: strength.color }}
                                                        />
                                                    </div>
                                                    <span className="text-[10px] font-bold font-mono text-muted-foreground">
                                                        {strength.label}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-muted-foreground">
                                                    Use at least 6 characters (mix letters, numbers and symbols for strong rating).
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="space-y-1.5">
                                        <label htmlFor="confirm-password" className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                                            Confirm New Password
                                        </label>
                                        <div className="relative flex items-center">
                                            <Lock className="absolute left-3.5 size-4 text-muted-foreground" />
                                            <input
                                                id="confirm-password"
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                required
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="Re-enter your new password"
                                                className="w-full rounded-none border border-border bg-background pl-10 pr-10 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
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

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-none h-11 text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-colors duration-150 disabled:opacity-60"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="size-4 animate-spin" />
                                                <span>Resetting Password...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Update Password</span>
                                                <span>&rarr;</span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Bottom Trust Badges */}
                        <div className="pt-4 border-t border-border/60 flex flex-wrap items-center justify-between gap-2 text-[10px] text-muted-foreground font-medium">
                            <div className="flex items-center gap-1.5">
                                <ShieldCheck className="size-3.5 text-primary" />
                                <span>Encrypted bcrypt hash</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Users className="size-3.5 text-primary" />
                                <span>Verified Community</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <MapPin className="size-3.5 text-primary" />
                                <span>Calangute &amp; Panjim Hub</span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: SPLIT-SCREEN IMAGE */}
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
                                <span>Security Protocol</span>
                            </div>
                        </div>

                        {/* Floating Security Note */}
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
                                &ldquo;Resetting your credentials immediately revokes the previous reset token to protect your Goan creator &amp; brand business records.&rdquo;
                            </p>

                            <div className="flex items-center justify-between pt-2 border-t border-border">
                                <div className="text-xs font-bold text-foreground">One-Time Token Validation</div>
                                <div className="text-[10px] font-mono text-muted-foreground">SHA-256 Hashed</div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default function ResetPasswordPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
                    <div className="size-6 border-2 border-primary border-t-transparent rounded-none animate-spin" />
                </div>
            }
        >
            <ResetPasswordContent />
        </Suspense>
    )
}

