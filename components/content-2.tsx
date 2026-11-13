import { Mail, Search, ShieldCheck } from 'lucide-react'

const steps = [
    {
        step: 'STEP 01',
        title: 'Search & Discover',
        description:
            'Filter creators by Goa location (Panjim, Calangute, Assagao, Margao), niche, audience demographics, and budget. Inspect authentic engagement and past brand campaigns.',
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
        <section id="how-it-works" className="py-16 sm:py-24 scroll-mt-20">
            <div className="mx-auto max-w-7xl px-6">
                <div className="text-center max-w-3xl mx-auto space-y-3 mb-12 sm:mb-16">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                        Effortless Workflow
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                        How GoaConnect Works
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Streamlined from discovery to final delivery, built tailored for the coastal hospitality ecosystem.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {steps.map((item, index) => {
                        const Icon = item.icon
                        return (
                            <div
                                key={index}
                                className="border border-border bg-card p-6 rounded-sm shadow-sm flex flex-col space-y-5"
                            >
                                <div className="size-8 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                                    <Icon className="size-4" />
                                </div>
                                <div className="space-y-2">
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-primary">
                                        {item.step}
                                    </div>
                                    <h3 className="text-sm font-bold text-foreground">
                                        {item.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
