'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import {
    Anchor,
    Bell,
    Bookmark,
    Compass,
    LayoutDashboard,
    MapPin,
    Search,
    Send,
    ShieldCheck,
    Star,
    User,
    Users,
    FileText,
    ExternalLink,
    CheckCircle2,
} from 'lucide-react'

const navItems = [
    { href: '/creator/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/creator/profile', label: 'My Profile', icon: User },
    { href: '/creator/social', label: 'Social Accounts & Metrics', icon: Users },
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

    return (
        <div className="min-h-screen flex bg-[#f5f2ff] text-[#1a1a2e]">
            <aside className="w-64 bg-[#0c4e40] text-white flex flex-col hidden lg:flex">
                <div className="flex items-center gap-2 p-6">
                    <div className="size-8 bg-white text-[#0c4e40] flex items-center justify-center rounded-full">
                        <Anchor className="size-4" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold tracking-tight text-white leading-none">
                            GoaConnect
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-teal-300 mt-0.5">
                            CREATOR HUB
                        </span>
                    </div>
                </div>

                <nav className="flex-1 space-y-1 p-4 mt-4">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-colors duration-150 cursor-pointer rounded-xl ${isActive
                                    ? 'bg-white text-[#0c4e40] shadow-sm'
                                    : 'text-[#e2e8f0] hover:text-white hover:bg-white/10'
                                }`}
                            >
                                <Icon className="size-5" />
                                <span>{item.label}</span>
                                {item.badge && (
                                    <span className="ml-auto text-[10px] font-bold px-2 py-0.5 bg-[#f59e0b] text-[#1a1a2e] rounded-full">
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-teal-500/20">
                    <div className="flex items-center gap-3 p-2 bg-white/5 rounded-xl">
                        <div className="size-9 bg-teal-300 text-[#1a1a2e] flex items-center justify-center shrink-0 rounded-full">
                            <User className="size-5" />
                        </div>
                        <div className="text-left flex-1">
                            <div className="text-xs font-bold text-white">Sneha Fernandes</div>
                            <div className="text-[10px] text-teal-200">@sneha_curates · Assagao</div>
                        </div>
                    </div>
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-16 border-b border-[#ddd6fe]/60 bg-[#f5f2ff]/80 backdrop-blur-md px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
                    <div className="flex items-center gap-3 flex-1 max-w-2xl">
                        <div className="relative flex items-center w-full">
                            <Search className="absolute left-3 size-4 text-[#6b7280]" />
                            <input
                                type="text"
                                placeholder="Search campaigns, businesses, briefs..."
                                className="w-full border border-[#ddd6fe]/60 bg-white pl-10 pr-3.5 py-2.5 text-sm text-[#1a1a2e] focus:outline-none focus:ring-1 focus:ring-[#0c4e40] rounded-xl"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            className="size-9 border border-[#ddd6fe]/60 bg-white flex items-center justify-center text-[#6b7280] hover:text-[#0c4e40] hover:bg-[#f3f0ff] cursor-pointer rounded-xl"
                            aria-label="Messages"
                        >
                            <Bell className="size-4" />
                        </button>

                        <button
                            type="button"
                            className="relative size-9 border border-[#ddd6fe]/60 bg-white flex items-center justify-center text-[#6b7280] hover:text-[#0c4e40] hover:bg-[#f3f0ff] cursor-pointer rounded-xl"
                            aria-label="Notifications"
                        >
                            <Bell className="size-4" />
                            <span className="absolute top-1 right-1 size-2 bg-[#f59e0b] rounded-full border-2 border-white" />
                        </button>

                        <div className="size-9 bg-[#0c4e40] border border-teal-300 text-white flex items-center justify-center font-bold text-xs rounded-full">
                            SF
                        </div>
                    </div>
                </header>

                <div className="flex-1 p-6 sm:p-8 lg:p-12 max-w-7xl mx-auto w-full">
                    {children}
                </div>
            </div>
        </div>
    )
}
