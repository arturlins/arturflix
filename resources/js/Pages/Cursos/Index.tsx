import { Head, Link, usePage } from '@inertiajs/react'
import GuestLayout from '@/layouts/GuestLayout'
import type { CursoListItem, PageProps } from '@/types'

interface Props extends PageProps {
    cursos: CursoListItem[]
}

function formatDuration(totalSeconds: number): string {
    if (totalSeconds < 60) return `${totalSeconds}s`
    const h = Math.floor(totalSeconds / 3600)
    const m = Math.floor((totalSeconds % 3600) / 60)
    if (h === 0) return `${m}min`
    if (m === 0) return `${h}h`
    return `${h}h ${m}min`
}

export default function CursosIndex() {
    const { cursos } = usePage<Props>().props

    return (
        <GuestLayout>
            <Head title="Cursos" />

            <div className="max-w-6xl mx-auto px-6 py-12">
                <header className="mb-10">
                    <h1 className="text-4xl font-bold text-[#f1f1f1] mb-2">Cursos</h1>
                    <p className="text-[#8a8a8a]">Explore nossa biblioteca e comece a aprender no seu ritmo.</p>
                </header>

                {cursos.length === 0 ? (
                    <div className="bg-[#12151b] border border-[#1e2430] rounded-xl p-12 text-center">
                        <p className="text-[#f1f1f1] font-medium mb-1">Nenhum curso disponível ainda.</p>
                        <p className="text-[#8a8a8a] text-sm">Volte em breve.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {cursos.map((curso) => (
                            <Link
                                key={curso.public_id}
                                href={route('cursos.show', curso.public_id)}
                                className="bg-[#12151b] border border-[#1e2430] rounded-xl overflow-hidden hover:border-[#E50914]/40 transition-colors group flex flex-col"
                            >
                                <div className="h-40 bg-[#0a0c12] overflow-hidden">
                                    {curso.url_capa ? (
                                        <img
                                            src={curso.url_capa}
                                            alt=""
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[#5a5a5a] text-xs">
                                            sem capa
                                        </div>
                                    )}
                                </div>

                                <div className="p-5 flex-1 flex flex-col">
                                    {curso.channel && (
                                        <p className="text-[10px] uppercase tracking-[0.14em] text-[#8a8a8a] mb-2">
                                            {curso.channel}
                                        </p>
                                    )}

                                    <h2 className="text-[#f1f1f1] font-semibold text-sm leading-snug mb-4 group-hover:text-white line-clamp-2">
                                        {curso.titulo}
                                    </h2>

                                    <div className="flex items-center justify-between text-xs text-[#8a8a8a] mb-4 mt-auto">
                                        <span>{formatDuration(curso.duracao_total_segundos)}</span>
                                        <span>{curso.total_aulas} aulas</span>
                                    </div>

                                    <span className="w-full py-2 rounded-lg border border-[#E50914] text-[#E50914] group-hover:bg-[#E50914]/10 text-xs font-medium transition-colors text-center">
                                        Ver curso
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </GuestLayout>
    )
}