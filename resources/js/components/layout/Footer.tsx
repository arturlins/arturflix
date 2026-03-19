import { Link } from '@inertiajs/react'

export function Footer() {
    return (
        <footer className="border-t border-[#1e2430] bg-[#0d1017] mt-auto">
            <div className="max-w-6xl mx-auto px-6 py-10">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                    <div>
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
                        <ul className="space-y-3">
                            <li>
                                <a href="#" className="group text-[#8a8a8a] hover:text-[#f1f1f1] text-sm transition-colors flex items-center gap-2">
                                    <img
                                        src="/instagram.svg"
                                        alt=""
                                        className="w-5 h-5 brightness-0 invert opacity-70 group-hover:opacity-100 transition-opacity"
                                    />
                                    Instagram
                                </a>
                            </li>
                            <li>
                                <a href="#" className="group text-[#8a8a8a] hover:text-[#f1f1f1] text-sm transition-colors flex items-center gap-2">
                                    <img
                                        src="/twitter.svg"
                                        alt=""
                                        className="w-5 h-5 brightness-0 invert opacity-70 group-hover:opacity-100 transition-opacity"
                                    />
                                    Twitter / X
                                </a>
                            </li>
                            <li>
                                <a href="#" className="group text-[#8a8a8a] hover:text-[#f1f1f1] text-sm transition-colors flex items-center gap-2">
                                    <img
                                        src="/linkedin.svg"
                                        alt=""
                                        className="w-5 h-5 brightness-0 invert opacity-70 group-hover:opacity-100 transition-opacity"
                                    />
                                    LinkedIn
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-[#1e2430] mt-8 pt-6 text-center">
                    <p className="text-xs text-[#8a8a8a]">© {new Date().getFullYear()} Arturflix. Todos os direitos reservados.</p>
                </div>
            </div>
        </footer>
    )
}