# ArturFlix Frontend Redesign — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir todas as páginas do frontend ArturFlix (Home, Cursos, Suporte, Login, Register, Dashboard) com visual dark editorial, HTML5 semântico e validação JS em tempo real.

**Architecture:** Cada página é um componente React servido via Inertia.js. Dados de cursos são mockup hardcoded nos componentes. Validação JS é client-side via `useState` + `onBlur`. Nenhuma rota nova é criada.

**Tech Stack:** React 18, Inertia.js, Tailwind CSS v4 (CSS-first, `@theme` no `app.css`), TypeScript, Laravel 12 (backend existente).

**Spec:** `docs/superpowers/specs/2026-03-12-frontend-redesign.md`

---

## Chunk 1: Foundation — Fonte local + tokens Tailwind

**Files:**
- Modify: `resources/css/app.css`
- Modify: `resources/js/components/layout/Navbar.tsx`
- Modify: `resources/js/components/layout/Footer.tsx`
- Create: `public/fonts/` (diretório para o arquivo de fonte)

---

### Task 1: Baixar e configurar Bebas Neue localmente

- [ ] **Step 1: Baixar o arquivo de fonte**

  Acesse `https://fonts.google.com/specimen/Bebas+Neue`, clique em "Download family" e extraia o ZIP. Pegue o arquivo `BebasNeue-Regular.ttf`.

  Converta para `.woff2` usando uma ferramenta local ou serviço offline (ex: `woff2_compress BebasNeue-Regular.ttf`). Salve como `public/fonts/bebas-neue.woff2`.

  > Alternativa rápida: baixar diretamente via URL estática do Google Fonts static server (já em cache CDN, sem tracking): `https://fonts.gstatic.com/s/bebasneuepro/v3/...` — mas o usuário pediu arquivo local. Use o método TTF → woff2 acima.

- [ ] **Step 2: Declarar `@font-face` e `font-brand` no `app.css`**

  Abrir `resources/css/app.css` e adicionar:

  ```css
  @import "tailwindcss";

  @font-face {
      font-family: 'Bebas Neue';
      src: url('/fonts/bebas-neue.woff2') format('woff2');
      font-weight: 400;
      font-style: normal;
      font-display: swap;
  }

  @theme {
      --font-brand: 'Bebas Neue', Impact, sans-serif;
  }
  ```

  Isso cria a classe utilitária `font-brand` automaticamente no Tailwind v4.

- [ ] **Step 3: Verificar build**

  ```bash
  npm run build
  ```

  Esperado: build sem erros. O arquivo `public/fonts/bebas-neue.woff2` deve ser servido corretamente.

---

### Task 2: Refinar Navbar

- [ ] **Step 1: Atualizar `resources/js/components/layout/Navbar.tsx`**

  Substituir o texto "ARTURFLIX" pelo logo img e usar `font-brand` no lugar de `style` inline:

  ```tsx
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
              className="fixed top-0 w-full z-50 bg-[#0d1017]/90 backdrop-blur-md border-b border-[#1e2430]"
          >
              <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
                  <Link href="/" aria-label="ArturFlix — página inicial">
                      <img
                          src="/logo-arturflix.png"
                          alt="ArturFlix"
                          className="h-7 w-auto"
                      />
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
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add resources/css/app.css resources/js/components/layout/Navbar.tsx public/fonts/
  git commit -m "feat: configure Bebas Neue local font and update Navbar logo"
  ```

---

### Task 3: Reconstruir Footer

- [ ] **Step 1: Reescrever `resources/js/components/layout/Footer.tsx`**

  ```tsx
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
                                      <span aria-hidden="true">📸</span> Instagram
                                  </a>
                              </li>
                              <li>
                                  <a href="#" className="text-[#8a8a8a] hover:text-[#f1f1f1] text-sm transition-colors flex items-center gap-2">
                                      <span aria-hidden="true">🐦</span> Twitter / X
                                  </a>
                              </li>
                              <li>
                                  <a href="#" className="text-[#8a8a8a] hover:text-[#f1f1f1] text-sm transition-colors flex items-center gap-2">
                                      <span aria-hidden="true">💼</span> LinkedIn
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
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add resources/js/components/layout/Footer.tsx
  git commit -m "feat: rebuild Footer with 3-column layout and semantic HTML"
  ```

---

## Chunk 2: Home Page

**Files:**
- Modify: `resources/js/Pages/Welcome.tsx`

---

### Task 4: Construir a Home

