'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    Anchor,
    Bell,
    LayoutDashboard,
    Search,
    Send,
    ShieldCheck,
    Star,
    User,
    Users,
    LogOut,
} from 'lucide-react'

const navItems = [
    { href: '/creator/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/creator/profile', label: 'My Profile', icon: User },
    { href: '/creator/social', label: 'Social Accounts', icon: Users },
    { href: '/creator/requests', label: 'Requests', icon: Send, badge: '4' },
    { href: '/creator/collaborations', label: 'Collaborations', icon: ShieldCheck },
    { href: '/creator/reviews', label: 'Reviews', icon: Star },
]

export default function CreatorLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const [menuOpen, setMenuOpen] = useState(false)

    return (
        <div className="min-h-screen flex bg-background text-foreground">
            {/* Sidebar */}
            <aside
                className="w-64 bg-card border-r border-border flex flex-col hidden lg:flex"
                aria-label="Main navigation"
            >
                <div className="flex items-center gap-2 p-6 border-b border-border">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="relative flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                            <Anchor className="size-4" />
                        </div>
                        <span className="font-bold text-foreground tracking-tight text-sm leading-none">
                            GoaConnect
                        </span>
                    </Link>
                </div>

                <nav className="flex-1 space-y-0.5 p-4 mt-2" aria-label="Creator workspace">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors duration-150 cursor-pointer rounded-md ${
                                    isActive
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                }`}
                            >
                                <Icon className="size-5 shrink-0" />
                                <span>{item.label}</span>
                                {item.badge && (
                                    <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded border border-border bg-muted text-muted-foreground">
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-border">
                    <div className="flex items-center gap-3 p-2 rounded-md bg-muted/40 border border-border/50">
                        <div className="size-8 bg-primary text-primary-foreground flex items-center justify-center shrink-0 rounded-md font-bold text-xs">
                            SF
                        </div>
                        <div className="text-left flex-1 min-w-0">
                            <div className="text-xs font-bold text-foreground truncate">Sneha Ferns (Demo Fictional)</div>
                            <div className="text-[10px] text-muted-foreground truncate">@sneha_demo · Assagao</div>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => {}}
                        className="mt-3 w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-destructive hover:bg-destructive/5 rounded-md transition-colors cursor-pointer border border-destructive/20"
                    >
                        <LogOut className="size-4 shrink-0" />
                        <span>Sign out</span>
                    </button>
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md px-6 flex items-center justify-between gap-4 sticky top-0 z-20">
                    <div className="flex items-center gap-3 flex-1 max-w-2xl">
                        <div className="relative flex items-center w-full">
                            <Search className="absolute left-3 size-4 text-muted-foreground shrink-0" />
                            <input
                                type="text"
                                placeholder="Search campaigns, businesses, briefs…"
                                className="w-full border border-border bg-background pl-10 pr-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring rounded-sm"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            className="size-9 border border-border bg-background flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-sm cursor-pointer transition-colors"
                            aria-label="Messages"
                        >
                            <Bell className="size-4" />
                        </button>
                        <button
                            type="button"
                            className="relative size-9 border border-border bg-background flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-sm cursor-pointer transition-colors"
                            aria-label="Notifications"
                        >
                            <Bell className="size-4" />
                            <span className="absolute top-1 right-1 size-2 bg-primary rounded-full border-2 border-background" />
                        </button>
                        <div className="size-8 bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs rounded-sm border border-primary/30">
                            SF
                        </div>
                    </div>
                </header>

                <div className="flex-1 p-6 sm:p-8 lg:p-10 max-w-none w-full">
                    {children}
                </div>
            </div>

            {/* Mobile sidebar overlay */}
            <div className="lg:hidden fixed inset-0 z-40" aria-hidden="true">
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                    onClick={() => setMenuOpen(false)}
                    aria-hidden={!menuOpen}
                />
                <aside
                    className={`fixed left-0 top-0 h-full w-64 bg-card border-r border-border flex flex-col z-50 transform transition-transform duration-200 ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}
                >
                    <div className="flex items-center justify-between p-6 border-b border-border">
                        <div className="flex items-center gap-2">
                            <div className="relative flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                                <Anchor className="size-4" />
                            </div>
                            <span className="font-bold text-foreground tracking-tight text-sm leading-none">GoaConnect</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setMenuOpen(false)}
                            className="size-8 rounded-sm border border-border bg-background flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                            <span className="sr-only">Close menu</span>
                            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <nav className="flex-1 space-y-0.5 p-4 mt-2">
                        {navItems.map((item) => {
                            const Icon = item.icon
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMenuOpen(false)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors duration-150 cursor-pointer rounded-md ${
                                        isActive
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                    }`}
                                >
                                    <Icon className="size-5 shrink-0" />
                                    <span>{item.label}</span>
                                </Link>
                            )
                        })}
                    </nav>
                </aside>
            </div>
        </div>
    )
}
