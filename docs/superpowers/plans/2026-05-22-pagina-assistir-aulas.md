# Página "Assistir aulas" + progresso + XP + comentários — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir a página de consumo de aulas (player YouTube + sidebar + comentários), com retomada de vídeo no segundo onde parou, conclusão automática a 90% + manual, crédito de XP (1 XP/minuto), e CRUD completo de comentários com replies.

**Architecture:** Inertia.js (Laravel + React/TypeScript). Backend: rota dedicada `/cursos/{curso}/assistir/{aula?}`, middleware de matrícula, Actions para Progresso/Conclusão/XP/Comentário, Policy para comentários. Frontend: nova página `Cursos/Assistir.tsx` com hook para YouTube IFrame API (heartbeat a cada 10s + auto-conclusão em 90%) e componente de threads de comentários.

**Tech Stack:** Laravel 12, PHP 8.4, Pest, Inertia 2, React 18, TypeScript, Tailwind, YouTube IFrame API.

**Spec:** [docs/superpowers/specs/2026-05-22-pagina-assistir-aulas-design.md](../specs/2026-05-22-pagina-assistir-aulas-design.md)

---

## File Structure

**Migrations**
- Create: `database/migrations/2026_05_22_000000_alter_progressos_aulas_for_resume.php`

**Models (preencher stubs vazios)**
- Modify: `app/Models/ProgressoAula.php`
- Modify: `app/Models/HistoricoXP.php`
- Modify: `app/Models/PerfilGamificado.php`
- Modify: `app/Models/ComentarioAula.php`
- Modify: `app/Models/User.php` (novas relations + perfil bootstrap)

**Factories**
- Create: `database/factories/ProgressoAulaFactory.php`
- Create: `database/factories/HistoricoXPFactory.php`
- Create: `database/factories/PerfilGamificadoFactory.php`
- Create: `database/factories/ComentarioAulaFactory.php`

**Actions**
- Create: `app/Actions/CreditarXP.php`
- Create: `app/Actions/ConcluirAula.php`
- Create: `app/Actions/AtualizarProgressoAula.php`

**Middleware**
- Create: `app/Http/Middleware/EnsureMatriculadoNoCurso.php`
- Modify: `bootstrap/app.php` (aliases `matriculado`, `matriculado.aula`)

**Controllers**
- Create: `app/Http/Controllers/AssistirController.php`
- Create: `app/Http/Controllers/ProgressoAulaController.php`
- Create: `app/Http/Controllers/ComentarioAulaController.php`

**Form Requests + Policy**
- Create: `app/Http/Requests/Comentarios/StoreComentarioRequest.php`
- Create: `app/Http/Requests/Comentarios/UpdateComentarioRequest.php`
- Create: `app/Policies/ComentarioAulaPolicy.php`

**Rotas**
- Modify: `routes/web.php`

**Inertia shared**
- Modify: `app/Http/Middleware/HandleInertiaRequests.php` (expõe `xp_total` + `nivel_atual` quando autenticado)
- Modify: `app/Http/Controllers/DashboardController.php` (progresso por curso + XP)
- Modify: `app/Http/Controllers/CursoController.php` (status por aula quando matriculado)

**Frontend**
- Modify: `resources/js/types/index.d.ts`
- Create: `resources/js/hooks/useYouTubePlayer.ts`
- Create: `resources/js/pages/Cursos/Assistir.tsx`
- Create: `resources/js/components/Comentarios/Comentarios.tsx`
- Modify: `resources/js/pages/Cursos/Show.tsx`
- Modify: `resources/js/pages/Dashboard.tsx`

**Tests**
- Create: `tests/Feature/Aulas/AssistirControllerTest.php`
- Create: `tests/Feature/Aulas/ProgressoAulaTest.php`
- Create: `tests/Feature/Aulas/ConcluirAulaTest.php`
- Create: `tests/Feature/Aulas/MatriculaGateTest.php`
- Create: `tests/Feature/Comentarios/ComentarioAulaTest.php`

---

## Convenções do projeto (referência rápida)

- `php artisan make:*` para gerar arquivos. Use `--no-interaction`.
- Models usam `use HasPublicId` para UUID + `getRouteKeyName() = public_id`. Veja [app/Concerns/HasPublicId.php](../../../app/Concerns/HasPublicId.php).
- Tabelas usam nomes em português plural: `progressos_aulas`, `historico_xp`, `perfis_gamificados`, `comentarios_aulas`.
- FK de usuário se chama `usuario_id` (não `user_id`), apontando para `users`.
- Casts em método `casts(): array`, não em propriedade.
- Form Requests: usar string-based rules (`'required|string|max:2000'`) ou array-based — verifique sibling em `app/Http/Requests/Suporte/StoreChamadoRequest.php` e siga.
- Tests em Pest (`it('description', ...)`); `php artisan make:test {Name}` e converter para Pest.
- Após editar PHP, rodar `vendor/bin/pint --dirty --format agent`.
- Frontend: `bun run build` ou `bun run dev` (este projeto usa **bun**, nunca npm).
- Layouts: páginas autenticadas usam `AppLayout`, públicas usam `GuestLayout` (`Cursos/Show` usa GuestLayout mesmo para autenticados).

---

## Task 1: Migration — alter `progressos_aulas` para suportar retomada

**Files:**
- Create: `database/migrations/2026_05_22_000000_alter_progressos_aulas_for_resume.php`

- [ ] **Step 1: Criar migration**

```bash
php artisan make:migration alter_progressos_aulas_for_resume --no-interaction
```

Renomeie o arquivo gerado para timestamp `2026_05_22_000000_` se necessário (apenas para ordem cronológica relativa ao plano; o timestamp gerado também serve).

- [ ] **Step 2: Implementar a migration**

Conteúdo do arquivo:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('progressos_aulas', function (Blueprint $table): void {
            $table->timestamp('concluido_em')->nullable()->change();
            $table->unsignedInteger('posicao_segundos')->default(0)->after('aula_id');
            $table->timestamp('ultima_visualizacao_em')->nullable()->after('posicao_segundos');
            $table->index(['usuario_id', 'ultima_visualizacao_em'], 'progressos_user_recent_idx');
        });
    }

    public function down(): void
    {
        Schema::table('progressos_aulas', function (Blueprint $table): void {
            $table->dropIndex('progressos_user_recent_idx');
            $table->dropColumn(['posicao_segundos', 'ultima_visualizacao_em']);
            $table->timestamp('concluido_em')->nullable(false)->change();
        });
    }
};
```

- [ ] **Step 3: Rodar migration**

```bash
php artisan migrate
```

Esperado: `Migrated: ...alter_progressos_aulas_for_resume`.

- [ ] **Step 4: Verificar schema**

```bash
php artisan tinker --execute="dump(Schema::getColumnListing('progressos_aulas'));"
```

Esperado: array contendo `posicao_segundos` e `ultima_visualizacao_em`.

- [ ] **Step 5: Commit**

```bash
git add database/migrations/
git commit -m "feat(db): adiciona posicao_segundos + ultima_visualizacao_em em progressos_aulas"
```

---

## Task 2: Model `ProgressoAula`

**Files:**
- Modify: `app/Models/ProgressoAula.php`

- [ ] **Step 1: Implementar o model**

Substituir o conteúdo de `app/Models/ProgressoAula.php`:

```php
<?php

namespace App\Models;

