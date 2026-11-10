import Link from 'next/link'
import { Logo } from '@/components/logo'

const footerLinks = [
    {
        name: 'Platform',
        links: [
            { href: '#hero-showcase', label: 'Featured Campaigns' },
            { href: '#reels', label: 'Creator Reels' },
            { href: '#locations', label: 'Shoot Locations' },
            { href: '#pricing', label: 'Membership Plans' },
            { href: '#faqs', label: 'Creator FAQs' },
        ],
    },
    {
        name: 'Curated Niches',
        links: [
            { href: '#', label: 'Heritage Villa Stays' },
            { href: '#', label: 'Sunset Beach Clubs' },
            { href: '#', label: 'Drone & Aerial Cinema' },
            { href: '#', label: 'Boutique Cafes & Dining' },
            { href: '#', label: 'Festival & Music Culture' },
        ],
    },
    {
        name: 'Community & Trust',
        links: [
            { href: '#', label: 'Verified Shoot Permits' },
            { href: '#', label: 'Escrow Milestone Guarantee' },
            { href: '#', label: 'Creator House Residencies' },
            { href: '#', label: 'Goa Creator Code' },
            { href: '#', label: 'Brand Partnership Guidelines' },
        ],
    },
]

export default function Footer() {
    return (
        <footer className="border-t border-border/50 bg-background/80">
            <div className="mx-auto max-w-7xl px-6 pt-20 pb-12">
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
                    {/* Brand Info */}
                    <div className="space-y-4 lg:col-span-2">
                        <Link
                            href="/"
                            aria-label="Go to home"
                            className="inline-block"
                        >
                            <Logo />
                        </Link>
                        <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">
                            The premier platform connecting creators, filmmakers, boutique villas, and luxury lifestyle brands across Goa. Unlock verified shoot locations, high-ticket campaigns, and escrow-backed payouts.
                        </p>
                        <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
                            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>850+ Verified Creators in North &amp; South Goa</span>
                        </div>
                    </div>

                    {/* Navigation Columns */}
                    {footerLinks.map((linksGroup, index) => (
                        <div key={index} className="space-y-4">
                            <span className="text-foreground text-xs font-semibold uppercase tracking-wider">
                                {linksGroup.name}
                            </span>
                            <ul className="space-y-2.5">
                                {linksGroup.links.map((link, linkIndex) => (
                                    <li key={linkIndex}>
                                        <Link
                                            href={link.href}
                                            className="text-muted-foreground hover:text-foreground text-sm duration-150 transition-colors"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom Bar */}
                <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-border/50 pt-8 sm:flex-row">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>&copy; 2026 Goa Creator. All rights reserved.</span>
                        <span className="hidden sm:inline">&bull;</span>
                        <span className="hidden sm:inline">Built for Goa&apos;s Creative Community</span>
                    </div>

                    {/* Social Media Links */}
                    <div className="flex items-center gap-3">
                        <Link
                            href="https://instagram.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Instagram"
                            className="size-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-amber-500/50 hover:bg-muted/40 transition-colors duration-150"
                        >
                            <svg className="size-4 fill-current" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                            </svg>
                        </Link>
                        <Link
                            href="https://youtube.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="YouTube"
                            className="size-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-amber-500/50 hover:bg-muted/40 transition-colors duration-150"
                        >
                            <svg className="size-4 fill-current" viewBox="0 0 24 24">
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                            </svg>
                        </Link>
                        <Link
                            href="https://x.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="X (formerly Twitter)"
                            className="size-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-amber-500/50 hover:bg-muted/40 transition-colors duration-150"
                        >
                            <svg className="size-3.5 fill-current" viewBox="0 0 24 24">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
