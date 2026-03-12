import { Head, Link } from '@inertiajs/react'

export default function VerifyEmail() {
    return (
        <>
            <Head title="Verificar E-mail" />
            <main className="min-h-screen flex items-center justify-center px-4 bg-[#0d1016]">
                <div className="text-center">
                    <h1 className="text-2xl text-[#f1f1f1] mb-4">Verifique seu e-mail</h1>
                    <p className="text-[#8a8a8a]">Enviamos um link de verificação para o seu e-mail.</p>
                    <Link href="/logout" className="text-[#E50914] mt-4 inline-block">Sair</Link>
                </div>
            </main>
        </>
    )
}
