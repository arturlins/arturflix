# Design: Migração para Projeto Fullstack Unificado com Inertia.js

**Data:** 2026-03-11
**Status:** Aprovado
**Contexto:** Projeto ArturFlix — plataforma de cursos online

---

## Contexto e Motivação

O projeto nasceu com frontend e backend separados:
- `arturflix-api` — Laravel 12 com Sanctum (API REST, tokens Bearer)
- `arturflix-web` — React + Vite (SPA, React Router, Zustand, Axios)

A separação criava fricção desnecessária: CORS, tokens JWT manuais, dois servidores de desenvolvimento, estado de autenticação duplicado. A decisão foi unificar tudo em um único projeto Laravel usando **Inertia.js**, eliminando a camada de API e conectando React diretamente ao Laravel via renderização server-driven.

> **Nota sobre terminologia:** O projeto resultante é um **projeto fullstack unificado** — não um monorepo no sentido técnico (que implicaria múltiplos pacotes com workspaces). É um único projeto Laravel que serve o frontend React via Inertia.js.

> **Contexto de desenvolvimento:** O projeto está em fase inicial de desenvolvimento, sem usuários em produção. A migração pode ser feita de forma direta (big-bang), sem necessidade de estratégia de rollback ou coexistência paralela.

---

## O que é Inertia.js

Inertia.js é uma biblioteca que age como "cola" entre o backend Laravel e o frontend React. Ele **não é um framework** — é um protocolo de comunicação que permite escrever controllers Laravel que retornam componentes React em vez de JSON.

### Como funciona

```
Browser ──── request HTTP ────► Laravel Router
                                      │
                                 Controller
                                      │
                          Inertia::render('Pages/Cursos', [
                              'cursos' => $cursos
                          ])
                                      │
                     HandleInertiaRequests (Middleware)
                     (injeta dados globais: auth.user, flash)
                                      │
                          React Page Component
                          recebe { cursos } como props
```

**Na primeira visita:** o servidor retorna HTML completo com o componente React hidratado.
**Nas navegações seguintes:** Inertia intercepta os cliques e faz requisições XHR, retornando apenas o componente + props em JSON — sem recarregar a página.

### O que muda na autenticação

| Antes (Sanctum token) | Depois (Inertia + sessão) |
|---|---|
| Login retorna token JSON | Login cria sessão no servidor |
| Token salvo no `localStorage` | Cookie de sessão gerenciado automaticamente |
| Axios envia `Authorization: Bearer ...` | Cookie enviado automaticamente em todo request |
| Zustand gerencia `user` no frontend | `usePage().props.auth.user` do Inertia |
| Rotas em `api.php` | Rotas em `web.php` |

### CSRF com Inertia

O Inertia.js lida com CSRF automaticamente. Ao fazer requests via `router.post()` ou `useForm`, o Inertia lê o cookie `XSRF-TOKEN` que o Laravel gera e o envia como header `X-XSRF-TOKEN` em cada request. O middleware `VerifyCsrfToken` do Laravel valida esse header normalmente — nenhuma configuração extra é necessária. O CSRF só seria um problema se fôssemos usar Axios manualmente, o que não faremos.

---

## Arquitetura Final

### Estrutura do `app/`

```
app/
├── Actions/          # Operações de negócio pontuais — um método handle()
├── Concerns/         # Traits reutilizáveis para Models
├── Enums/            # Enums PHP (já existe)
├── Http/
│   ├── Controllers/  # Controllers HTTP (já existe)
│   ├── Middleware/   # Middleware HTTP (já existe)
│   ├── Requests/     # Form Requests de validação (já existe)
│   └── Services/     # Serviços específicos de HTTP (transformação request/response)
├── Models/           # Eloquent Models (já existe)
├── Providers/        # Service Providers (já existe)
├── Queries/          # Query builders reutilizáveis encapsulando Eloquent
├── Services/         # Regras de negócio complexas, orquestra Actions
└── Traits/           # Traits PHP genéricos (não ligados a Models)
```

