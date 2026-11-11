import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'

export default function Pricing() {
    return (
        <section className="py-16 md:py-20 scroll-mt-20" id="pricing">
            <div className="mx-auto max-w-7xl px-6">
                <div className="max-w-md space-y-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                        Membership &amp; Access
                    </span>
                    <h2 className="text-muted-foreground text-balance text-4xl font-medium tracking-tight lg:text-5xl">
                        <span className="text-foreground">Transparent plans.</span> <br /> For creators &amp; partner brands.
                    </h2>
                </div>

                <div className="mt-12 grid gap-6 border *:p-8 max-lg:mx-auto max-lg:max-w-sm lg:mt-20 lg:grid-cols-3 rounded-2xl overflow-hidden">
                    <div className="flex flex-col gap-8 max-lg:border-b lg:border-r">
                        <div>
                            <p className="text-lg font-medium">Explorer</p>
                            <p className="text-muted-foreground text-sm">For emerging creators &amp; nomads</p>

                            <div className="my-8 block text-4xl font-medium tracking-tight">
                                ₹0 <span className="text-muted-foreground text-lg">/mo</span>
                            </div>

                            <Button
                                variant="outline"
                                className="w-full rounded-lg"
                                nativeButton={false}
                                render={<Link href="#contact">Join Free</Link>}
                            />
                        </div>

                        <ul className="text-muted-foreground list-outside space-y-3">
                            {[
                                'Public Goa Creator Profile',
                                'Browse Open Brand Collabs',
                                'Standard Collab Discovery',
                                'Sunset Community Mixers Access',
                                'Basic Engagement Stats',
                            ].map((item, index) => (
                                <li
                                    key={index}
                                    className="flex items-center gap-3 text-sm"
                                >
                                    <Check className="text-emerald-600 dark:text-emerald-400 size-3.5 shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-card relative flex flex-col gap-8 shadow-xl max-lg:border-y lg:border-x">
                        <div className="inset-ring inset-ring-foreground/10 absolute right-0 top-0 w-fit -translate-y-px translate-x-px rounded-bl bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                            Most Popular
                        </div>
                        <div>
                            <p className="text-lg font-medium">Creator Pro</p>
                            <p className="text-muted-foreground text-sm">For active storytellers &amp; influencers</p>

                            <div className="my-8 block text-4xl font-medium tracking-tight">
                                ₹1,499 <span className="text-muted-foreground text-lg">/mo</span>
                            </div>

                            <Button
                                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg"
                                nativeButton={false}
                                render={<Link href="#contact">Upgrade to Pro</Link>}
                            />
                        </div>

                        <ul className="text-muted-foreground list-outside space-y-3">
                            {[
                                'Everything in Explorer',
                                'Direct Brand Pitches & Fast Approvals',
                                'Free & Discounted Villa Shoot Passes',
                                'Verified Goa Creator Badge',
                                'Real-Time Auto Media Kit',
                                '24h Priority Escrow Payouts',
                                'Exclusive Creator House Residencies',
                            ].map((item, index) => (
                                <li
                                    key={index}
                                    className="flex items-center gap-3 text-sm"
                                >
                                    <Check className="text-emerald-600 dark:text-emerald-400 size-3.5 shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="flex flex-col gap-8 max-lg:border-t lg:border-l">
                        <div>
                            <p className="text-lg font-medium">Brand &amp; Stays</p>
                            <p className="text-muted-foreground text-sm">For luxury villas, resorts &amp; brands</p>

                            <div className="my-8 block text-4xl font-medium tracking-tight">
                                ₹6,999 <span className="text-muted-foreground text-lg">/mo</span>
                            </div>

                            <Button
                                className="w-full rounded-lg"
                                variant="outline"
                                nativeButton={false}
                                render={<Link href="#contact">Partner as Brand</Link>}
                            />
                        </div>

                        <ul className="text-muted-foreground list-outside space-y-3">
                            {[
                                'Unlimited Campaign & Collab Postings',
                                'Access 450+ Verified Goa Creators',
                                'Audience Demographics & Reach Vetting',
                                'Escrow Payment & Milestone Protection',
                                'Dedicated Goa Campaign Manager',
                                'Content Licensing & Rights Agreements',
                            ].map((item, index) => (
                                <li
                                    key={index}
                                    className="flex items-center gap-3 text-sm"
                                >
                                    <Check className="text-emerald-600 dark:text-emerald-400 size-3.5 shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    )
}