use App\Concerns\HasPublicId;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProgressoAula extends Model
{
    use HasFactory;
    use HasPublicId;

    protected $table = 'progressos_aulas';

    protected $fillable = [
        'public_id',
        'usuario_id',
        'aula_id',
        'posicao_segundos',
        'concluido_em',
        'ultima_visualizacao_em',
    ];

    protected function casts(): array
    {
        return [
            'posicao_segundos' => 'integer',
            'concluido_em' => 'datetime',
            'ultima_visualizacao_em' => 'datetime',
        ];
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function aula(): BelongsTo
    {
        return $this->belongsTo(Aula::class);
    }

    public function scopeConcluida(Builder $query): Builder
    {
        return $query->whereNotNull('concluido_em');
    }

    public function scopeEmAndamento(Builder $query): Builder
    {
        return $query->whereNull('concluido_em')->where('posicao_segundos', '>', 0);
    }
}
```

- [ ] **Step 2: Lint**

```bash
vendor/bin/pint --dirty --format agent
```

- [ ] **Step 3: Commit**

```bash
git add app/Models/ProgressoAula.php
git commit -m "feat(models): preenche ProgressoAula com relations e scopes"
```

---

## Task 3: Model `HistoricoXP`

**Files:**
- Modify: `app/Models/HistoricoXP.php`

- [ ] **Step 1: Implementar**

Substituir conteúdo:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HistoricoXP extends Model
{
    use HasFactory;

    protected $table = 'historico_xp';

    protected $fillable = [
        'usuario_id',
        'quantidade',
        'motivo',
    ];

    protected function casts(): array
    {
        return [
            'quantidade' => 'integer',
        ];
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}
```

- [ ] **Step 2: Lint + commit**

```bash
vendor/bin/pint --dirty --format agent
git add app/Models/HistoricoXP.php
git commit -m "feat(models): preenche HistoricoXP"
```

---

## Task 4: Model `PerfilGamificado`

**Files:**
- Modify: `app/Models/PerfilGamificado.php`

- [ ] **Step 1: Implementar**

Substituir conteúdo:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PerfilGamificado extends Model
{
    use HasFactory;

    protected $table = 'perfis_gamificados';

    protected $fillable = [
        'usuario_id',
        'xp_total',
        'nivel_atual',
        'streak_dias',
        'ultima_atividade',
    ];

    protected function casts(): array
    {
        return [
            'xp_total' => 'integer',
            'nivel_atual' => 'integer',
            'streak_dias' => 'integer',
            'ultima_atividade' => 'date',
        ];
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}
```

- [ ] **Step 2: Lint + commit**

```bash
vendor/bin/pint --dirty --format agent
git add app/Models/PerfilGamificado.php
git commit -m "feat(models): preenche PerfilGamificado"
```

---

## Task 5: Model `ComentarioAula`

**Files:**
- Modify: `app/Models/ComentarioAula.php`

- [ ] **Step 1: Implementar**

Substituir conteúdo:

```php
<?php

namespace App\Models;

use App\Concerns\HasPublicId;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ComentarioAula extends Model
{
    use HasFactory;
    use HasPublicId;

    protected $table = 'comentarios_aulas';

    protected $fillable = [
        'public_id',
        'aula_id',
        'usuario_id',
        'comentario_pai_id',
        'conteudo',
        'foi_editado',
    ];

    protected function casts(): array
    {
        return [
            'foi_editado' => 'boolean',
        ];
    }

    public function aula(): BelongsTo
    {
        return $this->belongsTo(Aula::class);
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function pai(): BelongsTo
    {
        return $this->belongsTo(ComentarioAula::class, 'comentario_pai_id');
    }

    public function respostas(): HasMany
    {
        return $this->hasMany(ComentarioAula::class, 'comentario_pai_id')->orderBy('created_at');
    }
}
```

- [ ] **Step 2: Lint + commit**

```bash
vendor/bin/pint --dirty --format agent
git add app/Models/ComentarioAula.php
git commit -m "feat(models): preenche ComentarioAula com replies"
```

---

## Task 6: Relations no `User`

**Files:**
- Modify: `app/Models/User.php`

- [ ] **Step 1: Adicionar imports e relations**

No topo, garantir:

```php
use Illuminate\Database\Eloquent\Relations\HasOne;
```

Dentro da classe `User`, depois de `matriculas()`, adicionar:

```php
public function progressos(): HasMany
{
    return $this->hasMany(ProgressoAula::class, 'usuario_id');
}

public function historicoXp(): HasMany
{
    return $this->hasMany(HistoricoXP::class, 'usuario_id');
}

public function perfilGamificado(): HasOne
{
    return $this->hasOne(PerfilGamificado::class, 'usuario_id');
}

public function comentarios(): HasMany
{
    return $this->hasMany(ComentarioAula::class, 'usuario_id');
}
```

- [ ] **Step 2: Lint + commit**

```bash
vendor/bin/pint --dirty --format agent
git add app/Models/User.php
git commit -m "feat(models): adiciona relations de progresso, XP, perfil e comentarios em User"
```

---

## Task 7: Factories

**Files:**
- Create: `database/factories/ProgressoAulaFactory.php`
- Create: `database/factories/HistoricoXPFactory.php`
- Create: `database/factories/PerfilGamificadoFactory.php`
- Create: `database/factories/ComentarioAulaFactory.php`

- [ ] **Step 1: Gerar factories**

```bash
php artisan make:factory ProgressoAulaFactory --model=ProgressoAula --no-interaction
php artisan make:factory HistoricoXPFactory --model=HistoricoXP --no-interaction
php artisan make:factory PerfilGamificadoFactory --model=PerfilGamificado --no-interaction
php artisan make:factory ComentarioAulaFactory --model=ComentarioAula --no-interaction
```

- [ ] **Step 2: Implementar `ProgressoAulaFactory`**

```php
<?php

namespace Database\Factories;

use App\Models\Aula;
use App\Models\ProgressoAula;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<ProgressoAula>
 */
class ProgressoAulaFactory extends Factory
{
    protected $model = ProgressoAula::class;

    public function definition(): array
    {
        return [
            'public_id' => (string) Str::uuid(),
            'usuario_id' => User::factory(),
            'aula_id' => Aula::factory(),
            'posicao_segundos' => 0,
            'concluido_em' => null,
            'ultima_visualizacao_em' => now(),
        ];
    }

    public function concluida(): static
    {
        return $this->state(fn () => ['concluido_em' => now()]);
    }

    public function emAndamento(int $segundos = 30): static
    {
        return $this->state(fn () => [
            'posicao_segundos' => $segundos,
            'concluido_em' => null,
        ]);
    }
}
```

- [ ] **Step 3: Implementar `HistoricoXPFactory`**

```php
<?php

namespace Database\Factories;

use App\Models\HistoricoXP;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<HistoricoXP>
 */
class HistoricoXPFactory extends Factory
{
    protected $model = HistoricoXP::class;

    public function definition(): array
    {
        return [
            'usuario_id' => User::factory(),
            'quantidade' => $this->faker->numberBetween(1, 50),
            'motivo' => 'aula:concluida',
        ];
    }
}
```

- [ ] **Step 4: Implementar `PerfilGamificadoFactory`**

```php
<?php

namespace Database\Factories;

use App\Models\PerfilGamificado;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PerfilGamificado>
 */
class PerfilGamificadoFactory extends Factory
{
    protected $model = PerfilGamificado::class;

    public function definition(): array
    {
        return [
            'usuario_id' => User::factory(),
            'xp_total' => 0,
            'nivel_atual' => 1,
            'streak_dias' => 0,
            'ultima_atividade' => null,
        ];
    }
}
```

- [ ] **Step 5: Implementar `ComentarioAulaFactory`**

```php
<?php

namespace Database\Factories;

use App\Models\Aula;
use App\Models\ComentarioAula;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<ComentarioAula>
 */
class ComentarioAulaFactory extends Factory
{
    protected $model = ComentarioAula::class;

    public function definition(): array
    {
        return [
            'public_id' => (string) Str::uuid(),
            'aula_id' => Aula::factory(),
            'usuario_id' => User::factory(),
            'comentario_pai_id' => null,
            'conteudo' => $this->faker->paragraph(),
            'foi_editado' => false,
        ];
    }
}
```

- [ ] **Step 6: Lint + commit**

```bash
vendor/bin/pint --dirty --format agent
git add database/factories/
git commit -m "feat(factories): adiciona factories de progresso, XP, perfil e comentarios"
```

---

## Task 8: Action `CreditarXP` + teste

**Files:**
- Create: `app/Actions/CreditarXP.php`
- Test: `tests/Feature/Aulas/ConcluirAulaTest.php` (parcial — testa apenas CreditarXP isoladamente; teste de ConcluirAula adicionado depois)

- [ ] **Step 1: Implementar action**

```bash
php artisan make:class Actions/CreditarXP --no-interaction
```

Conteúdo:

```php
<?php

namespace App\Actions;

use App\Models\Aula;
use App\Models\HistoricoXP;
use App\Models\PerfilGamificado;
use App\Models\User;

class CreditarXP
{
    public function handle(User $user, Aula $aula, string $motivo = 'aula:concluida'): int
    {
        $xp = (int) ceil(max(0, (int) $aula->duracao_segundos) / 60);

        if ($xp === 0) {
            return 0;
        }

        HistoricoXP::create([
            'usuario_id' => $user->id,
            'quantidade' => $xp,
            'motivo' => $motivo,
        ]);

        $perfil = PerfilGamificado::firstOrCreate(['usuario_id' => $user->id]);
        $perfil->xp_total += $xp;
        $perfil->nivel_atual = (int) floor(sqrt($perfil->xp_total / 100)) + 1;
        $perfil->ultima_atividade = now()->toDateString();
        $perfil->save();

        return $xp;
    }
}
```

- [ ] **Step 2: Lint**

```bash
vendor/bin/pint --dirty --format agent
```

- [ ] **Step 3: Commit**

```bash
git add app/Actions/CreditarXP.php
git commit -m "feat(actions): CreditarXP com calculo derivado da duracao"
```

(O teste será adicionado integrado em `ConcluirAulaTest` na Task 9.)

---

## Task 9: Action `ConcluirAula` + teste

**Files:**
- Create: `app/Actions/ConcluirAula.php`
- Test: `tests/Feature/Aulas/ConcluirAulaTest.php`

- [ ] **Step 1: Criar teste (vai falhar)**

```bash
php artisan make:test Aulas/ConcluirAulaTest --no-interaction
```

Substituir conteúdo (Pest):

```php
<?php

use App\Actions\ConcluirAula;
use App\Models\Aula;
use App\Models\HistoricoXP;
use App\Models\Modulo;
use App\Models\PerfilGamificado;
use App\Models\ProgressoAula;
use App\Models\User;

use function Pest\Laravel\assertDatabaseCount;
use function Pest\Laravel\assertDatabaseHas;

uses(Illuminate\Foundation\Testing\RefreshDatabase::class);

it('credita XP correto e marca conclusao na primeira chamada', function () {
    $user = User::factory()->create();
    $modulo = Modulo::factory()->create();
    $aula = Aula::factory()->create(['modulo_id' => $modulo->id, 'duracao_segundos' => 720]);

    $xp = app(ConcluirAula::class)->handle($user, $aula);

    expect($xp)->toBe(12);
    assertDatabaseHas('historico_xp', ['usuario_id' => $user->id, 'quantidade' => 12]);
    assertDatabaseHas('perfis_gamificados', ['usuario_id' => $user->id, 'xp_total' => 12]);
    assertDatabaseHas('progressos_aulas', ['usuario_id' => $user->id, 'aula_id' => $aula->id]);
    $progresso = ProgressoAula::where('aula_id', $aula->id)->first();
    expect($progresso->concluido_em)->not->toBeNull();
});

it('eh idempotente: segunda chamada nao duplica XP', function () {
    $user = User::factory()->create();
    $modulo = Modulo::factory()->create();
    $aula = Aula::factory()->create(['modulo_id' => $modulo->id, 'duracao_segundos' => 600]);

    app(ConcluirAula::class)->handle($user, $aula);
    $xp = app(ConcluirAula::class)->handle($user, $aula);

    expect($xp)->toBe(0);
    assertDatabaseCount('historico_xp', 1);
    assertDatabaseHas('perfis_gamificados', ['usuario_id' => $user->id, 'xp_total' => 10]);
});

it('aula sem duracao conclui mas nao credita XP', function () {
    $user = User::factory()->create();
    $modulo = Modulo::factory()->create();
    $aula = Aula::factory()->create(['modulo_id' => $modulo->id, 'duracao_segundos' => 0]);

    $xp = app(ConcluirAula::class)->handle($user, $aula);

    expect($xp)->toBe(0);
    assertDatabaseCount('historico_xp', 0);
    expect(PerfilGamificado::where('usuario_id', $user->id)->first())->toBeNull();
    $progresso = ProgressoAula::where('aula_id', $aula->id)->first();
    expect($progresso->concluido_em)->not->toBeNull();
});

it('preserva posicao_segundos quando conclui aula em andamento', function () {
    $user = User::factory()->create();
    $modulo = Modulo::factory()->create();
    $aula = Aula::factory()->create(['modulo_id' => $modulo->id, 'duracao_segundos' => 600]);
    ProgressoAula::factory()->create([
        'usuario_id' => $user->id,
        'aula_id' => $aula->id,
        'posicao_segundos' => 200,
    ]);

    app(ConcluirAula::class)->handle($user, $aula);

    $progresso = ProgressoAula::where('aula_id', $aula->id)->first();
    expect($progresso->posicao_segundos)->toBe(200);
    expect($progresso->concluido_em)->not->toBeNull();
});
```

- [ ] **Step 2: Rodar teste — falha esperada**

```bash
./vendor/bin/pest tests/Feature/Aulas/ConcluirAulaTest.php --compact
```

Esperado: erro de classe `ConcluirAula` não encontrada.

- [ ] **Step 3: Implementar action**

```bash
php artisan make:class Actions/ConcluirAula --no-interaction
```

Conteúdo:

```php
<?php

namespace App\Actions;

use App\Models\Aula;
use App\Models\ProgressoAula;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ConcluirAula
{
    public function __construct(private CreditarXP $creditarXP) {}

    public function handle(User $user, Aula $aula): int
    {
        return DB::transaction(function () use ($user, $aula): int {
            $progresso = ProgressoAula::query()
                ->where('usuario_id', $user->id)
                ->where('aula_id', $aula->id)
                ->lockForUpdate()
                ->first();

            if ($progresso && $progresso->concluido_em !== null) {
                return 0;
            }

            if ($progresso === null) {
                $progresso = ProgressoAula::create([
                    'public_id' => (string) Str::uuid(),
                    'usuario_id' => $user->id,
                    'aula_id' => $aula->id,
                    'posicao_segundos' => 0,
                    'ultima_visualizacao_em' => now(),
                ]);
            }

            $progresso->concluido_em = now();
            $progresso->ultima_visualizacao_em = now();
            $progresso->save();

            return $this->creditarXP->handle($user, $aula);
        });
    }
}
```

- [ ] **Step 4: Rodar teste — passa**

```bash
./vendor/bin/pest tests/Feature/Aulas/ConcluirAulaTest.php --compact
```

Esperado: 4 passed.

- [ ] **Step 5: Lint + commit**

```bash
vendor/bin/pint --dirty --format agent
git add app/Actions/ConcluirAula.php tests/Feature/Aulas/ConcluirAulaTest.php
git commit -m "feat(actions): ConcluirAula idempotente com credito de XP"
```

---

## Task 10: Action `AtualizarProgressoAula` + teste

**Files:**
- Create: `app/Actions/AtualizarProgressoAula.php`
- Test: `tests/Feature/Aulas/ProgressoAulaTest.php`

- [ ] **Step 1: Criar teste**

```bash
php artisan make:test Aulas/ProgressoAulaTest --no-interaction
```

Substituir conteúdo:

```php
<?php

use App\Actions\AtualizarProgressoAula;
use App\Models\Aula;
use App\Models\Modulo;
use App\Models\ProgressoAula;
use App\Models\User;

uses(Illuminate\Foundation\Testing\RefreshDatabase::class);

it('cria row no primeiro update', function () {
    $user = User::factory()->create();
    $aula = Aula::factory()->create(['modulo_id' => Modulo::factory()]);

    app(AtualizarProgressoAula::class)->handle($user, $aula, 42);

    $progresso = ProgressoAula::where('aula_id', $aula->id)->first();
    expect($progresso)->not->toBeNull();
    expect($progresso->posicao_segundos)->toBe(42);
    expect($progresso->ultima_visualizacao_em)->not->toBeNull();
    expect($progresso->concluido_em)->toBeNull();
});

it('nao regride posicao quando nova eh menor', function () {
    $user = User::factory()->create();
    $aula = Aula::factory()->create(['modulo_id' => Modulo::factory()]);

    app(AtualizarProgressoAula::class)->handle($user, $aula, 100);
    app(AtualizarProgressoAula::class)->handle($user, $aula, 30);

    $progresso = ProgressoAula::where('aula_id', $aula->id)->first();
    expect($progresso->posicao_segundos)->toBe(100);
});

it('atualiza ultima_visualizacao_em em aula ja concluida sem mexer em concluido_em', function () {
    $user = User::factory()->create();
    $aula = Aula::factory()->create(['modulo_id' => Modulo::factory()]);
    $progresso = ProgressoAula::factory()->concluida()->create([
        'usuario_id' => $user->id,
        'aula_id' => $aula->id,
        'posicao_segundos' => 100,
    ]);
    $concluidoOriginal = $progresso->concluido_em;

    app(AtualizarProgressoAula::class)->handle($user, $aula, 150);

    $progresso->refresh();
    expect($progresso->concluido_em->toIso8601String())->toBe($concluidoOriginal->toIso8601String());
    expect($progresso->posicao_segundos)->toBe(150);
});
```

- [ ] **Step 2: Rodar — falha esperada**

```bash
./vendor/bin/pest tests/Feature/Aulas/ProgressoAulaTest.php --compact
```

- [ ] **Step 3: Implementar action**

```bash
php artisan make:class Actions/AtualizarProgressoAula --no-interaction
```

Conteúdo:

```php
<?php

namespace App\Actions;

use App\Models\Aula;
use App\Models\ProgressoAula;
use App\Models\User;
use Illuminate\Support\Str;

class AtualizarProgressoAula
{
    public function handle(User $user, Aula $aula, int $posicaoSegundos): ProgressoAula
    {
        $progresso = ProgressoAula::query()
            ->where('usuario_id', $user->id)
            ->where('aula_id', $aula->id)
            ->first();

        if ($progresso === null) {
            return ProgressoAula::create([
                'public_id' => (string) Str::uuid(),
                'usuario_id' => $user->id,
                'aula_id' => $aula->id,
                'posicao_segundos' => max(0, $posicaoSegundos),
                'ultima_visualizacao_em' => now(),
            ]);
        }

        $progresso->posicao_segundos = max($progresso->posicao_segundos, max(0, $posicaoSegundos));
        $progresso->ultima_visualizacao_em = now();
        $progresso->save();

        return $progresso;
    }
}
```

- [ ] **Step 4: Rodar — passa**

```bash
./vendor/bin/pest tests/Feature/Aulas/ProgressoAulaTest.php --compact
```

Esperado: 3 passed.

- [ ] **Step 5: Lint + commit**

```bash
vendor/bin/pint --dirty --format agent
git add app/Actions/AtualizarProgressoAula.php tests/Feature/Aulas/ProgressoAulaTest.php
git commit -m "feat(actions): AtualizarProgressoAula sem regressao de posicao"
```

---

## Task 11: Middleware `EnsureMatriculadoNoCurso`

**Files:**
- Create: `app/Http/Middleware/EnsureMatriculadoNoCurso.php`
- Modify: `bootstrap/app.php`

- [ ] **Step 1: Gerar middleware**

```bash
php artisan make:middleware EnsureMatriculadoNoCurso --no-interaction
```

- [ ] **Step 2: Implementar**

Conteúdo:

```php
<?php

namespace App\Http\Middleware;

use App\Models\Aula;
use App\Models\Curso;
use App\Models\Matricula;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureMatriculadoNoCurso
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if ($user === null) {
            return redirect()->route('login');
        }

        $cursoId = $this->resolveCursoId($request);
        if ($cursoId === null) {
            abort(404);
        }

        $matriculado = Matricula::query()
            ->where('usuario_id', $user->id)
            ->where('curso_id', $cursoId)
            ->exists();

        if (! $matriculado) {
            abort(403, 'Voce precisa estar matriculado neste curso.');
        }

        return $next($request);
    }

    private function resolveCursoId(Request $request): ?int
    {
        $curso = $request->route('curso');
        if ($curso instanceof Curso) {
            return $curso->id;
        }

        $aula = $request->route('aula');
        if ($aula instanceof Aula) {
            return $aula->modulo()->value('curso_id');
        }

        return null;
    }
}
```

- [ ] **Step 3: Registrar alias em `bootstrap/app.php`**

No `withMiddleware`, dentro do `$middleware->alias([...])`, adicionar:

```php
'matriculado' => \App\Http\Middleware\EnsureMatriculadoNoCurso::class,
'matriculado.aula' => \App\Http\Middleware\EnsureMatriculadoNoCurso::class,
```

(Mesmo middleware, dois aliases puramente semânticos; o middleware resolve via parâmetro de rota presente.)

- [ ] **Step 4: Lint + commit**

```bash
vendor/bin/pint --dirty --format agent
git add app/Http/Middleware/EnsureMatriculadoNoCurso.php bootstrap/app.php
git commit -m "feat(middleware): EnsureMatriculadoNoCurso por curso ou aula"
```

---

## Task 12: `MatriculaGateTest` (gate dos endpoints)

**Files:**
- Test: `tests/Feature/Aulas/MatriculaGateTest.php`

(Adicionar agora, antes dos controllers, garante que o gate funciona na borda. Os endpoints de progresso/conclusão serão criados na Task 14 — então este teste vai falhar até lá. É intencional: TDD top-down.)

- [ ] **Step 1: Criar teste**

```bash
php artisan make:test Aulas/MatriculaGateTest --no-interaction
```

Conteúdo:

```php
<?php

use App\Models\Aula;
use App\Models\Curso;
use App\Models\Matricula;
use App\Models\Modulo;
use App\Models\User;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\post;

uses(Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    $this->curso = Curso::factory()->create();
    $this->modulo = Modulo::factory()->create(['curso_id' => $this->curso->id]);
    $this->aula = Aula::factory()->create(['modulo_id' => $this->modulo->id]);
});

