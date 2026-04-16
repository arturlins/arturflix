import { AlertTriangle } from 'lucide-react'
import { Button } from './button'
import { Dialog } from './dialog'

type Props = {
    open: boolean
    onOpenChange: (v: boolean) => void
    title: string
    description: string
    item?: string
    confirmLabel?: string
    onConfirm: () => void
    loading?: boolean
    destructive?: boolean
}

export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    item,
    confirmLabel = 'Confirmar',
    onConfirm,
    loading,
    destructive = true,
}: Props) {
    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
            title={title}
            size="sm"
            footer={
                <>
                    <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                        className="text-sm text-foreground-muted hover:text-foreground px-2 py-1.5 transition-colors disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <Button variant={destructive ? 'destructive' : 'default'} onClick={onConfirm} disabled={loading}>
                        {loading ? 'Processando…' : confirmLabel}
                    </Button>
                </>
            }
        >
            {destructive && (
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-60 pointer-events-none" />
            )}
            <div className="flex gap-4">
                {destructive && (
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent/12 text-accent">
                        <AlertTriangle size={18} aria-hidden="true" />
                    </div>
                )}
                <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground-muted leading-relaxed">{description}</p>
                    {item && (
                        <div className="mt-3 px-3 py-2 rounded-lg bg-surface-3 border border-border">
                            <p className="font-mono text-xs text-foreground truncate">{item}</p>
                        </div>
                    )}
                </div>
            </div>
        </Dialog>
    )
}
