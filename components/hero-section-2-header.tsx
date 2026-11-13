'use client'

import Link from 'next/link'
import { Logo } from '@/components/logo'
import { X } from 'lucide-react'
import { AnimatedThemeToggler } from '@/registry/magicui/animated-theme-toggler'
import React from 'react'

const menuItems = [
    { name: 'Explore Creators', href: '#creators' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Pricing', href: '#pricing' },
]

export const HeroHeader = () => {
    const [menuState, setMenuState] = React.useState(false)
    const [userRole, setUserRole] = React.useState<string | null>(null)

    React.useEffect(() => {
        fetch('/api/auth/me')
            .then((r) => r.json())
            .then((data) => {
                if (data.authenticated && data.user) {
                    setUserRole(data.user.role)
                }
            })
            .catch(() => {})
    }, [])

    React.useEffect(() => {
        if (!menuState) return
        const mediaQuery = window.matchMedia('(max-width: 1023px)')
        const updateOverflow = () => {
            document.documentElement.classList.toggle('overflow-hidden', mediaQuery.matches)
        }
        updateOverflow()
        mediaQuery.addEventListener('change', updateOverflow)
        return () => {
            mediaQuery.removeEventListener('change', updateOverflow)
            document.documentElement.classList.remove('overflow-hidden')
        }
    }, [menuState])

    return (
        <header>
            <nav
                data-state={menuState && 'active'}
                className="bg-background/90 backdrop-blur-md fixed top-0 z-20 w-full border-b border-border/60 max-lg:data-[state=active]:bottom-0"
            >
                <div className="mx-auto max-w-7xl px-6">
                    <div className="relative flex flex-wrap items-center justify-between max-lg:gap-6">
                        <div className="max-lg:in-data-[state=active]:border-b flex w-full items-center justify-between gap-6 py-4 lg:w-auto lg:py-4">
                            <Link
                                href="/"
                                aria-label="GoaConnect home"
                                className="flex items-center space-x-2"
                            >
                                <Logo />
                            </Link>

                            <div className="flex items-center gap-3 lg:hidden">
                                <AnimatedThemeToggler className="flex size-9 items-center justify-center rounded-sm border border-border bg-background text-foreground hover:bg-muted duration-150 cursor-pointer" />
                                <button
                                    onClick={() => setMenuState(!menuState)}
                                    aria-label={menuState ? 'Close Menu' : 'Open Menu'}
                                    className="relative z-20 block cursor-pointer after:absolute after:-inset-4"
                                >
                                    <div className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 size-4.5 m-auto flex flex-col items-center justify-center gap-[7px] duration-200">
                                        <span className="bg-foreground h-0.5 w-full rounded-full" />
                                        <span className="bg-foreground h-0.5 w-full rounded-full" />
                                    </div>

                                    <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 translate-x-[-3px] -rotate-180 scale-0 opacity-0 duration-200" />
                                </button>
                            </div>

                            <div className="max-lg:hidden">
                                <ul className="flex gap-8 text-sm">
                                    {menuItems.map((item, index) => (
                                        <li key={index}>
                                            <Link
                                                href={item.href}
                                                className="text-muted-foreground hover:text-foreground font-medium block duration-150 transition-colors"
                                            >
                                                <span>{item.name}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end max-lg:space-y-8 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-3">
                            <div className="lg:hidden">
                                <ul>
                                    {menuItems.map((item, index) => (
                                        <li key={index}>
                                            <Link
                                                href={item.href}
                                                onClick={() => setMenuState(false)}
                                                className="text-foreground block py-3 text-lg font-medium"
                                            >
                                                <span>{item.name}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="flex w-full items-center space-y-3 sm:flex-row sm:gap-2.5 sm:space-y-0 md:w-fit">
                                <div className="hidden lg:block">
                                    <AnimatedThemeToggler className="flex size-9 items-center justify-center rounded-sm border border-border bg-background text-foreground hover:bg-muted duration-150 cursor-pointer" />
                                </div>

                                {userRole === 'business' ? (
                                    <a
                                        href="/business/dashboard"
                                        className="text-xs font-bold text-primary-foreground bg-primary hover:bg-primary/90 px-4 py-2.5 rounded-sm shadow-sm transition-colors cursor-pointer"
                                    >
                                        Business Portal
                                    </a>
                                ) : (
                                    <a
                                        href="/login"
                                        className="text-xs font-bold text-foreground border border-border bg-background hover:bg-muted px-4 py-2.5 rounded-sm transition-colors cursor-pointer"
                                    >
                                        Sign In
                                    </a>
                                )}

                                <a
                                    href="/join?role=creator"
                                    className="text-xs font-bold text-primary-foreground bg-primary hover:bg-primary/90 px-4 py-2.5 rounded-sm shadow-sm transition-colors cursor-pointer"
                                >
                                    Join as Creator
                                </a>

                                <Link
                                    href={userRole === 'business' ? '/business/dashboard' : '/login'}
                                    aria-label="Profile"
                                    className="hidden sm:flex size-9 items-center justify-center rounded-sm bg-primary text-primary-foreground border border-primary/30 hover:opacity-90 duration-150"
                                    title="Profile"
                                >
                                    <span className="font-bold text-[10px]">P</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
}
