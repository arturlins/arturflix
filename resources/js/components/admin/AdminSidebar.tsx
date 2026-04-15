import { Link } from '@inertiajs/react'
import { GraduationCap, LayoutDashboard, type LucideIcon } from 'lucide-react'

type Item = { href: string; label: string; Icon: LucideIcon }

const ITEMS: Item[] = [
    { href: '/admin', label: 'Dashboard', Icon: LayoutDashboard },
    { href: '/admin/cursos', label: 'Cursos', Icon: GraduationCap },
]

export function AdminSidebar({ current }: { current: string }) {
    return (
        <aside className="w-60 shrink-0 border-r border-[#1e2430] bg-[#0a0c12] min-h-screen sticky top-0">
            <div className="px-6 py-5 border-b border-[#1e2430]">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#8a8a8a]">Admin</p>
                <p className="text-[#f1f1f1] font-semibold">ArturFlix</p>
            </div>
            <nav className="p-3" aria-label="Navegação do admin">
                {ITEMS.map(({ href, label, Icon }) => {
                    const active = current === href || (href !== '/admin' && current.startsWith(href))
                    return (
                        <Link
                            key={href}
                            href={href}
                            aria-current={active ? 'page' : undefined}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                                active
                                    ? 'bg-[#E50914]/10 text-[#E50914]'
                                    : 'text-[#8a8a8a] hover:text-[#f1f1f1] hover:bg-[#12151b]'
                            }`}
                        >
                            <Icon size={16} aria-hidden="true" />
                            <span>{label}</span>
                        </Link>
                    )
                })}
            </nav>
        </aside>
    )
}
