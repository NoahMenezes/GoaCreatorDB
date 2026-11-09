import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function CallToAction() {
    return (
        <section className="py-16 md:py-24 border-t border-border/50" id="contact">
            <div className="mx-auto max-w-7xl px-6">
                <div className="flex items-center justify-center gap-6 max-lg:flex-col max-lg:text-center lg:items-end lg:justify-between">
                    <div className="space-y-4 max-w-2xl">
                        <span className="text-xs font-semibold uppercase tracking-wider text-amber-500">
                            Get Started Today
                        </span>
                        <h2 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl xl:text-6xl">
                            Ready to shape Goa&apos;s creative story?
                        </h2>
                        <p className="text-muted-foreground text-lg">
                            Join 850+ storytellers, brands, and properties turning Goa into the creative capital of the coast.
                        </p>
                    </div>

                    <Button
                        size="lg"
                        className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-8"
                        nativeButton={false}
                        render={<Link href="#pricing">Claim Your Creator Handle</Link>}
                    />
                </div>
            </div>
        </section>
    )
}
