import { Head, useForm } from '@inertiajs/react'
import type { FormEvent } from 'react'
import { PageHeader } from '@/components/admin/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import AdminLayout from '@/layouts/AdminLayout'
import { PAPEL_LABEL } from '@/lib/status-tones'

interface Props {
    papeis_permitidos: Array<'aluno' | 'admin' | 'superuser'>
}

export default function AdminUsuariosCreate({ papeis_permitidos }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        nome_completo: '',
        email: '',
        password: '',
        password_confirmation: '',
        papel: papeis_permitidos[0] ?? 'aluno',
    })

    function submit(e: FormEvent): void {
        e.preventDefault()
        post(route('admin.usuarios.store'))
    }

    const podeVerAdmin = papeis_permitidos.includes('admin')

    return (
        <AdminLayout
            breadcrumbs={[
                { label: 'Usuários', href: route('admin.usuarios.index') },
                { label: 'Novo usuário' },
            ]}
        >
            <Head title="Admin — Novo usuário" />

            <PageHeader
                title="Novo usuário"
                description="Crie um novo usuário na plataforma."
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
                        <Label htmlFor="password">
                            Senha <span className="text-accent">*</span>
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            aria-invalid={!!errors.password}
                        />
                        {errors.password && (
                            <p className="text-xs text-accent">{errors.password}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="password_confirmation">
                            Confirmar senha <span className="text-accent">*</span>
                        </Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="papel">
                            Papel <span className="text-accent">*</span>
                        </Label>
                        <Select
                            id="papel"
                            value={data.papel}
                            onChange={(e) => setData('papel', e.target.value as typeof data.papel)}
                            invalid={!!errors.papel}
                        >
                            {papeis_permitidos.map((p) => (
                                <option key={p} value={p}>
                                    {PAPEL_LABEL[p]}
                                </option>
                            ))}
                        </Select>
                        {errors.papel && (
                            <p className="text-xs text-accent">{errors.papel}</p>
                        )}
                        {!podeVerAdmin && (
                            <p className="text-xs text-foreground-muted">
                                Apenas superusers podem criar admins.
                            </p>
                        )}
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
                            {processing ? 'Criando…' : 'Criar usuário'}
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    )
}
