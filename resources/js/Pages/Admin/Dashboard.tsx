import { Head } from '@inertiajs/react'
import AdminLayout from '@/layouts/AdminLayout'

interface Props {
    stats: {
        total_cursos: number
        total_usuarios: number
    }
}

export default function AdminDashboard({ stats }: Props) {
    return (
        <AdminLayout>
            <Head title="Admin — Dashboard" />

            <div className="max-w-5xl mx-auto px-8 py-10">
                <header className="mb-8">
                    <h1 className="text-2xl font-semibold text-[#f1f1f1]">Painel de administração</h1>
                    <p className="text-[#8a8a8a] text-sm mt-1">Visão geral da plataforma.</p>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <article className="bg-[#12151b] border border-[#1e2430] rounded-xl p-6">
                        <p className="text-[#8a8a8a] text-xs mb-1">Cursos</p>
                        <p className="text-[#f1f1f1] text-3xl font-semibold">{stats.total_cursos}</p>
                    </article>
                    <article className="bg-[#12151b] border border-[#1e2430] rounded-xl p-6">
                        <p className="text-[#8a8a8a] text-xs mb-1">Usuários</p>
                        <p className="text-[#f1f1f1] text-3xl font-semibold">{stats.total_usuarios}</p>
                    </article>
                </div>
            </div>
        </AdminLayout>
    )
}
