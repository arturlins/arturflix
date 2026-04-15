import { usePage } from '@inertiajs/react'
import type { PropsWithChildren } from 'react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default function AdminLayout({ children }: PropsWithChildren) {
    const { url } = usePage()

    return (
        <div className="min-h-screen flex bg-[#0d1016]">
            <AdminSidebar current={url} />
            <main className="flex-1 min-w-0">{children}</main>
        </div>
    )
}
