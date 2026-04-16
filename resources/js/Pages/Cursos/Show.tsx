import { Head, Link, router, usePage } from '@inertiajs/react'
import GuestLayout from '@/layouts/GuestLayout'
import type { CursoDetail, ModuloItem, PageProps, TipoAula } from '@/types'

interface Props extends PageProps {
    curso: CursoDetail
    modulos: ModuloItem[]
    matriculado: boolean | null
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

function tipoLabel(tipo: TipoAula): string {
    switch (tipo) {
        case 'video':
            return 'Vídeo'
        case 'texto':
            return 'Texto'
        case 'quiz':
            return 'Quiz'
    }
}

function TipoIcon({ tipo }: { tipo: TipoAula }) {
    const common = 'w-4 h-4 shrink-0'
    if (tipo === 'video') {
        return (
            <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <polygon points="6,4 20,12 6,20" fill="currentColor" stroke="none" />
            </svg>
        )
    }
    if (tipo === 'quiz') {
        return (
            <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="9" />
                <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7" strokeLinecap="round" />
                <circle cx="12" cy="17" r="0.8" fill="currentColor" stroke="none" />
            </svg>
        )
    }
    return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M5 4h11l3 3v13H5z" strokeLinejoin="round" />
            <path d="M8 10h8M8 14h8M8 18h5" strokeLinecap="round" />
        </svg>
    )
}

export default function CursosShow() {
    const { curso, modulos, matriculado } = usePage<Props>().props
    const totalModulos = modulos.length
    const singleModule = totalModulos === 1
    const hasAulas = curso.total_aulas > 0

    const handleMatricular = () => {
        router.post(route('cursos.matricular', curso.public_id), {}, { preserveScroll: true })
    }

    return (
        <GuestLayout>
            <Head title={curso.titulo} />

            <section className="relative">
                <div className="absolute inset-0 h-[420px] overflow-hidden">
                    {curso.url_capa ? (
                        <img src={curso.url_capa} alt="" className="w-full h-full object-cover opacity-30" loading="eager" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#15191f] to-[#0d1016]" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0d1016]/70 to-[#0d1016]" />
                </div>

                <div className="relative max-w-5xl mx-auto px-6 pt-10 pb-12">
                    <Link
                        href={route('cursos.index')}
                        className="inline-flex items-center gap-1.5 text-xs text-[#8a8a8a] hover:text-[#f1f1f1] transition-colors mb-8"
                    >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Cursos
                    </Link>

                    <div className="max-w-3xl">
                        {curso.channel && (
                            <p className="text-[10px] uppercase tracking-[0.18em] text-[#8a8a8a] mb-3">{curso.channel}</p>
                        )}
                        <h1 className="text-3xl md:text-5xl font-bold text-[#f1f1f1] leading-tight mb-4">{curso.titulo}</h1>

                        {curso.descricao && (
                            <p className="text-[#b0b0b0] text-base leading-relaxed mb-6 whitespace-pre-line">
                                {curso.descricao}
                            </p>
                        )}

                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#8a8a8a] mb-7">
                            <span className="inline-flex items-center gap-1.5">
                                <span className="text-[#f1f1f1] font-medium">{curso.total_aulas}</span> aulas
                            </span>
                            <span className="w-px h-3 bg-[#1e2430]" aria-hidden="true" />
                            <span className="inline-flex items-center gap-1.5">
                                <span className="text-[#f1f1f1] font-medium">{formatDuration(curso.duracao_total_segundos)}</span>
                                no total
                            </span>
                            {!singleModule && totalModulos > 0 && (
                                <>
                                    <span className="w-px h-3 bg-[#1e2430]" aria-hidden="true" />
                                    <span className="inline-flex items-center gap-1.5">
                                        <span className="text-[#f1f1f1] font-medium">{totalModulos}</span> módulos
                                    </span>
                                </>
                            )}
                        </div>

                        {matriculado === null && (
                            <Link
                                href={route('login')}
                                className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-[#E50914] hover:bg-[#c20710] text-white text-sm font-semibold transition-colors"
                            >
                                Entrar para se matricular
                            </Link>
                        )}

                        {matriculado === false && (
                            <button
                                type="button"
                                onClick={handleMatricular}
                                className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-[#E50914] hover:bg-[#c20710] text-white text-sm font-semibold transition-colors"
                            >
                                Matricular no curso
                            </button>
                        )}

                        {matriculado === true && (
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 text-emerald-400 text-sm font-medium">
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                                    <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Você está matriculado
                            </span>
                        )}
                    </div>
                </div>
            </section>

            <section className="max-w-5xl mx-auto px-6 pb-16">
                <h2 className="text-xs uppercase tracking-[0.18em] text-[#8a8a8a] mb-4">Conteúdo do curso</h2>

                {!hasAulas ? (
                    <div className="bg-[#12151b] border border-[#1e2430] rounded-xl p-12 text-center">
                        <p className="text-[#f1f1f1] font-medium mb-1">Nenhuma aula cadastrada ainda.</p>
                        <p className="text-[#8a8a8a] text-sm">Volte em breve.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {modulos.map((modulo) => (
                            <div key={modulo.public_id}>
                                {!singleModule && (
                                    <h3 className="text-[#f1f1f1] font-semibold text-sm mb-3 flex items-baseline gap-3">
                                        <span className="text-[#5a5a5a] tabular-nums">
                                            {String(modulo.ordem).padStart(2, '0')}
                                        </span>
                                        {modulo.titulo}
                                        <span className="text-[#5a5a5a] font-normal text-xs">
                                            · {modulo.aulas.length} {modulo.aulas.length === 1 ? 'aula' : 'aulas'}
                                        </span>
                                    </h3>
                                )}

                                <ul className="bg-[#12151b] border border-[#1e2430] rounded-xl divide-y divide-[#1e2430] overflow-hidden">
                                    {modulo.aulas.map((aula, idx) => (
                                        <li
                                            key={aula.public_id}
                                            className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#161a22] transition-colors"
                                        >
                                            <span className="text-[#5a5a5a] text-xs tabular-nums w-6 text-right">
                                                {String(idx + 1).padStart(2, '0')}
                                            </span>
                                            <span className="text-[#8a8a8a]" aria-label={tipoLabel(aula.tipo_aula)}>
                                                <TipoIcon tipo={aula.tipo_aula} />
                                            </span>
                                            <span className="flex-1 text-[#f1f1f1] text-sm leading-snug truncate">
                                                {aula.titulo}
                                            </span>
                                            <span className="text-[#8a8a8a] text-xs tabular-nums">
                                                {formatDuration(aula.duracao_segundos)}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </GuestLayout>
    )
}