### Responsabilidade de cada camada

**`Actions/`**
Uma classe = uma operação atômica de negócio. Método `handle()` único. Sem lógica condicional complexa. Fácil de testar isoladamente.

```php
// app/Actions/MatricularUsuarioAction.php
class MatricularUsuarioAction
{
    public function handle(User $user, Curso $curso): Matricula
    {
        return Matricula::create([
            'user_id' => $user->id,
            'curso_id' => $curso->id,
        ]);
    }
}
```

**`Services/`**
Orquestra múltiplas Actions, contém regras de negócio que envolvem múltiplos modelos, verifica pré-requisitos, dispara eventos.

```php
// app/Services/MatriculaService.php
class MatriculaService
{
    public function __construct(
        private MatricularUsuarioAction $matricularAction,
        private EnviarEmailBoasVindasAction $emailAction,
    ) {}

    public function matricular(User $user, Curso $curso): Matricula
    {
        // verifica pré-requisitos, chama actions, dispara eventos
    }
}
```

**`Queries/`**
Encapsula queries Eloquent reutilizáveis e complexas. Evita repetição nos controllers e mantém os controllers enxutos.

```php
// app/Queries/CursosPublicadosQuery.php
class CursosPublicadosQuery
{
    public function get(): Collection
    {
        return Curso::query()
            ->where('publicado', true)
            ->with(['modulos', 'instrutor'])
            ->latest()
            ->get();
    }
}
```

**`Concerns/`**
Traits para Models com comportamentos reutilizáveis entre diferentes models.

```php
// app/Concerns/HasPublicId.php
trait HasPublicId
{
    protected static function bootHasPublicId(): void
    {
        static::creating(fn ($model) => $model->public_id = (string) Str::uuid());
    }
}
```

**`Traits/`**
Traits PHP genéricos não ligados a Models — podem ser usados em controllers, jobs, commands.

**`Http/Services/`**
Lógica específica da camada HTTP: formatação de responses, integração com serviços externos via HTTP, parsing de webhooks.

### Estrutura do `resources/js/`

```
resources/js/
├── components/       # Componentes React reutilizáveis
│   ├── course/
│   ├── layout/
│   └── ui/
├── layouts/          # Layouts Inertia
│   ├── AppLayout.tsx     # Layout autenticado (navbar, sidebar)
│   └── AuthLayout.tsx    # Layout de autenticação (centralizado)
├── pages/            # Uma página por rota (mapeadas pelo Inertia)
│   ├── Auth/
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   └── ...
│   ├── Cursos/
│   └── ...
├── lib/              # Utilitários (utils.ts, helpers)
├── types/            # TypeScript interfaces e tipos
│   └── index.d.ts    # Tipos globais Inertia (PageProps, User, etc.)
└── app.tsx           # Entry point — inicializa Inertia + React
```

### Dados compartilhados globalmente (HandleInertiaRequests)

O middleware `HandleInertiaRequests` injeta dados em **todas** as páginas via `share()`. O contrato de tipos global é definido em `resources/js/types/index.d.ts`:

```ts
// resources/js/types/index.d.ts
export interface User {
    id: number;
    public_id: string;
    name: string;
    email: string;
    papel: 'aluno' | 'admin' | 'superuser';
}

export interface PageProps {
    auth: {
        user: User | null;
    };
    flash: {
        success: string | null;
        error: string | null;
    };
}
```

No middleware PHP:

```php
// app/Http/Middleware/HandleInertiaRequests.php
public function share(Request $request): array
{
    return [
        ...parent::share($request),
        'auth' => [
            'user' => $request->user(),
        ],
        'flash' => [
            'success' => session('success'),
            'error' => session('error'),
        ],
    ];
}
```

### Vite e configuração de aliases

