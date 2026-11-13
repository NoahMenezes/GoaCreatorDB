'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import Link from 'next/link'

export default function FAQs() {
    const faqItems = [
        {
            id: 'item-1',
            question: 'Who can join GoaConnect?',
            answer: 'Any content creator, photographer, filmmaker, lifestyle influencer, DJ, or digital nomad based in or regularly visiting Goa. We welcome creators of all audience sizes who produce authentic, high-quality storytelling.',
        },
        {
            id: 'item-2',
            question: 'How do brand collaborations and payouts work?',
            answer: 'Brands post collaboration briefs specifying deliverables and budget. When you are selected, campaign funds are secured in escrow. Once deliverables are reviewed and approved, payments are released directly to your account.',
        },
        {
            id: 'item-3',
            question: 'Can I book exclusive shoot locations through the platform?',
            answer: 'Yes. GoaConnect partners with heritage Portuguese estates in Fontainhas, private luxury villas in Assagao, jungle retreats, and beach clubs with pre-arranged filming permissions.',
        },
        {
            id: 'item-4',
            question: 'How do villas and hospitality brands join as partners?',
            answer: 'Properties, cafes, and lifestyle brands can register to browse verified creators, post barter or paid campaign briefs, and manage deliverables effortlessly.',
        },
        {
            id: 'item-5',
            question: 'Do I need to be a permanent resident of Goa to join?',
            answer: 'Not at all. We welcome seasonal creators, travel vloggers, and digital nomads who visit Goa and wish to collaborate during their stay.',
        },
    ]

    return (
        <section id="faqs" className="py-16 sm:py-24 scroll-mt-20">
            <div className="mx-auto max-w-7xl px-6">
                <div className="grid gap-10 sm:grid-cols-2">
                    <div className="space-y-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                            Got Questions?
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                            Frequently Asked Questions
                        </h2>
                    </div>

                    <div>
                        <Accordion className="w-full">
                            {faqItems.map((item) => (
                                <AccordionItem key={item.id} value={item.id} className="border-b border-border border-t border-border first:border-t-0 last:border-b-0">
                                    <AccordionTrigger className="flex items-center justify-between py-4 text-sm font-bold text-foreground hover:text-primary transition-colors">
                                        {item.question}
                                    </AccordionTrigger>
                                    <AccordionContent className="py-4 text-sm text-muted-foreground leading-relaxed">
                                        {item.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>

                        <p className="text-xs text-muted-foreground mt-6">
                            Can&apos;t find what you&apos;re looking for? Reach out to our{' '}
                            <Link
                                href="#contact"
                                className="font-bold text-primary hover:underline"
                            >
                                community team
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}
