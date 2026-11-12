'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
    CheckCircle2,
    Send,
    Star,
} from 'lucide-react'

export default function BusinessReviewsPage() {
    const [rating, setRating] = useState(5)
    const [comment, setComment] = useState('')
    const [submitted, setSubmitted] = useState(false)

    const completedCollabs = [
        {
            creator: 'Sneha Fernandes',
            handle: '@sneha.tastesgoa',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
            campaign: 'Monsoon Menu & Heritage Sourdough Tasting',
            rating: 5,
            reviewDate: 'August 2026',
            comment:
                'Sneha created an incredible reel on our monsoon dessert menu. Resulted in our busiest Sunday brunch of the season. She understood our heritage courtyard lighting perfectly and delivered without disrupting our seated guests.',
            reachResult: '42K Organic Reach • 18 Direct Reservations',
        },
        {
            creator: 'Alisha D\'Cruz',
            handle: '@alishacafecrawls',
            avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
            campaign: 'Morning Artisanal Cold Brew Crawl',
            rating: 5,
            reviewDate: 'October 2026',
            comment:
                'Super fast turnaround, creative Goan lifestyle b-roll, and highly genuine coffee enthusiasts in her comments. Will book again for our winter holiday menu launch!',
            reachResult: '54K Organic Views • 8.4% Engagement Rate',
        },
        {
            creator: 'Keith Sequeira',
            handle: '@chefkeith_goa',
            avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=200&auto=format&fit=crop',
            campaign: 'Sunset Tapas Live Fire Experience',
            rating: 5,
            reviewDate: 'September 2026',
            comment:
                'Keith understands chef artistry and gastronomy storytelling. The collaborative reel drove huge buzz from North Goa foodies and traveling culinary enthusiasts.',
            reachResult: '72K Organic Reach • 5.0 Star Rating',
        },
    ]

    const handleSubmitReview = (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitted(true)
        setTimeout(() => {
            setComment('')
            setSubmitted(false)
        }, 2000)
    }

    return (
        <main className="space-y-6">
            <div className="border border-border bg-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                        Business Ratings &amp; Reviews
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                        Verified post-collaboration reviews between Café Palmeira and Goan creators
                    </p>
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold self-start md:self-auto">
                    <div className="border border-border p-2.5 bg-background text-center">
                        <div className="text-lg font-black text-amber-500">5.0 ★★★★★</div>
                        <span className="text-[10px] text-muted-foreground uppercase">Average Given</span>
                    </div>

                    <div className="border border-border p-2.5 bg-background text-center">
                        <div className="text-lg font-black text-primary">100%</div>
                        <span className="text-[10px] text-muted-foreground uppercase">On-Time Delivery</span>
                    </div>
                </div>
            </div>

            <div className="border border-border bg-card p-6 space-y-4">
                <div className="border-b border-border pb-3">
                    <h2 className="text-base font-bold text-foreground">
                        Leave a Collaboration Review
                    </h2>
                    <p className="text-xs text-muted-foreground">
                        Reviews can be submitted only once collaboration deliverables are completed and verified via escrow.
                    </p>
                </div>

                {submitted ? (
                    <div className="p-4 border border-primary text-primary text-xs font-bold bg-primary/10">
                        ✓ Review published to creator&apos;s verified public profile and synced to GoaConnect DBMS ledger.
                    </div>
                ) : (
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-foreground">Completed Collaboration</label>
                                <select className="w-full border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer">
                                    <option value="cr-sneha">Sneha Fernandes — Monsoon Tasting Menu (REQ-1042)</option>
                                    <option value="cr-alisha">Alisha D&apos;Cruz — Artisanal Cold Brew (REQ-1039)</option>
                                    <option value="cr-keith">Keith Sequeira — Live Fire Tapas (REQ-1035)</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-foreground">Rating (1 to 5 Stars)</label>
                                <div className="flex items-center gap-1.5 pt-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className="cursor-pointer text-amber-500 hover:scale-110 transition-transform"
                                        >
                                            <Star className={`size-5 ${star <= rating ? 'fill-amber-500' : 'text-muted'}`} />
                                        </button>
                                    ))}
                                    <span className="text-xs font-bold text-muted-foreground ml-2">
                                        {rating} of 5 Stars
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-foreground">Detailed Feedback &amp; Results</label>
                            <textarea
                                required
                                rows={3}
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Describe campaign reach, creator professionalism, footage quality, and guest engagement..."
                                className="w-full border border-border bg-background p-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>

                        <button
                            type="submit"
                            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs px-5 py-2.5 flex items-center gap-2 cursor-pointer"
                        >
                            <Send className="size-3.5" />
                            <span>Publish Verified Review</span>
                        </button>
                    </form>
                )}
            </div>

            <div className="space-y-4">
                <h2 className="text-base font-bold text-foreground">
                    Reviews Published by Café Palmeira ({completedCollabs.length})
                </h2>

                <div className="space-y-4">
                    {completedCollabs.map((rev) => (
                        <div
                            key={rev.creator}
                            className="border border-border bg-card p-6 space-y-3 hover:border-primary transition-colors"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
                                <div className="flex items-center gap-3">
                                    <div className="size-12 overflow-hidden border border-border shrink-0 relative">
                                        <Image
                                            unoptimized
                                            src={rev.avatar}
                                            alt={rev.creator}
                                            width={80}
                                            height={80}
                                            className="size-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm font-bold text-foreground">
                                                {rev.creator}
                                            </h3>
                                            <span className="text-xs text-muted-foreground font-mono">
                                                {rev.handle}
                                            </span>
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Campaign: <strong className="text-foreground">{rev.campaign}</strong>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex text-amber-500 text-sm">
                                        {'★'.repeat(rev.rating)}
                                    </div>
                                    <span className="text-xs text-muted-foreground">{rev.reviewDate}</span>
                                </div>
                            </div>

                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed italic">
                                &ldquo;{rev.comment}&rdquo;
                            </p>

                            <div className="flex items-center justify-between text-xs pt-2 border-t border-border text-muted-foreground">
                                <div className="flex items-center gap-1.5 font-semibold text-primary">
                                    <CheckCircle2 className="size-3.5" />
                                    <span>Verified DBMS Escrow Review</span>
                                </div>
                                <span className="font-bold text-foreground">{rev.reachResult}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    )
}