- [ ] **Step 1: Reescrever `resources/js/Pages/Welcome.tsx`**

  ```tsx
  import { Head, Link } from '@inertiajs/react'
  import GuestLayout from '@/layouts/GuestLayout'

  export default function Welcome() {
      return (
          <GuestLayout>
              <Head title="ArturFlix — Aprenda. Evolua. Seja certificado." />

              {/* Hero */}
              <header role="banner" className="flex flex-col items-center justify-center text-center px-6 pt-24 pb-20">
                  <img
                      src="/logo-arturflix.png"
                      alt="ArturFlix"
                      className="h-16 w-auto mb-8"
                  />
                  <h1 className="text-4xl sm:text-6xl font-bold text-[#f1f1f1] leading-tight max-w-3xl">
                      Aprenda. Evolua.{' '}
                      <span className="text-[#E50914]">Seja certificado.</span>
                  </h1>
                  <p className="text-[#8a8a8a] text-lg mt-5 max-w-xl">
                      A plataforma de cursos online com gamificação, vídeos legendados
                      e certificados digitais reconhecidos.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 mt-8">
                      <Link
                          href="/cursos"
                          className="px-8 py-3 rounded-lg border border-[#E50914] text-[#E50914] hover:bg-[#E50914]/10 transition-colors font-medium text-sm"
                      >
                          Explorar cursos
                      </Link>
                      <Link
                          href="/register"
                          className="px-8 py-3 rounded-lg bg-[#E50914] hover:bg-[#c20710] text-white transition-colors font-medium text-sm"
                      >
                          Cadastrar grátis
                      </Link>
                  </div>
              </header>

              {/* Features */}
              <section className="max-w-6xl mx-auto px-6 py-16">
                  <h2 className="sr-only">Diferenciais da plataforma</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      {[
                          {
                              icon: '🎮',
                              title: 'Plataforma Gamificada',
                              description: 'Ganhe XP, suba no ranking e desbloqueie conquistas a cada aula concluída.',
                          },
                          {
                              icon: '🎬',
                              title: 'Vídeos com Legendas',
                              description: 'Todos os conteúdos com legendas em português para melhor compreensão.',
                          },
                          {
                              icon: '📜',
                              title: 'Certificados Digitais',
                              description: 'Emita certificados reconhecidos ao concluir qualquer curso da plataforma.',
                          },
                      ].map(({ icon, title, description }) => (
                          <article
                              key={title}
                              className="bg-[#12151b] border border-[#1e2430] rounded-xl p-6"
                          >
                              <span className="text-3xl mb-4 block" aria-hidden="true">{icon}</span>
                              <h3 className="text-[#f1f1f1] font-semibold text-base mb-2">{title}</h3>
                              <p className="text-[#8a8a8a] text-sm leading-relaxed">{description}</p>
                          </article>
                      ))}
                  </div>
              </section>

              {/* Como funciona */}
              <section className="max-w-6xl mx-auto px-6 py-16 border-t border-[#1e2430]">
                  <h2 className="text-[#f1f1f1] text-2xl font-bold text-center mb-12">Como funciona</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                      {[
                          { num: '01', title: 'Cadastre-se grátis', desc: 'Crie sua conta em menos de 1 minuto, sem cartão de crédito.' },
                          { num: '02', title: 'Escolha um curso', desc: 'Explore nossa biblioteca e comece a aprender no seu ritmo.' },
                          { num: '03', title: 'Ganhe seu certificado', desc: 'Conclua o curso e emita seu certificado digital instantaneamente.' },
                      ].map(({ num, title, desc }) => (
                          <div key={num} className="flex flex-col items-center text-center">
                              <span className="font-brand text-6xl text-[#E50914]/30 leading-none mb-3">{num}</span>
                              <h3 className="text-[#f1f1f1] font-semibold mb-2">{title}</h3>
                              <p className="text-[#8a8a8a] text-sm leading-relaxed">{desc}</p>
                          </div>
                      ))}
                  </div>
              </section>

              {/* CTA final */}
              <section className="max-w-6xl mx-auto px-6 py-16">
                  <div className="bg-[#12151b] border border-[#1e2430] rounded-2xl px-8 py-12 text-center">
                      <h2 className="text-[#f1f1f1] text-3xl font-bold mb-3">Pronto para começar?</h2>
                      <p className="text-[#8a8a8a] mb-8">Junte-se a milhares de alunos e comece a aprender hoje.</p>
                      <Link
                          href="/register"
                          className="inline-block px-10 py-3 bg-[#E50914] hover:bg-[#c20710] text-white rounded-lg font-medium transition-colors"
                      >
                          Criar conta grátis
                      </Link>
                  </div>
              </section>
          </GuestLayout>
      )
  }
  ```

- [ ] **Step 2: Verificar no browser** — abrir `/` e confirmar que todas as 4 seções aparecem corretamente.

- [ ] **Step 3: Commit**

  ```bash
  git add resources/js/Pages/Welcome.tsx
  git commit -m "feat: build Home page with hero, features, how-it-works and CTA sections"
  ```

