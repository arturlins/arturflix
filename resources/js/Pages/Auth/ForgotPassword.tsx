import { Head, Link, useForm } from '@inertiajs/react'

export default function ForgotPassword() {
    const { data, setData, post, processing, errors } = useForm({ email: '' })

    return (
        <>
            <Head title="Esqueci a senha" />
            <main className="min-h-screen flex items-center justify-center px-4 bg-[#0d1016]">
                <section className="w-full max-w-sm">
                    <h1 className="text-2xl text-[#f1f1f1] mb-6 text-center">Recuperar senha</h1>
                    {errors.email && <p className="text-red-400 text-sm mb-4">{errors.email}</p>}
                    <form onSubmit={(e) => { e.preventDefault(); post('/forgot-password') }} className="space-y-4">
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="seu@email.com"
                            required
                            className="w-full bg-[#171b23] border border-[#1e2430] rounded-lg px-3 py-2.5 text-sm text-[#f1f1f1]"
                        />
                        <button type="submit" disabled={processing} className="w-full bg-[#E50914] text-white py-2.5 rounded-lg text-sm">
                            {processing ? 'Enviando...' : 'Enviar link'}
                        </button>
                    </form>
                    <p className="text-center text-[#8a8a8a] text-sm mt-4">
                        <Link href="/login" className="hover:text-[#f1f1f1]">Voltar ao login</Link>
                    </p>
                </section>
            </main>
        </>
    )
}
