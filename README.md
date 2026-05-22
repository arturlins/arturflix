<p align="center">
  <img src="public/img/logo.png" alt="ArturFlix Logo" width="300">
</p>

<p align="center">
  <strong>Plataforma de videoaulas inspirada na Netflix — mas feita para aprender de verdade.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Laravel-12-FF2D20?logo=laravel&logoColor=white" alt="Laravel 12">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black" alt="React 18">
  <img src="https://img.shields.io/badge/Inertia.js-2-6C63FF" alt="Inertia.js 2">
  <img src="https://img.shields.io/badge/PostgreSQL-18-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript 5">
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4">
  <img src="https://img.shields.io/badge/Pest-3-FF6B6B" alt="Pest 3">
</p>

---

## Sumário

1. [Sobre o projeto](#sobre-o-projeto)
2. [Demonstração das principais telas](#demonstração-das-principais-telas)
3. [Por que esse projeto existe](#por-que-esse-projeto-existe)
4. [Stack tecnológica e justificativa](#stack-tecnológica-e-justificativa)
5. [Arquitetura geral](#arquitetura-geral)
6. [Estrutura de pastas](#estrutura-de-pastas)
7. [Modelo de domínio](#modelo-de-domínio)
8. [Fluxos principais](#fluxos-principais)
9. [Página "Assistir aulas" + gamificação](#página-assistir-aulas--gamificação)
10. [Painel administrativo](#painel-administrativo)
11. [Importação de cursos do YouTube](#importação-de-cursos-do-youtube)
12. [Autenticação, autorização e segurança](#autenticação-autorização-e-segurança)
13. [Frontend e Design System](#frontend-e-design-system)
14. [Testes](#testes)
15. [Como rodar localmente](#como-rodar-localmente)
16. [Convenções de código](#convenções-de-código)
17. [Roadmap](#roadmap)
18. [Licença](#licença)

---

## Sobre o projeto

**ArturFlix** é uma plataforma completa de videoaulas construída com **Laravel 12 + React 18 + Inertia.js 2**, com banco **PostgreSQL** e tipagem ponta-a-ponta em **TypeScript**. O nome e a identidade visual são uma paródia divertida à Netflix; a aplicação por trás é séria — pensada para servir como projeto-portfólio que demonstra domínio de:

- **Arquitetura monolítica moderna** (Inertia, sem API REST separada) com camadas bem definidas (Controllers / Actions / Services / Queries).
- **Modelagem de domínio relacional não-trivial** (15 tabelas, FKs com `cascade`, índices compostos, slugs públicos via `public_id`).
- **Gamificação real** (XP por minuto consumido, nível derivado por raiz quadrada, histórico imutável).
- **Player de vídeo com retomada por segundo**, heartbeat de progresso e conclusão automática via YouTube IFrame API.
- **Importação automatizada de cursos** a partir de playlists do YouTube (Google API).
- **Painel admin completo** com reordenação drag-and-drop, gestão de cursos/módulos/aulas/usuários e atendimento a chamados.
- **Design system próprio** dark-first, tipografia editorial (Fraunces + Geist), foco em densidade de informação e leitura confortável.
- **Testes Pest** cobrindo happy path, falhas e edge cases.

> Stack: **PHP 8.4 · Laravel 12 · Inertia 2 · React 18 · TypeScript 5 · Tailwind CSS 4 · PostgreSQL 18 · Vite 6 · Pest 3**

---

## Demonstração das principais telas

| Tela | O que mostra |
|------|--------------|
| **Welcome** (`/`) | Landing dark-first com hero, destaques de cursos e CTA de cadastro. |
| **Catálogo** (`/cursos`) | Grid de cursos públicos com busca, badges de categoria e contador de aulas. |
| **Detalhe do curso** (`/cursos/{public_id}`) | Capa, descrição, lista de módulos/aulas com duração e CTA "Matricular" / "Continuar assistindo". |
| **Assistir aula** (`/cursos/{curso}/assistir/{aula?}`) | Player do YouTube embedado, sidebar com status (`✓` / `●` / `○`), seção de comentários com replies. |
| **Dashboard do aluno** (`/dashboard`) | XP total, nível atual, barra de progresso por curso matriculado, atalho para retomar a última aula. |
| **Perfil** (`/profile`) | Atualização de nome, e-mail, senha; exclusão de conta. |
| **Admin Dashboard** (`/admin`) | KPIs (cursos, usuários, chamados abertos), atalhos para criação rápida. |
| **Admin Cursos** (`/admin/cursos`) | CRUD completo, importar playlist do YouTube, drag-and-drop em módulos/aulas. |
| **Admin Chamados** (`/admin/suporte`) | Caixa de entrada de suporte, respostas e mudança de status. |

---

## Por que esse projeto existe

Construído como projeto pessoal/acadêmico para fechar o requisito de "site completo" com:

- **Domínio real** (educação online, não um clone de TODO).
- **Estado complexo** (matrículas, progresso por segundo, XP acumulado, threading de comentários).
- **Múltiplos perfis de usuário** (aluno, admin, superuser).
- **Integrações externas** (YouTube Data API v3, IFrame API, upload de anexos em chamados).
- **Decisões arquiteturais defensáveis** documentadas em [docs/superpowers/specs](docs/superpowers/specs/).

A barra é **world-class**: nenhuma escolha técnica foi feita por ser a "padrão" — toda decisão tem uma razão registrada nas specs ou neste README.

---

## Stack tecnológica e justificativa

| Camada | Tecnologia | Por que |
|--------|-----------|---------|
| **Linguagem backend** | PHP 8.4 | Tipagem nativa madura (enums, readonly, property promotion), perf de OPCache, ecossistema Composer. |
| **Framework backend** | Laravel 12 | Estrutura enxuta (sem `Http/Kernel`, middlewares declarativos em `bootstrap/app.php`), Eloquent expressivo, validação via Form Requests. |
| **Banco** | PostgreSQL 18 | Tipos ricos (timestamptz, jsonb, arrays), constraints reais, índices parciais, performance previsível em joins. |
| **SPA bridge** | Inertia.js 2 | Elimina API REST/GraphQL separada — controllers retornam props direto pro React. Auth por sessão (cookie httpOnly), sem token na localStorage. |
| **Frontend** | React 18 + TypeScript 5 | Tipagem das props compartilhadas em [resources/js/types/index.d.ts](resources/js/types/index.d.ts) garante contrato backend↔frontend. |
| **Estilização** | Tailwind CSS 4 (via `@tailwindcss/vite`) | Sem `tailwind.config.js` — tokens em CSS. Dark-first por padrão. |
| **UI primitives** | Base UI (`@base-ui/react`) + Headless UI + componentes próprios | Acessibilidade WAI-ARIA, sem dependência de libs pesadas (sem MUI/Chakra/etc). |
| **Ícones** | Lucide React | Stroke consistente, tree-shakeable. |
| **Drag-and-drop** | `@dnd-kit/core` + `@dnd-kit/sortable` | Reordenação de módulos e aulas no admin com acessibilidade de teclado. |
| **Toasts** | Sonner | Flash messages do Laravel viram toasts (incl. `+12 XP` ao concluir aula). |
| **Tipografia** | Fraunces Variable (display) + Geist Variable (UI) + Geist Mono (código) | Sensibilidade editorial, fugindo do clichê Inter/SF Pro. |
| **Rotas no JS** | Ziggy | `route('cursos.assistir', { curso: ... })` no React, com tipos. |
| **Bundler** | Vite 6 | HMR instantâneo, build com `tsc && vite build`. |
| **Gerenciador JS** | Bun | Mais rápido que npm/yarn/pnpm. (Nunca usar npm aqui.) |
| **Code style PHP** | Laravel Pint | Rodado com `vendor/bin/pint --dirty --format agent` antes de cada commit. |
| **Testes** | Pest 3 | Sintaxe `it('…', fn () => …)`, plugin Laravel para `actingAs`, `assertDatabaseHas` etc. |
| **YouTube API** | `google/apiclient` v2 | Importação de playlists com fallback de erros tipados ([app/Services/YouTube](app/Services/YouTube/)). |
| **Dev tooling** | Laravel Boost (MCP) + Pail (logs) + Sail (Docker opcional) | DX de primeira linha. |

---

## Arquitetura geral

```
                        ┌──────────────────────────────┐
                        │  Browser  (React + Inertia)  │
                        └──────────────┬───────────────┘
                                       │ HTTP (sessão)
                                       ▼
   ┌─────────────────────────────────────────────────────────────┐
   │                       Laravel 12                            │
   │                                                             │
   │   Routes (web.php)                                          │
   │      │                                                      │
   │      ▼                                                      │
   │   Middlewares (auth, admin, matriculado, verified)          │
   │      │                                                      │
   │      ▼                                                      │
   │   Form Requests  ───▶  Controllers                          │
   │                          │                                  │
   │                          ▼                                  │
   │                       Actions (single-purpose)              │
   │                          │                                  │
   │                          ▼                                  │
   │                       Services (orquestração)               │
   │                          │                                  │
   │                          ▼                                  │
   │                       Queries (Eloquent reutilizável)       │
   │                          │                                  │
   │                          ▼                                  │
   │                       Models (Eloquent)                     │
   │                          │                                  │
   │                          ▼                                  │
   │                       PostgreSQL                            │
   │                                                             │
   │   Inertia::render('Page', $props) ─▶ React (SSR-ready)      │
   └─────────────────────────────────────────────────────────────┘
```

### Princípios

1. **Sem API REST separada.** Inertia funde server e client num único ciclo de requisição. Menos contratos, menos serialização redundante, sem CORS.
2. **Sessão, não JWT.** Cookie `httpOnly`, `secure`, `sameSite=lax`. Sem token em `localStorage`.
3. **Controllers magros.** Validação fica em Form Requests; lógica de negócio em Actions; consultas complexas em Queries.
4. **Identificadores públicos opacos.** Toda entidade exposta na URL usa `public_id` (UUID v7) via trait [`HasPublicId`](app/Concerns/HasPublicId.php) — IDs auto-incrementais nunca vazam.
5. **Enums tipados.** [`PapelEnum`](app/Enums/PapelEnum.php), [`TipoAulaEnum`](app/Enums/TipoAulaEnum.php), [`StatusChamadoEnum`](app/Enums/StatusChamadoEnum.php) — chega de strings mágicas.
6. **Migrations versionadas.** Cada mudança de schema é uma migration nova; nada é editado retroativamente após deploy.

---

## Estrutura de pastas

```
arturflix/
├── app/
│   ├── Actions/                        # Operações de negócio (uma classe, um handle())
│   │   ├── Admin/                      #   ↳ Específicas do painel admin
│   │   ├── ImportPlaylistAsCurso.php   #   ↳ Importa playlist do YouTube como curso
│   │   └── MatricularUsuarioEmCurso.php
│   │
│   ├── Concerns/                       # Traits para Models (HasPublicId)
│   ├── Enums/                          # PapelEnum, TipoAulaEnum, StatusChamadoEnum
│   │
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Admin/                  # AdminCursoController, AdminAulaController, ...
│   │   │   ├── Auth/                   # Login, Register, ResetPassword, VerifyEmail
│   │   │   └── *.php                   # CursoController, DashboardController, ...
│   │   ├── Middleware/                 # EnsureUserIsAdmin, HandleInertiaRequests, ...
│   │   ├── Requests/                   # Form Requests por ação
│   │   └── Services/                   # Lógica HTTP (formatação, webhooks)
│   │
│   ├── Models/                         # 15 models Eloquent
│   ├── Policies/                       # Autorização por entidade
│   ├── Queries/                        # Eloquent query builders reutilizáveis
│   ├── Services/                       # Orquestração multi-Action
│   │   └── YouTube/                    #   ↳ YouTubePlaylistService, IsoDurationParser, ...
│   └── Traits/                         # Traits genéricos (não-Model)
│
├── bootstrap/
│   ├── app.php                         # Middlewares, exceptions, routing (Laravel 12)
│   └── providers.php
│
├── database/
│   ├── factories/                      # Factories Eloquent para testes
│   ├── migrations/                     # 20+ migrations versionadas
│   └── seeders/                        # AdminUserSeeder, CursoSeeder
│
├── docs/
│   └── superpowers/specs/              # Specs de features grandes (em PT-BR)
│
├── resources/
│   └── js/
│       ├── components/
│       │   ├── layout/                 # Navbar, Footer
│       │   └── ui/                     # button, card, dialog, dropdown-menu, ...
│       ├── hooks/                      # useYouTubePlayer, useFlash, ...
│       ├── layouts/                    # AppLayout, GuestLayout, AdminLayout
│       ├── lib/                        # utils, cn (tailwind-merge + clsx)
│       ├── Pages/
│       │   ├── Admin/                  # Cursos/, Modulos/, Aulas/, Usuarios/, Suporte/
│       │   ├── Auth/                   # Login, Register, ForgotPassword, ResetPassword
│       │   ├── Cursos/                 # Index, Show, Assistir (em implementação)
│       │   ├── Suporte/                # Index, Show
│       │   ├── Dashboard.tsx
│       │   └── Welcome.tsx
│       └── types/                      # index.d.ts (tipos compartilhados via Inertia)
│
├── routes/
│   ├── web.php                         # Todas as rotas (não há routes/api.php)
│   └── console.php
│
├── tests/
│   ├── Feature/                        # Pest — fluxo completo (HTTP + DB)
│   └── Unit/                           # Pest — lógica isolada
│
├── public/
│   ├── img/                            # Logo, capas default
│   └── build/                          # Output do Vite
│
└── config/                             # Configs Laravel padrão
```

---

## Modelo de domínio

```
┌──────────────┐
│    User      │  (alunos, admins, superusers — discriminados por PapelEnum)
└──────┬───────┘
       │
       ├──< Matricula >── Curso ──< Modulo ──< Aula
       │                                       │
       │                                       ├──< Legenda
       │                                       ├──< Material         (anexos)
       │                                       ├──< ComentarioAula   (self-ref para replies)
       │                                       ├──< AvaliacaoAula
       │                                       └──< ProgressoAula    ← retomada + conclusão
       │
       ├──< HistoricoXp           (imutável — append-only)
       ├──── PerfilGamificado     (1:1 — xp_total, nivel_atual, streak)
       ├──< Certificado
       └──< ChamadoSuporte         (com anexo opcional)

LogAuditoria                       (transversal — registra ações de qualquer entidade)
```

### Tabelas principais

| Tabela | Papel | Destaques de schema |
|--------|-------|---------------------|
| `users` | Identidade + perfil | Adicionado `public_id`, `papel` (enum), `avatar_url`, `bio`. |
| `cursos` | Curso | `public_id`, `youtube_playlist_id` (origem opcional), `url_capa` (varchar largo p/ URLs do YouTube). |
| `modulos` | Agrupador | `curso_id` FK cascade, `ordem` int para drag-and-drop. |
| `aulas` | Conteúdo | `modulo_id` FK, `tipo_aula` (`video`/`texto`/`quiz`), `youtube_video_id`, `duracao_segundos`. |
| `legendas` | Faixas SRT/VTT | Vinculadas à aula. |
| `materiais` | Anexos | PDF/zip por aula. |
| `matriculas` | Acesso ao curso | UNIQUE (`usuario_id`, `curso_id`). |
| `progressos_aulas` | Estado por aula/usuário | UNIQUE (`usuario_id`, `aula_id`), `posicao_segundos`, `concluido_em` nullable. |
| `comentarios_aulas` | Threading | `comentario_pai_id` self-ref, `foi_editado` bool. |
| `avaliacao_aulas` | Notas | `nota` 1-5 + comentário opcional. |
| `historico_xp` | Append-only | `quantidade`, `motivo` (string codificada — ex: `aula:concluida`). |
| `perfis_gamificados` | Agregado | `xp_total`, `nivel_atual`, `streak_dias`, `ultima_atividade`. |
| `certificados` | Emissão | Gerado ao concluir 100% das aulas do curso. |
| `chamados_suportes` | Suporte | `status` (enum), `anexo_path` opcional. |
| `log_auditorias` | Auditoria | Polimórfico — registra qualquer ação relevante. |

### Convenções

- **Naming PT-BR** nas tabelas e models (`Curso`, `Modulo`, `Aula`) — alinhado ao domínio e ao público-alvo. Código (variáveis, métodos) também em PT-BR quando faz sentido no domínio (`isMatriculado`, `concluirAula`).
- **`public_id` UUID v7** gerado automaticamente pela trait [`HasPublicId`](app/Concerns/HasPublicId.php). Route model binding usa `{curso:public_id}`.
- **FKs com `cascade`** onde a dependência é forte (módulo → curso, aula → módulo, comentário → aula).
- **Soft delete não é o default.** Só usado onde realmente faz sentido (auditoria).

---

## Fluxos principais

### 1. Matrícula em um curso

```
POST /cursos/{curso:public_id}/matricular
   ↓
CursoController@matricular
   ↓
MatricularUsuarioEmCurso::handle($user, $curso)
   ├─ Verifica se já existe matrícula (idempotente)
   ├─ Cria Matricula
   └─ Log de auditoria
   ↓
redirect()->route('cursos.show', $curso) com flash
```

### 2. Importar curso de uma playlist do YouTube

```
POST /admin/cursos/importar  (body: { playlist_url })
   ↓
AdminCursoController@import  →  ImportPlaylistAsCurso::handle($url)
                                  │
                                  ├─ YouTubePlaylistService::fetch($id)   ── Google API
                                  │    ├─ PlaylistData (título, descrição, capa)
                                  │    └─ VideoData[]   (id, título, duração ISO 8601)
                                  ├─ IsoDurationParser::toSeconds("PT12M30S") = 750
                                  ├─ Cria Curso + 1 Módulo "Aulas"
                                  └─ Cria N Aulas (tipo_aula=video, youtube_video_id, duracao_segundos)
   ↓
redirect()->route('admin.cursos.edit', $curso)
```

### 3. Assistir uma aula (em implementação)

Ver seção dedicada abaixo.

### 4. Abrir chamado de suporte

```
POST /suporte  (form com anexo opcional)
   ↓
StoreChamadoRequest valida + processa upload
   ↓
SuporteController@store
   ↓
ChamadoSuporte::create([..., anexo_path => storage path])
   ↓
redirect()->route('suporte.index') com flash de sucesso
```

---

## Página "Assistir aulas" + gamificação

> Em implementação ativa — spec completa em [docs/superpowers/specs/2026-05-22-pagina-assistir-aulas-design.md](docs/superpowers/specs/2026-05-22-pagina-assistir-aulas-design.md).

### Objetivo

Permitir que um aluno matriculado:

1. Assista cada aula em uma página dedicada (YouTube IFrame embedado).
2. Tenha o vídeo **retomado no segundo em que parou**.
3. Veja quais aulas concluiu (`✓`), qual está em andamento (`●`) e quais faltam (`○`).
4. **Ganhe XP automaticamente** ao concluir uma aula — `1 XP por minuto de duração`, sem teto.
5. Navegue livremente entre aulas (Netflix-like, conclusão não bloqueia a próxima).

### Rotas

```php
Route::get('/cursos/{curso}/assistir/{aula?}', [AssistirController::class, 'show'])
    ->middleware('matriculado')->name('cursos.assistir');

Route::post('/aulas/{aula}/progresso', [ProgressoAulaController::class, 'update'])
    ->middleware('matriculado.aula')->name('aulas.progresso');

Route::post('/aulas/{aula}/concluir', [ProgressoAulaController::class, 'concluir'])
    ->middleware('matriculado.aula')->name('aulas.concluir');

Route::post('/aulas/{aula}/comentarios', [ComentarioAulaController::class, 'store'])
    ->middleware('matriculado.aula')->name('aulas.comentarios.store');

Route::put('/comentarios/{comentario}', [ComentarioAulaController::class, 'update'])->name('comentarios.update');
Route::delete('/comentarios/{comentario}', [ComentarioAulaController::class, 'destroy'])->name('comentarios.destroy');
```

### Regras de progresso

| Estado | `posicao_segundos` | `concluido_em` |
|---|---|---|
| Não iniciada | (sem row) | (sem row) |
| Em andamento | `> 0` | `NULL` |
| Concluída | qualquer | `NOT NULL` |

- **Heartbeat** a cada 10s enquanto o player está em `PLAYING`, e imediatamente em `PAUSED` / `ENDED`.
- **Não regressivo**: `posicao_segundos = max(antiga, nova)`.
- **Auto-conclusão** ao atingir 90% da duração.
- **Botão manual** de conclusão (idempotente) para aulas tipo `texto`/`quiz` ou fallback.

### Cálculo de XP

```php
$xp = (int) ceil(max(0, $aula->duracao_segundos ?? 0) / 60);
```

- Crédito em `historico_xp` (append-only, motivo=`aula:concluida`).
- `perfis_gamificados.xp_total += $xp`.
- `nivel_atual = floor(sqrt(xp_total / 100)) + 1` — curva de progressão que desacelera naturalmente.
- **Idempotente**: segunda conclusão da mesma aula retorna 0 XP via transação + check de `concluido_em IS NULL`.

### Comentários

- Threading de 1 nível (replies de replies viram replies do top-level).
- Edição marca `foi_editado = true` (sem histórico — KISS no MVP).
- Exclusão é `delete()` físico com cascade nas respostas.
- Policy: dono OU admin podem deletar; só dono pode editar.

### Frontend — `Pages/Cursos/Assistir.tsx`

- Hook `useYouTubePlayer(videoId, startSeconds)` carrega o IFrame API uma única vez globalmente.
- Heartbeat usa `fetch` direto (não Inertia) para evitar recarregar props.
- Conclusão usa `router.post(..., { preserveScroll: true })` para receber flash `+{xp} XP` via Sonner.
- Sidebar de módulos/aulas com ícones de status e fundo destacado na aula atual.

---

## Painel administrativo

`/admin` — acessível apenas para `papel = admin` ou `superuser` (middleware [`EnsureUserIsAdmin`](app/Http/Middleware/EnsureUserIsAdmin.php)).

### Funcionalidades

- **Dashboard** (`/admin`) — KPIs: total de cursos, alunos ativos, chamados abertos, matrículas no mês.
- **Cursos** (`/admin/cursos`)
  - Criar manualmente OU importar de uma playlist do YouTube.
  - Editar metadata, capa, descrição.
  - Reordenar módulos e aulas com **drag-and-drop** (`@dnd-kit`) — persiste via `PUT /modulos/reordenar` e `PUT /aulas/reordenar`.
- **Módulos** — CRUD escopado por curso.
- **Aulas** — CRUD escopado por módulo, com campos específicos por `tipo_aula`.
- **Usuários** (`/admin/usuarios`) — CRUD, mudança de papel, reset manual de senha.
- **Suporte** (`/admin/suporte`) — caixa de entrada de chamados, responder, marcar como resolvido.

### Papéis ([`PapelEnum`](app/Enums/PapelEnum.php))

| Papel | Permissões |
|-------|-----------|
| **Aluno** | Acesso público + cursos matriculados, progresso, XP, comentários, chamados de suporte. |
| **Admin** | Tudo do aluno + painel `/admin` (cursos, módulos, aulas, usuários, suporte). |
| **Superuser** | Tudo do admin + gestão de outros admins. |

### Criar o superuser inicial

```dotenv
ADMIN_SEED_EMAIL=seu@email.com
ADMIN_SEED_PASSWORD=sua-senha-segura
```

```bash
php artisan db:seed --class=AdminUserSeeder
```

Idempotente — pode rodar várias vezes.

---

## Importação de cursos do YouTube

O serviço [`YouTubePlaylistService`](app/Services/YouTube/YouTubePlaylistService.php) usa o pacote oficial `google/apiclient` para buscar:

- Metadata da playlist (título, descrição, thumbnail).
- Lista de vídeos com duração em formato ISO 8601 (ex: `PT1H12M30S`).

O parser [`IsoDurationParser`](app/Services/YouTube/IsoDurationParser.php) converte para segundos. A action [`ImportPlaylistAsCurso`](app/Actions/ImportPlaylistAsCurso.php) orquestra:

1. Cria o `Curso` com `youtube_playlist_id` preservado.
2. Cria um módulo padrão (admin pode reorganizar depois).
3. Cria todas as `Aula`s com `tipo_aula=video`, `youtube_video_id`, `duracao_segundos`.

Erros da API caem em [`YouTubeApiException`](app/Services/YouTube/YouTubeApiException.php) — exibidos no admin como flash de erro.

Configurar:

```dotenv
GOOGLE_API_KEY=sua-chave-google
```

---

## Autenticação, autorização e segurança

### Autenticação

- **Laravel Breeze** (sessão + cookie), não Sanctum/Passport.
- Cookie `httpOnly`, `secure` em produção, `sameSite=lax`.
- Reset de senha por e-mail (Mailable + token assinado).
- Verificação de e-mail opcional via middleware `verified`.

### Autorização

- **Middlewares** (`bootstrap/app.php`):
  - `auth` — só logados.
  - `admin` — só `admin`/`superuser`.
  - `matriculado` — só quem tem `Matricula` no curso da URL.
  - `matriculado.aula` — variante que resolve curso via `aula.modulo.curso`.
- **Policies** (em construção) — `ComentarioAulaPolicy` controla edit/delete por dono ou admin.

### Boas práticas adotadas

- **Sem `env()` fora de config files.** Sempre via `config('app.name')` etc.
- **Sem `DB::raw` espalhado.** Eloquent + Query Builder, com eager loading explícito (`with()`).
- **CSRF** em todos os POSTs (Inertia injeta automaticamente; chamadas `fetch` manuais usam `X-CSRF-TOKEN`).
- **Validação centralizada** em Form Requests (`StoreChamadoRequest`, `StoreComentarioRequest`, etc).
- **IDs públicos opacos** (`public_id` UUID v7) em todas as URLs — IDs auto-incrementais nunca expostos.
- **Uploads** com validação de mime e tamanho, armazenados em disco `local` (não acessível publicamente sem rota assinada).
- **Throttle** em endpoints sensíveis (reset password, verify email): `throttle:6,1`.
- **N+1 prevenido** em listagens com `with(['modulos.aulas'])` etc.

---

## Frontend e Design System

### Princípios

- **Dark-first.** Light mode é uma adição opcional, não o default.
- **Tipografia editorial.** Fraunces para títulos display, Geist para UI, Geist Mono para código/IDs.
- **Densidade controlada.** Bordas finas (`border-zinc-800`), espaçamento generoso, animações sutis (`transition-colors duration-200`).
- **Sem componentes "templão".** Tudo passa por revisão de design.

### Tokens (Tailwind 4 — direto no CSS)

```css
@theme {
  --color-bg: #09090b;          /* zinc-950 */
  --color-surface: #18181b;     /* zinc-900 */
  --color-border: #27272a;      /* zinc-800 */
  --color-text: #fafafa;        /* zinc-50  */
  --color-muted: #71717a;       /* zinc-500 */
  --color-accent: #f43f5e;      /* rose-500 (referência ArturFlix) */
}
```

### Componentes em [resources/js/components/ui/](resources/js/components/ui/)

- `button.tsx` — variantes via `class-variance-authority` (default, ghost, outline, destructive).
- `card.tsx`, `badge.tsx`, `dialog.tsx`, `dropdown-menu.tsx` — Base UI por baixo, estilo próprio por cima.
- `confirm-dialog.tsx` — confirmação destrutiva acessível.
- `progress.tsx` — barra de progresso com `aria-valuenow` correto.
- `skeleton.tsx` — loading state.
- `avatar.tsx` — inicial + cor derivada determinística.

### Layouts

- `AppLayout` — navbar persistente, footer, slot `<main>`.
- `GuestLayout` — landings públicas (login, register, welcome).
- `AdminLayout` — sidebar com seções.

### Estado e dados

- **Props vindas do controller** via Inertia (tipadas em `types/index.d.ts`).
- **Sem Redux/Zustand.** Estado local em `useState` quando necessário; estado de servidor vem em props.
- **Flash messages** automaticamente convertidas em toasts (Sonner) por um hook global.

---

## Testes

Suite em [tests/Feature/](tests/) usando Pest 3.

### Cobertura atual

- **Auth completo** (login, register, forgot password, reset, email verification).
- **CRUD admin** (cursos, módulos, aulas, usuários).
- **Matrícula** (idempotência, autorização).
- **Importação YouTube** (mocks da Google API, parsing de duração ISO).
- **Em construção:** AssistirControllerTest, ProgressoAulaTest, ConcluirAulaTest, ComentarioAulaTest (cobertos pela spec da página de assistir).

### Executar

```bash
# Todos
./vendor/bin/pest --compact

# Um arquivo
./vendor/bin/pest tests/Feature/Auth/LoginTest.php --compact

# Por nome
./vendor/bin/pest --filter="concluir aula credita XP" --compact
```

### Convenção

- **Feature tests** por padrão (HTTP + DB real via transaction). Unit tests só para lógica pura.
- **Factories** para todos os models, com states semânticos (`Curso::factory()->publicado()->withAulas(5)`).
- **Asserções de DB** preferidas a inspeção de retorno (`assertDatabaseHas`, `assertDatabaseCount`).

---

## Como rodar localmente

### Pré-requisitos

- PHP **8.4+**
- Composer
- **Bun** (não use npm)
- PostgreSQL **15+** (testado em 18)
- Extensões PHP: `pgsql`, `bcmath`, `mbstring`, `intl`, `gd` ou `imagick`

### Setup completo

```bash
# 1. Clonar
git clone https://github.com/seu-usuario/arturflix.git
cd arturflix

# 2. Variáveis de ambiente
cp .env.example .env
#    Edite: DB_*, GOOGLE_API_KEY, ADMIN_SEED_EMAIL/PASSWORD

# 3. Setup automatizado (instala deps PHP+JS, gera key, migra, builda)
composer setup

# 4. Seedar usuário admin inicial
php artisan db:seed --class=AdminUserSeeder
```

### Desenvolvimento

```bash
# Roda Laravel + queue + pail (logs) + Vite simultaneamente
composer run dev
```

Atalhos úteis:

```bash
php artisan tinker                              # REPL
php artisan route:list                          # ver todas as rotas
php artisan db:show                             # estado do banco
php artisan pail                                # logs em tempo real
vendor/bin/pint --dirty --format agent          # formata o que foi alterado
./vendor/bin/pest --compact                     # roda testes
bun run build                                   # build de produção do front
```

---

## Convenções de código

### PHP

- **Pint** (preset Laravel) — `vendor/bin/pint --dirty --format agent` antes de cada commit.
- **Tipos explícitos** em todos os parâmetros e retornos.
- **Constructor property promotion** (PHP 8).
- **Curly braces sempre**, mesmo para `if` de uma linha.
- **PHPDoc** só onde agrega (array shapes, generics) — código se autoexplica.
- **Comentários no código:** evitados; quando necessários, explicam *por quê*, não *o quê*.

### TypeScript / React

- **Functional components** com hooks.
- **Tipagem estrita** — `strict: true` no `tsconfig`.
- **Props tipadas** explicitamente, sem `any`.
- **`cn()` helper** (clsx + tailwind-merge) para classes condicionais.
- **Imports absolutos** via alias `@/`.

### Git

- **Conventional Commits** em PT-BR: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`.
- **Mensagens descrevem o porquê**, não só o quê.
- **Sem `--no-verify`** em commits — hooks existem por motivo.

---

## Roadmap

### Em implementação ativa

- Página "Assistir aulas" + sistema de XP + comentários ([spec](docs/superpowers/specs/2026-05-22-pagina-assistir-aulas-design.md)).

### Próximos

- Quiz funcional (hoje é placeholder).
- Geração automatizada de certificados em PDF.
- Streak diário com atualização via job agendado.
- Sistema de conquistas/badges (tabela existe).
- Suporte a vídeos não-YouTube (S3, Cloudflare Stream).
- Light mode opcional.
- Internacionalização (PT/EN).

### Não está no escopo (intencionalmente)

- App mobile nativo.
- White-label / multi-tenant.
- Live streaming.

---

## Licença

Projeto pessoal / acadêmico. Todos os direitos reservados.

Identidade visual é uma paródia carinhosa à Netflix — sem afiliação com a Netflix, Inc.