---

## Chunk 3: Cursos Page

**Files:**
- Modify: `resources/js/Pages/Cursos/Index.tsx`

---

### Task 5: Construir a página de Cursos

- [ ] **Step 1: Reescrever `resources/js/Pages/Cursos/Index.tsx`**

  ```tsx
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
  ```

- [ ] **Step 2: Verificar no browser** — abrir `/cursos` e confirmar o grid de 6 cards.

- [ ] **Step 3: Commit**

  ```bash
  git add resources/js/Pages/Cursos/Index.tsx
  git commit -m "feat: build Cursos page with 6 mockup course cards and category filters"
  ```

---

## Chunk 4: Suporte Page

**Files:**
- Modify: `resources/js/Pages/Suporte/Index.tsx`

---

### Task 6: Construir a página de Suporte

- [ ] **Step 1: Reescrever `resources/js/Pages/Suporte/Index.tsx`**

  ```tsx
  import { Head } from '@inertiajs/react'
  import { useState } from 'react'
  import GuestLayout from '@/layouts/GuestLayout'

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  interface FormState {
      name: string
      email: string
      subject: string
      message: string
  }

  interface FormErrors {
      name?: string
      email?: string
      subject?: string
      message?: string
  }

  export default function SuporteIndex() {
      const [form, setForm] = useState<FormState>({ name: '', email: '', subject: '', message: '' })
      const [errors, setErrors] = useState<FormErrors>({})
      const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({})
      const [loading, setLoading] = useState(false)
      const [success, setSuccess] = useState(false)

      function validate(field: keyof FormState, value: string): string | undefined {
          if (field === 'name' && value.trim().length < 2) return 'Nome deve ter pelo menos 2 caracteres.'
          if (field === 'email' && !EMAIL_REGEX.test(value)) return 'Informe um e-mail válido.'
          if (field === 'subject' && !value) return 'Selecione um assunto.'
          if (field === 'message' && value.trim().length < 10) return 'Mensagem deve ter pelo menos 10 caracteres.'
          return undefined
      }

      function handleBlur(field: keyof FormState) {
          setTouched((prev) => ({ ...prev, [field]: true }))
          setErrors((prev) => ({ ...prev, [field]: validate(field, form[field]) }))
      }

      function handleChange(field: keyof FormState, value: string) {
          setForm((prev) => ({ ...prev, [field]: value }))
          if (touched[field]) {
              setErrors((prev) => ({ ...prev, [field]: validate(field, value) }))
          }
      }

      function handleSubmit(e: React.FormEvent) {
          e.preventDefault()
          const newErrors: FormErrors = {}
          ;(Object.keys(form) as (keyof FormState)[]).forEach((field) => {
              const err = validate(field, form[field])
              if (err) newErrors[field] = err
          })
          setErrors(newErrors)
          setTouched({ name: true, email: true, subject: true, message: true })
          if (Object.keys(newErrors).length > 0) return

          setLoading(true)
          setTimeout(() => {
              setLoading(false)
              setSuccess(true)
          }, 1500)
      }

      const inputClass = (field: keyof FormState) =>
          `w-full bg-[#171b23] border rounded-lg px-3 py-2.5 text-sm text-[#f1f1f1] placeholder:text-[#555] focus:outline-none transition-colors ${
              touched[field] && errors[field]
                  ? 'border-[#E50914]'
                  : 'border-[#1e2430] focus:border-[#E50914]'
          }`

      return (
          <GuestLayout>
              <Head title="Suporte" />

              <div className="max-w-6xl mx-auto px-6 py-12">
                  <header className="mb-12">
                      <h1 className="text-4xl font-bold text-[#f1f1f1] mb-2">Suporte</h1>
                      <p className="text-[#8a8a8a]">Estamos aqui para ajudar. Entre em contato pelo canal de sua preferência.</p>
                  </header>

                  {/* Cards de contato */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-14">
                      {[
                          { icon: '❓', title: 'FAQ', desc: 'Respostas para as dúvidas mais comuns.', link: '#', label: 'Acessar FAQ' },
                          { icon: '✉️', title: 'E-mail', desc: 'Respondemos em até 24 horas úteis.', link: 'mailto:suporte@arturflix.com', label: 'Enviar e-mail' },
                          { icon: '💬', title: 'Discord', desc: 'Comunidade ativa de alunos e instrutores.', link: '#', label: 'Entrar no servidor' },
                      ].map(({ icon, title, desc, link, label }) => (
                          <article
                              key={title}
                              className="bg-[#12151b] border border-[#1e2430] rounded-xl p-6 text-center"
                          >
                              <span className="text-3xl mb-3 block" aria-hidden="true">{icon}</span>
                              <h2 className="text-[#f1f1f1] font-semibold mb-2">{title}</h2>
                              <p className="text-[#8a8a8a] text-sm mb-4">{desc}</p>
                              <a
                                  href={link}
                                  className="text-[#E50914] hover:text-[#c20710] text-sm font-medium transition-colors"
                              >
                                  {label} →
                              </a>
                          </article>
                      ))}
                  </div>

                  {/* Formulário */}
                  <section className="max-w-xl">
                      <h2 className="text-[#f1f1f1] text-2xl font-bold mb-6">Enviar mensagem</h2>

                      {success ? (
                          <div className="bg-green-950/40 border border-green-900/50 rounded-xl p-6 text-center">
                              <span className="text-3xl mb-3 block">✅</span>
                              <p className="text-green-400 font-medium">Mensagem enviada!</p>
                              <p className="text-[#8a8a8a] text-sm mt-1">Retornaremos em até 24 horas úteis.</p>
                          </div>
                      ) : (
                          <form onSubmit={handleSubmit} method="POST" noValidate className="space-y-4">
                              <div>
                                  <label htmlFor="name" className="block text-sm text-[#f1f1f1] mb-1.5">
                                      Nome <span className="text-[#E50914]">*</span>
                                  </label>
                                  <input
                                      id="name"
                                      type="text"
                                      value={form.name}
                                      onChange={(e) => handleChange('name', e.target.value)}
                                      onBlur={() => handleBlur('name')}
                                      placeholder="Seu nome"
                                      required
                                      minLength={2}
                                      className={inputClass('name')}
                                  />
                                  {touched.name && errors.name && (
                                      <span className="text-red-400 text-xs mt-1 block">{errors.name}</span>
                                  )}
                              </div>

                              <div>
                                  <label htmlFor="email" className="block text-sm text-[#f1f1f1] mb-1.5">
                                      E-mail <span className="text-[#E50914]">*</span>
                                  </label>
                                  <input
                                      id="email"
                                      type="email"
                                      value={form.email}
                                      onChange={(e) => handleChange('email', e.target.value)}
                                      onBlur={() => handleBlur('email')}
                                      placeholder="seu@email.com"
                                      required
                                      className={inputClass('email')}
                                  />
                                  {touched.email && errors.email && (
                                      <span className="text-red-400 text-xs mt-1 block">{errors.email}</span>
                                  )}
                              </div>

                              <div>
                                  <label htmlFor="subject" className="block text-sm text-[#f1f1f1] mb-1.5">
                                      Assunto <span className="text-[#E50914]">*</span>
                                  </label>
                                  <select
                                      id="subject"
                                      value={form.subject}
                                      onChange={(e) => handleChange('subject', e.target.value)}
                                      onBlur={() => handleBlur('subject')}
                                      required
                                      className={inputClass('subject')}
                                  >
                                      <option value="">Selecione um assunto</option>
                                      <option value="tecnico">Dúvida técnica</option>
                                      <option value="cobranca">Cobrança</option>
                                      <option value="sugestao">Sugestão</option>
                                      <option value="outro">Outro</option>
                                  </select>
                                  {touched.subject && errors.subject && (
                                      <span className="text-red-400 text-xs mt-1 block">{errors.subject}</span>
                                  )}
                              </div>

                              <div>
                                  <label htmlFor="message" className="block text-sm text-[#f1f1f1] mb-1.5">
                                      Mensagem <span className="text-[#E50914]">*</span>
                                  </label>
                                  <textarea
                                      id="message"
                                      rows={5}
                                      value={form.message}
                                      onChange={(e) => handleChange('message', e.target.value)}
                                      onBlur={() => handleBlur('message')}
                                      placeholder="Descreva sua dúvida ou problema..."
                                      required
                                      minLength={10}
                                      className={inputClass('message')}
                                  />
                                  {touched.message && errors.message && (
                                      <span className="text-red-400 text-xs mt-1 block">{errors.message}</span>
                                  )}
                              </div>

                              <button
                                  type="submit"
                                  disabled={loading}
                                  className="w-full bg-[#E50914] hover:bg-[#c20710] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg text-sm transition-colors mt-2"
                              >
                                  {loading ? 'Enviando...' : 'Enviar mensagem'}
                              </button>
                          </form>
                      )}
                  </section>
              </div>
          </GuestLayout>
      )
  }
  ```

