import { useState } from 'react'
import { router } from '@inertiajs/react'
import type { Comentario, RespostaComentario } from '@/types'

interface Props {
    aulaPublicId: string
    comentarios: Comentario[]
}

function formatarData(iso: string): string {
    const d = new Date(iso)
    return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

function ComentarioItem({
    comentario,
    aulaPublicId,
    permitirResponder,
}: {
    comentario: Comentario | RespostaComentario
    aulaPublicId: string
    permitirResponder: boolean
}) {
    const [editando, setEditando] = useState(false)
    const [respondendo, setRespondendo] = useState(false)
    const [textoEdit, setTextoEdit] = useState(comentario.conteudo)
    const [textoResp, setTextoResp] = useState('')
    const respostas = 'respostas' in comentario ? comentario.respostas : []

    const salvarEdicao = () => {
        router.put(
            route('comentarios.update', comentario.public_id),
            { conteudo: textoEdit },
            { preserveScroll: true, onSuccess: () => setEditando(false) },
        )
    }

    const excluir = () => {
        if (!confirm('Excluir este comentario?')) return
        router.delete(route('comentarios.destroy', comentario.public_id), { preserveScroll: true })
    }

    const enviarResposta = () => {
        router.post(
            route('aulas.comentarios.store', aulaPublicId),
            { conteudo: textoResp, comentario_pai_id: comentario.public_id },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setTextoResp('')
                    setRespondendo(false)
                },
            },
        )
    }

    return (
        <li className="py-4">
            <div className="flex items-baseline gap-2">
                <span className="text-[#f1f1f1] font-medium text-sm">{comentario.autor.name}</span>
                <span className="text-[#5a5a5a] text-xs">{formatarData(comentario.created_at)}</span>
                {comentario.foi_editado && <span className="text-[#5a5a5a] text-xs">(editado)</span>}
            </div>

            {editando ? (
                <div className="mt-2">
                    <textarea
                        value={textoEdit}
                        onChange={(e) => setTextoEdit(e.target.value)}
                        rows={3}
                        maxLength={2000}
                        className="w-full bg-[#0d1016] border border-[#1e2430] rounded-md p-3 text-sm text-[#f1f1f1] focus:outline-none focus:border-[#3a4250]"
                    />
                    <div className="flex gap-2 mt-2">
                        <button onClick={salvarEdicao} className="px-3 py-1.5 rounded bg-[#E50914] text-white text-xs font-semibold">Salvar</button>
                        <button onClick={() => setEditando(false)} className="px-3 py-1.5 rounded border border-[#1e2430] text-xs text-[#b0b0b0]">Cancelar</button>
                    </div>
                </div>
            ) : (
                <p className="text-[#b0b0b0] text-sm mt-1 whitespace-pre-wrap">{comentario.conteudo}</p>
            )}

            <div className="flex gap-3 mt-2 text-xs text-[#8a8a8a]">
                {permitirResponder && (
                    <button onClick={() => setRespondendo((v) => !v)} className="hover:text-[#f1f1f1]">Responder</button>
                )}
                {comentario.is_owner && !editando && (
                    <>
                        <button onClick={() => setEditando(true)} className="hover:text-[#f1f1f1]">Editar</button>
                        <button onClick={excluir} className="hover:text-[#E50914]">Excluir</button>
                    </>
                )}
            </div>

            {respondendo && (
                <div className="mt-3 ml-4">
                    <textarea
                        value={textoResp}
                        onChange={(e) => setTextoResp(e.target.value)}
                        rows={2}
                        maxLength={2000}
                        placeholder="Sua resposta..."
                        className="w-full bg-[#0d1016] border border-[#1e2430] rounded-md p-3 text-sm text-[#f1f1f1] focus:outline-none focus:border-[#3a4250]"
                    />
                    <div className="flex gap-2 mt-2">
                        <button onClick={enviarResposta} disabled={!textoResp.trim()} className="px-3 py-1.5 rounded bg-[#E50914] text-white text-xs font-semibold disabled:opacity-40">Responder</button>
                        <button onClick={() => setRespondendo(false)} className="px-3 py-1.5 rounded border border-[#1e2430] text-xs text-[#b0b0b0]">Cancelar</button>
                    </div>
                </div>
            )}

            {respostas.length > 0 && (
                <ul className="mt-3 ml-6 border-l border-[#1e2430] pl-4 divide-y divide-[#1e2430]">
                    {respostas.map((r) => (
                        <ComentarioItem key={r.public_id} comentario={r} aulaPublicId={aulaPublicId} permitirResponder={false} />
                    ))}
                </ul>
            )}
        </li>
    )
}

export default function Comentarios({ aulaPublicId, comentarios }: Props) {
    const [texto, setTexto] = useState('')

    const enviar = () => {
        router.post(
            route('aulas.comentarios.store', aulaPublicId),
            { conteudo: texto },
            { preserveScroll: true, onSuccess: () => setTexto('') },
        )
    }

    const total = comentarios.reduce((acc, c) => acc + 1 + c.respostas.length, 0)

    return (
        <section className="mt-10">
            <h2 className="text-sm font-semibold text-[#f1f1f1] mb-4">
                Comentarios <span className="text-[#5a5a5a] font-normal">· {total}</span>
            </h2>

            <div className="bg-[#12151b] border border-[#1e2430] rounded-xl p-4 mb-6">
                <textarea
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    rows={3}
                    maxLength={2000}
                    placeholder="Escreva um comentario..."
                    className="w-full bg-transparent text-sm text-[#f1f1f1] placeholder:text-[#5a5a5a] focus:outline-none resize-none"
                />
                <div className="flex justify-end mt-2">
                    <button
                        onClick={enviar}
                        disabled={!texto.trim()}
                        className="px-4 py-2 rounded-lg bg-[#E50914] hover:bg-[#c20710] text-white text-xs font-semibold disabled:opacity-40"
                    >
                        Comentar
                    </button>
                </div>
            </div>

            {comentarios.length === 0 ? (
                <p className="text-[#8a8a8a] text-sm">Seja o primeiro a comentar.</p>
            ) : (
                <ul className="divide-y divide-[#1e2430]">
                    {comentarios.map((c) => (
                        <ComentarioItem key={c.public_id} comentario={c} aulaPublicId={aulaPublicId} permitirResponder={true} />
                    ))}
                </ul>
            )}
        </section>
    )
}
