import { Head, Link, router } from '@inertiajs/react'
import { GraduationCap, MoreHorizontal, Pencil, Plus, Trash2, Youtube } from 'lucide-react'
import { useState } from 'react'
import { DataTable, type Column } from '@/components/admin/DataTable'
import { EmptyState } from '@/components/admin/EmptyState'
import { PageHeader } from '@/components/admin/PageHeader'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import AdminLayout from '@/layouts/AdminLayout'

interface AdminCursoRow {
    public_id: string
    titulo: string
    url_capa: string | null
    youtube_playlist_id: string | null
    channel: string | null
    modulos_count: number
}

interface Props {
    cursos: AdminCursoRow[]
}

export default function AdminCursosIndex({ cursos }: Props) {
    const [deleteTarget, setDeleteTarget] = useState<AdminCursoRow | null>(null)
    const [deleting, setDeleting] = useState(false)

    function confirmDelete(curso: AdminCursoRow) {
        setDeleteTarget(curso)
    }

    function handleDelete() {
        if (!deleteTarget) return
        setDeleting(true)
        router.delete(route('admin.cursos.destroy', deleteTarget.public_id), {
            onFinish: () => {
                setDeleting(false)
                setDeleteTarget(null)
            },
        })
    }

    const columns: Column<AdminCursoRow>[] = [
        {
            key: 'titulo',
            header: 'Curso',
            render: (curso) => (
                <Link
                    href={route('admin.cursos.edit', curso.public_id)}
                    className="flex items-center gap-3 group/title"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="h-10 w-16 shrink-0 overflow-hidden rounded-md bg-surface-3">
                        {curso.url_capa ? (
                            <img
                                src={curso.url_capa}
                                alt=""
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-foreground-faint">
                                <GraduationCap size={16} />
                            </div>
                        )}
                    </div>
                    <span className="font-medium text-foreground group-hover/title:text-accent transition-colors">
                        {curso.titulo}
                    </span>
                </Link>
            ),
        },
        {
            key: 'channel',
            header: 'Canal',
            render: (curso) => (
                <span className="text-foreground-muted">{curso.channel ?? '—'}</span>
            ),
        },
        {
            key: 'origem',
            header: 'Origem',
            render: (curso) =>
                curso.youtube_playlist_id ? (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-400">
                        <Youtube size={11} />
                        YouTube
                    </span>
                ) : (
                    <span className="inline-flex items-center rounded-md bg-surface-3 px-2 py-0.5 text-xs font-medium text-foreground-muted">
                        Manual
                    </span>
                ),
        },
        {
            key: 'modulos',
            header: 'Módulos',
            align: 'right',
            render: (curso) => (
                <span className="tabular-nums text-foreground-muted">{curso.modulos_count}</span>
            ),
        },
        {
            key: 'actions',
            header: '',
            align: 'right',
            width: '48px',
            render: (curso) => (
                <DropdownMenu
                    trigger={
                        <span className="flex h-7 w-7 items-center justify-center rounded-md text-foreground-faint hover:bg-surface-3 hover:text-foreground transition-colors">
                            <MoreHorizontal size={15} />
                        </span>
                    }
                >
                    <DropdownMenuItem
                        onClick={() => router.visit(route('admin.cursos.edit', curso.public_id))}
                    >
                        <Pencil size={14} />
                        Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem destructive onClick={() => confirmDelete(curso)}>
                        <Trash2 size={14} />
                        Excluir
                    </DropdownMenuItem>
                </DropdownMenu>
            ),
        },
    ]

    return (
        <AdminLayout breadcrumbs={[{ label: 'Cursos' }]}>
            <Head title="Admin — Cursos" />

            <PageHeader
                title="Cursos"
                description="Gerencie os cursos da plataforma."
                actions={
                    <>
                        <Button variant="ghost" size="sm" onClick={() => router.visit(route('admin.cursos.import.form'))}>
                            <Youtube size={14} />
                            Importar do YouTube
                        </Button>
                        <Button size="sm" onClick={() => router.visit(route('admin.cursos.create'))}>
                            <Plus size={14} />
                            Novo curso
                        </Button>
                    </>
                }
            />

            <DataTable
                rows={cursos}
                columns={columns}
                rowKey={(c) => c.public_id}
                empty={
                    <EmptyState
                        Icon={GraduationCap}
                        title="Nenhum curso ainda"
                        description="Crie um curso manual ou importe uma playlist do YouTube para começar."
                        primary={
                            <Button size="sm" onClick={() => router.visit(route('admin.cursos.create'))}>
                                <Plus size={14} />
                                Novo curso
                            </Button>
                        }
                        secondary={
                            <Button variant="ghost" size="sm" onClick={() => router.visit(route('admin.cursos.import.form'))}>
                                <Youtube size={14} />
                                Importar do YouTube
                            </Button>
                        }
                    />
                }
            />

            <ConfirmDialog
                open={deleteTarget !== null}
                onOpenChange={(v) => { if (!v) setDeleteTarget(null) }}
                title="Excluir curso"
                description="Esta ação é permanente. O curso e todos os seus módulos e aulas serão removidos."
                item={deleteTarget?.titulo}
                confirmLabel="Excluir curso"
                onConfirm={handleDelete}
                loading={deleting}
            />
        </AdminLayout>
    )
}
