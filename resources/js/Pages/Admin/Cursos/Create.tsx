import { Head, useForm } from '@inertiajs/react'
import AdminLayout from '@/layouts/AdminLayout'
import type { FormEvent } from 'react'

export default function AdminCursosCreate() {
    const { data, setData, post, processing, errors } = useForm({
        titulo: '',
        descricao: '',
        url_capa: '',
    })

    function submit(e: FormEvent) {
        e.preventDefault()
        post(route('admin.cursos.store'))
    }

    return (
        <AdminLayout breadcrumbs={[{ label: 'Cursos', href: '/admin/cursos' }, { label: 'Novo curso' }]}>
            <Head title="Admin — Novo curso" />

            <div className="max-w-2xl mx-auto px-8 py-10">
                <header className="mb-8">
                    <h1 className="text-2xl font-semibold text-[#f1f1f1]">Novo curso</h1>
                    <p className="text-[#8a8a8a] text-sm mt-1">
                        Crie um curso manualmente. Você poderá adicionar módulos e aulas depois.
                    </p>
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
                            placeholder="Ex: Laravel do Zero ao Deploy"
                            className={`w-full px-3 py-2 rounded-lg bg-[#0d1016] border text-sm text-[#f1f1f1] placeholder-[#5a5a5a] focus:outline-none transition-colors ${
                                errors.titulo ? 'border-red-500' : 'border-[#1e2430] focus:border-[#E50914]'
                            }`}
                            aria-invalid={!!errors.titulo}
                            autoFocus
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
                            placeholder="Descreva o conteúdo do curso..."
                            className={`w-full px-3 py-2 rounded-lg bg-[#0d1016] border text-sm text-[#f1f1f1] placeholder-[#5a5a5a] focus:outline-none transition-colors resize-none ${
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

                    <div className="flex justify-end gap-3 pt-2">
                        <a
                            href={route('admin.cursos.index')}
                            className="px-5 py-2 rounded-lg border border-[#1e2430] text-[#8a8a8a] text-sm font-medium hover:text-[#f1f1f1] hover:border-[#2e3440] transition-colors"
                        >
                            Cancelar
                        </a>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-5 py-2 rounded-lg bg-[#E50914] hover:bg-[#c20710] text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing ? 'Criando...' : 'Criar curso'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    )
}
