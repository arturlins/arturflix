import { Head, Link, useForm } from '@inertiajs/react'
import { useState } from 'react'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
    })

    const [clientErrors, setClientErrors] = useState<{ email?: string; password?: string }>({})
    const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({})

    function validateField(field: 'email' | 'password', value: string): string | undefined {
        if (field === 'email' && !EMAIL_REGEX.test(value)) return 'Informe um e-mail válido.'
        if (field === 'password' && value.length < 8) return 'A senha deve ter pelo menos 8 caracteres.'
        return undefined
    }

    function handleBlur(field: 'email' | 'password') {
        setTouched((prev) => ({ ...prev, [field]: true }))
        setClientErrors((prev) => ({ ...prev, [field]: validateField(field, data[field]) }))
    }

    function handleChange(field: 'email' | 'password', value: string) {
        setData(field, value)
        if (touched[field]) {
            setClientErrors((prev) => ({ ...prev, [field]: validateField(field, value) }))
        }
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        post('/login')
    }

    const inputClass = (field: 'email' | 'password') =>
        `w-full bg-[#171b23] border rounded-lg px-3 py-2.5 text-sm text-[#f1f1f1] placeholder:text-[#555] focus:outline-none transition-colors ${
            (touched[field] && clientErrors[field]) || errors[field]
                ? 'border-[#E50914]'
                : 'border-[#1e2430] focus:border-[#E50914]'
        }`

    return (
        <>
            <Head title="Login" />
            <main className="min-h-screen flex items-center justify-center px-4 bg-[#0d1017]">
                <section className="w-full max-w-sm">
                    <div className="text-center mb-8">
                        <Link href="/" aria-label="ArturFlix — página inicial">
                            <img
                                src="/logo-arturflix.png"
                                alt="ArturFlix"
                                className="h-10 w-auto mx-auto"
                            />
                        </Link>
                        <p className="text-[#8a8a8a] text-sm mt-3">Entre na sua conta</p>
                    </div>

                    <div className="bg-[#12151b] border border-[#1e2430] rounded-xl p-6">
                        {errors.email && (
                            <p className="text-red-400 text-sm mb-4 bg-red-950/30 border border-red-900/50 rounded-lg px-3 py-2">
                                {errors.email}
                            </p>
                        )}

                        <form onSubmit={handleSubmit} noValidate className="space-y-4">
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
                                <div className="flex items-center justify-between mb-1.5">
                                    <label htmlFor="password" className="block text-sm text-[#f1f1f1]">
                                        Senha
                                    </label>
                                    <Link
                                        href="/forgot-password"
                                        className="text-xs text-[#8a8a8a] hover:text-[#E50914] transition-colors"
                                    >
                                        Esqueceu?
                                    </Link>
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => handleChange('password', e.target.value)}
                                    onBlur={() => handleBlur('password')}
                                    placeholder="••••••••"
                                    required
                                    className={inputClass('password')}
                                />
                                {touched.password && clientErrors.password && (
                                    <span className="text-red-400 text-xs mt-1 block">{clientErrors.password}</span>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-[#E50914] hover:bg-[#c20710] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg text-sm transition-colors mt-2"
                            >
                                {processing ? 'Entrando...' : 'Entrar'}
                            </button>
                        </form>
                    </div>

                    <p className="text-center text-[#8a8a8a] text-sm mt-5">
                        Não tem conta?{' '}
                        <Link href="/register" className="text-[#f1f1f1] hover:text-[#E50914] transition-colors">
                            Cadastre-se
                        </Link>
                    </p>
                </section>
            </main>
        </>
    )
}
