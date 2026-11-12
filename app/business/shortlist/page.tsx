'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
    CheckCircle2,
    MapPin,
    Trash2,
} from 'lucide-react'

export default function BusinessShortlistPage() {
    const [shortlist, setShortlist] = useState([
        {
            id: 'cr-sneha',
            name: 'Sneha Fernandes',
            handle: '@sneha.tastesgoa',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
            coverImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=900&auto=format&fit=crop',
            location: 'Assagao',
            niche: 'Boutique Stays & Heritage',
            followers: '120K',
            engagement: '7.8%',
            rate: '₹8,000 / reel',
            collab: 'Barter Friendly',
        },
        {
            id: 'cr-rohan',
            name: 'Rohan D\'Souza',
            handle: '@rohan.cocktailchronicles',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop',
            coverImage: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=900&auto=format&fit=crop',
            location: 'Anjuna & Vagator',
            niche: 'Cocktails & Nightlife',
            followers: '195K',
            engagement: '6.5%',
            rate: '₹14,000 / reel',
            collab: 'Barter Friendly',
        },
        {
            id: 'cr-alisha',
            name: 'Alisha D\'Cruz',
            handle: '@alishacafecrawls',
            avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop',
            coverImage: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=900&auto=format&fit=crop',
            location: 'Fontainhas',
            niche: 'Coffee Culture & Bakeries',
            followers: '68K',
            engagement: '8.4%',
            rate: '₹5,500 / reel',
            collab: 'Barter Friendly',
        },
        {
            id: 'cr-keith',
            name: 'Keith Sequeira',
            handle: '@chefkeith_goa',
            avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=400&auto=format&fit=crop',
            coverImage: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=900&auto=format&fit=crop',
            location: 'Morjim',
            niche: 'Live Fire & BBQ Gastronomy',
            followers: '142K',
            engagement: '7.1%',
            rate: '₹11,000 / reel',
            collab: 'Barter Friendly',
        },
    ])

    const handleRemove = (id: string) => {
        setShortlist((prev) => prev.filter((item) => item.id !== id))
    }

    return (
        <main className="space-y-6">
            <div className="border border-border/80 bg-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-none shadow-none">
                <div>
                    <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                        Shortlisted Goan Creators
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                        Manage your saved creator bookmarks for upcoming weekend tasting &amp; holiday campaigns
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <span className="border border-border bg-muted/40 px-3 py-1.5 text-xs font-bold text-foreground rounded-none">
                        {shortlist.length} Creators Saved
                    </span>
                    <Link
                        href="/business/discover"
                        className="bg-[#0c4e40] hover:bg-[#08382e] text-white font-bold text-xs px-4 py-2 transition-colors rounded-none shadow-none"
                    >
                        + Discover More
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {shortlist.map((cr) => (
                    <div
                        key={cr.id}
                        className="border border-border/80 bg-card p-5 space-y-4 rounded-none shadow-none hover:border-teal-700 transition-colors"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="size-14 overflow-hidden border border-border shrink-0 rounded-none relative">
                                    <Image
                                        unoptimized
                                        src={cr.avatar}
                                        alt={cr.name}
                                        width={100}
                                        height={100}
                                        className="size-full object-cover rounded-none"
                                    />
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5">
                                        <h3 className="text-sm font-bold text-foreground">{cr.name}</h3>
                                        <CheckCircle2 className="size-3.5 fill-sky-600 text-white" />
                                    </div>
                                    <span className="text-xs text-muted-foreground font-mono">{cr.handle}</span>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                        <MapPin className="size-3 text-teal-700 dark:text-teal-400" />
                                        <span>{cr.location} • {cr.niche}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => handleRemove(cr.id)}
                                aria-label="Remove from shortlist"
                                className="size-8 border border-border flex items-center justify-center text-muted-foreground hover:text-rose-600 transition-colors rounded-none cursor-pointer"
                            >
                                <Trash2 className="size-4" />
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-2 py-2 border-y border-border/60 text-center text-xs">
                            <div>
                                <span className="font-extrabold text-foreground block">{cr.followers}</span>
                                <span className="text-[10px] text-muted-foreground uppercase font-bold">Followers</span>
                            </div>
                            <div>
                                <span className="font-extrabold text-teal-700 dark:text-teal-400 block">{cr.engagement}</span>
                                <span className="text-[10px] text-muted-foreground uppercase font-bold">Eng. Rate</span>
                            </div>
                            <div>
                                <span className="font-extrabold text-foreground block">{cr.rate}</span>
                                <span className="text-[10px] text-muted-foreground uppercase font-bold">Base Rate</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                            <Link
                                href="/business/profile"
                                className="flex-1 border border-border bg-background hover:bg-muted text-foreground text-center font-bold text-xs py-2 transition-colors rounded-none"
                            >
                                View Profile &rarr;
                            </Link>

                            <Link
                                href="/business/requests"
                                className="flex-1 bg-[#0c4e40] hover:bg-[#08382e] text-white text-center font-bold text-xs py-2 transition-colors rounded-none shadow-none"
                            >
                                Send Collab Request
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    )
}
