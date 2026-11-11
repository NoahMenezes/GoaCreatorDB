import { Card } from '@/components/ui/card'
import { Mail, Search, ShieldCheck } from 'lucide-react'

const steps = [
    {
        step: 'STEP 01',
        title: 'Search & Discover',
        description:
            'Filter creators by Goa location (Panjim, Calangute, Assagao, Margao), niche, audience demographics, and budget. Inspect authentic engagement and past beach brand campaigns.',
        icon: Search,
    },
    {
        step: 'STEP 02',
        title: 'Send Booking Request',
        description:
            'Specify your campaign goals, deliverables (Reels, Stories, UGC), dates, and offer (paid or barter stay/experience). Clear brief templates eliminate confusion upfront.',
        icon: Mail,
    },
    {
        step: 'STEP 03',
        title: 'Seamless Collaboration',
        description:
            'Chat directly, approve draft content before posting, release payment safely via escrow, and track campaign ROI with unified analytics reports.',
        icon: ShieldCheck,
    },
]

export default function ContentSection() {
    return (
        <section className="py-16 sm:py-20 scroll-mt-20" id="how-it-works">
            <div className="mx-auto max-w-7xl px-6">
                <div className="rounded-3xl border border-border/70 bg-muted/20 p-8 sm:p-12 lg:p-16">
                    {/* Header */}
                    <div className="text-center max-w-3xl mx-auto space-y-3 mb-12 sm:mb-16">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                            EFFORTLESS WORKFLOW
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                            How GoaConnect Works
                        </h2>
                        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                            Streamlined from discovery to final delivery, built tailored for the coastal hospitality ecosystem.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {steps.map((item, index) => {
                            const Icon = item.icon
                            return (
                                <Card
                                    key={index}
                                    className="relative rounded-2xl border border-border/80 bg-card p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xs hover:shadow-md transition-shadow duration-200"
                                >
                                    <div className="space-y-5">
                                        <div className="size-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                                            <Icon className="size-5" />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                                                {item.step}
                                            </div>
                                            <h3 className="text-xl font-bold tracking-tight text-foreground">
                                                {item.title}
                                            </h3>
                                            <p className="text-muted-foreground text-sm leading-relaxed">
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            )
                        })}
                    </div>
                </div>
            </div>
        </section>
    )
}
