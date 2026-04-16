import { Link } from '@inertiajs/react'
import { ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'

export type Crumb = { label: string; href?: string }

export function Breadcrumbs({ items }: { items: Crumb[] }) {
    return (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-foreground-muted">
            {items.map((item, i) => {
                const last = i === items.length - 1
                const node: ReactNode = item.href && !last
                    ? <Link href={item.href} className="hover:text-foreground transition-colors">{item.label}</Link>
                    : <span className={last ? 'text-foreground font-medium' : ''}>{item.label}</span>
                return (
                    <span key={i} className="flex items-center gap-1.5">
                        {node}
                        {!last && <ChevronRight size={12} aria-hidden="true" className="text-foreground-faint" />}
                    </span>
                )
            })}
        </nav>
    )
}
