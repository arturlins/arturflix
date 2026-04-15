# Painel de Admin + Importação de Playlists do YouTube — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar painel de administração restrito a usuários `admin`/`superuser` com funcionalidade de importar playlists do YouTube como cursos reais, substituindo os dados mockados da página pública `/cursos`.

**Architecture:** Middleware `admin` protege rotas sob prefixo `/admin`. Um `AdminLayout` React (com sidebar) é usado por todas as páginas admin. Integração com YouTube Data API v3 via `google/apiclient` oficial. Serviço `YouTubePlaylistService` (fetch + parse) orquestrado por uma `ImportPlaylistAction` que cria `Curso` → `Modulo` → `Aula` em transação. Página `/cursos` passa a ler do banco via controller + Inertia props.

**Tech Stack:** Laravel 12, Inertia.js + React 18 + TypeScript, Tailwind 4, Pest 3, `google/apiclient` ^2.18, SQLite (dev).

---

## Decisões de Design

- **Biblioteca YouTube:** `google/apiclient` oficial. Justificativa: ativamente mantida pelo Google, suporte completo à Data API v3, longevidade superior aos wrappers.
- **Autorização:** Middleware `admin` checa `$user->papel === PapelEnum::ADMIN || PapelEnum::SUPERUSER`. Retorna 403 para usuários não autorizados, 401 (redirect login) para guests.
- **Prefixo de rotas admin:** `/admin` com `name('admin.*')`.
- **Layout admin:** sidebar fixo à esquerda com navegação (Dashboard, Cursos, Usuários — placeholders para os demais CRUDs futuros).
- **Import:** síncrono por enquanto (playlists pequenas). Futuramente mover pra Job com `ShouldQueue` caso necessário.
- **Mapeamento YouTube → DB:**
  - Playlist → `Curso` (titulo, descricao, url_capa = playlist thumbnail, youtube_playlist_id)
  - Um único `Modulo` (ordem=1, titulo = "Playlist") — permite reorganização manual futura
  - Cada vídeo → `Aula` (tipo_aula=video, url_video=URL YouTube, duracao_segundos, youtube_video_id, ordem sequencial)
- **Durações YouTube:** vêm em ISO 8601 (`PT4M13S`). Parser dedicado converte pra segundos.
- **Idempotência:** import verifica `youtube_playlist_id` único; se já existe, retorna erro. Re-sync fica para iteração futura.

---

## File Structure

### Backend (novos/modificados)
- `app/Enums/PapelEnum.php` — já existe; sem mudanças
- `app/Http/Middleware/EnsureUserIsAdmin.php` — **novo** — middleware de autorização admin
- `app/Models/User.php` — **modificado** — helper `isAdmin(): bool`
- `app/Models/Curso.php` — **modificado** — trait HasPublicId, fillable, casts, relationships, scopes
- `app/Models/Modulo.php` — **modificado** — HasPublicId, fillable, relationships
- `app/Models/Aula.php` — **modificado** — HasPublicId, fillable, casts (tipo_aula enum), relationships
- `app/Services/YouTube/PlaylistData.php` — **novo** — DTO com dados parseados da playlist
- `app/Services/YouTube/VideoData.php` — **novo** — DTO de vídeo
- `app/Services/YouTube/IsoDurationParser.php` — **novo** — função pura ISO 8601 → segundos
- `app/Services/YouTube/YouTubePlaylistService.php` — **novo** — wrapper do google/apiclient
- `app/Actions/ImportPlaylistAsCurso.php` — **novo** — orquestra import em transação DB
- `app/Http/Controllers/Admin/AdminDashboardController.php` — **novo**
- `app/Http/Controllers/Admin/AdminCursoController.php` — **novo** — index + importForm + import
- `app/Http/Controllers/CursoController.php` — **novo** — index público lendo do DB
- `app/Http/Requests/Admin/ImportPlaylistRequest.php` — **novo**
- `app/Http/Middleware/HandleInertiaRequests.php` — **modificado** — compartilha `auth.user.is_admin`
- `bootstrap/app.php` — **modificado** — registra alias `admin`
- `config/youtube.php` — **novo** — api_key, config
- `database/migrations/2026_04_15_000001_add_youtube_fields_to_cursos_and_aulas_table.php` — **novo**
- `database/factories/CursoFactory.php` — **novo**
- `database/factories/ModuloFactory.php` — **novo**
- `database/factories/AulaFactory.php` — **novo**
- `database/seeders/CursoSeeder.php` — **novo** — seeds pra dev (sem depender da API)
- `database/seeders/DatabaseSeeder.php` — **modificado** — chama CursoSeeder
- `routes/web.php` — **modificado** — rota `/cursos` via controller + grupo `/admin`

### Frontend (novos/modificados)
- `resources/js/types/index.d.ts` — **modificado** — `User.is_admin`, tipos `Curso`, `Modulo`, `Aula`
- `resources/js/layouts/AdminLayout.tsx` — **novo**
- `resources/js/components/admin/AdminSidebar.tsx` — **novo**
- `resources/js/components/layout/Navbar.tsx` — **modificado** — link "Admin" condicional
- `resources/js/Pages/Admin/Dashboard.tsx` — **novo**
- `resources/js/Pages/Admin/Cursos/Index.tsx` — **novo** — lista cursos + botão importar
- `resources/js/Pages/Admin/Cursos/Import.tsx` — **novo** — formulário de import de playlist
- `resources/js/Pages/Cursos/Index.tsx` — **modificado** — lê props do servidor, remove mock

### Tests
- `tests/Unit/Services/YouTube/IsoDurationParserTest.php` — **novo**
- `tests/Unit/Services/YouTube/PlaylistDataTest.php` — **novo**
- `tests/Feature/Middleware/EnsureUserIsAdminTest.php` — **novo**
- `tests/Feature/Admin/AdminDashboardTest.php` — **novo**
- `tests/Feature/Admin/ImportPlaylistTest.php` — **novo**
- `tests/Feature/CursosIndexTest.php` — **novo**

---

## Task 1: Middleware `admin` + User helper

**Files:**
- Create: `app/Http/Middleware/EnsureUserIsAdmin.php`
- Modify: `app/Models/User.php`
- Modify: `bootstrap/app.php`
- Test: `tests/Feature/Middleware/EnsureUserIsAdminTest.php`

- [ ] **Step 1: Criar o teste que falha**

Arquivo `tests/Feature/Middleware/EnsureUserIsAdminTest.php`:

```php
<?php

use App\Enums\PapelEnum;
use App\Models\User;
use Illuminate\Support\Facades\Route;

beforeEach(function (): void {
    Route::middleware(['web', 'auth', 'admin'])->get('/__test-admin', fn () => 'ok');
});

it('redirects guest to login', function (): void {
    $this->get('/__test-admin')->assertRedirect(route('login'));
});

it('returns 403 for aluno', function (): void {
    $aluno = User::factory()->create(['papel' => PapelEnum::ALUNO]);
    $this->actingAs($aluno)->get('/__test-admin')->assertForbidden();
});

it('allows admin', function (): void {
    $admin = User::factory()->create(['papel' => PapelEnum::ADMIN]);
    $this->actingAs($admin)->get('/__test-admin')->assertOk();
});

it('allows superuser', function (): void {
    $super = User::factory()->create(['papel' => PapelEnum::SUPERUSER]);
    $this->actingAs($super)->get('/__test-admin')->assertOk();
});
```

- [ ] **Step 2: Rodar o teste — deve falhar (middleware não registrado)**

```bash
./vendor/bin/pest tests/Feature/Middleware/EnsureUserIsAdminTest.php --compact
```
Esperado: FAIL (alias `admin` não existe).

- [ ] **Step 3: Criar o middleware**

