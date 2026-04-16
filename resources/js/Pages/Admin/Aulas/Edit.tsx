import { Head, useForm } from '@inertiajs/react'
import { HelpCircle } from 'lucide-react'
import type { FormEvent } from 'react'
import { PageHeader } from '@/components/admin/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import AdminLayout from '@/layouts/AdminLayout'

type TipoAula = 'video' | 'texto' | 'quiz'

interface AulaEdit {
    public_id: string
    titulo: string
    tipo_aula: TipoAula
    url_video: string | null
    youtube_video_id: string | null
    conteudo: string | null
    duracao_segundos: number | null
    ordem: number
}

interface ModuloInfo {
    public_id: string
    titulo: string
}

interface CursoInfo {
    public_id: string
    titulo: string
}

interface Props {
    aula: AulaEdit
    modulo: ModuloInfo
    curso: CursoInfo
}

export default function AdminAulasEdit({ aula, modulo, curso }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        titulo: aula.titulo,
        tipo_aula: aula.tipo_aula,
        url_video: aula.url_video ?? '',
        youtube_video_id: aula.youtube_video_id ?? '',
        conteudo: aula.conteudo ?? '',
        duracao_segundos: aula.duracao_segundos !== null ? String(aula.duracao_segundos) : '',
    })

    function submit(e: FormEvent): void {
        e.preventDefault()
        put(route('admin.aulas.update', aula.public_id))
    }

    return (
        <AdminLayout
            breadcrumbs={[
                { label: 'Cursos', href: '/admin/cursos' },
                { label: curso.titulo, href: route('admin.cursos.edit', curso.public_id) },
                { label: modulo.titulo, href: route('admin.modulos.edit', modulo.public_id) },
                { label: aula.titulo },
            ]}
        >
            <Head title={`Admin — ${aula.titulo}`} />

            <PageHeader
                eyebrow={`${curso.titulo} · ${modulo.titulo}`}
                title={aula.titulo}
            />

            <div className="max-w-xl">
                <form onSubmit={submit} className="space-y-6">
                    {/* Título */}
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

                    {/* Tipo */}
                    <div className="space-y-1.5">
                        <Label htmlFor="tipo_aula">Tipo de aula</Label>
                        <Select
                            id="tipo_aula"
                            value={data.tipo_aula}
                            onChange={(e) => setData('tipo_aula', e.target.value as TipoAula)}
                            invalid={!!errors.tipo_aula}
                        >
                            <option value="video">Vídeo</option>
                            <option value="texto">Texto</option>
                            <option value="quiz">Quiz</option>
                        </Select>
                        {errors.tipo_aula && <p className="text-xs text-accent mt-1">{errors.tipo_aula}</p>}
                    </div>

                    {/* Conditional — video */}
                    {data.tipo_aula === 'video' && (
                        <>
                            <div className="space-y-1.5">
                                <Label htmlFor="url_video">URL do vídeo</Label>
                                <Input
                                    id="url_video"
                                    type="url"
                                    value={data.url_video}
                                    onChange={(e) => setData('url_video', e.target.value)}
                                    placeholder="https://youtube.com/watch?v=..."
                                    aria-invalid={!!errors.url_video}
                                />
                                {errors.url_video && <p className="text-xs text-accent mt-1">{errors.url_video}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="youtube_video_id">YouTube Video ID</Label>
                                <Input
                                    id="youtube_video_id"
                                    value={data.youtube_video_id}
                                    onChange={(e) => setData('youtube_video_id', e.target.value)}
                                    placeholder="dQw4w9WgXcQ"
                                    aria-invalid={!!errors.youtube_video_id}
                                />
                                {errors.youtube_video_id && (
                                    <p className="text-xs text-accent mt-1">{errors.youtube_video_id}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="duracao_segundos">Duração (segundos)</Label>
                                <Input
                                    id="duracao_segundos"
                                    type="number"
                                    min={0}
                                    value={data.duracao_segundos}
                                    onChange={(e) => setData('duracao_segundos', e.target.value)}
                                    placeholder="0"
                                    aria-invalid={!!errors.duracao_segundos}
                                />
                                {errors.duracao_segundos && (
                                    <p className="text-xs text-accent mt-1">{errors.duracao_segundos}</p>
                                )}
                            </div>
                        </>
                    )}

                    {/* Conditional — texto */}
                    {data.tipo_aula === 'texto' && (
                        <div className="space-y-1.5">
                            <Label htmlFor="conteudo">Conteúdo</Label>
                            <Textarea
                                id="conteudo"
                                value={data.conteudo}
                                onChange={(e) => setData('conteudo', e.target.value)}
                                rows={10}
                                invalid={!!errors.conteudo}
                                placeholder="Escreva o conteúdo da aula em texto..."
                            />
                            {errors.conteudo && <p className="text-xs text-accent mt-1">{errors.conteudo}</p>}
                        </div>
                    )}

                    {/* Conditional — quiz */}
                    {data.tipo_aula === 'quiz' && (
                        <div className="flex items-start gap-3 rounded-xl border border-border bg-surface-2 p-4">
                            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-amber-500/10 text-amber-400">
                                <HelpCircle size={15} aria-hidden="true" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-foreground">Aula de quiz</p>
                                <p className="text-xs text-foreground-muted mt-0.5 leading-relaxed">
                                    A edição de questões de quiz ainda não está disponível nesta interface.
                                    As questões podem ser gerenciadas diretamente pelo banco de dados.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="pt-2">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Salvando…' : 'Salvar alterações'}
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    )
}