- [ ] **Step 2: Verificar no browser** — abrir `/suporte`, testar validação dos campos e simular envio.

- [ ] **Step 3: Commit**

  ```bash
  git add resources/js/Pages/Suporte/Index.tsx
  git commit -m "feat: build Suporte page with contact cards and validated contact form"
  ```

---

## Chunk 5: Auth Pages (Login + Register)

**Files:**
- Modify: `resources/js/Pages/Auth/Login.tsx`
- Modify: `resources/js/Pages/Auth/Register.tsx`

---

### Task 7: Adicionar validação JS ao Login

- [ ] **Step 1: Reescrever `resources/js/Pages/Auth/Login.tsx`**

  ```tsx
  import { Head, Link, useForm } from '@inertiajs/react'
  import { useState } from 'react'

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  export default function Login() {
      const { data, setData, post, processing, errors } = useForm({
          email: '',
          password: '',
      })

      const [clientErrors, setClientErrors] = useState<{ email?: string; password?: string }>({})
      const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({})

      function validateField(field: 'email' | 'password', value: string): string | undefined {
          if (field === 'email' && !EMAIL_REGEX.test(value)) return 'Informe um e-mail válido.'
          if (field === 'password' && value.length < 8) return 'A senha deve ter pelo menos 8 caracteres.'
          return undefined
      }

      function handleBlur(field: 'email' | 'password') {
          setTouched((prev) => ({ ...prev, [field]: true }))
          setClientErrors((prev) => ({ ...prev, [field]: validateField(field, data[field]) }))
      }

      function handleChange(field: 'email' | 'password', value: string) {
          setData(field, value)
          if (touched[field]) {
              setClientErrors((prev) => ({ ...prev, [field]: validateField(field, value) }))
          }
      }

      function handleSubmit(e: React.FormEvent) {
          e.preventDefault()
          post('/login')
      }

      const inputClass = (field: 'email' | 'password') =>
          `w-full bg-[#171b23] border rounded-lg px-3 py-2.5 text-sm text-[#f1f1f1] placeholder:text-[#555] focus:outline-none transition-colors ${
              (touched[field] && clientErrors[field]) || errors[field]
                  ? 'border-[#E50914]'
                  : 'border-[#1e2430] focus:border-[#E50914]'
          }`

      return (
          <>
              <Head title="Login" />
              <main className="min-h-screen flex items-center justify-center px-4 bg-[#0d1017]">
                  <section className="w-full max-w-sm">
                      <div className="text-center mb-8">
                          <Link href="/" aria-label="ArturFlix — página inicial">
                              <img
                                  src="/logo-arturflix.png"
                                  alt="ArturFlix"
                                  className="h-10 w-auto mx-auto"
                              />
                          </Link>
                          <p className="text-[#8a8a8a] text-sm mt-3">Entre na sua conta</p>
                      </div>

                      <div className="bg-[#12151b] border border-[#1e2430] rounded-xl p-6">
                          {errors.email && (
                              <p className="text-red-400 text-sm mb-4 bg-red-950/30 border border-red-900/50 rounded-lg px-3 py-2">
                                  {errors.email}
                              </p>
                          )}

                          <form onSubmit={handleSubmit} noValidate className="space-y-4">
                              <div>
                                  <label htmlFor="email" className="block text-sm text-[#f1f1f1] mb-1.5">
                                      E-mail
                                  </label>
                                  <input
                                      id="email"
                                      type="email"
                                      value={data.email}
                                      onChange={(e) => handleChange('email', e.target.value)}
                                      onBlur={() => handleBlur('email')}
                                      placeholder="seu@email.com"
                                      required
                                      className={inputClass('email')}
                                  />
                                  {touched.email && clientErrors.email && (
                                      <span className="text-red-400 text-xs mt-1 block">{clientErrors.email}</span>
                                  )}
                              </div>

                              <div>
                                  <div className="flex items-center justify-between mb-1.5">
                                      <label htmlFor="password" className="block text-sm text-[#f1f1f1]">
                                          Senha
                                      </label>
                                      <Link
                                          href="/forgot-password"
                                          className="text-xs text-[#8a8a8a] hover:text-[#E50914] transition-colors"
                                      >
                                          Esqueceu?
                                      </Link>
                                  </div>
                                  <input
                                      id="password"
                                      type="password"
                                      value={data.password}
                                      onChange={(e) => handleChange('password', e.target.value)}
                                      onBlur={() => handleBlur('password')}
                                      placeholder="••••••••"
                                      required
                                      className={inputClass('password')}
                                  />
                                  {touched.password && clientErrors.password && (
                                      <span className="text-red-400 text-xs mt-1 block">{clientErrors.password}</span>
                                  )}
                              </div>

                              <button
                                  type="submit"
                                  disabled={processing}
                                  className="w-full bg-[#E50914] hover:bg-[#c20710] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg text-sm transition-colors mt-2"
                              >
                                  {processing ? 'Entrando...' : 'Entrar'}
                              </button>
                          </form>
                      </div>

                      <p className="text-center text-[#8a8a8a] text-sm mt-5">
                          Não tem conta?{' '}
                          <Link href="/register" className="text-[#f1f1f1] hover:text-[#E50914] transition-colors">
                              Cadastre-se
                          </Link>
                      </p>
                  </section>
              </main>
          </>
      )
  }
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add resources/js/Pages/Auth/Login.tsx
  git commit -m "feat: add real-time JS validation to Login page"
  ```

