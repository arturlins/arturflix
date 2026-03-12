import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import type { PropsWithChildren } from 'react'

export default function AppLayout({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen flex flex-col bg-[#0d1016]">
            <Navbar />
            <main className="flex-1 pt-14">{children}</main>
            <Footer />
        </div>
    )
}