Arquivo `app/Http/Middleware/EnsureUserIsAdmin.php`:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user === null) {
            return redirect()->route('login');
        }

        if (! $user->isAdmin()) {
            abort(403, 'Acesso restrito a administradores.');
        }

        return $next($request);
    }
}
```

- [ ] **Step 4: Adicionar helper `isAdmin()` em `app/Models/User.php`**

Adicionar após o método `casts()`:

```php
public function isAdmin(): bool
{
    return in_array($this->papel, [PapelEnum::ADMIN, PapelEnum::SUPERUSER], true);
}
```

E garantir o `use App\Enums\PapelEnum;` no topo do arquivo.

- [ ] **Step 5: Registrar alias `admin` em `bootstrap/app.php`**

No bloco `$middleware->alias([...])`, acrescentar:

```php
'admin' => \App\Http\Middleware\EnsureUserIsAdmin::class,
```

Resultado final do bloco alias:

```php
$middleware->alias([
    'verified' => EnsureEmailIsVerified::class,
    'admin' => \App\Http\Middleware\EnsureUserIsAdmin::class,
]);
```

- [ ] **Step 6: Rodar o teste — deve passar**

```bash
./vendor/bin/pest tests/Feature/Middleware/EnsureUserIsAdminTest.php --compact
```
Esperado: 4 passed.

- [ ] **Step 7: Rodar Pint**

```bash
vendor/bin/pint --dirty --format agent
```

- [ ] **Step 8: Commit**

```bash
git add app/Http/Middleware/EnsureUserIsAdmin.php app/Models/User.php bootstrap/app.php tests/Feature/Middleware/EnsureUserIsAdminTest.php
git commit -m "feat(auth): middleware admin e helper User::isAdmin"
```

---

## Task 2: Compartilhar `is_admin` via Inertia + tipar frontend

**Files:**
- Modify: `app/Http/Middleware/HandleInertiaRequests.php`
- Modify: `resources/js/types/index.d.ts`

- [ ] **Step 1: Modificar `HandleInertiaRequests.php`**

Substituir o array retornado em `share()` pelo seguinte (mantendo estrutura existente):

```php
public function share(Request $request): array
{
    return array_merge(parent::share($request), [
        'auth' => [
            'user' => fn () => $request->user()
                ? [
                    'id' => $request->user()->id,
                    'public_id' => $request->user()->public_id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'papel' => $request->user()->papel?->value,
                    'is_admin' => $request->user()->isAdmin(),
                ]
                : null,
        ],
        'flash' => [
            'success' => fn () => $request->session()->get('success'),
            'error' => fn () => $request->session()->get('error'),
        ],
    ]);
}
```

- [ ] **Step 2: Modificar `resources/js/types/index.d.ts`**

Substituir a interface `User` por:

```ts
export interface User {
    id: number
    public_id: string
    name: string
    email: string
    papel: 'aluno' | 'admin' | 'superuser'
    is_admin: boolean
}
```

- [ ] **Step 3: Verificar tipos**

```bash
npx tsc --noEmit
```
Esperado: sem erros.

- [ ] **Step 4: Commit**

```bash
git add app/Http/Middleware/HandleInertiaRequests.php resources/js/types/index.d.ts
git commit -m "feat(inertia): compartilha is_admin nos props auth.user"
```

---

## Task 3: Rotas admin + controller dashboard + AdminLayout + sidebar

**Files:**
- Create: `app/Http/Controllers/Admin/AdminDashboardController.php`
- Create: `resources/js/layouts/AdminLayout.tsx`
- Create: `resources/js/components/admin/AdminSidebar.tsx`
- Create: `resources/js/Pages/Admin/Dashboard.tsx`
- Modify: `routes/web.php`
- Test: `tests/Feature/Admin/AdminDashboardTest.php`

- [ ] **Step 1: Teste de dashboard admin**

Arquivo `tests/Feature/Admin/AdminDashboardTest.php`:

```php
<?php

use App\Enums\PapelEnum;
use App\Models\User;

it('redirects guest', function (): void {
    $this->get('/admin')->assertRedirect(route('login'));
});

it('forbids aluno', function (): void {
    $this->actingAs(User::factory()->create(['papel' => PapelEnum::ALUNO]))
        ->get('/admin')
        ->assertForbidden();
});

it('renders admin dashboard for admin', function (): void {
    $admin = User::factory()->create(['papel' => PapelEnum::ADMIN]);

    $this->actingAs($admin)
        ->get('/admin')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('Admin/Dashboard'));
});
```

- [ ] **Step 2: Rodar — deve falhar (rota inexistente)**

```bash
./vendor/bin/pest tests/Feature/Admin/AdminDashboardTest.php --compact
```
Esperado: FAIL (404).

- [ ] **Step 3: Criar `AdminDashboardController`**

Arquivo `app/Http/Controllers/Admin/AdminDashboardController.php`:

```php
<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Curso;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'total_cursos' => Curso::query()->count(),
                'total_usuarios' => User::query()->count(),
            ],
        ]);
    }
}
```

- [ ] **Step 4: Adicionar grupo de rotas admin em `routes/web.php`**

Acrescentar ao final do arquivo:

```php
use App\Http\Controllers\Admin\AdminDashboardController;

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function (): void {
    Route::get('/', AdminDashboardController::class)->name('dashboard');
});
```

- [ ] **Step 5: Criar `AdminSidebar` component**

Arquivo `resources/js/components/admin/AdminSidebar.tsx`:

```tsx
import { Link } from '@inertiajs/react'

type Item = { href: string; label: string; icon: string }

const ITEMS: Item[] = [
    { href: '/admin', label: 'Dashboard', icon: '▪' },
    { href: '/admin/cursos', label: 'Cursos', icon: '▪' },
    { href: '/admin/usuarios', label: 'Usuários', icon: '▪' },
]

