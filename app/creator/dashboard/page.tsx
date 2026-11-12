import Link from 'next/link'
import Image from 'next/image'
import {
    Calendar,
    MapPin,
    Play,
    Share2,
    Star,
    ShieldCheck,
    ToggleRight,
} from 'lucide-react'

const statCards = [
    {
        title: 'New Requests',
        value: '3',
        badge: '+2 this week',
        badgeColor: 'bg-[#f59e0b]/20 text-[#f59e0b]',
        sub: 'Action required within 48h',
        iconColor: 'text-[#f59e0b]',
    },
    {
        title: 'Accepted Collabs',
        value: '5',
        badge: '2 in production',
        badgeColor: 'bg-teal-100 text-teal-700',
        sub: 'Scheduled for Nov shoots',
        iconColor: 'text-teal-700',
    },
    {
        title: 'Completed Campaigns',
        value: '18',
        badge: '100% on-time',
        badgeColor: 'bg-teal-100 text-teal-700',
        sub: 'Since joining GoaConnect',
        iconColor: 'text-teal-700',
    },
    {
        title: 'Average Rating',
        value: '5.0',
        badge: 'Top Rated',
        badgeColor: 'bg-[#f59e0b]/20 text-[#f59e0b]',
        sub: '16 verified venue reviews',
        iconColor: 'text-[#f59e0b]',
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
        statusColor: 'bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/40',
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
        statusColor: 'bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/40',
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
        statusColor: 'bg-teal-100 text-teal-700 border-teal-200',
        deadline: 'Nov 30, 2024',
    },
]

