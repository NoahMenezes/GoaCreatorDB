'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, MapPin, Trash2, Loader2, AlertCircle, RefreshCw, Bookmark } from 'lucide-react'

interface ShortlistCreator {
    business_id: number
    creator_id: number
    note: string | null
    saved_at: string
    full_name: string
    bio: string | null
    area_name: string
    taluka: string
    district: string
    primary_category: string | null
    total_followers: number
    avg_engagement_rate: number
    avg_rating: number
    review_count: number
    min_paid_rate: number | null
    accepts_barter: boolean
    is_verified: boolean
    handle: string | null
    profile_url: string | null
}

export default function BusinessShortlistPage() {
    const [shortlist, setShortlist] = useState<ShortlistCreator[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [removingId, setRemovingId] = useState<number | null>(null)

    const fetchShortlist = async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch('/api/shortlist', { credentials: 'include' })
            const data = await res.json()
            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Failed to load shortlist')
            }
            setShortlist(data.data || [])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch shortlist')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchShortlist()
    }, [])

    const handleRemove = async (creatorId: number) => {
        setRemovingId(creatorId)
        try {
            const res = await fetch(`/api/shortlist/${creatorId}`, {
                method: 'DELETE',
                credentials: 'include',
            })
            const data = await res.json()
            if (res.ok && data.success) {
                setShortlist((prev) => prev.filter((item) => item.creator_id !== creatorId))
            } else {
                alert(data.error || 'Failed to remove from shortlist')
            }
        } catch (err) {
            alert(`Error: ${err instanceof Error ? err.message : String(err)}`)
        } finally {
            setRemovingId(null)
        }
    }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase()
    }

    const formatFollowers = (count: number) => {
        if (!count) return '0'
        if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
        if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
        return String(count)
    }

    return (
        <main className="space-y-8">
            <div className="border border-border bg-card p-6 rounded-sm shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                        Shortlisted Goan Creators
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Manage your saved creator bookmarks for upcoming tasting, resort, and dining campaigns
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <span className="border border-border bg-muted px-3 py-1.5 text-xs font-bold text-foreground rounded-sm">
                        {shortlist.length} Creators Saved
                    </span>
                    <Link
                        href="/business/discover"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm px-5 py-3 transition-colors rounded-sm shadow-sm"
                    >
                        + Discover More
                    </Link>
                </div>
            </div>

            {loading ? (
                <div className="border border-border bg-card p-12 text-center rounded-sm shadow-sm flex flex-col items-center justify-center space-y-3">
                    <Loader2 className="size-8 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">Loading your shortlisted creators...</p>
                </div>
            ) : error ? (
                <div className="border border-destructive/20 bg-destructive/5 p-6 rounded-sm text-center space-y-3">
                    <AlertCircle className="size-8 text-destructive mx-auto" />
                    <p className="text-sm font-semibold text-destructive">{error}</p>
                    <button
                        type="button"
                        onClick={fetchShortlist}
                        className="inline-flex items-center gap-2 bg-background border border-border px-4 py-2 text-xs font-bold hover:bg-muted rounded-sm transition-colors cursor-pointer"
                    >
                        <RefreshCw className="size-3.5" />
                        <span>Try Again</span>
                    </button>
                </div>
            ) : shortlist.length === 0 ? (
                <div className="border border-border bg-card p-12 text-center rounded-sm shadow-sm space-y-3">
                    <Bookmark className="size-10 text-muted-foreground mx-auto stroke-1" />
                    <h3 className="text-base font-bold text-foreground">No creators shortlisted</h3>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                        Bookmark creators from the Discover portal to build your collaboration roster.
                    </p>
                    <Link
                        href="/business/discover"
                        className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 text-xs font-bold rounded-sm hover:bg-primary/90 transition-colors mt-2"
                    >
                        <span>Browse Creators</span>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {shortlist.map((cr) => (
                        <div
                            key={cr.creator_id}
                            className="border border-border bg-card p-5 rounded-sm shadow-sm space-y-4 hover:border-primary/50 transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="size-14 overflow-hidden border border-border shrink-0 rounded-md bg-muted flex items-center justify-center font-bold text-base text-muted-foreground">
                                        {getInitials(cr.full_name)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            <h3 className="text-sm font-bold text-foreground">{cr.full_name}</h3>
                                            {cr.is_verified && (
                                                <CheckCircle2 className="size-3.5 fill-primary text-white" />
                                            )}
                                        </div>
                                        <span className="text-xs text-muted-foreground font-mono">
                                            {cr.handle ? `@${cr.handle.replace(/^@/, '')}` : `@creator_${cr.creator_id}`}
                                        </span>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                            <MapPin className="size-3 text-primary" />
                                            <span>{cr.area_name || 'Goa'} &bull; {cr.primary_category || 'General'}</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    disabled={removingId === cr.creator_id}
                                    onClick={() => handleRemove(cr.creator_id)}
                                    aria-label="Remove from shortlist"
                                    className="size-8 border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-sm transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    {removingId === cr.creator_id ? (
                                        <Loader2 className="size-4 animate-spin text-primary" />
                                    ) : (
                                        <Trash2 className="size-4" />
                                    )}
                                </button>
                            </div>

                            <div className="grid grid-cols-3 gap-2 py-2 border-y border-border text-center text-xs">
                                <div>
                                    <span className="font-extrabold text-foreground block">
                                        {formatFollowers(cr.total_followers)}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Followers</span>
                                </div>
                                <div>
                                    <span className="font-extrabold text-primary block">
                                        {Number(cr.avg_engagement_rate || 0).toFixed(1)}%
                                    </span>
                                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Eng. Rate</span>
                                </div>
                                <div>
                                    <span className="font-extrabold text-foreground block">
                                        {cr.min_paid_rate ? `₹${Number(cr.min_paid_rate).toLocaleString()}` : 'Barter'}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Base Rate</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <Link
                                    href={`/business/discover?q=${encodeURIComponent(cr.full_name)}`}
                                    className="flex-1 border border-border bg-background hover:bg-muted text-foreground text-center font-bold text-xs py-2 transition-colors rounded-sm"
                                >
                                    View in Discover &rarr;
                                </Link>

                                <Link
                                    href={`/business/requests`}
                                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground text-center font-bold text-xs py-2 transition-colors rounded-sm"
                                >
                                    Send Collab Request
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    )
}
