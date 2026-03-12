import { Link } from '@inertiajs/react'

export function Footer() {
    return (
        <footer className="border-t border-[#1e2430] bg-[#0d1017] mt-auto">
            <div className="max-w-6xl mx-auto px-6 py-10">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                    <div>
                        <Link href="/" aria-label="ArturFlix — página inicial">
                            <img
                                src="/logo-arturflix.png"
                                alt="ArturFlix"
                                className="h-7 w-auto mb-3"
                            />
                        </Link>
                        <p className="text-[#8a8a8a] text-sm leading-relaxed">
                            A plataforma de cursos online com gamificação,
                            vídeos legendados e certificados digitais.
                        </p>
                    </div>

                    <nav aria-label="Links rápidos">
                        <h3 className="text-[#f1f1f1] text-sm font-semibold mb-3">Links rápidos</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/cursos" className="text-[#8a8a8a] hover:text-[#f1f1f1] text-sm transition-colors">
                                    Cursos
                                </Link>
                            </li>
                            <li>
                                <Link href="/suporte" className="text-[#8a8a8a] hover:text-[#f1f1f1] text-sm transition-colors">
                                    Suporte
                                </Link>
                            </li>
                            <li>
                                <Link href="/login" className="text-[#8a8a8a] hover:text-[#f1f1f1] text-sm transition-colors">
                                    Entrar
                                </Link>
                            </li>
                        </ul>
                    </nav>

                    <div>
                        <h3 className="text-[#f1f1f1] text-sm font-semibold mb-3">Redes sociais</h3>
                        <ul className="space-y-2">
                            <li>
                                <a href="#" className="text-[#8a8a8a] hover:text-[#f1f1f1] text-sm transition-colors flex items-center gap-2">
                                    <span aria-hidden="true"></span> Instagram
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-[#8a8a8a] hover:text-[#f1f1f1] text-sm transition-colors flex items-center gap-2">
                                    <span aria-hidden="true"></span> Twitter / X
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-[#8a8a8a] hover:text-[#f1f1f1] text-sm transition-colors flex items-center gap-2">
                                    <span aria-hidden="true"></span> LinkedIn
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-[#1e2430] mt-8 pt-6 text-center">
                    <p className="text-xs text-[#8a8a8a]">© {new Date().getFullYear()} ArturFlix. Todos os direitos reservados.</p>
                </div>
            </div>
        </footer>
    )
}
