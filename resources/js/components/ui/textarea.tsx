import type { TextareaHTMLAttributes } from 'react'

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }

export function Textarea({ className = '', invalid, ...props }: Props) {
    return (
        <textarea
            {...props}
            aria-invalid={invalid || undefined}
            className={`w-full rounded-lg border bg-surface-2 px-3.5 py-2.5 text-sm text-foreground placeholder:text-foreground-subtle resize-y min-h-[100px] outline-none transition-colors ${
                invalid ? 'border-accent focus:border-accent' : 'border-input focus:border-border-strong'
            } ${className}`}
        />
    )
}
