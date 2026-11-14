'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    Anchor,
    Bell,
    Bookmark,
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
    const [selectedCreatorId, setSelectedCreatorId] = useState<number | ''>('')
    const [availableCreators, setAvailableCreators] = useState<{ id: number; name: string }[]>([])
    const [requestSuccess, setRequestSuccess] = useState(false)
    const [requestSubmitting, setRequestSubmitting] = useState(false)
    const [requestError, setRequestError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [locationFilter, setLocationFilter] = useState('All Goa / North & South')

    useEffect(() => {
        async function fetchModalCreators() {
            try {
                const res = await fetch('/api/creators?limit=20')
                if (res.ok) {
                    const data = await res.json()
                    if (Array.isArray(data.data) && data.data.length > 0) {
                        const list = data.data.map((c: { id: number; creator_id: number; full_name: string; name: string }) => ({
                            id: Number(c.creator_id || c.id),
                            name: c.full_name || c.name || 'Creator',
                        }))
                        setAvailableCreators(list)
                        setSelectedCreatorId(list[0].id)
                    }
                }
            } catch (err) {
                console.error('Failed to load creators for modal:', err)
            }
        }
        fetchModalCreators()
    }, [])

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

    const handleSendRequest = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedCreatorId) {
            setRequestError('Please select a creator to receive the proposal')
            return
        }

        setRequestSubmitting(true)
        setRequestError(null)

        const selectedDeliverablesText = selectedAddons
            .map((id) => {
                if (id === 'reel') return '1 Dedicated Instagram Reel (30–60s)'
                if (id === 'carousel') return 'Photo Carousel (6–10 slides)'
                if (id === 'stories') return 'Story Sequence (3–5x frames)'
                if (id === 'license') return 'Full Commercial License (6 Mos)'
                return id
            })
            .join(', ')

        const futureDeadline = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]

        try {
            const res = await fetch('/api/requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    creator_id: Number(selectedCreatorId),
                    collab_type: 'paid',
                    offered_amount: calculatedTotal,
                    offer_details: campaignBrief,
                    deliverables: selectedDeliverablesText,
                    deadline: futureDeadline,
                    message: `Booking request from Café Palmeira: ${campaignBrief}`,
                }),
            })

            const data = await res.json()
            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Failed to submit collaboration request')
            }

            setRequestSuccess(true)
            setTimeout(() => {
                setIsCollabModalOpen(false)
                setRequestSuccess(false)
            }, 2000)
        } catch (err) {
            setRequestError(err instanceof Error ? err.message : 'Error sending request')
        } finally {
            setRequestSubmitting(false)
        }
    }

    const navItems = [
        { href: '/business/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/business/discover', label: 'Discover Creators', icon: Compass },
        { href: '/business/shortlist', label: 'Shortlist', icon: Bookmark },
        { href: '/business/requests', label: 'My Requests', icon: Send },
        { href: '/business/reviews', label: 'Reviews', icon: Star },
        { href: '/business/profile', label: 'Profile', icon: Store },
    ]

    return (
        <div className="min-h-screen flex bg-background text-foreground">
            {/* LEFT SIDEBAR - SHARP EDGES */}
            <aside className="w-64 border-r border-border bg-card hidden md:flex flex-col justify-between p-4 shrink-0 sticky top-0 h-screen overflow-y-auto">
                <div className="space-y-6">
                    {/* Brand Header */}
                    <Link href="/business/dashboard" className="flex items-center gap-2.5 px-2 py-1">
                        <div className="size-9 bg-primary text-primary-foreground flex items-center justify-center">
                            <Anchor className="size-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-base font-extrabold tracking-tight text-foreground leading-none">
                                GoaConnect
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary mt-1">
                                BUSINESS PORTAL
                            </span>
                        </div>
                    </Link>

                    {/* Navigation Links */}
                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon
                            const isActive =
                                pathname === item.href ||
                                (item.href === '/business/dashboard' && (pathname === '/business/portal' || pathname === '/business'))

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs sm:text-sm font-semibold transition-colors duration-150 cursor-pointer ${isActive
                                        ? 'bg-primary text-primary-foreground border-l-4 border-l-accent-foreground'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon className="size-4" />
                                        <span>{item.label}</span>
                                    </div>
                                </Link>
                            )
                        })}
                    </nav>
                </div>

                {/* Bottom Account Area */}
                <div className="space-y-3 pt-4 border-t border-border">
                    <div className="border border-border bg-card p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="size-9 bg-secondary text-secondary-foreground flex items-center justify-center shrink-0">
                                <Store className="size-4.5" />
                            </div>
                            <div className="text-left">
                                <div className="text-xs font-bold text-foreground">Café Palmeira</div>
                                <div className="text-[11px] text-muted-foreground">Calangute, Goa</div>
                            </div>
                        </div>
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
                {/* TOP BAR */}
                <header className="h-16 border-b border-border bg-card px-4 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-30">
                    {/* Search Input */}
                    <div className="flex items-center gap-3 flex-1 max-w-xl">
                        <div className="relative flex items-center w-full">
                            <Search className="absolute left-3.5 size-4 text-muted-foreground" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search creators by niche, taluka, name..."
                                className="w-full border border-border bg-background pl-10 pr-3.5 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>

                        {/* Location Dropdown */}
                        <div className="hidden sm:flex items-center gap-1.5 border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground shrink-0 cursor-pointer hover:bg-muted">
                            <MapPin className="size-3.5 text-primary" />
                            <select
                                value={locationFilter}
                                onChange={(e) => setLocationFilter(e.target.value)}
                                className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
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
                            className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold px-4 py-2 flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                            <Plus className="size-3.5" />
                            <span>New Request</span>
                        </button>

                        <div className="relative">
                            <button
                                type="button"
                                aria-label="Notifications"
                                className="size-9 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                            >
                                <Bell className="size-4" />
                            </button>
                            <span className="absolute top-1.5 right-1.5 size-2 bg-primary" />
                        </div>

                        <div className="size-9 bg-secondary border border-border text-secondary-foreground flex items-center justify-center font-bold text-xs">
                            CP
                        </div>
                    </div>
                </header>
                <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
                    {children}
                </div>
            </div>
            {isCollabModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
                    <div className="relative w-full max-w-xl border border-border bg-card p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
                        <button
                            type="button"
                            onClick={() => setIsCollabModalOpen(false)}
                            aria-label="Close modal"
                            className="absolute top-5 right-5 size-8 bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                            <X className="size-4" />
                        </button>

                        <div className="space-y-1.5 border-b border-border pb-4">
                            <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[11px] font-bold text-primary dark:text-primary/80 uppercase">
                                <ShieldCheck className="size-3.5 text-primary" />
                                <span>Escrow Guarantee</span>
                            </div>
                            <h2 className="text-xl font-extrabold text-foreground tracking-tight">
                                Send Collaboration Request
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Lock campaign funds in escrow. Payment releases after deliverables are approved.
                            </p>
                        </div>

                        {requestSuccess ? (
                            <div className="p-8 text-center space-y-3">
                                <ShieldCheck className="size-10 text-primary mx-auto" />
                                <h3 className="text-base font-bold text-foreground">
                                    Request Sent
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    ₹{calculatedTotal.toLocaleString()} offer submitted pending creator response.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSendRequest} className="space-y-4">
                                {requestError && (
                                    <div className="p-3 border border-destructive/20 bg-destructive/5 text-destructive text-xs font-semibold rounded-sm">
                                        {requestError}
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-foreground">
                                        Select Creator
                                    </label>
                                    <select
                                        value={selectedCreatorId}
                                        onChange={(e) => setSelectedCreatorId(Number(e.target.value))}
                                        className="w-full border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                                    >
                                        {availableCreators.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-foreground">
                                        Campaign Title &amp; Objectives
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={campaignBrief}
                                        onChange={(e) => setCampaignBrief(e.target.value)}
                                        className="w-full border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-foreground">
                                        Deliverables
                                    </label>
                                    <div className="space-y-2">
                                        {[
                                            { id: 'reel', label: '1 Dedicated Instagram Reel (30–60s)', cost: 'Included (Base ₹14,000)' },
                                            { id: 'carousel', label: 'Photo Carousel (6–10 slides)', cost: '+₹6,000' },
                                            { id: 'stories', label: 'Story Sequence (3–5x frames)', cost: '+₹4,500' },
                                            { id: 'license', label: 'Full Commercial License (6 Mos)', cost: 'Included' },
                                        ].map((deliv) => {
                                            const isChecked = selectedAddons.includes(deliv.id)
                                            return (
                                                <div
                                                    key={deliv.id}
                                                    onClick={() => toggleAddon(deliv.id)}
                                                    className={`border p-3 flex items-center justify-between text-xs cursor-pointer transition-colors ${isChecked
                                                        ? 'border-primary bg-primary/10'
                                                        : 'border-border bg-background hover:bg-muted'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <div
                                                            className={`size-4 border flex items-center justify-center ${isChecked
                                                                ? 'bg-primary border-primary text-primary-foreground'
                                                                : 'border-border'
                                                            }`}
                                                        >
                                                            {isChecked && <ShieldCheck className="size-3 stroke-[3]" />}
                                                        </div>
                                                        <span className="font-semibold text-foreground">{deliv.label}</span>
                                                    </div>
                                                    <span className="text-[11px] font-bold text-muted-foreground">{deliv.cost}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div className="bg-muted p-4 border border-border space-y-2">
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
                                    <div className="flex items-center justify-between pt-2 border-t border-border text-sm font-bold">
                                        <span className="text-foreground">Total Escrow Budget:</span>
                                        <span className="text-primary">₹{calculatedTotal.toLocaleString()}</span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={requestSubmitting}
                                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11 text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                                >
                                    <ShieldCheck className="size-4" />
                                    <span>{requestSubmitting ? 'Submitting Request...' : 'Lock Deal & Submit Request'}</span>
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

