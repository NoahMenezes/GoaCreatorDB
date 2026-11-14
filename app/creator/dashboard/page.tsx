'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
    Calendar,
    MapPin,
    Share2,
    ShieldCheck,
    Star,
    TrendingUp,
    ChevronRight,
    Bell,
} from 'lucide-react'
import { CollaborationRequestRow, CreatorRow, UserRow } from '@/lib/db'

const statCards = [
    {
        title: 'New Requests',
        value: '--',
        badge: '0 this week',
        sub: 'Action required within 48h',
        icon: Calendar,
        iconColor: 'text-primary',
    },
    {
        title: 'Accepted Collabs',
        value: '--',
        badge: '0 active',
        sub: 'Scheduled for upcoming shoots',
        icon: ShieldCheck,
        iconColor: 'text-primary',
    },
    {
        title: 'Completed Campaigns',
        value: '--',
        badge: '0 on-time',
        sub: 'Since joining GoaConnect',
        icon: Star,
        iconColor: 'text-primary',
    },
    {
        title: 'Average Rating',
        value: '--',
        badge: 'Not yet rated',
        sub: 'Verified venue reviews',
        icon: TrendingUp,
        iconColor: 'text-primary',
    },
]

export default function CreatorDashboardPage() {
    const [stats, setStats] = useState<Record<string, unknown>>({})
    const [requests, setRequests] = useState<CollaborationRequestRow[]>([])
    const [user, setUser] = useState<UserRow | null>(null)
    const [profile, setProfile] = useState<CreatorRow | null>(null)
    const [profileCompleteness, setProfileCompleteness] = useState(0)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, requestsRes, profileRes] = await Promise.all([
                    fetch('/api/dashboard/stats', { credentials: 'include' }),
                    fetch('/api/requests?status=pending', { credentials: 'include' }),
                    fetch('/api/profile', { credentials: 'include' }),
                ])

                if (statsRes.ok) {
                    const statsData = await statsRes.json()
                    setStats(statsData.data || {})
                }
                if (requestsRes.ok) {
                    const reqData = await requestsRes.json()
                    setRequests((reqData.data || []) as unknown as CollaborationRequestRow[])
                }
                if (profileRes.ok) {
                    const profileData = await profileRes.json()
                    setUser((profileData.data?.user || null) as unknown as UserRow | null)
                    setProfile((profileData.data?.profile || null) as unknown as CreatorRow | null)
                    setProfileCompleteness(profileData.data?.completeness || 0)
                }
            } catch (err) {
                console.error('Dashboard load error:', err)
            }
        }
        fetchData()
    }, [])

    return (
        <main className="space-y-10">
            {/* 1. HEADER BANNER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider">
                            <MapPin className="size-3" />
                            {profile?.location_id ? (
                                <span>{String(profile.location_id || '')}</span>
                            ) : (
                                <span>Assagao, Goa</span>
                            )}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md bg-muted border border-border px-2.5 py-0.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            COASTAL LIFESTYLE CREATOR
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                        Welcome back, {user?.email?.split('@')[0] || 'Creator'}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        You have {(stats as { new_requests: number }).new_requests || 0} incoming partnership request{(stats as { new_requests: number }).new_requests !== 1 ? 's' : ''} from businesses awaiting response.
                    </p>
                </div>

                <div className="flex items-end gap-3">
                    <Link
                        href="/creator/profile"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm px-5 py-3 flex items-center gap-2 transition-colors rounded-sm shadow-sm"
                    >
                        <Share2 className="size-4" />
                        <span>Share Media Kit</span>
                    </Link>

                    <button
                        type="button"
                        className="size-9 border border-border bg-background flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-sm cursor-pointer transition-colors"
                        aria-label="Notifications"
                    >
                        <Bell className="size-4" />
                    </button>
                </div>
            </div>

            {/* 2. PROFILE COMPLETENESS */}
            <div className="border border-border bg-card p-5 sm:p-6 rounded-sm shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="size-8 bg-primary text-primary-foreground flex items-center justify-center rounded-sm">
                        <ShieldCheck className="size-4" />
                    </div>
                    <div className="space-y-0.5">
                        <div className="text-sm font-bold text-foreground">Profile Completeness</div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            {profileCompleteness}% Complete
                        </div>
                    </div>
                </div>

                <div className="w-full sm:w-3/4 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${profileCompleteness}%` }} />
                </div>

                {profileCompleteness < 100 && (
                    <Link
                        href="/creator/profile"
                        className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                    >
                        <span>Update Profile</span>
                        <span className="size-3">→</span>
                    </Link>
                )}
            </div>

            {/* 3. STAT CARDS */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card) => {
                    const Icon = card.icon
                    const s = stats as {
                    new_requests: number
                    accepted_collaborations: number
                    completed_campaigns: number
                    average_rating: number
                }
                    let value: string | number = '--'
                    if (card.title === 'New Requests') value = s.new_requests || 0
                    if (card.title === 'Accepted Collabs') value = s.accepted_collaborations || 0
                    if (card.title === 'Completed Campaigns') value = s.completed_campaigns || 0
                    if (card.title === 'Average Rating') value = s.average_rating || 0

                    return (
                        <div
                            key={card.title}
                            className="border border-border bg-card p-5 rounded-sm shadow-sm"
                        >
                            <div className="flex items-center justify-between">
                                <div className="size-8 flex items-center justify-center rounded-md bg-primary/10 border border-primary/10">
                                    <Icon className="size-4 {card.iconColor}" />
                                </div>
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary/10 text-primary border border-primary/20`}>
                                    <span>{card.badge}</span>
                                </span>
                            </div>
                            <div className="text-2xl sm:text-3xl font-black text-foreground mt-3 tracking-tight">
                                {value}
                            </div>
                            <div className="text-[10px] font-bold text-foreground uppercase tracking-wider mt-1">
                                {card.title}
                            </div>
                            <div className="text-[11px] text-muted-foreground mt-0.5 leading-tight">
                                {card.sub}
                            </div>
                        </div>
                    )
                })}
            </section>

            {/* 4. RECENT REQUESTS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <h2 className="text-sm font-bold text-foreground">Recent Requests</h2>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                Collaborations pending your review and acceptance
                            </p>
                        </div>
                        {requests.length > 0 && (
                            <Link
                                href="/creator/requests"
                                className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/90 underline decoration-primary/30"
                            >
                                View All
                                <ChevronRight className="size-3.5" />
                            </Link>
                        )}
                    </div>

                    <div className="space-y-4">
                        {requests.length === 0 ? (
                            <div className="border border-border bg-muted/30 p-8 rounded-sm text-center">
                                <p className="text-sm text-muted-foreground">No pending requests at the moment.</p>
                            </div>
                        ) : (
                            requests.slice(0, 3).map((req) => {
        const r = req
        return (
                                <div
                                    key={req.request_id}
                                    className="border border-border bg-card p-5 rounded-sm shadow-sm"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className="size-12 overflow-hidden border border-border shrink-0 relative rounded-md">
                                                <Image
                                                    src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=200&auto=format&fit=crop"
                                                    alt={r.business_email || 'Business'}
                                                    width={56}
                                                    height={56}
                                                    className="size-full object-cover"
                                                />
                                            </div>
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-1">
                                                    <h3 className="text-sm font-bold text-foreground truncate">
                                                        {r.business_email?.split('@')[0] || 'Business'}
                                                    </h3>
                                                </div>
                                                <p className="text-[10px] text-muted-foreground">
                                                    {r.deliverables || r.offer_details || 'Collaboration Details'}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1.5">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[9px] font-bold ${r.collab_type === 'paid' ? 'bg-primary/10 border-primary/20 text-primary' : 'border-border text-muted-foreground bg-background'}`}>
                                                        {(r.collab_type || '').toUpperCase()}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        ₹{r.offered_amount ?? 0}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:w-auto">
                                            <div className="text-right sm:text-left hidden sm:block">
                                                <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                                                    Deadline
                                                </div>
                                                <div className="text-xs font-medium text-foreground">
                                                    {req.deadline || 'No deadline set'}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Link
                                                    href={`/creator/requests/${req.request_id}`}
                                                    className="border border-border bg-background text-foreground text-xs font-bold px-4 py-2.5 rounded-sm transition-colors hover:bg-muted"
                                                >
                                                    View Details
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        fetch(`/api/requests?id=${req.request_id}&action=accept`, {
                                                            method: 'POST',
                                                            credentials: 'include',
                                                        }).then(() => window.location.reload())
                                                    }}
                                                    className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-4 py-2.5 rounded-sm transition-colors shadow-sm"
                                                >
                                                    Accept
                                                </button>
                                            </div>
                                        </div>
                                    </div>
