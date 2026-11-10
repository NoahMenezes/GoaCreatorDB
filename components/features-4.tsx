import { Card } from '@/components/ui/card'
import { Calendar, CheckCircle2, Home, MapPin, Sparkles, Users } from 'lucide-react'

export default function FeaturesFour() {
    return (
        <section className="py-20 md:py-28 border-t border-border/50" id="locations-hub">
            <div className="mx-auto max-w-7xl px-6">
                {/* Header */}
                <div className="max-w-2xl space-y-3 mb-12 sm:mb-16">
                    <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-500">
                        <Sparkles className="size-3.5" />
                        <span>Locations &amp; Residencies</span>
                    </div>
                    <h2 className="text-balance text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
                        Turn All of Goa Into Your Production Studio
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        Pre-cleared filming permits, private heritage villa access, and creative residencies designed for high-production storytelling.
                    </p>
                </div>

                {/* Grid */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Large Feature Card: 180+ Shoot Locations */}
                    <Card className="lg:col-span-2 relative overflow-hidden rounded-3xl border border-border/80 bg-black min-h-[460px] flex flex-col justify-end p-6 sm:p-10 shadow-2xl">
                        <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            preload="metadata"
                            src="https://assets.mixkit.co/videos/1564/1564-1080.mp4"
                            className="absolute inset-0 size-full object-cover opacity-55"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                        <div className="relative z-10 space-y-4 max-w-xl text-white">
                            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
                                Hassle-Free Filming at 180+ Private Villas &amp; Coastal Spots
                            </h3>

                            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
                                No surprise interruptions, police permits, or gatekeeper disputes. Every partner villa, beach club, and heritage property comes with explicit commercial filming rights.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                                <div className="flex items-center gap-2 text-xs text-zinc-200">
                                    <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                                    <span>Pre-cleared Drone Zones</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-zinc-200">
                                    <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                                    <span>Golden-Hour Villa Access</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-zinc-200">
                                    <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                                    <span>Commercial Day Passes</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Creator House Residency Card */}
                    <Card className="relative overflow-hidden rounded-3xl border border-border/80 bg-black min-h-[460px] flex flex-col justify-end p-6 sm:p-10 shadow-2xl">
                        <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            preload="metadata"
                            src="https://assets.mixkit.co/videos/2168/2168-1080.mp4"
                            className="absolute inset-0 size-full object-cover opacity-50"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                        <div className="relative z-10 space-y-4 text-white">
                            <div className="inline-flex items-center gap-2 rounded-full bg-black/70 backdrop-blur-md border border-white/20 px-3.5 py-1.5 text-xs font-medium text-amber-400">
                                <Home className="size-3.5" />
                                <span>Creator House Residencies</span>
                            </div>

                            <h3 className="text-2xl font-bold tracking-tight">
                                Monthly Residencies in Siolim &amp; Morjim
                            </h3>

                            <p className="text-zinc-300 text-sm leading-relaxed">
                                Live and create alongside top travel filmmakers, photographers, and editors for 10-day immersive creative sprints.
                            </p>

                            <div className="space-y-2.5 pt-2 border-t border-white/15 text-xs text-zinc-300">
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-1.5 text-zinc-400">
                                        <Calendar className="size-3.5 text-amber-400" /> Next Cohort
                                    </span>
                                    <span className="font-semibold text-white">December 2026</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-1.5 text-zinc-400">
                                        <MapPin className="size-3.5 text-amber-400" /> Location
                                    </span>
                                    <span className="font-semibold text-white">Morjim Beachfront Villa</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-1.5 text-zinc-400">
                                        <Users className="size-3.5 text-amber-400" /> Selected Creators
                                    </span>
                                    <span className="font-semibold text-amber-400">12 Spots Only</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </section>
    )
}