it('bloqueia progresso sem matricula', function () {
    actingAs(User::factory()->create());

    post(route('aulas.progresso', $this->aula->public_id), ['posicao_segundos' => 10])
        ->assertForbidden();
});

it('bloqueia conclusao sem matricula', function () {
    actingAs(User::factory()->create());

    post(route('aulas.concluir', $this->aula->public_id))->assertForbidden();
});

it('permite progresso com matricula', function () {
    $user = User::factory()->create();
    Matricula::create([
        'usuario_id' => $user->id,
        'curso_id' => $this->curso->id,
        'matriculado_em' => now(),
    ]);
    actingAs($user);

    post(route('aulas.progresso', $this->aula->public_id), ['posicao_segundos' => 10])
        ->assertNoContent();
});
```

- [ ] **Step 2: Não rodar ainda — os endpoints serão criados na Task 14. Commit do teste como WIP:**

```bash
git add tests/Feature/Aulas/MatriculaGateTest.php
git commit -m "test: gate de matricula para endpoints de progresso (red)"
```

---

## Task 13: `AssistirController` + rota + teste

**Files:**
- Create: `app/Http/Controllers/AssistirController.php`
- Modify: `routes/web.php`
- Test: `tests/Feature/Aulas/AssistirControllerTest.php`

- [ ] **Step 1: Criar teste**

```bash
php artisan make:test Aulas/AssistirControllerTest --no-interaction
```

Conteúdo:

```php
<?php

use App\Models\Aula;
use App\Models\Curso;
use App\Models\Matricula;
use App\Models\Modulo;
use App\Models\ProgressoAula;
use App\Models\User;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;

