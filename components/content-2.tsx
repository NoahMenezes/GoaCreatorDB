import { ShieldCheck, Zap } from 'lucide-react'

export default function ContentSection() {
    return (
        <section className="py-16 md:py-20" id="locations">
            <div className="mx-auto max-w-7xl px-6">
                <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:gap-12">
                    <h2 className="max-w-md text-balance text-4xl font-medium tracking-tight lg:text-5xl">
                        The creator network built for Goa’s creative scene.
                    </h2>
                    <div className="space-y-6 lg:space-y-12">
                        <p className="text-muted-foreground text-balance text-lg">
                            Goa Creator unites storytellers, heritage properties, beach clubs, and lifestyle brands. Say goodbye to cluttered DMs, delayed invoices, and permit guesswork.
                        </p>

                        <div className="grid gap-4 pt-6 sm:grid-cols-2">
                            <p className="text-muted-foreground text-balance text-lg">
                                <span className="text-foreground font-medium">
                                    <Zap className="inline size-4 -translate-y-0.5 text-amber-500" /> Fast Collabs.
                                </span>{' '}
                                Match directly with brands seeking your exact style and audience.
                            </p>

                            <p className="text-muted-foreground text-balance text-lg">
                                <span className="text-foreground font-medium">
                                    <ShieldCheck className="inline size-4 -translate-y-0.5 text-emerald-500" /> Escrow Security.
                                </span>{' '}
                                Guaranteed payouts released automatically on deliverable approval.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
