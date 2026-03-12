# ArturFlix Frontend Redesign — Spec

**Date:** 2026-03-12
**Stack:** Laravel 12 + Inertia.js + React + Tailwind CSS
**Approach:** Dark editorial — tipografia bold, cards com bordas sutis, acentos em `#E50914` só nos CTAs principais.

---

## Paleta e tokens visuais

| Token | Valor |
|---|---|
| bg-base | `#0d1017` |
| bg-surface | `#12151b` |
| bg-elevated | `#171b23` |
| border | `#1e2430` |
| text-primary | `#f1f1f1` |
| text-muted | `#8a8a8a` |
| accent | `#E50914` |
| accent-hover | `#c20710` |

Fonte de marca: **Bebas Neue** (já em uso via `style` inline). Corpo: sistema sans-serif (Tailwind default).

---

## Layouts

### GuestLayout (`layouts/GuestLayout.tsx`) — já existe
Envolve páginas públicas. Estrutura: `<div> → <Navbar /> → <main> → children → <Footer /></div>`. Background `#0d1017`.

### AppLayout (`layouts/AppLayout.tsx`) — já existe
Idêntico ao GuestLayout. Usado no Dashboard (rota protegida por `auth` middleware).

### Standalone (Login e Register)
Não usa GuestLayout. Renderiza direto: `<main className="min-h-screen flex items-center justify-center bg-[#0d1017]">` com card centralizado. Sem Navbar e sem Footer.

---

## Componentes de layout

### Navbar (`components/layout/Navbar.tsx`) — refinar existente
- Fixed top, `bg-[#0d1017]/90 backdrop-blur-md`, border-bottom `#1e2430`
- Auth state via `usePage<PageProps>().props.auth.user` (padrão já em uso)
- Logo: `<img src="/logo-arturflix.png">` (substituir o texto atual)
- Links "Cursos" e "Suporte" no centro, `hidden md:flex`
- Mobile: links do centro são ocultados — sem hamburger menu (escopo mínimo)
- Guest: "Entrar" (link) + "Cadastrar" (botão vermelho)
- Auth: nome do usuário + botão "Sair" (POST `/logout`)

### Footer (`components/layout/Footer.tsx`) — reescrever
- Elemento semântico `<footer>`
- 3 colunas: (1) `<img>` logo + tagline | (2) `<nav>` com links Cursos, Suporte, Login | (3) links de redes sociais: Instagram, Twitter, LinkedIn (texto + ícone Unicode, links `#`)
- Border-top `#1e2430`

---

## Padrão de validação JS (compartilhado entre Login, Register, Suporte)

- Validação ocorre `onBlur` (ao sair do campo) e `onChange` após primeiro blur
- Estado de erro: border `#E50914` + `<span>` de erro abaixo do input, texto `text-red-400 text-xs`
- Estado válido: border `#1e2430` (neutro, sem verde)
- Senha mínimo: **8 chars** (alinhado com validação do backend)
- Formato email: regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Validação é client-side apenas (não bloqueia submit ao servidor — o servidor valida de novo)

---

## Padrão de loading de formulários

- Botão de submit: `disabled` + texto muda para "Enviando..." durante `processing`
- Apenas nos forms de Login e Register (que usam `useForm` do Inertia)
- Form de Suporte: simulado com `useState`, botão fica desabilitado por 1.5s e exibe mensagem de sucesso

---

## Páginas

### Home (`Pages/Welcome.tsx`)

Seções dentro de `<GuestLayout>`:

1. **Hero** — `<header role="banner">`
   - `<img src="/logo-arturflix.png">` centralizado, `max-w-xs`
   - Headline `<h1>`: "Aprenda. Evolua. Seja certificado."
   - Subtítulo `<p>`: "A plataforma de cursos online com gamificação, vídeos legendados e certificados reconhecidos."
   - 2 CTAs: "Explorar cursos" → `/cursos` (outline: border `#E50914`, texto `#E50914`) | "Cadastrar grátis" → `/register` (filled: bg `#E50914`)

2. **Features** — `<section>` com grid de 3 `<article>` cards
   - Card 1: ícone (emoji 🎮), título "Plataforma Gamificada", descrição "Ganhe XP, suba no ranking e desbloqueie conquistas a cada aula concluída."
   - Card 2: ícone (emoji 🎬), título "Vídeos com Legendas", descrição "Todos os conteúdos com legendas em português para melhor compreensão."
   - Card 3: ícone (emoji 📜), título "Certificados Digitais", descrição "Emita certificados reconhecidos ao concluir qualquer curso da plataforma."
   - Card bg `#12151b`, border `#1e2430`, border-radius `xl`

3. **Como funciona** — `<section>` com 3 passos em grid
   - Passo 1: número "01" em destaque + "Cadastre-se grátis"
   - Passo 2: "02" + "Escolha um curso"
   - Passo 3: "03" + "Ganhe seu certificado"

4. **CTA final** — `<section>` banner bg `#12151b`, border `#1e2430`
   - Headline: "Pronto para começar?"
   - Botão "Criar conta grátis" → `/register`

