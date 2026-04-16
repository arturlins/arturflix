# Painel Administrativo Completo — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar o painel administrativo de um shell minimalista (dashboard + listagem read-only de cursos) em uma plataforma de administração completa — com shell navegável (header/logout/breadcrumbs), CRUD de cursos manual + edição/remoção, gestão completa de módulos e aulas, CRUD de usuários com permissões por papel, e painel de chamados de suporte.

**Architecture:** Backend Laravel 12 com Form Requests, Actions e Policies para autorização granular (admin vs superuser). Frontend Inertia + React reaproveitando AdminLayout existente, com novo AdminHeader (logout, voltar à plataforma, breadcrumbs) e sidebar expandido. Páginas seguem padrão Pages/Admin/{Recurso}/{Index|Create|Edit|Show}. Modais usam `@base-ui/react` Dialog. Reordenação drag-and-drop via `@dnd-kit/core`. Toasts via `sonner`.

**Tech Stack:** Laravel 12, Inertia v2, React 18, TypeScript, Tailwind v3, @base-ui/react, lucide-react, Pest 4, @dnd-kit/core (novo), sonner (novo).

**Convenções obrigatórias deste plano:**
- Rotas admin sempre por `public_id` (UUID), nunca `id` interno.
- Form Requests sempre em `app/Http/Requests/Admin/`.
- Policies em `app/Policies/`, registradas em `bootstrap/app.php` se necessário.
- Tabelas/colunas em PT (cursos, modulos, aulas, usuarios, chamados_suportes).
- Componentes UI customizados em `resources/js/components/ui/` (não importar shadcn).
- Após qualquer mudança em PHP: `vendor/bin/pint --dirty --format agent`.
- Após qualquer task: rodar testes da feature (`./vendor/bin/pest tests/Feature/Admin/{File} --compact`).
- Commits frequentes: 1 por step de implementação verde.

---

## Visão geral das fases

| Fase | Escopo | Tasks |
|------|--------|-------|
| **0** | Fundação: dependências, Policies, AdminLayout/Header com logout e breadcrumbs, sidebar expandido | 0.1 – 0.5 |
| **1** | CRUD de cursos manual (criar, editar, excluir) + gestão de módulos e aulas (CRUD + reordenação) | 1.1 – 1.10 |
| **2** | CRUD de usuários com gating por superuser (listar/buscar/criar/editar/excluir + alteração de papel) | 2.1 – 2.7 |
| **3** | Painel de chamados de suporte: backend do form público + admin para listar/responder/resolver | 3.1 – 3.7 |
| **4** | Polimento: testes E2E manuais, lint final, atualização de migrations seeders, documentação operacional | 4.1 – 4.3 |

---

## Estrutura de arquivos a criar/modificar

### Backend (PHP)

**Policies (criar)**
- `app/Policies/CursoPolicy.php` — viewAny, view, create, update, delete (todos: admin)
- `app/Policies/UserPolicy.php` — viewAny (admin), create/update/delete (regras condicionais por papel: admin pode mexer em alunos; só superuser mexe em admin/superuser)
- `app/Policies/ChamadoSuportePolicy.php` — viewAny, view, respond, resolve (todos: admin)

**Form Requests (criar)**
- `app/Http/Requests/Admin/StoreCursoRequest.php`
- `app/Http/Requests/Admin/UpdateCursoRequest.php`
- `app/Http/Requests/Admin/StoreModuloRequest.php`
- `app/Http/Requests/Admin/UpdateModuloRequest.php`
- `app/Http/Requests/Admin/ReorderModulosRequest.php`
- `app/Http/Requests/Admin/StoreAulaRequest.php`
- `app/Http/Requests/Admin/UpdateAulaRequest.php`
- `app/Http/Requests/Admin/ReorderAulasRequest.php`
- `app/Http/Requests/Admin/StoreUserRequest.php`
- `app/Http/Requests/Admin/UpdateUserRequest.php`
- `app/Http/Requests/Admin/RespondChamadoRequest.php`
- `app/Http/Requests/Suporte/StoreChamadoRequest.php` (público)

**Controllers (criar)**
- `app/Http/Controllers/Admin/AdminModuloController.php` — store/update/destroy/reorder
- `app/Http/Controllers/Admin/AdminAulaController.php` — store/update/destroy/reorder
- `app/Http/Controllers/Admin/AdminUserController.php` — index/create/store/edit/update/destroy
- `app/Http/Controllers/Admin/AdminChamadoController.php` — index/show/respond/resolve
- `app/Http/Controllers/SuporteController.php` — público: store
- Modificar: `app/Http/Controllers/Admin/AdminCursoController.php` — adicionar create/store/edit/update/destroy/show

**Actions (criar)**
- `app/Actions/Admin/CreateCursoManual.php`
- `app/Actions/Admin/DeleteCursoCascade.php`
- `app/Actions/Admin/CreateUserByAdmin.php`
- `app/Actions/Admin/UpdateUserByAdmin.php`
- `app/Actions/Admin/RespondChamadoSuporte.php`

**Models (modificar)**
- `app/Models/ChamadoSuporte.php` — preencher fillable, casts, relação `usuario()`, accessors
- `app/Models/User.php` — adicionar relação `chamados()` (opcional)

**Migrations (criar conforme necessário)**
- Nenhuma estrutural nova: o schema atual cobre todas as features. Apenas seeders.

**Seeders (criar/atualizar)**
- `database/seeders/AdminUserSeeder.php` — criar superuser inicial idempotente

**Rotas (modificar `routes/web.php`)** — ver Task 0.5 para snippet completo

### Frontend (TypeScript/React)

**Componentes admin novos**
- `resources/js/components/admin/AdminHeader.tsx` — topbar com breadcrumbs, link "Voltar à plataforma", menu do usuário (logout)
- `resources/js/components/admin/AdminSidebar.tsx` — modificar: novos itens (Usuários, Suporte)
- `resources/js/components/admin/UserMenu.tsx` — popover com nome, email, papel, botão logout
- `resources/js/components/admin/Breadcrumbs.tsx` — navegação contextual
- `resources/js/components/admin/PageHeader.tsx` — header reutilizável de página (título, descrição, ações)
- `resources/js/components/admin/EmptyState.tsx`
- `resources/js/components/admin/DataTable.tsx` — tabela genérica reutilizável
- `resources/js/components/admin/SortableList.tsx` — wrapper @dnd-kit

**Componentes UI base (criar)**
- `resources/js/components/ui/dialog.tsx` — wrapper @base-ui/react Dialog
- `resources/js/components/ui/dropdown-menu.tsx` — wrapper @base-ui/react Menu
- `resources/js/components/ui/textarea.tsx`
- `resources/js/components/ui/select.tsx`
- `resources/js/components/ui/switch.tsx`
- `resources/js/components/ui/skeleton.tsx`
- `resources/js/components/ui/confirm-dialog.tsx` — confirmação destrutiva (delete)

**Layouts (modificar)**
- `resources/js/layouts/AdminLayout.tsx` — adicionar slot header e container `max-w-7xl mx-auto px-8 py-10`

**Pages admin (criar)**
- `Admin/Cursos/Create.tsx` — form criar manual
- `Admin/Cursos/Edit.tsx` — form editar metadados + lista de módulos com reordenação + ações
- `Admin/Cursos/Show.tsx` (opcional, ou consolidar em Edit)
- `Admin/Cursos/Modulos/Edit.tsx` — editor do módulo + lista de aulas
- `Admin/Cursos/Modulos/Aulas/Edit.tsx` — editor de aula
- `Admin/Usuarios/Index.tsx`
- `Admin/Usuarios/Create.tsx`
- `Admin/Usuarios/Edit.tsx`
- `Admin/Suporte/Index.tsx`
- `Admin/Suporte/Show.tsx`

**Pages admin (modificar)**
- `Admin/Cursos/Index.tsx` — adicionar coluna ações (editar/excluir), modais de confirmação

**Setup global (modificar)**
- `resources/js/app.tsx` — montar `<Toaster />` do sonner
- `resources/js/types/index.d.ts` — adicionar tipos compartilhados (Curso, Modulo, Aula, User, Chamado)

---

## Fase 0 — Fundação

### Task 0.0: Design tokens + tipografia editorial

> **Por quê primeiro:** todo componente do plano referencia tokens semânticos (`bg-surface`, `text-foreground`, `text-accent`). Sem este passo, os refinamentos visuais não funcionam e o painel converge para "admin Tailwind genérico".
>
> **Direção estética:** "Linear meets Criterion Collection" — densidade de produto pro + tipografia editorial cinematográfica. Bebas Neue (já existe) para brand moments + **Fraunces** (serif editorial) para títulos de página + **Geist** para UI body + **Geist Mono** para tabular numbers.

**Files:**
- Modify: `resources/css/app.css`
- Modify: `package.json`

- [ ] **Step 1: Instalar fontes**

```bash
bun add @fontsource-variable/fraunces @fontsource-variable/geist @fontsource-variable/geist-mono
```

- [ ] **Step 2: Atualizar `resources/css/app.css` com tokens completos**

```css
@import "tailwindcss";

@import "@fontsource-variable/fraunces";
@import "@fontsource-variable/geist";
@import "@fontsource-variable/geist-mono";

@font-face {
    font-family: 'Bebas Neue';
    src: url('/fonts/bebas-neue.woff2') format('woff2');
    font-weight: 400;
    font-style: normal;
    font-display: swap;
}

@theme {
    /* Tipografia */
    --font-brand: 'Bebas Neue', Impact, sans-serif;
    --font-display: 'Fraunces Variable', Georgia, serif;
    --font-sans: 'Geist Variable', ui-sans-serif, system-ui, sans-serif;
    --font-mono: 'Geist Mono Variable', ui-monospace, 'JetBrains Mono', monospace;

    /* Superfícies */
    --color-canvas: #08090d;
    --color-surface: #0d1016;
    --color-surface-2: #11141b;
    --color-surface-3: #161a23;
    --color-border: #1e2430;
    --color-border-strong: #2a3142;

    /* Texto — todos com contraste WCAG AA contra surface */
    --color-foreground: #f4f5f7;
    --color-foreground-muted: #a8adbb;
    --color-foreground-subtle: #6a7180;
    --color-foreground-faint: #444b5a;

    /* Acentos */
    --color-accent: #E50914;
    --color-accent-soft: rgba(229, 9, 20, 0.12);
    --color-warning: #f5a524;
    --color-warning-soft: rgba(245, 165, 36, 0.12);
    --color-success: #16a34a;
    --color-success-soft: rgba(22, 163, 74, 0.12);

    /* Focus / inputs */
    --color-ring: #E50914;
    --color-input: #1e2430;
}

html {
    font-family: var(--font-sans);
    font-feature-settings: "ss01", "ss03", "cv11";
}

.font-mono { font-feature-settings: "tnum", "ss03"; }

.font-display {
    font-family: var(--font-display);
    font-optical-sizing: auto;
    letter-spacing: -0.02em;
}
```

- [ ] **Step 3: Build e verificar contraste**

```bash
bun run build
```

Verificar em devtools (Lighthouse → Accessibility) que `text-foreground-muted` (#a8adbb) tem ≥4.5:1 contra `bg-surface` (#0d1016). Se falhar, ajustar para `#b4b9c6`.

- [ ] **Step 4: Commit**

```bash
git add resources/css/app.css package.json bun.lockb
git commit -m "feat(design): tokens semânticos + fontes Fraunces/Geist/Geist Mono"
```

> A partir daqui, **todo componente usa tokens** (`bg-surface`, `text-foreground`, `text-accent`) — nunca hex literal.

### Task 0.1: Instalar dependências frontend novas

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Instalar libs com bun**

```bash
bun add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities sonner
```

- [ ] **Step 2: Verificar build limpo**

```bash
bun run build
```

Expected: build conclui sem erros.

- [ ] **Step 3: Commit**

```bash
git add package.json bun.lockb
git commit -m "chore(admin): adiciona dnd-kit e sonner para painel"
```

### Task 0.2: Toaster global e bridge flash→toast

**Files:**
- Modify: `resources/js/app.tsx`
- Create: `resources/js/hooks/use-flash-toast.ts`

- [ ] **Step 1: Montar Toaster**

Em `resources/js/app.tsx`, dentro do callback `setup({ el, App, props })`, importar `import { Toaster } from 'sonner'` e renderizar `<Toaster richColors theme="dark" position="top-right" closeButton />` ao lado de `<App {...props} />` dentro de um Fragment.

- [ ] **Step 2: Criar hook**

`resources/js/hooks/use-flash-toast.ts`:

```tsx
import { useEffect } from 'react'
import { usePage } from '@inertiajs/react'
import { toast } from 'sonner'

type Flash = { success?: string; error?: string }

export function useFlashToast() {
    const { props } = usePage<{ flash: Flash }>()
    useEffect(() => {
        if (props.flash?.success) toast.success(props.flash.success)
        if (props.flash?.error) toast.error(props.flash.error)
    }, [props.flash?.success, props.flash?.error])
}
```

O hook é invocado em `AdminLayout.tsx` (Task 0.4).

- [ ] **Step 3: Verificar build**

```bash
bun run build
```

Expected: ok.

- [ ] **Step 4: Commit**

```bash
git add resources/js/app.tsx resources/js/hooks/use-flash-toast.ts
git commit -m "feat(admin): toaster global e hook flash→toast"
```

### Task 0.3: Policies (Curso, User com gating, ChamadoSuporte)

**Files:**
- Create: `app/Policies/UserPolicy.php`
- Create: `app/Policies/CursoPolicy.php`
- Create: `app/Policies/ChamadoSuportePolicy.php`
- Modify: `app/Providers/AppServiceProvider.php`
- Test: `tests/Feature/Policies/UserPolicyTest.php`

- [ ] **Step 1: Escrever teste falhando para UserPolicy**

`tests/Feature/Policies/UserPolicyTest.php`:

```php
<?php

use App\Enums\PapelEnum;
use App\Models\User;
use App\Policies\UserPolicy;

beforeEach(function (): void {
    $this->policy = new UserPolicy();
});

it('aluno não acessa nada', function (): void {
    $aluno = User::factory()->create(['papel' => PapelEnum::ALUNO]);
    $alvo = User::factory()->create(['papel' => PapelEnum::ALUNO]);

    expect($this->policy->viewAny($aluno))->toBeFalse()
        ->and($this->policy->update($aluno, $alvo))->toBeFalse()
        ->and($this->policy->delete($aluno, $alvo))->toBeFalse();
});

it('admin gerencia alunos mas não admin/superuser', function (): void {
    $admin = User::factory()->create(['papel' => PapelEnum::ADMIN]);
    $aluno = User::factory()->create(['papel' => PapelEnum::ALUNO]);
    $outroAdmin = User::factory()->create(['papel' => PapelEnum::ADMIN]);
    $superuser = User::factory()->create(['papel' => PapelEnum::SUPERUSER]);

    expect($this->policy->viewAny($admin))->toBeTrue()
        ->and($this->policy->update($admin, $aluno))->toBeTrue()
        ->and($this->policy->delete($admin, $aluno))->toBeTrue()
        ->and($this->policy->update($admin, $outroAdmin))->toBeFalse()
        ->and($this->policy->delete($admin, $outroAdmin))->toBeFalse()
        ->and($this->policy->update($admin, $superuser))->toBeFalse();
});

it('superuser gerencia tudo exceto a si próprio em delete', function (): void {
    $superuser = User::factory()->create(['papel' => PapelEnum::SUPERUSER]);
    $admin = User::factory()->create(['papel' => PapelEnum::ADMIN]);
    $outro = User::factory()->create(['papel' => PapelEnum::SUPERUSER]);

    expect($this->policy->update($superuser, $admin))->toBeTrue()
        ->and($this->policy->delete($superuser, $admin))->toBeTrue()
        ->and($this->policy->delete($superuser, $outro))->toBeTrue()
        ->and($this->policy->delete($superuser, $superuser))->toBeFalse();
});

it('admin não cria admin/superuser; superuser cria qualquer', function (): void {
    $admin = User::factory()->create(['papel' => PapelEnum::ADMIN]);
    $superuser = User::factory()->create(['papel' => PapelEnum::SUPERUSER]);

    expect($this->policy->createWithRole($admin, PapelEnum::ALUNO))->toBeTrue()
        ->and($this->policy->createWithRole($admin, PapelEnum::ADMIN))->toBeFalse()
        ->and($this->policy->createWithRole($admin, PapelEnum::SUPERUSER))->toBeFalse()
        ->and($this->policy->createWithRole($superuser, PapelEnum::ADMIN))->toBeTrue()
        ->and($this->policy->createWithRole($superuser, PapelEnum::SUPERUSER))->toBeTrue();
});
```

- [ ] **Step 2: Rodar e verificar falha**

```bash
./vendor/bin/pest tests/Feature/Policies/UserPolicyTest.php --compact
```

Expected: FAIL — `UserPolicy` não existe.

- [ ] **Step 3: Implementar UserPolicy**

`app/Policies/UserPolicy.php`:

```php
<?php

namespace App\Policies;

use App\Enums\PapelEnum;
use App\Models\User;

class UserPolicy
{
    public function viewAny(User $actor): bool
    {
        return $actor->isAdmin();
    }

    public function view(User $actor, User $alvo): bool
    {
        return $actor->isAdmin();
    }

    public function create(User $actor): bool
    {
        return $actor->isAdmin();
    }

    public function createWithRole(User $actor, PapelEnum $papel): bool
    {
        if (! $actor->isAdmin()) {
            return false;
        }

        if ($papel === PapelEnum::ALUNO) {
            return true;
        }

        return $actor->papel === PapelEnum::SUPERUSER;
    }

    public function update(User $actor, User $alvo): bool
    {
        if (! $actor->isAdmin()) {
            return false;
        }

        if ($alvo->papel === PapelEnum::ALUNO) {
            return true;
        }

        return $actor->papel === PapelEnum::SUPERUSER;
    }

    public function delete(User $actor, User $alvo): bool
    {
        if (! $actor->isAdmin()) {
            return false;
        }

        if ($actor->id === $alvo->id) {
            return false;
        }

        if ($alvo->papel === PapelEnum::ALUNO) {
            return true;
        }

        return $actor->papel === PapelEnum::SUPERUSER;
    }
}
```

- [ ] **Step 4: Registrar policies em AppServiceProvider**

Em `app/Providers/AppServiceProvider.php`, adicionar imports e dentro de `boot()`:

```php
use App\Models\ChamadoSuporte;
use App\Models\Curso;
use App\Models\User;
use App\Policies\ChamadoSuportePolicy;
use App\Policies\CursoPolicy;
use App\Policies\UserPolicy;
use Illuminate\Support\Facades\Gate;

public function boot(): void
{
    Gate::policy(User::class, UserPolicy::class);
    Gate::policy(Curso::class, CursoPolicy::class);
    Gate::policy(ChamadoSuporte::class, ChamadoSuportePolicy::class);
}
```

- [ ] **Step 5: Implementar CursoPolicy e ChamadoSuportePolicy**

`app/Policies/CursoPolicy.php`:

```php
<?php

namespace App\Policies;

use App\Models\Curso;
use App\Models\User;

class CursoPolicy
{
    public function viewAny(User $actor): bool { return $actor->isAdmin(); }
    public function view(User $actor, Curso $curso): bool { return $actor->isAdmin(); }
    public function create(User $actor): bool { return $actor->isAdmin(); }
    public function update(User $actor, Curso $curso): bool { return $actor->isAdmin(); }
    public function delete(User $actor, Curso $curso): bool { return $actor->isAdmin(); }
}
```

`app/Policies/ChamadoSuportePolicy.php`:

```php
<?php

namespace App\Policies;

use App\Models\ChamadoSuporte;
use App\Models\User;

class ChamadoSuportePolicy
{
    public function viewAny(User $actor): bool { return $actor->isAdmin(); }
    public function view(User $actor, ChamadoSuporte $chamado): bool { return $actor->isAdmin(); }
    public function respond(User $actor, ChamadoSuporte $chamado): bool { return $actor->isAdmin(); }
    public function resolve(User $actor, ChamadoSuporte $chamado): bool { return $actor->isAdmin(); }
}
```

- [ ] **Step 6: Verificar verde e formatar**

```bash
./vendor/bin/pest tests/Feature/Policies --compact
vendor/bin/pint --dirty --format agent
```

Expected: 4 testes PASS.

- [ ] **Step 7: Commit**

```bash
git add app/Policies app/Providers/AppServiceProvider.php tests/Feature/Policies
git commit -m "feat(admin): policies para Curso, User (gating por papel) e ChamadoSuporte"
```

### Task 0.4: AdminLayout com header (logout + voltar à plataforma + breadcrumbs)

**Files:**
- Modify: `resources/js/layouts/AdminLayout.tsx`
- Create: `resources/js/components/admin/AdminHeader.tsx`
- Create: `resources/js/components/admin/UserMenu.tsx`
- Create: `resources/js/components/admin/Breadcrumbs.tsx`
- Create: `resources/js/components/ui/dropdown-menu.tsx`

- [ ] **Step 1: Criar wrapper UI dropdown-menu**

`resources/js/components/ui/dropdown-menu.tsx`:

```tsx
import { Menu } from '@base-ui/react'
import type { ReactNode } from 'react'

export function DropdownMenu({ trigger, children, align = 'end' }: {
    trigger: ReactNode
    children: ReactNode
    align?: 'start' | 'center' | 'end'
}) {
    return (
        <Menu.Root>
            <Menu.Trigger render={(props) => <button type="button" {...props}>{trigger}</button>} />
            <Menu.Portal>
                <Menu.Positioner align={align} sideOffset={6}>
                    <Menu.Popup className="min-w-[220px] rounded-xl border border-border bg-surface-2 p-1 shadow-2xl shadow-black/40">
                        {children}
                    </Menu.Popup>
                </Menu.Positioner>
            </Menu.Portal>
        </Menu.Root>
    )
}

export function DropdownMenuItem({ children, onClick, destructive }: {
    children: ReactNode
    onClick?: () => void
    destructive?: boolean
}) {
    return (
        <Menu.Item
            onClick={onClick}
            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm cursor-pointer outline-none ${
                destructive
                    ? 'text-accent hover:bg-accent/10'
                    : 'text-foreground hover:bg-surface-3'
            }`}
        >
            {children}
        </Menu.Item>
    )
}

