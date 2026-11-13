import Link from 'next/link'
import Image from 'next/image'
import {
    Calendar,
    MapPin,
    Share2,
    ShieldCheck,
    Star,
} from 'lucide-react'

const statCards = [
    {
        title: 'New Requests',
        value: '3',
        badge: '+2 this week',
        sub: 'Action required within 48h',
        iconColor: 'text-primary',
    },
    {
        title: 'Accepted Collabs',
        value: '5',
        badge: '2 in production',
        sub: 'Scheduled for upcoming shoots',
        iconColor: 'text-primary',
    },
    {
        title: 'Completed Campaigns',
        value: '18',
        badge: '100% on-time',
        sub: 'Since joining GoaConnect',
        iconColor: 'text-primary',
    },
    {
        title: 'Average Rating',
        value: '5.0',
        badge: 'Top Rated',
        sub: '16 verified venue reviews',
        iconColor: 'text-primary',
    },
]

const recentRequests = [
    {
        id: 'req-1',
        business: 'Café Palmeira',
        location: 'Calangute • Boutique Bistro',
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=400&auto=format&fit=crop',
        offer: '₹10,000 + 4-Course Brunch Tasting',
        deliverables: ['1x Reel', '2x Stories'],
        status: 'Pending Response',
        statusColor: 'bg-muted border border-border text-muted-foreground',
        deadline: 'Nov 18, 2024',
    },
    {
        id: 'req-2',
        business: 'The Project Assagao',
        location: 'Assagao • Concept Store & Lifestyle',
        image: 'https://images.unsplash.com/photo-1445019980590-050d113bca01?q=80&w=400&auto=format&fit=crop',
        offer: '₹14,000 (Paid Collab)',
        deliverables: ['1x Dedicated Reel'],
        status: 'Pending Response',
        statusColor: 'bg-muted border border-border text-muted-foreground',
        deadline: 'Nov 24, 2024',
    },
    {
        id: 'req-3',
        business: 'Title Culinary Bar',
        location: 'Small Vagator • Sunset Dining',
        image: 'https://images.unsplash.com/photo-1559339352-12d053aa8a79?q=80&w=400&auto=format&fit=crop',
        offer: 'Barter Sunset Tasting (₹6,500 value)',
        deliverables: ['2x Story Sequences'],
        status: 'New Offer',
        statusColor: 'bg-primary/10 border border-primary/20 text-primary',
        deadline: 'Nov 30, 2024',
    },
]

