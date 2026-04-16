import { router } from '@inertiajs/react'
import { ChevronDown, ExternalLink, LogOut, User as UserIcon } from 'lucide-react'
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'

type Props = {
    name: string
    email: string
    papel: 'aluno' | 'admin' | 'superuser'
}

const PAPEL_LABEL = { aluno: 'Aluno', admin: 'Admin', superuser: 'Superuser' } as const
const PAPEL_TONE = {
    aluno: 'bg-surface-3 text-foreground-muted',
    admin: 'bg-accent/15 text-accent',
    superuser: 'bg-warning/15 text-warning',
} as const

export function UserMenu({ name, email, papel }: Props) {
    const initials = name.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase()
    const firstName = name.split(' ')[0]

    return (
        <DropdownMenu
            trigger={
                <span className="flex items-center gap-2 rounded-full p-1 pr-3 hover:bg-surface-2 transition-colors">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-accent/15 text-[11px] font-medium text-accent">
                        {initials}
                    </span>
                    <span className="hidden sm:block text-sm text-foreground">{firstName}</span>
                    <ChevronDown size={12} className="text-foreground-subtle" aria-hidden="true" />
                </span>
            }
        >
            <div className="px-3 py-3 border-b border-border">
                <p className="text-sm font-medium text-foreground truncate">{name}</p>
                <div className="flex items-center gap-2 mt-1 min-w-0">
                    <p className="text-xs text-foreground-muted truncate min-w-0 flex-1">{email}</p>
                    <span className={`shrink-0 inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.14em] ${PAPEL_TONE[papel]}`}>
                        {PAPEL_LABEL[papel]}
                    </span>
                </div>
            </div>
            <div className="p-1">
                <DropdownMenuItem onClick={() => router.visit('/')}>
                    <ExternalLink size={14} aria-hidden="true" /> Voltar à plataforma
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.visit('/dashboard')}>
                    <UserIcon size={14} aria-hidden="true" /> Minha área
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem destructive onClick={() => router.post('/logout')}>
                    <LogOut size={14} aria-hidden="true" /> Sair
                </DropdownMenuItem>
            </div>
        </DropdownMenu>
    )
}
