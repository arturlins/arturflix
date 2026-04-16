import { Link } from '@inertiajs/react'
import { Breadcrumbs, type Crumb } from './Breadcrumbs'
import { UserMenu } from './UserMenu'

type AuthUser = { name: string; email: string; papel: 'aluno' | 'admin' | 'superuser' }

export function AdminHeader({ breadcrumbs, user }: { breadcrumbs: Crumb[]; user: AuthUser }) {
    return (
        <header className="sticky top-0 z-30 border-b border-border bg-surface/85 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-8 px-8 h-16">
                <div className="flex items-center gap-5 min-w-0">
                    <Link href="/" className="group flex items-center gap-1.5">
                        <span className="text-foreground-subtle group-hover:text-foreground transition-colors">←</span>
                        <span className="text-[10px] uppercase tracking-[0.22em] text-foreground-subtle group-hover:text-foreground transition-colors">
                            Plataforma
                        </span>
                    </Link>
                    <span className="h-3.5 w-px bg-border-strong shrink-0" aria-hidden="true" />
                    <Breadcrumbs items={breadcrumbs} />
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 h-6 rounded-md border border-border bg-surface-2 text-[10px] font-mono text-foreground-subtle">
                        <span>⌘</span><span>K</span>
                    </kbd>
                    <UserMenu name={user.name} email={user.email} papel={user.papel} />
                </div>
            </div>
        </header>
    )
}
