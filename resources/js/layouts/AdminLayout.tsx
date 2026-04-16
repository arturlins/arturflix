import { usePage } from '@inertiajs/react'
import type { PropsWithChildren } from 'react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminHeader } from '@/components/admin/AdminHeader'
import type { Crumb } from '@/components/admin/Breadcrumbs'
import { useFlashToast } from '@/hooks/use-flash-toast'
import type { PageProps } from '@/types'

type Props = PropsWithChildren<{ breadcrumbs?: Crumb[] }>

export default function AdminLayout({ children, breadcrumbs = [] }: Props) {
    const { url, props } = usePage<PageProps>()
    useFlashToast()

    const crumbs: Crumb[] = [{ label: 'Admin', href: '/admin' }, ...breadcrumbs]

    return (
        <div className="min-h-screen flex bg-surface text-foreground">
            <AdminSidebar current={url} />
            <div className="flex-1 min-w-0 flex flex-col">
                <AdminHeader breadcrumbs={crumbs} user={props.auth.user!} />
                <main className="flex-1">
                    <div className="mx-auto w-full max-w-7xl px-8 py-10">{children}</div>
                </main>
            </div>
        </div>
    )
}
