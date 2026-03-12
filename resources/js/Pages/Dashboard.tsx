import { Head, usePage } from '@inertiajs/react'
import AppLayout from '@/layouts/AppLayout'
import type { PageProps } from '@/types'

export default function Dashboard() {
    const { auth } = usePage<PageProps>().props

    return (
        <AppLayout>
            <Head title="Dashboard" />
            <div className="max-w-6xl mx-auto px-6 py-12">
                <h1 className="text-3xl text-[#f1f1f1]">
                    Bem-vindo, {auth.user?.name}!
                </h1>
            </div>
        </AppLayout>
    )
}