export default function CreatorDashboardPage() {
    return (
        <main className="space-y-10">
            {/* 1. HEADER BANNER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider">
                            <MapPin className="size-3" />
                            <span>Assagao, Goa</span>
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md bg-muted border border-border px-2.5 py-0.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            COASTAL LIFESTYLE CREATOR
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                        Welcome back, Sneha
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        You have 3 incoming partnership requests from North Goa businesses awaiting response.
                    </p>
                </div>

                <div className="flex items-end gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">Open for Nov/Dec</span>
                        <button
                            type="button"
                            className="relative w-10 h-5 rounded-full bg-muted transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
                            aria-label="Availability toggle"
                        >
                            <span className="absolute left-1 top-1 w-3 h-3 bg-background rounded-full transition-transform duration-200 translate-x-5" />
                        </button>
                    </div>

                    <Link
                        href="/creator/profile"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm px-5 py-3 flex items-center gap-2 transition-colors rounded-sm shadow-sm"
                    >
                        <Share2 className="size-4" />
                        <span>Share Media Kit</span>
                    </Link>
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
                            85% Complete
                        </div>
                    </div>
                </div>

                <div className="w-full sm:w-3/4 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: '85%' }} />
                </div>

                <Link
                    href="/creator/profile"
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                    <span>Update Now</span>
                    <span className="size-3">→</span>
                </Link>
            </div>

            {/* 3. STAT CARDS */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card) => {
                    const Icon =
                        card.title === 'New Requests' ? Calendar : card.title === 'Average Rating' ? Star : Calendar
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
                                {card.value}
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
                        <button
                            type="button"
                            className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/90 underline decoration-primary/30"
                        >
                            Filter
                            <Calendar className="size-3.5" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {recentRequests.map((req) => (
                            <div
                                key={req.id}
                                className="border border-border bg-card p-5 rounded-sm shadow-sm"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 flex-1">
                                        <Image
                                            src={req.image}
                                            alt={req.business}
                                            width={56}
                                            height={56}
                                            className="size-12 rounded-md object-cover border border-border/60"
                                        />
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-1">
                                                <h3 className="text-sm font-bold text-foreground truncate">
                                                    {req.business}
                                                </h3>
                                                <span className="text-[10px] font-bold text-primary">
                                                    ✓ Verified
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground">
                                                {req.location}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[9px] font-bold ${req.statusColor}`}>
                                                    {req.status}
                                                </span>
                                                <div className="flex gap-0.5">
                                                    {req.deliverables.map((d, i) => (
                                                        <span
                                                            key={i}
                                                            className="px-2 py-0.5 rounded-md border border-border/60 text-[9px] text-muted-foreground font-medium bg-muted/50"
                                                        >
                                                            {d}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:w-auto">
                                        <div className="text-right sm:text-left hidden sm:block">
                                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                                                Deadline
                                            </div>
                                            <div className="text-xs font-medium text-foreground">
                                                {req.deadline}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Link
                                                href="/creator/requests"
                                                className="border border-border bg-background text-foreground text-xs font-bold px-4 py-2.5 rounded-sm transition-colors hover:bg-muted"
                                            >
                                                View Details
                                            </Link>
                                            <button
                                                className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-4 py-2.5 rounded-sm transition-colors shadow-sm"
                                            >
                                                Accept
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-center gap-1 mt-6">
                        <button
                            type="button"
                            className="size-8 border border-border bg-background text-foreground text-xs font-bold rounded-sm hover:bg-muted cursor-pointer"
                        >
                            <span className="size-3">←</span>
                        </button>
                        <div className="size-8 border border-border bg-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground rounded-sm">
                            7 / 19
                        </div>
                        <button
                            type="button"
                            className="size-8 border border-border bg-background text-foreground text-xs font-bold rounded-sm hover:bg-muted cursor-pointer"
                        >
                            <span className="size-3">→</span>
                        </button>
                    </div>
                </div>

                {/* RIGHT: Audience Metrics Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="border border-border bg-card p-5 rounded-sm shadow-sm">
                        <div className="flex items-center justify-between mb-5">
                            <div className="space-y-0.5">
                                <h3 className="text-sm font-bold text-foreground">Growth & Trajectory</h3>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                    Audience Metrics
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="text-xl font-black text-primary">120.4k</div>
                                <div className="text-[10px] text-muted-foreground font-bold">+11.5% 6mo</div>
                            </div>
                        </div>

                        <div className="h-32 relative">
                            <svg
                                className="w-full h-full text-primary"
                                viewBox="0 0 600 200"
                                preserveAspectRatio="none"
                            >
                                <defs>
                                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#0C4E40" stopOpacity="0.2" />
                                        <stop offset="100%" stopColor="#0C4E40" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                <path
                                    d="M 40 140 Q 120 100, 200 130 T 360 90 T 520 70 T 580 40"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                />
                                <path
                                    d="M 40 140 Q 120 100, 200 130 T 360 90 T 520 70 T 580 40 L 580 170 L 40 170 Z"
                                    fill="url(#grad)"
                                />
                                {[40, 160, 280, 400, 520, 580].map((x, i) => (
                                    <circle key={i} cx={x} cy={[140, 100, 130, 90, 70, 40][i]} r="3" fill="#0C4E40" />
                                ))}
                                <line x1="40" y1="170" x2="580" y2="170" stroke="var(--border)" strokeWidth="1" />
                                <text x="40" y="185" className="text-[9px] fill-[var(--muted-foreground)]" textAnchor="middle">
                                    Oct
                                </text>
                                <text x="200" y="185" className="text-[9px] fill-[var(--muted-foreground)]" textAnchor="middle">
                                    Nov
                                </text>
                                <text x="520" y="185" className="text-[9px] fill-[var(--muted-foreground)]" textAnchor="middle">
                                    Dec
                                </text>
                            </svg>
                        </div>
                    </div>

                    <div className="border border-border bg-card p-5 rounded-sm shadow-sm grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">
                                Engagement Rate
                            </div>
                            <div className="text-xl font-bold text-primary">7.8%</div>
                            <div className="text-[10px] text-muted-foreground font-bold mt-1">2.4x Goa avg</div>
                        </div>
                        <div className="border-l border-border pl-4">
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">
                                Audience Origin
                            </div>
                            <div className="text-sm font-bold text-foreground">Goa & Mumbai</div>
                        </div>
                    </div>

                    <div className="border border-border bg-card p-5 rounded-sm shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                            <div>
                                <h3 className="text-sm font-bold text-foreground">Monthly Earnings</h3>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                                    November 2024
                                </span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-muted/50 rounded-sm border border-border/60">
                                <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">
                                    Cleared Earnings
                                </div>
                                <div className="text-lg font-black text-primary">₹48,000</div>
                                <div className="text-[10px] text-muted-foreground mt-1">Transferred to HDFC</div>
                            </div>
                            <div className="p-3 bg-muted/50 rounded-sm border border-border/60">
                                <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">
                                    In Escrow Pipeline
                                </div>
                                <div className="text-lg font-black text-primary">₹24,000</div>
                                <div className="text-[10px] text-muted-foreground mt-1">3 Active contracts</div>
                            </div>
                        </div>
                    </div>

                    <div className="border border-border bg-card p-5 rounded-sm shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                            <div>
                                <h3 className="text-sm font-bold text-foreground">Shoot Schedule</h3>
                                <Link
                                    href="/creator/schedule"
                                    className="text-[10px] font-bold text-primary hover:underline"
                                >
                                    View Calendar
                                </Link>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {[{
                                date: 'NOV 12',
                                title: 'Fontainhas Heritage Wall',
                                sub: 'Maison 9 Boutique Stay • Architecture Reel',
                                time: '07:30 AM',
                            }, {
                                date: 'NOV 15',
                                title: 'Anjuna Flea Market Lawn',
                                sub: 'Curated Pop-up Stories • Golden hour coverage',
                                time: '04:00 PM',
                            }].map((shoot) => (
                                <div
                                    key={shoot.date}
                                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-sm border border-border/60"
                                >
                                    <div className="flex flex-col items-center gap-0.5">
                                        <span className="text-[10px] font-black text-primary">{shoot.date.split(' ')[0]}</span>
                                        <span className="text-[9px] font-bold text-muted-foreground">{shoot.date.split(' ')[1]}</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-foreground">{shoot.title}</div>
                                        <div className="text-[10px] text-muted-foreground">{shoot.sub}</div>
                                    </div>
                                    <div className="text-right">
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-border text-[9px] font-bold text-foreground">
                                            {shoot.time}
                                        </span>
                                        <span className="size-4 text-muted-foreground">→</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
