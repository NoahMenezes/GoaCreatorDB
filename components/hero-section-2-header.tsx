'use client'

import Link from 'next/link'
import { Logo } from '@/components/logo'
import { User, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnimatedThemeToggler } from '@/registry/magicui/animated-theme-toggler'
import React from 'react'

const menuItems = [
    { name: 'Explore Creators', href: '#creators' },
    { name: 'Categories', href: '#categories' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Pricing', href: '#pricing' },
]

export const HeroHeader = () => {
    const [menuState, setMenuState] = React.useState(false)
    const [userRole, setUserRole] = React.useState<string | null>(null)
    const [bizName, setBizName] = React.useState<string | null>(null)

    React.useEffect(() => {
        fetch('/api/auth/me')
            .then((r) => r.json())
            .then((data) => {
                if (data.authenticated && data.user) {
                    setUserRole(data.user.role)
                    if (data.profile?.business_name) {
                        setBizName(data.profile.business_name)
                    }
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
                                <AnimatedThemeToggler className="flex size-9 items-center justify-center rounded-full border border-border bg-background text-foreground hover:bg-muted duration-150 cursor-pointer" />
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
                                                className="text-foreground block py-3 text-2xl font-medium"
                                            >
                                                <span>{item.name}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="flex w-full items-center space-y-3 sm:flex-row sm:gap-2.5 sm:space-y-0 md:w-fit">
                                <div className="hidden lg:block">
                                    <AnimatedThemeToggler className="flex size-9 items-center justify-center rounded-full border border-border bg-background text-foreground hover:bg-muted duration-150 cursor-pointer" />
                                </div>

                                {userRole === 'business' ? (
                                    <Button
                                        size="sm"
                                        className="bg-teal-700 hover:bg-teal-800 text-white font-semibold cursor-pointer rounded-lg px-4 h-9 shadow-xs"
                                        nativeButton={false}
                                        render={
                                            <Link href="/portal">
                                                <span>Business Portal</span>
                                            </Link>
                                        }
                                    />
                                ) : (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="cursor-pointer rounded-lg font-medium px-4 h-9 border-border hover:bg-muted"
                                        nativeButton={false}
                                        render={
                                            <Link href="/login">
                                                <span>Sign In</span>
                                            </Link>
                                        }
                                    />
                                )}

                                <Button
                                    size="sm"
                                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-medium cursor-pointer rounded-lg px-4 h-9 shadow-xs"
                                    nativeButton={false}
                                    render={
                                        <Link href="/join?role=creator">
                                            <span>Join as Creator</span>
                                        </Link>
                                    }
                                />

                                <Link
                                    href={userRole === 'business' ? '/portal' : '/login'}
                                    aria-label="Profile"
                                    className="hidden sm:flex size-9 items-center justify-center rounded-full bg-emerald-950 text-white dark:bg-emerald-900 border border-emerald-700/50 hover:opacity-90 duration-150"
                                    title={bizName || 'Profile'}
                                >
                                    <User className="size-4.5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
}
