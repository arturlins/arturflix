import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

type Variant = 'first-time' | 'filtered' | 'cleared'

type Props = {
    variant?: Variant
    Icon?: LucideIcon
    eyebrow?: string
    title: string
    description: string
    primary?: ReactNode
    secondary?: ReactNode
}

export function EmptyState({
    variant = 'first-time',
    Icon,
    eyebrow,
    title,
    description,
    primary,
    secondary,
}: Props) {
    return (
        <div className="relative overflow-hidden rounded-2xl border border-dashed border-border bg-surface-2/40 px-8 py-20 text-center">
            {variant === 'first-time' && (
                <div
                    className="absolute inset-0 opacity-[0.05] pointer-events-none"
                    style={{
                        backgroundImage: 'radial-gradient(circle, rgb(244 245 247) 1px, transparent 1px)',
                        backgroundSize: '22px 22px',
                    }}
                    aria-hidden="true"
                />
            )}
            <div className="relative">
                {Icon && (
                    <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-surface-3 text-foreground-muted mb-5">
                        <Icon size={20} aria-hidden="true" />
                    </div>
                )}
                {eyebrow && (
                    <p className="text-[10px] uppercase tracking-[0.22em] text-foreground-subtle mb-3">{eyebrow}</p>
                )}
                <h3 className="font-display text-xl text-foreground">{title}</h3>
                <p className="text-sm text-foreground-muted mt-2 max-w-md mx-auto leading-relaxed">{description}</p>
                {(primary || secondary) && (
                    <div className="mt-6 flex items-center justify-center gap-2">
                        {primary}
                        {secondary}
                    </div>
                )}
            </div>
        </div>
    )
}
