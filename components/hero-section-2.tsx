import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { HeroHeader } from '@/components/hero-section-2-header'
import LogoCloud from '@/components/hero-section-2-logo-cloud'

export default function HeroSection() {
    return (
        <>
            <HeroHeader />
            <main className="overflow-hidden">
                <section className="pt-36 sm:pt-44">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="flex justify-between gap-6 max-md:flex-col md:items-end lg:mt-12">
                            <div className="max-w-2xl space-y-4">
                                <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                                    🌴 The Premier Creator Ecosystem in Goa
                                </span>
                                <h1 className="text-balance text-5xl font-medium tracking-tight md:text-6xl">
                                    Create, Collab &amp; Thrive Across Goa
                                </h1>
                                <p className="text-muted-foreground text-lg leading-relaxed max-w-xl">
                                    Connect with luxury villas, beach clubs, and lifestyle brands. Unlock secret shoot locations, monetize local experiences, and scale your creative brand in paradise.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <Button
                                    className="w-fit"
                                    size="lg"
                                    nativeButton={false}
                                    render={<Link href="#pricing">Join as Creator</Link>}
                                />
                                <Button
                                    className="w-fit"
                                    variant="outline"
                                    size="lg"
                                    nativeButton={false}
                                    render={<Link href="#features">Explore Platform</Link>}
                                />
                            </div>
                        </div>

                        <div className="relative -mx-2 mt-8 overflow-hidden rounded-3xl bg-black p-2 max-sm:-mr-56 sm:mt-12">
                            <div className="bg-background ring-foreground/6.5 before:mask-radial-at-top-left before:mask-radial-from-65% before:mask-radial-[100%_60%] before:ring-foreground before:border-foreground/10 relative rounded-2xl p-2 shadow-2xl shadow-black/55 ring before:absolute before:-inset-px before:z-10 before:size-56 before:rounded-tl-2xl before:border-l before:border-t">
                                <div className="bg-foreground/2 z-1 absolute inset-0 rounded-2xl"></div>
                                <Image
                                    className="bg-background aspect-15/8 relative rounded-2xl object-cover"
                                    src="/mail2.png"
                                    alt="Goa Creator Dashboard"
                                    width={2700}
                                    height={1440}
                                    priority
                                />
                            </div>
                        </div>
                    </div>
                </section>
                <LogoCloud />
            </main>
        </>
    )
}
