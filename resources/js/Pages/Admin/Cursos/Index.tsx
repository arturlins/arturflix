import { Head, Link, usePage } from '@inertiajs/react'
import AdminLayout from '@/layouts/AdminLayout'
import type { PageProps } from '@/types'

interface AdminCursoRow {
    public_id: string
    titulo: string
    url_capa: string | null
    youtube_playlist_id: string | null
    channel: string | null
    modulos_count: number
}

interface Props extends PageProps {
    cursos: AdminCursoRow[]
}

export default function AdminCursosIndex() {
    const { cursos, flash } = usePage<Props>().props

    return (
        <AdminLayout>
            <Head title="Admin — Cursos" />

            <div className="max-w-6xl mx-auto px-8 py-10">
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-[#f1f1f1]">Cursos</h1>
                        <p className="text-[#8a8a8a] text-sm mt-1">Gerencie cursos da plataforma.</p>
                    </div>
                    <Link
                        href="/admin/cursos/importar"
                        className="px-4 py-2 rounded-lg bg-[#E50914] hover:bg-[#c20710] text-white text-sm font-medium transition-colors"
                    >
                        Importar do YouTube
                    </Link>
                </header>

                {flash.success && (
                    <div className="mb-6 px-4 py-3 rounded-lg bg-green-950/40 border border-green-900 text-green-300 text-sm">
                        {flash.success}
                    </div>
                )}

                {cursos.length === 0 ? (
                    <div className="bg-[#12151b] border border-[#1e2430] rounded-xl p-10 text-center">
                        <p className="text-[#8a8a8a] text-sm">Nenhum curso cadastrado.</p>
                    </div>
                ) : (
                    <div className="bg-[#12151b] border border-[#1e2430] rounded-xl overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-[#0a0c12] text-[#8a8a8a] text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="text-left px-4 py-3">Curso</th>
                                    <th className="text-left px-4 py-3">Canal</th>
                                    <th className="text-left px-4 py-3">Playlist</th>
                                    <th className="text-right px-4 py-3">Módulos</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cursos.map((c) => (
                                    <tr key={c.public_id} className="border-t border-[#1e2430]">
                                        <td className="px-4 py-3 text-[#f1f1f1]">{c.titulo}</td>
                                        <td className="px-4 py-3 text-[#8a8a8a]">{c.channel ?? '—'}</td>
                                        <td className="px-4 py-3 text-[#8a8a8a] font-mono text-xs">
                                            {c.youtube_playlist_id ?? '—'}
                                        </td>
                                        <td className="px-4 py-3 text-right text-[#8a8a8a]">{c.modulos_count}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AdminLayout>
    )
}