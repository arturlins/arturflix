import { Head, useForm } from '@inertiajs/react'
import AdminLayout from '@/layouts/AdminLayout'
import type { FormEvent } from 'react'

export default function AdminCursosImport() {
    const { data, setData, post, processing, errors } = useForm({
        playlist_input: '',
    })

    function submit(e: FormEvent) {
        e.preventDefault()
        post('/admin/cursos/importar')
    }

    return (
        <AdminLayout>
            <Head title="Admin — Importar playlist" />

            <div className="max-w-2xl mx-auto px-8 py-10">
                <header className="mb-8">
                    <h1 className="text-2xl font-semibold text-[#f1f1f1]">Importar playlist do YouTube</h1>
                    <p className="text-[#8a8a8a] text-sm mt-1">
                        Cole a URL ou o ID da playlist. Um curso será criado com todos os vídeos como aulas.
                    </p>
                </header>

                <form onSubmit={submit} className="bg-[#12151b] border border-[#1e2430] rounded-xl p-6 space-y-5">
                    <div>
                        <label htmlFor="playlist_input" className="block text-xs uppercase tracking-wider text-[#8a8a8a] mb-2">
                            URL ou ID da playlist
                        </label>
                        <input
                            id="playlist_input"
                            type="text"
                            value={data.playlist_input}
                            onChange={(e) => setData('playlist_input', e.target.value)}
                            placeholder="https://www.youtube.com/playlist?list=PL..."
                            className={`w-full px-3 py-2 rounded-lg bg-[#0d1016] border text-sm text-[#f1f1f1] placeholder-[#5a5a5a] focus:outline-none transition-colors ${
                                errors.playlist_input ? 'border-red-500' : 'border-[#1e2430] focus:border-[#E50914]'
                            }`}
                            autoFocus
                        />
                        {errors.playlist_input && (
                            <p className="text-red-400 text-xs mt-2">{errors.playlist_input}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-5 py-2 rounded-lg bg-[#E50914] hover:bg-[#c20710] text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing ? 'Importando...' : 'Importar'}
                        </button>
                    </div>
                </form>

                <p className="text-[#5a5a5a] text-xs mt-6">
                    A importação pode levar alguns segundos para playlists maiores. A contagem e a duração total dos vídeos são
                    extraídas automaticamente via YouTube Data API.
                </p>
            </div>
        </AdminLayout>
    )
}