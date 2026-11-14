'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
    Anchor,
    BarChart3,
    FileText,
    LayoutDashboard,
    LogOut,
    MapPin,
    ShieldCheck,
    Tags,
    Users,
} from 'lucide-react'
import { AnimatedThemeToggler } from '@/registry/magicui/animated-theme-toggler'

const navItems = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
    { href: '/admin/verifications', label: 'Verifications', icon: ShieldCheck },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/taxonomy', label: 'Taxonomy', icon: Tags },
    { href: '/admin/reports', label: 'Reports', icon: FileText },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()
    const [adminEmail, setAdminEmail] = useState<string | null>(null)
    const [authChecked, setAuthChecked] = useState(false)

    useEffect(() => {
        fetch('/api/auth/me')
            .then((r) => r.json())
            .then((data) => {
                if (!data.authenticated || data.user?.role !== 'admin') {
                    router.replace('/login?redirect=/admin')
                } else {
                    setAdminEmail(data.user.email || 'admin@goaconnect.in')
                    setAuthChecked(true)
                }
            })
            .catch(() => router.replace('/login?redirect=/admin'))
    }, [router])

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' })
        router.push('/login')
    }

    if (!authChecked) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
                <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    const initials = adminEmail ? adminEmail.substring(0, 2).toUpperCase() : 'AD'

    return (
        <div className="min-h-screen flex bg-background text-foreground">
            {/* LEFT SIDEBAR */}
            <aside className="w-64 border-r border-border bg-card hidden md:flex flex-col justify-between p-4 shrink-0 sticky top-0 h-screen overflow-y-auto">
                <div className="space-y-6">
                    {/* Brand Header */}
                    <Link href="/admin" className="flex items-center gap-2.5 px-2 py-1">
                        <div className="size-9 bg-primary text-primary-foreground flex items-center justify-center">
                            <Anchor className="size-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-base font-extrabold tracking-tight text-foreground leading-none">
                                GoaConnect
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary mt-1">
                                ADMIN CONSOLE
                            </span>
                        </div>
                    </Link>

                    {/* Navigation Links */}
                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon
                            const isActive = item.exact
                                ? pathname === item.href
                                : pathname === item.href || pathname.startsWith(item.href + '/')
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs sm:text-sm font-semibold transition-colors duration-150 cursor-pointer ${
                                        isActive
                                            ? 'bg-primary text-primary-foreground border-l-4 border-l-accent-foreground'
                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`}
                                >
                                    <Icon className="size-4" />
                                    <span>{item.label}</span>
                                </Link>
                            )
                        })}
                    </nav>
                </div>

                {/* Bottom Account Area */}
                <div className="space-y-3 pt-4 border-t border-border">
                    <div className="border border-border bg-card p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="size-9 bg-primary text-primary-foreground flex items-center justify-center shrink-0 font-bold text-xs">
                                {initials}
                            </div>
                            <div className="text-left min-w-0">
                                <div className="text-xs font-bold text-foreground truncate">System Admin</div>
                                <div className="text-[11px] text-muted-foreground truncate">{adminEmail}</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between px-2 text-[11px] text-muted-foreground">
                        <Link href="/join" className="hover:text-foreground hover:underline flex items-center gap-1">
                            <MapPin className="size-3" /> Switch Role
                        </Link>
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="hover:text-foreground hover:underline cursor-pointer flex items-center gap-1"
                        >
                            <LogOut className="size-3" /> Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* TOP BAR */}
                <header className="h-16 border-b border-border bg-card px-4 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-30">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="size-4 text-primary" />
                        <span className="text-xs font-bold uppercase tracking-wider text-primary">
                            GoaConnect Admin
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                            <span className="size-2 bg-primary rounded-full" />
                            <span>Live System</span>
                        </div>
                        <AnimatedThemeToggler className="flex size-9 items-center justify-center border border-border bg-background text-foreground hover:bg-muted duration-150 cursor-pointer" />
                        <div className="flex items-center gap-2 border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground">
                            <BarChart3 className="size-3.5 text-primary" />
                            <span>Admin Console</span>
                        </div>
                    </div>
                </header>

                <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-0">
                    {children}
                </div>
            </div>
        </div>
    )
}

