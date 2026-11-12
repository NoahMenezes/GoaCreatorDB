'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
    FileText,
    ExternalLink,
    CheckCircle2,
    Star,
    ShieldCheck as ShieldCheckIcon,
} from 'lucide-react'

const tabs = [
    { id: 'all', label: 'All Completed (18)', active: true },
    { id: 'with-reviews', label: 'With Reviews (16)' },
    { id: 'repeat', label: 'Repeat Partners (4)' },
]

const collabRows = [
    {
        id: 'c-1',
        business: 'Café Bodega',
        verified: true,
        location: 'Altinho, Panjim',
        niche: 'Food & Heritage',
        nicheColor: 'bg-teal-100 text-teal-700 border-teal-200',
        deliverables: [
            { label: '1x Reel', checked: true },
            { label: '2x Stories', checked: true },
        ],
        completed: 'Aug 2024',
        earnings: '₹12,000',
        earningsStatus: 'Cleared',
        rating: '5.0',
        reviewStatus: 'Received',
        reviewColor: 'bg-[#f5d6c5] text-[#c2410c] border-[#f5d6c5]',
    },
    {
        id: 'c-2',
        business: 'The Project Assagao',
        verified: true,
        location: 'Assagao',
        niche: 'Boutique Stay',
        nicheColor: 'bg-sky-100 text-sky-700 border-sky-200',
        deliverables: [
            { label: '1x Reel', checked: true },
            { label: '1x Carousel', checked: true },
        ],
        completed: 'Sep 2024',
        earnings: '₹14,000',
        earningsStatus: 'Cleared',
        rating: '5.0',
        reviewStatus: 'Received',
        reviewColor: 'bg-[#f5d6c5] text-[#c2410c] border-[#f5d6c5]',
    },
    {
        id: 'c-3',
        business: 'Jamun Goa',
        verified: true,
        location: 'Assagao',
        niche: 'Dining & Cocktails',
        nicheColor: 'bg-[#fce7f3] text-[#be185d] border-[#fce7f3]',
        deliverables: [
            { label: '1x Reel', checked: true },
        ],
        completed: 'Jul 2024',
        earnings: '₹12,000',
        earningsStatus: 'Cleared',
        rating: '5.0',
        reviewStatus: 'Received',
        reviewColor: 'bg-[#f5d6c5] text-[#c2410c] border-[#f5d6c5]',
    },
    {
        id: 'c-4',
        business: 'Soro - The Village Pub',
        verified: true,
        location: 'Siolim',
        niche: 'Nightlife',
        nicheColor: 'bg-[#fef3c7] text-[#b45309] border-[#fef3c7]',
        deliverables: [
            { label: '2x Reels', checked: true },
            { label: '4x Stories', checked: true },
        ],
        completed: 'Jun 2024',
        earnings: '₹18,000',
        earningsStatus: 'Cleared',
        rating: '5.0',
        reviewStatus: 'Received',
        reviewColor: 'bg-[#f5d6c5] text-[#c2410c] border-[#f5d6c5]',
    },
]

const reviews = [
    {
        id: 'r-1',
        business: 'Café Bodega',
        verified: true,
        location: 'Altinho, Panjim',
        rating: 5.0,
        quote:
            'Sneha created an incredible reel on our monsoon dessert menu. Resulted in our busiest Sunday brunch of the season. She understood our heritage courtyard lighting perfectly and delivered without disrupting our seated guests.',
        campaign: 'Verified Campaign · AUG 2024',
        result: '42K Organic Reach',
        resultColor: 'bg-teal-100 text-teal-700',
    },
    {
        id: 'r-2',
        business: 'The Project Assagao',
        verified: true,
        location: 'Boutique Villa Stay Collab',
        rating: 5.0,
        quote:
            'Super professional, timely delivery of raw footage, and highly engaged Goan audience. We gained over 280 direct room inquiries over the weekend following her carousel post. Would definitely book again for our winter festival.',
        campaign: 'Verified Campaign · SEP 2024',
        result: '18 Direct Bookings',
        resultColor: 'bg-sky-100 text-sky-700',
    },
    {
        id: 'r-3',
        business: 'Antares Beach Club',
        verified: true,
        location: 'Vagator',
        rating: 5.0,
        quote:
            'Sneha is our go-to creator for coastal lifestyle vibes. High quality 4K reels and prompt communication. Highly recommended for any beachside brand needing elevated visuals.',
        campaign: 'Verified Campaign · MAY 2024',
        result: '4K UHD Master',
        resultColor: 'bg-[#f3f4f6] text-[#6b7280]',
    },
]

