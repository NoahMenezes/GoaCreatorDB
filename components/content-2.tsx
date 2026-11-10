import { Card } from '@/components/ui/card'
import { CheckCircle2, Lock, MapPin, ShieldCheck, Sparkles, Zap } from 'lucide-react'

export default function ContentSection() {
    return (
        <section className="py-20 md:py-28 border-t border-border/50" id="locations">
            <div className="mx-auto max-w-7xl px-6">
                <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                    {/* Left: Value Proposition */}
                    <div className="space-y-8">
                        <div className="space-y-3">
                            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-500">
                                <Sparkles className="size-3.5" />
                                <span>The Creative Workflow</span>
                            </div>
                            <h2 className="text-balance text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
                                How High-Ticket Brand Deals Happen in Goa
                            </h2>
                            <p className="text-muted-foreground text-lg leading-relaxed">
                                Goa Creator eliminates the messy DMs, permit hassles, and ghosted invoices. We connect verified creators directly with luxury hospitality and lifestyle brands through secure escrow milestones.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="size-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0 mt-1">
                                    <Zap className="size-5" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-lg font-semibold text-foreground">
                                        Direct Brand Matchmaking &amp; Briefs
                                    </h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed">
                                        Skip intermediary agency fees. Boutique stays and brands publish detailed campaign briefs with explicit creative deliverables and budgets.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="size-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0 mt-1">
                                    <ShieldCheck className="size-5" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-lg font-semibold text-foreground">
                                        Guaranteed Escrow Milestone Payouts
                                    </h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed">
                                        Campaign budgets are pre-deposited into escrow before cameras roll. Payouts release automatically within 24 hours of deliverable approval.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="size-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0 mt-1">
                                    <MapPin className="size-5" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-lg font-semibold text-foreground">
                                        Pre-Cleared Filming Passes &amp; Drone Zones
                                    </h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed">
                                        Zero shoot interruptions or surprise permit fines. Every participating villa, beachfront estate, and venue comes with verified commercial filming clearance.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Production & Escrow Monitor Video Card */}
                    <div className="relative">
                        <Card className="relative overflow-hidden rounded-3xl border border-border/80 bg-black shadow-2xl p-6 sm:p-8">
                            {/* Video background */}
                            <div className="relative aspect-4/3 sm:aspect-16/10 w-full overflow-hidden rounded-2xl">
                                <video
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    preload="metadata"
                                    src="https://assets.mixkit.co/videos/3160/3160-1080.mp4"
                                    className="size-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                            </div>

                            {/* Live Escrow Tracker Overlay Card */}
                            <div className="mt-6 space-y-4 rounded-2xl bg-muted/20 border border-border/60 p-5 backdrop-blur-md">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Lock className="size-4 text-amber-500" />
                                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Active Campaign Escrow #GC-904
                                        </span>
                                    </div>
                                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                                        ₹1,10,000 Locked
                                    </span>
                                </div>

                                <div className="space-y-2.5 text-xs">
                                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-background/60 border border-border/40">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                                            <span className="font-medium text-foreground">Milestone 1: Drone Reel &amp; Walkthrough</span>
                                        </div>
                                        <span className="text-emerald-400 font-semibold">₹45,000 Released</span>
                                    </div>

                                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-background/60 border border-border/40">
                                        <div className="flex items-center gap-2">
                                            <span className="size-2 rounded-full bg-amber-400 animate-pulse ml-1 mr-1" />
                                            <span className="font-medium text-foreground">Milestone 2: 3x 4K Sunset Edits</span>
                                        </div>
                                        <span className="text-amber-400 font-semibold">₹65,000 In Review</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </section>
    )
}
