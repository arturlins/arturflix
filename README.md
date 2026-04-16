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
</p>

---

## Sobre o Projeto

**ArturFlix** é uma plataforma completa de videoaulas construída com Laravel, React e Inertia.js. O nome e a identidade visual são uma paródia divertida à Netflix, mas a plataforma é séria e robusta — projetada para suportar múltiplos cursos, módulos organizados, aulas em vídeo, aulas em texto, quizzes, materiais de apoio, legendas, gamificação com XP e certificados.

### Funcionalidades

- **Cursos e Módulos** — Organização hierárquica de conteúdo (Curso → Módulos → Aulas)
- **Três tipos de aula** — Vídeo, Texto e Quiz
- **Materiais de apoio** — Arquivos complementares vinculados às aulas
- **Legendas** — Suporte a legendas nos vídeos
- **Sistema de matrículas** — Controle de acesso por curso
- **Progresso do aluno** — Rastreamento de conclusão por aula
- **Avaliações** — Sistema de avaliação das aulas pelos alunos
- **Comentários** — Discussão por aula
- **Gamificação** — Perfil gamificado com histórico de XP
- **Certificados** — Emissão de certificados de conclusão
- **Suporte** — Sistema de chamados integrado
- **Auditoria** — Log completo de ações na plataforma
- **Papéis de usuário** — Aluno, Admin e Superuser

---

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| **Backend** | PHP 8.4 + Laravel 12 |
| **Frontend** | React 18 + TypeScript 5 |
| **Ponte SPA** | Inertia.js 2 (sem API REST — comunicação direta) |
| **Banco de dados** | PostgreSQL |
| **Estilização** | Tailwind CSS 4 |
| **Componentes UI** | Lucide React (ícones) + componentes próprios |
| **Bundler** | Vite 6 |
| **Testes** | Pest PHP 3 |
| **Rotas JS** | Ziggy (rotas nomeadas do Laravel no frontend) |
| **Code Style** | Laravel Pint |

---

## Arquitetura

O projeto segue a arquitetura **Inertia.js monolítica moderna**: o backend Laravel serve páginas React diretamente via Inertia, eliminando a necessidade de uma API REST separada. Toda a autenticação é feita por sessão (cookies), e a navegação entre páginas acontece sem recarregamento completo.

### Padrão de camadas no backend

```
Controller → Action / Service → Model (Eloquent) → PostgreSQL
     ↓
Inertia::render('Page', $props) → React Component
```

- **Controllers** recebem a requisição, delegam a lógica e retornam uma resposta Inertia
- **Actions** (`app/Actions/`) encapsulam operações de negócio únicas (um método `handle()`)
- **Services** (`app/Services/`) orquestram múltiplas Actions quando a lógica é mais complexa
- **Queries** (`app/Queries/`) encapsulam consultas Eloquent reutilizáveis
- **Form Requests** validam os dados de entrada com regras dedicadas

---

## Estrutura de Pastas

```
arturflix/
├── app/
│   ├── Actions/            # Operações de negócio (single-purpose)
│   ├── Concerns/           # Traits para Models (ex: HasPublicId)
│   ├── Enums/              # Enums PHP 8.1+ (PapelEnum, TipoAulaEnum, StatusChamadoEnum)
│   ├── Http/
│   │   ├── Controllers/    # Controllers Inertia (Auth, Cursos, Profile, etc.)
│   │   └── Services/       # Lógica HTTP específica (formatação, webhooks)
│   ├── Models/             # 15 models Eloquent (Curso, Modulo, Aula, Matricula, etc.)
│   ├── Providers/          # Service Providers
│   ├── Queries/            # Query builders reutilizáveis
│   ├── Services/           # Orquestração de regras de negócio
│   └── Traits/             # Traits genéricos (não ligados a Models)
│
├── resources/
│   └── js/
│       ├── components/
│       │   ├── layout/     # Navbar, Footer
│       │   └── ui/         # Componentes reutilizáveis (Button, Card, Badge, Input, etc.)
│       ├── layouts/        # AppLayout, GuestLayout
│       ├── Pages/
│       │   ├── Auth/       # Login, Register, ForgotPassword, etc.
│       │   ├── Cursos/     # Listagem de cursos
│       │   ├── Suporte/    # Página de suporte
│       │   ├── Dashboard.tsx
│       │   └── Welcome.tsx
│       ├── lib/            # Utilitários TypeScript
│       └── types/          # Tipagens compartilhadas (index.d.ts)
│
├── database/
│   └── migrations/         # 18 migrations (users, cursos, modulos, aulas, etc.)
│
├── routes/
│   └── web.php             # Todas as rotas (Inertia, sem API separada)
│
├── tests/
│   ├── Feature/            # Testes de integração (Pest PHP)
│   └── Unit/               # Testes unitários (Pest PHP)
│
└── config/                 # Configurações Laravel padrão
```

