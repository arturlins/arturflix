import { Link } from '@inertiajs/react'

export function Footer() {
    return (
        <footer className="border-t border-[#1e2430] mt-auto">
            <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span
                    className="text-[#E50914] text-xl"
                    style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}
                >
                    ARTURFLIX
                </span>
                <div className="flex items-center gap-6 text-sm text-[#8a8a8a]">
                    <Link href="/suporte" className="hover:text-[#f1f1f1] transition-colors">
                        Suporte
                    </Link>
                    <Link href="/termos" className="hover:text-[#f1f1f1] transition-colors">
                        Termos
                    </Link>
                    <Link href="/privacidade" className="hover:text-[#f1f1f1] transition-colors">
                        Privacidade
                    </Link>
                </div>
                <p className="text-xs text-[#8a8a8a]">© {new Date().getFullYear()} ArturFlix</p>
            </div>
        </footer>
    )
}