export default function CreatorDashboardPage() {
    return (
        <main className="space-y-8">
            {/* 1. HEADER BANNER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-teal-100 border border-teal-200 px-2.5 py-0.5 text-[10px] font-bold text-teal-800 uppercase tracking-wider">
                            <MapPin className="size-3" />
                            <span>Assagao, Goa</span>
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#f5f2ff] border border-[#ddd6fe]/60 px-2.5 py-0.5 text-[10px] font-bold text-[#6b7280] uppercase tracking-wider">
                            COASTAL LIFESTYLE CREATOR
                        </span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1a1a2e]">
                        Welcome back, Sneha <span className="text-[#f59e0b]">✨</span>
                    </h1>
                    <p className="text-sm text-[#6b7280] mt-1">
                        You have 3 incoming partnership requests from North Goa businesses awaiting response.
                    </p>
                </div>

                <div className="flex items-end gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[#1a1a2e]">Open for Nov/Dec</span>
                        <button
                            type="button"
                            className="relative w-10 h-5 rounded-full bg-[#ddd6fe] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#0c4e40] cursor-pointer"
                            aria-label="Availability toggle"
                        >
                            <span className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform duration-200 translate-x-5" />
                        </button>
                    </div>

                    <Link
                        href="/creator/profile"
                        className="bg-[#0c4e40] hover:bg-[#08382e] text-white font-bold text-sm px-5 py-3 flex items-center gap-2 transition-colors rounded-xl shadow-sm"
                    >
                        <Share2 className="size-4" />
                        <span>Share Media Kit</span>
                    </Link>
                </div>
            </div>

            {/* 2. PROFILE COMPLETENESS */}
            <div className="border border-[#ddd6fe]/60 bg-white p-5 sm:p-6 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="size-9 bg-teal-100 text-teal-700 flex items-center justify-center rounded-lg">
                        <ShieldCheck className="size-5" />
                    </div>
                    <div className="space-y-0.5">
                        <div className="text-sm font-bold text-[#1a1a2e]">Profile Completeness</div>
                        <div className="text-[10px] font-bold text-[#6b7280] uppercase tracking-wider">
                            85% Complete
                        </div>
                    </div>
                </div>

                <div className="w-full sm:w-3/4 h-1.5 bg-[#ddd6fe] rounded-full overflow-hidden">
                    <div className="h-full bg-[#0c4e40] rounded-full" style={{ width: '85%' }} />
                </div>

                <Link
                    href="/creator/profile"
                    className="text-xs font-bold text-[#0c4e40] hover:underline flex items-center gap-1"
                >
                    <span>Update Now</span>
                    <span className="size-3">→</span>
                </Link>
            </div>

            {/* 3. STAT CARDS */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {statCards.map((card) => {
                    const Icon = card.title === 'New Requests' ? Calendar : card.title === 'Average Rating' ? Star : Calendar
                    return (
                        <div
                            key={card.title}
                            className="border border-[#ddd6fe]/60 bg-white p-5 sm:p-6 rounded-xl shadow-sm"
                        >
                            <div className="flex items-center justify-between">
                                <div className="size-8 flex items-center justify-center rounded-lg bg-[#f3f0ff]">
                                    <Icon className="size-5 {card.iconColor}" />
                                </div>
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${card.badgeColor}`}>
                                    <span>{card.badge}</span>
                                </span>
                            </div>
                            <div className="text-3xl sm:text-4xl font-black text-[#1a1a2e] mt-3 tracking-tight">
                                {card.value}
                            </div>
                            <div className="text-[11px] font-bold text-[#1a1a2e] uppercase tracking-wider mt-1">
                                {card.title}
                            </div>
                            <div className="text-[11px] text-[#6b7280] mt-0.5 leading-tight">
                                {card.sub}
                            </div>
                        </div>
                    )
                })}
            </section>

            {/* 4. RECENT REQUESTS + AUDIENCE METRICS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* LEFT: Recent Requests */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <h2 className="text-lg font-bold text-[#1a1a2e]">Recent Requests</h2>
                            <p className="text-[11px] text-[#6b7280] uppercase tracking-wider">
                                Collaborations pending your review and acceptance
                            </p>
                        </div>
                        <button
                            type="button"
                            className="flex items-center gap-1.5 text-xs font-bold text-[#0c4e40] hover:text-[#08382e] underline"
                        >
                            Filter
                            <Calendar className="size-3.5" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {recentRequests.map((req) => (
                            <div
                                key={req.id}
                                className="border border-[#ddd6fe]/60 bg-white p-5 rounded-xl shadow-sm"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 flex-1">
                                        <Image
                                            src={req.image}
                                            alt={req.business}
                                            width={60}
                                            height={60}
                                            className="size-12 rounded-lg object-cover border border-[#ddd6fe]/40"
                                        />
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-1">
                                                <h3 className="text-sm font-bold text-[#1a1a2e] truncate">
                                                    {req.business}
                                                </h3>
                                                <span className="text-[10px] font-bold text-teal-400">
                                                    ✓
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-[#6b7280]">
                                                {req.location}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-bold ${req.statusColor}`}>
                                                    {req.status}
                                                </span>
                                                <div className="flex items-center gap-1">
                                                    <Play className="size-3 text-[#6b7280]" fill="currentColor" />
                                                    <span className="text-xs text-[#1a1a2e] font-medium">{req.offer}</span>
                                                </div>
                                                <div className="flex gap-0.5">
                                                    {req.deliverables.map((d, i) => (
                                                        <span
                                                            key={i}
                                                            className="px-2 py-0.5 rounded-full border border-[#ddd6fe]/40 text-[9px] text-[#6b7280] font-medium bg-[#f3f0ff]"
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
                                            <div className="text-[10px] text-[#6b7280] uppercase tracking-wider font-bold">
                                                Deadline
                                            </div>
                                            <div className="text-xs font-medium text-[#1a1a2e]">
                                                {req.deadline}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Link
                                                href="/creator/requests"
                                                className="border border-[#ddd6fe]/60 bg-white text-[#1a1a2e] text-xs font-bold px-4 py-2.5 rounded-lg transition-colors hover:bg-[#f3f0ff]"
                                            >
                                                View Details
                                            </Link>
                                            <button
                                                className="bg-[#0c4e40] hover:bg-[#08382e] text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-colors shadow-sm"
                                            >
                                                Accept
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination (from Image 2) */}
                    <div className="flex items-center justify-center gap-1 mt-4">
                        <button
                            type="button"
                            className="size-8 border border-[#ddd6fe]/60 bg-white text-[#1a1a2e] text-xs font-bold rounded-lg hover:bg-[#f3f0ff] cursor-pointer"
                        >
                            <span className="size-3">←</span>
                        </button>
                        <div className="size-8 border border-[#ddd6fe]/60 bg-[#1a1a2e] flex items-center justify-center text-[10px] font-bold text-white rounded-lg">
                            7 / 19
                        </div>
                        <button
                            type="button"
                            className="size-8 border border-[#ddd6fe]/60 bg-white text-[#1a1a2e] text-xs font-bold rounded-lg hover:bg-[#f3f0ff] cursor-pointer"
                        >
                            <span className="size-3">→</span>
                        </button>
                    </div>
                </div>

                {/* RIGHT: Audience Metrics Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Growth & Trajectory */}
                    <div className="border border-[#ddd6fe]/60 bg-white p-5 rounded-xl shadow-sm">
                        <div className="flex items-center justify-between mb-5">
                            <div className="space-y-0.5">
                                <h3 className="text-sm font-bold text-[#1a1a2e]">Growth & Trajectory</h3>
                                <p className="text-[10px] text-[#6b7280] uppercase tracking-wider">
                                    Audience Metrics
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="text-xl font-black text-teal-700">120.4k</div>
                                <div className="text-[10px] text-teal-400 font-bold">+11.5% 6mo</div>
                            </div>
                        </div>

                        <div className="h-32 relative">
                            <svg
                                className="w-full h-full text-teal-700"
                                viewBox="0 0 600 200"
                                preserveAspectRatio="none"
                            >
                                <defs>
                                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#0c4e40" stopOpacity="0.3" />
                                        <stop offset="100%" stopColor="#0c4e40" stopOpacity="0" />
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
                                    <circle key={i} cx={x} cy={[140, 100, 130, 90, 70, 40][i]} r="3" fill="#0c4e40" />
                                ))}
                                <line x1="40" y1="170" x2="580" y2="170" stroke="#ddd6fe" strokeWidth="1" />
                                <text x="40" y="185" className="text-[9px] fill-[#6b7280]" textAnchor="middle">
                                    Oct
                                </text>
                                <text x="200" y="185" className="text-[9px] fill-[#6b7280]" textAnchor="middle">
                                    Nov
                                </text>
                                <text x="520" y="185" className="text-[9px] fill-[#6b7280]" textAnchor="middle">
                                    Dec
                                </text>
                            </svg>
                        </div>
                    </div>

                    {/* Engagement Rate */}
                    <div className="border border-[#ddd6fe]/60 bg-white p-5 rounded-xl shadow-sm grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-[10px] text-[#6b7280] uppercase tracking-wider font-bold mb-1">
                                Engagement Rate
                            </div>
                            <div className="text-xl font-bold text-teal-700">7.8%</div>
                            <div className="text-[10px] text-teal-400 font-bold mt-1">2.4x Goa avg</div>
                        </div>
                        <div className="border-l border-[#ddd6fe]/40 pl-4">
                            <div className="text-[10px] text-[#6b7280] uppercase tracking-wider font-bold mb-1">
                                Audience Origin
                            </div>
                            <div className="text-sm font-bold text-[#1a1a2e]">Goa &amp; Mumbai</div>
                        </div>
                    </div>

                    {/* Monthly Earnings */}
                    <div className="border border-[#ddd6fe]/60 bg-white p-5 rounded-xl shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-[#1a1a2e]">Monthly Earnings</h3>
                            <span className="text-[10px] text-[#6b7280] uppercase tracking-wider font-bold">
                                November 2024
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-[#f3f0ff] rounded-lg border border-[#ddd6fe]/40">
                                <div className="text-[10px] text-[#6b7280] uppercase tracking-wider font-bold mb-1">
                                    Cleared Earnings
                                </div>
                                <div className="text-lg font-black text-teal-700">₹48,000</div>
                                <div className="text-[10px] text-[#6b7280] mt-1">
                                    Transferred to HDFC
                                </div>
                            </div>
                            <div className="p-3 bg-[#f3f0ff] rounded-lg border border-[#ddd6fe]/40">
                                <div className="text-[10px] text-[#6b7280] uppercase tracking-wider font-bold mb-1">
                                    In Escrow Pipeline
                                </div>
                                <div className="text-lg font-black text-teal-700">₹24,000</div>
                                <div className="text-[10px] text-[#6b7280] mt-1">
                                    3 Active contracts
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Shoot Schedule */}
                    <div className="border border-[#ddd6fe]/60 bg-white p-5 rounded-xl shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-[#1a1a2e]">Shoot Schedule</h3>
                            <Link
                                href="/creator/schedule"
                                className="text-[10px] font-bold text-[#0c4e40] hover:underline"
                            >
                                View Calendar
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {[{
                                date: 'NOV 12',
                                title: 'Fontainhas Heritage Wall',
                                sub: 'Maison 9 Boutique Stay • Architecture Reel',
                                time: '07:30 AM',
                                timeColor: 'text-[#1a1a2e]',
                            }, {
                                date: 'NOV 15',
                                title: 'Anjuna Flea Market Lawn',
                                sub: 'Curated Pop-up Stories • Golden hour coverage',
                                time: '04:00 PM',
                                timeColor: 'text-[#f59e0b]',
                            }].map((shoot) => (
                                <div
                                    key={shoot.date}
                                    className="flex items-center gap-3 p-3 bg-[#f3f0ff] rounded-lg border border-[#ddd6fe]/40"
                                >
                                    <div className="flex flex-col items-center gap-0.5">
                                        <span className="text-[10px] font-black text-teal-700">{shoot.date.split(' ')[0]}</span>
                                        <span className="text-[9px] font-bold text-[#6b7280]">{shoot.date.split(' ')[1]}</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-[#1a1a2e]">{shoot.title}</div>
                                        <div className="text-[10px] text-[#6b7280]">{shoot.sub}</div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-[#ddd6fe]/40 text-[9px] font-bold ${shoot.timeColor}`}>
                                            {shoot.time}
                                        </span>
                                        <span className="size-4 text-[#6b7280]">→</span>
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
