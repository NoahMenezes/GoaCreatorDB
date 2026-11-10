import { cn } from '@/lib/utils'

export const Logo = ({ className }: { className?: string; uniColor?: boolean }) => {
    return (
        <div className={cn('inline-flex items-center gap-2.5 select-none tracking-tight group', className)}>
            <div className="relative flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-orange-500/5 border border-amber-500/30 text-amber-500 dark:text-amber-400 shadow-sm transition-all duration-300 group-hover:border-amber-500/50 group-hover:scale-105">
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-5"
                >
                    <circle cx="12" cy="12" r="9" className="stroke-current opacity-30" strokeWidth="1.2" />
                    <circle cx="12" cy="12" r="3.5" className="fill-amber-500/30 stroke-current" strokeWidth="1.8" />
                    <path d="M12 3v3" />
                    <path d="m18.36 5.64-2.12 2.12" />
                    <path d="M21 12h-3" />
                    <path d="m18.36 18.36-2.12-2.12" />
                    <path d="M12 21v-3" />
                    <path d="m5.64 18.36 2.12-2.12" />
                    <path d="M3 12h3" />
                    <path d="m5.64 5.64 2.12 2.12" />
                </svg>
            </div>

            <div className="flex flex-col text-left">
                <span className="font-sans text-lg font-black tracking-tight text-foreground leading-tight flex items-center">
                    GOA<span className="text-amber-500 dark:text-amber-400 font-extrabold ml-1">CREATOR</span>
                </span>
                <span className="text-[9.5px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/80 leading-none">
                    Media &amp; Stays Collective
                </span>
            </div>
        </div>
    )
}

export const LogoIcon = ({ className }: { className?: string; uniColor?: boolean }) => {
    return (
        <div
            className={cn(
                'relative flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-orange-500/5 border border-amber-500/30 text-amber-500 dark:text-amber-400 shadow-sm',
                className
            )}
        >
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4.5"
            >
                <circle cx="12" cy="12" r="9" className="stroke-current opacity-30" strokeWidth="1.2" />
                <circle cx="12" cy="12" r="3.5" className="fill-amber-500/30 stroke-current" strokeWidth="1.8" />
                <path d="M12 3v3" />
                <path d="m18.36 5.64-2.12 2.12" />
                <path d="M21 12h-3" />
                <path d="m18.36 18.36-2.12-2.12" />
                <path d="M12 21v-3" />
                <path d="m5.64 18.36 2.12-2.12" />
                <path d="M3 12h3" />
                <path d="m5.64 5.64 2.12 2.12" />
            </svg>
        </div>
    )
}
