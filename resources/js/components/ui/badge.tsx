import type { ReactNode } from 'react'

type Tone = 'neutral' | 'accent' | 'warning' | 'success' | 'info'
type Variant = 'soft' | 'outline' | 'solid'

const TONE: Record<Tone, Record<Variant, string>> = {
    neutral: {
        soft: 'bg-surface-3 text-foreground-muted',
        outline: 'border border-border text-foreground-muted',
        solid: 'bg-foreground text-canvas',
    },
    accent: {
        soft: 'bg-accent/12 text-accent',
        outline: 'border border-accent/40 text-accent',
        solid: 'bg-accent text-white',
    },
    warning: {
        soft: 'bg-warning/12 text-warning',
        outline: 'border border-warning/40 text-warning',
        solid: 'bg-warning text-canvas',
    },
    success: {
        soft: 'bg-success/12 text-success',
        outline: 'border border-success/40 text-success',
        solid: 'bg-success text-white',
    },
    info: {
        soft: 'bg-blue-500/12 text-blue-300',
        outline: 'border border-blue-500/40 text-blue-300',
        solid: 'bg-blue-500 text-white',
    },
}

type Props = {
    tone?: Tone
    variant?: Variant
    dot?: boolean
    pulse?: boolean
    children: ReactNode
}

export function Badge({ tone = 'neutral', variant = 'soft', dot, pulse, children }: Props) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] ${TONE[tone][variant]}`}
        >
            {dot && (
                <span className="relative inline-flex h-1.5 w-1.5">
                    {pulse && <span className="absolute inset-0 rounded-full bg-current opacity-75 animate-ping" />}
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current" />
                </span>
            )}
            {children}
        </span>
    )
}
