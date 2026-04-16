import { Head, router, useForm } from '@inertiajs/react'
import { ChevronRight, FolderPlus, Pencil, Plus, Trash2, Youtube } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { SortableList } from '@/components/admin/SortableList'
import { EmptyState } from '@/components/admin/EmptyState'
import { PageHeader } from '@/components/admin/PageHeader'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import AdminLayout from '@/layouts/AdminLayout'

interface ModuloRow {
    public_id: string
    titulo: string
    ordem: number
    aulas_count: number
}

interface CursoEdit {
    public_id: string
    titulo: string
    descricao: string | null
    url_capa: string | null
    youtube_playlist_id: string | null
    youtube_channel_title: string | null
    modulos: ModuloRow[]
}

interface Props {
    curso: CursoEdit
}

export default function AdminCursosEdit({ curso }: Props) {
    const [modulos, setModulos] = useState<ModuloRow[]>(curso.modulos)
    const [addOpen, setAddOpen] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<ModuloRow | null>(null)
    const [deleting, setDeleting] = useState(false)

    const { data, setData, put, processing, errors } = useForm({
        titulo: curso.titulo,
        descricao: curso.descricao ?? '',
        url_capa: curso.url_capa ?? '',
    })

    const addForm = useForm({ titulo: '' })

    function submitCurso(e: FormEvent): void {
        e.preventDefault()
        put(route('admin.cursos.update', curso.public_id))
    }

    function submitModulo(e: FormEvent): void {
        e.preventDefault()
        addForm.post(route('admin.modulos.store', curso.public_id), {
            onSuccess: () => {
                setAddOpen(false)
                addForm.reset()
            },
        })
    }

    function handleReorder(newOrder: ModuloRow[]): void {
        setModulos(newOrder)
        router.put(
            route('admin.modulos.reordenar', curso.public_id),
            { ordem: newOrder.map((m) => m.public_id) },
            { preserveScroll: true },
        )
    }

    function handleDelete(): void {
        if (!deleteTarget) return
        setDeleting(true)
        router.delete(route('admin.modulos.destroy', deleteTarget.public_id), {
            preserveScroll: true,
            onSuccess: () => {
                setModulos((prev) => prev.filter((m) => m.public_id !== deleteTarget.public_id))
                setDeleteTarget(null)
            },
            onFinish: () => setDeleting(false),
        })
    }

    return (
        <AdminLayout
            breadcrumbs={[
                { label: 'Cursos', href: '/admin/cursos' },
                { label: curso.titulo },
            ]}
        >
            <Head title={`Admin — ${curso.titulo}`} />

            <PageHeader
                eyebrow="Cursos"
                title={curso.titulo}
                description={curso.youtube_channel_title ? `Canal: ${curso.youtube_channel_title}` : undefined}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-12 gap-y-10">
                {/* Left column — edit form */}
                <aside className="lg:col-span-4 lg:sticky lg:top-10 lg:self-start space-y-6">
                    <form onSubmit={submitCurso} className="space-y-5">
                        <div className="space-y-1.5">
                            <Label htmlFor="titulo">
                                Título <span className="text-accent">*</span>
                            </Label>
                            <Input
                                id="titulo"
                                value={data.titulo}
                                onChange={(e) => setData('titulo', e.target.value)}
                                aria-invalid={!!errors.titulo}
                            />
                            {errors.titulo && <p className="text-xs text-accent mt-1">{errors.titulo}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="descricao">Descrição</Label>
                            <Textarea
                                id="descricao"
                                value={data.descricao}
                                onChange={(e) => setData('descricao', e.target.value)}
                                rows={4}
                                invalid={!!errors.descricao}
                            />
                            {errors.descricao && <p className="text-xs text-accent mt-1">{errors.descricao}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="url_capa">URL da capa</Label>
                            <Input
                                id="url_capa"
                                type="url"
                                value={data.url_capa}
                                onChange={(e) => setData('url_capa', e.target.value)}
                                placeholder="https://exemplo.com/capa.jpg"
                                aria-invalid={!!errors.url_capa}
                            />
                            {errors.url_capa && <p className="text-xs text-accent mt-1">{errors.url_capa}</p>}
                        </div>

                        <Button type="submit" disabled={processing} className="w-full">
                            {processing ? 'Salvando…' : 'Salvar alterações'}
                        </Button>
                    </form>

                    {curso.youtube_playlist_id && (
                        <div className="rounded-xl border border-border bg-surface-2 p-4 flex items-start gap-3">
                            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-red-500/10 text-red-400">
                                <Youtube size={15} aria-hidden="true" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-medium text-foreground">Importado do YouTube</p>
                                <p className="text-xs text-foreground-muted mt-0.5 truncate">
                                    {curso.youtube_channel_title ?? curso.youtube_playlist_id}
                                </p>
                            </div>
                        </div>
                    )}
                </aside>

                {/* Right column — modules */}
                <section className="lg:col-span-8 space-y-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-semibold text-foreground">Módulos</h2>
                            <p className="text-xs text-foreground-muted mt-0.5">
                                {modulos.length} módulo{modulos.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                        <Button size="sm" onClick={() => setAddOpen(true)}>
                            <Plus size={14} />
                            Novo módulo
                        </Button>
                    </div>

                    {modulos.length === 0 ? (
                        <EmptyState
                            Icon={FolderPlus}
                            title="Nenhum módulo"
                            description="Adicione módulos para organizar as aulas deste curso."
                            primary={
                                <Button size="sm" onClick={() => setAddOpen(true)}>
                                    <Plus size={14} />
                                    Novo módulo
                                </Button>
                            }
                        />
                    ) : (
                        <SortableList
                            items={modulos}
                            onReorder={handleReorder}
                            renderItem={(modulo) => (
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground truncate">{modulo.titulo}</p>
                                        <p className="text-xs text-foreground-muted mt-0.5">
                                            {modulo.aulas_count} aula{modulo.aulas_count !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            onClick={() =>
                                                router.visit(route('admin.modulos.edit', modulo.public_id))
                                            }
                                            aria-label="Editar módulo"
                                        >
                                            <Pencil size={13} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            onClick={() => setDeleteTarget(modulo)}
                                            aria-label="Excluir módulo"
                                            className="text-foreground-faint hover:text-accent"
                                        >
                                            <Trash2 size={13} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            onClick={() =>
                                                router.visit(route('admin.modulos.edit', modulo.public_id))
                                            }
                                            aria-label="Abrir módulo"
                                        >
                                            <ChevronRight size={13} />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        />
                    )}
                </section>
            </div>

            {/* Add módulo dialog */}
            <Dialog
                open={addOpen}
                onOpenChange={setAddOpen}
                title="Novo módulo"
                description="O módulo será adicionado ao final da lista."
                size="sm"
                footer={
                    <>
                        <button
                            type="button"
                            onClick={() => setAddOpen(false)}
                            disabled={addForm.processing}
                            className="text-sm text-foreground-muted hover:text-foreground px-2 py-1.5 transition-colors disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <Button
                            type="submit"
                            form="form-add-modulo"
                            disabled={addForm.processing}
                        >
                            {addForm.processing ? 'Criando…' : 'Criar módulo'}
                        </Button>
                    </>
                }
            >
                <form id="form-add-modulo" onSubmit={submitModulo} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="modulo-titulo">
                            Título <span className="text-accent">*</span>
                        </Label>
                        <Input
                            id="modulo-titulo"
                            value={addForm.data.titulo}
                            onChange={(e) => addForm.setData('titulo', e.target.value)}
                            aria-invalid={!!addForm.errors.titulo}
                            autoFocus
                        />
                        {addForm.errors.titulo && (
                            <p className="text-xs text-accent">{addForm.errors.titulo}</p>
                        )}
                    </div>
                </form>
            </Dialog>

            {/* Delete módulo confirm */}
            <ConfirmDialog
                open={deleteTarget !== null}
                onOpenChange={(v) => {
                    if (!v) setDeleteTarget(null)
                }}
                title="Excluir módulo"
                description="Esta ação é permanente. O módulo e todas as suas aulas serão removidos."
                item={deleteTarget?.titulo}
                confirmLabel="Excluir módulo"
                onConfirm={handleDelete}
                loading={deleting}
            />
        </AdminLayout>
    )
}