O `vite.config.ts` do Laravel usará os seguintes plugins:

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import laravel from 'laravel-vite-plugin'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
    plugins: [
        laravel({ input: 'resources/js/app.tsx', refresh: true }),
        react(),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'resources/js'),
        },
    },
})
```

O alias `@/` mapeia para `resources/js/` — mantendo os imports dos componentes migrados do `arturflix-web` funcionando sem alteração.

SSR (Server-Side Rendering) está **fora de escopo** nesta migração.

### Arquivos-chave gerados pelo Breeze + Inertia

| Arquivo | Papel |
|---|---|
| `app/Http/Middleware/HandleInertiaRequests.php` | Injeta dados globais (auth.user, flash) em todas as páginas |
| `resources/views/app.blade.php` | Único template Blade — contém `@inertia` que monta o React |
| `resources/js/app.tsx` | Entry point que inicializa o Inertia com React |
| `vite.config.ts` | Configurado com laravel-vite-plugin, React e Tailwind |
| `routes/web.php` | Todas as rotas (auth + app) |

### Comportamento de redirecionamento de autenticação

| Situação | Comportamento |
|---|---|
| Usuário não autenticado acessa rota protegida | Redirecionado para `/login` (middleware `auth`) |
| Usuário autenticado acessa `/login` ou `/register` | Redirecionado para `/dashboard` (middleware `guest`) |
| Login com credenciais inválidas | Retorna para `/login` com erros de validação no `$page.props.errors` |
| Login bem-sucedido | Redirecionado para `/dashboard` |
| Logout | Redirecionado para `/` |

---

## O que migra do `arturflix-web`

### Migra (adaptado)
- `src/components/` → `resources/js/components/`
- `src/pages/*.tsx` → `resources/js/pages/` (sem React Router, sem Axios, sem Zustand)
- `src/lib/utils.ts` → `resources/js/lib/utils.ts`
- Dependências: Tailwind, shadcn/ui, lucide-react, clsx, tailwind-merge

### Descartado
| Pacote/Arquivo | Motivo |
|---|---|
| `react-router-dom` | Roteamento feito pelo Laravel |
| `axios` + `lib/api.ts` | Requests feitos pelo `router` e `useForm` do Inertia |
| `zustand` + `authStore.ts` | Auth compartilhado via `usePage().props.auth` |
| `vite.config.ts` do web | Substituído pelo do Laravel |
| `VITE_API_URL` no `.env` | Não há mais API separada |

### O que acontece com `arturflix-web`
Após a migração completa, o diretório `arturflix-web` é **deletado**. O código relevante terá sido migrado para dentro do `arturflix-api`. Não há necessidade de manter dois repositórios ou arquivar — o histórico git do `arturflix-api` será suficiente.

---

## Remoção do Sanctum

Com a migração para autenticação por sessão, o pacote `laravel/sanctum` se torna desnecessário. Durante a migração:

1. Remover `laravel/sanctum` do `composer.json`
2. Remover o trait `HasApiTokens` do model `User`
3. Remover o middleware group `sanctum` de `bootstrap/app.php` (se registrado)
4. A migration `personal_access_tokens` pode ser deletada, pois a tabela nunca chegou a ser usada em produção

O arquivo `routes/api.php` é **deletado** ao final da migração — todas as rotas migram para `web.php`. O registro de `api.php` em `bootstrap/app.php` também é removido.

---

## Testes

### Stack
- **Pest PHP** para todos os testes (unitários e de feature)
- Pest deve ser instalado **antes** do Breeze, para que os testes gerados pelo Breeze já saiam em sintaxe Pest
- Atualizar `CLAUDE.md` para refletir Pest como padrão (removendo a instrução de converter Pest para PHPUnit)

### Estrutura
```
tests/
├── Feature/          # Testes HTTP, banco real, Inertia responses
│   └── Auth/
└── Unit/             # Testes isolados sem banco
```

### Estratégia por camada

| Camada | Tipo de teste | O que verificar |
|---|---|---|
| `Actions` | Unit | Resultado correto, efeitos colaterais |
| `Services` | Unit | Orquestração correta (mockando Actions) |
| `Queries` | Feature | Resultado correto com dados reais no banco |
| `Controllers` | Feature | Inertia response, status HTTP, redirecionamentos |
| `Form Requests` | Unit | Regras de validação, mensagens de erro |

### Exemplo de testes Feature com Inertia

```php
// tests/Feature/Auth/LoginTest.php
it('renders login page for guests', function () {
    $this->get('/login')
        ->assertInertia(fn ($page) => $page->component('Auth/Login'));
});

it('redirects authenticated users away from login', function () {
    $this->actingAs(User::factory()->create())
        ->get('/login')
        ->assertRedirect('/dashboard');
});

it('authenticates user with valid credentials', function () {
    $user = User::factory()->create();

    $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ])->assertRedirect('/dashboard');

    $this->assertAuthenticatedAs($user);
});

it('rejects invalid credentials', function () {
    $user = User::factory()->create();

    $this->post('/login', [
        'email' => $user->email,
        'password' => 'wrong-password',
    ])->assertSessionHasErrors('email');

    $this->assertGuest();
});
```

---

## Plano de Implementação (ordem dos passos)

1. **Instalar Pest PHP** antes do Breeze, para que os testes gerados já saiam em sintaxe Pest
2. **Instalar Laravel Breeze com preset Inertia+React** no `arturflix-api`
3. **Documentar cada arquivo gerado** — explicar o papel de cada um (para fins de aprendizado)
4. **Criar estrutura de pastas** da nova arquitetura (`Actions`, `Services`, `Queries`, `Concerns`, `Traits`, `Http/Services`)
5. **Configurar Vite** com alias `@/` apontando para `resources/js/`
6. **Migrar componentes e páginas** do `arturflix-web` para `resources/js/`
7. **Adaptar controllers de auth** para usar Inertia (sessão em vez de token)
8. **Configurar `HandleInertiaRequests`** — definir contrato de `auth.user` e flash messages
9. **Migrar rotas** de `api.php` para `web.php`, deletar `api.php`
10. **Remover Sanctum** — package, trait, migration, registro em bootstrap
11. **Escrever testes Pest** para auth (Feature) e camadas isoladas (Unit)
12. **Atualizar `CLAUDE.md`** com novas convenções (Pest, nova arquitetura de pastas)
13. **Deletar `arturflix-web`** — o projeto não é mais necessário

---

## Decisões e Justificativas

**Por que Inertia.js em vez de manter API REST?**
Para um produto com frontend e backend no mesmo time/repositório, Inertia elimina a overhead de manter dois contratos (API + frontend). O custo de uma API REST só se paga quando há múltiplos clientes (mobile, parceiros, etc.) — o que não é o caso aqui.

**Por que sessão em vez de Sanctum tokens?**
Tokens Bearer fazem sentido para APIs públicas e apps mobile. Para uma SPA servida pelo mesmo domínio do backend, cookies de sessão são mais seguros (sem risco de XSS roubar tokens do localStorage) e mais simples de implementar com Inertia.

**Por que Pest em vez de PHPUnit puro?**
Pest é construído sobre PHPUnit — é o mesmo engine por baixo. A sintaxe mais expressiva (`it('faz X', fn() => ...)`) torna os testes mais legíveis e alinhados com o que a comunidade Laravel moderna usa. Não há custo de migração real.

**Por que separar Actions de Services?**
Actions são operações atômicas e testáveis isoladamente. Services orquestram. Essa separação evita o "fat service" — um arquivo enorme que faz tudo. Quando uma operação é simples, use Action diretamente no controller. Quando precisa de orquestração, use Service.

**Por que deletar `arturflix-web` em vez de arquivar?**
O projeto está em desenvolvimento inicial, sem histórico de produção relevante. Manter dois repositórios seria overhead desnecessário. O código útil migra para dentro do Laravel — nada se perde.