---

### Task 8: Adicionar validação JS ao Register

- [ ] **Step 1: Reescrever `resources/js/Pages/Auth/Register.tsx`**

  ```tsx
  import { Head, Link, useForm } from '@inertiajs/react'
  import { useState } from 'react'

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  type Field = 'name' | 'email' | 'password' | 'password_confirmation'

  function getPasswordStrength(password: string): { label: string; color: string; width: string } {
      if (password.length === 0) return { label: '', color: '', width: '0%' }
      const hasLetters = /[a-zA-Z]/.test(password)
      const hasNumbers = /[0-9]/.test(password)
      const hasSpecial = /[^a-zA-Z0-9]/.test(password)
      if (password.length >= 8 && hasLetters && hasNumbers && hasSpecial) {
          return { label: 'Forte', color: 'bg-green-500', width: '100%' }
      }
      if (password.length >= 8 && hasLetters && hasNumbers) {
          return { label: 'Média', color: 'bg-yellow-500', width: '66%' }
      }
      return { label: 'Fraca', color: 'bg-red-500', width: '33%' }
  }

  export default function Register() {
      const { data, setData, post, processing, errors } = useForm({
          name: '',
          email: '',
          password: '',
          password_confirmation: '',
      })

      const [clientErrors, setClientErrors] = useState<Partial<Record<Field, string>>>({})
      const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({})

      const strength = getPasswordStrength(data.password)

      function validateField(field: Field, value: string): string | undefined {
          if (field === 'name' && value.trim().length < 2) return 'Nome deve ter pelo menos 2 caracteres.'
          if (field === 'email' && !EMAIL_REGEX.test(value)) return 'Informe um e-mail válido.'
          if (field === 'password' && value.length < 8) return 'A senha deve ter pelo menos 8 caracteres.'
          if (field === 'password_confirmation' && value !== data.password) return 'As senhas não coincidem.'
          return undefined
      }

      function handleBlur(field: Field) {
          setTouched((prev) => ({ ...prev, [field]: true }))
          setClientErrors((prev) => ({ ...prev, [field]: validateField(field, field === 'password_confirmation' ? data.password_confirmation : data[field]) }))
      }

      function handleChange(field: Field, value: string) {
          setData(field, value)
          if (touched[field]) {
              setClientErrors((prev) => ({ ...prev, [field]: validateField(field, value) }))
          }
          // Revalidar confirmação quando senha muda
          if (field === 'password' && touched.password_confirmation) {
              setClientErrors((prev) => ({
                  ...prev,
                  password_confirmation: value !== data.password_confirmation ? 'As senhas não coincidem.' : undefined,
              }))
          }
      }

      function handleSubmit(e: React.FormEvent) {
          e.preventDefault()
          post('/register')
      }

      const inputClass = (field: Field) =>
          `w-full bg-[#171b23] border rounded-lg px-3 py-2.5 text-sm text-[#f1f1f1] placeholder:text-[#555] focus:outline-none transition-colors ${
              (touched[field] && clientErrors[field]) || errors[field as keyof typeof errors]
                  ? 'border-[#E50914]'
                  : 'border-[#1e2430] focus:border-[#E50914]'
          }`

      return (
          <>
              <Head title="Cadastro" />
              <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#0d1017]">
                  <section className="w-full max-w-sm">
                      <div className="text-center mb-8">
                          <Link href="/" aria-label="ArturFlix — página inicial">
                              <img
                                  src="/logo-arturflix.png"
                                  alt="ArturFlix"
                                  className="h-10 w-auto mx-auto"
                              />
                          </Link>
                          <p className="text-[#8a8a8a] text-sm mt-3">Crie sua conta gratuitamente</p>
                      </div>

                      <div className="bg-[#12151b] border border-[#1e2430] rounded-xl p-6">
                          {(errors.email || errors.password) && (
                              <div className="text-red-400 text-sm mb-4 bg-red-950/30 border border-red-900/50 rounded-lg px-3 py-2 space-y-1">
                                  {errors.email && <p>{errors.email}</p>}
                                  {errors.password && <p>{errors.password}</p>}
                              </div>
                          )}

                          <form onSubmit={handleSubmit} noValidate className="space-y-4">
                              {/* Nome */}
                              <div>
                                  <label htmlFor="name" className="block text-sm text-[#f1f1f1] mb-1.5">Nome completo</label>
                                  <input
                                      id="name"
                                      type="text"
                                      value={data.name}
                                      onChange={(e) => handleChange('name', e.target.value)}
                                      onBlur={() => handleBlur('name')}
                                      placeholder="Seu nome"
                                      required
                                      className={inputClass('name')}
                                  />
                                  {touched.name && clientErrors.name && (
                                      <span className="text-red-400 text-xs mt-1 block">{clientErrors.name}</span>
                                  )}
                              </div>

                              {/* Email */}
                              <div>
                                  <label htmlFor="email" className="block text-sm text-[#f1f1f1] mb-1.5">E-mail</label>
                                  <input
                                      id="email"
                                      type="email"
                                      value={data.email}
                                      onChange={(e) => handleChange('email', e.target.value)}
                                      onBlur={() => handleBlur('email')}
                                      placeholder="seu@email.com"
                                      required
                                      className={inputClass('email')}
                                  />
                                  {touched.email && clientErrors.email && (
                                      <span className="text-red-400 text-xs mt-1 block">{clientErrors.email}</span>
                                  )}
                              </div>

                              {/* Senha + força */}
                              <div>
                                  <label htmlFor="password" className="block text-sm text-[#f1f1f1] mb-1.5">Senha</label>
                                  <input
                                      id="password"
                                      type="password"
                                      value={data.password}
                                      onChange={(e) => handleChange('password', e.target.value)}
                                      onBlur={() => handleBlur('password')}
                                      placeholder="Mínimo 8 caracteres"
                                      required
                                      minLength={8}
                                      className={inputClass('password')}
                                  />
                                  {data.password.length > 0 && (
                                      <div className="mt-2">
                                          <div className="h-1 bg-[#1e2430] rounded-full overflow-hidden">
                                              <div
                                                  className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                                                  style={{ width: strength.width }}
                                              />
                                          </div>
                                          <span className="text-xs text-[#8a8a8a] mt-1 block">
                                              Força: <span className="text-[#f1f1f1]">{strength.label}</span>
                                          </span>
                                      </div>
                                  )}
                                  {touched.password && clientErrors.password && (
                                      <span className="text-red-400 text-xs mt-1 block">{clientErrors.password}</span>
                                  )}
                              </div>

                              {/* Confirmar senha */}
                              <div>
                                  <label htmlFor="password_confirmation" className="block text-sm text-[#f1f1f1] mb-1.5">Confirmar senha</label>
                                  <input
                                      id="password_confirmation"
                                      type="password"
                                      value={data.password_confirmation}
                                      onChange={(e) => handleChange('password_confirmation', e.target.value)}
                                      onBlur={() => handleBlur('password_confirmation')}
                                      placeholder="Repita a senha"
                                      required
                                      className={inputClass('password_confirmation')}
                                  />
                                  {touched.password_confirmation && clientErrors.password_confirmation && (
                                      <span className="text-red-400 text-xs mt-1 block">{clientErrors.password_confirmation}</span>
                                  )}
                              </div>

                              <button
                                  type="submit"
                                  disabled={processing}
                                  className="w-full bg-[#E50914] hover:bg-[#c20710] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg text-sm transition-colors mt-2"
                              >
                                  {processing ? 'Criando conta...' : 'Criar conta'}
                              </button>
                          </form>
                      </div>

                      <p className="text-center text-[#8a8a8a] text-sm mt-5">
                          Já tem conta?{' '}
                          <Link href="/login" className="text-[#f1f1f1] hover:text-[#E50914] transition-colors">
                              Entrar
                          </Link>
                      </p>
                  </section>
              </main>
          </>
      )
  }
  ```

