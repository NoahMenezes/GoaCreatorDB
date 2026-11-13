import { Check } from 'lucide-react'

export default function Pricing() {
    const plans = [
        {
            name: 'Explorer',
            desc: 'For emerging creators & nomads',
            price: '₹0',
            period: '/mo',
            popular: false,
            features: [
                'Public Goa Creator Profile',
                'Browse Open Brand Collabs',
                'Standard Collab Discovery',
                'Community Mixers Access',
                'Basic Engagement Stats',
            ],
            cta: 'Join Free',
            href: '/join?role=creator',
            variant: 'outline' as const,
        },
        {
            name: 'Creator Pro',
            desc: 'For active storytellers & influencers',
            price: '₹1,499',
            period: '/mo',
            popular: true,
            features: [
                'Everything in Explorer',
                'Direct Brand Pitches & Fast Approvals',
                'Free & Discounted Villa Shoot Passes',
                'Verified Goa Creator Badge',
                'Real-Time Auto Media Kit',
                '24h Priority Escrow Payouts',
            ],
            cta: 'Upgrade to Pro',
            href: '/join?role=creator',
            variant: 'primary' as const,
        },
        {
            name: 'Brand & Stays',
            desc: 'For luxury villas, resorts & brands',
            price: '₹6,999',
            period: '/mo',
            popular: false,
            features: [
                'Unlimited Campaign & Collab Postings',
                'Access 450+ Verified Goa Creators',
                'Audience Demographics & Reach Vetting',
                'Escrow Payment & Milestone Protection',
                'Dedicated Goa Campaign Manager',
                'Content Licensing & Rights Agreements',
            ],
            cta: 'Partner as Brand',
            href: '/register/business',
            variant: 'outline' as const,
        },
    ]

    return (
        <section id="pricing" className="py-16 sm:py-24 scroll-mt-20">
            <div className="mx-auto max-w-7xl px-6">
                <div className="max-w-md space-y-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                        Membership & Access
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                        Transparent plans for creators &amp; partner brands
                    </h2>
                </div>

                <div className="mt-12 grid gap-6 max-w-5xl mx-auto">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`border border-border bg-card p-8 sm:p-10 rounded-sm shadow-sm flex flex-col ${plan.popular ? 'ring-1 ring-primary' : ''}`}
                        >
                            <div className="space-y-3">
                                {plan.popular && (
                                    <span className="inline-flex items-center gap-1 rounded-sm bg-primary text-primary-foreground px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                                        Most Popular
                                    </span>
                                )}
                                <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                                <p className="text-sm text-muted-foreground">{plan.desc}</p>
                                <div className="text-3xl font-black text-foreground tracking-tight">
                                    {plan.price} <span className="text-sm text-muted-foreground font-normal">{plan.period}</span>
                                </div>
                                <a
                                    href={plan.href}
                                    className={`block text-center font-bold rounded-sm px-5 py-2.5 text-xs transition-colors cursor-pointer ${
                                        plan.variant === 'primary'
                                            ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
                                            : 'border border-border text-foreground hover:bg-muted'
                                    }`}
                                >
                                    {plan.cta}
                                </a>
                            </div>

                            <ul className="mt-8 space-y-3 text-muted-foreground text-sm">
                                {plan.features.map((item, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <Check className="size-3.5 shrink-0 text-primary" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