---

## Modelos de Dados

O banco possui **15 tabelas principais** que refletem o domínio educacional:

```
Usuario ─┬─ Matricula ──── Curso ──── Modulo ──── Aula
         │                                         ├── Legenda
         │                                         ├── Material
         │                                         ├── ComentarioAula
         │                                         ├── AvaliacaoAula
         │                                         └── ProgressoAula
         ├── PerfilGamificado
         ├── HistoricoXP
         ├── Certificado
         └── ChamadoSuporte

LogAuditoria (transversal — registra ações de qualquer entidade)
```

---

## Como Rodar

### Pré-requisitos

- PHP 8.4+
- Composer
- Node.js 20+ (ou Bun)
- PostgreSQL 15+

### Instalação rápida

```bash
# Clonar o repositório
git clone https://github.com/seu-usuario/arturflix.git
cd arturflix

# Instalar dependências e configurar o projeto
composer setup
```

O comando `composer setup` executa automaticamente:
1. `composer install`
2. Cópia do `.env.example` para `.env`
3. Geração da chave da aplicação
4. Execução das migrations
5. Instalação das dependências JS (`bun install`)
6. Build do frontend (`bun run build`)

> **Nota:** Configure as credenciais do PostgreSQL no arquivo `.env` antes de rodar o setup.

### Desenvolvimento

```bash
# Inicia servidor Laravel + queue + logs + Vite simultaneamente
composer run dev
```

### Testes

```bash
# Rodar todos os testes
./vendor/bin/pest --compact

# Rodar um arquivo específico
./vendor/bin/pest tests/Feature/Auth/LoginTest.php --compact
```

---

## Painel Administrativo

O painel admin fica em `/admin` e é acessível apenas para usuários com papel `Admin` ou `Superuser`.

### Papéis de usuário

| Papel | Permissões |
|-------|-----------|
| **Aluno** | Acesso padrão — assiste aulas, acompanha progresso |
| **Admin** | Gerencia conteúdo (cursos, módulos, aulas) e alunos |
| **Superuser** | Gerencia tudo, inclusive outros admins |

### Criar o superuser inicial

Defina as variáveis no `.env` antes de rodar:

```dotenv
ADMIN_SEED_EMAIL=seu@email.com
ADMIN_SEED_PASSWORD=sua-senha-segura
```

Depois execute:

```bash
php artisan db:seed --class=AdminUserSeeder
```

O comando é idempotente — pode ser rodado múltiplas vezes sem duplicar o usuário.

### Endpoints principais

| Rota | Descrição |
|------|-----------|
| `/admin` | Dashboard do painel |
| `/admin/cursos` | Listagem e gestão de cursos |
| `/admin/usuarios` | Gestão de usuários |
| `/admin/suporte` | Chamados de suporte |

### Sair do painel

Clique no menu do usuário no canto superior direito e selecione **"Sair"**.

---

## Licença

Projeto acadêmico / pessoal. Todos os direitos reservados.
