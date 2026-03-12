import { Head, Link, useForm } from '@inertiajs/react'

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
    })

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        post('/login')
    }

    return (
        <>
            <Head title="Login" />
            <main className="min-h-screen flex items-center justify-center px-4 bg-[#0d1016]">
                <section className="w-full max-w-sm">
                    <div className="text-center mb-8">
                        <Link
                            href="/"
                            className="text-[#E50914] text-4xl"
                            style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}
                        >
                            ARTURFLIX
                        </Link>
                        <p className="text-[#8a8a8a] text-sm mt-3">Entre na sua conta</p>
                    </div>

                    <div className="bg-[#12151b] border border-[#1e2430] rounded-xl p-6">
                        {errors.email && (
                            <p className="text-red-400 text-sm mb-4 bg-red-950/30 border border-red-900/50 rounded-lg px-3 py-2">
                                {errors.email}
                            </p>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm text-[#f1f1f1] mb-1.5">
                                    E-mail
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="seu@email.com"
                                    required
                                    className="w-full bg-[#171b23] border border-[#1e2430] rounded-lg px-3 py-2.5 text-sm text-[#f1f1f1] placeholder:text-[#555] focus:outline-none focus:border-[#E50914] transition-colors"
                                />
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
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full bg-[#171b23] border border-[#1e2430] rounded-lg px-3 py-2.5 text-sm text-[#f1f1f1] placeholder:text-[#555] focus:outline-none focus:border-[#E50914] transition-colors"
                                />
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
                        <Link
                            href="/register"
                            className="text-[#f1f1f1] hover:text-[#E50914] transition-colors"
                        >
                            Cadastre-se
                        </Link>
                    </p>
                </section>
            </main>
        </>
    )
}
