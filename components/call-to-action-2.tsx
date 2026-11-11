'use client'

import { Button } from '@/components/ui/button'
import { Check, Megaphone, Search } from 'lucide-react'
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
        <section className="py-16 sm:py-20" id="contact">
            <div className="mx-auto max-w-7xl px-6">
                <div className="relative overflow-hidden rounded-3xl bg-[#0c4e40] dark:bg-emerald-950 border border-emerald-700/40 px-6 py-14 sm:py-20 text-center shadow-xl">
                    <div className="mx-auto max-w-3xl space-y-6">
                        {/* Megaphone Icon */}
                        <div className="size-12 rounded-full bg-emerald-600/30 border border-emerald-500/30 text-emerald-200 flex items-center justify-center mx-auto">
                            <Megaphone className="size-5" />
                        </div>

                        {/* Heading */}
                        <h2 className="text-balance text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
                            Ready to amplify your brand across Goa?
                        </h2>

                        {/* Subheading */}
                        <p className="text-emerald-100/90 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                            Join over 150+ coastal resorts, artisanal bistros, and experience brands connecting with certified creators today.
                        </p>

                        {/* Search Bar Input */}
                        <form
                            onSubmit={handleSearch}
                            className="mx-auto max-w-xl flex flex-col sm:flex-row items-center gap-2 rounded-2xl sm:rounded-full bg-white p-2 shadow-lg"
                        >
                            <div className="flex items-center gap-2 px-3 w-full text-zinc-500">
                                <Search className="size-4 shrink-0" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by niche or location (e.g. Assagao, Cafes, Stays)"
                                    className="w-full bg-transparent text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full sm:w-auto shrink-0 bg-[#0c4e40] hover:bg-[#093d32] text-white rounded-xl sm:rounded-full px-5 py-2 text-xs sm:text-sm font-semibold cursor-pointer h-10 shadow-xs"
                            >
                                <span>Get Started</span>
                                <span className="ml-1">&rarr;</span>
                            </Button>
                        </form>

                        {/* Feature Badges */}
                        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-2 text-xs text-emerald-100/90 font-medium">
                            <div className="flex items-center gap-1.5">
                                <Check className="size-3.5 text-emerald-300 stroke-[3]" />
                                <span>No setup fees</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Check className="size-3.5 text-emerald-300 stroke-[3]" />
                                <span>Escrow secured</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Check className="size-3.5 text-emerald-300 stroke-[3]" />
                                <span>Instant direct chat</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
