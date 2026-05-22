import { useEffect, useRef, useState } from 'react'
import { Head, Link, router, usePage } from '@inertiajs/react'
import AppLayout from '@/layouts/AppLayout'
import Comentarios from '@/components/Comentarios/Comentarios'
import { useYouTubePlayer } from '@/hooks/useYouTubePlayer'
import type { AulaAtual, Comentario, ModuloComStatus, PageProps } from '@/types'

interface Props extends PageProps {
    curso: { public_id: string; titulo: string }
    modulos: ModuloComStatus[]
    aulaAtual: AulaAtual
    proximaAula: { public_id: string } | null
    comentarios: Comentario[]
}

function formatDuration(s: number): string {
    if (s <= 0) return '—'
    const m = Math.floor(s / 60)
    const r = s % 60
    if (m === 0) return `${r}s`
    return `${m}min`
}

function StatusIcon({ concluida, emAndamento }: { concluida: boolean; emAndamento: boolean }) {
    if (concluida) {
        return (
            <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        )
    }
    if (emAndamento) {
        return <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
    }
    return <span className="w-2 h-2 rounded-full border border-[#3a4250] inline-block" />
}

export default function CursosAssistir() {
    const { curso, modulos, aulaAtual, proximaAula, comentarios } = usePage<Props>().props

    const playerContainerRef = useRef<HTMLDivElement | null>(null)
    const [concluida, setConcluida] = useState(aulaAtual.concluida)
    const concluidaRef = useRef(concluida)
    useEffect(() => {
        concluidaRef.current = concluida
    }, [concluida])

    const enviarHeartbeat = (segundos: number) => {
        const csrf = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? ''
        fetch(route('aulas.progresso', aulaAtual.public_id), {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrf,
                'X-Requested-With': 'XMLHttpRequest',
                Accept: 'application/json',
            },
            body: JSON.stringify({ posicao_segundos: Math.floor(segundos) }),
        }).catch(() => {})
    }

    const concluir = () => {
        if (concluidaRef.current) return
        concluidaRef.current = true
        router.post(
            route('aulas.concluir', aulaAtual.public_id),
            {},
            { preserveScroll: true, onSuccess: () => setConcluida(true) },
        )
    }

    useYouTubePlayer(playerContainerRef, {
        videoId: aulaAtual.youtube_video_id ?? '',
        startSeconds: aulaAtual.posicao_segundos,
        onTick: (cur, dur) => {
            if (cur > 0) enviarHeartbeat(cur)
            if (dur > 0 && cur / dur >= 0.9) concluir()
        },
        onEnded: () => concluir(),
    })

    const podePlayer = aulaAtual.tipo_aula === 'video' && !!aulaAtual.youtube_video_id

    return (
        <AppLayout>
            <Head title={`${aulaAtual.titulo} · ${curso.titulo}`} />

            <div className="min-h-screen bg-[#0d1016] text-[#f1f1f1]">
                <div className="max-w-[1600px] mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
                    <div>
                        <Link
                            href={route('cursos.show', curso.public_id)}
                            className="inline-flex items-center gap-1.5 text-xs text-[#8a8a8a] hover:text-[#f1f1f1] mb-4"
                        >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            {curso.titulo}
                        </Link>

                        {podePlayer ? (
                            <div className="aspect-video bg-black rounded-xl overflow-hidden">
                                <div ref={playerContainerRef} className="w-full h-full" />
                            </div>
                        ) : aulaAtual.tipo_aula === 'video' ? (
                            <div className="aspect-video bg-[#12151b] border border-[#1e2430] rounded-xl flex items-center justify-center text-[#8a8a8a]">
                                Video indisponivel
                            </div>
                        ) : (
                            <div className="bg-[#12151b] border border-[#1e2430] rounded-xl p-8 whitespace-pre-wrap text-[#f1f1f1]">
                                {aulaAtual.conteudo ?? 'Sem conteudo.'}
                            </div>
                        )}

                        <div className="mt-6">
                            <h1 className="text-xl font-semibold">{aulaAtual.titulo}</h1>
                            <p className="text-xs text-[#8a8a8a] mt-1">
                                {formatDuration(aulaAtual.duracao_segundos)} · vale {aulaAtual.xp} XP
                            </p>

                            <div className="flex items-center gap-3 mt-5">
                                {!concluida && (
                                    <button
                                        onClick={concluir}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold hover:bg-emerald-500/20"
                                    >
                                        ✓ Marcar como concluida
                                    </button>
                                )}
                                {concluida && (
                                    <span className="inline-flex items-center gap-2 text-emerald-400 text-sm font-medium">✓ Concluida</span>
                                )}
                                {proximaAula && (
                                    <Link
                                        href={route('cursos.assistir', [curso.public_id, proximaAula.public_id])}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#E50914] hover:bg-[#c20710] text-white text-sm font-semibold"
                                    >
                                        Proxima aula →
                                    </Link>
                                )}
                            </div>
                        </div>

                        <Comentarios aulaPublicId={aulaAtual.public_id} comentarios={comentarios} />
                    </div>

                    <aside className="bg-[#12151b] border border-[#1e2430] rounded-xl p-4 h-fit lg:sticky lg:top-6">
                        <h2 className="text-xs uppercase tracking-[0.18em] text-[#8a8a8a] mb-4">Conteudo do curso</h2>
                        <div className="space-y-5">
                            {modulos.map((m) => (
                                <div key={m.public_id}>
                                    <h3 className="text-xs font-semibold text-[#f1f1f1] mb-2">
                                        <span className="text-[#5a5a5a] tabular-nums mr-2">{String(m.ordem).padStart(2, '0')}</span>
                                        {m.titulo}
                                    </h3>
                                    <ul className="space-y-0.5">
                                        {m.aulas.map((a) => {
                                            const atual = a.public_id === aulaAtual.public_id
                                            return (
                                                <li key={a.public_id}>
                                                    {atual ? (
                                                        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded bg-[#1a1f28] text-[#f1f1f1] text-xs">
                                                            <StatusIcon concluida={a.concluida} emAndamento={a.em_andamento} />
                                                            <span className="flex-1 truncate">{a.titulo}</span>
                                                            <span className="text-[#5a5a5a]">{formatDuration(a.duracao_segundos)}</span>
                                                        </div>
                                                    ) : (
                                                        <Link
                                                            href={route('cursos.assistir', [curso.public_id, a.public_id])}
                                                            className="flex items-center gap-2.5 px-2.5 py-2 rounded text-xs text-[#b0b0b0] hover:bg-[#161a22] hover:text-[#f1f1f1]"
                                                        >
                                                            <StatusIcon concluida={a.concluida} emAndamento={a.em_andamento} />
                                                            <span className="flex-1 truncate">{a.titulo}</span>
                                                            <span className="text-[#5a5a5a]">{formatDuration(a.duracao_segundos)}</span>
                                                        </Link>
                                                    )}
                                                </li>
                                            )
                                        })}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </aside>
                </div>
            </div>
        </AppLayout>
    )
}
