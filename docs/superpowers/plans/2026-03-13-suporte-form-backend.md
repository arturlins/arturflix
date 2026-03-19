# Suporte Form Backend Integration Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the existing support contact form to persist submissions to `chamados_suportes` and show a flash success message.

**Architecture:** A `SuporteController` handles GET (render page) and POST (store chamado). A `StoreChamadoSuporteRequest` validates input. The frontend uses Inertia `useForm` to POST and reads `flash.success` (already shared globally via `HandleInertiaRequests`) to show the success banner.

**Tech Stack:** Laravel 12, PHP 8.4, Pest, Inertia.js, React/TypeScript, Tailwind CSS

---

## Chunk 1: Backend

### Task 1: Update `ChamadoSuporte` Model

**Files:**
- Modify: `app/Models/ChamadoSuporte.php`

- [ ] **Step 1: Write the model**

Replace the empty model with:

```php
<?php

namespace App\Models;

use App\Concerns\HasPublicId;
use Illuminate\Database\Eloquent\Model;

class ChamadoSuporte extends Model
{
    use HasPublicId;

    protected $table = 'chamados_suportes';

    protected $fillable = [
        'email_contato',
        'assunto',
        'mensagem',
    ];
}
```

- [ ] **Step 2: Run Pint**

```bash
vendor/bin/pint --dirty --format agent
```

---

### Task 2: Create `StoreChamadoSuporteRequest`

**Files:**
- Create: `app/Http/Requests/StoreChamadoSuporteRequest.php`

- [ ] **Step 1: Scaffold the Form Request**

```bash
php artisan make:request StoreChamadoSuporteRequest --no-interaction
```

- [ ] **Step 2: Fill in rules**

Edit the generated file so it reads:

```php
<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreChamadoSuporteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email_contato' => ['required', 'string', 'email', 'max:255'],
            'assunto'       => ['required', 'string', 'in:tecnico,cobranca,sugestao,outro'],
            'mensagem'      => ['required', 'string', 'min:10'],
        ];
    }
}
```

- [ ] **Step 3: Run Pint**

```bash
vendor/bin/pint --dirty --format agent
```

---

### Task 3: Create `SuporteController`

**Files:**
- Create: `app/Http/Controllers/SuporteController.php`

- [ ] **Step 1: Scaffold the controller**

```bash
php artisan make:controller SuporteController --no-interaction
```

- [ ] **Step 2: Add index and store methods**

```php
<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreChamadoSuporteRequest;
use App\Models\ChamadoSuporte;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SuporteController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Suporte/Index');
    }

    public function store(StoreChamadoSuporteRequest $request): RedirectResponse
    {
        ChamadoSuporte::create($request->validated());

        return redirect()->route('suporte.index')
            ->with('success', 'Mensagem enviada! Retornaremos em até 24 horas úteis.');
    }
}
```

- [ ] **Step 3: Run Pint**

```bash
vendor/bin/pint --dirty --format agent
```

---

### Task 4: Update Routes

**Files:**
- Modify: `routes/web.php`

- [ ] **Step 1: Replace the GET closure and add POST route**

Add the import at the top of the file alongside the other `use` statements:
```php
use App\Http\Controllers\SuporteController;
```

Replace:
```php
Route::get('/suporte', fn () => Inertia::render('Suporte/Index'))->name('suporte.index');
```

With both routes (GET and POST):
```php
Route::get('/suporte', [SuporteController::class, 'index'])->name('suporte.index');
Route::post('/suporte', [SuporteController::class, 'store'])->name('suporte.store')->middleware('throttle:10,1');
```

- [ ] **Step 2: Run Pint**

```bash
vendor/bin/pint --dirty --format agent
```

- [ ] **Step 3: Verify routes exist**

```bash
php artisan route:list --name=suporte
```

Expected output shows two routes: `suporte.index` (GET /suporte) and `suporte.store` (POST /suporte).

---

### Task 5: Write Feature Tests

**Files:**
- Create: `tests/Feature/SuporteTest.php`

