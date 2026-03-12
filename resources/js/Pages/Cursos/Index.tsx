import { Head } from '@inertiajs/react'
import GuestLayout from '@/layouts/GuestLayout'

interface Course {
    id: number
    title: string
    category: string
    level: 'Iniciante' | 'Intermediário' | 'Avançado'
    instructor: string
    duration: string
    lessons: number
    color: string
    icon: string
}

const COURSES: Course[] = [
    { id: 1, title: 'React do Zero ao Avançado', category: 'Frontend', level: 'Avançado', instructor: 'Ana Lima', duration: '32h', lessons: 48, color: '#1a1a2e', icon: '⚛️' },
    { id: 2, title: 'Laravel 12 Completo', category: 'Backend', level: 'Intermediário', instructor: 'Carlos Mendes', duration: '28h', lessons: 42, color: '#0f3460', icon: '🔴' },
    { id: 3, title: 'UI/UX Design na Prática', category: 'Design', level: 'Iniciante', instructor: 'Fernanda Costa', duration: '20h', lessons: 30, color: '#1b1b2f', icon: '🎨' },
    { id: 4, title: 'Docker e DevOps', category: 'DevOps', level: 'Intermediário', instructor: 'Rafael Souza', duration: '24h', lessons: 36, color: '#16213e', icon: '🐳' },
    { id: 5, title: 'TypeScript Essencial', category: 'Frontend', level: 'Iniciante', instructor: 'Mariana Alves', duration: '16h', lessons: 24, color: '#0d2137', icon: '🔷' },
    { id: 6, title: 'Node.js e APIs REST', category: 'Backend', level: 'Avançado', instructor: 'Pedro Nunes', duration: '30h', lessons: 45, color: '#1a0a2e', icon: '🟢' },
]

const LEVEL_COLORS: Record<Course['level'], string> = {
    'Iniciante': 'bg-green-950 text-green-400 border border-green-900',
    'Intermediário': 'bg-yellow-950 text-yellow-400 border border-yellow-900',
    'Avançado': 'bg-red-950 text-red-400 border border-red-900',
}

const CATEGORIES = ['Todos', 'Frontend', 'Backend', 'Design', 'DevOps']

export default function CursosIndex() {
    return (
        <GuestLayout>
            <Head title="Cursos" />

            <div className="max-w-6xl mx-auto px-6 py-12">
                <header className="mb-10">
                    <h1 className="text-4xl font-bold text-[#f1f1f1] mb-2">Cursos</h1>
                    <p className="text-[#8a8a8a]">Explore nossa biblioteca e comece a aprender no seu ritmo.</p>
                </header>

                {/* Filtros */}
                <div className="flex flex-wrap gap-2 mb-8" role="group" aria-label="Filtrar por categoria">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            type="button"
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                                cat === 'Todos'
                                    ? 'bg-[#E50914] text-white'
                                    : 'bg-[#12151b] border border-[#1e2430] text-[#8a8a8a] hover:text-[#f1f1f1] hover:border-[#E50914]'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Grid de cursos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {COURSES.map((course) => (
                        <article
                            key={course.id}
                            className="bg-[#12151b] border border-[#1e2430] rounded-xl overflow-hidden hover:border-[#E50914]/40 transition-colors group"
                        >
                            {/* Thumbnail */}
                            <div
                                className="h-36 flex items-center justify-center"
                                style={{ backgroundColor: course.color }}
                            >
                                <span className="text-5xl" aria-hidden="true">{course.icon}</span>
                            </div>

                            <div className="p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LEVEL_COLORS[course.level]}`}>
                                        {course.level}
                                    </span>
                                    <span className="text-xs text-[#8a8a8a]">{course.category}</span>
                                </div>

                                <h2 className="text-[#f1f1f1] font-semibold text-sm leading-snug mb-3 group-hover:text-white">
                                    {course.title}
                                </h2>

                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-6 h-6 rounded-full bg-[#1e2430] flex items-center justify-center text-xs">
                                        {course.instructor.charAt(0)}
                                    </div>
                                    <span className="text-[#8a8a8a] text-xs">{course.instructor}</span>
                                </div>

                                <div className="flex items-center justify-between text-xs text-[#8a8a8a] mb-4">
                                    <span>⏱ {course.duration}</span>
                                    <span>📚 {course.lessons} aulas</span>
                                </div>

                                <button
                                    type="button"
                                    className="w-full py-2 rounded-lg border border-[#E50914] text-[#E50914] hover:bg-[#E50914]/10 text-xs font-medium transition-colors"
                                >
                                    Ver curso
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </GuestLayout>
    )
}