uses(Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    $this->curso = Curso::factory()->create();
    $this->modulo = Modulo::factory()->create(['curso_id' => $this->curso->id, 'ordem' => 1]);
    $this->aula1 = Aula::factory()->create(['modulo_id' => $this->modulo->id, 'ordem' => 1, 'tipo_aula' => 'video', 'duracao_segundos' => 600]);
    $this->aula2 = Aula::factory()->create(['modulo_id' => $this->modulo->id, 'ordem' => 2, 'tipo_aula' => 'video', 'duracao_segundos' => 300]);

    $this->user = User::factory()->create();
    Matricula::create(['usuario_id' => $this->user->id, 'curso_id' => $this->curso->id, 'matriculado_em' => now()]);
});

it('guest eh redirecionado para login', function () {
    get(route('cursos.assistir', $this->curso->public_id))->assertRedirect(route('login'));
});

it('usuario sem matricula recebe 403', function () {
    actingAs(User::factory()->create());
    get(route('cursos.assistir', $this->curso->public_id))->assertForbidden();
});

it('matriculado sem {aula} eh redirecionado para primeira aula', function () {
    actingAs($this->user);
    get(route('cursos.assistir', $this->curso->public_id))
        ->assertRedirect(route('cursos.assistir', [$this->curso->public_id, $this->aula1->public_id]));
});

it('matriculado com aula em andamento eh redirecionado pra ela', function () {
    ProgressoAula::factory()->emAndamento()->create([
        'usuario_id' => $this->user->id,
        'aula_id' => $this->aula2->id,
    ]);
    actingAs($this->user);

    get(route('cursos.assistir', $this->curso->public_id))
        ->assertRedirect(route('cursos.assistir', [$this->curso->public_id, $this->aula2->public_id]));
});

it('matriculado com aula valida renderiza a pagina', function () {
    actingAs($this->user);
    get(route('cursos.assistir', [$this->curso->public_id, $this->aula1->public_id]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('Cursos/Assistir'));
});

it('aula que nao pertence ao curso retorna 404', function () {
    $outroCurso = Curso::factory()->create();
    $outroModulo = Modulo::factory()->create(['curso_id' => $outroCurso->id]);
    $aulaForasteira = Aula::factory()->create(['modulo_id' => $outroModulo->id]);

    actingAs($this->user);
    get(route('cursos.assistir', [$this->curso->public_id, $aulaForasteira->public_id]))
        ->assertNotFound();
});
```

- [ ] **Step 2: Criar controller**

```bash
php artisan make:controller AssistirController --no-interaction
```

Conteúdo:

```php
<?php

namespace App\Http\Controllers;

use App\Models\Aula;
use App\Models\ComentarioAula;
use App\Models\Curso;
use App\Models\Modulo;
use App\Models\ProgressoAula;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AssistirController extends Controller
{
    public function show(Request $request, Curso $curso, ?Aula $aula = null): Response|RedirectResponse
    {
        $curso->load([
            'modulos' => fn ($q) => $q->orderBy('ordem'),
            'modulos.aulas' => fn ($q) => $q->orderBy('ordem'),
        ]);

        $user = $request->user();

        if ($aula === null) {
            $alvo = $this->resolveAulaInicial($curso, $user->id);
            if ($alvo === null) {
                abort(404, 'Curso sem aulas.');
            }

            return redirect()->route('cursos.assistir', [$curso->public_id, $alvo->public_id]);
        }

        if ($aula->modulo->curso_id !== $curso->id) {
            abort(404);
        }

        $progressos = ProgressoAula::query()
            ->where('usuario_id', $user->id)
            ->whereIn('aula_id', $curso->modulos->flatMap->aulas->pluck('id'))
            ->get()
            ->keyBy('aula_id');

        $todasAulas = $curso->modulos->flatMap->aulas->values();
        $idxAtual = $todasAulas->search(fn (Aula $a) => $a->id === $aula->id);
        $proxima = $todasAulas->get($idxAtual + 1);

        $progressoAtual = $progressos->get($aula->id);

        $comentarios = ComentarioAula::query()
            ->where('aula_id', $aula->id)
            ->whereNull('comentario_pai_id')
            ->with([
                'usuario:id,public_id,name',
                'respostas.usuario:id,public_id,name',
            ])
            ->latest()
            ->get();

        return Inertia::render('Cursos/Assistir', [
            'curso' => [
                'public_id' => $curso->public_id,
                'titulo' => $curso->titulo,
            ],
            'modulos' => $curso->modulos->map(fn (Modulo $m) => [
                'public_id' => $m->public_id,
                'titulo' => $m->titulo,
                'ordem' => $m->ordem,
                'aulas' => $m->aulas->map(fn (Aula $a) => [
                    'public_id' => $a->public_id,
                    'titulo' => $a->titulo,
                    'tipo_aula' => $a->tipo_aula->value,
                    'duracao_segundos' => (int) $a->duracao_segundos,
                    'ordem' => $a->ordem,
                    'concluida' => $progressos->get($a->id)?->concluido_em !== null,
                    'em_andamento' => $progressos->get($a->id)
                        && $progressos->get($a->id)->concluido_em === null
                        && $progressos->get($a->id)->posicao_segundos > 0,
                ])->values(),
            ])->values(),
            'aulaAtual' => [
                'public_id' => $aula->public_id,
                'titulo' => $aula->titulo,
                'tipo_aula' => $aula->tipo_aula->value,
                'conteudo' => $aula->conteudo,
                'duracao_segundos' => (int) $aula->duracao_segundos,
                'ordem' => $aula->ordem,
                'youtube_video_id' => $aula->youtube_video_id,
                'xp' => (int) ceil(max(0, (int) $aula->duracao_segundos) / 60),
                'posicao_segundos' => (int) ($progressoAtual?->posicao_segundos ?? 0),
                'concluida' => $progressoAtual?->concluido_em !== null,
            ],
            'proximaAula' => $proxima ? ['public_id' => $proxima->public_id] : null,
            'comentarios' => $comentarios->map(fn (ComentarioAula $c) => $this->mapComentario($c, $user->id)),
        ]);
    }

    private function resolveAulaInicial(Curso $curso, int $usuarioId): ?Aula
    {
        $todas = $curso->modulos->flatMap->aulas->values();
        if ($todas->isEmpty()) {
            return null;
        }

        $emAndamento = ProgressoAula::query()
            ->where('usuario_id', $usuarioId)
            ->whereIn('aula_id', $todas->pluck('id'))
            ->whereNull('concluido_em')
            ->where('posicao_segundos', '>', 0)
            ->orderByDesc('ultima_visualizacao_em')
            ->first();

        if ($emAndamento) {
            return $todas->firstWhere('id', $emAndamento->aula_id);
        }

        return $todas->first();
    }

    private function mapComentario(ComentarioAula $c, int $usuarioId): array
    {
        return [
            'public_id' => $c->public_id,
            'conteudo' => $c->conteudo,
            'foi_editado' => $c->foi_editado,
            'created_at' => $c->created_at->toIso8601String(),
            'autor' => [
                'public_id' => $c->usuario->public_id,
                'name' => $c->usuario->name,
            ],
            'is_owner' => $c->usuario_id === $usuarioId,
            'respostas' => $c->respostas->map(fn (ComentarioAula $r) => [
                'public_id' => $r->public_id,
                'conteudo' => $r->conteudo,
                'foi_editado' => $r->foi_editado,
                'created_at' => $r->created_at->toIso8601String(),
                'autor' => [
                    'public_id' => $r->usuario->public_id,
                    'name' => $r->usuario->name,
                ],
                'is_owner' => $r->usuario_id === $usuarioId,
            ])->values(),
        ];
    }
}
```

- [ ] **Step 3: Registrar rota em `routes/web.php`**

No grupo `Route::middleware('auth')`, adicionar (após a rota de matricular):

```php
Route::get('/cursos/{curso:public_id}/assistir/{aula:public_id?}', [\App\Http\Controllers\AssistirController::class, 'show'])
    ->middleware('matriculado')
    ->name('cursos.assistir');
```

- [ ] **Step 4: Criar stub da página Inertia para o teste passar (assertInertia)**

```bash
mkdir -p resources/js/pages/Cursos
```

Criar `resources/js/pages/Cursos/Assistir.tsx` mínimo (será substituído na Task 18):

```tsx
export default function CursosAssistir() {
    return null
}
```

- [ ] **Step 5: Rodar teste**

```bash
./vendor/bin/pest tests/Feature/Aulas/AssistirControllerTest.php --compact
```

Esperado: 6 passed.

- [ ] **Step 6: Lint + commit**

```bash
vendor/bin/pint --dirty --format agent
git add app/Http/Controllers/AssistirController.php routes/web.php tests/Feature/Aulas/AssistirControllerTest.php resources/js/pages/Cursos/Assistir.tsx
git commit -m "feat(assistir): controller + rota + retomada por ultima_visualizacao"
```

---

## Task 14: `ProgressoAulaController` + rotas

**Files:**
- Create: `app/Http/Controllers/ProgressoAulaController.php`
- Modify: `routes/web.php`

- [ ] **Step 1: Criar controller**

```bash
php artisan make:controller ProgressoAulaController --no-interaction
```

Conteúdo:

```php
<?php

namespace App\Http\Controllers;

use App\Actions\AtualizarProgressoAula;
use App\Actions\ConcluirAula;
use App\Models\Aula;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ProgressoAulaController extends Controller
{
    public function update(Request $request, Aula $aula, AtualizarProgressoAula $action): Response
    {
        $data = $request->validate([
            'posicao_segundos' => ['required', 'integer', 'min:0'],
        ]);

        $action->handle($request->user(), $aula, (int) $data['posicao_segundos']);

        return response()->noContent();
    }

    public function concluir(Request $request, Aula $aula, ConcluirAula $action): RedirectResponse
    {
        $xp = $action->handle($request->user(), $aula);

        return back()->with('success', $xp > 0 ? "Aula concluida! +{$xp} XP" : 'Aula concluida!');
    }
}
```

- [ ] **Step 2: Registrar rotas em `routes/web.php`**

No grupo `Route::middleware('auth')`, adicionar:

```php
Route::post('/aulas/{aula:public_id}/progresso', [\App\Http\Controllers\ProgressoAulaController::class, 'update'])
    ->middleware('matriculado.aula')
    ->name('aulas.progresso');

Route::post('/aulas/{aula:public_id}/concluir', [\App\Http\Controllers\ProgressoAulaController::class, 'concluir'])
    ->middleware('matriculado.aula')
    ->name('aulas.concluir');
```

- [ ] **Step 3: Rodar suite de Aulas**

```bash
./vendor/bin/pest tests/Feature/Aulas --compact
```

Esperado: todos os tests passam (incluindo o `MatriculaGateTest` da Task 12).

- [ ] **Step 4: Lint + commit**

```bash
vendor/bin/pint --dirty --format agent
git add app/Http/Controllers/ProgressoAulaController.php routes/web.php
git commit -m "feat(progresso): endpoints de heartbeat e conclusao"
```

---

## Task 15: Comentários — Policy, FormRequests, Controller, rotas, teste

**Files:**
- Create: `app/Policies/ComentarioAulaPolicy.php`
- Create: `app/Http/Requests/Comentarios/StoreComentarioRequest.php`
- Create: `app/Http/Requests/Comentarios/UpdateComentarioRequest.php`
- Create: `app/Http/Controllers/ComentarioAulaController.php`
- Modify: `routes/web.php`
- Test: `tests/Feature/Comentarios/ComentarioAulaTest.php`

- [ ] **Step 1: Criar policy**

```bash
php artisan make:policy ComentarioAulaPolicy --model=ComentarioAula --no-interaction
```

Substituir conteúdo (mantém apenas update/delete):

```php
<?php

namespace App\Policies;

use App\Models\ComentarioAula;
use App\Models\User;

class ComentarioAulaPolicy
{
    public function update(User $user, ComentarioAula $comentario): bool
    {
        return $user->id === $comentario->usuario_id;
    }

    public function delete(User $user, ComentarioAula $comentario): bool
    {
        return $user->id === $comentario->usuario_id || $user->isAdmin();
    }
}
```

- [ ] **Step 2: Criar FormRequests**

```bash
php artisan make:request Comentarios/StoreComentarioRequest --no-interaction
php artisan make:request Comentarios/UpdateComentarioRequest --no-interaction
```

`StoreComentarioRequest`:

```php
<?php

namespace App\Http\Requests\Comentarios;

use App\Models\ComentarioAula;
use Closure;
use Illuminate\Foundation\Http\FormRequest;

class StoreComentarioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $aulaId = $this->route('aula')->id;

        return [
            'conteudo' => ['required', 'string', 'max:2000'],
            'comentario_pai_id' => [
                'nullable',
                'uuid',
                function (string $attribute, mixed $value, Closure $fail) use ($aulaId): void {
                    $pai = ComentarioAula::query()->where('public_id', $value)->first();
                    if ($pai === null || $pai->aula_id !== $aulaId) {
                        $fail('Comentario pai invalido.');

                        return;
                    }
                    if ($pai->comentario_pai_id !== null) {
                        $fail('Nao eh possivel responder a uma resposta.');
                    }
                },
            ],
        ];
    }
}
```

`UpdateComentarioRequest`:

```php
<?php