export function DropdownMenuSeparator() {
    return <Menu.Separator className="my-1 h-px bg-border" />
}
```

- [ ] **Step 2: Criar Breadcrumbs**

`resources/js/components/admin/Breadcrumbs.tsx`:

```tsx
import { Link } from '@inertiajs/react'
import { ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'

export type Crumb = { label: string; href?: string }

export function Breadcrumbs({ items }: { items: Crumb[] }) {
    return (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-foreground-muted">
            {items.map((item, i) => {
                const last = i === items.length - 1
                const node: ReactNode = item.href && !last
                    ? <Link href={item.href} className="hover:text-foreground transition-colors">{item.label}</Link>
                    : <span className={last ? 'text-foreground font-medium' : ''}>{item.label}</span>
                return (
                    <span key={i} className="flex items-center gap-1.5">
                        {node}
                        {!last && <ChevronRight size={12} aria-hidden="true" className="text-foreground-faint" />}
                    </span>
                )
            })}
        </nav>
    )
}
```

- [ ] **Step 3: Criar UserMenu (papel só dentro do popup, não duplicar)**

`resources/js/components/admin/UserMenu.tsx`:

```tsx
import { router } from '@inertiajs/react'
import { ChevronDown, ExternalLink, LogOut, User as UserIcon } from 'lucide-react'
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'

type Props = {
    name: string
    email: string
    papel: 'aluno' | 'admin' | 'superuser'
}

const PAPEL_LABEL = { aluno: 'Aluno', admin: 'Admin', superuser: 'Superuser' } as const
const PAPEL_TONE = {
    aluno: 'bg-surface-3 text-foreground-muted',
    admin: 'bg-accent/15 text-accent',
    superuser: 'bg-warning/15 text-warning',
} as const

export function UserMenu({ name, email, papel }: Props) {
    const initials = name.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase()
    const firstName = name.split(' ')[0]

    return (
        <DropdownMenu
            trigger={
                <span className="flex items-center gap-2 rounded-full p-1 pr-3 hover:bg-surface-2 transition-colors">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-accent/15 text-[11px] font-medium text-accent">
                        {initials}
                    </span>
                    <span className="hidden sm:block text-sm text-foreground">{firstName}</span>
                    <ChevronDown size={12} className="text-foreground-subtle" aria-hidden="true" />
                </span>
            }
        >
            {/* Header do popup: nome + email + chip de papel inline */}
            <div className="px-3 py-3 border-b border-border">
                <p className="text-sm font-medium text-foreground truncate">{name}</p>
                <div className="flex items-center gap-2 mt-1 min-w-0">
                    <p className="text-xs text-foreground-muted truncate min-w-0 flex-1">{email}</p>
                    <span className={`shrink-0 inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.14em] ${PAPEL_TONE[papel]}`}>
                        {PAPEL_LABEL[papel]}
                    </span>
                </div>
            </div>
            <div className="p-1">
                <DropdownMenuItem onClick={() => router.visit('/')}>
                    <ExternalLink size={14} aria-hidden="true" /> Voltar à plataforma
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.visit('/dashboard')}>
                    <UserIcon size={14} aria-hidden="true" /> Minha área
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem destructive onClick={() => router.post('/logout')}>
                    <LogOut size={14} aria-hidden="true" /> Sair
                </DropdownMenuItem>
            </div>
        </DropdownMenu>
    )
}
```

- [ ] **Step 4: Criar AdminHeader (composição editorial)**

`resources/js/components/admin/AdminHeader.tsx`:

```tsx
import { Link } from '@inertiajs/react'
import { Breadcrumbs, type Crumb } from './Breadcrumbs'
import { UserMenu } from './UserMenu'

type AuthUser = { name: string; email: string; papel: 'aluno' | 'admin' | 'superuser' }

export function AdminHeader({ breadcrumbs, user }: { breadcrumbs: Crumb[]; user: AuthUser }) {
    return (
        <header className="sticky top-0 z-30 border-b border-border bg-surface/85 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-8 px-8 h-16">
                {/* Esquerda: pista "← Plataforma" como eyebrow tipográfico + breadcrumbs */}
                <div className="flex items-center gap-5 min-w-0">
                    <Link href="/" className="group flex items-center gap-1.5">
                        <span className="text-foreground-subtle group-hover:text-foreground transition-colors">←</span>
                        <span className="text-[10px] uppercase tracking-[0.22em] text-foreground-subtle group-hover:text-foreground transition-colors">
                            Plataforma
                        </span>
                    </Link>
                    <span className="h-3.5 w-px bg-border-strong shrink-0" aria-hidden="true" />
                    <Breadcrumbs items={breadcrumbs} />
                </div>

                {/* Direita: kbd hint (futuro: command palette) + UserMenu */}
                <div className="flex items-center gap-2 shrink-0">
                    <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 h-6 rounded-md border border-border bg-surface-2 text-[10px] font-mono text-foreground-subtle">
                        <span>⌘</span><span>K</span>
                    </kbd>
                    <UserMenu name={user.name} email={user.email} papel={user.papel} />
                </div>
            </div>
        </header>
    )
}
```

> **Nota:** o `⌘K` é puramente decorativo nesta fase — sinaliza intent de command palette futura. Manter ou remover é decisão de execução.

- [ ] **Step 5: Reescrever AdminLayout**

`resources/js/layouts/AdminLayout.tsx`:

```tsx
import { usePage } from '@inertiajs/react'
import type { PropsWithChildren } from 'react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminHeader } from '@/components/admin/AdminHeader'
import type { Crumb } from '@/components/admin/Breadcrumbs'
import { useFlashToast } from '@/hooks/use-flash-toast'

type SharedAuth = {
    user: { name: string; email: string; papel: 'aluno' | 'admin' | 'superuser' }
}

type Props = PropsWithChildren<{ breadcrumbs?: Crumb[] }>

export default function AdminLayout({ children, breadcrumbs = [] }: Props) {
    const { url, props } = usePage<{ auth: SharedAuth }>()
    useFlashToast()

    const crumbs: Crumb[] = [{ label: 'Admin', href: '/admin' }, ...breadcrumbs]

    return (
        <div className="min-h-screen flex bg-surface text-foreground">
            <AdminSidebar current={url} />
            <div className="flex-1 min-w-0 flex flex-col">
                <AdminHeader breadcrumbs={crumbs} user={props.auth.user} />
                <main className="flex-1">
                    <div className="mx-auto w-full max-w-7xl px-8 py-10">{children}</div>
                </main>
            </div>
        </div>
    )
}
```

- [ ] **Step 6: Atualizar páginas admin existentes para passar breadcrumbs**

Em `resources/js/Pages/Admin/Dashboard.tsx`, encontrar `<AdminLayout>` e adicionar prop:

```tsx
<AdminLayout breadcrumbs={[{ label: 'Dashboard' }]}>
```

Em `resources/js/Pages/Admin/Cursos/Index.tsx`:

```tsx
<AdminLayout breadcrumbs={[{ label: 'Cursos' }]}>
```

Em `resources/js/Pages/Admin/Cursos/Import.tsx`:

```tsx
<AdminLayout breadcrumbs={[{ label: 'Cursos', href: '/admin/cursos' }, { label: 'Importar do YouTube' }]}>
```

- [ ] **Step 7: Verificar build + smoke teste**

```bash
bun run build
./vendor/bin/pest tests/Feature/Admin --compact
```

Expected: build ok, testes existentes continuam verdes.

- [ ] **Step 8: Commit**

```bash
git add resources/js/layouts/AdminLayout.tsx resources/js/components/admin resources/js/components/ui/dropdown-menu.tsx resources/js/Pages/Admin
git commit -m "feat(admin): header com logout, voltar à plataforma e breadcrumbs"
```

### Task 0.5: Sidebar expandido + scaffold de rotas vazias

**Files:**
- Modify: `resources/js/components/admin/AdminSidebar.tsx`
- Modify: `routes/web.php`
- Create: `app/Http/Controllers/Admin/AdminUserController.php` (stub vazio)
- Create: `app/Http/Controllers/Admin/AdminChamadoController.php` (stub vazio)

- [ ] **Step 1: Atualizar AdminSidebar**

`resources/js/components/admin/AdminSidebar.tsx` — substituir array `ITEMS`:

```tsx
import { Link } from '@inertiajs/react'
import {
    GraduationCap,
    LayoutDashboard,
    LifeBuoy,
    Users,
    type LucideIcon,
} from 'lucide-react'

type Item = { href: string; label: string; Icon: LucideIcon }

const SECTIONS: { title: string; items: Item[] }[] = [
    {
        title: 'Visão geral',
        items: [{ href: '/admin', label: 'Dashboard', Icon: LayoutDashboard }],
    },
    {
        title: 'Conteúdo',
        items: [{ href: '/admin/cursos', label: 'Cursos', Icon: GraduationCap }],
    },
    {
        title: 'Comunidade',
        items: [
            { href: '/admin/usuarios', label: 'Usuários', Icon: Users },
            { href: '/admin/suporte', label: 'Suporte', Icon: LifeBuoy },
        ],
    },
]

