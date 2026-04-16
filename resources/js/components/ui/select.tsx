import type { SelectHTMLAttributes } from 'react'

type Props = SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }

export function Select({ className = '', invalid, children, ...props }: Props) {
    return (
        <select
            {...props}
            aria-invalid={invalid || undefined}
            className={`w-full rounded-lg border bg-surface-2 px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors ${
                invalid ? 'border-accent' : 'border-input focus:border-border-strong'
            } ${className}`}
        >
            {children}
        </select>
    )
}
