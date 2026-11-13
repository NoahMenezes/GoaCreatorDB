'use client'

import { Check, Search } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CallToAction() {
    const [searchQuery, setSearchQuery] = useState('')
    const router = useRouter()

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        const el = document.getElementById('creators')
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' })
        } else {
            router.push('#creators')
        }
    }

    return (
        <section id="contact" className="py-16 sm:py-24 border-t border-border">
            <div className="mx-auto max-w-7xl px-6">
                <div className="rounded-sm border border-border bg-card p-8 sm:p-12 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="space-y-2 sm:text-left text-center sm:text-left">
                        <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                            Ready to amplify your brand across Goa?
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Join over 150+ coastal resorts, artisanal bistros, and experience brands connecting with certified creators today.
                        </p>
                    </div>

                    <form
                        onSubmit={handleSearch}
                        className="w-full sm:w-96 flex flex-col sm:flex-row items-center gap-2 rounded-sm border border-border bg-background p-2"
                    >
                        <div className="flex items-center gap-2 px-3 w-full text-muted-foreground">
                            <Search className="size-4 shrink-0" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by niche or location (e.g. Assagao, Cafes, Stays)"
                                className="w-full bg-transparent text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-sm px-4 py-2 cursor-pointer transition-colors shadow-sm whitespace-nowrap"
                        >
                            Get Started
                        </button>
                    </form>
                </div>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-8 pt-6 text-xs text-muted-foreground font-medium">
                    <div className="flex items-center gap-1.5">
                        <Check className="size-3.5 text-primary stroke-[3]" />
                        <span>No setup fees</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Check className="size-3.5 text-primary stroke-[3]" />
                        <span>Escrow secured</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Check className="size-3.5 text-primary stroke-[3]" />
                        <span>Instant direct chat</span>
                    </div>
                </div>
            </div>
        </section>
    )
}
