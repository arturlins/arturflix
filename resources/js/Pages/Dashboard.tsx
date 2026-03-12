import { Head, usePage } from '@inertiajs/react'
import AppLayout from '@/layouts/AppLayout'
import type { PageProps } from '@/types'

const STATS = [
    { icon: '⚡', label: 'XP Acumulado', value: '1.240 XP' },
    { icon: '🏆', label: 'Cursos Concluídos', value: '3' },
    { icon: '📜', label: 'Certificados', value: '2' },
]

const IN_PROGRESS = [
    { title: 'React do Zero ao Avançado', progress: 65, color: '#1a1a2e', icon: '⚛️' },
    { title: 'Laravel 12 Completo', progress: 30, color: '#0f3460', icon: '🔴' },
    { title: 'TypeScript Essencial', progress: 90, color: '#0d2137', icon: '🔷' },
]

export default function Dashboard() {
    const { auth } = usePage<PageProps>().props

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

                {/* Stats */}
                <section className="mb-12" aria-label="Estatísticas do aluno">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {STATS.map(({ icon, label, value }) => (
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

                {/* Cursos em andamento */}
                <section aria-label="Cursos em andamento">
                    <h2 className="text-[#f1f1f1] text-xl font-semibold mb-6">Meus cursos em andamento</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {IN_PROGRESS.map(({ title, progress, color, icon }) => (
                            <article
                                key={title}
                                className="bg-[#12151b] border border-[#1e2430] rounded-xl overflow-hidden"
                            >
                                <div
                                    className="h-28 flex items-center justify-center"
                                    style={{ backgroundColor: color }}
                                >
                                    <span className="text-4xl" aria-hidden="true">{icon}</span>
                                </div>
                                <div className="p-4">
                                    <h3 className="text-[#f1f1f1] text-sm font-semibold mb-3 leading-snug">{title}</h3>

                                    <div className="mb-1 flex items-center justify-between">
                                        <span className="text-xs text-[#8a8a8a]">Progresso</span>
                                        <span className="text-xs text-[#f1f1f1] font-medium">{progress}%</span>
                                    </div>
                                    <div className="h-1.5 bg-[#1e2430] rounded-full overflow-hidden mb-4">
                                        <div
                                            className="h-full bg-[#E50914] rounded-full"
                                            style={{ width: `${progress}%` }}
                                            role="progressbar"
                                            aria-valuenow={progress}
                                            aria-valuemin={0}
                                            aria-valuemax={100}
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        className="w-full py-1.5 rounded-lg bg-[#E50914] hover:bg-[#c20710] text-white text-xs font-medium transition-colors"
                                    >
                                        Continuar
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            </div>
        </AppLayout>
    )
}
