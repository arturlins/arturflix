import type { ReactNode } from 'react'

type Props = {
    eyebrow?: string
    title: string
    description?: string
    actions?: ReactNode
}

export function PageHeader({ eyebrow, title, description, actions }: Props) {
    return (
        <div className="flex items-start justify-between gap-8 mb-10">
            <div className="min-w-0">
                {eyebrow && (
                    <p className="text-[10px] uppercase tracking-[0.22em] text-foreground-subtle mb-3">{eyebrow}</p>
                )}
                <h1 className="font-display text-[34px] leading-[1.05] text-foreground">{title}</h1>
                {description && (
                    <p className="text-sm text-foreground-muted mt-3 max-w-xl leading-relaxed">{description}</p>
                )}
            </div>
            {actions && <div className="flex items-center gap-2 shrink-0 pt-1">{actions}</div>}
        </div>
    )
}
