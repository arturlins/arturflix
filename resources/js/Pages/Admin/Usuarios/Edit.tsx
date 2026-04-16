import { Head, useForm } from '@inertiajs/react'
import type { FormEvent } from 'react'
import { PageHeader } from '@/components/admin/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import AdminLayout from '@/layouts/AdminLayout'
import { PAPEL_LABEL } from '@/lib/status-tones'

interface UsuarioEdit {
    public_id: string
    nome_completo: string | null
    email: string
    papel: 'aluno' | 'admin' | 'superuser'
}

interface Props {
    usuario: UsuarioEdit
    papeis_permitidos: Array<'aluno' | 'admin' | 'superuser'>
}

export default function AdminUsuariosEdit({ usuario, papeis_permitidos }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        nome_completo: usuario.nome_completo ?? '',
        email: usuario.email,
        password: '',
        password_confirmation: '',
        papel: usuario.papel,
    })

    function submit(e: FormEvent): void {
        e.preventDefault()
        put(route('admin.usuarios.update', usuario.public_id))
    }

    // Build the merged set of selectable roles: current papel + what actor can assign
    const papeisDisponiveis = Array.from(
        new Set([usuario.papel, ...papeis_permitidos]),
    ) as Array<'aluno' | 'admin' | 'superuser'>

    return (
        <AdminLayout
            breadcrumbs={[
                { label: 'Usuários', href: route('admin.usuarios.index') },
                { label: usuario.nome_completo ?? usuario.email },
            ]}
        >
            <Head title={`Admin — ${usuario.nome_completo ?? usuario.email}`} />

            <PageHeader
                title={usuario.nome_completo ?? usuario.email}
                description="Edite os dados do usuário."
            />

            <div className="max-w-lg">
                <form onSubmit={submit} className="space-y-5">
                    <div className="space-y-1.5">
                        <Label htmlFor="nome_completo">
                            Nome completo <span className="text-accent">*</span>
                        </Label>
                        <Input
                            id="nome_completo"
                            value={data.nome_completo}
                            onChange={(e) => setData('nome_completo', e.target.value)}
                            aria-invalid={!!errors.nome_completo}
                            autoFocus
                        />
                        {errors.nome_completo && (
                            <p className="text-xs text-accent">{errors.nome_completo}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="email">
                            E-mail <span className="text-accent">*</span>
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            aria-invalid={!!errors.email}
                        />
                        {errors.email && (
                            <p className="text-xs text-accent">{errors.email}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="papel">Papel</Label>
                        <Select
                            id="papel"
                            value={data.papel}
                            onChange={(e) => setData('papel', e.target.value as typeof data.papel)}
                            invalid={!!errors.papel}
                        >
                            {papeisDisponiveis.map((p) => (
                                <option key={p} value={p}>
                                    {PAPEL_LABEL[p]}
                                </option>
                            ))}
                        </Select>
                        {errors.papel && (
                            <p className="text-xs text-accent">{errors.papel}</p>
                        )}
                    </div>

                    {/* Password section */}
                    <div className="rounded-xl border border-border bg-surface-2 p-5 space-y-4">
                        <div>
                            <p className="text-sm font-medium text-foreground">Alterar senha</p>
                            <p className="text-xs text-foreground-muted mt-0.5">
                                Deixe em branco para manter a senha atual.
                            </p>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="password">Nova senha</Label>
                            <Input
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                aria-invalid={!!errors.password}
                                placeholder="Mínimo 8 caracteres"
                            />
                            {errors.password && (
                                <p className="text-xs text-accent">{errors.password}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="password_confirmation">Confirmar nova senha</Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                placeholder="Repita a nova senha"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => window.history.back()}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Salvando…' : 'Salvar alterações'}
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    )
}
