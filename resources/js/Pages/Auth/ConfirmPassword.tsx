import { Head, useForm } from '@inertiajs/react'

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors } = useForm({ password: '' })

    return (
        <>
            <Head title="Confirmar senha" />
            <main className="min-h-screen flex items-center justify-center px-4 bg-[#0d1016]">
                <section className="w-full max-w-sm">
                    <h1 className="text-2xl text-[#f1f1f1] mb-6 text-center">Confirme sua senha</h1>
                    {errors.password && <p className="text-red-400 text-sm mb-4">{errors.password}</p>}
                    <form onSubmit={(e) => { e.preventDefault(); post('/confirm-password') }} className="space-y-4">
                        <input type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} placeholder="Sua senha" required className="w-full bg-[#171b23] border border-[#1e2430] rounded-lg px-3 py-2.5 text-sm text-[#f1f1f1]" />
                        <button type="submit" disabled={processing} className="w-full bg-[#E50914] text-white py-2.5 rounded-lg text-sm">
                            {processing ? 'Confirmando...' : 'Confirmar'}
                        </button>
                    </form>
                </section>
            </main>
        </>
    )
}
