import Link from 'next/link'
import { Logo } from '@/components/logo'
import { Gemini } from '@/components/ui/svgs/gemini'
import { ClaudeAI } from '@/components/ui/svgs/claude-ai'
import { Openai } from '@/components/ui/svgs/openai'
import { Perplexity } from '@/components/ui/svgs/perplexity'
import { Button } from '@/components/ui/button'

const footerLinks = [
    {
        name: 'Platform',
        links: [
            { href: '#features', label: 'Discover' },
            { href: '#locations', label: 'Shoot Locations' },
            { href: '#pricing', label: 'Pricing' },
            { href: '#faqs', label: 'FAQs' },
        ],
    },
    {
        name: 'Community',
        links: [
            { href: '#', label: 'Creator Directory' },
            { href: '#', label: 'Sunset Mixers' },
            { href: '#', label: 'Partner Villas' },
            { href: '#', label: 'Creator Code' },
        ],
    },
    {
        name: 'Legal',
        links: [
            { href: '#', label: 'Privacy Policy' },
            { href: '#', label: 'Terms of Service' },
            { href: '#', label: 'Content Guidelines' },
        ],
    },
]

export default function Footer() {
    return (
        <footer>
            <div className="mx-auto max-w-7xl space-y-16 px-6 pb-6 pt-24">
                <div className="grid grid-cols-2 gap-x-3 gap-y-12 sm:grid-cols-4 lg:grid-cols-6">
                    <div className="col-span-full lg:col-span-3 space-y-4">
                        <Link
                            href="/"
                            aria-label="go home"
                        >
                            <Logo />
                        </Link>
                        <p className="text-muted-foreground text-sm max-w-sm">
                            The premier platform connecting creators, luxury villas, and brands across Goa.
                        </p>
                    </div>

                    {footerLinks.map((linksGroup, index) => (
                        <div key={index}>
                            <span className="text-foreground text-sm font-medium">{linksGroup.name}</span>
                            <ul className="mt-4 list-inside space-y-3">
                                {linksGroup.links.map((link, index) => (
                                    <li key={index}>
                                        <Link
                                            href={link.href}
                                            className="hover:text-primary text-muted-foreground text-sm duration-150"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className="mt-16 grid gap-x-3 gap-y-6 border-t pt-6 sm:grid-cols-2">
                    <div>
                        <p className="text-muted-foreground text-sm">Summarize this page with AI</p>
                        <div className="-ml-2.5 mt-2 flex items-center">
                            <Button
                                variant="ghost"
                                size="icon"
                                nativeButton={false}
                                render={
                                    <Link
                                        href="#"
                                        aria-label="Claude AI"
                                    >
                                        <ClaudeAI />
                                    </Link>
                                }
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                nativeButton={false}
                                render={
                                    <Link
                                        href="#"
                                        aria-label="OpenAI"
                                    >
                                        <Openai />
                                    </Link>
                                }
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                nativeButton={false}
                                render={
                                    <Link
                                        href="#"
                                        aria-label="Perplexity"
                                    >
                                        <Perplexity className="size-5!" />
                                    </Link>
                                }
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                nativeButton={false}
                                render={
                                    <Link
                                        href="#"
                                        aria-label="Gemini"
                                    >
                                        <Gemini />
                                    </Link>
                                }
                            />
                        </div>
                    </div>
                    <span className="text-muted-foreground block text-sm sm:text-right self-center">
                        &copy; 2026 Goa Creator. All rights reserved.
                    </span>
                </div>
            </div>
        </footer>
    )
}
