import { Link } from '@inertiajs/react'
import {
    GraduationCap,
    LayoutDashboard,
    LifeBuoy,
    Users,
    type LucideIcon,
} from 'lucide-react'

type Item = { href: string; label: string; Icon: LucideIcon }

const SECTIONS: { title: string; items: Item[] }[] = [
    {
        title: 'Visão geral',
        items: [{ href: '/admin', label: 'Dashboard', Icon: LayoutDashboard }],
    },
    {
        title: 'Conteúdo',
        items: [{ href: '/admin/cursos', label: 'Cursos', Icon: GraduationCap }],
    },
    {
        title: 'Comunidade',
        items: [
            { href: '/admin/usuarios', label: 'Usuários', Icon: Users },
            { href: '/admin/suporte', label: 'Suporte', Icon: LifeBuoy },
        ],
    },
]

export function AdminSidebar({ current }: { current: string }) {
    return (
        <aside className="w-60 shrink-0 border-r border-border bg-surface-2 min-h-screen sticky top-0 flex flex-col">
            <div className="px-6 py-5 border-b border-border">
                <p className="text-[10px] uppercase tracking-[0.18em] text-foreground-subtle">Admin</p>
                <p className="text-foreground font-semibold">ArturFlix</p>
            </div>
            <nav className="flex-1 p-3 space-y-5" aria-label="Navegação do admin">
                {SECTIONS.map((section) => (
                    <div key={section.title}>
                        <p className="px-3 mb-1.5 text-[10px] uppercase tracking-[0.16em] text-foreground-subtle">{section.title}</p>
                        <div className="space-y-0.5">
                            {section.items.map(({ href, label, Icon }) => {
                                const active = current === href || (href !== '/admin' && current.startsWith(href))
                                return (
                                    <Link
                                        key={href}
                                        href={href}
                                        aria-current={active ? 'page' : undefined}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                                            active
                                                ? 'bg-accent/10 text-accent'
                                                : 'text-foreground-muted hover:text-foreground hover:bg-surface-3'
                                        }`}
                                    >
                                        <Icon size={16} aria-hidden="true" />
                                        <span>{label}</span>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </nav>
        </aside>
    )
}