namespace App\Http\Requests\Comentarios;

use Illuminate\Foundation\Http\FormRequest;

class UpdateComentarioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('comentario')) ?? false;
    }

    public function rules(): array
    {
        return [
            'conteudo' => ['required', 'string', 'max:2000'],
        ];
    }
}
```

- [ ] **Step 3: Criar controller**

```bash
php artisan make:controller ComentarioAulaController --no-interaction
```

Conteúdo:

```php
<?php

namespace App\Http\Controllers;

use App\Http\Requests\Comentarios\StoreComentarioRequest;
use App\Http\Requests\Comentarios\UpdateComentarioRequest;
use App\Models\Aula;
use App\Models\ComentarioAula;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ComentarioAulaController extends Controller
{
    public function store(StoreComentarioRequest $request, Aula $aula): RedirectResponse
    {
        $paiId = null;
        if ($request->filled('comentario_pai_id')) {
            $paiId = ComentarioAula::query()
                ->where('public_id', $request->input('comentario_pai_id'))
                ->value('id');
        }

        ComentarioAula::create([
            'aula_id' => $aula->id,
            'usuario_id' => $request->user()->id,
            'comentario_pai_id' => $paiId,
            'conteudo' => $request->string('conteudo')->trim()->value(),
        ]);

        return back()->with('success', 'Comentario publicado.');
    }

    public function update(UpdateComentarioRequest $request, ComentarioAula $comentario): RedirectResponse
    {
        $comentario->update([
            'conteudo' => $request->string('conteudo')->trim()->value(),
            'foi_editado' => true,
        ]);

        return back()->with('success', 'Comentario atualizado.');
    }

    public function destroy(Request $request, ComentarioAula $comentario): RedirectResponse
    {
        $this->authorize('delete', $comentario);
        $comentario->delete();

        return back()->with('success', 'Comentario removido.');
    }
}
```

- [ ] **Step 4: Registrar rotas em `routes/web.php`**

No grupo `auth`:

```php
Route::post('/aulas/{aula:public_id}/comentarios', [\App\Http\Controllers\ComentarioAulaController::class, 'store'])
    ->middleware('matriculado.aula')
    ->name('aulas.comentarios.store');

Route::put('/comentarios/{comentario:public_id}', [\App\Http\Controllers\ComentarioAulaController::class, 'update'])
    ->name('comentarios.update');

Route::delete('/comentarios/{comentario:public_id}', [\App\Http\Controllers\ComentarioAulaController::class, 'destroy'])
    ->name('comentarios.destroy');
```

- [ ] **Step 5: Criar teste**

```bash
php artisan make:test Comentarios/ComentarioAulaTest --no-interaction
```

Conteúdo:

```php
<?php

use App\Enums\PapelEnum;
use App\Models\Aula;
use App\Models\ComentarioAula;
use App\Models\Curso;
use App\Models\Matricula;
use App\Models\Modulo;
use App\Models\User;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\assertDatabaseHas;
use function Pest\Laravel\assertDatabaseMissing;
use function Pest\Laravel\delete;
use function Pest\Laravel\post;
use function Pest\Laravel\put;

uses(Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    $this->curso = Curso::factory()->create();
    $this->modulo = Modulo::factory()->create(['curso_id' => $this->curso->id]);
    $this->aula = Aula::factory()->create(['modulo_id' => $this->modulo->id]);
    $this->user = User::factory()->create();
    Matricula::create(['usuario_id' => $this->user->id, 'curso_id' => $this->curso->id, 'matriculado_em' => now()]);
});

it('matriculado cria comentario top-level', function () {
    actingAs($this->user);

    post(route('aulas.comentarios.store', $this->aula->public_id), ['conteudo' => 'Otima aula'])
        ->assertRedirect();

    assertDatabaseHas('comentarios_aulas', ['aula_id' => $this->aula->id, 'usuario_id' => $this->user->id, 'comentario_pai_id' => null]);
});

it('matriculado responde a comentario top-level', function () {
    $pai = ComentarioAula::factory()->create(['aula_id' => $this->aula->id, 'usuario_id' => $this->user->id]);
    actingAs($this->user);

    post(route('aulas.comentarios.store', $this->aula->public_id), [
        'conteudo' => 'Concordo',
        'comentario_pai_id' => $pai->public_id,
    ])->assertRedirect();

    assertDatabaseHas('comentarios_aulas', ['comentario_pai_id' => $pai->id]);
});

it('rejeita reply de reply', function () {
    $pai = ComentarioAula::factory()->create(['aula_id' => $this->aula->id, 'usuario_id' => $this->user->id]);
    $reply = ComentarioAula::factory()->create([
        'aula_id' => $this->aula->id,
        'usuario_id' => $this->user->id,
        'comentario_pai_id' => $pai->id,
    ]);
    actingAs($this->user);

    post(route('aulas.comentarios.store', $this->aula->public_id), [
        'conteudo' => 'reply de reply',
        'comentario_pai_id' => $reply->public_id,
    ])->assertSessionHasErrors('comentario_pai_id');
});

it('bloqueia comentario sem matricula', function () {
    actingAs(User::factory()->create());

    post(route('aulas.comentarios.store', $this->aula->public_id), ['conteudo' => 'oi'])
        ->assertForbidden();
});

it('dono edita seu comentario e marca foi_editado', function () {
    $c = ComentarioAula::factory()->create(['aula_id' => $this->aula->id, 'usuario_id' => $this->user->id]);
    actingAs($this->user);

    put(route('comentarios.update', $c->public_id), ['conteudo' => 'editado'])
        ->assertRedirect();

    assertDatabaseHas('comentarios_aulas', ['id' => $c->id, 'conteudo' => 'editado', 'foi_editado' => true]);
});

it('nao-dono nao pode editar', function () {
    $c = ComentarioAula::factory()->create(['aula_id' => $this->aula->id, 'usuario_id' => $this->user->id]);
    actingAs(User::factory()->create());

    put(route('comentarios.update', $c->public_id), ['conteudo' => 'hackeado'])
        ->assertForbidden();
});

it('dono deleta e respostas cascade', function () {
    $pai = ComentarioAula::factory()->create(['aula_id' => $this->aula->id, 'usuario_id' => $this->user->id]);
    $resp = ComentarioAula::factory()->create([
        'aula_id' => $this->aula->id,
        'usuario_id' => $this->user->id,
        'comentario_pai_id' => $pai->id,
    ]);
    actingAs($this->user);

    delete(route('comentarios.destroy', $pai->public_id))->assertRedirect();

    assertDatabaseMissing('comentarios_aulas', ['id' => $pai->id]);
    assertDatabaseMissing('comentarios_aulas', ['id' => $resp->id]);
});