export default function CreatorReviewsPage() {
    return (
        <main className="space-y-8">
            {/* 1. HEADER BANNER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/10 border border-teal-200 px-2.5 py-0.5 text-[10px] font-bold text-teal-700 uppercase tracking-wider">
                        <ShieldCheckIcon className="size-3" />
                        <span>AUDITED CREATOR PERFORMANCE LEDGER</span>
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1a1a2e]">
                        Collaboration History &amp; Verified Reviews
                    </h1>
                    <p className="text-sm text-[#6b7280] mt-1">
                        Track all fulfilled brand campaigns, escrow earnings, and feedback received from Goan venues.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href="#"
                        className="flex items-center gap-2 rounded-xl border border-[#ddd6fe]/60 bg-white px-3.5 py-2 text-xs font-bold text-[#1a1a2e] hover:bg-[#f3f0ff] transition-colors cursor-pointer"
                    >
                        <FileText className="size-3.5" />
                        <span>Export PDF</span>
                    </Link>
                    <button
                        className="bg-[#0c4e40] hover:bg-teal-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer"
                    >
                        <ExternalLink className="size-3.5" />
                        <span>Embed Reviews Widget</span>
                    </button>
                </div>
            </div>

            {/* 2. STAT CARDS */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="border border-[#ddd6fe]/60 bg-white p-5 sm:p-6 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="space-y-0.5">
                            <span className="text-[10px] font-bold text-[#6b7280] uppercase tracking-wider">
                                Average Venue Rating
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#fce7e2] text-[#c2410c] text-[10px] font-bold">
                                <Star className="size-3" />
                                <span>Top Rated</span>
                            </span>
                        </div>
                    </div>
                    <div className="text-4xl sm:text-5xl font-black text-[#1a1a2e] tracking-tight">5.0</div>
                    <div className="flex items-center gap-1 text-[#c2410c] font-bold text-xs mt-2">
                        ★★★★★
                    </div>
                    <div className="text-[11px] text-[#6b7280] mt-1 leading-tight">
                        5-star across 16 verified venue ratings
                    </div>
                </div>

                <div className="border border-[#ddd6fe]/60 bg-white p-5 sm:p-6 rounded-xl shadow-sm">
                    <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-[#6b7280] uppercase tracking-wider">
                            Delivery Reliability
                        </span>
                    </div>
                    <div className="text-4xl sm:text-5xl font-black text-teal-700 tracking-tight mt-1">100%</div>
                    <div className="text-sm text-teal-700 font-bold mt-2">on schedule</div>
                    <div className="w-full h-1.5 bg-[#ddd6fe] rounded-full overflow-hidden mt-4">
                        <div className="h-full bg-teal-700 rounded-full" style={{ width: '100%' }} />
                    </div>
                    <div className="text-[11px] text-[#6b7280] mt-2 leading-tight">
                        Zero delayed campaign turnarounds
                    </div>
                </div>

                <div className="border border-[#ddd6fe]/60 bg-white p-5 sm:p-6 rounded-xl shadow-sm">
                    <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-[#6b7280] uppercase tracking-wider">
                            Completed Campaigns
                        </span>
                    </div>
                    <div className="text-4xl sm:text-5xl font-black text-[#1a1a2e] tracking-tight mt-1">18</div>
                    <div className="text-sm text-teal-700 font-bold mt-2">Hospitality &amp; Dining</div>
                    <div className="flex items-center gap-2 mt-4 text-[11px] text-[#6b7280]">
                        <span className="size-2 bg-teal-700 rounded-full" />
                        <span>4 repeat North Goa brand partners</span>
                    </div>
                </div>

                <div className="border border-[#ddd6fe]/60 bg-white p-5 sm:p-6 rounded-xl shadow-sm">
                    <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-[#6b7280] uppercase tracking-wider">
                            Escrow Settled
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 text-[10px] font-bold">
                            <FileText className="size-3" />
                            <span>100% Escrow Cleared via UPI/NEFT</span>
                        </span>
                    </div>
                    <div className="text-4xl sm:text-5xl font-black text-[#1a1a2e] tracking-tight mt-1">₹2,14,000</div>
                    <div className="text-[11px] text-[#6b7280] mt-2 leading-tight">
                        Total settled escrow volume across completed collaborations
                    </div>
                </div>
            </section>

            {/* 3. TABS + TABLE */}
            <div className="border border-[#ddd6fe]/60 bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ddd6fe]/40 p-5 sm:p-6">
                    <div className="flex gap-1.5">
                        {tabs.map((t) => (
                            <button
                                key={t.id}
                                className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
                                    t.active
                                        ? 'bg-[#0c4e40] text-white shadow-sm'
                                        : 'bg-[#f8fafc] text-[#6b7280] hover:text-[#1a1a2e]'
                                }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                    <div className="ml-auto flex items-center gap-3">
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#6b7280]">
                                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 4h13M3 8h9m-9 4h6m6 4l9-9m-9 9l3-3" /></svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Filter by venue or niche..."
                                className="w-64 pl-9 pr-3 py-2 text-xs border border-[#ddd6fe]/60 bg-[#f8fafc] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0c4e40]"
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[#ddd6fe]/40 bg-[#f8fafc]">
                                <th className="px-6 py-4 text-[10px] font-bold text-[#6b7280] uppercase tracking-wider">Business Name &amp; Venue</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-[#6b7280] uppercase tracking-wider">Campaign Niche</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-[#6b7280] uppercase tracking-wider">Deliverables Fulfilled</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-[#6b7280] uppercase tracking-wider">Completed</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-[#6b7280] uppercase tracking-wider">Earnings</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-[#6b7280] uppercase tracking-wider">Review Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#ddd6fe]/40">
                            {collabRows.map((row) => (
                                <tr key={row.id} className="hover:bg-[#f3f0ff] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <Image
                                                src={`https://images.unsplash.com/photo-${[
                                                    '1517248135467-4c7edcad34c4',
                                                    '1445019980590-050d113bca01',
                                                    '1559339352-12d053aa8a79',
                                                    '1512917774080-9991f1c4c750',
                                                ][Number(row.id.slice(-1)) - 1]}?q=80&w=200&auto=format&fit=crop`}
                                                alt={row.business}
                                                width={40}
                                                height={40}
                                                className="size-10 object-cover rounded-lg border border-[#ddd6fe]/40"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs font-bold text-[#1a1a2e] truncate">{row.business}</span>
                                                    {row.verified && (
                                                        <span className="flex items-center gap-1 text-[9px] text-teal-400">
                                                            <CheckCircle2 className="size-2.5" />
                                                            <span>Verified</span>
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-[10px] text-[#6b7280]">{row.location}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`flex items-center gap-2 px-2 py-1 rounded-full ${row.nicheColor} text-[9px] font-bold`}>
                                            {row.niche}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-1">
                                            {row.deliverables.map((d, i) => (
                                                <span
                                                    key={i}
                                                    className={`px-2 py-0.5 rounded-full border text-[9px] font-medium ${d.checked ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-[#f8fafc] text-[#6b7280] border-[#ddd6fe]/60'}`}
                                                >
                                                    {d.label}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-[#1a1a2e] font-medium">{row.completed}</td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs font-black text-[#1a1a2e]">{row.earnings}</div>
                                        <div className="text-[10px] text-[#6b7280]">{row.earningsStatus}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border ${row.reviewColor} text-[9px] font-bold`}>
                                            <Star className="size-3 fill-current" />
                                            <span>{row.rating}</span>
                                            <span>· {row.reviewStatus}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 4. VERIFIED VENUE OWNER REVIEWS */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/10 border border-teal-200 px-2 py-0.5 text-[10px] font-bold text-teal-700 uppercase tracking-wider">
                            OWNER TESTIMONIALS
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-bold text-[#1a1a2e]">Verified Venue Owner Reviews</h2>
                    </div>
                    <span className="flex items-center gap-1 text-xs text-[#6b7280] font-medium">
                        <span className="size-1.5 bg-teal-700 rounded-full" />
                        <span>All 16 venues authenticated via Goa Trade Registry</span>
                    </span>
                </div>
                <p className="text-sm text-[#6b7280] max-w-2xl">
                    Feedback and quantified commercial outcomes recorded directly into the GoaConnect escrow smart log.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {reviews.map((rev) => (
                        <div
                            key={rev.id}
                            className="border border-[#ddd6fe]/60 bg-white p-5 sm:p-6 rounded-xl shadow-sm"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <Image
                                    src={`https://images.unsplash.com/photo-${[
                                                        '1517248135467-4c7edcad34c4',
                                                        '1445019980590-050d113bca01',
                                                        '1559339352-12d053aa8a79',
                                                    ][Number(rev.id.slice(-1)) - 1]}?q=80&w=200&auto=format&fit=crop`}
                                    alt={rev.business}
                                    width={40}
                                    height={40}
                                    className="size-10 object-cover rounded-lg border border-[#ddd6fe]/40"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs font-bold text-[#1a1a2e]">{rev.business}</span>
                                        {rev.verified && (
                                            <span className="flex items-center gap-1 text-[9px] text-teal-400">
                                                <CheckCircle2 className="size-2.5" />
                                                <span>Verified Partner</span>
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-[10px] text-[#6b7280]">{rev.location}</div>
                                </div>
                            </div>

                            <div className="flex text-[#c2410c] text-sm mb-3">
                                {'★'.repeat(rev.rating)}
                                <span className="ml-1 text-xs font-black text-[#1a1a2e]">{rev.rating}</span>
                            </div>

                            <p className="text-xs text-[#6b7280] leading-relaxed mb-4 italic">
                                &ldquo;{rev.quote}&rdquo;
                            </p>

                            <div className="flex items-center justify-between pt-3 border-t border-[#ddd6fe]/40">
                                <div className="text-[10px] text-[#6b7280] uppercase tracking-wider font-bold">
                                    Verified Campaign
                                </div>
                                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${rev.resultColor} text-[9px] font-bold`}>
                                    <span>{rev.result}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 5. ESCROW SHIELD CTA */}
            <section className="border border-teal-200 bg-gradient-to-r from-teal-800 via-teal-900 to-teal-800 text-white p-6 sm:p-8 rounded-2xl shadow-2xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <span className="text-[10px] font-bold text-teal-300 uppercase tracking-wider">
                            Verified Goa Escrow Shield
                        </span>
                        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                            Ready to pitch new coastal brands with your 5.0 reputation?
                        </h3>
                        <p className="text-teal-200 text-xs sm:text-sm mt-1 leading-relaxed">
                            Your credentials include 18 completed collaborations, 0 escrow disputes, and ₹2,14,000 in volume.
                        </p>
                    </div>

                    <div className="flex gap-3 sm:flex-col sm:gap-3">
                        <Link
                            href="#"
                            className="flex items-center gap-2 border border-teal-300/30 bg-white/10 px-3.5 py-2.5 text-teal-100 text-xs font-bold hover:bg-white/20 transition-colors cursor-pointer"
                        >
                            <FileText className="size-3.5" />
                            <span>Export Portfolio &amp; Reviews PDF</span>
                        </Link>
                        <button
                            className="flex items-center gap-2 bg-[#0c4e40] hover:bg-teal-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer"
                        >
                            <ExternalLink className="size-3.5" />
                            <span>Embed Reviews Widget</span>
                        </button>
                    </div>
                </div>
            </section>
        </main>
    )
}
