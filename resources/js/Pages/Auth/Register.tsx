import { Head, Link, useForm } from '@inertiajs/react'
import { useState } from 'react'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type Field = 'name' | 'email' | 'password' | 'password_confirmation'

function getPasswordStrength(password: string): { label: string; color: string; width: string } {
    if (password.length === 0) return { label: '', color: '', width: '0%' }
    const hasLetters = /[a-zA-Z]/.test(password)
    const hasNumbers = /[0-9]/.test(password)
    const hasSpecial = /[^a-zA-Z0-9]/.test(password)
    if (password.length >= 8 && hasLetters && hasNumbers && hasSpecial) {
        return { label: 'Forte', color: 'bg-green-500', width: '100%' }
    }
    if (password.length >= 8 && hasLetters && hasNumbers) {
        return { label: 'Média', color: 'bg-yellow-500', width: '66%' }
    }
    return { label: 'Fraca', color: 'bg-red-500', width: '33%' }
}

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    })

    const [clientErrors, setClientErrors] = useState<Partial<Record<Field, string>>>({})
    const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({})

    const strength = getPasswordStrength(data.password)

    function validateField(field: Field, value: string): string | undefined {
        if (field === 'name' && value.trim().length < 2) return 'Nome deve ter pelo menos 2 caracteres.'
        if (field === 'email' && !EMAIL_REGEX.test(value)) return 'Informe um e-mail válido.'
        if (field === 'password' && value.length < 8) return 'A senha deve ter pelo menos 8 caracteres.'
        if (field === 'password_confirmation' && value !== data.password) return 'As senhas não coincidem.'
        return undefined
    }

    function handleBlur(field: Field) {
        setTouched((prev) => ({ ...prev, [field]: true }))
        setClientErrors((prev) => ({ ...prev, [field]: validateField(field, data[field]) }))
    }

    function handleChange(field: Field, value: string) {
        setData(field, value)
        if (touched[field]) {
            setClientErrors((prev) => ({ ...prev, [field]: validateField(field, value) }))
        }
        if (field === 'password' && touched.password_confirmation) {
            setClientErrors((prev) => ({
                ...prev,
                password_confirmation: value !== data.password_confirmation ? 'As senhas não coincidem.' : undefined,
            }))
        }
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        post('/register')
    }

    const inputClass = (field: Field) =>
        `w-full bg-[#171b23] border rounded-lg px-3 py-2.5 text-sm text-[#f1f1f1] placeholder:text-[#555] focus:outline-none transition-colors ${
            (touched[field] && clientErrors[field]) || errors[field as keyof typeof errors]
                ? 'border-[#E50914]'
                : 'border-[#1e2430] focus:border-[#E50914]'
        }`

    return (
        <>
            <Head title="Cadastro" />
            <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#0d1017]">
                <section className="w-full max-w-sm">
                    <div className="text-center mb-8">
                        <Link href="/" aria-label="ArturFlix — página inicial">
                            <img
                                src="/logo-arturflix.png"
                                alt="ArturFlix"
                                className="h-10 w-auto mx-auto"
                            />
                        </Link>
                        <p className="text-[#8a8a8a] text-sm mt-3">Crie sua conta gratuitamente</p>
                    </div>

                    <div className="bg-[#12151b] border border-[#1e2430] rounded-xl p-6">
                        {(errors.email || errors.password) && (
                            <div className="text-red-400 text-sm mb-4 bg-red-950/30 border border-red-900/50 rounded-lg px-3 py-2 space-y-1">
                                {errors.email && <p>{errors.email}</p>}
                                {errors.password && <p>{errors.password}</p>}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} noValidate className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm text-[#f1f1f1] mb-1.5">
                                    Nome completo
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    onBlur={() => handleBlur('name')}
                                    placeholder="Seu nome"
                                    required
                                    className={inputClass('name')}
                                />
                                {touched.name && clientErrors.name && (
                                    <span className="text-red-400 text-xs mt-1 block">{clientErrors.name}</span>
                                )}
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm text-[#f1f1f1] mb-1.5">
                                    E-mail
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    onBlur={() => handleBlur('email')}
                                    placeholder="seu@email.com"
                                    required
                                    className={inputClass('email')}
                                />
                                {touched.email && clientErrors.email && (
                                    <span className="text-red-400 text-xs mt-1 block">{clientErrors.email}</span>
                                )}
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm text-[#f1f1f1] mb-1.5">
                                    Senha
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => handleChange('password', e.target.value)}
                                    onBlur={() => handleBlur('password')}
                                    placeholder="Mínimo 8 caracteres"
                                    required
                                    minLength={8}
                                    className={inputClass('password')}
                                />
                                {data.password.length > 0 && (
                                    <div className="mt-2">
                                        <div className="h-1 bg-[#1e2430] rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                                                style={{ width: strength.width }}
                                            />
                                        </div>
                                        <span className="text-xs text-[#8a8a8a] mt-1 block">
                                            Força: <span className="text-[#f1f1f1]">{strength.label}</span>
                                        </span>
                                    </div>
                                )}
                                {touched.password && clientErrors.password && (
                                    <span className="text-red-400 text-xs mt-1 block">{clientErrors.password}</span>
                                )}
                            </div>

                            <div>
                                <label htmlFor="password_confirmation" className="block text-sm text-[#f1f1f1] mb-1.5">
                                    Confirmar senha
                                </label>
                                <input
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => handleChange('password_confirmation', e.target.value)}
                                    onBlur={() => handleBlur('password_confirmation')}
                                    placeholder="Repita a senha"
                                    required
                                    className={inputClass('password_confirmation')}
                                />
                                {touched.password_confirmation && clientErrors.password_confirmation && (
                                    <span className="text-red-400 text-xs mt-1 block">{clientErrors.password_confirmation}</span>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-[#E50914] hover:bg-[#c20710] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg text-sm transition-colors mt-2"
                            >
                                {processing ? 'Criando conta...' : 'Criar conta'}
                            </button>
                        </form>
                    </div>

                    <p className="text-center text-[#8a8a8a] text-sm mt-5">
                        Já tem conta?{' '}
                        <Link href="/login" className="text-[#f1f1f1] hover:text-[#E50914] transition-colors">
                            Entrar
                        </Link>
                    </p>
                </section>
            </main>
        </>
    )
}
