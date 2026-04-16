import { Head, Link, router } from '@inertiajs/react'
import { MoreHorizontal, Pencil, Plus, Trash2, Users } from 'lucide-react'
import { useCallback, useState } from 'react'
import { DataTable, type Column } from '@/components/admin/DataTable'
import { EmptyState } from '@/components/admin/EmptyState'
import { PageHeader } from '@/components/admin/PageHeader'
import { Pagination } from '@/components/admin/Pagination'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import AdminLayout from '@/layouts/AdminLayout'
import { PAPEL_LABEL, PAPEL_TONE } from '@/lib/status-tones'

interface UsuarioRow {
    public_id: string
    nome_completo: string | null
    email: string
    papel: 'aluno' | 'admin' | 'superuser'
    ultimo_login: string | null
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
    usuarios: UsuarioRow[]
    meta: PaginatedMeta
    filters: {
        q: string
        papel: string
    }
}

export default function AdminUsuariosIndex({ usuarios, meta, filters }: Props) {
    const [deleteTarget, setDeleteTarget] = useState<UsuarioRow | null>(null)
    const [deleting, setDeleting] = useState(false)
    const [search, setSearch] = useState(filters.q)

    function applyFilters(overrides: Partial<typeof filters>) {
        router.get(
            route('admin.usuarios.index'),
            { ...filters, ...overrides },
            { preserveState: true, replace: true },
        )
    }

    const handleSearchKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
                applyFilters({ q: search, papel: filters.papel })
            }
        },
        [search, filters.papel],
    )

    function handleDelete() {
        if (!deleteTarget) return
        setDeleting(true)
        router.delete(route('admin.usuarios.destroy', deleteTarget.public_id), {
            onFinish: () => {
                setDeleting(false)
                setDeleteTarget(null)
            },
        })
    }

    function formatDate(iso: string | null): string {
        if (!iso) return '—'
        return new Date(iso).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        })
    }

    const columns: Column<UsuarioRow>[] = [
        {
            key: 'usuario',
            header: 'Usuário',
            render: (u) => (
                <Link
                    href={route('admin.usuarios.edit', u.public_id)}
                    className="flex flex-col min-w-0 group/link"
                    onClick={(e) => e.stopPropagation()}
                >
                    <span className="font-medium text-foreground group-hover/link:text-accent transition-colors truncate">
                        {u.nome_completo ?? '—'}
                    </span>
                    <span className="text-xs text-foreground-muted truncate">{u.email}</span>
                </Link>
            ),
        },
        {
            key: 'papel',
            header: 'Papel',
            render: (u) => (
                <Badge tone={PAPEL_TONE[u.papel]}>{PAPEL_LABEL[u.papel]}</Badge>
            ),
        },
        {
            key: 'ultimo_login',
            header: 'Último acesso',
            render: (u) => (
                <span className="text-sm text-foreground-muted tabular-nums">
                    {formatDate(u.ultimo_login)}
                </span>
            ),
        },
        {
            key: 'created_at',
            header: 'Cadastro',
            render: (u) => (
                <span className="text-sm text-foreground-muted tabular-nums">
                    {formatDate(u.created_at)}
                </span>
            ),
        },
        {
            key: 'actions',
            header: '',
            align: 'right',
            width: '48px',
            render: (u) => (
                <DropdownMenu
                    trigger={
                        <span className="flex h-7 w-7 items-center justify-center rounded-md text-foreground-faint hover:bg-surface-3 hover:text-foreground transition-colors">
                            <MoreHorizontal size={15} />
                        </span>
                    }
                >
                    <DropdownMenuItem
                        onClick={() => router.visit(route('admin.usuarios.edit', u.public_id))}
                    >
                        <Pencil size={14} />
                        Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem destructive onClick={() => setDeleteTarget(u)}>
                        <Trash2 size={14} />
                        Excluir
                    </DropdownMenuItem>
                </DropdownMenu>
            ),
        },
    ]

    return (
        <AdminLayout breadcrumbs={[{ label: 'Usuários' }]}>
            <Head title="Admin — Usuários" />

            <PageHeader
                title="Usuários"
                description="Gerencie os usuários da plataforma."
                actions={
                    <Button size="sm" onClick={() => router.visit(route('admin.usuarios.create'))}>
                        <Plus size={14} />
                        Novo usuário
                    </Button>
                }
            />

            {/* Filters */}
            <div className="flex items-center gap-3 mb-6">
                <Input
                    type="search"
                    placeholder="Buscar por nome ou e-mail…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    className="max-w-xs"
                />
                <Select
                    value={filters.papel}
                    onChange={(e) => applyFilters({ papel: e.target.value, q: search })}
                    className="w-44"
                >
                    <option value="">Todos os papéis</option>
                    <option value="aluno">Aluno</option>
                    <option value="admin">Admin</option>
                    <option value="superuser">Superuser</option>
                </Select>
            </div>

            <DataTable
                rows={usuarios}
                columns={columns}
                rowKey={(u) => u.public_id}
                empty={
                    <EmptyState
                        Icon={Users}
                        title="Nenhum usuário encontrado"
                        description="Nenhum usuário corresponde aos filtros aplicados."
                        primary={
                            <Button size="sm" onClick={() => router.visit(route('admin.usuarios.create'))}>
                                <Plus size={14} />
                                Novo usuário
                            </Button>
                        }
                    />
                }
            />

            <Pagination meta={meta} />

            <ConfirmDialog
                open={deleteTarget !== null}
                onOpenChange={(v) => {
                    if (!v) setDeleteTarget(null)
                }}
                title="Excluir usuário"
                description="Esta ação é permanente. O usuário será removido da plataforma."
                item={deleteTarget?.nome_completo ?? deleteTarget?.email}
                confirmLabel="Excluir usuário"
                onConfirm={handleDelete}
                loading={deleting}
            />
        </AdminLayout>
    )
}
