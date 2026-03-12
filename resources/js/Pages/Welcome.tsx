import { Head } from '@inertiajs/react'
import GuestLayout from '@/layouts/GuestLayout'

export default function Welcome() {
    return (
        <GuestLayout>
            <Head title="ArturFlix" />
            <div className="flex items-center justify-center min-h-[60vh]">
                <h1 className="text-4xl text-[#f1f1f1]">Landing Page</h1>
            </div>
        </GuestLayout>
    )
}