it('admin pode deletar comentario de outro', function () {
    $c = ComentarioAula::factory()->create(['aula_id' => $this->aula->id, 'usuario_id' => $this->user->id]);
    $admin = User::factory()->create(['papel' => PapelEnum::ADMIN]);
    actingAs($admin);

    delete(route('comentarios.destroy', $c->public_id))->assertRedirect();
    assertDatabaseMissing('comentarios_aulas', ['id' => $c->id]);
});
```

- [ ] **Step 6: Rodar suite**

```bash
./vendor/bin/pest tests/Feature/Comentarios --compact
```

Esperado: 8 passed.

- [ ] **Step 7: Lint + commit**

```bash
vendor/bin/pint --dirty --format agent
git add app/Policies/ComentarioAulaPolicy.php app/Http/Requests/Comentarios app/Http/Controllers/ComentarioAulaController.php routes/web.php tests/Feature/Comentarios
git commit -m "feat(comentarios): CRUD com replies, edicao e moderacao"
```

---

## Task 16: Expor XP/nível no Inertia + atualizar Dashboard e Cursos/Show

**Files:**
- Modify: `app/Http/Middleware/HandleInertiaRequests.php`
- Modify: `app/Http/Controllers/DashboardController.php`
- Modify: `app/Http/Controllers/CursoController.php`

- [ ] **Step 1: Expor `xp_total` e `nivel_atual` no shared `auth.user`**

Em `HandleInertiaRequests::share`, modificar o bloco `auth.user` para incluir, no fim do array:

```php
'xp_total' => (int) ($request->user()->perfilGamificado?->xp_total ?? 0),
'nivel_atual' => (int) ($request->user()->perfilGamificado?->nivel_atual ?? 1),
```

(Inertia carrega via closure preguiçosa, então o N+1 só vale quando autenticado.)

- [ ] **Step 2: Adicionar progresso por curso no `DashboardController`**

Substituir a montagem do array de matrículas para incluir `aulas_concluidas`:

```php
$matriculas = $request->user()
    ->matriculas()
    ->with(['curso.modulos.aulas:id,modulo_id,duracao_segundos'])
    ->latest('matriculado_em')
    ->get()
    ->map(function (Matricula $matricula) use ($request): array {
        $curso = $matricula->curso;
        $aulas = $curso->modulos->flatMap->aulas;
        $aulaIds = $aulas->pluck('id');

        $aulasConcluidas = \App\Models\ProgressoAula::query()
            ->where('usuario_id', $request->user()->id)
            ->whereIn('aula_id', $aulaIds)
            ->whereNotNull('concluido_em')
            ->count();

        return [
            'public_id' => $curso->public_id,
            'titulo' => $curso->titulo,
            'url_capa' => $curso->url_capa,
            'channel' => $curso->youtube_channel_title,
            'total_aulas' => $aulas->count(),
            'aulas_concluidas' => $aulasConcluidas,
            'duracao_total_segundos' => (int) $aulas->sum('duracao_segundos'),
            'matriculado_em' => $matricula->matriculado_em?->toIso8601String(),
            'concluido_em' => $matricula->concluido_em?->toIso8601String(),
        ];
    });
```

- [ ] **Step 3: Adicionar status por aula no `CursoController@show`**

Antes do `return Inertia::render` em `show()`, calcular conjunto de aulas concluídas/em-andamento (quando autenticado e matriculado):

```php
$progressosPorAula = collect();
if ($user && $matriculado) {
    $progressosPorAula = \App\Models\ProgressoAula::query()
        ->where('usuario_id', $user->id)
        ->whereIn('aula_id', $curso->modulos->flatMap->aulas->pluck('id'))
        ->get()
        ->keyBy('aula_id');
}

$modulos = $curso->modulos->map(fn (Modulo $modulo): array => [
    'public_id' => $modulo->public_id,
    'titulo' => $modulo->titulo,
    'ordem' => $modulo->ordem,
    'aulas' => $modulo->aulas->map(fn (Aula $aula): array => [
        'public_id' => $aula->public_id,
        'titulo' => $aula->titulo,
        'tipo_aula' => $aula->tipo_aula->value,
        'duracao_segundos' => (int) $aula->duracao_segundos,
        'ordem' => $aula->ordem,
        'youtube_video_id' => $aula->youtube_video_id,
        'concluida' => $progressosPorAula->get($aula->id)?->concluido_em !== null,
        'em_andamento' => $progressosPorAula->get($aula->id)
            && $progressosPorAula->get($aula->id)->concluido_em === null
            && $progressosPorAula->get($aula->id)->posicao_segundos > 0,
    ])->values(),
])->values();
```

(Os campos `concluida` e `em_andamento` serão `false` para guests e não-matriculados — comportamento aceitável.)

- [ ] **Step 4: Rodar suite full pra garantir que nada quebrou**

```bash
./vendor/bin/pest --compact
```

Esperado: tudo verde (testes existentes continuam passando; `InertiaSharedDataTest` pode precisar de ajuste se asserta forma do `auth.user` — se falhar, atualizar o asserto para incluir os novos campos).

- [ ] **Step 5: Lint + commit**

```bash
vendor/bin/pint --dirty --format agent
git add app/Http/Middleware/HandleInertiaRequests.php app/Http/Controllers/DashboardController.php app/Http/Controllers/CursoController.php
git commit -m "feat(progresso): expoe XP/nivel no shared + progresso por curso"
```

---

## Task 17: Tipos TypeScript

**Files:**
- Modify: `resources/js/types/index.d.ts`

- [ ] **Step 1: Atualizar `User` e adicionar types da página Assistir + comentários**

No `User`, adicionar:

```ts
xp_total: number
nivel_atual: number
```

Adicionar no final do arquivo:

```ts
export interface AulaStatus extends AulaItem {
    concluida: boolean
    em_andamento: boolean
}

export interface ModuloComStatus {
    public_id: string
    titulo: string
    ordem: number
    aulas: AulaStatus[]
}

export interface AulaAtual {
    public_id: string
    titulo: string
    tipo_aula: TipoAula
    conteudo: string | null
    duracao_segundos: number
    ordem: number
    youtube_video_id: string | null
    xp: number
    posicao_segundos: number
    concluida: boolean
}

export interface AutorComentario {
    public_id: string
    name: string
}

export interface RespostaComentario {
    public_id: string
    conteudo: string
    foi_editado: boolean
    created_at: string
    autor: AutorComentario
    is_owner: boolean
}

export interface Comentario extends RespostaComentario {
    respostas: RespostaComentario[]
}

export interface MeuCursoItemComProgresso extends MeuCursoItem {
    aulas_concluidas: number
}
```

- [ ] **Step 2: Commit**

```bash
git add resources/js/types/index.d.ts
git commit -m "feat(types): tipos para Assistir, comentarios e XP/nivel"
```

---

## Task 18: Hook `useYouTubePlayer`

**Files:**
- Create: `resources/js/hooks/useYouTubePlayer.ts`

- [ ] **Step 1: Implementar hook**

```bash
mkdir -p resources/js/hooks
```

Conteúdo:

```ts
import { useEffect, useRef } from 'react'

interface YTPlayer {
    seekTo: (seconds: number, allowSeekAhead: boolean) => void
    getCurrentTime: () => number
    getDuration: () => number
    destroy: () => void
}

interface UseYouTubePlayerOptions {
    videoId: string
    startSeconds: number
    onTick: (currentSeconds: number, durationSeconds: number) => void
    onEnded: () => void
}

declare global {
    interface Window {
        YT?: {
            Player: new (el: HTMLElement, config: Record<string, unknown>) => YTPlayer
            PlayerState: { PLAYING: number; PAUSED: number; ENDED: number }
        }
        onYouTubeIframeAPIReady?: () => void
    }
}

let apiPromise: Promise<void> | null = null

function loadYouTubeIframeApi(): Promise<void> {
    if (apiPromise) return apiPromise
    apiPromise = new Promise((resolve) => {
        if (window.YT && window.YT.Player) {
            resolve()
            return
        }
        const previous = window.onYouTubeIframeAPIReady
        window.onYouTubeIframeAPIReady = () => {
            previous?.()
            resolve()
        }
        const tag = document.createElement('script')
        tag.src = 'https://www.youtube.com/iframe_api'
        document.head.appendChild(tag)
    })
    return apiPromise
}