---

### Cursos (`Pages/Cursos/Index.tsx`)

- `<header>`: `<h1>` "Cursos" + `<p>` subtítulo
- Pills de categoria: botões visuais sem comportamento — "Todos" (ativo: bg `#E50914`), "Frontend", "Backend", "Design", "DevOps"
- Grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` com 6 `<article>` cards mockup

**Dados mockup dos 6 cursos (hardcoded no componente):**
| # | Título | Categoria | Nível | Instrutor | Duração | Aulas | Cor thumbnail |
|---|---|---|---|---|---|---|---|
| 1 | React do Zero ao Avançado | Frontend | Avançado | Ana Lima | 32h | 48 | `#1a1a2e` |
| 2 | Laravel 12 Completo | Backend | Intermediário | Carlos Mendes | 28h | 42 | `#0f3460` |
| 3 | UI/UX Design na Prática | Design | Iniciante | Fernanda Costa | 20h | 30 | `#1b1b2f` |
| 4 | Docker e DevOps | DevOps | Intermediário | Rafael Souza | 24h | 36 | `#16213e` |
| 5 | TypeScript Essencial | Frontend | Iniciante | Mariana Alves | 16h | 24 | `#0d2137` |
| 6 | Node.js e APIs REST | Backend | Avançado | Pedro Nunes | 30h | 45 | `#1a0a2e` |

**Card:** thumbnail (div colorida + emoji do domínio), badge nível, `<h2>` título, instrutor, duração/aulas, botão "Ver curso" (outline).

---

### Suporte (`Pages/Suporte/Index.tsx`)

- `<header>`: `<h1>` "Suporte" + subtítulo
- 3 `<article>` cards de contato: FAQ (link `#`), Email (`mailto:suporte@arturflix.com`), Discord (link `#`)
- `<form>` de contato:
  - Nome: `<input type="text" required minlength="2">`
  - E-mail: `<input type="email" required>`
  - Assunto: `<select required>` — Dúvida técnica, Cobrança, Sugestão, Outro
  - Mensagem: `<textarea required minlength="10">`
  - Submit: "Enviar mensagem"
  - **Submit é simulado** (sem rota backend): `useState` → loading 1.5s → exibe card de sucesso "Mensagem enviada! Retornaremos em até 24h."
  - Validação JS `onBlur` conforme padrão acima

---

### Login (`Pages/Auth/Login.tsx`) — refinar existente

- Substituir texto "ARTURFLIX" por `<img src="/logo-arturflix.png">`
- Validação JS `onBlur`: email formato + senha 8+ chars
- Estados de erro inline (padrão acima)
- Loading state no botão via `processing` do `useForm`
- POST real para `/login` via Inertia `useForm`

---

### Register (`Pages/Auth/Register.tsx`) — refinar/criar

- Mesmo visual do Login (card centralizado, standalone)
- Campos: Nome, E-mail, Senha, Confirmar Senha
- Validação JS:
  - Nome: 2+ chars
  - Email: regex formato
  - Senha: 8+ chars + indicador de força (3 barrinhas coloridas): Fraca (< 8 ou só letras) = vermelho, Média (8+ com letras+números) = amarelo, Forte (8+ com letras+números+especial) = verde
  - Confirmar senha: verifica igualdade em tempo real
- POST real para `/register` via Inertia `useForm`

---

### Dashboard (`Pages/Dashboard.tsx`) — refinar existente

Dados todos mockup estáticos (hardcoded). Único dado real: `auth.user.name` via `usePage<PageProps>().props`.

**Stats bar (3 `<article>` cards):**
- ⚡ XP Acumulado: 1.240
- 🏆 Cursos Concluídos: 3
- 📜 Certificados: 2

**"Meus cursos em andamento" (3 cards mockup):**
| Título | Progresso |
|---|---|
| React do Zero ao Avançado | 65% |
| Laravel 12 Completo | 30% |
| TypeScript Essencial | 90% |

Cada card: thumbnail colorida, título, `<progress>` ou div de barra, percentual, botão "Continuar".

---

## Requisitos de avaliação — mapeamento

| Critério | Atendimento |
|---|---|
| 5+ páginas | 6 páginas: Home, Cursos, Suporte, Login, Register, Dashboard |
| Tela de login | `/login` funcional com POST real |
| Visual amigável | Dark editorial, hierarquia tipográfica, cards bem construídos |
| HTML5 semântico | `<nav>`, `<header>`, `<footer>`, `<main>`, `<section>`, `<article>`, `<div>`, `<span>` |
| Formulários corretos | Login (email+password POST), Register (4 campos POST), Suporte (text+email+select+textarea) |
| JavaScript extra | Validação em tempo real em Login, Register e Suporte |

---

## Notas de implementação

- Nenhuma rota nova ou controller necessário — tudo já existe em `routes/web.php`
- Ícones: usar emojis Unicode (sem biblioteca de ícones adicional)
- Após qualquer edição PHP: `vendor/bin/pint --dirty --format agent`
- Ao final: `npm run build` para validar bundle
