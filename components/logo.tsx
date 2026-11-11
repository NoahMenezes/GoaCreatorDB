import { cn } from '@/lib/utils'

export const Logo = ({ className }: { className?: string; uniColor?: boolean }) => {
    return (
        <div className={cn('inline-flex items-center gap-2.5 select-none tracking-tight group', className)}>
            <div className="relative flex size-8 items-center justify-center rounded-lg bg-emerald-600/15 border border-emerald-600/30 text-emerald-600 dark:text-emerald-400 shadow-xs transition-all duration-300 group-hover:scale-105">
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-4.5"
                >
                    <path d="M2 12c3-4 6-4 9 0s6 4 9 0" />
                    <path d="M5 16c2.5-3 5-3 7.5 0s5 3 7.5 0" />
                    <circle cx="17" cy="6" r="2.5" className="fill-emerald-500/20" />
                </svg>
            </div>

            <span className="font-sans text-lg font-bold tracking-tight text-foreground leading-tight flex items-center">
                Goa<span className="text-emerald-700 dark:text-emerald-400 font-extrabold">Connect</span>
            </span>
        </div>
    )
}

export const LogoIcon = ({ className }: { className?: string; uniColor?: boolean }) => {
    return (
        <div
            className={cn(
                'relative flex size-8 items-center justify-center rounded-lg bg-emerald-600/15 border border-emerald-600/30 text-emerald-600 dark:text-emerald-400 shadow-xs',
                className
            )}
        >
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4.5"
            >
                <path d="M2 12c3-4 6-4 9 0s6 4 9 0" />
                <path d="M5 16c2.5-3 5-3 7.5 0s5 3 7.5 0" />
                <circle cx="17" cy="6" r="2.5" className="fill-emerald-500/20" />
            </svg>
        </div>
    )
}
