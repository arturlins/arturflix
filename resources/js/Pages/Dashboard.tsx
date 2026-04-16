import { Head, Link, usePage } from '@inertiajs/react'
import AppLayout from '@/layouts/AppLayout'
import type { MeuCursoItem, PageProps } from '@/types'

interface Props extends PageProps {
    meusCursos: MeuCursoItem[]
}

function formatDuration(totalSeconds: number): string {
    if (totalSeconds <= 0) return '—'
    if (totalSeconds < 60) return `${totalSeconds}s`
    const h = Math.floor(totalSeconds / 3600)
    const m = Math.floor((totalSeconds % 3600) / 60)
    if (h === 0) return `${m}min`
    if (m === 0) return `${h}h`
    return `${h}h ${m}min`
}

export default function Dashboard() {
    const { auth, meusCursos } = usePage<Props>().props
    const concluidos = meusCursos.filter((c) => c.concluido_em).length

    const stats = [
        { icon: '⚡', label: 'XP Acumulado', value: '0 XP' },
        { icon: '🏆', label: 'Cursos Concluídos', value: String(concluidos) },
        { icon: '📚', label: 'Cursos Matriculados', value: String(meusCursos.length) },
    ]

    return (
        <AppLayout>
            <Head title="Dashboard" />

            <div className="max-w-6xl mx-auto px-6 py-12">
                <header className="mb-10">
                    <h1 className="text-3xl font-bold text-[#f1f1f1]">
                        Bem-vindo, <span className="text-[#E50914]">{auth.user?.name}</span>!
                    </h1>
                    <p className="text-[#8a8a8a] mt-1">Aqui está o seu progresso na plataforma.</p>
                </header>

                <section className="mb-12" aria-label="Estatísticas do aluno">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {stats.map(({ icon, label, value }) => (
                            <article
                                key={label}
                                className="bg-[#12151b] border border-[#1e2430] rounded-xl p-6 flex items-center gap-4"
                            >
                                <span className="text-3xl" aria-hidden="true">{icon}</span>
                                <div>
                                    <p className="text-[#8a8a8a] text-xs mb-0.5">{label}</p>
                                    <p className="text-[#f1f1f1] text-2xl font-bold">{value}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                <section aria-label="Meus cursos">
                    <div className="flex items-baseline justify-between mb-6">
                        <h2 className="text-[#f1f1f1] text-xl font-semibold">Meus cursos</h2>
                        <Link href={route('cursos.index')} className="text-xs text-[#8a8a8a] hover:text-[#f1f1f1] transition-colors">
                            Explorar catálogo →
                        </Link>
                    </div>

                    {meusCursos.length === 0 ? (
                        <div className="bg-[#12151b] border border-[#1e2430] rounded-xl p-12 text-center">
                            <p className="text-[#f1f1f1] font-medium mb-1">Você ainda não está matriculado em nenhum curso.</p>
                            <p className="text-[#8a8a8a] text-sm mb-6">Explore o catálogo e comece a aprender hoje.</p>
                            <Link
                                href={route('cursos.index')}
                                className="inline-flex items-center justify-center px-5 py-2 rounded-lg bg-[#E50914] hover:bg-[#c20710] text-white text-sm font-medium transition-colors"
                            >
                                Ver cursos
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {meusCursos.map((curso) => (
                                <Link
                                    key={curso.public_id}
                                    href={route('cursos.show', curso.public_id)}
                                    className="bg-[#12151b] border border-[#1e2430] rounded-xl overflow-hidden hover:border-[#E50914]/40 transition-colors group flex flex-col"
                                >
                                    <div className="h-32 bg-[#0a0c12] overflow-hidden">
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

                                        <h3 className="text-[#f1f1f1] font-semibold text-sm leading-snug mb-4 group-hover:text-white line-clamp-2">
                                            {curso.titulo}
                                        </h3>

                                        <div className="flex items-center justify-between text-xs text-[#8a8a8a] mb-4 mt-auto">
                                            <span>{formatDuration(curso.duracao_total_segundos)}</span>
                                            <span>{curso.total_aulas} aulas</span>
                                        </div>

                                        <span className="w-full py-2 rounded-lg bg-[#E50914] group-hover:bg-[#c20710] text-white text-xs font-medium transition-colors text-center">
                                            {curso.concluido_em ? 'Revisar curso' : 'Continuar'}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </AppLayout>
    )
}