- [ ] **Step 1: Scaffold the test**

```bash
php artisan make:test SuporteTest --no-interaction
```

- [ ] **Step 2: Convert to Pest and write tests**

Replace the generated file content with:

```php
<?php

use App\Models\ChamadoSuporte;

it('renders the suporte page', function (): void {
    $response = $this->get(route('suporte.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->component('Suporte/Index'));
});

it('stores a chamado and redirects with flash', function (): void {
    $response = $this->post(route('suporte.store'), [
        'email_contato' => 'user@example.com',
        'assunto'       => 'tecnico',
        'mensagem'      => 'Preciso de ajuda com o sistema.',
    ]);

    $response->assertRedirect(route('suporte.index'));
    $response->assertSessionHas('success');

    $this->assertDatabaseHas('chamados_suportes', [
        'email_contato' => 'user@example.com',
        'assunto'       => 'tecnico',
        'mensagem'      => 'Preciso de ajuda com o sistema.',
        'status'        => 'novo',
    ]);
});

it('rejects invalid email', function (): void {
    $response = $this->post(route('suporte.store'), [
        'email_contato' => 'not-an-email',
        'assunto'       => 'tecnico',
        'mensagem'      => 'Mensagem válida aqui.',
    ]);

    $response->assertSessionHasErrors('email_contato');
    $this->assertDatabaseCount('chamados_suportes', 0);
});

it('rejects unknown assunto', function (): void {
    $response = $this->post(route('suporte.store'), [
        'email_contato' => 'user@example.com',
        'assunto'       => 'invalido',
        'mensagem'      => 'Mensagem válida aqui.',
    ]);

    $response->assertSessionHasErrors('assunto');
    $this->assertDatabaseCount('chamados_suportes', 0);
});

it('rejects mensagem shorter than 10 chars', function (): void {
    $response = $this->post(route('suporte.store'), [
        'email_contato' => 'user@example.com',
        'assunto'       => 'outro',
        'mensagem'      => 'Curta.',
    ]);

    $response->assertSessionHasErrors('mensagem');
    $this->assertDatabaseCount('chamados_suportes', 0);
});

it('generates a public_id on creation', function (): void {
    $this->post(route('suporte.store'), [
        'email_contato' => 'user@example.com',
        'assunto'       => 'sugestao',
        'mensagem'      => 'Tenho uma sugestão de melhoria.',
    ]);

    $chamado = ChamadoSuporte::first();
    expect($chamado->public_id)->not->toBeNull();
});

it('throttles after 10 requests per minute', function (): void {
    $payload = [
        'email_contato' => 'user@example.com',
        'assunto'       => 'outro',
        'mensagem'      => 'Mensagem de teste para throttle.',
    ];

    for ($i = 0; $i < 10; $i++) {
        $this->post(route('suporte.store'), $payload)->assertRedirect();
    }

    $this->post(route('suporte.store'), $payload)->assertStatus(429);
});
```

- [ ] **Step 3: Run the tests**

```bash
./vendor/bin/pest tests/Feature/SuporteTest.php --compact
```

Expected: all 7 tests pass.

- [ ] **Step 4: Commit**

```bash
git add app/Models/ChamadoSuporte.php \
        app/Http/Requests/StoreChamadoSuporteRequest.php \
        app/Http/Controllers/SuporteController.php \
        routes/web.php \
        tests/Feature/SuporteTest.php
git commit -m "feat: wire suporte form to database with controller and validation"
```

---

## Chunk 2: Frontend

### Task 6: Update `Suporte/Index.tsx`

**Files:**
- Modify: `resources/js/Pages/Suporte/Index.tsx`

Field mapping from old form to new:
- `email` → `email_contato`
- `subject` → `assunto`
- `message` → `mensagem`
- `name` field is **removed entirely**

- [ ] **Step 1: Replace the component**

Rewrite the file:

