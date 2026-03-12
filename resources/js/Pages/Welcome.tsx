import { Head, Link } from '@inertiajs/react'
import GuestLayout from '@/layouts/GuestLayout'

export default function Welcome() {
    return (
        <GuestLayout>
            <Head title="ArturFlix — Aprenda. Evolua. Seja certificado." />

            {/* Hero */}
            <header role="banner" className="flex flex-col items-center justify-center text-center px-6 pt-24 pb-20">
                <img
                    src="/logo-arturflix.png"
                    alt="ArturFlix"
                    className="h-16 w-auto mb-8"
                />
                <h1 className="text-4xl sm:text-6xl font-bold text-[#f1f1f1] leading-tight max-w-3xl">
                    Aprenda. Evolua.{' '}
                    <span className="text-[#E50914]">Seja certificado.</span>
                </h1>
                <p className="text-[#8a8a8a] text-lg mt-5 max-w-xl">
                    A plataforma de cursos online com gamificação, vídeos legendados
                    e certificados digitais reconhecidos.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 mt-8">
                    <Link
                        href="/cursos"
                        className="px-8 py-3 rounded-lg border border-[#E50914] text-[#E50914] hover:bg-[#E50914]/10 transition-colors font-medium text-sm"
                    >
                        Explorar cursos
                    </Link>
                    <Link
                        href="/register"
                        className="px-8 py-3 rounded-lg bg-[#E50914] hover:bg-[#c20710] text-white transition-colors font-medium text-sm"
                    >
                        Cadastrar grátis
                    </Link>
                </div>
            </header>

            {/* Features */}
            <section className="max-w-6xl mx-auto px-6 py-16">
                <h2 className="sr-only">Diferenciais da plataforma</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {[
                        {
                            icon: '🎮',
                            title: 'Plataforma Gamificada',
                            description: 'Ganhe XP, suba no ranking e desbloqueie conquistas a cada aula concluída.',
                        },
                        {
                            icon: '🎬',
                            title: 'Vídeos com Legendas',
                            description: 'Todos os conteúdos com legendas em português para melhor compreensão.',
                        },
                        {
                            icon: '📜',
                            title: 'Certificados Digitais',
                            description: 'Emita certificados reconhecidos ao concluir qualquer curso da plataforma.',
                        },
                    ].map(({ icon, title, description }) => (
                        <article
                            key={title}
                            className="bg-[#12151b] border border-[#1e2430] rounded-xl p-6"
                        >
                            <span className="text-3xl mb-4 block" aria-hidden="true">{icon}</span>
                            <h3 className="text-[#f1f1f1] font-semibold text-base mb-2">{title}</h3>
                            <p className="text-[#8a8a8a] text-sm leading-relaxed">{description}</p>
                        </article>
                    ))}
                </div>
            </section>

            {/* Como funciona */}
            <section className="max-w-6xl mx-auto px-6 py-16 border-t border-[#1e2430]">
                <h2 className="text-[#f1f1f1] text-2xl font-bold text-center mb-12">Como funciona</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                    {[
                        { num: '01', title: 'Cadastre-se grátis', desc: 'Crie sua conta em menos de 1 minuto, sem cartão de crédito.' },
                        { num: '02', title: 'Escolha um curso', desc: 'Explore nossa biblioteca e comece a aprender no seu ritmo.' },
                        { num: '03', title: 'Ganhe seu certificado', desc: 'Conclua o curso e emita seu certificado digital instantaneamente.' },
                    ].map(({ num, title, desc }) => (
                        <div key={num} className="flex flex-col items-center text-center">
                            <span className="font-brand text-6xl text-[#E50914]/30 leading-none mb-3">{num}</span>
                            <h3 className="text-[#f1f1f1] font-semibold mb-2">{title}</h3>
                            <p className="text-[#8a8a8a] text-sm leading-relaxed">{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA final */}
            <section className="max-w-6xl mx-auto px-6 py-16">
                <div className="bg-[#12151b] border border-[#1e2430] rounded-2xl px-8 py-12 text-center">
                    <h2 className="text-[#f1f1f1] text-3xl font-bold mb-3">Pronto para começar?</h2>
                    <p className="text-[#8a8a8a] mb-8">Junte-se a milhares de alunos e comece a aprender hoje.</p>
                    <Link
                        href="/register"
                        className="inline-block px-10 py-3 bg-[#E50914] hover:bg-[#c20710] text-white rounded-lg font-medium transition-colors"
                    >
                        Criar conta grátis
                    </Link>
                </div>
            </section>
        </GuestLayout>
    )
}
