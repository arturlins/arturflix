import { Head, router, useForm } from '@inertiajs/react'
import { BookOpen, Pencil, Plus, Trash2, Video, FileText, HelpCircle } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { SortableList } from '@/components/admin/SortableList'
import { EmptyState } from '@/components/admin/EmptyState'
import { PageHeader } from '@/components/admin/PageHeader'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import AdminLayout from '@/layouts/AdminLayout'
import { TIPO_AULA_LABEL } from '@/lib/status-tones'

type TipoAula = 'video' | 'texto' | 'quiz'

interface AulaRow {
    public_id: string
    titulo: string
    tipo_aula: TipoAula
    ordem: number
    duracao_segundos: number | null
    youtube_video_id: string | null
}

interface ModuloEdit {
    public_id: string
    titulo: string
    ordem: number
    aulas: AulaRow[]
}

interface CursoInfo {
    public_id: string
    titulo: string
}

interface Props {
    modulo: ModuloEdit
    curso: CursoInfo
}

const TIPO_ICON: Record<TipoAula, typeof Video> = {
    video: Video,
    texto: FileText,
    quiz: HelpCircle,
}

const TIPO_COLOR: Record<TipoAula, string> = {
    video: 'bg-blue-500/10 text-blue-400',
    texto: 'bg-emerald-500/10 text-emerald-400',
    quiz: 'bg-amber-500/10 text-amber-400',
}

function formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${String(s).padStart(2, '0')}`
}

export default function AdminModulosEdit({ modulo, curso }: Props) {
    const [aulas, setAulas] = useState<AulaRow[]>(modulo.aulas)
    const [addOpen, setAddOpen] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<AulaRow | null>(null)
    const [deleting, setDeleting] = useState(false)

    const { data, setData, put, processing, errors } = useForm({
        titulo: modulo.titulo,
    })

    const addForm = useForm({
        titulo: '',
        tipo_aula: 'video' as TipoAula,
        url_video: '',
        conteudo: '',
    })

    function submitModulo(e: FormEvent): void {
        e.preventDefault()
        put(route('admin.modulos.update', modulo.public_id))
    }

    function submitAula(e: FormEvent): void {
        e.preventDefault()
        addForm.post(route('admin.aulas.store', modulo.public_id), {
            onSuccess: () => {
                setAddOpen(false)
                addForm.reset()
            },
        })
    }

    function handleReorder(newOrder: AulaRow[]): void {
        setAulas(newOrder)
        router.put(
            route('admin.aulas.reorder', modulo.public_id),
            { ordem: newOrder.map((a) => a.public_id) },
            { preserveScroll: true },
        )
    }

    function handleDelete(): void {
        if (!deleteTarget) return
        setDeleting(true)
        router.delete(route('admin.aulas.destroy', deleteTarget.public_id), {
            preserveScroll: true,
            onSuccess: () => {
                setAulas((prev) => prev.filter((a) => a.public_id !== deleteTarget.public_id))
                setDeleteTarget(null)
            },
            onFinish: () => setDeleting(false),
        })
    }

    return (
        <AdminLayout
            breadcrumbs={[
                { label: 'Cursos', href: '/admin/cursos' },
                { label: curso.titulo, href: route('admin.cursos.edit', curso.public_id) },
                { label: modulo.titulo },
            ]}
        >
            <Head title={`Admin — ${modulo.titulo}`} />

            <PageHeader
                eyebrow={curso.titulo}
                title={modulo.titulo}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-12 gap-y-10">
                {/* Left column — edit form */}
                <aside className="lg:col-span-4 lg:sticky lg:top-10 lg:self-start">
                    <form onSubmit={submitModulo} className="space-y-5">
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

                        <Button type="submit" disabled={processing} className="w-full">
                            {processing ? 'Salvando…' : 'Salvar alterações'}
                        </Button>
                    </form>
                </aside>

                {/* Right column — aulas */}
                <section className="lg:col-span-8 space-y-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-semibold text-foreground">Aulas</h2>
                            <p className="text-xs text-foreground-muted mt-0.5">
                                {aulas.length} aula{aulas.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                        <Button size="sm" onClick={() => setAddOpen(true)}>
                            <Plus size={14} />
                            Nova aula
                        </Button>
                    </div>

                    {aulas.length === 0 ? (
                        <EmptyState
                            Icon={BookOpen}
                            title="Nenhuma aula"
                            description="Adicione aulas para preencher este módulo."
                            primary={
                                <Button size="sm" onClick={() => setAddOpen(true)}>
                                    <Plus size={14} />
                                    Nova aula
                                </Button>
                            }
                        />
                    ) : (
                        <SortableList
                            items={aulas}
                            onReorder={handleReorder}
                            renderItem={(aula) => {
                                const Icon = TIPO_ICON[aula.tipo_aula]
                                return (
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div
                                            className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[11px] font-medium ${TIPO_COLOR[aula.tipo_aula]}`}
                                        >
                                            <Icon size={13} aria-hidden="true" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground truncate">{aula.titulo}</p>
                                            <p className="text-xs text-foreground-muted mt-0.5">
                                                {TIPO_AULA_LABEL[aula.tipo_aula]}
                                                {aula.duracao_segundos !== null && (
                                                    <> · {formatDuration(aula.duracao_segundos)}</>
                                                )}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                onClick={() =>
                                                    router.visit(route('admin.aulas.edit', aula.public_id))
                                                }
                                                aria-label="Editar aula"
                                            >
                                                <Pencil size={13} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                onClick={() => setDeleteTarget(aula)}
                                                aria-label="Excluir aula"
                                                className="text-foreground-faint hover:text-accent"
                                            >
                                                <Trash2 size={13} />
                                            </Button>
                                        </div>
                                    </div>
                                )
                            }}
                        />
                    )}
                </section>
            </div>

            {/* Add aula dialog */}
            <Dialog
                open={addOpen}
                onOpenChange={setAddOpen}
                title="Nova aula"
                description="A aula será adicionada ao final do módulo."
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
                        <Button type="submit" form="form-add-aula" disabled={addForm.processing}>
                            {addForm.processing ? 'Criando…' : 'Criar aula'}
                        </Button>
                    </>
                }
            >
                <form id="form-add-aula" onSubmit={submitAula} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="aula-titulo">
                            Título <span className="text-accent">*</span>
                        </Label>
                        <Input
                            id="aula-titulo"
                            value={addForm.data.titulo}
                            onChange={(e) => addForm.setData('titulo', e.target.value)}
                            aria-invalid={!!addForm.errors.titulo}
                            autoFocus
                        />
                        {addForm.errors.titulo && (
                            <p className="text-xs text-accent">{addForm.errors.titulo}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="aula-tipo">Tipo</Label>
                        <Select
                            id="aula-tipo"
                            value={addForm.data.tipo_aula}
                            onChange={(e) => addForm.setData('tipo_aula', e.target.value as TipoAula)}
                        >
                            <option value="video">Vídeo</option>
                            <option value="texto">Texto</option>
                            <option value="quiz">Quiz</option>
                        </Select>
                    </div>

                    {addForm.data.tipo_aula === 'video' && (
                        <div className="space-y-1.5">
                            <Label htmlFor="aula-url-video">URL do vídeo</Label>
                            <Input
                                id="aula-url-video"
                                type="url"
                                value={addForm.data.url_video}
                                onChange={(e) => addForm.setData('url_video', e.target.value)}
                                placeholder="https://youtube.com/watch?v=..."
                                aria-invalid={!!addForm.errors.url_video}
                            />
                            {addForm.errors.url_video && (
                                <p className="text-xs text-accent">{addForm.errors.url_video}</p>
                            )}
                        </div>
                    )}

                    {addForm.data.tipo_aula === 'texto' && (
                        <div className="space-y-1.5">
                            <Label htmlFor="aula-conteudo">Conteúdo</Label>
                            <Textarea
                                id="aula-conteudo"
                                value={addForm.data.conteudo}
                                onChange={(e) => addForm.setData('conteudo', e.target.value)}
                                rows={4}
                                invalid={!!addForm.errors.conteudo}
                            />
                            {addForm.errors.conteudo && (
                                <p className="text-xs text-accent">{addForm.errors.conteudo}</p>
                            )}
                        </div>
                    )}
                </form>
            </Dialog>

            {/* Delete aula confirm */}
            <ConfirmDialog
                open={deleteTarget !== null}
                onOpenChange={(v) => {
                    if (!v) setDeleteTarget(null)
                }}
                title="Excluir aula"
                description="Esta ação é permanente e não pode ser desfeita."
                item={deleteTarget?.titulo}
                confirmLabel="Excluir aula"
                onConfirm={handleDelete}
                loading={deleting}
            />
        </AdminLayout>
    )
}
