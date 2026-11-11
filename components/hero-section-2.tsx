'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { HeroHeader } from '@/components/hero-section-2-header'
import {
    Bed,
    CheckCircle2,
    Layers,
    Search,
    Shield,
    Star,
    UserPlus,
    Users,
} from 'lucide-react'

export default function HeroSection() {
    return (
        <>
            <HeroHeader />
            <main className="overflow-hidden">
                <section className="pt-32 sm:pt-36 pb-8 sm:pb-12" id="hero">
                    <div className="mx-auto max-w-7xl px-6">
                        {/* Title & Pitch Container */}
                        <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-6">
                            {/* Official Badge */}
                            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 backdrop-blur-md">
                                <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span>THE OFFICIAL GOA CREATOR MARKETPLACE</span>
                            </div>

                            {/* Main Headline */}
                            <h1 className="text-balance text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground">
                                Find the right Goa creator{' '}
                                <span className="text-emerald-700 dark:text-emerald-400">in minutes</span>
                            </h1>

                            {/* Subtitle */}
                            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-2xl">
                                The dedicated marketplace connecting local Goa cafes, boutique hotels, lifestyle brands, and events with vetted local influencers and creators across North &amp; South Goa.
                            </p>

                            {/* CTA / Action Buttons */}
                            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-1">
                                <Button
                                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-medium h-11 px-6 rounded-lg text-sm cursor-pointer shadow-xs"
                                    size="lg"
                                    nativeButton={false}
                                    render={
                                        <Link href="#creators" className="flex items-center gap-2">
                                            <Search className="size-4" />
                                            <span>Find Creators</span>
                                        </Link>
                                    }
                                />
                                <Button
                                    variant="outline"
                                    className="h-11 px-6 rounded-lg text-sm font-medium cursor-pointer flex items-center gap-2 border-border text-foreground hover:bg-muted"
                                    size="lg"
                                    nativeButton={false}
                                    render={
                                        <Link href="#pricing" className="flex items-center gap-2">
                                            <UserPlus className="size-4 text-emerald-600 dark:text-emerald-400" />
                                            <span>Join as Creator</span>
                                        </Link>
                                    }
                                />
                            </div>
                        </div>

                        {/* 4 Metric Cards Bar */}
                        <div className="mt-12 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm p-4 sm:p-6 shadow-xs">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-border">
                                <div className="flex items-center gap-4 px-3 py-2">
                                    <div className="size-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                                        <Users className="size-5" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold tracking-tight text-foreground">450+</div>
                                        <div className="text-xs text-muted-foreground">Vetted Goa Creators</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 px-3 py-2 pt-4 sm:pt-2">
                                    <div className="size-11 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
                                        <Layers className="size-5" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold tracking-tight text-foreground">1,200+</div>
                                        <div className="text-xs text-muted-foreground">Collabs Done</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 px-3 py-2 pt-4 sm:pt-2">
                                    <div className="size-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                                        <Star className="size-5 fill-amber-500 text-amber-500" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold tracking-tight text-foreground">4.9 / 5</div>
                                        <div className="text-xs text-muted-foreground">Average Rating</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 px-3 py-2 pt-4 sm:pt-2">
                                    <div className="size-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                                        <Shield className="size-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold tracking-tight text-foreground">100%</div>
                                        <div className="text-xs text-muted-foreground">Escrow Protection</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Trusted By Premier Stays & Spots Banner */}
                        <div className="mt-6 rounded-xl border border-border/70 bg-card/50 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                <Bed className="size-4 text-emerald-600 dark:text-emerald-400" />
                                <span>Trusted by Goa&apos;s Premier Stays &amp; Spots</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
                                <span className="rounded-lg border border-border bg-background px-3 py-1.5 text-foreground shadow-2xs">
                                    Café Palmeira, Calangute
                                </span>
                                <span className="rounded-lg border border-border bg-background px-3 py-1.5 text-foreground shadow-2xs">
                                    Boutique Villa Assagao
                                </span>
                                <span className="rounded-lg border border-border bg-background px-3 py-1.5 text-foreground shadow-2xs">
                                    Titlie Culinary Bar, Vagator
                                </span>
                                <span className="rounded-lg border border-border bg-background px-3 py-1.5 text-foreground shadow-2xs">
                                    Antares Beach Club, Vagator
                                </span>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}