```tsx
import { Head, useForm, usePage } from '@inertiajs/react'
import GuestLayout from '@/layouts/GuestLayout'
import { PageProps } from '@/types'

type FormFields = {
    email_contato: string
    assunto: string
    mensagem: string
}

export default function SuporteIndex() {
    const { flash } = usePage<PageProps>().props
    const { data, setData, post, processing, errors } = useForm<FormFields>({
        email_contato: '',
        assunto: '',
        mensagem: '',
    })

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        post(route('suporte.store'))
    }

    const inputClass = (field: keyof FormFields) =>
        `w-full bg-[#171b23] border rounded-lg px-3 py-2.5 text-sm text-[#f1f1f1] placeholder:text-[#555] focus:outline-none transition-colors ${
            errors[field]
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

                <section className="max-w-xl">
                    <h2 className="text-[#f1f1f1] text-2xl font-bold mb-6">Enviar mensagem</h2>

                    {flash.success ? (
                        <div className="bg-green-950/40 border border-green-900/50 rounded-xl p-6 text-center">
                            <span className="text-3xl mb-3 block">✅</span>
                            <p className="text-green-400 font-medium">Mensagem enviada!</p>
                            <p className="text-[#8a8a8a] text-sm mt-1">{flash.success}</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} noValidate className="space-y-4">
                            <div>
                                <label htmlFor="email_contato" className="block text-sm text-[#f1f1f1] mb-1.5">
                                    E-mail <span className="text-[#E50914]">*</span>
                                </label>
                                <input
                                    id="email_contato"
                                    type="email"
                                    value={data.email_contato}
                                    onChange={(e) => setData('email_contato', e.target.value)}
                                    placeholder="seu@email.com"
                                    required
                                    className={inputClass('email_contato')}
                                />
                                {errors.email_contato && (
                                    <span className="text-red-400 text-xs mt-1 block">{errors.email_contato}</span>
                                )}
                            </div>

                            <div>
                                <label htmlFor="assunto" className="block text-sm text-[#f1f1f1] mb-1.5">
                                    Assunto <span className="text-[#E50914]">*</span>
                                </label>
                                <select
                                    id="assunto"
                                    value={data.assunto}
                                    onChange={(e) => setData('assunto', e.target.value)}
                                    required
                                    className={inputClass('assunto')}
                                >
                                    <option value="">Selecione um assunto</option>
                                    <option value="tecnico">Dúvida técnica</option>
                                    <option value="cobranca">Cobrança</option>
                                    <option value="sugestao">Sugestão</option>
                                    <option value="outro">Outro</option>
                                </select>
                                {errors.assunto && (
                                    <span className="text-red-400 text-xs mt-1 block">{errors.assunto}</span>
                                )}
                            </div>

                            <div>
                                <label htmlFor="mensagem" className="block text-sm text-[#f1f1f1] mb-1.5">
                                    Mensagem <span className="text-[#E50914]">*</span>
                                </label>
                                <textarea
                                    id="mensagem"
                                    rows={5}
                                    value={data.mensagem}
                                    onChange={(e) => setData('mensagem', e.target.value)}
                                    placeholder="Descreva sua dúvida ou problema..."
                                    required
                                    minLength={10}
                                    className={inputClass('mensagem')}
                                />
                                {errors.mensagem && (
                                    <span className="text-red-400 text-xs mt-1 block">{errors.mensagem}</span>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-[#E50914] hover:bg-[#c20710] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg text-sm transition-colors mt-2"
                            >
                                {processing ? 'Enviando...' : 'Enviar mensagem'}
                            </button>
                        </form>
                    )}
                </section>
            </div>
        </GuestLayout>
    )
}
```

- [ ] **Step 2: Build frontend assets**

```bash
npm run build
```

Expected: build completes without errors.

- [ ] **Step 3: Commit**

```bash
git add resources/js/Pages/Suporte/Index.tsx
git commit -m "feat: update suporte form to use Inertia useForm and display flash message"
```

---

## Verification

- [ ] Run the full test suite:

```bash
./vendor/bin/pest --compact
```

Expected: all existing + new tests pass, no regressions.
