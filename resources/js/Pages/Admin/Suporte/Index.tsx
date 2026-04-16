import { Head, router } from '@inertiajs/react'
import { MessageSquare } from 'lucide-react'
import { DataTable, type Column } from '@/components/admin/DataTable'
import { EmptyState } from '@/components/admin/EmptyState'
import { PageHeader } from '@/components/admin/PageHeader'
import { Pagination } from '@/components/admin/Pagination'
import { Badge } from '@/components/ui/badge'
import AdminLayout from '@/layouts/AdminLayout'
import { STATUS_CHAMADO_LABEL, STATUS_CHAMADO_TONE } from '@/lib/status-tones'

interface UsuarioRow {
    public_id: string
    nome_completo: string | null
    email: string
}

interface ChamadoRow {
    public_id: string
    assunto: string
    email_contato: string
    status: 'novo' | 'em_andamento' | 'resolvido'
    usuario: UsuarioRow | null
    created_at: string | null
}

interface PaginatedMeta {
    from: number | null
    to: number | null
    total: number
    current_page: number
    last_page: number
    prev_page_url: string | null
    next_page_url: string | null
}

interface Props {
    chamados: ChamadoRow[]
    meta: PaginatedMeta
    counts: Record<'novo' | 'em_andamento' | 'resolvido', number>
    filters: { status: string }
}

const TABS: { value: string; label: string }[] = [
    { value: '', label: 'Todos' },
    { value: 'novo', label: 'Novos' },
    { value: 'em_andamento', label: 'Em andamento' },
    { value: 'resolvido', label: 'Resolvidos' },
]

function relativeTime(iso: string | null): string {
    if (!iso) return '—'
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'agora'
    if (mins < 60) return `há ${mins} min`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `há ${hours} h`
    const days = Math.floor(hours / 24)
    if (days < 30) return `há ${days} d`
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function AdminSuporteIndex({ chamados, meta, counts, filters }: Props) {
    function applyFilter(status: string) {
        router.get(route('admin.suporte.index'), { status }, { preserveState: true, replace: true })
    }

    const totalNovos = counts.novo

    const columns: Column<ChamadoRow>[] = [
        {
            key: 'assunto',
            header: 'Assunto',
            render: (c) => (
                <span className="font-medium text-foreground truncate block max-w-xs">{c.assunto}</span>
            ),
        },
        {
            key: 'de',
            header: 'De',
            render: (c) => (
                <span className="text-sm text-foreground-muted">
                    {c.usuario?.nome_completo ?? c.email_contato}
                </span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (c) => (
                <Badge
                    tone={STATUS_CHAMADO_TONE[c.status]}
                    dot={c.status === 'novo'}
                    pulse={c.status === 'novo'}
                >
                    {STATUS_CHAMADO_LABEL[c.status]}
                </Badge>
            ),
        },
        {
            key: 'recebido',
            header: 'Recebido',
            align: 'right',
            render: (c) => (
                <span className="text-xs text-foreground-muted tabular-nums font-mono">
                    {relativeTime(c.created_at)}
                </span>
            ),
        },
    ]

    return (
        <AdminLayout breadcrumbs={[{ label: 'Suporte' }]}>
            <Head title="Admin — Suporte" />

            <PageHeader
                title="Chamados de suporte"
                description="Gerencie e responda as solicitações dos usuários."
            />

            {/* Segmented control tabs */}
            <div className="flex items-center gap-1 bg-surface-2 rounded-xl p-1 w-fit mb-6 border border-border">
                {TABS.map((tab) => {
                    const isActive = filters.status === tab.value
                    const count =
                        tab.value === 'novo'
                            ? totalNovos
                            : tab.value === 'em_andamento'
                              ? counts.em_andamento
                              : tab.value === 'resolvido'
                                ? counts.resolvido
                                : null

                    return (
                        <button
                            key={tab.value}
                            type="button"
                            onClick={() => applyFilter(tab.value)}
                            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                isActive
                                    ? 'bg-surface-3 text-foreground shadow-sm'
                                    : 'text-foreground-muted hover:text-foreground'
                            }`}
                        >
                            {tab.label}
                            {count != null && count > 0 && tab.value !== '' && (
                                <span
                                    className={`inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-[10px] font-semibold px-1 ${
                                        tab.value === 'novo'
                                            ? 'bg-accent/20 text-accent'
                                            : 'bg-surface text-foreground-muted'
                                    }`}
                                >
                                    {count}
                                </span>
                            )}
                        </button>
                    )
                })}
            </div>

            <DataTable
                rows={chamados}
                columns={columns}
                rowKey={(c) => c.public_id}
                onRowClick={(c) => router.visit(route('admin.suporte.show', c.public_id))}
                empty={
                    <EmptyState
                        Icon={MessageSquare}
                        title="Nenhum chamado encontrado"
                        description="Nenhum chamado de suporte corresponde aos filtros aplicados."
                    />
                }
            />

            <Pagination meta={meta} />
        </AdminLayout>
    )
}