export function AdminSidebar({ current }: { current: string }) {
    return (
        <aside className="w-60 shrink-0 border-r border-border bg-surface-2 min-h-screen sticky top-0 flex flex-col">
            <div className="px-6 py-5 border-b border-border">
                <p className="text-[10px] uppercase tracking-[0.18em] text-foreground-muted">Admin</p>
                <p className="text-foreground font-semibold">ArturFlix</p>
            </div>
            <nav className="flex-1 p-3 space-y-5" aria-label="Navegação do admin">
                {SECTIONS.map((section) => (
                    <div key={section.title}>
                        <p className="px-3 mb-1.5 text-[10px] uppercase tracking-[0.16em] text-foreground-subtle">{section.title}</p>
                        <div className="space-y-0.5">
                            {section.items.map(({ href, label, Icon }) => {
                                const active = current === href || (href !== '/admin' && current.startsWith(href))
                                return (
                                    <Link
                                        key={href}
                                        href={href}
                                        aria-current={active ? 'page' : undefined}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                                            active
                                                ? 'bg-accent/10 text-accent'
                                                : 'text-foreground-muted hover:text-foreground hover:bg-surface-3'
                                        }`}
                                    >
                                        <Icon size={16} aria-hidden="true" />
                                        <span>{label}</span>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </nav>
        </aside>
    )
}
```

- [ ] **Step 2: Criar controllers stub**

```bash
php artisan make:controller Admin/AdminUserController --no-interaction
php artisan make:controller Admin/AdminChamadoController --no-interaction
php artisan make:controller Admin/AdminModuloController --no-interaction
php artisan make:controller Admin/AdminAulaController --no-interaction
```

Cada um receberá métodos nas respectivas tasks da Fase 1, 2 e 3.

- [ ] **Step 3: Atualizar `routes/web.php`**

Substituir o grupo `Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(...)` por:

```php
use App\Http\Controllers\Admin\AdminAulaController;
use App\Http\Controllers\Admin\AdminChamadoController;
use App\Http\Controllers\Admin\AdminCursoController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminModuloController;
use App\Http\Controllers\Admin\AdminUserController;

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function (): void {
    Route::get('/', AdminDashboardController::class)->name('dashboard');

    // Cursos
    Route::get('/cursos', [AdminCursoController::class, 'index'])->name('cursos.index');
    Route::get('/cursos/criar', [AdminCursoController::class, 'create'])->name('cursos.create');
    Route::post('/cursos', [AdminCursoController::class, 'store'])->name('cursos.store');
    Route::get('/cursos/importar', [AdminCursoController::class, 'importForm'])->name('cursos.import.form');
    Route::post('/cursos/importar', [AdminCursoController::class, 'import'])->name('cursos.import');
    Route::get('/cursos/{curso:public_id}', [AdminCursoController::class, 'edit'])->name('cursos.edit');
    Route::put('/cursos/{curso:public_id}', [AdminCursoController::class, 'update'])->name('cursos.update');
    Route::delete('/cursos/{curso:public_id}', [AdminCursoController::class, 'destroy'])->name('cursos.destroy');

    // Módulos (escopo: curso)
    Route::post('/cursos/{curso:public_id}/modulos', [AdminModuloController::class, 'store'])->name('modulos.store');
    Route::put('/cursos/{curso:public_id}/modulos/reordenar', [AdminModuloController::class, 'reorder'])->name('modulos.reorder');
    Route::get('/modulos/{modulo:public_id}', [AdminModuloController::class, 'edit'])->name('modulos.edit');
    Route::put('/modulos/{modulo:public_id}', [AdminModuloController::class, 'update'])->name('modulos.update');
    Route::delete('/modulos/{modulo:public_id}', [AdminModuloController::class, 'destroy'])->name('modulos.destroy');

    // Aulas (escopo: módulo)
    Route::post('/modulos/{modulo:public_id}/aulas', [AdminAulaController::class, 'store'])->name('aulas.store');
    Route::put('/modulos/{modulo:public_id}/aulas/reordenar', [AdminAulaController::class, 'reorder'])->name('aulas.reorder');
    Route::get('/aulas/{aula:public_id}', [AdminAulaController::class, 'edit'])->name('aulas.edit');
    Route::put('/aulas/{aula:public_id}', [AdminAulaController::class, 'update'])->name('aulas.update');
    Route::delete('/aulas/{aula:public_id}', [AdminAulaController::class, 'destroy'])->name('aulas.destroy');

    // Usuários
    Route::get('/usuarios', [AdminUserController::class, 'index'])->name('usuarios.index');
    Route::get('/usuarios/criar', [AdminUserController::class, 'create'])->name('usuarios.create');
    Route::post('/usuarios', [AdminUserController::class, 'store'])->name('usuarios.store');
    Route::get('/usuarios/{user:public_id}', [AdminUserController::class, 'edit'])->name('usuarios.edit');
    Route::put('/usuarios/{user:public_id}', [AdminUserController::class, 'update'])->name('usuarios.update');
    Route::delete('/usuarios/{user:public_id}', [AdminUserController::class, 'destroy'])->name('usuarios.destroy');

    // Chamados de suporte
    Route::get('/suporte', [AdminChamadoController::class, 'index'])->name('suporte.index');
    Route::get('/suporte/{chamado:public_id}', [AdminChamadoController::class, 'show'])->name('suporte.show');
    Route::post('/suporte/{chamado:public_id}/responder', [AdminChamadoController::class, 'respond'])->name('suporte.respond');
    Route::post('/suporte/{chamado:public_id}/resolver', [AdminChamadoController::class, 'resolve'])->name('suporte.resolve');
});
```

> Nota sobre route model binding por `public_id`: o trait `HasPublicId` precisa expor `getRouteKeyName()`. Verificar; se não expõe, adicionar nas próximas tasks o método `public function getRouteKeyName(): string { return 'public_id'; }` em cada Model relevante (Curso, Modulo, Aula, User, ChamadoSuporte) — alternativamente, declarar isso no trait (preferível, em uma única vez).

- [ ] **Step 4: Garantir route key = public_id**

Editar `app/Concerns/HasPublicId.php` se ainda não tiver: adicionar

```php
public function getRouteKeyName(): string
{
    return 'public_id';
}
```

Se preferir não tornar global no trait, adicionar individualmente em `Curso`, `Modulo`, `Aula`, `ChamadoSuporte`. Para `User`, manter `id` como default e usar binding explícito por rota como já feito acima (`{user:public_id}`).

- [ ] **Step 5: Verificar rotas**

```bash
php artisan route:list --path=admin
```

Expected: todas as rotas listadas, sem erros de controller missing.

- [ ] **Step 6: Verificar build e testes**

```bash
bun run build
./vendor/bin/pest tests/Feature/Admin --compact
```

Expected: build ok; testes existentes verdes (controllers stub não respondem ainda, mas rotas carregam).

- [ ] **Step 7: Commit**

```bash
vendor/bin/pint --dirty --format agent
git add app/ resources/js/components/admin/AdminSidebar.tsx routes/web.php
git commit -m "feat(admin): sidebar com seções + scaffold de rotas para Cursos/Módulos/Aulas/Usuários/Suporte"
```

---

## Fase 1 — CRUD de Cursos, Módulos e Aulas

### Task 1.0: Refatorar Badge com sistema tone+variant

> **Por quê:** o plano usa status badges em 4 lugares (Cursos/Index "Origem", Usuarios/Index "Papel", Suporte/Index "Status", Suporte/Show "Status"). Sem um Badge unificado, cada página vai dessincronizar cores/ícones. Linear e Stripe têm sistema único; nós também.

**Files:**
- Modify: `resources/js/components/ui/badge.tsx`
- Create: `resources/js/lib/status-tones.ts`

- [ ] **Step 1: Rewrite Badge**

`resources/js/components/ui/badge.tsx`:

```tsx
import type { ReactNode } from 'react'

type Tone = 'neutral' | 'accent' | 'warning' | 'success' | 'info'
type Variant = 'soft' | 'outline' | 'solid'

const TONE: Record<Tone, Record<Variant, string>> = {
    neutral: {
        soft: 'bg-surface-3 text-foreground-muted',
        outline: 'border border-border text-foreground-muted',
        solid: 'bg-foreground text-canvas',
    },
    accent: {
        soft: 'bg-accent/12 text-accent',
        outline: 'border border-accent/40 text-accent',
        solid: 'bg-accent text-white',
    },
    warning: {
        soft: 'bg-warning/12 text-warning',
        outline: 'border border-warning/40 text-warning',
        solid: 'bg-warning text-canvas',
    },
    success: {
        soft: 'bg-success/12 text-success',
        outline: 'border border-success/40 text-success',
        solid: 'bg-success text-white',
    },
    info: {
        soft: 'bg-blue-500/12 text-blue-300',
        outline: 'border border-blue-500/40 text-blue-300',
        solid: 'bg-blue-500 text-white',
    },
}

type Props = {
    tone?: Tone
    variant?: Variant
    dot?: boolean
    pulse?: boolean
    children: ReactNode
}

export function Badge({ tone = 'neutral', variant = 'soft', dot, pulse, children }: Props) {
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] ${TONE[tone][variant]}`}>
            {dot && (
                <span className="relative inline-flex h-1.5 w-1.5">
                    {pulse && <span className="absolute inset-0 rounded-full bg-current opacity-75 animate-ping" />}
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current" />
                </span>
            )}
            {children}
        </span>
    )
}
```

- [ ] **Step 2: Mapeamentos de domínio em um único arquivo**

`resources/js/lib/status-tones.ts`:

```ts
type Tone = 'neutral' | 'accent' | 'warning' | 'success'

export const PAPEL_TONE: Record<'aluno' | 'admin' | 'superuser', Tone> = {
    aluno: 'neutral',
    admin: 'accent',
    superuser: 'warning',
}
export const PAPEL_LABEL = { aluno: 'Aluno', admin: 'Admin', superuser: 'Superuser' } as const

export const STATUS_CHAMADO_TONE: Record<'novo' | 'em_andamento' | 'resolvido', Tone> = {
    novo: 'accent',
    em_andamento: 'warning',
    resolvido: 'success',
}
export const STATUS_CHAMADO_LABEL = { novo: 'Novo', em_andamento: 'Em andamento', resolvido: 'Resolvido' } as const

export const TIPO_AULA_LABEL = { video: 'Vídeo', texto: 'Texto', quiz: 'Quiz' } as const
```

- [ ] **Step 3: Build + commit**

```bash
bun run build
git add resources/js/components/ui/badge.tsx resources/js/lib/status-tones.ts
git commit -m "feat(ui): badge unificado tone+variant + mapeamentos de domínio"
```

> Todas as próximas pages (Tasks 1.3, 2.2, 3.4) devem importar `Badge` + mapeamentos daqui, em vez de redefinir cores inline.

### Task 1.1: Componentes UI base reutilizáveis

**Files:**
- Create: `resources/js/components/ui/dialog.tsx`
- Create: `resources/js/components/ui/textarea.tsx`
- Create: `resources/js/components/ui/select.tsx`
- Create: `resources/js/components/ui/switch.tsx`
- Create: `resources/js/components/ui/skeleton.tsx`
- Create: `resources/js/components/ui/confirm-dialog.tsx`
- Create: `resources/js/components/admin/PageHeader.tsx`
- Create: `resources/js/components/admin/EmptyState.tsx`
- Create: `resources/js/components/admin/DataTable.tsx`

> Esta task cria componentes que serão reutilizados em todas as próximas pages. Cada componente segue a paleta dark já definida (`#0d1016`, `#0a0c12`, `#12151b`, `#1e2430`, `#E50914`).

- [ ] **Step 1: Dialog**

`resources/js/components/ui/dialog.tsx`:

```tsx
import { Dialog as BaseDialog } from '@base-ui/react'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'

type Props = {
    open: boolean
    onOpenChange: (v: boolean) => void
    title: string
    description?: string
    children: ReactNode
    footer?: ReactNode
    size?: 'sm' | 'md' | 'lg' | 'xl'
}

const SIZE = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' } as const

export function Dialog({ open, onOpenChange, title, description, children, footer, size = 'md' }: Props) {
    return (
        <BaseDialog.Root open={open} onOpenChange={onOpenChange}>
            <BaseDialog.Portal>
                <BaseDialog.Backdrop className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />
                <BaseDialog.Popup
                    className={`fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[92vw] ${SIZE[size]} rounded-2xl border border-border bg-surface shadow-2xl shadow-black/60 outline-none`}
                >
                    <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-border">
                        <div className="min-w-0">
                            <BaseDialog.Title className="text-base font-semibold text-foreground truncate">{title}</BaseDialog.Title>
                            {description && (
                                <BaseDialog.Description className="text-xs text-foreground-muted mt-1">{description}</BaseDialog.Description>
                            )}
                        </div>
                        <BaseDialog.Close className="text-foreground-muted hover:text-foreground transition-colors -mt-1" aria-label="Fechar">
                            <X size={18} />
                        </BaseDialog.Close>
                    </div>
                    <div className="px-6 py-5">{children}</div>
                    {footer && <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3">{footer}</div>}
                </BaseDialog.Popup>
            </BaseDialog.Portal>
        </BaseDialog.Root>
    )
}
```

- [ ] **Step 2: ConfirmDialog (variant destructive próprio com nome do item)**

`resources/js/components/ui/confirm-dialog.tsx`:

```tsx
import { AlertTriangle } from 'lucide-react'
import { Dialog } from './dialog'
import { Button } from './button'

type Props = {
    open: boolean
    onOpenChange: (v: boolean) => void
    title: string
    description: string
    /** Nome/identificador do item afetado — renderizado em chip mono, dá segurança ao admin. */
    item?: string
    confirmLabel?: string
    onConfirm: () => void
    loading?: boolean
    destructive?: boolean
}

export function ConfirmDialog({
    open, onOpenChange, title, description, item,
    confirmLabel = 'Confirmar', onConfirm, loading, destructive = true,
}: Props) {
    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
            title={title}
            size="sm"
            footer={
                <>
                    {/* Cancelar como link discreto, não botão peso-igual */}
                    <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                        className="text-sm text-foreground-muted hover:text-foreground px-2 py-1.5 transition-colors disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <Button
                        variant={destructive ? 'destructive' : 'default'}
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? 'Processando…' : confirmLabel}
                    </Button>
                </>
            }
        >
            {/* Hairline accent no topo — sinal sutil de "atenção" */}
            {destructive && (
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-60 pointer-events-none" />
            )}
            <div className="flex gap-4">
                {destructive && (
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent/12 text-accent">
                        <AlertTriangle size={18} aria-hidden="true" />
                    </div>
                )}
                <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground-muted leading-relaxed">{description}</p>
                    {item && (
                        <div className="mt-3 px-3 py-2 rounded-lg bg-surface-3 border border-border">
                            <p className="font-mono text-xs text-foreground truncate">{item}</p>
                        </div>
                    )}
                </div>
            </div>
        </Dialog>
    )
}
```

> Adicionar variant `destructive` ao `Button` existente (já tem em [button.tsx](resources/js/components/ui/button.tsx)) — verificar que está mapeada para `bg-accent text-white hover:bg-accent/90`. O button atual usa `bg-destructive/10 text-destructive` (variant soft). Adicionar nova variant `destructive-solid` se necessário, ou trocar o mapeamento de `destructive` para solid.

**Uso típico:**

```tsx
<ConfirmDialog
    destructive
    title="Excluir curso"
    description="Esta ação remove o curso e todos os módulos e aulas. Não pode ser desfeita."
    item={curso.titulo}
    confirmLabel="Excluir definitivamente"
    onConfirm={confirmDelete}
    loading={deleting}
/>
```

- [ ] **Step 3: Textarea, Select, Switch, Skeleton**

`resources/js/components/ui/textarea.tsx`:

```tsx
import type { TextareaHTMLAttributes } from 'react'

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }

export function Textarea({ className = '', invalid, ...props }: Props) {
    return (
        <textarea
            {...props}
            aria-invalid={invalid || undefined}
            className={`w-full rounded-lg border bg-surface-2 px-3.5 py-2.5 text-sm text-foreground placeholder:text-foreground-subtle resize-y min-h-[100px] outline-none transition-colors ${
                invalid
                    ? 'border-accent focus:border-accent'
                    : 'border-border focus:border-border-strong'
            } ${className}`}
        />
    )
}
```

`resources/js/components/ui/select.tsx`:

```tsx
import type { SelectHTMLAttributes } from 'react'

type Props = SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }

export function Select({ className = '', invalid, children, ...props }: Props) {
    return (
        <select
            {...props}
            aria-invalid={invalid || undefined}
            className={`w-full rounded-lg border bg-surface-2 px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors ${
                invalid ? 'border-accent' : 'border-border focus:border-border-strong'
            } ${className}`}
        >
            {children}
        </select>
    )
}
```

`resources/js/components/ui/switch.tsx`:

```tsx
import { Switch as BaseSwitch } from '@base-ui/react'

export function Switch({ checked, onCheckedChange, label }: {
    checked: boolean
    onCheckedChange: (v: boolean) => void
    label: string
}) {
    return (
        <label className="flex items-center gap-3 cursor-pointer">
            <BaseSwitch.Root
                checked={checked}
                onCheckedChange={onCheckedChange}
                className="relative h-5 w-9 rounded-full bg-border data-[checked]:bg-accent transition-colors"
            >
                <BaseSwitch.Thumb className="block h-4 w-4 rounded-full bg-white translate-x-0.5 data-[checked]:translate-x-[18px] transition-transform" />
            </BaseSwitch.Root>
            <span className="text-sm text-foreground">{label}</span>
        </label>
    )
}
```

`resources/js/components/ui/skeleton.tsx`:

```tsx
export function Skeleton({ className = '' }: { className?: string }) {
    return <div className={`animate-pulse rounded-md bg-surface-3 ${className}`} aria-hidden="true" />
}
```

- [ ] **Step 4: PageHeader (font-display editorial)**

`resources/js/components/admin/PageHeader.tsx`:

```tsx
import type { ReactNode } from 'react'

type Props = {
    eyebrow?: string
    title: string
    description?: string
    actions?: ReactNode
}

export function PageHeader({ eyebrow, title, description, actions }: Props) {
    return (
        <div className="flex items-start justify-between gap-8 mb-10">
            <div className="min-w-0">
                {eyebrow && (
                    <p className="text-[10px] uppercase tracking-[0.22em] text-foreground-subtle mb-3">{eyebrow}</p>
                )}
                <h1 className="font-display text-[34px] leading-[1.05] text-foreground">{title}</h1>
                {description && <p className="text-sm text-foreground-muted mt-3 max-w-xl leading-relaxed">{description}</p>}
            </div>
            {actions && <div className="flex items-center gap-2 shrink-0 pt-1">{actions}</div>}
        </div>
    )
}
```

> **Detalhe-chave:** `font-display` (Fraunces) com `34px` é o que separa este painel de "Tailwind admin template". O serif aparece só em títulos de página — body continua Geist.

- [ ] **Step 5: EmptyState com 3 variants**

`resources/js/components/admin/EmptyState.tsx`:

```tsx
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

type Variant = 'first-time' | 'filtered' | 'cleared'

type Props = {
    variant?: Variant
    Icon?: LucideIcon
    eyebrow?: string
    title: string
    description: string
    primary?: ReactNode
    secondary?: ReactNode
}

export function EmptyState({ variant = 'first-time', Icon, eyebrow, title, description, primary, secondary }: Props) {
    return (
        <div className="relative overflow-hidden rounded-2xl border border-dashed border-border bg-surface-2/40 px-8 py-20 text-center">
            {/* Dotted grid texture — apenas em first-time */}
            {variant === 'first-time' && (
                <div
                    className="absolute inset-0 opacity-[0.05] pointer-events-none"
                    style={{
                        backgroundImage: 'radial-gradient(circle, rgb(244 245 247) 1px, transparent 1px)',
                        backgroundSize: '22px 22px',
                    }}
                    aria-hidden="true"
                />
            )}
            <div className="relative">
                {Icon && (
                    <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-surface-3 text-foreground-muted mb-5">
                        <Icon size={20} aria-hidden="true" />
                    </div>
                )}
                {eyebrow && (
                    <p className="text-[10px] uppercase tracking-[0.22em] text-foreground-subtle mb-3">{eyebrow}</p>
                )}
                <h3 className="font-display text-xl text-foreground">{title}</h3>
                <p className="text-sm text-foreground-muted mt-2 max-w-md mx-auto leading-relaxed">{description}</p>
                {(primary || secondary) && (
                    <div className="mt-6 flex items-center justify-center gap-2">
                        {primary}
                        {secondary}
                    </div>
                )}
            </div>
        </div>
    )
}
```

- [ ] **Step 6: DataTable genérico (sticky header + signature accent-bar)**

`resources/js/components/admin/DataTable.tsx`:

```tsx
import type { ReactNode } from 'react'

export type Column<T> = {
    key: string
    header: string
    align?: 'left' | 'right' | 'center'
    width?: string
    render: (row: T) => ReactNode
}

type Props<T> = {
    rows: T[]
    columns: Column<T>[]
    rowKey: (row: T) => string
    onRowClick?: (row: T) => void
    empty?: ReactNode
}

export function DataTable<T>({ rows, columns, rowKey, onRowClick, empty }: Props<T>) {
    if (rows.length === 0 && empty) return <>{empty}</>

    return (
        <div className="overflow-hidden rounded-xl border border-border bg-surface-2">
            <table className="w-full text-sm">
                <thead className="sticky top-16 z-10 bg-surface-2/95 backdrop-blur-sm">
                    <tr>
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                style={col.width ? { width: col.width } : undefined}
                                className={`px-5 h-10 text-[10px] font-medium uppercase tracking-[0.18em] text-foreground-faint border-b border-border ${
                                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                                }`}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr
                            key={rowKey(row)}
                            onClick={onRowClick ? () => onRowClick(row) : undefined}
                            className={`group border-b border-border/50 last:border-0 transition-colors ${
                                onRowClick ? 'cursor-pointer hover:bg-surface-3/40' : ''
                            }`}
                        >
                            {columns.map((col, colIdx) => (
                                <td
                                    key={col.key}
                                    className={`relative px-5 py-3.5 text-foreground ${
                                        col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                                    }`}
                                >
                                    {/* Signature: accent-bar revelada à esquerda no hover (apenas primeira coluna) */}
                                    {colIdx === 0 && onRowClick && (
                                        <span
                                            aria-hidden="true"
                                            className="absolute left-0 top-2.5 bottom-2.5 w-[2px] bg-accent rounded-r scale-y-0 group-hover:scale-y-100 transition-transform origin-center"
                                        />
                                    )}
                                    {col.render(row)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
```

- [ ] **Step 7: Componente Pagination separado**

`resources/js/components/admin/Pagination.tsx`:

```tsx
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { router } from '@inertiajs/react'

type PaginatedMeta = {
    from: number | null
    to: number | null
    total: number
    current_page: number
    last_page: number
    prev_page_url: string | null
    next_page_url: string | null
}

export function Pagination({ meta }: { meta: PaginatedMeta }) {
    if (meta.last_page <= 1) return null

    return (
        <div className="flex items-center justify-between gap-4 px-1 mt-5 text-xs text-foreground-muted">
            <span className="font-mono tabular-nums">
                {meta.from ?? 0}–{meta.to ?? 0} <span className="text-foreground-faint">de</span> {meta.total}
            </span>
            <div className="flex items-center gap-1">
                <button
                    type="button"
                    disabled={!meta.prev_page_url}
                    onClick={() => meta.prev_page_url && router.visit(meta.prev_page_url, { preserveState: true })}
                    aria-label="Página anterior"
                    className="grid h-7 w-7 place-items-center rounded-md text-foreground-muted hover:text-foreground hover:bg-surface-3 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-foreground-muted transition-colors"
                >
                    <ChevronLeft size={14} />
                </button>
                <span className="font-mono tabular-nums px-2">
                    {meta.current_page} <span className="text-foreground-faint">/</span> {meta.last_page}
                </span>
                <button
                    type="button"
                    disabled={!meta.next_page_url}
                    onClick={() => meta.next_page_url && router.visit(meta.next_page_url, { preserveState: true })}
                    aria-label="Próxima página"
                    className="grid h-7 w-7 place-items-center rounded-md text-foreground-muted hover:text-foreground hover:bg-surface-3 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-foreground-muted transition-colors"
                >
                    <ChevronRight size={14} />
                </button>
            </div>
        </div>
    )
}
```

> **Substitui a paginação inline** que estava nas Pages de Usuarios/Index e Suporte/Index. Backend (controllers `index`) precisa expor `from`, `to`, `total`, `current_page`, `last_page`, `prev_page_url`, `next_page_url` no payload — Laravel's `paginate()->withQueryString()` já devolve isso quando se usa `->toResourceCollection()` ou se serializa com `->all()`. Ajuste nos controllers: trocar `'usuarios' => $usuarios` por `'usuarios' => fn () => $usuarios` ou expor `meta` separado.

- [ ] **Step 6: Verificar build**

```bash
bun run build
```

Expected: ok.

- [ ] **Step 7: Commit**

```bash
git add resources/js/components/ui resources/js/components/admin
git commit -m "feat(admin): biblioteca de componentes UI (dialog, confirm, datatable, page header, empty state)"
```

### Task 1.2: Form Requests para Curso (Store + Update)

**Files:**
- Create: `app/Http/Requests/Admin/StoreCursoRequest.php`
- Create: `app/Http/Requests/Admin/UpdateCursoRequest.php`
- Test: `tests/Feature/Admin/AdminCursoCrudTest.php`

- [ ] **Step 1: Escrever teste falhando para criar curso**

`tests/Feature/Admin/AdminCursoCrudTest.php`:

```php
<?php

use App\Enums\PapelEnum;
use App\Models\Curso;
use App\Models\User;

beforeEach(function (): void {
    $this->admin = User::factory()->create(['papel' => PapelEnum::ADMIN]);
});

it('renderiza form de criação para admin', function (): void {
    $this->actingAs($this->admin)
        ->get(route('admin.cursos.create'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('Admin/Cursos/Create'));
});

it('cria curso manual com dados válidos', function (): void {
    $payload = [
        'titulo' => 'Curso de Laravel',
        'descricao' => 'Aprenda Laravel do zero ao deploy.',
        'url_capa' => 'https://exemplo.com/capa.jpg',
    ];

    $this->actingAs($this->admin)
        ->post(route('admin.cursos.store'), $payload)
        ->assertRedirect();

    expect(Curso::where('titulo', 'Curso de Laravel')->exists())->toBeTrue();
});

it('rejeita criação sem título', function (): void {
    $this->actingAs($this->admin)
        ->post(route('admin.cursos.store'), ['descricao' => 'algo'])
        ->assertSessionHasErrors('titulo');
});

it('aluno é proibido de criar curso', function (): void {
    $aluno = User::factory()->create(['papel' => PapelEnum::ALUNO]);

    $this->actingAs($aluno)
        ->post(route('admin.cursos.store'), ['titulo' => 'X'])
        ->assertForbidden();
});
```

- [ ] **Step 2: Rodar e verificar falha**

```bash
./vendor/bin/pest tests/Feature/Admin/AdminCursoCrudTest.php --compact
```

Expected: FAIL — rotas/controllers ainda incompletos.

- [ ] **Step 3: Implementar StoreCursoRequest**

`app/Http/Requests/Admin/StoreCursoRequest.php`:

```php
<?php

namespace App\Http\Requests\Admin;

use App\Models\Curso;
use Illuminate\Foundation\Http\FormRequest;

class StoreCursoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Curso::class) ?? false;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'titulo' => ['required', 'string', 'max:255'],
            'descricao' => ['nullable', 'string', 'max:5000'],
            'url_capa' => ['nullable', 'url', 'max:2000'],
        ];
    }

    public function messages(): array
    {
        return [
            'titulo.required' => 'O título é obrigatório.',
            'url_capa.url' => 'A URL da capa precisa ser válida.',
        ];
    }
}
```

- [ ] **Step 4: Implementar UpdateCursoRequest**

`app/Http/Requests/Admin/UpdateCursoRequest.php`:

```php
<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCursoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('curso')) ?? false;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'titulo' => ['required', 'string', 'max:255'],
            'descricao' => ['nullable', 'string', 'max:5000'],
            'url_capa' => ['nullable', 'url', 'max:2000'],
        ];
    }
}
```

- [ ] **Step 5: Implementar create/store/edit/update/destroy no controller**

Atualizar `app/Http/Controllers/Admin/AdminCursoController.php`:

```php
public function create(): Response
{
    $this->authorize('create', Curso::class);
    return Inertia::render('Admin/Cursos/Create');
}

public function store(StoreCursoRequest $request): RedirectResponse
{
    $curso = Curso::create($request->validated());
    return redirect()
        ->route('admin.cursos.edit', $curso)
        ->with('success', "Curso \"{$curso->titulo}\" criado.");
}

public function edit(Curso $curso): Response
{
    $this->authorize('view', $curso);
    $curso->load(['modulos.aulas']);
    return Inertia::render('Admin/Cursos/Edit', [
        'curso' => [
            'public_id' => $curso->public_id,
            'titulo' => $curso->titulo,
            'descricao' => $curso->descricao,
            'url_capa' => $curso->url_capa,
            'youtube_playlist_id' => $curso->youtube_playlist_id,
            'youtube_channel_title' => $curso->youtube_channel_title,
            'modulos' => $curso->modulos->map(fn ($m) => [
                'public_id' => $m->public_id,
                'titulo' => $m->titulo,
                'ordem' => $m->ordem,
                'aulas_count' => $m->aulas->count(),
            ]),
        ],
    ]);
}

public function update(UpdateCursoRequest $request, Curso $curso): RedirectResponse
{
    $curso->update($request->validated());
    return back()->with('success', 'Curso atualizado.');
}

public function destroy(Curso $curso, DeleteCursoCascade $action): RedirectResponse
{
    $this->authorize('delete', $curso);
    $action->handle($curso);
    return redirect()
        ->route('admin.cursos.index')
        ->with('success', 'Curso excluído.');
}
```

Adicionar imports no topo: `use App\Actions\Admin\DeleteCursoCascade;`, `use App\Http\Requests\Admin\StoreCursoRequest;`, `use App\Http\Requests\Admin\UpdateCursoRequest;`, `use Illuminate\Foundation\Auth\Access\AuthorizesRequests;`. Adicionar `use AuthorizesRequests;` na classe controller (ou estender Controller que já tem).

- [ ] **Step 6: Implementar DeleteCursoCascade**

`app/Actions/Admin/DeleteCursoCascade.php`:

```php
<?php

namespace App\Actions\Admin;

use App\Models\Curso;
use Illuminate\Support\Facades\DB;

class DeleteCursoCascade
{
    public function handle(Curso $curso): void
    {
        DB::transaction(function () use ($curso): void {
            $curso->modulos()->each(function ($modulo): void {
                $modulo->aulas()->delete();
                $modulo->delete();
            });
            $curso->delete();
        });
    }
}
```

- [ ] **Step 7: Rodar e verificar verde**

```bash
vendor/bin/pint --dirty --format agent
./vendor/bin/pest tests/Feature/Admin/AdminCursoCrudTest.php --compact
```

Expected: 4 testes PASS.

- [ ] **Step 8: Commit**

```bash
git add app/ tests/Feature/Admin/AdminCursoCrudTest.php
git commit -m "feat(admin): CRUD backend de Curso (create/store/edit/update/destroy) com policy"
```

### Task 1.3: Páginas Cursos/Index (com ações) e Cursos/Create

**Files:**
- Modify: `resources/js/Pages/Admin/Cursos/Index.tsx`
- Create: `resources/js/Pages/Admin/Cursos/Create.tsx`

- [ ] **Step 1: Reescrever Index com ações (editar/excluir) e DataTable**

`resources/js/Pages/Admin/Cursos/Index.tsx`:

```tsx
import { Head, Link, router } from '@inertiajs/react'
import { GraduationCap, MoreHorizontal, Pencil, Plus, Trash2, Youtube } from 'lucide-react'
import { useState } from 'react'
import AdminLayout from '@/layouts/AdminLayout'
import { PageHeader } from '@/components/admin/PageHeader'
import { EmptyState } from '@/components/admin/EmptyState'
import { DataTable, type Column } from '@/components/admin/DataTable'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu'

type Curso = {
    public_id: string
    titulo: string
    url_capa: string | null
    youtube_playlist_id: string | null
    channel: string | null
    modulos_count: number
}

export default function Index({ cursos }: { cursos: Curso[] }) {
    const [toDelete, setToDelete] = useState<Curso | null>(null)
    const [deleting, setDeleting] = useState(false)

    const columns: Column<Curso>[] = [
        {
            key: 'titulo', header: 'Curso',
            render: (c) => (
                <div className="flex items-center gap-3 min-w-0">
                    {c.url_capa
                        ? <img src={c.url_capa} alt="" className="h-10 w-16 rounded-md object-cover bg-surface-3 shrink-0" />
                        : <div className="h-10 w-16 rounded-md bg-surface-3 grid place-items-center shrink-0"><GraduationCap size={14} className="text-foreground-subtle" /></div>
                    }
                    <Link href={`/admin/cursos/${c.public_id}`} className="font-medium text-foreground hover:text-accent transition-colors truncate">
                        {c.titulo}
                    </Link>
                </div>
            ),
        },
        {
            key: 'channel', header: 'Canal',
            render: (c) => c.channel
                ? <span className="text-foreground">{c.channel}</span>
                : <span className="text-foreground-subtle">—</span>,
        },
        {
            key: 'origem', header: 'Origem',
            render: (c) => c.youtube_playlist_id
                ? <span className="inline-flex items-center gap-1.5 text-xs text-foreground-muted"><Youtube size={12} /> YouTube</span>
                : <span className="text-xs text-foreground-muted">Manual</span>,
        },
        {
            key: 'modulos', header: 'Módulos', align: 'right', width: '120px',
            render: (c) => <span className="text-foreground tabular-nums">{c.modulos_count}</span>,
        },
        {
            key: 'actions', header: '', align: 'right', width: '60px',
            render: (c) => (
                <DropdownMenu trigger={<MoreHorizontal size={16} className="text-foreground-muted hover:text-foreground" />}>
                    <DropdownMenuItem onClick={() => router.visit(`/admin/cursos/${c.public_id}`)}>
                        <Pencil size={14} /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem destructive onClick={() => setToDelete(c)}>
                        <Trash2 size={14} /> Excluir
                    </DropdownMenuItem>
                </DropdownMenu>
            ),
        },
    ]

    function confirmDelete(): void {
        if (!toDelete) return
        setDeleting(true)
        router.delete(`/admin/cursos/${toDelete.public_id}`, {
            preserveScroll: true,
            onFinish: () => { setDeleting(false); setToDelete(null) },
        })
    }

    return (
        <AdminLayout breadcrumbs={[{ label: 'Cursos' }]}>
            <Head title="Cursos | Admin" />
            <PageHeader
                title="Cursos"
                description="Gerencie os cursos da plataforma."
                actions={
                    <>
                        <Button variant="ghost" onClick={() => router.visit('/admin/cursos/importar')}>
                            <Youtube size={14} className="mr-1.5" /> Importar do YouTube
                        </Button>
                        <Button onClick={() => router.visit('/admin/cursos/criar')}>
                            <Plus size={14} className="mr-1.5" /> Novo curso
                        </Button>
                    </>
                }
            />
            <DataTable
                rows={cursos}
                columns={columns}
                rowKey={(c) => c.public_id}
                empty={
                    <EmptyState
                        Icon={GraduationCap}
                        title="Nenhum curso cadastrado"
                        description="Crie um curso manualmente ou importe uma playlist do YouTube para começar."
                        action={<Button onClick={() => router.visit('/admin/cursos/criar')}>Criar primeiro curso</Button>}
                    />
                }
            />
            <ConfirmDialog
                open={!!toDelete}
                onOpenChange={(v) => !v && setToDelete(null)}
                title="Excluir curso"
                description={toDelete ? `Tem certeza que deseja excluir "${toDelete.titulo}"? Todos os módulos e aulas serão removidos. Esta ação não pode ser desfeita.` : ''}
                confirmLabel="Excluir curso"
                onConfirm={confirmDelete}
                loading={deleting}
            />
        </AdminLayout>
    )
}
```

- [ ] **Step 2: Criar Cursos/Create**

`resources/js/Pages/Admin/Cursos/Create.tsx`:

```tsx
import { Head, useForm } from '@inertiajs/react'
import AdminLayout from '@/layouts/AdminLayout'
import { PageHeader } from '@/components/admin/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        titulo: '',
        descricao: '',
        url_capa: '',
    })

    function submit(e: React.FormEvent): void {
        e.preventDefault()
        post('/admin/cursos')
    }

    return (
        <AdminLayout breadcrumbs={[{ label: 'Cursos', href: '/admin/cursos' }, { label: 'Novo curso' }]}>
            <Head title="Novo curso | Admin" />
            <PageHeader title="Novo curso" description="Crie um curso manualmente. Adicione módulos e aulas após salvar." />
            <form onSubmit={submit} className="max-w-2xl space-y-6">
                <div className="space-y-1.5">
                    <Label htmlFor="titulo">Título <span className="text-accent">*</span></Label>
                    <Input id="titulo" value={data.titulo} onChange={(e) => setData('titulo', e.target.value)} invalid={!!errors.titulo} autoFocus />
                    {errors.titulo && <p className="text-xs text-accent">{errors.titulo}</p>}
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea id="descricao" value={data.descricao} onChange={(e) => setData('descricao', e.target.value)} invalid={!!errors.descricao} />
                    {errors.descricao && <p className="text-xs text-accent">{errors.descricao}</p>}
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="url_capa">URL da capa</Label>
                    <Input id="url_capa" type="url" value={data.url_capa} onChange={(e) => setData('url_capa', e.target.value)} placeholder="https://..." invalid={!!errors.url_capa} />
                    {errors.url_capa && <p className="text-xs text-accent">{errors.url_capa}</p>}
                </div>
                <div className="flex items-center gap-3 pt-2">
                    <Button type="submit" disabled={processing}>{processing ? 'Salvando…' : 'Criar curso'}</Button>
                    <Button type="button" variant="ghost" onClick={() => history.back()}>Cancelar</Button>
                </div>
            </form>
        </AdminLayout>
    )
}
```

- [ ] **Step 3: Build + smoke**

```bash
bun run build
```

Expected: ok.

- [ ] **Step 4: Commit**

```bash
git add resources/js/Pages/Admin/Cursos
git commit -m "feat(admin): página de criação de curso e ações de excluir/editar na listagem"
```

### Task 1.4: Form Requests + Controller para Módulos

**Files:**
- Create: `app/Http/Requests/Admin/StoreModuloRequest.php`
- Create: `app/Http/Requests/Admin/UpdateModuloRequest.php`
- Create: `app/Http/Requests/Admin/ReorderModulosRequest.php`
- Modify: `app/Http/Controllers/Admin/AdminModuloController.php`
- Test: `tests/Feature/Admin/AdminModuloCrudTest.php`

- [ ] **Step 1: Teste falhando**

`tests/Feature/Admin/AdminModuloCrudTest.php`:

```php
<?php

use App\Enums\PapelEnum;
use App\Models\Curso;
use App\Models\Modulo;
use App\Models\User;

beforeEach(function (): void {
    $this->admin = User::factory()->create(['papel' => PapelEnum::ADMIN]);
    $this->curso = Curso::create(['titulo' => 'C', 'public_id' => (string) \Illuminate\Support\Str::uuid()]);
});

it('cria módulo com ordem incrementada', function (): void {
    Modulo::create(['curso_id' => $this->curso->id, 'titulo' => 'M1', 'ordem' => 1, 'public_id' => (string) \Illuminate\Support\Str::uuid()]);

    $this->actingAs($this->admin)
        ->post(route('admin.modulos.store', $this->curso), ['titulo' => 'M2'])
        ->assertRedirect();

    $modulo = $this->curso->modulos()->orderByDesc('ordem')->first();
    expect($modulo->titulo)->toBe('M2')
        ->and($modulo->ordem)->toBe(2);
});

it('atualiza módulo', function (): void {
    $modulo = Modulo::create(['curso_id' => $this->curso->id, 'titulo' => 'old', 'ordem' => 1, 'public_id' => (string) \Illuminate\Support\Str::uuid()]);

    $this->actingAs($this->admin)
        ->put(route('admin.modulos.update', $modulo), ['titulo' => 'novo'])
        ->assertRedirect();

    expect($modulo->fresh()->titulo)->toBe('novo');
});

it('reordena módulos', function (): void {
    $m1 = Modulo::create(['curso_id' => $this->curso->id, 'titulo' => 'A', 'ordem' => 1, 'public_id' => (string) \Illuminate\Support\Str::uuid()]);
    $m2 = Modulo::create(['curso_id' => $this->curso->id, 'titulo' => 'B', 'ordem' => 2, 'public_id' => (string) \Illuminate\Support\Str::uuid()]);

    $this->actingAs($this->admin)
        ->put(route('admin.modulos.reorder', $this->curso), [
            'ordem' => [$m2->public_id, $m1->public_id],
        ])
        ->assertRedirect();

    expect($m1->fresh()->ordem)->toBe(2)
        ->and($m2->fresh()->ordem)->toBe(1);
});

it('exclui módulo e suas aulas', function (): void {
    $modulo = Modulo::create(['curso_id' => $this->curso->id, 'titulo' => 'X', 'ordem' => 1, 'public_id' => (string) \Illuminate\Support\Str::uuid()]);

    $this->actingAs($this->admin)
        ->delete(route('admin.modulos.destroy', $modulo))
        ->assertRedirect();

    expect(Modulo::find($modulo->id))->toBeNull();
});
```

- [ ] **Step 2: Verificar falha**

```bash
./vendor/bin/pest tests/Feature/Admin/AdminModuloCrudTest.php --compact
```

Expected: FAIL.

- [ ] **Step 3: StoreModuloRequest**

`app/Http/Requests/Admin/StoreModuloRequest.php`:

```php
<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreModuloRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('curso')) ?? false;
    }

    /** @return array<string, array<int, string>> */
    public function rules(): array
    {
        return ['titulo' => ['required', 'string', 'max:255']];
    }
}
```

- [ ] **Step 4: UpdateModuloRequest**

`app/Http/Requests/Admin/UpdateModuloRequest.php`:

```php
<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateModuloRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('modulo')->curso) ?? false;
    }

    /** @return array<string, array<int, string>> */
    public function rules(): array
    {
        return ['titulo' => ['required', 'string', 'max:255']];
    }
}
```

- [ ] **Step 5: ReorderModulosRequest**

`app/Http/Requests/Admin/ReorderModulosRequest.php`:

```php
<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ReorderModulosRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('curso')) ?? false;
    }

    /** @return array<string, array<int, string>> */
    public function rules(): array
    {
        return [
            'ordem' => ['required', 'array', 'min:1'],
            'ordem.*' => ['required', 'string', 'uuid', 'exists:modulos,public_id'],
        ];
    }
}
```

- [ ] **Step 6: Implementar AdminModuloController**

`app/Http/Controllers/Admin/AdminModuloController.php`:

```php
<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ReorderModulosRequest;
use App\Http\Requests\Admin\StoreModuloRequest;
use App\Http\Requests\Admin\UpdateModuloRequest;
use App\Models\Curso;
use App\Models\Modulo;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AdminModuloController extends Controller
{
    use AuthorizesRequests;

    public function store(StoreModuloRequest $request, Curso $curso): RedirectResponse
    {
        $proximaOrdem = (int) $curso->modulos()->max('ordem') + 1;
        $curso->modulos()->create([
            'titulo' => $request->validated('titulo'),
            'ordem' => $proximaOrdem,
        ]);

        return back()->with('success', 'Módulo criado.');
    }

    public function edit(Modulo $modulo): Response
    {
        $this->authorize('update', $modulo->curso);
        $modulo->load(['curso', 'aulas']);

        return Inertia::render('Admin/Modulos/Edit', [
            'curso' => [
                'public_id' => $modulo->curso->public_id,
                'titulo' => $modulo->curso->titulo,
            ],
            'modulo' => [
                'public_id' => $modulo->public_id,
                'titulo' => $modulo->titulo,
                'ordem' => $modulo->ordem,
                'aulas' => $modulo->aulas->map(fn ($a) => [
                    'public_id' => $a->public_id,
                    'titulo' => $a->titulo,
                    'tipo_aula' => $a->tipo_aula->value,
                    'ordem' => $a->ordem,
                    'duracao_segundos' => $a->duracao_segundos,
                    'youtube_video_id' => $a->youtube_video_id,
                ]),
            ],
        ]);
    }

    public function update(UpdateModuloRequest $request, Modulo $modulo): RedirectResponse
    {
        $modulo->update($request->validated());
        return back()->with('success', 'Módulo atualizado.');
    }

    public function destroy(Modulo $modulo): RedirectResponse
    {
        $this->authorize('update', $modulo->curso);
        $cursoPublicId = $modulo->curso->public_id;

        DB::transaction(function () use ($modulo): void {
            $modulo->aulas()->delete();
            $modulo->delete();
        });

        return redirect()
            ->route('admin.cursos.edit', $cursoPublicId)
            ->with('success', 'Módulo excluído.');
    }

    public function reorder(ReorderModulosRequest $request, Curso $curso): RedirectResponse
    {
        DB::transaction(function () use ($request, $curso): void {
            foreach ($request->validated('ordem') as $index => $publicId) {
                $curso->modulos()
                    ->where('public_id', $publicId)
                    ->update(['ordem' => $index + 1]);
            }
        });

        return back()->with('success', 'Ordem atualizada.');
    }
}
```

- [ ] **Step 7: Verificar verde**

```bash
vendor/bin/pint --dirty --format agent
./vendor/bin/pest tests/Feature/Admin/AdminModuloCrudTest.php --compact
```

Expected: 4 testes PASS.

- [ ] **Step 8: Commit**

```bash
git add app/ tests/Feature/Admin/AdminModuloCrudTest.php
git commit -m "feat(admin): CRUD + reordenação de módulos"
```

### Task 1.5: Form Requests + Controller para Aulas

**Files:**
- Create: `app/Http/Requests/Admin/StoreAulaRequest.php`
- Create: `app/Http/Requests/Admin/UpdateAulaRequest.php`
- Create: `app/Http/Requests/Admin/ReorderAulasRequest.php`
- Modify: `app/Http/Controllers/Admin/AdminAulaController.php`
- Test: `tests/Feature/Admin/AdminAulaCrudTest.php`

- [ ] **Step 1: Teste falhando**

`tests/Feature/Admin/AdminAulaCrudTest.php`:

```php
<?php

use App\Enums\PapelEnum;
use App\Enums\TipoAulaEnum;
use App\Models\Aula;
use App\Models\Curso;
use App\Models\Modulo;
use App\Models\User;
use Illuminate\Support\Str;

beforeEach(function (): void {
    $this->admin = User::factory()->create(['papel' => PapelEnum::ADMIN]);
    $curso = Curso::create(['titulo' => 'C', 'public_id' => (string) Str::uuid()]);
    $this->modulo = Modulo::create(['curso_id' => $curso->id, 'titulo' => 'M', 'ordem' => 1, 'public_id' => (string) Str::uuid()]);
});

it('cria aula tipo VIDEO', function (): void {
    $this->actingAs($this->admin)
        ->post(route('admin.aulas.store', $this->modulo), [
            'titulo' => 'Aula 1',
            'tipo_aula' => TipoAulaEnum::VIDEO->value,
            'url_video' => 'https://youtu.be/abc',
            'duracao_segundos' => 600,
        ])
        ->assertRedirect();

    expect(Aula::where('titulo', 'Aula 1')->exists())->toBeTrue();
});

it('cria aula tipo TEXTO sem url_video', function (): void {
    $this->actingAs($this->admin)
        ->post(route('admin.aulas.store', $this->modulo), [
            'titulo' => 'Leitura',
            'tipo_aula' => TipoAulaEnum::TEXTO->value,
            'conteudo' => '# Markdown',
        ])
        ->assertRedirect();

    expect(Aula::where('titulo', 'Leitura')->exists())->toBeTrue();
});

it('rejeita aula video sem url_video', function (): void {
    $this->actingAs($this->admin)
        ->post(route('admin.aulas.store', $this->modulo), [
            'titulo' => 'X',
            'tipo_aula' => TipoAulaEnum::VIDEO->value,
        ])
        ->assertSessionHasErrors('url_video');
});

it('atualiza aula', function (): void {
    $aula = Aula::create([
        'modulo_id' => $this->modulo->id,
        'titulo' => 'old', 'tipo_aula' => TipoAulaEnum::TEXTO,
        'ordem' => 1, 'public_id' => (string) Str::uuid(),
    ]);

    $this->actingAs($this->admin)
        ->put(route('admin.aulas.update', $aula), [
            'titulo' => 'novo',
            'tipo_aula' => TipoAulaEnum::TEXTO->value,
            'conteudo' => 'novo conteudo',
        ])
        ->assertRedirect();

    expect($aula->fresh()->titulo)->toBe('novo');
});

it('reordena aulas', function (): void {
    $a1 = Aula::create(['modulo_id' => $this->modulo->id, 'titulo' => 'A', 'tipo_aula' => TipoAulaEnum::TEXTO, 'ordem' => 1, 'public_id' => (string) Str::uuid()]);
    $a2 = Aula::create(['modulo_id' => $this->modulo->id, 'titulo' => 'B', 'tipo_aula' => TipoAulaEnum::TEXTO, 'ordem' => 2, 'public_id' => (string) Str::uuid()]);

    $this->actingAs($this->admin)
        ->put(route('admin.aulas.reorder', $this->modulo), [
            'ordem' => [$a2->public_id, $a1->public_id],
        ])
        ->assertRedirect();

    expect($a1->fresh()->ordem)->toBe(2)
        ->and($a2->fresh()->ordem)->toBe(1);
});

it('exclui aula', function (): void {
    $aula = Aula::create(['modulo_id' => $this->modulo->id, 'titulo' => 'X', 'tipo_aula' => TipoAulaEnum::TEXTO, 'ordem' => 1, 'public_id' => (string) Str::uuid()]);

    $this->actingAs($this->admin)
        ->delete(route('admin.aulas.destroy', $aula))
        ->assertRedirect();

    expect(Aula::find($aula->id))->toBeNull();
});
```

- [ ] **Step 2: Verificar falha**

```bash
./vendor/bin/pest tests/Feature/Admin/AdminAulaCrudTest.php --compact
```

Expected: FAIL.

- [ ] **Step 3: StoreAulaRequest**

`app/Http/Requests/Admin/StoreAulaRequest.php`:

```php
<?php

namespace App\Http\Requests\Admin;

use App\Enums\TipoAulaEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAulaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('modulo')->curso) ?? false;
    }

    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'titulo' => ['required', 'string', 'max:255'],
            'tipo_aula' => ['required', Rule::enum(TipoAulaEnum::class)],
            'url_video' => ['nullable', 'url', 'max:2000', 'required_if:tipo_aula,video'],
            'youtube_video_id' => ['nullable', 'string', 'max:32'],
            'conteudo' => ['nullable', 'string', 'max:50000', 'required_if:tipo_aula,texto'],
            'duracao_segundos' => ['nullable', 'integer', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'url_video.required_if' => 'URL do vídeo é obrigatória para aulas do tipo vídeo.',
            'conteudo.required_if' => 'Conteúdo é obrigatório para aulas do tipo texto.',
        ];
    }
}
```

- [ ] **Step 4: UpdateAulaRequest e ReorderAulasRequest**

`app/Http/Requests/Admin/UpdateAulaRequest.php`:

```php
<?php

namespace App\Http\Requests\Admin;

use App\Enums\TipoAulaEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAulaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('aula')->modulo->curso) ?? false;
    }

    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'titulo' => ['required', 'string', 'max:255'],
            'tipo_aula' => ['required', Rule::enum(TipoAulaEnum::class)],
            'url_video' => ['nullable', 'url', 'max:2000', 'required_if:tipo_aula,video'],
            'youtube_video_id' => ['nullable', 'string', 'max:32'],
            'conteudo' => ['nullable', 'string', 'max:50000', 'required_if:tipo_aula,texto'],
            'duracao_segundos' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
```

`app/Http/Requests/Admin/ReorderAulasRequest.php`:

```php
<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ReorderAulasRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('modulo')->curso) ?? false;
    }

    /** @return array<string, array<int, string>> */
    public function rules(): array
    {
        return [
            'ordem' => ['required', 'array', 'min:1'],
            'ordem.*' => ['required', 'string', 'uuid', 'exists:aulas,public_id'],
        ];
    }
}
```

- [ ] **Step 5: AdminAulaController**

`app/Http/Controllers/Admin/AdminAulaController.php`:

```php
<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ReorderAulasRequest;
use App\Http\Requests\Admin\StoreAulaRequest;
use App\Http\Requests\Admin\UpdateAulaRequest;
use App\Models\Aula;
use App\Models\Modulo;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AdminAulaController extends Controller
{
    use AuthorizesRequests;

    public function store(StoreAulaRequest $request, Modulo $modulo): RedirectResponse
    {
        $proximaOrdem = (int) $modulo->aulas()->max('ordem') + 1;
        $modulo->aulas()->create([
            ...$request->validated(),
            'ordem' => $proximaOrdem,
        ]);

        return back()->with('success', 'Aula criada.');
    }

    public function edit(Aula $aula): Response
    {
        $this->authorize('update', $aula->modulo->curso);
        $aula->load(['modulo.curso']);

        return Inertia::render('Admin/Aulas/Edit', [
            'curso' => [
                'public_id' => $aula->modulo->curso->public_id,
                'titulo' => $aula->modulo->curso->titulo,
            ],
            'modulo' => [
                'public_id' => $aula->modulo->public_id,
                'titulo' => $aula->modulo->titulo,
            ],
            'aula' => [
                'public_id' => $aula->public_id,
                'titulo' => $aula->titulo,
                'tipo_aula' => $aula->tipo_aula->value,
                'url_video' => $aula->url_video,
                'youtube_video_id' => $aula->youtube_video_id,
                'conteudo' => $aula->conteudo,
                'duracao_segundos' => $aula->duracao_segundos,
                'ordem' => $aula->ordem,
            ],
        ]);
    }

    public function update(UpdateAulaRequest $request, Aula $aula): RedirectResponse
    {
        $aula->update($request->validated());
        return back()->with('success', 'Aula atualizada.');
    }

    public function destroy(Aula $aula): RedirectResponse
    {
        $this->authorize('update', $aula->modulo->curso);
        $moduloPublicId = $aula->modulo->public_id;
        $aula->delete();

        return redirect()
            ->route('admin.modulos.edit', $moduloPublicId)
            ->with('success', 'Aula excluída.');
    }

    public function reorder(ReorderAulasRequest $request, Modulo $modulo): RedirectResponse
    {
        DB::transaction(function () use ($request, $modulo): void {
            foreach ($request->validated('ordem') as $index => $publicId) {
                $modulo->aulas()
                    ->where('public_id', $publicId)
                    ->update(['ordem' => $index + 1]);
            }
        });

        return back()->with('success', 'Ordem das aulas atualizada.');
    }
}
```

- [ ] **Step 6: Verificar verde**

```bash
vendor/bin/pint --dirty --format agent
./vendor/bin/pest tests/Feature/Admin/AdminAulaCrudTest.php --compact
```

Expected: 6 testes PASS.

- [ ] **Step 7: Commit**

```bash
git add app/ tests/Feature/Admin/AdminAulaCrudTest.php
git commit -m "feat(admin): CRUD + reordenação de aulas com validação por tipo (vídeo/texto/quiz)"
```

### Task 1.6: SortableList wrapper @dnd-kit

**Files:**
- Create: `resources/js/components/admin/SortableList.tsx`

- [ ] **Step 1: Implementar wrapper genérico (handle revealed + numeração mono + DragOverlay)**

`resources/js/components/admin/SortableList.tsx`:

```tsx
import {
    DndContext,
    DragOverlay,
    KeyboardSensor,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core'
import {
    SortableContext,
    arrayMove,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { useState, type ReactNode } from 'react'

type Props<T extends { public_id: string }> = {
    items: T[]
    onReorder: (newOrder: T[]) => void
    renderItem: (item: T, index: number) => ReactNode
}

export function SortableList<T extends { public_id: string }>({ items, onReorder, renderItem }: Props<T>) {
    const [activeId, setActiveId] = useState<string | null>(null)
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    )

    function handleDragEnd(event: DragEndEvent): void {
        setActiveId(null)
        const { active, over } = event
        if (!over || active.id === over.id) return
        const oldIndex = items.findIndex((i) => i.public_id === active.id)
        const newIndex = items.findIndex((i) => i.public_id === over.id)
        onReorder(arrayMove(items, oldIndex, newIndex))
    }

    const activeItem = activeId ? items.find((i) => i.public_id === activeId) : null
    const activeIndex = activeItem ? items.indexOf(activeItem) : -1

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={(e) => setActiveId(String(e.active.id))}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setActiveId(null)}
        >
            <SortableContext items={items.map((i) => i.public_id)} strategy={verticalListSortingStrategy}>
                <ul className="space-y-2">
                    {items.map((item, index) => (
                        <SortableRow key={item.public_id} id={item.public_id} index={index}>
                            {renderItem(item, index)}
                        </SortableRow>
                    ))}
                </ul>
            </SortableContext>
            <DragOverlay dropAnimation={{ duration: 180, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
                {activeItem && (
                    <div className="rounded-xl border border-accent/40 bg-surface-2 shadow-2xl shadow-black/60 cursor-grabbing">
                        <div className="flex items-center gap-2 py-3 px-4">
                            <span className="font-mono tabular-nums text-xs text-foreground-faint w-6 text-right shrink-0">
                                {String(activeIndex + 1).padStart(2, '0')}
                            </span>
                            {renderItem(activeItem, activeIndex)}
                        </div>
                    </div>
                )}
            </DragOverlay>
        </DndContext>
    )
}

function SortableRow({ id, index, children }: { id: string; index: number; children: ReactNode }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

    return (
        <li
            ref={setNodeRef}
            data-dragging={isDragging || undefined}
            style={{ transform: CSS.Transform.toString(transform), transition }}
            className={`group flex items-center gap-2 rounded-xl border bg-surface-2 transition-all ${
                isDragging
                    ? 'border-accent/40 shadow-2xl shadow-accent/10 scale-[1.01] opacity-50'
                    : 'border-border hover:border-border-strong'
            }`}
        >
            {/* Numeração mono */}
            <span className="font-mono tabular-nums text-xs text-foreground-faint w-6 text-right shrink-0 pl-3">
                {String(index + 1).padStart(2, '0')}
            </span>
            {/* Handle — só visível no hover (revealed affordance) */}
            <button
                type="button"
                {...attributes}
                {...listeners}
                aria-label="Reordenar"
                className="opacity-0 group-hover:opacity-100 data-[dragging]:opacity-100 transition-opacity grid place-items-center px-1 py-4 text-foreground-subtle hover:text-foreground cursor-grab active:cursor-grabbing"
            >
                <GripVertical size={14} />
            </button>
            <div className="flex-1 min-w-0 py-3 pr-4">{children}</div>
        </li>
    )
}
```

- [ ] **Step 2: Build**

```bash
bun run build
```

Expected: ok.

- [ ] **Step 3: Commit**

```bash
git add resources/js/components/admin/SortableList.tsx
git commit -m "feat(admin): SortableList genérico baseado em @dnd-kit"
```

### Task 1.7: Página Admin/Cursos/Edit (metadados + lista de módulos)

**Files:**
- Create: `resources/js/Pages/Admin/Cursos/Edit.tsx`

- [ ] **Step 1: Implementar página**

`resources/js/Pages/Admin/Cursos/Edit.tsx`:

```tsx
import { Head, Link, router, useForm } from '@inertiajs/react'
import { ChevronRight, FolderPlus, Pencil, Plus, Trash2, Youtube } from 'lucide-react'
import { useState } from 'react'
import AdminLayout from '@/layouts/AdminLayout'
import { PageHeader } from '@/components/admin/PageHeader'
import { EmptyState } from '@/components/admin/EmptyState'
import { SortableList } from '@/components/admin/SortableList'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog } from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

type Modulo = { public_id: string; titulo: string; ordem: number; aulas_count: number }
type Curso = {
    public_id: string
    titulo: string
    descricao: string | null
    url_capa: string | null
    youtube_playlist_id: string | null
    youtube_channel_title: string | null
    modulos: Modulo[]
}

export default function Edit({ curso }: { curso: Curso }) {
    const meta = useForm({
        titulo: curso.titulo,
        descricao: curso.descricao ?? '',
        url_capa: curso.url_capa ?? '',
    })

    const [openNewModulo, setOpenNewModulo] = useState(false)
    const [moduloToDelete, setModuloToDelete] = useState<Modulo | null>(null)
    const newModulo = useForm({ titulo: '' })

    function saveMeta(e: React.FormEvent): void {
        e.preventDefault()
        meta.put(`/admin/cursos/${curso.public_id}`, { preserveScroll: true })
    }

    function createModulo(e: React.FormEvent): void {
        e.preventDefault()
        newModulo.post(`/admin/cursos/${curso.public_id}/modulos`, {
            preserveScroll: true,
            onSuccess: () => { newModulo.reset(); setOpenNewModulo(false) },
        })
    }

    function reorderModulos(items: Modulo[]): void {
        router.put(`/admin/cursos/${curso.public_id}/modulos/reordenar`, {
            ordem: items.map((m) => m.public_id),
        }, { preserveScroll: true })
    }

    function confirmDeleteModulo(): void {
        if (!moduloToDelete) return
        router.delete(`/admin/modulos/${moduloToDelete.public_id}`, {
            preserveScroll: true,
            onFinish: () => setModuloToDelete(null),
        })
    }

    return (
        <AdminLayout breadcrumbs={[
            { label: 'Cursos', href: '/admin/cursos' },
            { label: curso.titulo },
        ]}>
            <Head title={`${curso.titulo} | Admin`} />
            <PageHeader
                title={curso.titulo}
                description={curso.youtube_channel_title ? `Importado de ${curso.youtube_channel_title}` : 'Curso manual'}
                actions={
                    curso.youtube_playlist_id ? (
                        <a
                            href={`https://www.youtube.com/playlist?list=${curso.youtube_playlist_id}`}
                            target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-foreground-muted hover:text-foreground"
                        >
                            <Youtube size={14} /> Abrir no YouTube
                        </a>
                    ) : null
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-12 gap-y-10">
                {/* Sidebar metadados — 4 cols, sticky */}
                <form onSubmit={saveMeta} className="lg:col-span-4 lg:sticky lg:top-24 lg:self-start space-y-5">
                    <h2 className="font-display text-lg text-foreground mb-1">Detalhes</h2>
                    <p className="text-xs text-foreground-muted mb-5">Informações que aparecem no catálogo público.</p>
                    <div className="space-y-1.5">
                        <Label htmlFor="titulo">Título</Label>
                        <Input id="titulo" value={meta.data.titulo} onChange={(e) => meta.setData('titulo', e.target.value)} invalid={!!meta.errors.titulo} />
                        {meta.errors.titulo && <p className="text-xs text-accent">{meta.errors.titulo}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="descricao">Descrição</Label>
                        <Textarea id="descricao" value={meta.data.descricao} onChange={(e) => meta.setData('descricao', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="url_capa">URL da capa</Label>
                        <Input id="url_capa" type="url" value={meta.data.url_capa} onChange={(e) => meta.setData('url_capa', e.target.value)} />
                    </div>
                    <Button type="submit" disabled={meta.processing}>{meta.processing ? 'Salvando…' : 'Salvar detalhes'}</Button>
                </form>

                {/* Conteúdo — 8 cols, módulos */}
                <div className="lg:col-span-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground-subtle">Módulos ({curso.modulos.length})</h2>
                        <Button variant="ghost" onClick={() => setOpenNewModulo(true)}><Plus size={14} className="mr-1.5" /> Novo módulo</Button>
                    </div>

                    {curso.modulos.length === 0 ? (
                        <EmptyState
                            Icon={FolderPlus}
                            title="Sem módulos"
                            description="Adicione um módulo para começar a estruturar este curso."
                            action={<Button onClick={() => setOpenNewModulo(true)}>Adicionar módulo</Button>}
                        />
                    ) : (
                        <SortableList
                            items={curso.modulos}
                            onReorder={reorderModulos}
                            renderItem={(m) => (
                                <div className="flex items-center justify-between gap-4">
                                    <Link href={`/admin/modulos/${m.public_id}`} className="min-w-0 flex-1">
                                        <p className="font-medium text-foreground truncate hover:text-accent transition-colors">{m.titulo}</p>
                                        <p className="text-xs text-foreground-muted mt-0.5">{m.aulas_count} {m.aulas_count === 1 ? 'aula' : 'aulas'}</p>
                                    </Link>
                                    <div className="flex items-center gap-1">
                                        <Link href={`/admin/modulos/${m.public_id}`} className="grid h-8 w-8 place-items-center rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface-3" aria-label="Editar módulo">
                                            <Pencil size={14} />
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => setModuloToDelete(m)}
                                            className="grid h-8 w-8 place-items-center rounded-lg text-foreground-muted hover:text-accent hover:bg-accent/10"
                                            aria-label="Excluir módulo"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                        <ChevronRight size={14} className="text-foreground-faint ml-1" />
                                    </div>
                                </div>
                            )}
                        />
                    )}
                </div>
            </div>

            <Dialog
                open={openNewModulo}
                onOpenChange={setOpenNewModulo}
                title="Novo módulo"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setOpenNewModulo(false)} disabled={newModulo.processing}>Cancelar</Button>
                        <Button onClick={createModulo} disabled={newModulo.processing}>{newModulo.processing ? 'Criando…' : 'Criar módulo'}</Button>
                    </>
                }
            >
                <form onSubmit={createModulo} className="space-y-1.5">
                    <Label htmlFor="novo-modulo">Título</Label>
                    <Input id="novo-modulo" value={newModulo.data.titulo} onChange={(e) => newModulo.setData('titulo', e.target.value)} invalid={!!newModulo.errors.titulo} autoFocus />
                    {newModulo.errors.titulo && <p className="text-xs text-accent">{newModulo.errors.titulo}</p>}
                </form>
            </Dialog>

            <ConfirmDialog
                open={!!moduloToDelete}
                onOpenChange={(v) => !v && setModuloToDelete(null)}
                title="Excluir módulo"
                description={moduloToDelete ? `Excluir "${moduloToDelete.titulo}" e todas as suas aulas?` : ''}
                confirmLabel="Excluir módulo"
                onConfirm={confirmDeleteModulo}
            />
        </AdminLayout>
    )
}
```

- [ ] **Step 2: Build**

```bash
bun run build
```

- [ ] **Step 3: Commit**

```bash
git add resources/js/Pages/Admin/Cursos/Edit.tsx
git commit -m "feat(admin): página de edição de curso com lista ordenável de módulos"
```

### Task 1.8: Página Admin/Modulos/Edit (com lista ordenável de aulas)

**Files:**
- Create: `resources/js/Pages/Admin/Modulos/Edit.tsx`

- [ ] **Step 1: Implementar página**

Criar `resources/js/Pages/Admin/Modulos/Edit.tsx` análogo à `Cursos/Edit.tsx` com:
- Header form para editar título do módulo (PUT em `/admin/modulos/{public_id}`).
- SortableList de aulas com ações editar/excluir (links para `/admin/aulas/{public_id}`, DELETE em `/admin/aulas/{public_id}`).
- Botão "Nova aula" abrindo Dialog de criação rápida (somente título + tipo). Após criar, redireciona para `/admin/aulas/{novo_public_id}` para edição completa (controller deve devolver redirect com a aula recém-criada — ajustar `AdminAulaController::store` para retornar `redirect()->route('admin.aulas.edit', $aula)` quando criar via Dialog do módulo; alternativamente devolver `back()` e abrir o editor de aula em outra navegação).

Snippet completo:

```tsx
import { Head, Link, router, useForm } from '@inertiajs/react'
import { FilePlus2, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import AdminLayout from '@/layouts/AdminLayout'
import { PageHeader } from '@/components/admin/PageHeader'
import { EmptyState } from '@/components/admin/EmptyState'
import { SortableList } from '@/components/admin/SortableList'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Dialog } from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

type Aula = {
    public_id: string
    titulo: string
    tipo_aula: 'video' | 'texto' | 'quiz'
    ordem: number
    duracao_segundos: number | null
    youtube_video_id: string | null
}
type Curso = { public_id: string; titulo: string }
type Modulo = { public_id: string; titulo: string; ordem: number; aulas: Aula[] }

const TIPO_LABEL = { video: 'Vídeo', texto: 'Texto', quiz: 'Quiz' } as const

function formatDuracao(seg: number | null): string {
    if (!seg) return '—'
    const m = Math.floor(seg / 60)
    const s = seg % 60
    return `${m}:${s.toString().padStart(2, '0')}`
}

export default function Edit({ curso, modulo }: { curso: Curso; modulo: Modulo }) {
    const meta = useForm({ titulo: modulo.titulo })
    const newAula = useForm({ titulo: '', tipo_aula: 'video' as Aula['tipo_aula'], url_video: '', conteudo: '' })
    const [openNew, setOpenNew] = useState(false)
    const [aulaToDelete, setAulaToDelete] = useState<Aula | null>(null)

    function saveMeta(e: React.FormEvent): void {
        e.preventDefault()
        meta.put(`/admin/modulos/${modulo.public_id}`, { preserveScroll: true })
    }

    function createAula(e: React.FormEvent): void {
        e.preventDefault()
        newAula.post(`/admin/modulos/${modulo.public_id}/aulas`, {
            preserveScroll: true,
            onSuccess: () => { newAula.reset(); setOpenNew(false) },
        })
    }

    function reorderAulas(items: Aula[]): void {
        router.put(`/admin/modulos/${modulo.public_id}/aulas/reordenar`, {
            ordem: items.map((a) => a.public_id),
        }, { preserveScroll: true })
    }

    function confirmDeleteAula(): void {
        if (!aulaToDelete) return
        router.delete(`/admin/aulas/${aulaToDelete.public_id}`, {
            preserveScroll: true,
            onFinish: () => setAulaToDelete(null),
        })
    }

    return (
        <AdminLayout breadcrumbs={[
            { label: 'Cursos', href: '/admin/cursos' },
            { label: curso.titulo, href: `/admin/cursos/${curso.public_id}` },
            { label: modulo.titulo },
        ]}>
            <Head title={`${modulo.titulo} | Admin`} />
            <PageHeader title={modulo.titulo} description={`Módulo de ${curso.titulo}`} />

            <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-8">
                <form onSubmit={saveMeta} className="space-y-5">
                    <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground-subtle">Detalhes</h2>
                    <div className="space-y-1.5">
                        <Label htmlFor="titulo">Título</Label>
                        <Input id="titulo" value={meta.data.titulo} onChange={(e) => meta.setData('titulo', e.target.value)} invalid={!!meta.errors.titulo} />
                        {meta.errors.titulo && <p className="text-xs text-accent">{meta.errors.titulo}</p>}
                    </div>
                    <Button type="submit" disabled={meta.processing}>{meta.processing ? 'Salvando…' : 'Salvar'}</Button>
                </form>

                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground-subtle">Aulas ({modulo.aulas.length})</h2>
                        <Button variant="ghost" onClick={() => setOpenNew(true)}><Plus size={14} className="mr-1.5" /> Nova aula</Button>
                    </div>

                    {modulo.aulas.length === 0 ? (
                        <EmptyState Icon={FilePlus2} title="Sem aulas" description="Adicione a primeira aula deste módulo." action={<Button onClick={() => setOpenNew(true)}>Adicionar aula</Button>} />
                    ) : (
                        <SortableList
                            items={modulo.aulas}
                            onReorder={reorderAulas}
                            renderItem={(a) => (
                                <div className="flex items-center justify-between gap-4">
                                    <Link href={`/admin/aulas/${a.public_id}`} className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="rounded-full bg-surface-3 text-[10px] font-semibold uppercase tracking-wider text-foreground-muted px-2 py-0.5">{TIPO_LABEL[a.tipo_aula]}</span>
                                            <p className="font-medium text-foreground truncate hover:text-accent transition-colors">{a.titulo}</p>
                                        </div>
                                        <p className="text-xs text-foreground-muted mt-1">{formatDuracao(a.duracao_segundos)}</p>
                                    </Link>
                                    <div className="flex items-center gap-1">
                                        <Link href={`/admin/aulas/${a.public_id}`} className="grid h-8 w-8 place-items-center rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface-3" aria-label="Editar aula"><Pencil size={14} /></Link>
                                        <button type="button" onClick={() => setAulaToDelete(a)} className="grid h-8 w-8 place-items-center rounded-lg text-foreground-muted hover:text-accent hover:bg-accent/10" aria-label="Excluir aula"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                            )}
                        />
                    )}
                </div>
            </div>

            <Dialog
                open={openNew}
                onOpenChange={setOpenNew}
                title="Nova aula"
                description="Crie uma aula. Você poderá editar todos os detalhes em seguida."
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setOpenNew(false)} disabled={newAula.processing}>Cancelar</Button>
                        <Button onClick={createAula} disabled={newAula.processing}>{newAula.processing ? 'Criando…' : 'Criar aula'}</Button>
                    </>
                }
            >
                <form onSubmit={createAula} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="aula-titulo">Título</Label>
                        <Input id="aula-titulo" value={newAula.data.titulo} onChange={(e) => newAula.setData('titulo', e.target.value)} invalid={!!newAula.errors.titulo} autoFocus />
                        {newAula.errors.titulo && <p className="text-xs text-accent">{newAula.errors.titulo}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="aula-tipo">Tipo</Label>
                        <Select id="aula-tipo" value={newAula.data.tipo_aula} onChange={(e) => newAula.setData('tipo_aula', e.target.value as Aula['tipo_aula'])}>
                            <option value="video">Vídeo</option>
                            <option value="texto">Texto</option>
                            <option value="quiz">Quiz</option>
                        </Select>
                    </div>
                    {newAula.data.tipo_aula === 'video' && (
                        <div className="space-y-1.5">
                            <Label htmlFor="aula-url">URL do vídeo</Label>
                            <Input id="aula-url" type="url" value={newAula.data.url_video} onChange={(e) => newAula.setData('url_video', e.target.value)} invalid={!!newAula.errors.url_video} placeholder="https://..." />
                            {newAula.errors.url_video && <p className="text-xs text-accent">{newAula.errors.url_video}</p>}
                        </div>
                    )}
                    {newAula.data.tipo_aula === 'texto' && (
                        <div className="space-y-1.5">
                            <Label htmlFor="aula-conteudo">Conteúdo (Markdown)</Label>
                            <textarea
                                id="aula-conteudo"
                                value={newAula.data.conteudo}
                                onChange={(e) => newAula.setData('conteudo', e.target.value)}
                                className="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-foreground resize-y min-h-[120px]"
                            />
                            {newAula.errors.conteudo && <p className="text-xs text-accent">{newAula.errors.conteudo}</p>}
                        </div>
                    )}
                </form>
            </Dialog>

            <ConfirmDialog
                open={!!aulaToDelete}
                onOpenChange={(v) => !v && setAulaToDelete(null)}
                title="Excluir aula"
                description={aulaToDelete ? `Excluir a aula "${aulaToDelete.titulo}"?` : ''}
                onConfirm={confirmDeleteAula}
                confirmLabel="Excluir aula"
            />
        </AdminLayout>
    )
}
```

- [ ] **Step 2: Build + commit**

```bash
bun run build
git add resources/js/Pages/Admin/Modulos
git commit -m "feat(admin): página de edição de módulo com lista ordenável de aulas"
```

### Task 1.9: Página Admin/Aulas/Edit (editor completo)

**Files:**
- Create: `resources/js/Pages/Admin/Aulas/Edit.tsx`

- [ ] **Step 1: Implementar editor de aula**

`resources/js/Pages/Admin/Aulas/Edit.tsx`:

```tsx
import { Head, useForm } from '@inertiajs/react'
import AdminLayout from '@/layouts/AdminLayout'
import { PageHeader } from '@/components/admin/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

type Aula = {
    public_id: string
    titulo: string
    tipo_aula: 'video' | 'texto' | 'quiz'
    url_video: string | null
    youtube_video_id: string | null
    conteudo: string | null
    duracao_segundos: number | null
    ordem: number
}
type Curso = { public_id: string; titulo: string }
type Modulo = { public_id: string; titulo: string }

export default function Edit({ curso, modulo, aula }: { curso: Curso; modulo: Modulo; aula: Aula }) {
    const form = useForm({
        titulo: aula.titulo,
        tipo_aula: aula.tipo_aula,
        url_video: aula.url_video ?? '',
        youtube_video_id: aula.youtube_video_id ?? '',
        conteudo: aula.conteudo ?? '',
        duracao_segundos: aula.duracao_segundos ?? 0,
    })

    function submit(e: React.FormEvent): void {
        e.preventDefault()
        form.put(`/admin/aulas/${aula.public_id}`)
    }

    return (
        <AdminLayout breadcrumbs={[
            { label: 'Cursos', href: '/admin/cursos' },
            { label: curso.titulo, href: `/admin/cursos/${curso.public_id}` },
            { label: modulo.titulo, href: `/admin/modulos/${modulo.public_id}` },
            { label: aula.titulo },
        ]}>
            <Head title={`${aula.titulo} | Admin`} />
            <PageHeader title={aula.titulo} description="Editor da aula" />

            <form onSubmit={submit} className="max-w-3xl space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_180px] gap-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="titulo">Título</Label>
                        <Input id="titulo" value={form.data.titulo} onChange={(e) => form.setData('titulo', e.target.value)} invalid={!!form.errors.titulo} />
                        {form.errors.titulo && <p className="text-xs text-accent">{form.errors.titulo}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="tipo">Tipo</Label>
                        <Select id="tipo" value={form.data.tipo_aula} onChange={(e) => form.setData('tipo_aula', e.target.value as Aula['tipo_aula'])}>
                            <option value="video">Vídeo</option>
                            <option value="texto">Texto</option>
                            <option value="quiz">Quiz</option>
                        </Select>
                    </div>
                </div>

                {form.data.tipo_aula === 'video' && (
                    <>
                        <div className="space-y-1.5">
                            <Label htmlFor="url_video">URL do vídeo</Label>
                            <Input id="url_video" type="url" value={form.data.url_video} onChange={(e) => form.setData('url_video', e.target.value)} invalid={!!form.errors.url_video} placeholder="https://youtu.be/..." />
                            {form.errors.url_video && <p className="text-xs text-accent">{form.errors.url_video}</p>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="yt">YouTube ID (opcional)</Label>
                                <Input id="yt" value={form.data.youtube_video_id} onChange={(e) => form.setData('youtube_video_id', e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="dur">Duração (segundos)</Label>
                                <Input id="dur" type="number" min={0} value={form.data.duracao_segundos} onChange={(e) => form.setData('duracao_segundos', Number(e.target.value))} />
                            </div>
                        </div>
                    </>
                )}

                {form.data.tipo_aula === 'texto' && (
                    <div className="space-y-1.5">
                        <Label htmlFor="conteudo">Conteúdo (Markdown)</Label>
                        <Textarea id="conteudo" value={form.data.conteudo} onChange={(e) => form.setData('conteudo', e.target.value)} invalid={!!form.errors.conteudo} className="min-h-[280px] font-mono text-[13px]" />
                        {form.errors.conteudo && <p className="text-xs text-accent">{form.errors.conteudo}</p>}
                    </div>
                )}

                {form.data.tipo_aula === 'quiz' && (
                    <p className="text-sm text-foreground-muted italic">Editor de quiz será implementado em fase futura.</p>
                )}

                <div className="flex items-center gap-3 pt-2">
                    <Button type="submit" disabled={form.processing}>{form.processing ? 'Salvando…' : 'Salvar aula'}</Button>
                    <Button type="button" variant="ghost" onClick={() => history.back()}>Voltar</Button>
                </div>
            </form>
        </AdminLayout>
    )
}
```

- [ ] **Step 2: Build + commit**

```bash
bun run build
git add resources/js/Pages/Admin/Aulas
git commit -m "feat(admin): editor completo de aula com campos condicionais por tipo"
```

### Task 1.10: Verificação manual fluxo completo de Curso

- [ ] **Step 1: Rodar servidor + browser test**

Em terminal: `composer run dev` (ou `php artisan serve` + `bun run dev`).

Smoke test no browser (logado como admin):
1. `/admin/cursos` → deve listar cursos com ações.
2. Clicar "Novo curso" → criar curso "Teste Manual".
3. Em `/admin/cursos/{id}`: editar metadados, criar módulo "M1", drag-drop módulos, criar aula vídeo+texto, drag-drop aulas, editar aula completa.
4. Excluir aula → confirma → toast verde.
5. Excluir módulo → confirma → toast verde.
6. Excluir curso → confirma → redirect para `/admin/cursos`, toast verde.

Reportar qualquer divergência ao próximo step.

- [ ] **Step 2: Rodar suite completa**

```bash
./vendor/bin/pest tests/Feature --compact
```

Expected: tudo verde.

- [ ] **Step 3: Commit (se necessário) e marcar fase 1 concluída**

```bash
git status
git commit -am "test: fase 1 verificada manualmente" || true
```

---

## Fase 2 — CRUD de Usuários

### Task 2.1: Form Requests + Action para criar/atualizar usuário

**Files:**
- Create: `app/Http/Requests/Admin/StoreUserRequest.php`
- Create: `app/Http/Requests/Admin/UpdateUserRequest.php`
- Create: `app/Actions/Admin/CreateUserByAdmin.php`
- Create: `app/Actions/Admin/UpdateUserByAdmin.php`
- Test: `tests/Feature/Admin/AdminUserCrudTest.php`

- [ ] **Step 1: Teste falhando**

`tests/Feature/Admin/AdminUserCrudTest.php`:

```php
<?php

use App\Enums\PapelEnum;
use App\Models\User;

beforeEach(function (): void {
    $this->admin = User::factory()->create(['papel' => PapelEnum::ADMIN]);
    $this->superuser = User::factory()->create(['papel' => PapelEnum::SUPERUSER]);
});

it('lista usuários', function (): void {
    User::factory()->count(3)->create(['papel' => PapelEnum::ALUNO]);

    $this->actingAs($this->admin)
        ->get(route('admin.usuarios.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('Admin/Usuarios/Index'));
});

it('admin cria aluno', function (): void {
    $this->actingAs($this->admin)
        ->post(route('admin.usuarios.store'), [
            'nome_completo' => 'Joana Silva',
            'email' => 'joana@example.com',
            'password' => 'senha-forte-123',
            'password_confirmation' => 'senha-forte-123',
            'papel' => PapelEnum::ALUNO->value,
        ])
        ->assertRedirect();

    expect(User::where('email', 'joana@example.com')->first()?->papel)->toBe(PapelEnum::ALUNO);
});

it('admin não pode criar admin', function (): void {
    $this->actingAs($this->admin)
        ->post(route('admin.usuarios.store'), [
            'nome_completo' => 'X',
            'email' => 'x@example.com',
            'password' => 'senha-forte-123',
            'password_confirmation' => 'senha-forte-123',
            'papel' => PapelEnum::ADMIN->value,
        ])
        ->assertSessionHasErrors('papel');
});

it('superuser cria admin', function (): void {
    $this->actingAs($this->superuser)
        ->post(route('admin.usuarios.store'), [
            'nome_completo' => 'Novo Admin',
            'email' => 'admin2@example.com',
            'password' => 'senha-forte-123',
            'password_confirmation' => 'senha-forte-123',
            'papel' => PapelEnum::ADMIN->value,
        ])
        ->assertRedirect();

    expect(User::where('email', 'admin2@example.com')->first()?->papel)->toBe(PapelEnum::ADMIN);
});

it('admin não atualiza admin', function (): void {
    $outro = User::factory()->create(['papel' => PapelEnum::ADMIN]);

    $this->actingAs($this->admin)
        ->put(route('admin.usuarios.update', $outro), [
            'nome_completo' => 'mudado',
            'email' => $outro->email,
            'papel' => PapelEnum::ADMIN->value,
        ])
        ->assertForbidden();
});

it('superuser não pode excluir a si próprio', function (): void {
    $this->actingAs($this->superuser)
        ->delete(route('admin.usuarios.destroy', $this->superuser))
        ->assertForbidden();
});

it('admin exclui aluno', function (): void {
    $aluno = User::factory()->create(['papel' => PapelEnum::ALUNO]);

    $this->actingAs($this->admin)
        ->delete(route('admin.usuarios.destroy', $aluno))
        ->assertRedirect();

    expect(User::find($aluno->id))->toBeNull();
});

it('atualizar senha é opcional', function (): void {
    $aluno = User::factory()->create(['papel' => PapelEnum::ALUNO]);
    $hashAntigo = $aluno->password;

    $this->actingAs($this->admin)
        ->put(route('admin.usuarios.update', $aluno), [
            'nome_completo' => 'Renomeado',
            'email' => $aluno->email,
            'papel' => PapelEnum::ALUNO->value,
        ])
        ->assertRedirect();

    expect($aluno->fresh()->password)->toBe($hashAntigo);
});
```

- [ ] **Step 2: Verificar falha**

```bash
./vendor/bin/pest tests/Feature/Admin/AdminUserCrudTest.php --compact
```

Expected: FAIL.

- [ ] **Step 3: StoreUserRequest com validação de papel por actor**

`app/Http/Requests/Admin/StoreUserRequest.php`:

```php
<?php

namespace App\Http\Requests\Admin;

use App\Enums\PapelEnum;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', User::class) ?? false;
    }

    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'nome_completo' => ['required', 'string', 'max:300'],
            'name' => ['nullable', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:200', 'unique:usuarios,email'],
            'password' => ['required', 'confirmed', Password::min(8)],
            'papel' => ['required', Rule::enum(PapelEnum::class)],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($v): void {
            $papel = PapelEnum::tryFrom((string) $this->input('papel'));
            if ($papel === null) return;

            if (! $this->user()?->can('createWithRole', [User::class, $papel])) {
                $v->errors()->add('papel', 'Você não tem permissão para criar usuário com este papel.');
            }
        });
    }
}
```

> Nota: `can('createWithRole', [User::class, $papel])` chama `UserPolicy::createWithRole($actor, $papel)`. Confirme em testes.

- [ ] **Step 4: UpdateUserRequest**

`app/Http/Requests/Admin/UpdateUserRequest.php`:

```php
<?php

namespace App\Http\Requests\Admin;

use App\Enums\PapelEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('user')) ?? false;
    }

    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        $user = $this->route('user');

        return [
            'nome_completo' => ['required', 'string', 'max:300'],
            'name' => ['nullable', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:200', Rule::unique('usuarios', 'email')->ignore($user->id)],
            'papel' => ['required', Rule::enum(PapelEnum::class)],
            'password' => ['nullable', 'confirmed', Password::min(8)],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($v): void {
            $novoPapel = PapelEnum::tryFrom((string) $this->input('papel'));
            if ($novoPapel === null) return;

            $alvo = $this->route('user');
            if ($novoPapel === $alvo->papel) return;

            if (! $this->user()?->can('createWithRole', [\App\Models\User::class, $novoPapel])) {
                $v->errors()->add('papel', 'Você não pode atribuir este papel.');
            }
        });
    }
}
```

- [ ] **Step 5: Actions**

`app/Actions/Admin/CreateUserByAdmin.php`:

```php
<?php

namespace App\Actions\Admin;

use App\Enums\PapelEnum;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class CreateUserByAdmin
{
    /**
     * @param  array{nome_completo: string, name?: ?string, email: string, password: string, papel: string}  $data
     */
    public function handle(array $data): User
    {
        $papel = PapelEnum::from($data['papel']);

        return User::create([
            'nome_completo' => $data['nome_completo'],
            'name' => $data['name'] ?? $data['nome_completo'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'papel' => $papel,
            'is_staff' => $papel !== PapelEnum::ALUNO,
            'is_superuser' => $papel === PapelEnum::SUPERUSER,
            'aceitou_termos' => true,
        ]);
    }
}
```

`app/Actions/Admin/UpdateUserByAdmin.php`:

```php
<?php

namespace App\Actions\Admin;

use App\Enums\PapelEnum;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UpdateUserByAdmin
{
    /**
     * @param  array{nome_completo: string, name?: ?string, email: string, papel: string, password?: ?string}  $data
     */
    public function handle(User $user, array $data): User
    {
        $papel = PapelEnum::from($data['papel']);

        $update = [
            'nome_completo' => $data['nome_completo'],
            'name' => $data['name'] ?? $data['nome_completo'],
            'email' => $data['email'],
            'papel' => $papel,
            'is_staff' => $papel !== PapelEnum::ALUNO,
            'is_superuser' => $papel === PapelEnum::SUPERUSER,
        ];

        if (! empty($data['password'])) {
            $update['password'] = Hash::make($data['password']);
        }

        $user->update($update);

        return $user->refresh();
    }
}
```

- [ ] **Step 6: AdminUserController**

`app/Http/Controllers/Admin/AdminUserController.php`:

```php
<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Admin\CreateUserByAdmin;
use App\Actions\Admin\UpdateUserByAdmin;
use App\Enums\PapelEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Models\User;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminUserController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', User::class);

        $busca = trim((string) $request->string('q'));
        $papel = $request->string('papel')->toString() ?: null;

        $usuarios = User::query()
            ->when($busca !== '', fn ($q) => $q->where(function ($w) use ($busca): void {
                $w->where('nome_completo', 'ilike', "%{$busca}%")
                    ->orWhere('email', 'ilike', "%{$busca}%");
            }))
            ->when($papel, fn ($q) => $q->where('papel', $papel))
            ->orderByDesc('id')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (User $u) => [
                'public_id' => $u->public_id,
                'nome_completo' => $u->nome_completo,
                'email' => $u->email,
                'papel' => $u->papel->value,
                'ultimo_login' => $u->ultimo_login?->toIso8601String(),
                'criado_em' => $u->created_at?->toIso8601String(),
            ]);

        return Inertia::render('Admin/Usuarios/Index', [
            'usuarios' => $usuarios,
            'filtros' => ['q' => $busca, 'papel' => $papel],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', User::class);

        return Inertia::render('Admin/Usuarios/Create', [
            'papeis_permitidos' => $this->papeisPermitidos(),
        ]);
    }

    public function store(StoreUserRequest $request, CreateUserByAdmin $action): RedirectResponse
    {
        $user = $action->handle($request->validated());

        return redirect()
            ->route('admin.usuarios.index')
            ->with('success', "Usuário {$user->nome_completo} criado.");
    }

    public function edit(User $user): Response
    {
        $this->authorize('view', $user);

        return Inertia::render('Admin/Usuarios/Edit', [
            'usuario' => [
                'public_id' => $user->public_id,
                'nome_completo' => $user->nome_completo,
                'name' => $user->name,
                'email' => $user->email,
                'papel' => $user->papel->value,
            ],
            'papeis_permitidos' => $this->papeisPermitidos(),
        ]);
    }

    public function update(UpdateUserRequest $request, User $user, UpdateUserByAdmin $action): RedirectResponse
    {
        $action->handle($user, $request->validated());

        return back()->with('success', 'Usuário atualizado.');
    }

    public function destroy(User $user): RedirectResponse
    {
        $this->authorize('delete', $user);
        $user->delete();

        return redirect()
            ->route('admin.usuarios.index')
            ->with('success', 'Usuário excluído.');
    }

    /** @return array<int, string> */
    private function papeisPermitidos(): array
    {
        $actor = request()->user();
        return collect(PapelEnum::cases())
            ->filter(fn (PapelEnum $p) => $actor?->can('createWithRole', [User::class, $p]))
            ->map(fn (PapelEnum $p) => $p->value)
            ->values()
            ->all();
    }
}
```

- [ ] **Step 7: Verificar verde**

```bash
vendor/bin/pint --dirty --format agent
./vendor/bin/pest tests/Feature/Admin/AdminUserCrudTest.php --compact
```

Expected: 8 testes PASS.

- [ ] **Step 8: Commit**

```bash
git add app/ tests/Feature/Admin/AdminUserCrudTest.php
git commit -m "feat(admin): CRUD de usuários com gating por papel (admin não cria/edita admin)"
```

### Task 2.2: Page Admin/Usuarios/Index

**Files:**
- Create: `resources/js/Pages/Admin/Usuarios/Index.tsx`

- [ ] **Step 1: Implementar com busca/filtro/ações**

`resources/js/Pages/Admin/Usuarios/Index.tsx`:

```tsx
import { Head, Link, router } from '@inertiajs/react'
import { MoreHorizontal, Pencil, Plus, Search, Trash2, Users as UsersIcon } from 'lucide-react'
import { useState } from 'react'
import AdminLayout from '@/layouts/AdminLayout'
import { PageHeader } from '@/components/admin/PageHeader'
import { EmptyState } from '@/components/admin/EmptyState'
import { DataTable, type Column } from '@/components/admin/DataTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu'

type Papel = 'aluno' | 'admin' | 'superuser'
type Usuario = {
    public_id: string
    nome_completo: string
    email: string
    papel: Papel
    ultimo_login: string | null
    criado_em: string | null
}
type Page<T> = {
    data: T[]
    current_page: number
    last_page: number
    links: { url: string | null; label: string; active: boolean }[]
}

const PAPEL = {
    aluno: { label: 'Aluno', cls: 'bg-border text-foreground' },
    admin: { label: 'Admin', cls: 'bg-accent/15 text-accent' },
    superuser: { label: 'Superuser', cls: 'bg-warning/15 text-warning' },
} as const

function dateLabel(iso: string | null): string {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function Index({ usuarios, filtros }: { usuarios: Page<Usuario>; filtros: { q: string; papel: string | null } }) {
    const [q, setQ] = useState(filtros.q)
    const [papel, setPapel] = useState(filtros.papel ?? '')
    const [toDelete, setToDelete] = useState<Usuario | null>(null)

    function applyFilters(e?: React.FormEvent): void {
        e?.preventDefault()
        router.get('/admin/usuarios', { q, papel: papel || undefined }, { preserveState: true, replace: true })
    }

    const columns: Column<Usuario>[] = [
        {
            key: 'nome', header: 'Usuário',
            render: (u) => (
                <div className="min-w-0">
                    <Link href={`/admin/usuarios/${u.public_id}`} className="font-medium text-foreground hover:text-accent transition-colors block truncate">
                        {u.nome_completo}
                    </Link>
                    <p className="text-xs text-foreground-muted truncate">{u.email}</p>
                </div>
            ),
        },
        {
            key: 'papel', header: 'Papel',
            render: (u) => (
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${PAPEL[u.papel].cls}`}>
                    {PAPEL[u.papel].label}
                </span>
            ),
        },
        { key: 'ultimo', header: 'Último acesso', render: (u) => <span className="text-foreground">{dateLabel(u.ultimo_login)}</span> },
        { key: 'criado', header: 'Cadastro', render: (u) => <span className="text-foreground-muted">{dateLabel(u.criado_em)}</span> },
        {
            key: 'actions', header: '', align: 'right', width: '60px',
            render: (u) => (
                <DropdownMenu trigger={<MoreHorizontal size={16} className="text-foreground-muted hover:text-foreground" />}>
                    <DropdownMenuItem onClick={() => router.visit(`/admin/usuarios/${u.public_id}`)}>
                        <Pencil size={14} /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem destructive onClick={() => setToDelete(u)}>
                        <Trash2 size={14} /> Excluir
                    </DropdownMenuItem>
                </DropdownMenu>
            ),
        },
    ]

    return (
        <AdminLayout breadcrumbs={[{ label: 'Usuários' }]}>
            <Head title="Usuários | Admin" />
            <PageHeader
                title="Usuários"
                description="Gerencie alunos, admins e superusers."
                actions={<Button onClick={() => router.visit('/admin/usuarios/criar')}><Plus size={14} className="mr-1.5" /> Novo usuário</Button>}
            />

            <form onSubmit={applyFilters} className="flex flex-wrap items-center gap-3 mb-6">
                <div className="relative flex-1 min-w-[240px] max-w-md">
                    <Search size={14} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-subtle" />
                    <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome ou email…" className="pl-9" />
                </div>
                <Select value={papel} onChange={(e) => setPapel(e.target.value)} className="w-44">
                    <option value="">Todos os papéis</option>
                    <option value="aluno">Aluno</option>
                    <option value="admin">Admin</option>
                    <option value="superuser">Superuser</option>
                </Select>
                <Button type="submit" variant="ghost">Filtrar</Button>
            </form>

            <DataTable
                rows={usuarios.data}
                columns={columns}
                rowKey={(u) => u.public_id}
                empty={
                    <EmptyState
                        Icon={UsersIcon}
                        title="Nenhum usuário encontrado"
                        description="Ajuste os filtros ou crie um novo usuário."
                    />
                }
            />

            {usuarios.last_page > 1 && (
                <div className="flex items-center justify-center gap-1 mt-6">
                    {usuarios.links.map((l, i) => (
                        <button
                            key={i}
                            type="button"
                            disabled={!l.url}
                            onClick={() => l.url && router.visit(l.url, { preserveState: true })}
                            className={`px-3 h-8 rounded-md text-xs ${
                                l.active ? 'bg-accent text-white' : 'text-foreground-muted hover:text-foreground hover:bg-surface-3 disabled:opacity-30'
                            }`}
                            dangerouslySetInnerHTML={{ __html: l.label }}
                        />
                    ))}
                </div>
            )}

            <ConfirmDialog
                open={!!toDelete}
                onOpenChange={(v) => !v && setToDelete(null)}
                title="Excluir usuário"
                description={toDelete ? `Excluir "${toDelete.nome_completo}" (${toDelete.email})?` : ''}
                confirmLabel="Excluir usuário"
                onConfirm={() => {
                    if (!toDelete) return
                    router.delete(`/admin/usuarios/${toDelete.public_id}`, {
                        preserveScroll: true,
                        onFinish: () => setToDelete(null),
                    })
                }}
            />
        </AdminLayout>
    )
}
```

- [ ] **Step 2: Build + commit**

```bash
bun run build
git add resources/js/Pages/Admin/Usuarios/Index.tsx
git commit -m "feat(admin): listagem de usuários com busca, filtro por papel e ações"
```

### Task 2.3: Pages Admin/Usuarios/Create e Edit

**Files:**
- Create: `resources/js/Pages/Admin/Usuarios/Create.tsx`
- Create: `resources/js/Pages/Admin/Usuarios/Edit.tsx`

- [ ] **Step 1: Create**

`resources/js/Pages/Admin/Usuarios/Create.tsx`:

```tsx
import { Head, useForm } from '@inertiajs/react'
import AdminLayout from '@/layouts/AdminLayout'
import { PageHeader } from '@/components/admin/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'

const PAPEL_LABEL = { aluno: 'Aluno', admin: 'Admin', superuser: 'Superuser' } as const

export default function Create({ papeis_permitidos }: { papeis_permitidos: ('aluno' | 'admin' | 'superuser')[] }) {
    const form = useForm({
        nome_completo: '',
        email: '',
        password: '',
        password_confirmation: '',
        papel: papeis_permitidos[0] ?? 'aluno',
    })

    function submit(e: React.FormEvent): void {
        e.preventDefault()
        form.post('/admin/usuarios')
    }

    return (
        <AdminLayout breadcrumbs={[{ label: 'Usuários', href: '/admin/usuarios' }, { label: 'Novo' }]}>
            <Head title="Novo usuário | Admin" />
            <PageHeader title="Novo usuário" description="Crie um aluno, admin ou superuser." />
            <form onSubmit={submit} className="max-w-xl space-y-5">
                <div className="space-y-1.5">
                    <Label htmlFor="nome">Nome completo <span className="text-accent">*</span></Label>
                    <Input id="nome" value={form.data.nome_completo} onChange={(e) => form.setData('nome_completo', e.target.value)} invalid={!!form.errors.nome_completo} autoFocus />
                    {form.errors.nome_completo && <p className="text-xs text-accent">{form.errors.nome_completo}</p>}
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="email">Email <span className="text-accent">*</span></Label>
                    <Input id="email" type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} invalid={!!form.errors.email} />
                    {form.errors.email && <p className="text-xs text-accent">{form.errors.email}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="senha">Senha <span className="text-accent">*</span></Label>
                        <Input id="senha" type="password" value={form.data.password} onChange={(e) => form.setData('password', e.target.value)} invalid={!!form.errors.password} />
                        {form.errors.password && <p className="text-xs text-accent">{form.errors.password}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="senha2">Confirmar senha <span className="text-accent">*</span></Label>
                        <Input id="senha2" type="password" value={form.data.password_confirmation} onChange={(e) => form.setData('password_confirmation', e.target.value)} />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="papel">Papel <span className="text-accent">*</span></Label>
                    <Select id="papel" value={form.data.papel} onChange={(e) => form.setData('papel', e.target.value as typeof form.data.papel)} invalid={!!form.errors.papel}>
                        {papeis_permitidos.map((p) => (
                            <option key={p} value={p}>{PAPEL_LABEL[p]}</option>
                        ))}
                    </Select>
                    {form.errors.papel && <p className="text-xs text-accent">{form.errors.papel}</p>}
                    {!papeis_permitidos.includes('admin') && (
                        <p className="text-xs text-foreground-muted">Apenas superusers podem criar admins.</p>
                    )}
                </div>
                <div className="flex items-center gap-3 pt-2">
                    <Button type="submit" disabled={form.processing}>{form.processing ? 'Criando…' : 'Criar usuário'}</Button>
                    <Button type="button" variant="ghost" onClick={() => history.back()}>Cancelar</Button>
                </div>
            </form>
        </AdminLayout>
    )
}
```

- [ ] **Step 2: Edit**

`resources/js/Pages/Admin/Usuarios/Edit.tsx`:

```tsx
import { Head, useForm } from '@inertiajs/react'
import AdminLayout from '@/layouts/AdminLayout'
import { PageHeader } from '@/components/admin/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'

type Usuario = {
    public_id: string
    nome_completo: string
    name: string | null
    email: string
    papel: 'aluno' | 'admin' | 'superuser'
}

const PAPEL_LABEL = { aluno: 'Aluno', admin: 'Admin', superuser: 'Superuser' } as const

export default function Edit({ usuario, papeis_permitidos }: { usuario: Usuario; papeis_permitidos: ('aluno' | 'admin' | 'superuser')[] }) {
    const form = useForm({
        nome_completo: usuario.nome_completo,
        email: usuario.email,
        papel: usuario.papel,
        password: '',
        password_confirmation: '',
    })

    function submit(e: React.FormEvent): void {
        e.preventDefault()
        form.put(`/admin/usuarios/${usuario.public_id}`)
    }

    const papeisDisponiveis = Array.from(new Set([usuario.papel, ...papeis_permitidos]))

    return (
        <AdminLayout breadcrumbs={[{ label: 'Usuários', href: '/admin/usuarios' }, { label: usuario.nome_completo }]}>
            <Head title={`${usuario.nome_completo} | Admin`} />
            <PageHeader title={usuario.nome_completo} description={usuario.email} />
            <form onSubmit={submit} className="max-w-xl space-y-5">
                <div className="space-y-1.5">
                    <Label htmlFor="nome">Nome completo</Label>
                    <Input id="nome" value={form.data.nome_completo} onChange={(e) => form.setData('nome_completo', e.target.value)} invalid={!!form.errors.nome_completo} />
                    {form.errors.nome_completo && <p className="text-xs text-accent">{form.errors.nome_completo}</p>}
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} invalid={!!form.errors.email} />
                    {form.errors.email && <p className="text-xs text-accent">{form.errors.email}</p>}
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="papel">Papel</Label>
                    <Select id="papel" value={form.data.papel} onChange={(e) => form.setData('papel', e.target.value as Usuario['papel'])} invalid={!!form.errors.papel}>
                        {papeisDisponiveis.map((p) => (
                            <option key={p} value={p}>{PAPEL_LABEL[p]}</option>
                        ))}
                    </Select>
                    {form.errors.papel && <p className="text-xs text-accent">{form.errors.papel}</p>}
                </div>
                <div className="rounded-xl border border-border bg-surface-2 p-5 space-y-4">
                    <div>
                        <p className="text-sm font-medium text-foreground">Alterar senha</p>
                        <p className="text-xs text-foreground-muted mt-0.5">Deixe em branco para manter a senha atual.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="senha">Nova senha</Label>
                            <Input id="senha" type="password" value={form.data.password} onChange={(e) => form.setData('password', e.target.value)} invalid={!!form.errors.password} />
                            {form.errors.password && <p className="text-xs text-accent">{form.errors.password}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="senha2">Confirmar</Label>
                            <Input id="senha2" type="password" value={form.data.password_confirmation} onChange={(e) => form.setData('password_confirmation', e.target.value)} />
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3 pt-2">
                    <Button type="submit" disabled={form.processing}>{form.processing ? 'Salvando…' : 'Salvar usuário'}</Button>
                    <Button type="button" variant="ghost" onClick={() => history.back()}>Cancelar</Button>
                </div>
            </form>
        </AdminLayout>
    )
}
```

- [ ] **Step 3: Build + commit**

```bash
bun run build
git add resources/js/Pages/Admin/Usuarios
git commit -m "feat(admin): páginas de criar e editar usuário com gating visual de papéis"
```

### Task 2.4: Smoke test fluxo de usuários

- [ ] **Step 1: Verificação manual**

Logado como admin: criar aluno, editar aluno, excluir aluno. Tentar editar admin existente → deve aparecer 403.
Logado como superuser: criar admin, editar admin, transformar aluno em admin, tentar excluir a si próprio → 403.

- [ ] **Step 2: Rodar suite**

```bash
./vendor/bin/pest tests/Feature --compact
```

Expected: tudo verde.

- [ ] **Step 3: Commit**

```bash
git status
git commit -am "test: fase 2 verificada manualmente" || true
```

---

## Fase 3 — Chamados de Suporte (backend público + admin)

### Task 3.1: Model ChamadoSuporte completo + Enum status

**Files:**
- Modify: `app/Models/ChamadoSuporte.php`
- Create: `app/Enums/StatusChamadoEnum.php`
- Test: `tests/Feature/Suporte/ChamadoModelTest.php`

- [ ] **Step 1: Criar enum**

`app/Enums/StatusChamadoEnum.php`:

```php
<?php

namespace App\Enums;

enum StatusChamadoEnum: string
{
    case NOVO = 'novo';
    case EM_ANDAMENTO = 'em_andamento';
    case RESOLVIDO = 'resolvido';
}
```

- [ ] **Step 2: Teste falhando para Model**

`tests/Feature/Suporte/ChamadoModelTest.php`:

```php
<?php

use App\Enums\StatusChamadoEnum;
use App\Models\ChamadoSuporte;
use App\Models\User;

it('cria chamado com defaults', function (): void {
    $chamado = ChamadoSuporte::create([
        'email_contato' => 'a@b.com',
        'assunto' => 'Bug',
        'mensagem' => 'Não funciona.',
    ]);

    expect($chamado->status)->toBe(StatusChamadoEnum::NOVO)
        ->and($chamado->public_id)->not->toBeEmpty();
});

it('relação usuario opcional', function (): void {
    $user = User::factory()->create();
    $chamado = ChamadoSuporte::create([
        'usuario_id' => $user->id,
        'email_contato' => $user->email,
        'assunto' => 'X',
        'mensagem' => 'Y',
    ]);

    expect($chamado->usuario->id)->toBe($user->id);
});
```

- [ ] **Step 3: Verificar falha**

```bash
./vendor/bin/pest tests/Feature/Suporte --compact
```

- [ ] **Step 4: Implementar Model**

`app/Models/ChamadoSuporte.php`:

```php
<?php

namespace App\Models;

use App\Concerns\HasPublicId;
use App\Enums\StatusChamadoEnum;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChamadoSuporte extends Model
{
    use HasFactory;
    use HasPublicId;

    protected $table = 'chamados_suportes';

    protected $fillable = [
        'public_id',
        'usuario_id',
        'email_contato',
        'assunto',
        'mensagem',
        'resposta',
        'status',
        'resolvido_em',
    ];

    protected function casts(): array
    {
        return [
            'status' => StatusChamadoEnum::class,
            'resolvido_em' => 'datetime',
        ];
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}
```

- [ ] **Step 5: Verificar verde**

```bash
vendor/bin/pint --dirty --format agent
./vendor/bin/pest tests/Feature/Suporte --compact
```

Expected: 2 PASS.

- [ ] **Step 6: Commit**

```bash
git add app/Models/ChamadoSuporte.php app/Enums/StatusChamadoEnum.php tests/Feature/Suporte
git commit -m "feat(suporte): model ChamadoSuporte com enum de status"
```

### Task 3.2: Endpoint público para criar chamado (substitui mock)

**Files:**
- Create: `app/Http/Requests/Suporte/StoreChamadoRequest.php`
- Create: `app/Http/Controllers/SuporteController.php`
- Modify: `routes/web.php`
- Test: `tests/Feature/Suporte/SuporteFormTest.php`

- [ ] **Step 1: Teste falhando**

`tests/Feature/Suporte/SuporteFormTest.php`:

```php
<?php

use App\Models\ChamadoSuporte;
use App\Models\User;

it('cria chamado de visitante anônimo', function (): void {
    $payload = [
        'name' => 'Visitante',
        'email' => 'v@example.com',
        'subject' => 'duvida',
        'message' => 'Mensagem com mais de 10 caracteres.',
    ];

    $this->post('/suporte', $payload)->assertRedirect();

    expect(ChamadoSuporte::where('email_contato', 'v@example.com')->exists())->toBeTrue();
});

it('associa usuário autenticado', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)->post('/suporte', [
        'name' => $user->nome_completo,
        'email' => $user->email,
        'subject' => 'duvida',
        'message' => 'Olá time, preciso de ajuda.',
    ])->assertRedirect();

    $chamado = ChamadoSuporte::latest('id')->first();
    expect($chamado->usuario_id)->toBe($user->id);
});

it('rejeita mensagem curta', function (): void {
    $this->post('/suporte', [
        'name' => 'X',
        'email' => 'x@x.com',
        'subject' => 'duvida',
        'message' => 'curto',
    ])->assertSessionHasErrors('message');
});
```

- [ ] **Step 2: StoreChamadoRequest**

`app/Http/Requests/Suporte/StoreChamadoRequest.php`:

```php
<?php

namespace App\Http\Requests\Suporte;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreChamadoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'subject' => ['required', Rule::in(['duvida', 'bug', 'cobranca', 'sugestao', 'outro'])],
            'message' => ['required', 'string', 'min:10', 'max:5000'],
        ];
    }

    public function messages(): array
    {
        return [
            'message.min' => 'Conte um pouco mais — a mensagem precisa ter ao menos 10 caracteres.',
        ];
    }
}
```

- [ ] **Step 3: SuporteController**

`app/Http/Controllers/SuporteController.php`:

```php
<?php

namespace App\Http\Controllers;

use App\Http\Requests\Suporte\StoreChamadoRequest;
use App\Models\ChamadoSuporte;
use Illuminate\Http\RedirectResponse;

class SuporteController extends Controller
{
    public function store(StoreChamadoRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $assunto = ucfirst($data['subject']).': '.\Illuminate\Support\Str::limit($data['message'], 60);

        ChamadoSuporte::create([
            'usuario_id' => $request->user()?->id,
            'email_contato' => $data['email'],
            'assunto' => $assunto,
            'mensagem' => $data['message'],
        ]);

        return back()->with('success', 'Mensagem enviada. Responderemos por email em breve.');
    }
}
```

- [ ] **Step 4: Atualizar routes/web.php**

Substituir a linha `Route::get('/suporte', fn () => Inertia::render('Suporte/Index'))->name('suporte.index');` por:

```php
use App\Http\Controllers\SuporteController;

Route::get('/suporte', fn () => Inertia::render('Suporte/Index'))->name('suporte.index');
Route::post('/suporte', [SuporteController::class, 'store'])->name('suporte.store');
```

- [ ] **Step 5: Atualizar `resources/js/Pages/Suporte/Index.tsx` para enviar via Inertia**

No componente existente, substituir o `setTimeout` mock pelo `useForm` do Inertia:

```tsx
import { useForm } from '@inertiajs/react'
// ...
const form = useForm({ name: '', email: '', subject: 'duvida', message: '' })

function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validateAll()) return
    form.post('/suporte', {
        preserveScroll: true,
        onSuccess: () => form.reset(),
    })
}
```

> Substituir bindings de inputs `value`/`onChange` para `form.data.X`/`form.setData('X', ...)`. Manter validações client-side existentes; o backend é a fonte da verdade.

- [ ] **Step 6: Verificar verde**

```bash
vendor/bin/pint --dirty --format agent
./vendor/bin/pest tests/Feature/Suporte --compact
bun run build
```

Expected: 3 testes PASS, build ok.

- [ ] **Step 7: Commit**

```bash
git add app/ routes/web.php resources/js/Pages/Suporte/Index.tsx tests/Feature/Suporte
git commit -m "feat(suporte): backend público para criar chamado de suporte"
```

### Task 3.3: AdminChamadoController (index/show/respond/resolve)

**Files:**
- Modify: `app/Http/Controllers/Admin/AdminChamadoController.php`
- Create: `app/Http/Requests/Admin/RespondChamadoRequest.php`
- Create: `app/Actions/Admin/RespondChamadoSuporte.php`
- Test: `tests/Feature/Admin/AdminChamadoTest.php`

- [ ] **Step 1: Teste falhando**

`tests/Feature/Admin/AdminChamadoTest.php`:

```php
<?php

use App\Enums\PapelEnum;
use App\Enums\StatusChamadoEnum;
use App\Models\ChamadoSuporte;
use App\Models\User;

beforeEach(function (): void {
    $this->admin = User::factory()->create(['papel' => PapelEnum::ADMIN]);
});

it('lista chamados', function (): void {
    ChamadoSuporte::create(['email_contato' => 'a@b.com', 'assunto' => 'X', 'mensagem' => 'msg']);

    $this->actingAs($this->admin)
        ->get(route('admin.suporte.index'))
        ->assertOk()
        ->assertInertia(fn ($p) => $p->component('Admin/Suporte/Index'));
});

it('responde chamado e marca em_andamento', function (): void {
    $chamado = ChamadoSuporte::create(['email_contato' => 'a@b.com', 'assunto' => 'X', 'mensagem' => 'msg']);

    $this->actingAs($this->admin)
        ->post(route('admin.suporte.respond', $chamado), ['resposta' => 'Olá, vamos verificar.'])
        ->assertRedirect();

    $fresh = $chamado->fresh();
    expect($fresh->resposta)->toBe('Olá, vamos verificar.')
        ->and($fresh->status)->toBe(StatusChamadoEnum::EM_ANDAMENTO);
});

it('resolve chamado', function (): void {
    $chamado = ChamadoSuporte::create(['email_contato' => 'a@b.com', 'assunto' => 'X', 'mensagem' => 'msg']);

    $this->actingAs($this->admin)
        ->post(route('admin.suporte.resolve', $chamado))
        ->assertRedirect();

    $fresh = $chamado->fresh();
    expect($fresh->status)->toBe(StatusChamadoEnum::RESOLVIDO)
        ->and($fresh->resolvido_em)->not->toBeNull();
});

it('aluno não acessa', function (): void {
    $aluno = User::factory()->create(['papel' => PapelEnum::ALUNO]);

    $this->actingAs($aluno)
        ->get(route('admin.suporte.index'))
        ->assertForbidden();
});
```

- [ ] **Step 2: Verificar falha**

```bash
./vendor/bin/pest tests/Feature/Admin/AdminChamadoTest.php --compact
```

- [ ] **Step 3: RespondChamadoRequest**

`app/Http/Requests/Admin/RespondChamadoRequest.php`:

```php
<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class RespondChamadoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('respond', $this->route('chamado')) ?? false;
    }

    /** @return array<string, array<int, string>> */
    public function rules(): array
    {
        return ['resposta' => ['required', 'string', 'min:5', 'max:5000']];
    }
}
```

- [ ] **Step 4: Action RespondChamadoSuporte**

`app/Actions/Admin/RespondChamadoSuporte.php`:

```php
<?php

namespace App\Actions\Admin;

use App\Enums\StatusChamadoEnum;
use App\Models\ChamadoSuporte;

class RespondChamadoSuporte
{
    public function handle(ChamadoSuporte $chamado, string $resposta): ChamadoSuporte
    {
        $chamado->update([
            'resposta' => $resposta,
            'status' => StatusChamadoEnum::EM_ANDAMENTO,
        ]);

        // TODO (fase futura): disparar email para $chamado->email_contato com a resposta.

        return $chamado->refresh();
    }
}
```

- [ ] **Step 5: AdminChamadoController**

`app/Http/Controllers/Admin/AdminChamadoController.php`:

```php
<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Admin\RespondChamadoSuporte;
use App\Enums\StatusChamadoEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\RespondChamadoRequest;
use App\Models\ChamadoSuporte;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminChamadoController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', ChamadoSuporte::class);

        $status = $request->string('status')->toString() ?: null;

        $chamados = ChamadoSuporte::query()
            ->with('usuario:id,public_id,nome_completo,email')
            ->when($status, fn ($q) => $q->where('status', $status))
            ->latest('id')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (ChamadoSuporte $c) => [
                'public_id' => $c->public_id,
                'assunto' => $c->assunto,
                'email_contato' => $c->email_contato,
                'status' => $c->status->value,
                'usuario' => $c->usuario ? [
                    'public_id' => $c->usuario->public_id,
                    'nome' => $c->usuario->nome_completo,
                ] : null,
                'criado_em' => $c->created_at?->toIso8601String(),
            ]);

        $contadores = [
            'novo' => ChamadoSuporte::where('status', StatusChamadoEnum::NOVO)->count(),
            'em_andamento' => ChamadoSuporte::where('status', StatusChamadoEnum::EM_ANDAMENTO)->count(),
            'resolvido' => ChamadoSuporte::where('status', StatusChamadoEnum::RESOLVIDO)->count(),
        ];

        return Inertia::render('Admin/Suporte/Index', [
            'chamados' => $chamados,
            'filtros' => ['status' => $status],
            'contadores' => $contadores,
        ]);
    }

    public function show(ChamadoSuporte $chamado): Response
    {
        $this->authorize('view', $chamado);
        $chamado->load('usuario:id,public_id,nome_completo,email');

        return Inertia::render('Admin/Suporte/Show', [
            'chamado' => [
                'public_id' => $chamado->public_id,
                'assunto' => $chamado->assunto,
                'mensagem' => $chamado->mensagem,
                'resposta' => $chamado->resposta,
                'status' => $chamado->status->value,
                'email_contato' => $chamado->email_contato,
                'usuario' => $chamado->usuario ? [
                    'public_id' => $chamado->usuario->public_id,
                    'nome' => $chamado->usuario->nome_completo,
                    'email' => $chamado->usuario->email,
                ] : null,
                'criado_em' => $chamado->created_at?->toIso8601String(),
                'resolvido_em' => $chamado->resolvido_em?->toIso8601String(),
            ],
        ]);
    }

    public function respond(RespondChamadoRequest $request, ChamadoSuporte $chamado, RespondChamadoSuporte $action): RedirectResponse
    {
        $action->handle($chamado, $request->validated('resposta'));

        return back()->with('success', 'Resposta registrada.');
    }

    public function resolve(ChamadoSuporte $chamado): RedirectResponse
    {
        $this->authorize('resolve', $chamado);
        $chamado->update([
            'status' => StatusChamadoEnum::RESOLVIDO,
            'resolvido_em' => now(),
        ]);

        return back()->with('success', 'Chamado resolvido.');
    }
}
```

- [ ] **Step 6: Verificar verde**

```bash
vendor/bin/pint --dirty --format agent
./vendor/bin/pest tests/Feature/Admin/AdminChamadoTest.php --compact
```

Expected: 4 testes PASS.

- [ ] **Step 7: Commit**

```bash
git add app/ tests/Feature/Admin/AdminChamadoTest.php
git commit -m "feat(admin): backend de chamados de suporte (listar/responder/resolver)"
```

### Task 3.4: Pages Admin/Suporte/Index e Show

**Files:**
- Create: `resources/js/Pages/Admin/Suporte/Index.tsx`
- Create: `resources/js/Pages/Admin/Suporte/Show.tsx`

- [ ] **Step 1: Index com tabs por status**

`resources/js/Pages/Admin/Suporte/Index.tsx`:

```tsx
import { Head, Link, router } from '@inertiajs/react'
import { LifeBuoy } from 'lucide-react'
import AdminLayout from '@/layouts/AdminLayout'
import { PageHeader } from '@/components/admin/PageHeader'
import { EmptyState } from '@/components/admin/EmptyState'
import { DataTable, type Column } from '@/components/admin/DataTable'

type Status = 'novo' | 'em_andamento' | 'resolvido'
type Chamado = {
    public_id: string
    assunto: string
    email_contato: string
    status: Status
    usuario: { public_id: string; nome: string } | null
    criado_em: string | null
}
type Page<T> = { data: T[]; links: { url: string | null; label: string; active: boolean }[]; last_page: number }

const STATUS = {
    novo: { label: 'Novo', cls: 'bg-accent/15 text-accent' },
    em_andamento: { label: 'Em andamento', cls: 'bg-warning/15 text-warning' },
    resolvido: { label: 'Resolvido', cls: 'bg-success/15 text-success' },
} as const

const TABS: { key: Status | 'todos'; label: string }[] = [
    { key: 'todos', label: 'Todos' },
    { key: 'novo', label: 'Novos' },
    { key: 'em_andamento', label: 'Em andamento' },
    { key: 'resolvido', label: 'Resolvidos' },
]

function timeAgo(iso: string | null): string {
    if (!iso) return '—'
    const diff = (Date.now() - new Date(iso).getTime()) / 1000
    if (diff < 60) return 'agora'
    if (diff < 3600) return `${Math.floor(diff / 60)} min`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`
    return `${Math.floor(diff / 86400)}d`
}

export default function Index({
    chamados, filtros, contadores,
}: {
    chamados: Page<Chamado>
    filtros: { status: string | null }
    contadores: Record<Status, number>
}) {
    const activeTab: Status | 'todos' = (filtros.status as Status) ?? 'todos'

    const columns: Column<Chamado>[] = [
        {
            key: 'assunto', header: 'Assunto',
            render: (c) => (
                <Link href={`/admin/suporte/${c.public_id}`} className="font-medium text-foreground hover:text-accent transition-colors block truncate max-w-md">
                    {c.assunto}
                </Link>
            ),
        },
        {
            key: 'usuario', header: 'De',
            render: (c) => (
                <div className="min-w-0">
                    <p className="text-foreground truncate">{c.usuario?.nome ?? c.email_contato}</p>
                    {c.usuario && <p className="text-xs text-foreground-muted truncate">{c.email_contato}</p>}
                </div>
            ),
        },
        {
            key: 'status', header: 'Status',
            render: (c) => (
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${STATUS[c.status].cls}`}>
                    {STATUS[c.status].label}
                </span>
            ),
        },
        { key: 'data', header: 'Recebido', align: 'right', width: '100px', render: (c) => <span className="text-foreground-muted tabular-nums">{timeAgo(c.criado_em)}</span> },
    ]

    function setTab(key: Status | 'todos'): void {
        router.get('/admin/suporte', key === 'todos' ? {} : { status: key }, { preserveState: true, replace: true })
    }

    return (
        <AdminLayout breadcrumbs={[{ label: 'Suporte' }]}>
            <Head title="Suporte | Admin" />
            <PageHeader title="Chamados de suporte" description="Responda e acompanhe pedidos de ajuda dos usuários." />

            {/* Segmented control — tabs com contadores protagonistas (não underline, é filtro de status, não navigation) */}
            <div role="tablist" className="inline-flex items-center gap-0 p-1 rounded-xl border border-border bg-surface-2 mb-8">
                {TABS.map((t) => {
                    const count = t.key === 'todos' ? contadores.novo + contadores.em_andamento + contadores.resolvido : contadores[t.key]
                    const active = activeTab === t.key
                    return (
                        <button
                            key={t.key}
                            role="tab"
                            aria-selected={active}
                            type="button"
                            onClick={() => setTab(t.key)}
                            className={`relative flex items-center gap-2 px-3.5 h-8 rounded-lg text-xs font-medium transition-all ${
                                active
                                    ? 'bg-surface text-foreground shadow-sm shadow-black/40'
                                    : 'text-foreground-muted hover:text-foreground'
                            }`}
                        >
                            <span>{t.label}</span>
                            {count > 0 && (
                                <span className={`font-mono tabular-nums text-[10px] px-1.5 py-0.5 rounded-md ${
                                    active
                                        ? t.key === 'novo' ? 'bg-accent text-white' : 'bg-surface-3 text-foreground-muted'
                                        : t.key === 'novo' ? 'bg-accent/15 text-accent' : 'bg-surface-3 text-foreground-faint'
                                }`}>
                                    {count}
                                </span>
                            )}
                        </button>
                    )
                })}
            </div>

            <DataTable
                rows={chamados.data}
                columns={columns}
                rowKey={(c) => c.public_id}
                onRowClick={(c) => router.visit(`/admin/suporte/${c.public_id}`)}
                empty={
                    <EmptyState
                        Icon={LifeBuoy}
                        title="Nenhum chamado por aqui"
                        description="Quando alguém abrir um chamado, ele aparecerá nesta lista."
                    />
                }
            />

            {chamados.last_page > 1 && (
                <div className="flex items-center justify-center gap-1 mt-6">
                    {chamados.links.map((l, i) => (
                        <button
                            key={i}
                            type="button"
                            disabled={!l.url}
                            onClick={() => l.url && router.visit(l.url, { preserveState: true })}
                            className={`px-3 h-8 rounded-md text-xs ${
                                l.active ? 'bg-accent text-white' : 'text-foreground-muted hover:text-foreground hover:bg-surface-3 disabled:opacity-30'
                            }`}
                            dangerouslySetInnerHTML={{ __html: l.label }}
                        />
                    ))}
                </div>
            )}
        </AdminLayout>
    )
}
```

- [ ] **Step 2: Show com conversa + form de resposta**

`resources/js/Pages/Admin/Suporte/Show.tsx`:

```tsx
import { Head, router, useForm } from '@inertiajs/react'
import { Check, Pencil, Reply } from 'lucide-react'
import AdminLayout from '@/layouts/AdminLayout'
import { PageHeader } from '@/components/admin/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { STATUS_CHAMADO_TONE, STATUS_CHAMADO_LABEL } from '@/lib/status-tones'

type Status = 'novo' | 'em_andamento' | 'resolvido'
type Chamado = {
    public_id: string
    assunto: string
    mensagem: string
    resposta: string | null
    status: Status
    email_contato: string
    usuario: { public_id: string; nome: string; email: string } | null
    criado_em: string | null
    resolvido_em: string | null
}

function dateLabel(iso: string | null): string {
    if (!iso) return '—'
    return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function Show({ chamado }: { chamado: Chamado }) {
    const form = useForm({ resposta: chamado.resposta ?? '' })

    function submit(e: React.FormEvent): void {
        e.preventDefault()
        form.post(`/admin/suporte/${chamado.public_id}/responder`, { preserveScroll: true })
    }

    function resolve(): void {
        router.post(`/admin/suporte/${chamado.public_id}/resolver`, {}, { preserveScroll: true })
    }

    return (
        <AdminLayout breadcrumbs={[
            { label: 'Suporte', href: '/admin/suporte' },
            { label: chamado.assunto.length > 40 ? chamado.assunto.slice(0, 40) + '…' : chamado.assunto },
        ]}>
            <Head title={`${chamado.assunto} | Admin`} />
            <PageHeader
                title={chamado.assunto}
                description={`Aberto ${dateLabel(chamado.criado_em)}`}
                actions={
                    chamado.status !== 'resolvido' ? (
                        <Button variant="ghost" onClick={resolve}><Check size={14} className="mr-1.5" /> Marcar como resolvido</Button>
                    ) : <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS.resolvido.cls}`}>Resolvido</span>
                }
            />

            {/* Layout editorial: timeline à esquerda com nodes, sidebar à direita */}
            <div className="grid lg:grid-cols-[1fr_280px] gap-x-12 gap-y-10">
                <div className="space-y-0">
                    {/* Timeline vertical contínua */}
                    <div className="relative pl-10 space-y-10 before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-px before:bg-border">

                        {/* Mensagem original */}
                        <article className="relative">
                            <div className="absolute -left-10 top-0.5 grid h-7 w-7 place-items-center rounded-full bg-surface-2 border border-border text-[11px] font-medium text-foreground-muted">
                                {(chamado.usuario?.nome ?? chamado.email_contato).slice(0, 1).toUpperCase()}
                            </div>
                            <header className="flex items-baseline justify-between gap-3 mb-3">
                                <div className="flex items-baseline gap-2 min-w-0">
                                    <span className="text-sm font-medium text-foreground">{chamado.usuario?.nome ?? 'Visitante'}</span>
                                    <span className="text-xs text-foreground-faint">·</span>
                                    <span className="text-xs text-foreground-muted truncate">{chamado.email_contato}</span>
                                </div>
                                <time className="text-xs font-mono text-foreground-faint shrink-0 tabular-nums">{dateLabel(chamado.criado_em)}</time>
                            </header>
                            <p className="text-sm text-foreground whitespace-pre-wrap leading-[1.65]">{chamado.mensagem}</p>
                        </article>

                        {/* Resposta admin — visualmente distinta com bg accent */}
                        {chamado.resposta && (
                            <article className="relative">
                                <div className="absolute -left-10 top-0.5 grid h-7 w-7 place-items-center rounded-full bg-accent/12 text-accent border border-accent/30">
                                    <Reply size={12} />
                                </div>
                                <header className="flex items-baseline justify-between gap-3 mb-3">
                                    <span className="text-sm font-medium text-foreground">Resposta</span>
                                    <Badge tone="accent" variant="outline">VOCÊ</Badge>
                                </header>
                                <div className="rounded-xl bg-accent/5 border border-accent/15 p-4">
                                    <p className="text-sm whitespace-pre-wrap leading-[1.65] text-foreground">{chamado.resposta}</p>
                                </div>
                            </article>
                        )}

                        {/* Form de resposta — continuação da timeline */}
                        {chamado.status !== 'resolvido' && (
                            <div className="relative pt-2 mt-4 border-t border-dashed border-border">
                                <div className="absolute -left-10 top-6 grid h-7 w-7 place-items-center rounded-full bg-surface-3 text-foreground-muted border border-border">
                                    <Pencil size={12} />
                                </div>
                                <form onSubmit={submit} className="space-y-3 pt-4">
                                    <Label htmlFor="resposta">{chamado.resposta ? 'Atualizar resposta' : 'Responder'}</Label>
                                    <Textarea
                                        id="resposta"
                                        value={form.data.resposta}
                                        onChange={(e) => form.setData('resposta', e.target.value)}
                                        invalid={!!form.errors.resposta}
                                        placeholder="Escreva a resposta ao usuário…"
                                        className="min-h-[160px] text-[15px] leading-[1.65]"
                                    />
                                    {form.errors.resposta && <p className="text-xs text-accent">{form.errors.resposta}</p>}
                                    <div className="flex items-center justify-end gap-3">
                                        <Button type="submit" disabled={form.processing}>{form.processing ? 'Enviando…' : 'Enviar resposta'}</Button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar — tipografia editorial, sticky */}
                <aside className="lg:sticky lg:top-24 lg:self-start space-y-8 text-sm">
                    <section>
                        <p className="text-[10px] uppercase tracking-[0.18em] text-foreground-faint mb-3">Status</p>
                        <Badge tone={STATUS_CHAMADO_TONE[chamado.status]} variant="soft" dot pulse={chamado.status === 'novo'}>
                            {STATUS_CHAMADO_LABEL[chamado.status]}
                        </Badge>
                    </section>
                    <section>
                        <p className="text-[10px] uppercase tracking-[0.18em] text-foreground-faint mb-3">Linha do tempo</p>
                        <dl className="space-y-2.5 font-mono text-xs">
                            <div className="flex justify-between">
                                <dt className="text-foreground-muted">Aberto</dt>
                                <dd className="text-foreground tabular-nums">{dateLabel(chamado.criado_em)}</dd>
                            </div>
                            {chamado.resolvido_em && (
                                <div className="flex justify-between">
                                    <dt className="text-foreground-muted">Resolvido</dt>
                                    <dd className="text-success tabular-nums">{dateLabel(chamado.resolvido_em)}</dd>
                                </div>
                            )}
                        </dl>
                    </section>

                    {chamado.usuario && (
                        <section>
                            <p className="text-[10px] uppercase tracking-[0.18em] text-foreground-faint mb-3">Usuário</p>
                            <p className="text-foreground font-medium">{chamado.usuario.nome}</p>
                            <p className="text-xs text-foreground-muted">{chamado.usuario.email}</p>
                            <a href={`/admin/usuarios/${chamado.usuario.public_id}`} className="text-xs text-accent hover:underline mt-2 inline-block">Ver perfil →</a>
                        </section>
                    )}
                </aside>
            </div>
        </AdminLayout>
    )
}
```

- [ ] **Step 3: Build + commit**

```bash
bun run build
git add resources/js/Pages/Admin/Suporte
git commit -m "feat(admin): páginas de listar e responder chamados de suporte"
```

### Task 3.5: Atualizar AdminDashboard com contador de chamados pendentes

**Files:**
- Modify: `app/Http/Controllers/Admin/AdminDashboardController.php`
- Modify: `resources/js/Pages/Admin/Dashboard.tsx`

- [ ] **Step 1: Adicionar contadores ao controller**

Em `AdminDashboardController`, adicionar ao array de props:

```php
'chamados_abertos' => \App\Models\ChamadoSuporte::whereIn('status', ['novo', 'em_andamento'])->count(),
```

- [ ] **Step 2: Adicionar card no Dashboard**

Em `resources/js/Pages/Admin/Dashboard.tsx`, adicionar terceiro card "Chamados abertos" no grid.

- [ ] **Step 3: Build + commit**

```bash
bun run build
vendor/bin/pint --dirty --format agent
git add app/Http/Controllers/Admin/AdminDashboardController.php resources/js/Pages/Admin/Dashboard.tsx
git commit -m "feat(admin): card de chamados abertos no dashboard"
```

### Task 3.6: Smoke test fluxo de suporte

- [ ] **Step 1: Verificação manual**

1. Como visitante: abrir `/suporte`, preencher e enviar → toast verde "Mensagem enviada".
2. Como admin: ir em `/admin/suporte`, ver chamado novo nas tabs, clicar para abrir, responder → status muda para "Em andamento", resposta visível.
3. Marcar como resolvido → tab "Resolvidos" mostra o item.
4. Aluno: tentar `/admin/suporte` → 403.

- [ ] **Step 2: Suite completa**

```bash
./vendor/bin/pest tests/Feature --compact
```

---

## Fase 4 — Polimento

### Task 4.1: AdminUserSeeder (criação idempotente de superuser)

**Files:**
- Create: `database/seeders/AdminUserSeeder.php`
- Modify: `database/seeders/DatabaseSeeder.php`

- [ ] **Step 1: Criar seeder**

`database/seeders/AdminUserSeeder.php`:

```php
<?php

namespace Database\Seeders;

use App\Enums\PapelEnum;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $email = config('app.admin_seed_email', 'admin@arturflix.local');
        $password = config('app.admin_seed_password', 'change-me-on-first-login');

        User::query()->updateOrCreate(
            ['email' => $email],
            [
                'public_id' => (string) Str::uuid(),
                'nome_completo' => 'Superuser ArturFlix',
                'name' => 'Superuser',
                'password' => Hash::make($password),
                'papel' => PapelEnum::SUPERUSER,
                'is_staff' => true,
                'is_superuser' => true,
                'aceitou_termos' => true,
            ],
        );
    }
}
```

- [ ] **Step 2: Registrar no DatabaseSeeder**

Em `database/seeders/DatabaseSeeder.php`, adicionar no método `run()`:

```php
$this->call(AdminUserSeeder::class);
```

- [ ] **Step 3: Adicionar config**

Em `config/app.php`, adicionar:

```php
'admin_seed_email' => env('ADMIN_SEED_EMAIL', 'admin@arturflix.local'),
'admin_seed_password' => env('ADMIN_SEED_PASSWORD', 'change-me-on-first-login'),
```

Em `.env.example`, adicionar `ADMIN_SEED_EMAIL=` e `ADMIN_SEED_PASSWORD=`.

- [ ] **Step 4: Rodar seed e verificar**

```bash
php artisan db:seed --class=AdminUserSeeder
```

Expected: superuser criado/atualizado.

- [ ] **Step 5: Commit**

```bash
git add database/seeders config/app.php .env.example
git commit -m "feat(seeders): superuser inicial idempotente para bootstrap do painel admin"
```

### Task 4.2: Suite completa + lint final

- [ ] **Step 1: Pint geral**

```bash
vendor/bin/pint --format agent
```

- [ ] **Step 2: Pest completo**

```bash
./vendor/bin/pest --compact
```

Expected: TODOS verdes.

- [ ] **Step 3: Build prod**

```bash
bun run build
```

Expected: build sem warnings novos.

- [ ] **Step 4: Commit (se necessário)**

```bash
git status
git commit -am "chore: lint + format final" || true
```

### Task 4.3: Atualizar README com instruções de operação

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Adicionar seção "Painel administrativo"**

No README.md, adicionar seção descrevendo:
- Como criar o superuser inicial: `php artisan db:seed --class=AdminUserSeeder` (após definir `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` em `.env`).
- Convenção de papéis: Aluno (default), Admin (gerencia conteúdo + alunos), Superuser (gerencia tudo, inclusive admins).
- Endpoints principais: `/admin`, `/admin/cursos`, `/admin/usuarios`, `/admin/suporte`.
- Como sair do painel: menu do usuário no canto superior direito → "Sair".

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: instruções operacionais do painel admin"
```

---

## Self-Review

**1. Spec coverage**

| Pedido do usuário | Coberto por |
|---|---|
| Sair do painel admin (logout, voltar à plataforma) | Task 0.4 (AdminHeader + UserMenu) |
| Adicionar cursos manualmente (com módulos e aulas) | Tasks 1.2 (backend), 1.3 (Create), 1.4–1.5 (módulos+aulas backend), 1.7–1.9 (UIs) |
| CRUD de usuários (com superuser para gerenciar admins) | Tasks 2.1 (backend + policy), 2.2 (Index), 2.3 (Create/Edit) |
| Aba para chamados de suporte (responder) | Tasks 3.1–3.5 |
| Editar e excluir cursos (não só visualizar) | Tasks 1.2 (backend update/destroy), 1.3 (Index com ações), 1.7 (Edit) |

Sem gaps.

**2. Placeholder scan**

Único TODO explícito: `Task 3.3 Step 4` — `// TODO (fase futura): disparar email para $chamado->email_contato`. É um lembrete de feature out-of-scope, não um placeholder no plano. Aceitável.

**3. Type consistency**

- `public_id` (UUID, string) usado consistentemente em rotas, controllers, props Inertia e componentes React.
- Enums tipados: `PapelEnum`, `TipoAulaEnum`, `StatusChamadoEnum`.
- `useForm` do Inertia v2 segue o padrão do form de importação YouTube já existente.
- Métodos de Policy nomeados consistentemente (`viewAny`, `view`, `create`, `update`, `delete`, `createWithRole`, `respond`, `resolve`).

---

## Refinamentos de design aplicados

> Os 9 pontos de revisão de frontend foram integrados diretamente nas tasks do plano:

| Ponto | Onde aplicado |
|---|---|
| AdminHeader / UserMenu — composição editorial, papel só no popup | Task 0.4 Steps 3–4 |
| DataTable — sticky header, accent-bar lateral no hover, paginação Linear-style | Task 1.1 Steps 6–7 |
| Edição em duas colunas — grid 4/8 assimétrico, sidebar sticky | Task 1.7 |
| SortableList — handle revealed, numeração mono, DragOverlay com accent glow | Task 1.6 Step 1 |
| ConfirmDialog — ícone AlertTriangle, nome do item em chip mono, cancel discreto | Task 1.1 Step 2 |
| Empty states — 3 variants (first-time/filtered/cleared), grid texture | Task 1.1 Step 5 |
| Status badges — Badge unificado tone+variant+dot+pulse | Task 1.0 (nova) |
| Tabs do Suporte — segmented control, contadores protagonistas | Task 3.4 Step 1 |
| Página Show de chamado — timeline editorial vertical, sidebar sticky | Task 3.4 Step 2 |
| **Design tokens + fontes** — Tailwind v4 `@theme`, Fraunces/Geist/Geist Mono | Task 0.0 (nova) |
| **PageHeader** — font-display (Fraunces serif), eyebrow prop | Task 1.1 Step 4 |

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-04-15-painel-admin-completo.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — dispatcho um subagent fresh por task, review entre tasks, iteração rápida.

**2. Inline Execution** — executo as tasks nesta sessão usando executing-plans, com checkpoints.

**Qual abordagem?**
