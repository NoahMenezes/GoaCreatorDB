'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    Anchor,
    Bell,
    Bookmark,
    Check,
    CheckCircle2,
    ChevronDown,
    Compass,
    LayoutDashboard,
    MapPin,
    Plus,
    Search,
    Send,
    ShieldCheck,
    Star,
    Store,
    X,
} from 'lucide-react'
import { AnimatedThemeToggler } from '@/registry/magicui/animated-theme-toggler'

export default function BusinessLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const [isCollabModalOpen, setIsCollabModalOpen] = useState(false)
    const [selectedAddons, setSelectedAddons] = useState<string[]>(['reel'])
    const [campaignBrief, setCampaignBrief] = useState(
        'Monsoon Weekend Tasting Menu & Heritage Sourdough Walkthrough for Café Palmeira'
    )
    const [requestSuccess, setRequestSuccess] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [locationFilter, setLocationFilter] = useState('All Goa / North & South')

    const baseRate = 14000
    const addonPrices: Record<string, number> = {
        reel: 0,
        carousel: 6000,
        stories: 4500,
        license: 0,
    }

    const calculatedTotal =
        baseRate +
        selectedAddons.reduce((acc, curr) => acc + (addonPrices[curr] || 0), 0)

    const toggleAddon = (id: string) => {
        if (id === 'reel') return
        setSelectedAddons((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        )
    }

    const handleSendRequest = (e: React.FormEvent) => {
        e.preventDefault()
        setRequestSuccess(true)
        setTimeout(() => {
            setIsCollabModalOpen(false)
            setRequestSuccess(false)
        }, 1800)
    }

    const navItems = [
        { href: '/business/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/business/discover', label: 'Discover Creators', icon: Compass },
        { href: '/business/shortlist', label: 'Shortlist', icon: Bookmark, badge: '4' },
        { href: '/business/requests', label: 'My Requests', icon: Send, badge: '2 active' },
        { href: '/business/reviews', label: 'Reviews', icon: Star },
        { href: '/business/profile', label: 'Profile', icon: Store },
    ]

    return (
        <div className="min-h-screen flex bg-background text-foreground transition-colors duration-200">
            {/* LEFT SIDEBAR - SHARP EDGES (rounded-none) */}
            <aside className="w-64 border-r border-border/80 bg-card/60 hidden md:flex flex-col justify-between p-4 shrink-0 sticky top-0 h-screen overflow-y-auto">
                <div className="space-y-6">
                    {/* Brand Header */}
                    <Link href="/business/dashboard" className="flex items-center gap-2.5 px-2 py-1">
                        <div className="size-9 bg-teal-800 text-white flex items-center justify-center rounded-none shadow-none">
                            <Anchor className="size-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-sans text-base font-extrabold tracking-tight text-foreground leading-none">
                                GoaConnect
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-teal-700 dark:text-teal-400 mt-1">
                                BUSINESS PORTAL
                            </span>
                        </div>
                    </Link>

                    {/* Navigation Links - All Sharp Pointed Corners */}
                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon
                            const isActive =
                                pathname === item.href ||
                                (item.href === '/business/discover' && pathname === '/business/portal')

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer rounded-none ${
                                        isActive
                                            ? 'bg-[#0c4e40] text-white shadow-none border-l-4 border-emerald-400'
                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon className="size-4" />
                                        <span>{item.label}</span>
                                    </div>
                                    {item.badge && (
                                        <span
                                            className={`text-[10px] px-2 py-0.5 font-bold rounded-none ${
                                                isActive
                                                    ? 'bg-white/20 text-white'
                                                    : 'bg-muted text-muted-foreground border border-border/60'
                                            }`}
                                        >
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            )
                        })}
                    </nav>
                </div>

                {/* Bottom Account Card (Café Palmeira, Calangute, Goa) - Sharp Edges */}
                <div className="space-y-3 pt-4 border-t border-border/80">
                    <div className="border border-border/80 bg-card p-3 flex items-center justify-between rounded-none shadow-none">
                        <div className="flex items-center gap-2.5">
                            <div className="size-9 bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 flex items-center justify-center shrink-0 rounded-none">
                                <Store className="size-4.5" />
                            </div>
                            <div className="text-left">
                                <div className="text-xs font-bold text-foreground">Café Palmeira</div>
                                <div className="text-[11px] text-muted-foreground">Calangute, Goa</div>
                            </div>
                        </div>
                        <ChevronDown className="size-4 text-muted-foreground" />
                    </div>

                    <div className="flex items-center justify-between px-2 text-[11px] text-muted-foreground">
                        <Link href="/join" className="hover:text-foreground hover:underline">
                            Switch Role
                        </Link>
                        <button
                            type="button"
                            onClick={async () => {
                                await fetch('/api/auth/logout', { method: 'POST' })
                                // eslint-disable-next-line @next/next/no-location-assign-relative-destination
                                window.location.href = '/login'
                            }}
                            className="hover:text-foreground hover:underline cursor-pointer"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* TOP BAR - All Sharp Corners */}
                <header className="h-16 border-b border-border/80 bg-card/60 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-30">
                    {/* Search Input */}
                    <div className="flex items-center gap-3 flex-1 max-w-xl">
                        <div className="relative flex items-center w-full">
                            <Search className="absolute left-3.5 size-4 text-muted-foreground" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search creators by niche, taluka, name..."
                                className="w-full border border-border bg-background pl-10 pr-3.5 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-teal-700 rounded-none"
                            />
                        </div>

                        {/* Location Dropdown */}
                        <div className="hidden sm:flex items-center gap-1.5 border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground shrink-0 cursor-pointer hover:bg-muted rounded-none">
                            <MapPin className="size-3.5 text-teal-700 dark:text-teal-400" />
                            <select
                                value={locationFilter}
                                onChange={(e) => setLocationFilter(e.target.value)}
                                className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer rounded-none"
                            >
                                <option value="All Goa / North & South">All Goa / North &amp; South</option>
                                <option value="North Goa (Calangute, Assagao)">North Goa (Calangute, Assagao)</option>
                                <option value="South Goa (Margao, Salcete)">South Goa (Margao, Salcete)</option>
                                <option value="Panjim & Tiswadi">Panjim &amp; Tiswadi</option>
                            </select>
                        </div>
                    </div>

                    {/* Right Action Buttons */}
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setIsCollabModalOpen(true)}
                            className="bg-[#0c4e40] hover:bg-[#08382e] text-white text-xs font-semibold px-4 py-2 flex items-center gap-1.5 cursor-pointer shadow-none transition-colors rounded-none"
                        >
                            <Plus className="size-3.5" />
                            <span>New Request</span>
                        </button>

                        <AnimatedThemeToggler className="flex size-9 items-center justify-center border border-border bg-background text-foreground hover:bg-muted duration-150 cursor-pointer rounded-none" />

                        <div className="relative">
                            <button
                                type="button"
                                aria-label="Notifications"
                                className="size-9 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer rounded-none"
                            >
                                <Bell className="size-4" />
                            </button>
                            <span className="absolute top-1.5 right-1.5 size-2 bg-emerald-500 rounded-none" />
                        </div>

                        {/* User Avatar - Sharp Pointed Square */}
                        <div className="size-9 bg-teal-900 border border-teal-700 text-white flex items-center justify-center font-bold text-xs rounded-none">
                            CP
                        </div>
                    </div>
                </header>

                {/* PAGE INJECTION */}
                <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
                    {children}
                </div>
            </div>

            {/* SEND COLLAB REQUEST MODAL - SHARP CORNERS */}
            {isCollabModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
                    <div className="relative w-full max-w-xl border border-border bg-card p-6 sm:p-8 shadow-2xl space-y-6 rounded-none max-h-[90vh] overflow-y-auto">
                        <button
                            type="button"
                            onClick={() => setIsCollabModalOpen(false)}
                            aria-label="Close modal"
                            className="absolute top-5 right-5 size-8 bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer rounded-none"
                        >
                            <X className="size-4" />
                        </button>

                        <div className="space-y-1.5 border-b border-border/80 pb-4">
                            <div className="inline-flex items-center gap-1.5 bg-teal-500/10 border border-teal-500/20 px-2.5 py-0.5 text-[11px] font-bold text-teal-800 dark:text-teal-300 rounded-none uppercase">
                                <ShieldCheck className="size-3.5 text-teal-600" />
                                <span>GoaConnect Escrow Guarantee</span>
                            </div>
                            <h2 className="text-xl font-extrabold text-foreground tracking-tight">
                                Send Collaboration Request
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Lock campaign funds in escrow safely. Payment is released only after deliverables are approved.
                            </p>
                        </div>

                        {requestSuccess ? (
                            <div className="p-8 text-center space-y-3 bg-emerald-500/10 border border-emerald-500/30 rounded-none">
                                <CheckCircle2 className="size-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
                                <h3 className="text-base font-bold text-foreground">
                                    Collab Request Sent Successfully!
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Funds of ₹{calculatedTotal.toLocaleString()} are held securely in escrow pending acceptance.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSendRequest} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-foreground">
                                        Campaign Title &amp; Objectives *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={campaignBrief}
                                        onChange={(e) => setCampaignBrief(e.target.value)}
                                        className="w-full border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-teal-700 rounded-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-foreground">
                                        Select Deliverables
                                    </label>
                                    <div className="space-y-2">
                                        {[
                                            { id: 'reel', label: '1 Dedicated Instagram Reel (30–60s)', cost: 'Included (Base ₹14,000)' },
                                            { id: 'carousel', label: 'Photo Carousel (6–10 slides)', cost: '+₹6,000' },
                                            { id: 'stories', label: 'Story Sequence (3–5x frames)', cost: '+₹4,500' },
                                            { id: 'license', label: 'Full Commercial Meta Ad License (6 Mos)', cost: 'Included' },
                                        ].map((deliv) => {
                                            const isChecked = selectedAddons.includes(deliv.id)
                                            return (
                                                <div
                                                    key={deliv.id}
                                                    onClick={() => toggleAddon(deliv.id)}
                                                    className={`border p-3 flex items-center justify-between text-xs cursor-pointer transition-colors rounded-none ${
                                                        isChecked
                                                            ? 'border-teal-700 bg-teal-50/20 dark:bg-teal-950/20'
                                                            : 'border-border bg-background hover:bg-muted/40'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <div
                                                            className={`size-4 border flex items-center justify-center rounded-none ${
                                                                isChecked
                                                                    ? 'bg-teal-700 border-teal-700 text-white'
                                                                    : 'border-border'
                                                            }`}
                                                        >
                                                            {isChecked && <Check className="size-3 stroke-[3]" />}
                                                        </div>
                                                        <span className="font-semibold text-foreground">{deliv.label}</span>
                                                    </div>
                                                    <span className="text-[11px] font-bold text-muted-foreground">{deliv.cost}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Order Summary */}
                                <div className="bg-muted/40 p-4 border border-border/80 space-y-2 rounded-none">
                                    <div className="flex items-center justify-between text-xs font-semibold">
                                        <span className="text-muted-foreground">Base Dedicated Reel:</span>
                                        <span className="text-foreground">₹{baseRate.toLocaleString()}</span>
                                    </div>
                                    {selectedAddons.filter((a) => a !== 'reel').map((addon) => (
                                        <div key={addon} className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                                            <span>+ {addon === 'carousel' ? 'Photo Carousel' : 'Story Sequence'}:</span>
                                            <span>₹{addonPrices[addon].toLocaleString()}</span>
                                        </div>
                                    ))}
                                    <div className="flex items-center justify-between pt-2 border-t border-border/60 text-sm font-bold">
                                        <span className="text-foreground">Total Escrow Budget:</span>
                                        <span className="text-teal-800 dark:text-teal-300">₹{calculatedTotal.toLocaleString()}</span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-[#0c4e40] hover:bg-[#08382e] text-white font-semibold h-11 text-xs sm:text-sm flex items-center justify-center gap-2 shadow-none cursor-pointer transition-colors rounded-none"
                                >
                                    <ShieldCheck className="size-4" />
                                    <span>Lock Deal &amp; Submit Request via Escrow</span>
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
