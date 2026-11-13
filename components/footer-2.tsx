import Link from 'next/link'
import { Logo } from '@/components/logo'
import { Anchor, Camera, Mail } from 'lucide-react'

const topLocations = [
    { name: 'Assagao', href: '#creators' },
    { name: 'Panjim', href: '#creators' },
    { name: 'Calangute', href: '#creators' },
    { name: 'Margao', href: '#creators' },
    { name: 'Vasco da Gama', href: '#creators' },
    { name: 'Mapusa', href: '#creators' },
]

const creatorNiches = [
    { name: 'Hospitality & Stays', href: '#categories' },
    { name: 'Cafes & Foodies', href: '#categories' },
    { name: 'Surf & Ocean Lifestyle', href: '#categories' },
    { name: 'Nightlife & DJ Sets', href: '#categories' },
    { name: 'Architectural Visuals', href: '#categories' },
    { name: 'Boutique Fashion', href: '#categories' },
]

const platformLinks = [
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Brand Pricing', href: '#pricing' },
    { name: 'Creator Application', href: '/join?role=creator' },
    { name: 'Client Sign In', href: '/login' },
    { name: 'Privacy & Terms', href: '#' },
]

export default function Footer() {
    return (
        <footer className="border-t border-border bg-background">
            <div className="mx-auto max-w-7xl px-6 pt-16 pb-12">
                <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-5">
                    {/* Brand Info */}
                    <div className="space-y-5 lg:col-span-2">
                        <Link
                            href="/"
                            aria-label="GoaConnect home"
                            className="inline-block"
                        >
                            <Logo />
                        </Link>
                        <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                            Connecting coastal hospitality, resorts, and lifestyle spaces with curated local creators across Goa.
                        </p>

                        {/* Social Media Icons */}
                        <div className="flex items-center gap-3">
                            <Link
                                href="https://instagram.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Instagram"
                                className="size-8 rounded-sm border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                            >
                                <svg className="size-4 fill-current" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                            </Link>
                            <Link
                                href="#creators"
                                aria-label="Reels & Visuals"
                                className="size-8 rounded-sm border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                            >
                                <Camera className="size-4" />
                            </Link>
                            <Link
                                href="mailto:hello@goaconnect.in"
                                aria-label="Contact Email"
                                className="size-8 rounded-sm border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                            >
                                <Mail className="size-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Column 1: Top Locations */}
                    <div className="space-y-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            TOP LOCATIONS
                        </span>
                        <ul className="space-y-2.5">
                            {topLocations.map((loc, idx) => (
                                <li key={idx}>
                                    <Link
                                        href={loc.href}
                                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        {loc.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 2: Creator Niches */}
                    <div className="space-y-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            CREATOR NICHES
                        </span>
                        <ul className="space-y-2.5">
                            {creatorNiches.map((niche, idx) => (
                                <li key={idx}>
                                    <Link
                                        href={niche.href}
                                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        {niche.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 3: Platform */}
                    <div className="space-y-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            PLATFORM
                        </span>
                        <ul className="space-y-2.5">
                            {platformLinks.map((item, idx) => (
                                <li key={idx}>
                                    <Link
                                        href={item.href}
                                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Row */}
                <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row text-xs text-muted-foreground">
                    <div>
                        &copy; 2026 GoaConnect Marketplace. Handcrafted for the coastal creative economy.
                    </div>

                    <div className="flex items-center gap-1.5 font-medium text-foreground">
                        <Anchor className="size-3.5 text-primary" />
                        <span>Rooted in Goa, India</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}