- [ ] **Step 2: Verificar no browser** — testar indicador de força da senha e validação de confirmação em `/register`.

- [ ] **Step 3: Commit**

  ```bash
  git add resources/js/Pages/Auth/Register.tsx
  git commit -m "feat: add real-time JS validation and password strength indicator to Register"
  ```

---

## Chunk 6: Dashboard

**Files:**
- Modify: `resources/js/Pages/Dashboard.tsx`

---

### Task 9: Construir o Dashboard

- [ ] **Step 1: Reescrever `resources/js/Pages/Dashboard.tsx`**

  ```tsx
  import { Head, usePage } from '@inertiajs/react'
  import AppLayout from '@/layouts/AppLayout'
  import type { PageProps } from '@/types'

  const STATS = [
      { icon: '⚡', label: 'XP Acumulado', value: '1.240 XP' },
      { icon: '🏆', label: 'Cursos Concluídos', value: '3' },
      { icon: '📜', label: 'Certificados', value: '2' },
  ]

  const IN_PROGRESS = [
      { title: 'React do Zero ao Avançado', progress: 65, color: '#1a1a2e', icon: '⚛️' },
      { title: 'Laravel 12 Completo', progress: 30, color: '#0f3460', icon: '🔴' },
      { title: 'TypeScript Essencial', progress: 90, color: '#0d2137', icon: '🔷' },
  ]

  export default function Dashboard() {
      const { auth } = usePage<PageProps>().props

      return (
          <AppLayout>
              <Head title="Dashboard" />

              <div className="max-w-6xl mx-auto px-6 py-12">
                  <header className="mb-10">
                      <h1 className="text-3xl font-bold text-[#f1f1f1]">
                          Bem-vindo, <span className="text-[#E50914]">{auth.user?.name}</span>!
                      </h1>
                      <p className="text-[#8a8a8a] mt-1">Aqui está o seu progresso na plataforma.</p>
                  </header>

                  {/* Stats */}
                  <section className="mb-12" aria-label="Estatísticas do aluno">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {STATS.map(({ icon, label, value }) => (
                              <article
                                  key={label}
                                  className="bg-[#12151b] border border-[#1e2430] rounded-xl p-6 flex items-center gap-4"
                              >
                                  <span className="text-3xl" aria-hidden="true">{icon}</span>
                                  <div>
                                      <p className="text-[#8a8a8a] text-xs mb-0.5">{label}</p>
                                      <p className="text-[#f1f1f1] text-2xl font-bold">{value}</p>
                                  </div>
                              </article>
                          ))}
                      </div>
                  </section>

                  {/* Cursos em andamento */}
                  <section aria-label="Cursos em andamento">
                      <h2 className="text-[#f1f1f1] text-xl font-semibold mb-6">Meus cursos em andamento</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                          {IN_PROGRESS.map(({ title, progress, color, icon }) => (
                              <article
                                  key={title}
                                  className="bg-[#12151b] border border-[#1e2430] rounded-xl overflow-hidden"
                              >
                                  <div
                                      className="h-28 flex items-center justify-center"
                                      style={{ backgroundColor: color }}
                                  >
                                      <span className="text-4xl" aria-hidden="true">{icon}</span>
                                  </div>
                                  <div className="p-4">
                                      <h3 className="text-[#f1f1f1] text-sm font-semibold mb-3 leading-snug">{title}</h3>

                                      <div className="mb-1 flex items-center justify-between">
                                          <span className="text-xs text-[#8a8a8a]">Progresso</span>
                                          <span className="text-xs text-[#f1f1f1] font-medium">{progress}%</span>
                                      </div>
                                      <div className="h-1.5 bg-[#1e2430] rounded-full overflow-hidden mb-4">
                                          <div
                                              className="h-full bg-[#E50914] rounded-full"
                                              style={{ width: `${progress}%` }}
                                              role="progressbar"
                                              aria-valuenow={progress}
                                              aria-valuemin={0}
                                              aria-valuemax={100}
                                          />
                                      </div>

                                      <button
                                          type="button"
                                          className="w-full py-1.5 rounded-lg bg-[#E50914] hover:bg-[#c20710] text-white text-xs font-medium transition-colors"
                                      >
                                          Continuar
                                      </button>
                                  </div>
                              </article>
                          ))}
                      </div>
                  </section>
              </div>
          </AppLayout>
      )
  }
  ```