export function useYouTubePlayer(
    containerRef: React.RefObject<HTMLDivElement | null>,
    { videoId, startSeconds, onTick, onEnded }: UseYouTubePlayerOptions,
): void {
    const playerRef = useRef<YTPlayer | null>(null)
    const intervalRef = useRef<number | null>(null)

    useEffect(() => {
        let cancelled = false

        loadYouTubeIframeApi().then(() => {
            if (cancelled || !containerRef.current || !window.YT) return

            playerRef.current = new window.YT.Player(containerRef.current, {
                videoId,
                playerVars: { rel: 0, modestbranding: 1, start: Math.max(0, Math.floor(startSeconds)) },
                events: {
                    onReady: () => {
                        if (startSeconds > 5) {
                            playerRef.current?.seekTo(startSeconds, true)
                        }
                    },
                    onStateChange: (e: { data: number }) => {
                        const yt = window.YT!
                        const player = playerRef.current
                        if (!player) return

                        if (e.data === yt.PlayerState.PLAYING) {
                            if (intervalRef.current) window.clearInterval(intervalRef.current)
                            intervalRef.current = window.setInterval(() => {
                                onTick(player.getCurrentTime(), player.getDuration())
                            }, 10000)
                        } else {
                            if (intervalRef.current) {
                                window.clearInterval(intervalRef.current)
                                intervalRef.current = null
                            }
                            onTick(player.getCurrentTime(), player.getDuration())
                            if (e.data === yt.PlayerState.ENDED) onEnded()
                        }
                    },
                },
            })
        })

        return () => {
            cancelled = true
            if (intervalRef.current) window.clearInterval(intervalRef.current)
            playerRef.current?.destroy()
            playerRef.current = null
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [videoId])
}
```

- [ ] **Step 2: Commit**

```bash
git add resources/js/hooks/useYouTubePlayer.ts
git commit -m "feat(player): hook useYouTubePlayer com heartbeat e ended"
```

---

## Task 19: Componente `Comentarios`

**Files:**
- Create: `resources/js/components/Comentarios/Comentarios.tsx`

- [ ] **Step 1: Implementar**

```bash
mkdir -p resources/js/components/Comentarios
```

Conteúdo:

```tsx
import { useState } from 'react'
import { router } from '@inertiajs/react'
import type { Comentario, RespostaComentario } from '@/types'

interface Props {
    aulaPublicId: string
    comentarios: Comentario[]
}

function formatarData(iso: string): string {
    const d = new Date(iso)
    return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

function ComentarioItem({
    comentario,
    aulaPublicId,
    permitirResponder,
}: {
    comentario: Comentario | RespostaComentario
    aulaPublicId: string
    permitirResponder: boolean
}) {
    const [editando, setEditando] = useState(false)
    const [respondendo, setRespondendo] = useState(false)
    const [textoEdit, setTextoEdit] = useState(comentario.conteudo)
    const [textoResp, setTextoResp] = useState('')
    const respostas = 'respostas' in comentario ? comentario.respostas : []

    const salvarEdicao = () => {
        router.put(
            route('comentarios.update', comentario.public_id),
            { conteudo: textoEdit },
            { preserveScroll: true, onSuccess: () => setEditando(false) },
        )
    }

    const excluir = () => {
        if (!confirm('Excluir este comentario?')) return
        router.delete(route('comentarios.destroy', comentario.public_id), { preserveScroll: true })
    }

    const enviarResposta = () => {
        router.post(
            route('aulas.comentarios.store', aulaPublicId),
            { conteudo: textoResp, comentario_pai_id: comentario.public_id },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setTextoResp('')
                    setRespondendo(false)
                },
            },
        )
    }

    return (
        <li className="py-4">
            <div className="flex items-baseline gap-2">
                <span className="text-[#f1f1f1] font-medium text-sm">{comentario.autor.name}</span>
                <span className="text-[#5a5a5a] text-xs">{formatarData(comentario.created_at)}</span>
                {comentario.foi_editado && <span className="text-[#5a5a5a] text-xs">(editado)</span>}
            </div>

            {editando ? (
                <div className="mt-2">
                    <textarea
                        value={textoEdit}
                        onChange={(e) => setTextoEdit(e.target.value)}
                        rows={3}
                        maxLength={2000}
                        className="w-full bg-[#0d1016] border border-[#1e2430] rounded-md p-3 text-sm text-[#f1f1f1] focus:outline-none focus:border-[#3a4250]"
                    />
                    <div className="flex gap-2 mt-2">
                        <button onClick={salvarEdicao} className="px-3 py-1.5 rounded bg-[#E50914] text-white text-xs font-semibold">Salvar</button>
                        <button onClick={() => setEditando(false)} className="px-3 py-1.5 rounded border border-[#1e2430] text-xs text-[#b0b0b0]">Cancelar</button>
                    </div>
                </div>
            ) : (
                <p className="text-[#b0b0b0] text-sm mt-1 whitespace-pre-wrap">{comentario.conteudo}</p>
            )}

            <div className="flex gap-3 mt-2 text-xs text-[#8a8a8a]">
                {permitirResponder && (
                    <button onClick={() => setRespondendo((v) => !v)} className="hover:text-[#f1f1f1]">Responder</button>
                )}
                {comentario.is_owner && !editando && (
                    <>
                        <button onClick={() => setEditando(true)} className="hover:text-[#f1f1f1]">Editar</button>
                        <button onClick={excluir} className="hover:text-[#E50914]">Excluir</button>
                    </>
                )}
                {!comentario.is_owner && (
                    <button onClick={excluir} className="hover:text-[#E50914] hidden" aria-hidden />
                )}
            </div>

            {respondendo && (
                <div className="mt-3 ml-4">
                    <textarea
                        value={textoResp}
                        onChange={(e) => setTextoResp(e.target.value)}
                        rows={2}
                        maxLength={2000}
                        placeholder="Sua resposta..."
                        className="w-full bg-[#0d1016] border border-[#1e2430] rounded-md p-3 text-sm text-[#f1f1f1] focus:outline-none focus:border-[#3a4250]"
                    />
                    <div className="flex gap-2 mt-2">
                        <button onClick={enviarResposta} disabled={!textoResp.trim()} className="px-3 py-1.5 rounded bg-[#E50914] text-white text-xs font-semibold disabled:opacity-40">Responder</button>
                        <button onClick={() => setRespondendo(false)} className="px-3 py-1.5 rounded border border-[#1e2430] text-xs text-[#b0b0b0]">Cancelar</button>
                    </div>
                </div>
            )}

            {respostas.length > 0 && (
                <ul className="mt-3 ml-6 border-l border-[#1e2430] pl-4 divide-y divide-[#1e2430]">
                    {respostas.map((r) => (
                        <ComentarioItem key={r.public_id} comentario={r} aulaPublicId={aulaPublicId} permitirResponder={false} />
                    ))}
                </ul>
            )}
        </li>
    )
}

export default function Comentarios({ aulaPublicId, comentarios }: Props) {
    const [texto, setTexto] = useState('')

    const enviar = () => {
        router.post(
            route('aulas.comentarios.store', aulaPublicId),
            { conteudo: texto },
            { preserveScroll: true, onSuccess: () => setTexto('') },
        )
    }

    const total = comentarios.reduce((acc, c) => acc + 1 + c.respostas.length, 0)

    return (
        <section className="mt-10">
            <h2 className="text-sm font-semibold text-[#f1f1f1] mb-4">
                Comentarios <span className="text-[#5a5a5a] font-normal">· {total}</span>
            </h2>

            <div className="bg-[#12151b] border border-[#1e2430] rounded-xl p-4 mb-6">
                <textarea
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    rows={3}
                    maxLength={2000}
                    placeholder="Escreva um comentario..."
                    className="w-full bg-transparent text-sm text-[#f1f1f1] placeholder:text-[#5a5a5a] focus:outline-none resize-none"
                />
                <div className="flex justify-end mt-2">
                    <button
                        onClick={enviar}
                        disabled={!texto.trim()}
                        className="px-4 py-2 rounded-lg bg-[#E50914] hover:bg-[#c20710] text-white text-xs font-semibold disabled:opacity-40"
                    >
                        Comentar
                    </button>
                </div>
            </div>

            {comentarios.length === 0 ? (
                <p className="text-[#8a8a8a] text-sm">Seja o primeiro a comentar.</p>
            ) : (
                <ul className="divide-y divide-[#1e2430]">
                    {comentarios.map((c) => (
                        <ComentarioItem key={c.public_id} comentario={c} aulaPublicId={aulaPublicId} permitirResponder={true} />
                    ))}
                </ul>
            )}
        </section>
    )
}
```

- [ ] **Step 2: Commit**

```bash
git add resources/js/components/Comentarios
git commit -m "feat(comentarios): componente com replies, edicao e delete"
```

---

## Task 20: Página `Cursos/Assistir.tsx`

**Files:**
- Modify: `resources/js/pages/Cursos/Assistir.tsx` (substituir stub)

- [ ] **Step 1: Implementar página completa**

Substituir o stub:

```tsx
import { useEffect, useRef, useState } from 'react'
import { Head, Link, router, usePage } from '@inertiajs/react'
import AppLayout from '@/layouts/AppLayout'
import Comentarios from '@/components/Comentarios/Comentarios'
import { useYouTubePlayer } from '@/hooks/useYouTubePlayer'
import type { AulaAtual, Comentario, ModuloComStatus, PageProps, TipoAula } from '@/types'

interface Props extends PageProps {
    curso: { public_id: string; titulo: string }
    modulos: ModuloComStatus[]
    aulaAtual: AulaAtual
    proximaAula: { public_id: string } | null
    comentarios: Comentario[]
}

function formatDuration(s: number): string {
    if (s <= 0) return '—'
    const m = Math.floor(s / 60)
    const r = s % 60
    if (m === 0) return `${r}s`
    return `${m}min`
}

function StatusIcon({ concluida, emAndamento }: { concluida: boolean; emAndamento: boolean }) {
    if (concluida) {
        return (
            <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        )
    }
    if (emAndamento) {
        return <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
    }
    return <span className="w-2 h-2 rounded-full border border-[#3a4250] inline-block" />
}

export default function CursosAssistir() {
    const { curso, modulos, aulaAtual, proximaAula, comentarios } = usePage<Props>().props

    const playerContainerRef = useRef<HTMLDivElement | null>(null)
    const [concluida, setConcluida] = useState(aulaAtual.concluida)
    const concluidaRef = useRef(concluida)
    useEffect(() => {
        concluidaRef.current = concluida
    }, [concluida])

    const enviarHeartbeat = (segundos: number) => {
        const csrf = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? ''
        fetch(route('aulas.progresso', aulaAtual.public_id), {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrf,
                'X-Requested-With': 'XMLHttpRequest',
                Accept: 'application/json',
            },
            body: JSON.stringify({ posicao_segundos: Math.floor(segundos) }),
        }).catch(() => {})
    }

    const concluir = () => {
        if (concluidaRef.current) return
        concluidaRef.current = true
        router.post(
            route('aulas.concluir', aulaAtual.public_id),
            {},
            { preserveScroll: true, onSuccess: () => setConcluida(true) },
        )
    }

    useYouTubePlayer(playerContainerRef, {
        videoId: aulaAtual.youtube_video_id ?? '',
        startSeconds: aulaAtual.posicao_segundos,
        onTick: (cur, dur) => {
            if (cur > 0) enviarHeartbeat(cur)
            if (dur > 0 && cur / dur >= 0.9) concluir()
        },
        onEnded: () => concluir(),
    })

    const podePlayer = aulaAtual.tipo_aula === 'video' && !!aulaAtual.youtube_video_id

    return (
        <AppLayout>
            <Head title={`${aulaAtual.titulo} · ${curso.titulo}`} />

            <div className="min-h-screen bg-[#0d1016] text-[#f1f1f1]">
                <div className="max-w-[1600px] mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
                    <div>
                        <Link
                            href={route('cursos.show', curso.public_id)}
                            className="inline-flex items-center gap-1.5 text-xs text-[#8a8a8a] hover:text-[#f1f1f1] mb-4"
                        >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            {curso.titulo}
                        </Link>

                        {podePlayer ? (
                            <div className="aspect-video bg-black rounded-xl overflow-hidden">
                                <div ref={playerContainerRef} className="w-full h-full" />
                            </div>
                        ) : aulaAtual.tipo_aula === 'video' ? (
                            <div className="aspect-video bg-[#12151b] border border-[#1e2430] rounded-xl flex items-center justify-center text-[#8a8a8a]">
                                Video indisponivel
                            </div>
                        ) : (
                            <div className="bg-[#12151b] border border-[#1e2430] rounded-xl p-8 whitespace-pre-wrap text-[#f1f1f1]">
                                {aulaAtual.conteudo ?? 'Sem conteudo.'}
                            </div>
                        )}

                        <div className="mt-6">
                            <h1 className="text-xl font-semibold">{aulaAtual.titulo}</h1>
                            <p className="text-xs text-[#8a8a8a] mt-1">
                                {formatDuration(aulaAtual.duracao_segundos)} · vale {aulaAtual.xp} XP
                            </p>

                            <div className="flex items-center gap-3 mt-5">
                                {!concluida && (
                                    <button
                                        onClick={concluir}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold hover:bg-emerald-500/20"
                                    >
                                        ✓ Marcar como concluida
                                    </button>
                                )}
                                {concluida && (
                                    <span className="inline-flex items-center gap-2 text-emerald-400 text-sm font-medium">✓ Concluida</span>
                                )}
                                {proximaAula && (
                                    <Link
                                        href={route('cursos.assistir', [curso.public_id, proximaAula.public_id])}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#E50914] hover:bg-[#c20710] text-white text-sm font-semibold"
                                    >
                                        Proxima aula →
                                    </Link>
                                )}
                            </div>
                        </div>

                        <Comentarios aulaPublicId={aulaAtual.public_id} comentarios={comentarios} />
                    </div>

                    <aside className="bg-[#12151b] border border-[#1e2430] rounded-xl p-4 h-fit lg:sticky lg:top-6">
                        <h2 className="text-xs uppercase tracking-[0.18em] text-[#8a8a8a] mb-4">Conteudo do curso</h2>
                        <div className="space-y-5">
                            {modulos.map((m) => (
                                <div key={m.public_id}>
                                    <h3 className="text-xs font-semibold text-[#f1f1f1] mb-2">
                                        <span className="text-[#5a5a5a] tabular-nums mr-2">{String(m.ordem).padStart(2, '0')}</span>
                                        {m.titulo}
                                    </h3>
                                    <ul className="space-y-0.5">
                                        {m.aulas.map((a) => {
                                            const atual = a.public_id === aulaAtual.public_id
                                            return (
                                                <li key={a.public_id}>
                                                    {atual ? (
                                                        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded bg-[#1a1f28] text-[#f1f1f1] text-xs">
                                                            <StatusIcon concluida={a.concluida} emAndamento={a.em_andamento} />
                                                            <span className="flex-1 truncate">{a.titulo}</span>
                                                            <span className="text-[#5a5a5a]">{formatDuration(a.duracao_segundos)}</span>
                                                        </div>
                                                    ) : (
                                                        <Link
                                                            href={route('cursos.assistir', [curso.public_id, a.public_id])}
                                                            className="flex items-center gap-2.5 px-2.5 py-2 rounded text-xs text-[#b0b0b0] hover:bg-[#161a22] hover:text-[#f1f1f1]"
                                                        >
                                                            <StatusIcon concluida={a.concluida} emAndamento={a.em_andamento} />
                                                            <span className="flex-1 truncate">{a.titulo}</span>
                                                            <span className="text-[#5a5a5a]">{formatDuration(a.duracao_segundos)}</span>
                                                        </Link>
                                                    )}
                                                </li>
                                            )
                                        })}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </aside>
                </div>
            </div>
        </AppLayout>
    )
}
```

Função auxiliar `_tipoLabel` (definida acima) não é estritamente usada — pode remover se sobrar. Variável `_tipo` idem; manter o componente enxuto.

- [ ] **Step 2: Garantir que o CSRF está no `<head>` do `app.blade.php`**

```bash
grep -n 'csrf-token' resources/views/app.blade.php
```

Se não existir `<meta name="csrf-token" content="{{ csrf_token() }}">`, adicionar dentro de `<head>`. (Inertia + sessão exige CSRF para POSTs fora do helper Inertia, como o heartbeat.)

- [ ] **Step 3: Build + smoke test**

```bash
bun run build
```

(Se já estiver com `bun run dev` rodando, basta recarregar.)

Pedir ao usuário para abrir um curso onde está matriculado, ir em "Continuar assistindo", verificar:
- Vídeo carrega no segundo correto.
- Sidebar mostra ícones.
- Aos 90% (ou no fim), badge muda para "Concluida" e flash com XP aparece.
- Clicar em outra aula navega.

- [ ] **Step 4: Commit**

```bash
git add resources/js/pages/Cursos/Assistir.tsx resources/views/app.blade.php
git commit -m "feat(assistir): pagina completa com player, sidebar e comentarios"
```

---

## Task 21: Atualizar `Cursos/Show.tsx` (CTA Continuar + ícones de status)

**Files:**
- Modify: `resources/js/pages/Cursos/Show.tsx`

- [ ] **Step 1: Atualizar tipo do `ModuloItem` usado na página**

Trocar import de `ModuloItem` por `ModuloComStatus` (definido na Task 17):

```tsx
import type { CursoDetail, ModuloComStatus, PageProps, TipoAula } from '@/types'
```

E props:

```tsx
interface Props extends PageProps {
    curso: CursoDetail
    modulos: ModuloComStatus[]
    matriculado: boolean | null
}
```

- [ ] **Step 2: Substituir bloco "matriculado === true" pelo CTA**

```tsx
{matriculado === true && (
    <Link
        href={route('cursos.assistir', curso.public_id)}
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#E50914] hover:bg-[#c20710] text-white text-sm font-semibold transition-colors"
    >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><polygon points="6,4 20,12 6,20" /></svg>
        {modulos.some((m) => m.aulas.some((a) => a.concluida || a.em_andamento)) ? 'Continuar assistindo' : 'Comecar curso'}
    </Link>
)}
```

- [ ] **Step 3: Na lista de aulas (`modulo.aulas.map`), trocar o ícone do `TipoIcon` pelo status quando disponível**

Substituir o `<span>` do `TipoIcon` por um wrapper que prioriza status (apenas quando `matriculado`):

```tsx
<span className="text-[#8a8a8a]" aria-label={tipoLabel(aula.tipo_aula)}>
    {matriculado && aula.concluida ? (
        <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ) : matriculado && aula.em_andamento ? (
        <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
    ) : (
        <TipoIcon tipo={aula.tipo_aula} />
    )}
</span>
```

- [ ] **Step 4: Build + smoke test**

```bash
bun run build
```

Verificar na página do curso (matriculado): CTA correto, ícones ✓/● aparecem para aulas concluídas/em andamento.

- [ ] **Step 5: Commit**

```bash
git add resources/js/pages/Cursos/Show.tsx
git commit -m "feat(cursos/show): CTA continuar assistindo + status por aula"
```

---

## Task 22: Atualizar `Dashboard.tsx` (XP/nível + progresso)

**Files:**
- Modify: `resources/js/pages/Dashboard.tsx`

- [ ] **Step 1: Ler a página atual e localizar o header e a lista de cursos**

```bash
cat resources/js/pages/Dashboard.tsx | head -120
```

- [ ] **Step 2: Adicionar bloco de XP no header**

Adicionar próximo ao título da página um card destacando XP:

```tsx
const { auth, meusCursos } = usePage<Props>().props
// ...
{auth.user && (
    <div className="flex items-center gap-6 mb-8 p-4 rounded-xl bg-[#12151b] border border-[#1e2430]">
        <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#8a8a8a]">XP total</p>
            <p className="text-2xl font-bold text-[#f1f1f1] tabular-nums">{auth.user.xp_total.toLocaleString('pt-BR')}</p>
        </div>
        <div className="w-px h-10 bg-[#1e2430]" />
        <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#8a8a8a]">Nivel</p>
            <p className="text-2xl font-bold text-[#f1f1f1] tabular-nums">{auth.user.nivel_atual}</p>
        </div>
    </div>
)}
```

(Atualizar a tipagem `Props` para usar `MeuCursoItemComProgresso[]`.)

- [ ] **Step 3: Adicionar barra de progresso e CTA "Continuar" em cada card de curso**

Para cada `meusCursos[i]`, adicionar no card:

```tsx
{(() => {
    const pct = curso.total_aulas > 0 ? Math.round((curso.aulas_concluidas / curso.total_aulas) * 100) : 0
    return (
        <>
            <div className="flex items-center justify-between text-xs text-[#8a8a8a] mt-3 mb-1">
                <span>{curso.aulas_concluidas} de {curso.total_aulas} aulas</span>
                <span className="tabular-nums">{pct}%</span>
            </div>
            <div className="h-1 bg-[#1e2430] rounded-full overflow-hidden">
                <div className="h-full bg-[#E50914]" style={{ width: `${pct}%` }} />
            </div>
            <Link
                href={route('cursos.assistir', curso.public_id)}
                className="mt-3 inline-flex items-center justify-center w-full px-4 py-2 rounded-lg bg-[#E50914] hover:bg-[#c20710] text-white text-xs font-semibold"
            >
                {curso.aulas_concluidas > 0 ? 'Continuar' : 'Comecar'}
            </Link>
        </>
    )
})()}
```

(Posicionar o bloco no local apropriado dentro do card existente — ajustar a estética para combinar com o restante da página.)

- [ ] **Step 4: Build + smoke test**

```bash
bun run build
```

Abrir `/dashboard` autenticado: XP/nível aparecem, cada curso tem barra de progresso e CTA.

- [ ] **Step 5: Commit**

```bash
git add resources/js/pages/Dashboard.tsx
git commit -m "feat(dashboard): bloco XP/nivel e barra de progresso por curso"
```

---

## Task 23: Suite completa + smoke manual

- [ ] **Step 1: Rodar toda a suite**

```bash
./vendor/bin/pest --compact
```

Esperado: tudo verde. Se houver falha no `InertiaSharedDataTest` por causa dos novos campos `xp_total/nivel_atual`, atualizar o asserto.

- [ ] **Step 2: Build de produção**

```bash
bun run build
```

- [ ] **Step 3: Smoke test manual (com o usuário)**

Checklist:
- Login como aluno matriculado em um curso.
- `/cursos/{x}/assistir` → redireciona para primeira aula.
- Vídeo do YouTube carrega; reproduzir 12s; recarregar; vídeo retoma em ~10s (após o primeiro heartbeat).
- Pular para 90% do vídeo: aula vira "Concluida", flash "+X XP" aparece.
- Clicar "Próxima aula" navega.
- Clicar "Marcar como concluída" numa aula `texto`: marca como concluída.
- Sidebar mostra ✓/●/○ corretos após F5.
- Criar comentário, responder a ele, editar a resposta, excluir o pai → resposta some.
- Login como admin: pode deletar comentário de outro.
- `/dashboard`: XP/nível e barra de progresso refletem o que foi feito.

- [ ] **Step 4: Commit final (se algum ajuste fino de UI)**

```bash
git add -A
git commit -m "chore: ajustes finais pos smoke test"
```

---

## Checklist de cobertura da spec

| Spec item | Task |
|---|---|
| Rota `/cursos/{curso}/assistir/{aula?}` | 13 |
| Endpoint heartbeat | 14 |
| Endpoint conclusão idempotente | 14 (controller) + 9 (action) |
| Middleware `matriculado` / `matriculado.aula` | 11 |
| Migration de retomada | 1 |
| Models (Progresso, HistoricoXP, Perfil, Comentario, User relations) | 2–6 |
| Factories | 7 |
| Actions CreditarXP / ConcluirAula / AtualizarProgressoAula | 8–10 |
| Página Assistir + player + sidebar | 18 + 20 |
| Comentários CRUD + replies + edição + delete + admin | 15 + 19 |
| Status nas aulas do Cursos/Show + CTA continuar | 16 + 21 |
| Dashboard XP/nível + progresso | 16 + 22 |
| Tipos TS | 17 |
| Hook YouTube IFrame | 18 |
| Testes (5 arquivos) | 9, 10, 12, 13, 15 |
| Smoke manual | 23 |
