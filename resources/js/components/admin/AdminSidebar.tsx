import { Link } from '@inertiajs/react'

type Item = { href: string; label: string; icon: string }

const ITEMS: Item[] = [
    { href: '/admin', label: 'Dashboard', icon: '▪' },
    { href: '/admin/cursos', label: 'Cursos', icon: '▪' },
    { href: '/admin/usuarios', label: 'Usuários', icon: '▪' },
]

export function AdminSidebar({ current }: { current: string }) {
    return (
        <aside className="w-60 shrink-0 border-r border-[#1e2430] bg-[#0a0c12] min-h-screen sticky top-0">
            <div className="px-6 py-5 border-b border-[#1e2430]">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#8a8a8a]">Admin</p>
                <p className="text-[#f1f1f1] font-semibold">ArturFlix</p>
            </div>
            <nav className="p-3">
                {ITEMS.map((item) => {
                    const active = current === item.href || (item.href !== '/admin' && current.startsWith(item.href))
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                                active
                                    ? 'bg-[#E50914]/10 text-[#E50914]'
                                    : 'text-[#8a8a8a] hover:text-[#f1f1f1] hover:bg-[#12151b]'
                            }`}
                        >
                            <span aria-hidden="true">{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    )
                })}
            </nav>
        </aside>
    )
}