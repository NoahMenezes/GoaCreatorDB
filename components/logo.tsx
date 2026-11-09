import { cn } from '@/lib/utils'

export const LogoIcon = ({ className }: { className?: string; uniColor?: boolean }) => {
    return (
        <span
            className={cn(
                'relative inline-flex size-7 items-center justify-center rounded-lg bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 text-white font-black text-xs tracking-wider shadow-sm select-none',
                className
            )}
        >
            GC
        </span>
    )
}

export const Logo = ({ className }: { className?: string; uniColor?: boolean }) => {
    return (
        <div className={cn('inline-flex items-center gap-2.5 select-none', className)}>
            <LogoIcon />
            <span className="text-foreground text-lg font-bold tracking-tight">
                Goa<span className="text-amber-500 dark:text-amber-400">Creator</span>
            </span>
        </div>
    )
}
