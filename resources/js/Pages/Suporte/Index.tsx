import { Head } from '@inertiajs/react'
import GuestLayout from '@/layouts/GuestLayout'

export default function SuporteIndex() {
    return (
        <GuestLayout>
            <Head title="Suporte" />
            <div className="max-w-6xl mx-auto px-6 py-12">
                <h1 className="text-3xl text-[#f1f1f1]">Suporte</h1>
            </div>
        </GuestLayout>
    )
}
