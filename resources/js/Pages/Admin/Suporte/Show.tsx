import { Head, Link, useForm } from '@inertiajs/react'
import { Check, Pencil, Reply } from 'lucide-react'
import { PageHeader } from '@/components/admin/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import AdminLayout from '@/layouts/AdminLayout'
import { STATUS_CHAMADO_LABEL, STATUS_CHAMADO_TONE } from '@/lib/status-tones'

interface UsuarioRow {
    public_id: string
    nome_completo: string | null
    email: string
}

interface ChamadoDetail {
    public_id: string
    assunto: string
    mensagem: string
    anexo_url: string | null
    resposta: string | null
    email_contato: string
    status: 'novo' | 'em_andamento' | 'resolvido'
    resolvido_em: string | null
    created_at: string | null
    updated_at: string | null
    usuario: UsuarioRow | null
}

interface Props {
    chamado: ChamadoDetail
}

function formatDateTime(iso: string | null): string {
    if (!iso) return '—'
    return new Date(iso).toLocaleString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

function avatarInitial(chamado: ChamadoDetail): string {
    const name = chamado.usuario?.nome_completo ?? chamado.email_contato
    return name.charAt(0).toUpperCase()
}

export default function AdminSuporteShow({ chamado }: Props) {
    const respondForm = useForm({ resposta: '' })
    const resolveForm = useForm({})

    const isResolved = chamado.status === 'resolvido'
    const displayName = chamado.usuario?.nome_completo ?? chamado.email_contato

    function handleRespond(e: React.FormEvent) {
        e.preventDefault()
        respondForm.post(route('admin.suporte.respond', chamado.public_id), {
            preserveScroll: true,
            onSuccess: () => respondForm.reset(),
        })
    }

    function handleResolve() {
        resolveForm.post(route('admin.suporte.resolve', chamado.public_id), {
            preserveScroll: true,
        })
    }

    const truncatedAssunto =
        chamado.assunto.length > 40 ? chamado.assunto.slice(0, 40) + '…' : chamado.assunto

    return (
        <AdminLayout
            breadcrumbs={[
                { label: 'Suporte', href: '/admin/suporte' },
                { label: truncatedAssunto },
            ]}
        >
            <Head title={`Admin — ${chamado.assunto}`} />

            <PageHeader
                title={chamado.assunto}
                eyebrow="Chamado de suporte"
                actions={
                    !isResolved ? (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleResolve}
                            disabled={resolveForm.processing}
                        >
                            <Check size={14} />
                            Marcar como resolvido
                        </Button>
                    ) : undefined
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
                {/* Left — timeline */}
                <div className="space-y-0">
                    {/* User message */}
                    <div className="relative flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-3 border border-border text-sm font-semibold text-foreground">
                                {avatarInitial(chamado)}
                            </div>
                            {(chamado.resposta || !isResolved) && (
                                <div className="mt-2 flex-1 w-px bg-border" />
                            )}
                        </div>
                        <div className="pb-8 flex-1 min-w-0">
                            <div className="flex items-baseline gap-2 mb-2">
                                <span className="font-medium text-sm text-foreground">{displayName}</span>
                                <span className="text-xs text-foreground-muted font-mono">
                                    {chamado.email_contato}
                                </span>
                                <span className="text-xs text-foreground-faint ml-auto">
                                    {formatDateTime(chamado.created_at)}
                                </span>
                            </div>
                            <div className="rounded-xl border border-border bg-surface-2 px-5 py-4 text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                                {chamado.mensagem}
                                {chamado.anexo_url && (
                                    <a href={chamado.anexo_url} target="_blank" rel="noopener noreferrer" className="block mt-3">
                                        <img
                                            src={chamado.anexo_url}
                                            alt="Anexo do chamado"
                                            className="max-w-sm rounded-lg border border-border"
                                        />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Admin response (if exists) */}
                    {chamado.resposta && (
                        <div className="relative flex gap-4">
                            <div className="flex flex-col items-center">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/15 border border-accent/30 text-accent">
                                    <Reply size={16} />
                                </div>
                                {!isResolved && <div className="mt-2 flex-1 w-px bg-border" />}
                            </div>
                            <div className="pb-8 flex-1 min-w-0">
                                <div className="flex items-baseline gap-2 mb-2">
                                    <span className="font-medium text-sm text-accent">Equipe ArturFlix</span>
                                    <span className="text-xs text-foreground-faint ml-auto">
                                        {formatDateTime(chamado.updated_at)}
                                    </span>
                                </div>
                                <div className="rounded-xl border border-accent/20 bg-accent/6 px-5 py-4 text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                                    {chamado.resposta}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Response form (if not resolved) */}
                    {!isResolved && (
                        <div className="relative flex gap-4">
                            <div className="flex flex-col items-center">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-3 border border-border text-foreground-muted">
                                    <Pencil size={15} />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <form onSubmit={handleRespond} className="space-y-3">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="resposta">Responder</Label>
                                        <Textarea
                                            id="resposta"
                                            placeholder="Escreva sua resposta…"
                                            value={respondForm.data.resposta}
                                            onChange={(e) => respondForm.setData('resposta', e.target.value)}
                                            invalid={!!respondForm.errors.resposta}
                                            className="min-h-[120px]"
                                        />
                                        {respondForm.errors.resposta && (
                                            <p className="text-xs text-accent">{respondForm.errors.resposta}</p>
                                        )}
                                    </div>
                                    <Button type="submit" size="sm" disabled={respondForm.processing}>
                                        <Reply size={13} />
                                        Enviar resposta
                                    </Button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right — sidebar */}
                <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
                    {/* Status */}
                    <div className="rounded-xl border border-border bg-surface-2 p-5 space-y-3">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-foreground-faint font-medium">
                            Status
                        </p>
                        <Badge
                            tone={STATUS_CHAMADO_TONE[chamado.status]}
                            dot
                            pulse={chamado.status === 'novo'}
                        >
                            {STATUS_CHAMADO_LABEL[chamado.status]}
                        </Badge>
                    </div>

                    {/* Timeline dates */}
                    <div className="rounded-xl border border-border bg-surface-2 p-5 space-y-3">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-foreground-faint font-medium">
                            Linha do tempo
                        </p>
                        <dl className="space-y-2 text-xs font-mono">
                            <div className="flex justify-between gap-2">
                                <dt className="text-foreground-muted">Recebido</dt>
                                <dd className="text-foreground tabular-nums">{formatDateTime(chamado.created_at)}</dd>
                            </div>
                            {chamado.updated_at && chamado.updated_at !== chamado.created_at && (
                                <div className="flex justify-between gap-2">
                                    <dt className="text-foreground-muted">Atualizado</dt>
                                    <dd className="text-foreground tabular-nums">
                                        {formatDateTime(chamado.updated_at)}
                                    </dd>
                                </div>
                            )}
                            {chamado.resolvido_em && (
                                <div className="flex justify-between gap-2">
                                    <dt className="text-foreground-muted">Resolvido</dt>
                                    <dd className="text-foreground tabular-nums">
                                        {formatDateTime(chamado.resolvido_em)}
                                    </dd>
                                </div>
                            )}
                        </dl>
                    </div>

                    {/* User */}
                    {chamado.usuario && (
                        <div className="rounded-xl border border-border bg-surface-2 p-5 space-y-3">
                            <p className="text-[10px] uppercase tracking-[0.18em] text-foreground-faint font-medium">
                                Usuário
                            </p>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-foreground">
                                    {chamado.usuario.nome_completo ?? chamado.usuario.email}
                                </p>
                                <p className="text-xs text-foreground-muted">{chamado.usuario.email}</p>
                            </div>
                            <Link
                                href={route('admin.usuarios.edit', chamado.usuario.public_id)}
                                className="text-xs text-accent hover:underline"
                            >
                                Ver perfil →
                            </Link>
                        </div>
                    )}
                </aside>
            </div>
        </AdminLayout>
    )
}