</div>
                                )
                            }
                        ))}
                    </div>
                </div>

                {/* RIGHT: Dashboard panels */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Audience Growth */}
                    <div className="border border-border bg-card p-5 rounded-sm shadow-sm">
                        <div className="flex items-center justify-between mb-5">
                            <div className="space-y-0.5">
                                <h3 className="text-sm font-bold text-foreground">Audience Growth</h3>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                    Follower trajectory
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="text-xl font-black text-primary">--</div>
                                <div className="text-[10px] text-muted-foreground font-bold">--</div>
                            </div>
                        </div>
                        <div className="h-32 relative">
                            <svg className="w-full h-full text-primary" viewBox="0 0 600 200" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="gradDash" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#0C4E40" stopOpacity="0.2" />
                                        <stop offset="100%" stopColor="#0C4E40" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                <path d="M 40 140 Q 120 100, 200 130 T 360 90 T 520 70 T 580 40" fill="none" stroke="currentColor" strokeWidth="2" />
                                <path d="M 40 140 Q 120 100, 200 130 T 360 90 T 520 70 T 580 40 L 580 170 L 40 170 Z" fill="url(#gradDash)" />
                                {[40, 160, 280, 400, 520, 580].map((x, i) => (
                                    <circle key={i} cx={x} cy={[140, 100, 130, 90, 70, 40][i]} r="3" fill="#0C4E40" />
                                ))}
                                <line x1="40" y1="170" x2="580" y2="170" stroke="var(--border)" strokeWidth="1" />
                            </svg>
                        </div>
                    </div>

                    {/* Engagement & Origin */}
                    <div className="border border-border bg-card p-5 rounded-sm shadow-sm grid grid-cols-2 gap-4">
                        <div className="border-r border-border pr-4">
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">Engagement Rate</div>
                            <div className="text-xl font-bold text-primary">--%</div>
                            <div className="text-[10px] text-muted-foreground font-bold mt-1">Connect Instagram</div>
                        </div>
                        <div>
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">Audience Origin</div>
                            <div className="text-sm font-bold text-foreground">Goa & Mumbai</div>
                        </div>
                    </div>

                    {/* Earnings */}
                    <div className="border border-border bg-card p-5 rounded-sm shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                            <div>
                                <h3 className="text-sm font-bold text-foreground">Monthly Earnings</h3>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">November 2026</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-muted/50 rounded-sm border border-border/60">
                                <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">Cleared Earnings</div>
                                <div className="text-lg font-black text-primary">₹{(stats.total_earnings || 0).toLocaleString()}</div>
                                <div className="text-[10px] text-muted-foreground mt-1">Transferred to bank</div>
                            </div>
                            <div className="p-3 bg-muted/50 rounded-sm border border-border/60">
                                <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">Active Deal Value</div>
                                <div className="text-lg font-black text-primary">₹{(stats.pending_payments || 0).toLocaleString()}</div>
                                <div className="text-[10px] text-muted-foreground mt-1">In active campaigns</div>
                            </div>
                        </div>
                    </div>

                    {/* Shoot Schedule */}
                    <div className="border border-border bg-card p-5 rounded-sm shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                            <div>
                                <h3 className="text-sm font-bold text-foreground">Upcoming Shoots</h3>
                                <Link href="/creator/collaborations" className="text-[10px] font-bold text-primary hover:underline">View All</Link>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {requests.length > 0 ? requests.slice(0, 2).map((req) => (
                                <div key={req.request_id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-sm border border-border/60">
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-foreground">{req.deliverables || req.offer_details || 'Collaboration'}</div>
                                        <div className="text-[10px] text-muted-foreground">{(req.collab_type || '').toUpperCase()} • ₹{req.offered_amount ?? 0}</div>
                                    </div>
                                    <div className="text-right">
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-border text-[9px] font-bold text-foreground">
                                            {req.deadline || 'TBD'}
                                        </span>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-4 text-xs text-muted-foreground">
                                    No upcoming shoots scheduled.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
