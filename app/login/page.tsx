'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Anchor, Loader2, CheckCircle2 } from 'lucide-react'
import { Logo } from '@/components/logo'
import { AnimatedThemeToggler } from '@/registry/magicui/animated-theme-toggler'

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })

            const data = await res.json()
            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Login failed')
            }

            setSuccessMessage(`Welcome back! Signed in as ${data.user.role.toUpperCase()}.`)
            setTimeout(() => {
                router.push('/')
            }, 1200)
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Invalid credentials'
            setError(msg)
        } finally {
            setLoading(false)
        }
    }

    const fillDemo = (demoEmail: string, demoPass: string) => {
        setEmail(demoEmail)
        setPassword(demoPass)
        setError(null)
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
                            href="/join"
                            className="text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                        >
                            Join GoaConnect
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Form Container */}
            <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
                <div className="w-full max-w-md">
                    <div className="rounded-3xl border border-border/80 bg-card p-8 sm:p-10 shadow-lg space-y-6">
                        {/* Header */}
                        <div className="text-center space-y-2">
                            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                                <Anchor className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span>GOACONNECT PORTAL</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                                Welcome Back
                            </h1>
                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                Sign in to manage your creator profile, business collaborations, and campaign requests.
                            </p>
                        </div>

                        {/* Error Notification */}
                        {error && (
                            <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
                                {error}
                            </div>
                        )}

                        {/* Success Notification */}
                        {successMessage && (
                            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-center space-y-1">
                                <CheckCircle2 className="size-6 text-emerald-600 dark:text-emerald-400 mx-auto" />
                                <div className="text-sm font-bold text-foreground">{successMessage}</div>
                            </div>
                        )}

                        {/* Form */}
                        {!successMessage && (
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-foreground">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@domain.com"
                                        className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-medium text-foreground">Password</label>
                                        <span className="text-[11px] text-muted-foreground">DBMS project auth</span>
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#0c4e40] hover:bg-[#08382e] text-white font-semibold rounded-xl h-11 text-sm flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors duration-150 mt-6"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="size-4 animate-spin" />
                                            <span>Signing In...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Sign In to GoaConnect</span>
                                            <span>&rarr;</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        )}

                        {/* Quick Demo Credentials for Review/Viva */}
                        <div className="pt-4 border-t border-border/60 space-y-2">
                            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block text-center">
                                Quick Demo Accounts
                            </span>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    type="button"
                                    onClick={() => fillDemo('rahul@goaconnect.in', 'creator123')}
                                    className="rounded-lg border border-border bg-muted/40 p-1.5 text-center text-[10px] font-medium hover:bg-muted text-foreground cursor-pointer"
                                >
                                    Creator
                                </button>
                                <button
                                    type="button"
                                    onClick={() => fillDemo('palmeira@goaconnect.in', 'business123')}
                                    className="rounded-lg border border-border bg-muted/40 p-1.5 text-center text-[10px] font-medium hover:bg-muted text-foreground cursor-pointer"
                                >
                                    Business
                                </button>
                                <button
                                    type="button"
                                    onClick={() => fillDemo('admin@goaconnect.in', 'admin123')}
                                    className="rounded-lg border border-border bg-muted/40 p-1.5 text-center text-[10px] font-medium hover:bg-muted text-foreground cursor-pointer"
                                >
                                    Admin
                                </button>
                            </div>
                        </div>

                        {/* Footer link */}
                        <div className="text-center text-xs text-muted-foreground pt-1">
                            Don&apos;t have an account?{' '}
                            <Link href="/join" className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">
                                Choose account type &rarr;
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
