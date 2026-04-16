import { Dialog as BaseDialog } from '@base-ui/react/dialog'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'

type Props = {
    open: boolean
    onOpenChange: (v: boolean) => void
    title: string
    description?: string
    children: ReactNode
    footer?: ReactNode
    size?: 'sm' | 'md' | 'lg' | 'xl'
}

const SIZE = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' } as const

export function Dialog({ open, onOpenChange, title, description, children, footer, size = 'md' }: Props) {
    return (
        <BaseDialog.Root open={open} onOpenChange={onOpenChange}>
            <BaseDialog.Portal>
                <BaseDialog.Backdrop className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" />
                <BaseDialog.Popup
                    className={`fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[92vw] ${SIZE[size]} rounded-2xl border border-border bg-surface shadow-2xl shadow-black/60 outline-none`}
                >
                    <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-border">
                        <div className="min-w-0">
                            <BaseDialog.Title className="text-base font-semibold text-foreground truncate">
                                {title}
                            </BaseDialog.Title>
                            {description && (
                                <BaseDialog.Description className="text-xs text-foreground-muted mt-1">
                                    {description}
                                </BaseDialog.Description>
                            )}
                        </div>
                        <BaseDialog.Close
                            className="text-foreground-muted hover:text-foreground transition-colors -mt-1"
                            aria-label="Fechar"
                        >
                            <X size={18} />
                        </BaseDialog.Close>
                    </div>
                    <div className="px-6 py-5">{children}</div>
                    {footer && (
                        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3">
                            {footer}
                        </div>
                    )}
                </BaseDialog.Popup>
            </BaseDialog.Portal>
        </BaseDialog.Root>
    )
}
