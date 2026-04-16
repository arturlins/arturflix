import { router } from '@inertiajs/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type PaginatedMeta = {
    from: number | null
    to: number | null
    total: number
    current_page: number
    last_page: number
    prev_page_url: string | null
    next_page_url: string | null
}

export function Pagination({ meta }: { meta: PaginatedMeta }) {
    if (meta.last_page <= 1) return null

    return (
        <div className="flex items-center justify-between gap-4 px-1 mt-5 text-xs text-foreground-muted">
            <span className="font-mono tabular-nums">
                {meta.from ?? 0}–{meta.to ?? 0} <span className="text-foreground-faint">de</span> {meta.total}
            </span>
            <div className="flex items-center gap-1">
                <button
                    type="button"
                    disabled={!meta.prev_page_url}
                    onClick={() => meta.prev_page_url && router.visit(meta.prev_page_url, { preserveState: true })}
                    aria-label="Página anterior"
                    className="grid h-7 w-7 place-items-center rounded-md text-foreground-muted hover:text-foreground hover:bg-surface-3 disabled:opacity-30 transition-colors"
                >
                    <ChevronLeft size={14} />
                </button>
                <span className="font-mono tabular-nums px-2">
                    {meta.current_page} <span className="text-foreground-faint">/</span> {meta.last_page}
                </span>
                <button
                    type="button"
                    disabled={!meta.next_page_url}
                    onClick={() => meta.next_page_url && router.visit(meta.next_page_url, { preserveState: true })}
                    aria-label="Próxima página"
                    className="grid h-7 w-7 place-items-center rounded-md text-foreground-muted hover:text-foreground hover:bg-surface-3 disabled:opacity-30 transition-colors"
                >
                    <ChevronRight size={14} />
                </button>
            </div>
        </div>
    )
}