export function AdminSidebar({ current }: { current: string }) {
    return (
        <aside className="w-60 shrink-0 border-r border-[#1e2430] bg-[#0a0c12] min-h-screen sticky top-0">
            <div className="px-6 py-5 border-b border-[#1e2430]">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#8a8a8a]">Admin</p>
                <p className="text-[#f1f1f1] font-semibold">ArturFlix</p>
            </div>
            <nav className="p-3">
                {ITEMS.map((item) => {
                    const active = current === item.href || (item.href !== '/admin' && current.startsWith(item.href))
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                                active
                                    ? 'bg-[#E50914]/10 text-[#E50914]'
                                    : 'text-[#8a8a8a] hover:text-[#f1f1f1] hover:bg-[#12151b]'
                            }`}
                        >
                            <span aria-hidden="true">{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    )
                })}
            </nav>
        </aside>
    )
}
```

- [ ] **Step 6: Criar `AdminLayout`**

Arquivo `resources/js/layouts/AdminLayout.tsx`:

```tsx
import { usePage } from '@inertiajs/react'
import type { PropsWithChildren } from 'react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default function AdminLayout({ children }: PropsWithChildren) {
    const { url } = usePage()

    return (
        <div className="min-h-screen flex bg-[#0d1016]">
            <AdminSidebar current={url} />
            <main className="flex-1 min-w-0">{children}</main>
        </div>
    )
}
```

- [ ] **Step 7: Criar página `Admin/Dashboard`**

Arquivo `resources/js/Pages/Admin/Dashboard.tsx`:

```tsx
import { Head } from '@inertiajs/react'
import AdminLayout from '@/layouts/AdminLayout'

interface Props {
    stats: {
        total_cursos: number
        total_usuarios: number
    }
}

export default function AdminDashboard({ stats }: Props) {
    return (
        <AdminLayout>
            <Head title="Admin — Dashboard" />

            <div className="max-w-5xl mx-auto px-8 py-10">
                <header className="mb-8">
                    <h1 className="text-2xl font-semibold text-[#f1f1f1]">Painel de administração</h1>
                    <p className="text-[#8a8a8a] text-sm mt-1">Visão geral da plataforma.</p>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <article className="bg-[#12151b] border border-[#1e2430] rounded-xl p-6">
                        <p className="text-[#8a8a8a] text-xs mb-1">Cursos</p>
                        <p className="text-[#f1f1f1] text-3xl font-semibold">{stats.total_cursos}</p>
                    </article>
                    <article className="bg-[#12151b] border border-[#1e2430] rounded-xl p-6">
                        <p className="text-[#8a8a8a] text-xs mb-1">Usuários</p>
                        <p className="text-[#f1f1f1] text-3xl font-semibold">{stats.total_usuarios}</p>
                    </article>
                </div>
            </div>
        </AdminLayout>
    )
}
```

- [ ] **Step 8: Rodar o teste — deve passar**

```bash
./vendor/bin/pest tests/Feature/Admin/AdminDashboardTest.php --compact
```
Esperado: 3 passed.

- [ ] **Step 9: Rodar Pint e tsc**

```bash
vendor/bin/pint --dirty --format agent
npx tsc --noEmit
```

- [ ] **Step 10: Commit**

```bash
git add app/Http/Controllers/Admin routes/web.php resources/js/layouts/AdminLayout.tsx resources/js/components/admin resources/js/Pages/Admin tests/Feature/Admin/AdminDashboardTest.php
git commit -m "feat(admin): rota /admin, dashboard e AdminLayout com sidebar"
```

---

## Task 4: Link "Admin" condicional na Navbar pública

**Files:**
- Modify: `resources/js/components/layout/Navbar.tsx`

- [ ] **Step 1: Adicionar link Admin na navbar**

Localizar em `resources/js/components/layout/Navbar.tsx` o bloco que mostra o nome do usuário autenticado. Adicionar um link `/admin` condicional a `user.is_admin` logo antes do botão "Sair". Exemplo do trecho a substituir/acrescentar:

```tsx
{user ? (
    <>
        {user.is_admin && (
            <Link
                href="/admin"
                className="hidden sm:inline text-[#E50914] hover:text-white text-sm font-medium transition-colors"
            >
                Admin
            </Link>
        )}
        <span className="hidden sm:inline text-[#8a8a8a] text-sm">{user.name}</span>
        <button
            type="button"
            onClick={() => router.post('/logout')}
            className="text-[#8a8a8a] hover:text-[#f1f1f1] text-sm transition-colors"
        >
            Sair
        </button>
    </>
) : (
    /* ... botões login/registro existentes ... */
)}
```

Garantir `import { Link, router } from '@inertiajs/react'` no topo.

- [ ] **Step 2: Verificar tipos**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add resources/js/components/layout/Navbar.tsx
git commit -m "feat(navbar): link Admin visível apenas para administradores"
```

---

## Task 5: Model `Curso` com relacionamentos e factory

**Files:**
- Modify: `app/Models/Curso.php`
- Create: `database/factories/CursoFactory.php`

- [ ] **Step 1: Substituir conteúdo de `app/Models/Curso.php`**

```php
<?php

namespace App\Models;

use App\Concerns\HasPublicId;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Curso extends Model
{
    use HasFactory;
    use HasPublicId;

    protected $table = 'cursos';

    protected $fillable = [
        'public_id',
        'titulo',
        'descricao',
        'url_capa',
    ];

    public function modulos(): HasMany
    {
        return $this->hasMany(Modulo::class)->orderBy('ordem');
    }

    public function aulas(): HasManyThrough
    {
        return $this->hasManyThrough(Aula::class, Modulo::class);
    }
}
```

- [ ] **Step 2: Criar factory**

Arquivo `database/factories/CursoFactory.php`:

```php
<?php

namespace Database\Factories;

use App\Models\Curso;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Curso>
 */
class CursoFactory extends Factory
{
    protected $model = Curso::class;

    public function definition(): array
    {
        return [
            'titulo' => fake()->sentence(4),
            'descricao' => fake()->paragraph(),
            'url_capa' => 'https://picsum.photos/seed/'.fake()->word().'/640/360',
        ];
    }
}
```

- [ ] **Step 3: Commit**

```bash
git add app/Models/Curso.php database/factories/CursoFactory.php
git commit -m "feat(models): Curso com relacionamentos e factory"
```

---

## Task 6: Model `Modulo` com relacionamentos e factory

**Files:**
- Modify: `app/Models/Modulo.php`
- Create: `database/factories/ModuloFactory.php`

- [ ] **Step 1: Substituir conteúdo de `app/Models/Modulo.php`**

```php
<?php

namespace App\Models;

use App\Concerns\HasPublicId;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Modulo extends Model
{
    use HasFactory;
    use HasPublicId;

    protected $table = 'modulos';

    protected $fillable = [
        'public_id',
        'curso_id',
        'titulo',
        'ordem',
    ];

    protected function casts(): array
    {
        return [
            'ordem' => 'integer',
        ];
    }

    public function curso(): BelongsTo
    {
        return $this->belongsTo(Curso::class);
    }

    public function aulas(): HasMany
    {
        return $this->hasMany(Aula::class)->orderBy('ordem');
    }
}
```

- [ ] **Step 2: Criar factory**

Arquivo `database/factories/ModuloFactory.php`:

```php
<?php

namespace Database\Factories;

use App\Models\Curso;
use App\Models\Modulo;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Modulo>
 */
class ModuloFactory extends Factory
{
    protected $model = Modulo::class;

    public function definition(): array
    {
        return [
            'curso_id' => Curso::factory(),
            'titulo' => fake()->words(3, true),
            'ordem' => 1,
        ];
    }
}
```

- [ ] **Step 3: Commit**

```bash
git add app/Models/Modulo.php database/factories/ModuloFactory.php
git commit -m "feat(models): Modulo com relacionamentos e factory"
```

---

## Task 7: Model `Aula` com relacionamentos e factory

**Files:**
- Modify: `app/Models/Aula.php`
- Create: `database/factories/AulaFactory.php`

- [ ] **Step 1: Substituir conteúdo de `app/Models/Aula.php`**

```php
<?php

namespace App\Models;

use App\Concerns\HasPublicId;
use App\Enums\TipoAulaEnum;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Aula extends Model
{
    use HasFactory;
    use HasPublicId;

    protected $table = 'aulas';

    protected $fillable = [
        'public_id',
        'modulo_id',
        'titulo',
        'tipo_aula',
        'conteudo',
        'url_video',
        'duracao_segundos',
        'ordem',
    ];

    protected function casts(): array
    {
        return [
            'tipo_aula' => TipoAulaEnum::class,
            'duracao_segundos' => 'integer',
            'ordem' => 'integer',
        ];
    }

    public function modulo(): BelongsTo
    {
        return $this->belongsTo(Modulo::class);
    }
}
```

- [ ] **Step 2: Criar factory**

Arquivo `database/factories/AulaFactory.php`:

```php
<?php

namespace Database\Factories;

use App\Enums\TipoAulaEnum;
use App\Models\Aula;
use App\Models\Modulo;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Aula>
 */
class AulaFactory extends Factory
{
    protected $model = Aula::class;

    public function definition(): array
    {
        return [
            'modulo_id' => Modulo::factory(),
            'titulo' => fake()->sentence(6),
            'tipo_aula' => TipoAulaEnum::VIDEO,
            'url_video' => 'https://www.youtube.com/watch?v='.fake()->regexify('[A-Za-z0-9_-]{11}'),
            'duracao_segundos' => fake()->numberBetween(120, 3600),
            'ordem' => 1,
        ];
    }
}
```

- [ ] **Step 3: Commit**

```bash
git add app/Models/Aula.php database/factories/AulaFactory.php
git commit -m "feat(models): Aula com relacionamentos e factory"
```

---

## Task 8: Migration — campos YouTube em `cursos` e `aulas`

**Files:**
- Create: `database/migrations/2026_04_15_000001_add_youtube_fields_to_cursos_and_aulas_table.php`

- [ ] **Step 1: Gerar migration**

```bash
php artisan make:migration add_youtube_fields_to_cursos_and_aulas_table --no-interaction
```

Renomeie (ou use) o arquivo gerado. Substitua seu conteúdo:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('cursos', function (Blueprint $table): void {
            $table->string('youtube_playlist_id', 64)->nullable()->unique()->after('url_capa');
            $table->string('youtube_channel_title', 255)->nullable()->after('youtube_playlist_id');
            $table->timestamp('synced_at')->nullable()->after('youtube_channel_title');
        });

        Schema::table('aulas', function (Blueprint $table): void {
            $table->string('youtube_video_id', 32)->nullable()->after('url_video');
            $table->index('youtube_video_id');
        });
    }

    public function down(): void
    {
        Schema::table('aulas', function (Blueprint $table): void {
            $table->dropIndex(['youtube_video_id']);
            $table->dropColumn('youtube_video_id');
        });

        Schema::table('cursos', function (Blueprint $table): void {
            $table->dropColumn(['youtube_playlist_id', 'youtube_channel_title', 'synced_at']);
        });
    }
};
```

- [ ] **Step 2: Rodar migrate**

```bash
php artisan migrate --no-interaction
```
Esperado: migração aplicada.

- [ ] **Step 3: Adicionar campos aos `fillable`**

Em `app/Models/Curso.php`, acrescentar ao `$fillable`:
```
'youtube_playlist_id',
'youtube_channel_title',
'synced_at',
```

E ao método `casts()` (criar se não existir):

```php
protected function casts(): array
{
    return [
        'synced_at' => 'datetime',
    ];
}
```

Em `app/Models/Aula.php`, acrescentar ao `$fillable`:
```
'youtube_video_id',
```

- [ ] **Step 4: Rodar Pint**

```bash
vendor/bin/pint --dirty --format agent
```

- [ ] **Step 5: Commit**

```bash
git add database/migrations app/Models/Curso.php app/Models/Aula.php
git commit -m "feat(db): campos youtube_* em cursos e aulas"
```

---

## Task 9: Parser de duração ISO 8601

**Files:**
- Create: `app/Services/YouTube/IsoDurationParser.php`
- Test: `tests/Unit/Services/YouTube/IsoDurationParserTest.php`

- [ ] **Step 1: Escrever teste**

Arquivo `tests/Unit/Services/YouTube/IsoDurationParserTest.php`:

```php
<?php

use App\Services\YouTube\IsoDurationParser;

it('parses minutes and seconds', function (): void {
    expect(IsoDurationParser::toSeconds('PT4M13S'))->toBe(253);
});

it('parses hours minutes seconds', function (): void {
    expect(IsoDurationParser::toSeconds('PT1H2M3S'))->toBe(3723);
});

it('parses only seconds', function (): void {
    expect(IsoDurationParser::toSeconds('PT45S'))->toBe(45);
});

it('parses only minutes', function (): void {
    expect(IsoDurationParser::toSeconds('PT15M'))->toBe(900);
});

it('parses only hours', function (): void {
    expect(IsoDurationParser::toSeconds('PT2H'))->toBe(7200);
});

it('returns zero for invalid input', function (): void {
    expect(IsoDurationParser::toSeconds('P1D'))->toBe(0);
    expect(IsoDurationParser::toSeconds(''))->toBe(0);
    expect(IsoDurationParser::toSeconds('lixo'))->toBe(0);
});
```

- [ ] **Step 2: Rodar — deve falhar**

```bash
./vendor/bin/pest tests/Unit/Services/YouTube/IsoDurationParserTest.php --compact
```
Esperado: FAIL (classe inexistente).

- [ ] **Step 3: Criar parser**

Arquivo `app/Services/YouTube/IsoDurationParser.php`:

```php
<?php

namespace App\Services\YouTube;

class IsoDurationParser
{
    public static function toSeconds(string $iso): int
    {
        if (! preg_match('/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/', $iso, $m)) {
            return 0;
        }

        $hours = (int) ($m[1] ?? 0);
        $minutes = (int) ($m[2] ?? 0);
        $seconds = (int) ($m[3] ?? 0);

        return $hours * 3600 + $minutes * 60 + $seconds;
    }
}
```

- [ ] **Step 4: Rodar — deve passar**

```bash
./vendor/bin/pest tests/Unit/Services/YouTube/IsoDurationParserTest.php --compact
```
Esperado: 6 passed.

- [ ] **Step 5: Commit**

```bash
git add app/Services/YouTube/IsoDurationParser.php tests/Unit/Services/YouTube/IsoDurationParserTest.php
git commit -m "feat(youtube): parser ISO 8601 para segundos"
```

---

## Task 10: DTOs `VideoData` e `PlaylistData`

**Files:**
- Create: `app/Services/YouTube/VideoData.php`
- Create: `app/Services/YouTube/PlaylistData.php`
- Test: `tests/Unit/Services/YouTube/PlaylistDataTest.php`

- [ ] **Step 1: Escrever teste**

Arquivo `tests/Unit/Services/YouTube/PlaylistDataTest.php`:

```php
<?php

use App\Services\YouTube\PlaylistData;
use App\Services\YouTube\VideoData;

it('calculates total duration from videos', function (): void {
    $playlist = new PlaylistData(
        playlistId: 'PL1',
        title: 'Test',
        description: 'desc',
        thumbnailUrl: 'https://img',
        channelTitle: 'Canal',
        videos: [
            new VideoData('v1', 'Aula 1', 120),
            new VideoData('v2', 'Aula 2', 300),
            new VideoData('v3', 'Aula 3', 60),
        ],
    );

    expect($playlist->totalDurationSeconds())->toBe(480);
    expect($playlist->videoCount())->toBe(3);
});

it('handles empty playlist', function (): void {
    $playlist = new PlaylistData('PL2', 'x', null, null, 'Canal', []);

    expect($playlist->totalDurationSeconds())->toBe(0);
    expect($playlist->videoCount())->toBe(0);
});
```

- [ ] **Step 2: Criar `VideoData`**

Arquivo `app/Services/YouTube/VideoData.php`:

```php
<?php

namespace App\Services\YouTube;

final readonly class VideoData
{
    public function __construct(
        public string $videoId,
        public string $title,
        public int $durationSeconds,
    ) {}

    public function youtubeUrl(): string
    {
        return "https://www.youtube.com/watch?v={$this->videoId}";
    }
}
```

- [ ] **Step 3: Criar `PlaylistData`**

Arquivo `app/Services/YouTube/PlaylistData.php`:

```php
<?php

namespace App\Services\YouTube;

final readonly class PlaylistData
{
    /**
     * @param  array<int, VideoData>  $videos
     */
    public function __construct(
        public string $playlistId,
        public string $title,
        public ?string $description,
        public ?string $thumbnailUrl,
        public string $channelTitle,
        public array $videos,
    ) {}

    public function totalDurationSeconds(): int
    {
        return array_sum(array_map(fn (VideoData $v) => $v->durationSeconds, $this->videos));
    }

    public function videoCount(): int
    {
        return count($this->videos);
    }
}
```

- [ ] **Step 4: Rodar teste**

```bash
./vendor/bin/pest tests/Unit/Services/YouTube/PlaylistDataTest.php --compact
```
Esperado: 2 passed.

- [ ] **Step 5: Commit**

```bash
git add app/Services/YouTube/VideoData.php app/Services/YouTube/PlaylistData.php tests/Unit/Services/YouTube/PlaylistDataTest.php
git commit -m "feat(youtube): DTOs VideoData e PlaylistData"
```

---

## Task 11: Instalar `google/apiclient` + config

**Files:**
- Modify: `composer.json`
- Create: `config/youtube.php`
- Modify: `.env.example`

- [ ] **Step 1: Instalar pacote**

```bash
composer require google/apiclient:^2.18 --no-interaction
```
Esperado: instalação bem-sucedida.

- [ ] **Step 2: Criar `config/youtube.php`**

```php
<?php

return [
    'api_key' => env('YOUTUBE_API_KEY'),
    'application_name' => env('YOUTUBE_APP_NAME', 'ArturFlix'),
    'playlist_items_per_page' => 50,
];
```

- [ ] **Step 3: Adicionar entradas em `.env.example`**

Acrescentar no final:

```
YOUTUBE_API_KEY=
YOUTUBE_APP_NAME=ArturFlix
```

- [ ] **Step 4: Commit**

```bash
git add composer.json composer.lock config/youtube.php .env.example
git commit -m "chore(deps): adiciona google/apiclient + config youtube"
```

---

## Task 12: `YouTubePlaylistService` — busca na API real

**Files:**
- Create: `app/Services/YouTube/YouTubePlaylistService.php`
- Create: `app/Services/YouTube/YouTubeApiException.php`

> Este service depende de API externa. Não escrevemos teste unitário com HTTP real. O teste de integração do fluxo completo (Task 14) usará um binding fake do container.

- [ ] **Step 1: Criar exceção**

Arquivo `app/Services/YouTube/YouTubeApiException.php`:

```php
<?php

namespace App\Services\YouTube;

use RuntimeException;

class YouTubeApiException extends RuntimeException {}
```

- [ ] **Step 2: Criar service**

Arquivo `app/Services/YouTube/YouTubePlaylistService.php`:

```php
<?php

namespace App\Services\YouTube;

use Google\Client as GoogleClient;
use Google\Service\Exception as GoogleServiceException;
use Google\Service\YouTube as YouTubeService;

class YouTubePlaylistService
{
    public function __construct(private readonly YouTubeService $youtube) {}

    public static function make(): self
    {
        $apiKey = config('youtube.api_key');

        if (empty($apiKey)) {
            throw new YouTubeApiException('YOUTUBE_API_KEY não configurada.');
        }

        $client = new GoogleClient;
        $client->setApplicationName((string) config('youtube.application_name'));
        $client->setDeveloperKey($apiKey);

        return new self(new YouTubeService($client));
    }

    public function fetch(string $playlistId): PlaylistData
    {
        try {
            $playlistInfo = $this->fetchPlaylistMeta($playlistId);
            $videos = $this->fetchAllPlaylistVideos($playlistId);
        } catch (GoogleServiceException $e) {
            throw new YouTubeApiException(
                'Erro ao consultar a YouTube API: '.$e->getMessage(),
                previous: $e,
            );
        }

        return new PlaylistData(
            playlistId: $playlistId,
            title: $playlistInfo['title'],
            description: $playlistInfo['description'],
            thumbnailUrl: $playlistInfo['thumbnail'],
            channelTitle: $playlistInfo['channelTitle'],
            videos: $videos,
        );
    }

    /**
     * @return array{title: string, description: ?string, thumbnail: ?string, channelTitle: string}
     */
    private function fetchPlaylistMeta(string $playlistId): array
    {
        $response = $this->youtube->playlists->listPlaylists('snippet', [
            'id' => $playlistId,
            'maxResults' => 1,
        ]);

        $items = $response->getItems();

        if (empty($items)) {
            throw new YouTubeApiException("Playlist {$playlistId} não encontrada.");
        }

        $snippet = $items[0]->getSnippet();
        $thumbnails = $snippet->getThumbnails();

        return [
            'title' => $snippet->getTitle(),
            'description' => $snippet->getDescription() ?: null,
            'thumbnail' => $thumbnails?->getHigh()?->getUrl()
                ?? $thumbnails?->getDefault()?->getUrl(),
            'channelTitle' => $snippet->getChannelTitle(),
        ];
    }

    /**
     * @return array<int, VideoData>
     */
    private function fetchAllPlaylistVideos(string $playlistId): array
    {
        $perPage = (int) config('youtube.playlist_items_per_page', 50);
        $videoIds = [];
        $titlesById = [];
        $pageToken = null;

        do {
            $response = $this->youtube->playlistItems->listPlaylistItems('snippet', [
                'playlistId' => $playlistId,
                'maxResults' => $perPage,
                'pageToken' => $pageToken,
            ]);

            foreach ($response->getItems() as $item) {
                $snippet = $item->getSnippet();
                $videoId = $snippet->getResourceId()->getVideoId();
                $videoIds[] = $videoId;
                $titlesById[$videoId] = $snippet->getTitle();
            }

            $pageToken = $response->getNextPageToken();
        } while ($pageToken);

        if (empty($videoIds)) {
            return [];
        }

        $durationsById = $this->fetchDurations($videoIds);

        $out = [];
        foreach ($videoIds as $id) {
            $out[] = new VideoData(
                videoId: $id,
                title: $titlesById[$id] ?? '(sem título)',
                durationSeconds: $durationsById[$id] ?? 0,
            );
        }

        return $out;
    }

    /**
     * @param  array<int, string>  $videoIds
     * @return array<string, int>
     */
    private function fetchDurations(array $videoIds): array
    {
        $durations = [];

        foreach (array_chunk($videoIds, 50) as $chunk) {
            $response = $this->youtube->videos->listVideos('contentDetails', [
                'id' => implode(',', $chunk),
                'maxResults' => 50,
            ]);

            foreach ($response->getItems() as $item) {
                $durations[$item->getId()] = IsoDurationParser::toSeconds(
                    $item->getContentDetails()->getDuration(),
                );
            }
        }

        return $durations;
    }
}
```

- [ ] **Step 3: Registrar binding no `AppServiceProvider`**

Em `app/Providers/AppServiceProvider.php`, no método `register()`:

```php
use App\Services\YouTube\YouTubePlaylistService;

public function register(): void
{
    $this->app->bind(YouTubePlaylistService::class, fn () => YouTubePlaylistService::make());
}
```

- [ ] **Step 4: Pint**

```bash
vendor/bin/pint --dirty --format agent
```

- [ ] **Step 5: Commit**

```bash
git add app/Services/YouTube/YouTubePlaylistService.php app/Services/YouTube/YouTubeApiException.php app/Providers/AppServiceProvider.php
git commit -m "feat(youtube): YouTubePlaylistService usando google/apiclient"
```

---

## Task 13: Action `ImportPlaylistAsCurso`

**Files:**
- Create: `app/Actions/ImportPlaylistAsCurso.php`

- [ ] **Step 1: Criar action**

Arquivo `app/Actions/ImportPlaylistAsCurso.php`:

```php
<?php

namespace App\Actions;

use App\Enums\TipoAulaEnum;
use App\Models\Aula;
use App\Models\Curso;
use App\Models\Modulo;
use App\Services\YouTube\PlaylistData;
use App\Services\YouTube\YouTubeApiException;
use App\Services\YouTube\YouTubePlaylistService;
use Illuminate\Support\Facades\DB;

class ImportPlaylistAsCurso
{
    public function __construct(private readonly YouTubePlaylistService $youtube) {}

    public function handle(string $playlistId): Curso
    {
        if (Curso::query()->where('youtube_playlist_id', $playlistId)->exists()) {
            throw new YouTubeApiException('Esta playlist já foi importada.');
        }

        $data = $this->youtube->fetch($playlistId);

        return DB::transaction(fn () => $this->persist($data));
    }

    private function persist(PlaylistData $data): Curso
    {
        $curso = Curso::query()->create([
            'titulo' => $data->title,
            'descricao' => $data->description,
            'url_capa' => $data->thumbnailUrl,
            'youtube_playlist_id' => $data->playlistId,
            'youtube_channel_title' => $data->channelTitle,
            'synced_at' => now(),
        ]);

        $modulo = Modulo::query()->create([
            'curso_id' => $curso->id,
            'titulo' => 'Playlist',
            'ordem' => 1,
        ]);

        foreach ($data->videos as $index => $video) {
            Aula::query()->create([
                'modulo_id' => $modulo->id,
                'titulo' => $video->title,
                'tipo_aula' => TipoAulaEnum::VIDEO,
                'url_video' => $video->youtubeUrl(),
                'youtube_video_id' => $video->videoId,
                'duracao_segundos' => $video->durationSeconds,
                'ordem' => $index + 1,
            ]);
        }

        return $curso->fresh(['modulos.aulas']);
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/Actions/ImportPlaylistAsCurso.php
git commit -m "feat(admin): action ImportPlaylistAsCurso (curso + modulo + aulas em transação)"
```

---

## Task 14: FormRequest + AdminCursoController + rotas de import

**Files:**
- Create: `app/Http/Requests/Admin/ImportPlaylistRequest.php`
- Create: `app/Http/Controllers/Admin/AdminCursoController.php`
- Modify: `routes/web.php`
- Test: `tests/Feature/Admin/ImportPlaylistTest.php`

- [ ] **Step 1: Criar FormRequest**

Arquivo `app/Http/Requests/Admin/ImportPlaylistRequest.php`:

```php
<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ImportPlaylistRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'playlist_input' => ['required', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'playlist_input.required' => 'Informe a URL ou ID da playlist.',
        ];
    }

    public function extractedPlaylistId(): ?string
    {
        $input = trim((string) $this->validated('playlist_input'));

        if (preg_match('/[?&]list=([A-Za-z0-9_-]+)/', $input, $m)) {
            return $m[1];
        }

        if (preg_match('/^[A-Za-z0-9_-]{13,}$/', $input)) {
            return $input;
        }

        return null;
    }
}
```

- [ ] **Step 2: Criar controller**

Arquivo `app/Http/Controllers/Admin/AdminCursoController.php`:

```php
<?php

namespace App\Http\Controllers\Admin;

use App\Actions\ImportPlaylistAsCurso;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ImportPlaylistRequest;
use App\Models\Curso;
use App\Services\YouTube\YouTubeApiException;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AdminCursoController extends Controller
{
    public function index(): Response
    {
        $cursos = Curso::query()
            ->withCount('modulos')
            ->latest('id')
            ->get(['id', 'public_id', 'titulo', 'url_capa', 'youtube_playlist_id', 'youtube_channel_title', 'synced_at', 'created_at'])
            ->map(fn (Curso $c) => [
                'public_id' => $c->public_id,
                'titulo' => $c->titulo,
                'url_capa' => $c->url_capa,
                'youtube_playlist_id' => $c->youtube_playlist_id,
                'channel' => $c->youtube_channel_title,
                'synced_at' => $c->synced_at?->toIso8601String(),
                'modulos_count' => $c->modulos_count,
            ]);

        return Inertia::render('Admin/Cursos/Index', ['cursos' => $cursos]);
    }

    public function importForm(): Response
    {
        return Inertia::render('Admin/Cursos/Import');
    }

    public function import(ImportPlaylistRequest $request, ImportPlaylistAsCurso $action): RedirectResponse
    {
        $playlistId = $request->extractedPlaylistId();

        if ($playlistId === null) {
            return back()
                ->withErrors(['playlist_input' => 'URL ou ID de playlist inválido.'])
                ->withInput();
        }

        try {
            $curso = $action->handle($playlistId);
        } catch (YouTubeApiException $e) {
            return back()->withErrors(['playlist_input' => $e->getMessage()])->withInput();
        }

        return redirect()
            ->route('admin.cursos.index')
            ->with('success', "Curso \"{$curso->titulo}\" importado com sucesso.");
    }
}
```

- [ ] **Step 3: Registrar rotas admin em `routes/web.php`**

Dentro do grupo `Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(...)`, acrescentar:

```php
use App\Http\Controllers\Admin\AdminCursoController;

Route::get('/cursos', [AdminCursoController::class, 'index'])->name('cursos.index');
Route::get('/cursos/importar', [AdminCursoController::class, 'importForm'])->name('cursos.import.form');
Route::post('/cursos/importar', [AdminCursoController::class, 'import'])->name('cursos.import');
```

- [ ] **Step 4: Escrever teste de integração com fake service**

Arquivo `tests/Feature/Admin/ImportPlaylistTest.php`:

```php
<?php

use App\Enums\PapelEnum;
use App\Models\Aula;
use App\Models\Curso;
use App\Models\Modulo;
use App\Models\User;
use App\Services\YouTube\PlaylistData;
use App\Services\YouTube\VideoData;
use App\Services\YouTube\YouTubeApiException;
use App\Services\YouTube\YouTubePlaylistService;

function fakePlaylistService(PlaylistData $data): void
{
    $fake = new class($data) extends YouTubePlaylistService
    {
        public function __construct(private PlaylistData $data) {}

        public function fetch(string $playlistId): PlaylistData
        {
            return $this->data;
        }
    };

    app()->instance(YouTubePlaylistService::class, $fake);
}

beforeEach(function (): void {
    $this->admin = User::factory()->create(['papel' => PapelEnum::ADMIN]);
});

it('imports playlist creating curso, modulo and aulas', function (): void {
    fakePlaylistService(new PlaylistData(
        playlistId: 'PLabc123',
        title: 'Laravel do Zero',
        description: 'Curso completo',
        thumbnailUrl: 'https://img/thumb.jpg',
        channelTitle: 'Canal Dev',
        videos: [
            new VideoData('vid1', 'Aula 1', 300),
            new VideoData('vid2', 'Aula 2', 600),
        ],
    ));

    $response = $this->actingAs($this->admin)->post('/admin/cursos/importar', [
        'playlist_input' => 'https://youtube.com/playlist?list=PLabc123',
    ]);

    $response->assertRedirect(route('admin.cursos.index'));
    $response->assertSessionHas('success');

    expect(Curso::count())->toBe(1);
    expect(Modulo::count())->toBe(1);
    expect(Aula::count())->toBe(2);

    $curso = Curso::first();
    expect($curso->titulo)->toBe('Laravel do Zero');
    expect($curso->youtube_playlist_id)->toBe('PLabc123');
    expect($curso->youtube_channel_title)->toBe('Canal Dev');

    $aulas = Aula::orderBy('ordem')->get();
    expect($aulas[0]->youtube_video_id)->toBe('vid1');
    expect($aulas[0]->duracao_segundos)->toBe(300);
    expect($aulas[0]->ordem)->toBe(1);
    expect($aulas[1]->ordem)->toBe(2);
});

it('accepts raw playlist id', function (): void {
    fakePlaylistService(new PlaylistData('PLabc123', 'x', null, null, 'Canal', []));

    $this->actingAs($this->admin)
        ->post('/admin/cursos/importar', ['playlist_input' => 'PLabc123'])
        ->assertRedirect(route('admin.cursos.index'));

    expect(Curso::where('youtube_playlist_id', 'PLabc123')->exists())->toBeTrue();
});

it('rejects invalid playlist input', function (): void {
    $this->actingAs($this->admin)
        ->post('/admin/cursos/importar', ['playlist_input' => 'nao-eh-playlist'])
        ->assertSessionHasErrors('playlist_input');

    expect(Curso::count())->toBe(0);
});

it('prevents duplicate import', function (): void {
    Curso::factory()->create(['youtube_playlist_id' => 'PLdup']);

    fakePlaylistService(new PlaylistData('PLdup', 'x', null, null, 'Canal', []));

    $this->actingAs($this->admin)
        ->post('/admin/cursos/importar', ['playlist_input' => 'PLdup'])
        ->assertSessionHasErrors('playlist_input');

    expect(Curso::count())->toBe(1);
});

it('forbids import for aluno', function (): void {
    $aluno = User::factory()->create(['papel' => PapelEnum::ALUNO]);

    $this->actingAs($aluno)
        ->post('/admin/cursos/importar', ['playlist_input' => 'PLx'])
        ->assertForbidden();
});

it('wraps api errors as validation errors', function (): void {
    $fake = new class extends YouTubePlaylistService
    {
        public function __construct() {}

        public function fetch(string $playlistId): PlaylistData
        {
            throw new YouTubeApiException('Playlist não encontrada.');
        }
    };
    app()->instance(YouTubePlaylistService::class, $fake);

    $this->actingAs($this->admin)
        ->post('/admin/cursos/importar', ['playlist_input' => 'PLfail'])
        ->assertSessionHasErrors('playlist_input');

    expect(Curso::count())->toBe(0);
});
```

- [ ] **Step 5: Rodar testes**

```bash
./vendor/bin/pest tests/Feature/Admin/ImportPlaylistTest.php --compact
```
Esperado: 6 passed.

- [ ] **Step 6: Pint**

```bash
vendor/bin/pint --dirty --format agent
```

- [ ] **Step 7: Commit**

```bash
git add app/Http/Requests/Admin app/Http/Controllers/Admin/AdminCursoController.php routes/web.php tests/Feature/Admin/ImportPlaylistTest.php
git commit -m "feat(admin): endpoint de importação de playlist do YouTube"
```

---

## Task 15: Frontend — página `Admin/Cursos/Index`

**Files:**
- Create: `resources/js/Pages/Admin/Cursos/Index.tsx`

- [ ] **Step 1: Criar página**

Arquivo `resources/js/Pages/Admin/Cursos/Index.tsx`:

```tsx
import { Head, Link, usePage } from '@inertiajs/react'
import AdminLayout from '@/layouts/AdminLayout'
import type { PageProps } from '@/types'

interface AdminCursoRow {
    public_id: string
    titulo: string
    url_capa: string | null
    youtube_playlist_id: string | null
    channel: string | null
    synced_at: string | null
    modulos_count: number
}

interface Props extends PageProps {
    cursos: AdminCursoRow[]
}

export default function AdminCursosIndex() {
    const { cursos, flash } = usePage<Props>().props

    return (
        <AdminLayout>
            <Head title="Admin — Cursos" />

            <div className="max-w-6xl mx-auto px-8 py-10">
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-[#f1f1f1]">Cursos</h1>
                        <p className="text-[#8a8a8a] text-sm mt-1">Gerencie cursos da plataforma.</p>
                    </div>
                    <Link
                        href="/admin/cursos/importar"
                        className="px-4 py-2 rounded-lg bg-[#E50914] hover:bg-[#c20710] text-white text-sm font-medium transition-colors"
                    >
                        Importar do YouTube
                    </Link>
                </header>

                {flash.success && (
                    <div className="mb-6 px-4 py-3 rounded-lg bg-green-950/40 border border-green-900 text-green-300 text-sm">
                        {flash.success}
                    </div>
                )}

                {cursos.length === 0 ? (
                    <div className="bg-[#12151b] border border-[#1e2430] rounded-xl p-10 text-center">
                        <p className="text-[#8a8a8a] text-sm">Nenhum curso cadastrado.</p>
                    </div>
                ) : (
                    <div className="bg-[#12151b] border border-[#1e2430] rounded-xl overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-[#0a0c12] text-[#8a8a8a] text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="text-left px-4 py-3">Curso</th>
                                    <th className="text-left px-4 py-3">Canal</th>
                                    <th className="text-left px-4 py-3">Playlist</th>
                                    <th className="text-right px-4 py-3">Módulos</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cursos.map((c) => (
                                    <tr key={c.public_id} className="border-t border-[#1e2430]">
                                        <td className="px-4 py-3 text-[#f1f1f1]">{c.titulo}</td>
                                        <td className="px-4 py-3 text-[#8a8a8a]">{c.channel ?? '—'}</td>
                                        <td className="px-4 py-3 text-[#8a8a8a] font-mono text-xs">
                                            {c.youtube_playlist_id ?? '—'}
                                        </td>
                                        <td className="px-4 py-3 text-right text-[#8a8a8a]">{c.modulos_count}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AdminLayout>
    )
}
```

- [ ] **Step 2: Verificar tipos**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add resources/js/Pages/Admin/Cursos/Index.tsx
git commit -m "feat(admin-ui): lista de cursos no painel admin"
```

---

## Task 16: Frontend — página `Admin/Cursos/Import`

**Files:**
- Create: `resources/js/Pages/Admin/Cursos/Import.tsx`

- [ ] **Step 1: Criar página**

Arquivo `resources/js/Pages/Admin/Cursos/Import.tsx`:

```tsx
import { Head, useForm } from '@inertiajs/react'
import AdminLayout from '@/layouts/AdminLayout'
import type { FormEvent } from 'react'

export default function AdminCursosImport() {
    const { data, setData, post, processing, errors } = useForm({
        playlist_input: '',
    })

    function submit(e: FormEvent) {
        e.preventDefault()
        post('/admin/cursos/importar')
    }

    return (
        <AdminLayout>
            <Head title="Admin — Importar playlist" />

            <div className="max-w-2xl mx-auto px-8 py-10">
                <header className="mb-8">
                    <h1 className="text-2xl font-semibold text-[#f1f1f1]">Importar playlist do YouTube</h1>
                    <p className="text-[#8a8a8a] text-sm mt-1">
                        Cole a URL ou o ID da playlist. Um curso será criado com todos os vídeos como aulas.
                    </p>
                </header>

                <form onSubmit={submit} className="bg-[#12151b] border border-[#1e2430] rounded-xl p-6 space-y-5">
                    <div>
                        <label htmlFor="playlist_input" className="block text-xs uppercase tracking-wider text-[#8a8a8a] mb-2">
                            URL ou ID da playlist
                        </label>
                        <input
                            id="playlist_input"
                            type="text"
                            value={data.playlist_input}
                            onChange={(e) => setData('playlist_input', e.target.value)}
                            placeholder="https://www.youtube.com/playlist?list=PL..."
                            className={`w-full px-3 py-2 rounded-lg bg-[#0d1016] border text-sm text-[#f1f1f1] placeholder-[#5a5a5a] focus:outline-none transition-colors ${
                                errors.playlist_input ? 'border-red-500' : 'border-[#1e2430] focus:border-[#E50914]'
                            }`}
                            autoFocus
                        />
                        {errors.playlist_input && (
                            <p className="text-red-400 text-xs mt-2">{errors.playlist_input}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-5 py-2 rounded-lg bg-[#E50914] hover:bg-[#c20710] text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing ? 'Importando...' : 'Importar'}
                        </button>
                    </div>
                </form>

                <p className="text-[#5a5a5a] text-xs mt-6">
                    A importação pode levar alguns segundos para playlists maiores. A contagem e a duração total dos vídeos são
                    extraídas automaticamente via YouTube Data API.
                </p>
            </div>
        </AdminLayout>
    )
}
```

- [ ] **Step 2: Verificar tipos e commit**

```bash
npx tsc --noEmit
git add resources/js/Pages/Admin/Cursos/Import.tsx
git commit -m "feat(admin-ui): formulário de importação de playlist"
```

---

## Task 17: Página pública `/cursos` lendo do banco

**Files:**
- Create: `app/Http/Controllers/CursoController.php`
- Modify: `routes/web.php`
- Modify: `resources/js/Pages/Cursos/Index.tsx`
- Modify: `resources/js/types/index.d.ts`
- Test: `tests/Feature/CursosIndexTest.php`

- [ ] **Step 1: Escrever teste**

Arquivo `tests/Feature/CursosIndexTest.php`:

```php
<?php

use App\Models\Aula;
use App\Models\Curso;
use App\Models\Modulo;

it('renders cursos index with DB data', function (): void {
    $curso = Curso::factory()->create(['titulo' => 'Curso Real']);
    $modulo = Modulo::factory()->for($curso)->create();
    Aula::factory()->for($modulo)->count(3)->create(['duracao_segundos' => 600]);

    $this->get('/cursos')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Cursos/Index')
            ->has('cursos', 1)
            ->where('cursos.0.titulo', 'Curso Real')
            ->where('cursos.0.total_aulas', 3)
            ->where('cursos.0.duracao_total_segundos', 1800)
        );
});

it('renders empty state when no cursos', function (): void {
    $this->get('/cursos')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('Cursos/Index')->has('cursos', 0));
});
```

- [ ] **Step 2: Rodar — deve falhar**

```bash
./vendor/bin/pest tests/Feature/CursosIndexTest.php --compact
```
Esperado: FAIL (rota ainda retorna sem props).

- [ ] **Step 3: Criar `CursoController`**

Arquivo `app/Http/Controllers/CursoController.php`:

```php
<?php

namespace App\Http\Controllers;

use App\Models\Curso;
use Inertia\Inertia;
use Inertia\Response;

class CursoController extends Controller
{
    public function index(): Response
    {
        $cursos = Curso::query()
            ->with(['modulos.aulas:id,modulo_id,duracao_segundos'])
            ->latest('id')
            ->get()
            ->map(function (Curso $curso): array {
                $aulas = $curso->modulos->flatMap->aulas;

                return [
                    'public_id' => $curso->public_id,
                    'titulo' => $curso->titulo,
                    'descricao' => $curso->descricao,
                    'url_capa' => $curso->url_capa,
                    'channel' => $curso->youtube_channel_title,
                    'total_aulas' => $aulas->count(),
                    'duracao_total_segundos' => (int) $aulas->sum('duracao_segundos'),
                ];
            });

        return Inertia::render('Cursos/Index', ['cursos' => $cursos]);
    }
}
```

- [ ] **Step 4: Atualizar rota em `routes/web.php`**

Substituir `Route::get('/cursos', fn () => Inertia::render('Cursos/Index'))->name('cursos.index');` por:

```php
use App\Http\Controllers\CursoController;

Route::get('/cursos', [CursoController::class, 'index'])->name('cursos.index');
```

- [ ] **Step 5: Atualizar tipos frontend**

Em `resources/js/types/index.d.ts`, adicionar no final:

```ts
export interface CursoListItem {
    public_id: string
    titulo: string
    descricao: string | null
    url_capa: string | null
    channel: string | null
    total_aulas: number
    duracao_total_segundos: number
}
```

- [ ] **Step 6: Substituir `resources/js/Pages/Cursos/Index.tsx`**

Conteúdo completo novo:

```tsx
import { Head, usePage } from '@inertiajs/react'
import GuestLayout from '@/layouts/GuestLayout'
import type { CursoListItem, PageProps } from '@/types'

interface Props extends PageProps {
    cursos: CursoListItem[]
}

function formatDuration(totalSeconds: number): string {
    if (totalSeconds < 60) return `${totalSeconds}s`
    const h = Math.floor(totalSeconds / 3600)
    const m = Math.floor((totalSeconds % 3600) / 60)
    if (h === 0) return `${m}min`
    if (m === 0) return `${h}h`
    return `${h}h ${m}min`
}

export default function CursosIndex() {
    const { cursos } = usePage<Props>().props

    return (
        <GuestLayout>
            <Head title="Cursos" />

            <div className="max-w-6xl mx-auto px-6 py-12">
                <header className="mb-10">
                    <h1 className="text-4xl font-bold text-[#f1f1f1] mb-2">Cursos</h1>
                    <p className="text-[#8a8a8a]">Explore nossa biblioteca e comece a aprender no seu ritmo.</p>
                </header>

                {cursos.length === 0 ? (
                    <div className="bg-[#12151b] border border-[#1e2430] rounded-xl p-12 text-center">
                        <p className="text-[#f1f1f1] font-medium mb-1">Nenhum curso disponível ainda.</p>
                        <p className="text-[#8a8a8a] text-sm">Volte em breve.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {cursos.map((curso) => (
                            <article
                                key={curso.public_id}
                                className="bg-[#12151b] border border-[#1e2430] rounded-xl overflow-hidden hover:border-[#E50914]/40 transition-colors group"
                            >
                                <div className="h-40 bg-[#0a0c12] overflow-hidden">
                                    {curso.url_capa ? (
                                        <img
                                            src={curso.url_capa}
                                            alt=""
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[#5a5a5a] text-xs">
                                            sem capa
                                        </div>
                                    )}
                                </div>

                                <div className="p-5">
                                    {curso.channel && (
                                        <p className="text-[10px] uppercase tracking-[0.14em] text-[#8a8a8a] mb-2">
                                            {curso.channel}
                                        </p>
                                    )}

                                    <h2 className="text-[#f1f1f1] font-semibold text-sm leading-snug mb-4 group-hover:text-white line-clamp-2">
                                        {curso.titulo}
                                    </h2>

                                    <div className="flex items-center justify-between text-xs text-[#8a8a8a] mb-4">
                                        <span>{formatDuration(curso.duracao_total_segundos)}</span>
                                        <span>{curso.total_aulas} aulas</span>
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
                )}
            </div>
        </GuestLayout>
    )
}
```

- [ ] **Step 7: Rodar teste — deve passar**

```bash
./vendor/bin/pest tests/Feature/CursosIndexTest.php --compact
```
Esperado: 2 passed.

- [ ] **Step 8: Verificar tsc + Pint**

```bash
npx tsc --noEmit
vendor/bin/pint --dirty --format agent
```

- [ ] **Step 9: Commit**

```bash
git add app/Http/Controllers/CursoController.php routes/web.php resources/js/Pages/Cursos/Index.tsx resources/js/types/index.d.ts tests/Feature/CursosIndexTest.php
git commit -m "feat(cursos): página pública lendo do banco (remove mock)"
```

---

## Task 18: Seeder de desenvolvimento + usuário admin

**Files:**
- Create: `database/seeders/CursoSeeder.php`
- Modify: `database/seeders/DatabaseSeeder.php`

- [ ] **Step 1: Criar `CursoSeeder`**

Arquivo `database/seeders/CursoSeeder.php`:

```php
<?php

namespace Database\Seeders;

use App\Enums\TipoAulaEnum;
use App\Models\Aula;
use App\Models\Curso;
use App\Models\Modulo;
use Illuminate\Database\Seeder;

class CursoSeeder extends Seeder
{
    public function run(): void
    {
        Curso::factory()
            ->count(6)
            ->create()
            ->each(function (Curso $curso): void {
                $modulo = Modulo::factory()->for($curso)->create([
                    'titulo' => 'Módulo introdutório',
                    'ordem' => 1,
                ]);

                Aula::factory()
                    ->for($modulo)
                    ->count(fake()->numberBetween(4, 12))
                    ->sequence(fn ($seq) => ['ordem' => $seq->index + 1])
                    ->create(['tipo_aula' => TipoAulaEnum::VIDEO]);
            });
    }
}
```

- [ ] **Step 2: Atualizar `DatabaseSeeder`**

Substituir conteúdo:

```php
<?php

namespace Database\Seeders;

use App\Enums\PapelEnum;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        User::factory()->create([
            'name' => 'Aluno Teste',
            'email' => 'aluno@example.com',
            'papel' => PapelEnum::ALUNO,
        ]);

        User::factory()->create([
            'name' => 'Admin Teste',
            'email' => 'admin@example.com',
            'papel' => PapelEnum::ADMIN,
        ]);

        $this->call(CursoSeeder::class);
    }
}
```

- [ ] **Step 3: Rodar seeders em banco limpo**

```bash
php artisan migrate:fresh --seed --no-interaction
```
Esperado: 2 usuários + 6 cursos com aulas criados.

- [ ] **Step 4: Verificar no banco**

```bash
php artisan tinker --execute "echo \App\Models\Curso::count().' cursos, '.\App\Models\Aula::count().' aulas';"
```
Esperado saída numérica (ex: `6 cursos, 48 aulas`).

- [ ] **Step 5: Commit**

```bash
git add database/seeders
git commit -m "feat(seeders): CursoSeeder + usuários de teste aluno/admin"
```

---

## Task 19: Verificação final manual

**Files:** nenhuma mudança — validação end-to-end.

- [ ] **Step 1: Subir os serviços**

```bash
composer run dev
```
(ou `php artisan serve` + `npm run dev` em terminais separados)

- [ ] **Step 2: Rodar suíte completa de testes**

```bash
./vendor/bin/pest --compact
```
Esperado: todos os testes novos e existentes passando.

- [ ] **Step 3: Checar tsc final**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Walkthrough de UI**

Logar como `admin@example.com` / `password`:
- [ ] Navbar mostra link "Admin"
- [ ] `/admin` exibe dashboard com contagens
- [ ] `/admin/cursos` lista cursos do seeder
- [ ] `/admin/cursos/importar` abre formulário
- [ ] Submeter um ID/URL de playlist **real** com `YOUTUBE_API_KEY` configurada cria o curso
- [ ] Playlist duplicada retorna erro inline
- [ ] Página pública `/cursos` exibe cursos reais com duração calculada

Logar como `aluno@example.com` / `password`:
- [ ] Navbar **não** mostra link "Admin"
- [ ] Acessar `/admin` diretamente retorna 403

- [ ] **Step 5: Commit final (se houver ajustes cosméticos)**

```bash
git status
# se limpo, nada a commitar; caso contrário, commit descritivo
```

---

## Notas operacionais

- **API Key obrigatória para import real.** Sem `YOUTUBE_API_KEY` no `.env`, qualquer chamada ao `YouTubePlaylistService::make()` lança `YouTubeApiException`. Testes de import usam fake binding, não tocam rede.
- **Quota YouTube:** 10.000 unidades/dia grátis. `playlistItems.list` custa ~1 unidade/página; `videos.list` custa ~1 por batch de 50. Playlists com até ~500 vídeos consomem < 20 unidades.
- **Re-sync/Update:** fora do escopo deste plano. `synced_at` já fica gravado para iteração futura.
- **CRUDs futuros** (usuários, cursos editáveis, etc.): a estrutura admin (middleware, layout, sidebar, prefixo de rotas) já está pronta; basta adicionar novos controllers + páginas sob `Admin/`.