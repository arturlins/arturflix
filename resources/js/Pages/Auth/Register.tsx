import { Head, Link, useForm } from '@inertiajs/react'

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        aceitou_termos: false,
    })

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        post('/register')
    }

    const fields = [
        { id: 'name' as const, label: 'Nome completo', type: 'text', placeholder: 'Seu nome' },
        { id: 'email' as const, label: 'E-mail', type: 'email', placeholder: 'seu@email.com' },
        { id: 'password' as const, label: 'Senha', type: 'password', placeholder: 'Mínimo 8 caracteres' },
        {
            id: 'password_confirmation' as const,
            label: 'Confirmar senha',
            type: 'password',
            placeholder: 'Repita a senha',
        },
    ]

    return (
        <>
            <Head title="Cadastro" />
            <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#0d1016]">
                <section className="w-full max-w-sm">
                    <div className="text-center mb-8">
                        <Link
                            href="/"
                            className="text-[#E50914] text-4xl"
                            style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}
                        >
                            ARTURFLIX
                        </Link>
                        <p className="text-[#8a8a8a] text-sm mt-3">Crie sua conta gratuitamente</p>
                    </div>

                    <div className="bg-[#12151b] border border-[#1e2430] rounded-xl p-6">
                        {errors.email && (
                            <p className="text-red-400 text-sm mb-4 bg-red-950/30 border border-red-900/50 rounded-lg px-3 py-2">
                                {errors.email}
                            </p>
                        )}
                        {errors.password && (
                            <p className="text-red-400 text-sm mb-4 bg-red-950/30 border border-red-900/50 rounded-lg px-3 py-2">
                                {errors.password}
                            </p>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {fields.map(({ id, label, type, placeholder }) => (
                                <div key={id}>
                                    <label htmlFor={id} className="block text-sm text-[#f1f1f1] mb-1.5">
                                        {label}
                                    </label>
                                    <input
                                        id={id}
                                        type={type}
                                        value={data[id] as string}
                                        onChange={(e) => setData(id, e.target.value)}
                                        placeholder={placeholder}
                                        required
                                        minLength={type === 'password' ? 8 : undefined}
                                        className="w-full bg-[#171b23] border border-[#1e2430] rounded-lg px-3 py-2.5 text-sm text-[#f1f1f1] placeholder:text-[#555] focus:outline-none focus:border-[#E50914] transition-colors"
                                    />
                                </div>
                            ))}

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-[#E50914] hover:bg-[#c20710] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg text-sm transition-colors mt-2"
                            >
                                {processing ? 'Criando conta...' : 'Criar conta'}
                            </button>
                        </form>

                        <p className="text-center text-[#8a8a8a] text-xs mt-4 leading-relaxed">
                            Ao criar uma conta você concorda com os{' '}
                            <Link
                                href="/termos"
                                className="hover:text-[#f1f1f1] underline underline-offset-2"
                            >
                                Termos de Uso
                            </Link>{' '}
                            e a{' '}
                            <Link
                                href="/privacidade"
                                className="hover:text-[#f1f1f1] underline underline-offset-2"
                            >
                                Política de Privacidade
                            </Link>
                            .
                        </p>
                    </div>

                    <p className="text-center text-[#8a8a8a] text-sm mt-5">
                        Já tem conta?{' '}
                        <Link
                            href="/login"
                            className="text-[#f1f1f1] hover:text-[#E50914] transition-colors"
                        >
                            Entrar
                        </Link>
                    </p>
                </section>
            </main>
        </>
    )
}
