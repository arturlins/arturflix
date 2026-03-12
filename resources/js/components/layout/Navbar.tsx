import { Link, router, usePage } from '@inertiajs/react'
import type { PageProps } from '@/types'

export function Navbar() {
    const { auth } = usePage<PageProps>().props

    function handleLogout() {
        router.post('/logout')
    }

    return (
        <nav
            aria-label="Navegação principal"
            className="fixed top-0 w-full z-50 bg-[#0d1016]/90 backdrop-blur-md border-b border-[#1e2430]"
        >
            <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
                <Link
                    href="/"
                    className="text-[#E50914] text-2xl tracking-wide"
                    style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}
                >
                    ARTURFLIX
                </Link>

                <div className="hidden md:flex items-center gap-8">
                    <Link
                        href="/cursos"
                        className="text-[#8a8a8a] hover:text-[#f1f1f1] text-sm transition-colors"
                    >
                        Cursos
                    </Link>
                    <Link
                        href="/suporte"
                        className="text-[#8a8a8a] hover:text-[#f1f1f1] text-sm transition-colors"
                    >
                        Suporte
                    </Link>
                </div>

                <div className="flex items-center gap-3">
                    {auth.user ? (
                        <>
                            <span className="text-sm text-[#8a8a8a] hidden sm:block">
                                {auth.user.name}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="text-sm text-[#8a8a8a] hover:text-[#f1f1f1] transition-colors"
                            >
                                Sair
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="text-sm text-[#8a8a8a] hover:text-[#f1f1f1] transition-colors"
                            >
                                Entrar
                            </Link>
                            <Link
                                href="/register"
                                className="text-sm bg-[#E50914] hover:bg-[#c20710] text-white px-4 py-1.5 rounded-md transition-colors font-medium"
                            >
                                Cadastrar
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}
