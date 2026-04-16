import { Head, useForm, usePage } from '@inertiajs/react'
import AdminLayout from '@/layouts/AdminLayout'
import type { PageProps } from '@/types'
import type { FormEvent } from 'react'

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

interface Props extends PageProps {
    curso: CursoEdit
}

export default function AdminCursosEdit() {
    const { curso, flash } = usePage<Props>().props

    const { data, setData, put, processing, errors } = useForm({
        titulo: curso.titulo,
        descricao: curso.descricao ?? '',
        url_capa: curso.url_capa ?? '',
    })

    function submit(e: FormEvent) {
        e.preventDefault()
        put(route('admin.cursos.update', curso.public_id))
    }

    return (
        <AdminLayout
            breadcrumbs={[
                { label: 'Cursos', href: '/admin/cursos' },
                { label: curso.titulo },
            ]}
        >
            <Head title={`Admin — ${curso.titulo}`} />

            <div className="max-w-4xl mx-auto px-8 py-10 space-y-10">
                {flash.success && (
                    <div className="px-4 py-3 rounded-lg bg-green-950/40 border border-green-900 text-green-300 text-sm">
                        {flash.success}
                    </div>
                )}

                {/* Dados do curso */}
                <section>
                    <header className="mb-6">
                        <h1 className="text-2xl font-semibold text-[#f1f1f1]">Editar curso</h1>
                        {curso.youtube_playlist_id && (
                            <p className="text-[#8a8a8a] text-sm mt-1">
                                Importado do YouTube · {curso.youtube_channel_title}
                            </p>
                        )}
                    </header>

                    <form onSubmit={submit} className="bg-[#12151b] border border-[#1e2430] rounded-xl p-6 space-y-5">
                        <div>
                            <label htmlFor="titulo" className="block text-xs uppercase tracking-wider text-[#8a8a8a] mb-2">
                                Título <span className="text-red-400">*</span>
                            </label>
                            <input
                                id="titulo"
                                type="text"
                                value={data.titulo}
                                onChange={(e) => setData('titulo', e.target.value)}
                                className={`w-full px-3 py-2 rounded-lg bg-[#0d1016] border text-sm text-[#f1f1f1] focus:outline-none transition-colors ${
                                    errors.titulo ? 'border-red-500' : 'border-[#1e2430] focus:border-[#E50914]'
                                }`}
                                aria-invalid={!!errors.titulo}
                            />
                            {errors.titulo && (
                                <p className="text-red-400 text-xs mt-2">{errors.titulo}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="descricao" className="block text-xs uppercase tracking-wider text-[#8a8a8a] mb-2">
                                Descrição
                            </label>
                            <textarea
                                id="descricao"
                                value={data.descricao}
                                onChange={(e) => setData('descricao', e.target.value)}
                                rows={4}
                                className={`w-full px-3 py-2 rounded-lg bg-[#0d1016] border text-sm text-[#f1f1f1] focus:outline-none transition-colors resize-none ${
                                    errors.descricao ? 'border-red-500' : 'border-[#1e2430] focus:border-[#E50914]'
                                }`}
                            />
                            {errors.descricao && (
                                <p className="text-red-400 text-xs mt-2">{errors.descricao}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="url_capa" className="block text-xs uppercase tracking-wider text-[#8a8a8a] mb-2">
                                URL da capa
                            </label>
                            <input
                                id="url_capa"
                                type="url"
                                value={data.url_capa}
                                onChange={(e) => setData('url_capa', e.target.value)}
                                placeholder="https://exemplo.com/capa.jpg"
                                className={`w-full px-3 py-2 rounded-lg bg-[#0d1016] border text-sm text-[#f1f1f1] placeholder-[#5a5a5a] focus:outline-none transition-colors ${
                                    errors.url_capa ? 'border-red-500' : 'border-[#1e2430] focus:border-[#E50914]'
                                }`}
                                aria-invalid={!!errors.url_capa}
                            />
                            {errors.url_capa && (
                                <p className="text-red-400 text-xs mt-2">{errors.url_capa}</p>
                            )}
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-5 py-2 rounded-lg bg-[#E50914] hover:bg-[#c20710] text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? 'Salvando...' : 'Salvar alterações'}
                            </button>
                        </div>
                    </form>
                </section>

                {/* Módulos */}
                <section>
                    <header className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-[#f1f1f1]">Módulos</h2>
                        <span className="text-[#8a8a8a] text-sm">{curso.modulos.length} módulo{curso.modulos.length !== 1 ? 's' : ''}</span>
                    </header>

                    {curso.modulos.length === 0 ? (
                        <div className="bg-[#12151b] border border-[#1e2430] rounded-xl p-8 text-center">
                            <p className="text-[#8a8a8a] text-sm">Nenhum módulo criado ainda.</p>
                        </div>
                    ) : (
                        <div className="bg-[#12151b] border border-[#1e2430] rounded-xl overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-[#0a0c12] text-[#8a8a8a] text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="text-left px-4 py-3 w-12">#</th>
                                        <th className="text-left px-4 py-3">Módulo</th>
                                        <th className="text-right px-4 py-3">Aulas</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {curso.modulos.map((m) => (
                                        <tr key={m.public_id} className="border-t border-[#1e2430]">
                                            <td className="px-4 py-3 text-[#5a5a5a] font-mono text-xs">{m.ordem}</td>
                                            <td className="px-4 py-3 text-[#f1f1f1]">{m.titulo}</td>
                                            <td className="px-4 py-3 text-right text-[#8a8a8a]">{m.aulas_count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </AdminLayout>
    )
}