- [ ] **Step 2: Verificar no browser** — logar e acessar `/dashboard`, confirmar stats e cards de progresso.

- [ ] **Step 3: Commit**

  ```bash
  git add resources/js/Pages/Dashboard.tsx
  git commit -m "feat: build Dashboard with XP stats and courses-in-progress grid"
  ```

---

## Chunk 7: Build final e validação

---

### Task 10: Build e checklist final

- [ ] **Step 1: Rodar build de produção**

  ```bash
  npm run build
  ```

  Esperado: sem erros de TypeScript ou de módulos.

- [ ] **Step 2: Checklist de requisitos de avaliação**

  Verificar manualmente no browser:
  - [ ] Home (`/`) — 4 seções presentes, logo visível
  - [ ] Cursos (`/cursos`) — 6 cards com dados corretos
  - [ ] Suporte (`/suporte`) — form com validação JS funcionando (testar blur em cada campo)
  - [ ] Login (`/login`) — logo img, validação onBlur, POST funcional
  - [ ] Register (`/register`) — indicador de força, confirmação de senha, POST funcional
  - [ ] Dashboard (`/dashboard`) — stats + cards de progresso (requer login)
  - [ ] Navbar — logo img, links, toggle guest/auth
  - [ ] Footer — 3 colunas presentes
  - [ ] Fonte Bebas Neue carregando local (verificar Network tab, nenhuma req para fonts.google.com)

- [ ] **Step 3: Commit final**

  ```bash
  git add -A
  git commit -m "chore: final build validation — ArturFlix frontend redesign complete"
  ```
