'use client'

import Link from 'next/link'
import { Search, UserPlus } from 'lucide-react'
import Image from 'next/image'

export default function HeroSection() {
    return (
        <>
            <section id="hero" className="relative overflow-hidden">
                <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 sm:py-28 lg:py-36 text-center">
                    <div className="inline-flex items-center gap-2 rounded-sm bg-primary/10 border border-primary/20 px-3 py-1 text-[10px] font-bold text-primary uppercase tracking-wider mb-6 inline-block">
                        <span className="size-2 rounded-full bg-primary" />
                        <span>THE OFFICIAL GOA CREATOR MARKETPLACE</span>
                    </div>

                    <h1 className="text-balance text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4">
                        Find the right Goa creator <br />
                        <span className="text-primary">in minutes</span>
                    </h1>

                    <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-2xl mx-auto mb-8">
                        The dedicated marketplace connecting local Goa cafes, boutique hotels, lifestyle brands, and events with vetted local influencers and creators across North &amp; South Goa.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-3">
                        <Link
                            href="#creators"
                            className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-sm px-5 py-2.5 text-sm shadow-sm transition-colors cursor-pointer"
                        >
                            <Search className="size-4 mr-1.5" />
                            <span>Find Creators</span>
                        </Link>
                        <Link
                            href="/join?role=creator"
                            className="border border-border bg-background hover:bg-muted font-medium rounded-sm px-5 py-2.5 text-sm transition-colors cursor-pointer text-foreground"
                        >
                            <UserPlus className="size-4 mr-1.5" />
                            <span>Join as Creator</span>
                        </Link>
                    </div>
                </div>

                {/* Hero photograph (right side on desktop) */}
                <div className="hidden lg:block absolute right-0 top-0 h-full w-1/2 z-0 overflow-hidden">
                    <Image
                        src="https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=1600&auto=format&fit=crop"
                        alt="Goan coastal heritage cafe courtyard"
                        width={1600}
                        height={1200}
                        className="size-full object-cover opacity-90"
                    />
                    <div className="absolute inset-0 bg-white/40" />
                </div>
            </section>

            {/* Trust metrics bar */}
            <section className="border-t border-border bg-card px-6 py-8 sm:py-12">
                <div className="mx-auto max-w-7xl">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 divide-y sm:divide-y-0 sm:divide-x divide-border">
                        <div className="flex items-center gap-3 py-2 sm:py-4">
                            <span className="size-8 rounded-sm bg-primary text-primary-foreground flex items-center justify-center shrink-0 font-bold text-[11px]">
                                450+
                            </span>
                            <div className="text-left">
                                <div className="text-sm font-bold text-foreground">Vetted Goa Creators</div>
                                <div className="text-[10px] text-muted-foreground">North & South Goa</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 py-2 sm:py-4">
                            <span className="size-8 rounded-sm bg-primary text-primary-foreground flex items-center justify-center shrink-0 font-bold text-[11px]">
                                1,200+
                            </span>
                            <div className="text-left">
                                <div className="text-sm font-bold text-foreground">Collabs Done</div>
                                <div className="text-[10px] text-muted-foreground">Verified campaigns</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 py-2 sm:py-4">
                            <span className="size-8 rounded-sm bg-primary text-primary-foreground flex items-center justify-center shrink-0 font-bold text-[11px]">
                                4.9 / 5
                            </span>
                            <div className="text-left">
                                <div className="text-sm font-bold text-foreground">Average Rating</div>
                                <div className="text-[10px] text-muted-foreground">Brand reviews</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 py-2 sm:py-4">
                            <span className="size-8 rounded-sm bg-primary text-primary-foreground flex items-center justify-center shrink-0 font-bold text-[11px]">
                                100%
                            </span>
                            <div className="text-left">
                                <div className="text-sm font-bold text-foreground">Escrow Protection</div>
                                <div className="text-[10px] text-muted-foreground">Secure milestone payouts</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
