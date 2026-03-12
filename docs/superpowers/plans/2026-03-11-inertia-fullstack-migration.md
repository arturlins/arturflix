# Inertia.js Fullstack Migration — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar o ArturFlix de uma API Laravel separada + React SPA para um projeto fullstack unificado usando Inertia.js com autenticação por sessão.

**Architecture:** Laravel 12 serve como único backend, renderizando componentes React server-driven via Inertia.js. Autenticação usa sessões Laravel (cookies) em vez de tokens Sanctum. Todas as rotas ficam em `web.php`. A pasta `arturflix-web` é deletada ao final.

**Tech Stack:** Laravel 12, Inertia.js (`inertiajs/inertia-laravel` + `@inertiajs/react`), React 19, TypeScript, Tailwind CSS v4, Pest PHP, Laravel Breeze (scaffold), Ziggy (named routes no frontend)

**Spec:** `docs/superpowers/specs/2026-03-11-inertia-monorepo-migration-design.md`

> **Contexto de aprendizado:** Este é o primeiro contato do desenvolvedor com Laravel e Inertia.js. As tasks incluem explicações dos conceitos envolvidos. O Chunk 1 tem uma task dedicada a documentar os arquivos gerados pelo Breeze.

> **Todos os comandos:** Rodar a partir de `d:/Workspaces/laragon/www/arturflix/arturflix-api`

---

## Chunk 1: Fundação — Pest, Breeze, Arquitetura, Vite

### Task 1: Instalar Pest PHP

**O que é Pest PHP:** Pest é um framework de testes construído sobre o PHPUnit. Mesma engine por baixo, mas com sintaxe mais legível: `it('faz algo', fn() => ...)` em vez de classes e métodos. Instalamos antes do Breeze para que os testes gerados pelo Breeze já saiam em formato Pest.

**Files:**
- Create: `tests/Pest.php`
- Modify: `composer.json` (via composer)
- Modify: `phpunit.xml` (verificar compatibilidade)

- [ ] **Step 1.1: Instalar os pacotes Pest via Composer**

```bash
composer require pestphp/pest pestphp/pest-plugin-laravel --dev --with-all-dependencies
```

Esperado: Composer instala sem erros. Não é esperado conflito de versão pois `phpunit/phpunit ^11` é compatível com Pest v3.

- [ ] **Step 1.2: Inicializar Pest no projeto**

```bash
./vendor/bin/pest --init
```

Isso cria o arquivo `tests/Pest.php`. Durante o `--init`, o Pest pergunta se quer converter os testes existentes — escolha **não** (deixe os existentes).

- [ ] **Step 1.3: Verificar/ajustar o `tests/Pest.php`**

O `--init` gera este arquivo, mas pode gerar apenas a linha de `Feature`. **Sobrescreva** com o conteúdo abaixo para garantir que `Unit` também use o `TestCase` do Laravel:

```php
<?php

uses(Tests\TestCase::class)->in('Feature');
uses(Tests\TestCase::class)->in('Unit');
```

**O que isso faz:** Diz ao Pest para usar a classe `TestCase` do Laravel (que configura banco, autenticação, etc.) em todos os testes das pastas `Feature/` e `Unit/`. Sem isso, os helpers do Laravel como `$this->get()` e `$this->actingAs()` não estariam disponíveis.

- [ ] **Step 1.4: Verificar que Pest está funcionando**

```bash
./vendor/bin/pest --compact
```

Esperado: testes passam (os testes de exemplo do Laravel devem rodar com Pest).

- [ ] **Step 1.5: Commit**

```bash
git add composer.json composer.lock tests/Pest.php
git commit -m "chore: install Pest PHP for testing"
```

---

### Task 2: Instalar Laravel Breeze com Preset Inertia+React+TypeScript

**O que é Laravel Breeze:** Breeze é um starter kit oficial do Laravel que scaffolda autenticação completa. O preset `react` usa Inertia.js para conectar o React ao Laravel. Ele gera controllers de auth, rotas, views e arquivos React prontos para usar.

**Importante:** O Breeze vai sobrescrever alguns arquivos existentes (controllers de auth, rotas, `web.php`). Isso é esperado — vamos usá-los como base e adaptá-los.

**Files:**
- Modify: `app/Http/Controllers/Auth/*.php` (sobrescritos pelo Breeze)
- Modify: `routes/web.php` (sobrescrito)
- Modify: `bootstrap/app.php` (Breeze adiciona middleware Inertia)
- Create: `app/Http/Middleware/HandleInertiaRequests.php`
- Create: `resources/views/app.blade.php`
- Create: `resources/js/app.tsx`, `resources/js/bootstrap.ts`
- Create: `resources/js/Pages/Auth/*.tsx` (Login, Register, etc.)
- Create: `resources/js/layouts/` (AuthenticatedLayout, GuestLayout)
- Create: `vite.config.ts`, `tsconfig.json`, `package.json`

- [ ] **Step 2.1: Verificar as flags disponíveis do Breeze**

Antes de rodar, confirmar quais flags o Breeze 2.x aceita:

```bash
php artisan breeze:install --help
```

Verificar se `--typescript` está listado como flag. Se não estiver (algumas versões pedem interativamente), rodar sem `--no-interaction` para responder manualmente.

- [ ] **Step 2.2: Rodar o instalador do Breeze**

Como `laravel/breeze` já está no `composer.json` (require-dev), não precisa instalar — apenas rodar:

```bash
php artisan breeze:install react --typescript --no-interaction
```

**O que cada flag faz:**
- `react` — preset que usa Inertia.js + React (em vez de Blade puro, Vue, ou API)
- `--typescript` — gera arquivos `.tsx` com TypeScript em vez de `.jsx`
- `--no-interaction` — não faz perguntas interativas

**Nota:** O Breeze vai registrar `HandleInertiaRequests` em `bootstrap/app.php` automaticamente. Não adicionar manualmente depois.

- [ ] **Step 2.3: Instalar as dependências geradas pelo Breeze**

```bash
bun install
```

Breeze atualiza o `package.json` com novos pacotes (`@inertiajs/react`, `@vitejs/plugin-react`, `tightenco/ziggy`, etc.).

- [ ] **Step 2.4: Verificar que o build funciona**

```bash
bun run build
```

Esperado: build sem erros. Se houver erro de TypeScript ou módulo faltando, corrija antes de continuar.

- [ ] **Step 2.5: Verificar que os testes base passam**

```bash
./vendor/bin/pest --compact
```

Esperado: testes passam (o Breeze pode ter gerado testes de auth — podem estar em PHPUnit syntax ainda, vamos converter depois).

- [ ] **Step 2.6: Commit**

```bash
git add -A
git commit -m "feat: install Laravel Breeze with Inertia+React+TypeScript preset"
```

---

### Task 3: Documentar os Arquivos Gerados pelo Breeze (Learning Step)

**Por que esta task existe:** Esta task é educacional. Lê cada arquivo gerado pelo Breeze e cria uma documentação explicando o papel de cada um. Isso ajuda a entender como o Inertia.js funciona antes de modificar qualquer coisa.

**Files:**
- Create: `docs/breeze-inertia-files-explained.md`

- [ ] **Step 3.1: Ler e entender cada arquivo gerado**

Leia os seguintes arquivos gerados pelo Breeze antes de criar a documentação:

```
app/Http/Middleware/HandleInertiaRequests.php
resources/views/app.blade.php
resources/js/app.tsx
resources/js/bootstrap.ts
resources/js/Pages/Auth/Login.tsx
resources/js/Pages/Dashboard.tsx
vite.config.ts
tsconfig.json
routes/web.php
bootstrap/app.php (verificar middleware adicionado)
```

- [ ] **Step 3.2: Criar o arquivo de documentação**

Criar `docs/breeze-inertia-files-explained.md` com o seguinte conteúdo (preencher as seções de "O que faz" lendo o código real de cada arquivo):

```markdown
# Arquivos do Breeze + Inertia — O que cada um faz

## Backend

### `app/Http/Middleware/HandleInertiaRequests.php`
**O que é:** Middleware que roda em toda requisição ao servidor.
**O que faz:** Injeta dados globais (como o usuário autenticado) em todas as páginas React.
O método `share()` retorna um array que fica disponível em `usePage().props` em qualquer componente React.
Sem este middleware, cada controller teria que passar `auth.user` manualmente.

### `resources/views/app.blade.php`
**O que é:** O único template HTML do projeto. Blade é o sistema de templates do Laravel.
**O que faz:** Serve como "casca" da SPA. Contém `@inertia` que é substituído pelo HTML do componente React atual.
`@vite` carrega os assets compilados pelo Vite (CSS + JS).
Na primeira visita, o servidor renderiza este arquivo com o componente React hidratado.
Nas visitas seguintes (navegação), o Inertia faz XHR e substitui apenas o componente.

### `routes/web.php`
**O que é:** Arquivo de rotas HTTP (web, com suporte a sessão e CSRF).
**O que faz:** Define quais URLs o Laravel responde e qual controller/ação cada uma chama.
Com Inertia, as rotas web substituem completamente as rotas API — não há mais `/api/` endpoints.

## Frontend

### `resources/js/app.tsx`
**O que é:** Entry point do frontend — o primeiro arquivo JS executado no browser.
**O que faz:** Inicializa o Inertia, conectando-o ao React. O `resolve` diz ao Inertia como encontrar os componentes de página dado um nome (ex: 'Auth/Login' → `Pages/Auth/Login.tsx`).

### `resources/js/bootstrap.ts`
**O que é:** Configurações globais do JavaScript carregadas antes da app.
**O que faz:** Configura o Axios (se usado) e o Ziggy (helper de rotas nomeadas no frontend).

### `vite.config.ts`
**O que é:** Configuração do bundler Vite.
**O que faz:** Define como o Vite processa os arquivos. `laravel-vite-plugin` integra o Vite ao Laravel (manifesto de assets, hot reload). `@vitejs/plugin-react` adiciona suporte ao JSX/TSX.

### `tsconfig.json`
**O que é:** Configuração do compilador TypeScript.
**O que faz:** Define regras de tipagem. O alias `@` mapeia para a pasta `resources/js/`, permitindo imports como `import { Button } from '@/components/ui/button'`.

### `resources/js/Pages/Auth/Login.tsx`
**O que é:** Componente React que representa a página de login.
**O que faz:** Usa `useForm` do Inertia para gerenciar o formulário. `form.post(route('login'))` envia o POST para a rota `login` do Laravel. `form.errors` contém os erros de validação do servidor. Sem Axios, sem token, sem estado global — tudo gerenciado pelo Inertia.
```

- [ ] **Step 3.3: Commit**

```bash
git add docs/breeze-inertia-files-explained.md
git commit -m "docs: explain Breeze+Inertia generated files for learning"
```

---

### Task 4: Criar Estrutura de Pastas da Nova Arquitetura

**O que são estas pastas:** Laravel não impõe estrutura rígida além de `app/Http/`. As pastas extras são convenções do domínio da aplicação para organizar regras de negócio. Cada uma tem uma responsabilidade clara — veja o design doc para detalhes.

**Files:**
- Create: `app/Actions/.gitkeep`
- Create: `app/Concerns/.gitkeep`
- Create: `app/Queries/.gitkeep`
- Create: `app/Services/.gitkeep`
- Create: `app/Traits/.gitkeep`
- Create: `app/Http/Services/.gitkeep`
- Modify: `app/Models/User.php` (extrair `HasPublicId` para Concerns)
- Create: `app/Concerns/HasPublicId.php`

- [ ] **Step 4.1: Criar os diretórios com `.gitkeep`**

Git não rastreia diretórios vazios. `.gitkeep` é um arquivo vazio por convenção para manter o diretório no repositório.

```bash
mkdir -p app/Actions app/Concerns app/Queries app/Services app/Traits app/Http/Services
touch app/Actions/.gitkeep app/Concerns/.gitkeep app/Queries/.gitkeep app/Services/.gitkeep app/Traits/.gitkeep app/Http/Services/.gitkeep
```

- [ ] **Step 4.2: Criar o Concern `HasPublicId`**

O `User` model já tem lógica de UUID no método `boot()`. Extraímos para um Concern reutilizável (outros models como `Curso`, `Modulo` também vão precisar disso).

Criar `app/Concerns/HasPublicId.php`:

```php
<?php

namespace App\Concerns;

use Illuminate\Support\Str;

trait HasPublicId
{
    protected static function bootHasPublicId(): void
    {
        static::creating(function (self $model): void {
            $model->public_id = (string) Str::uuid();
        });
    }
}
```

**Por que `bootHasPublicId()`:** O Laravel chama automaticamente métodos `bootNomeDaTrait()` ao inicializar um model que usa a trait. Não precisa de `parent::boot()` ou registro manual.

- [ ] **Step 4.3: Atualizar o model `User` para usar o Concern**

Modificar `app/Models/User.php`:
- Adicionar `use App\Concerns\HasPublicId;`
- Adicionar `HasPublicId` no bloco `use` do model
- **Remover o método `boot()` existente** (que fazia `$user->public_id = Str::uuid()`) — a trait substitui esse comportamento
- **Remover o import `use Illuminate\Support\Str`** — não é mais necessário no model
- **Remover `HasApiTokens` e `use Laravel\Sanctum\HasApiTokens`** — Sanctum será removido completamente na Task 11; já removemos aqui para evitar erro após a remoção do pacote

```php
<?php

namespace App\Models;

use App\Concerns\HasPublicId;
use App\Enums\PapelEnum;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasPublicId, Notifiable;

    protected $fillable = [
        'name',
        'nome_completo',
        'email',
        'password',
        'papel',
        'aceitou_termos',
        'is_staff',
        'is_superuser',
        'ultimo_login',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'ultimo_login' => 'datetime',
            'password' => 'hashed',
            'aceitou_termos' => 'boolean',
            'is_staff' => 'boolean',
            'is_superuser' => 'boolean',
            'papel' => PapelEnum::class,
        ];
    }
}
```

**Note:** Removemos `HasApiTokens` (era do Sanctum, que removeremos na Task 11). Também removemos o `boot()` inline.

- [ ] **Step 4.4: Formatar o código PHP**

```bash
./vendor/bin/pint --dirty --format agent
```

- [ ] **Step 4.5: Rodar testes para verificar que nada quebrou**

```bash
./vendor/bin/pest --compact
```

Esperado: todos os testes passam.

- [ ] **Step 4.6: Commit**

```bash
git add app/Actions/.gitkeep app/Concerns/ app/Queries/.gitkeep app/Services/.gitkeep app/Traits/.gitkeep app/Http/Services/.gitkeep app/Models/User.php
git commit -m "feat: add architecture directories and extract HasPublicId concern"
```

---

### Task 5: Configurar Vite com Tailwind v4 e Alias `@/`

**O que é Tailwind v4:** Tailwind CSS v4 mudou como é instalado — usa um plugin Vite (`@tailwindcss/vite`) em vez do PostCSS. Não requer `tailwind.config.js`. O CSS usa `@import "tailwindcss"` em vez de `@tailwind base/components/utilities`. O `arturflix-web` já usava v4; os componentes migrados dependem disso.

**O que é o alias `@/`:** Permite escrever `import Button from '@/components/ui/button'` em vez do caminho relativo `../../components/ui/button`. Precisa ser configurado tanto no Vite (para resolução em runtime) quanto no TypeScript (para checagem de tipos).

**Files:**
- Modify: `vite.config.ts`
- Modify: `tsconfig.json`
- Modify: `resources/css/app.css`
- Modify: `package.json` (instalar `@tailwindcss/vite` se necessário)

- [ ] **Step 5.1: Verificar versão do Tailwind instalada**

```bash
cat node_modules/tailwindcss/package.json | grep '"version"' | head -1
```

Se a versão for `3.x`, precisamos migrar para v4. Se for `4.x`, pular o Step 5.2.

- [ ] **Step 5.2: Instalar Tailwind v4 e `@types/node` (se necessário)**

```bash
bun remove tailwindcss postcss autoprefixer
bun add tailwindcss @tailwindcss/vite
bun add -d @types/node
```

`@types/node` é necessário para o `path.resolve()` no `vite.config.ts`. Instalamos agora para evitar erro de compilação TypeScript.

Se existir `tailwind.config.js` ou `postcss.config.js`, deletar:

```bash
rm -f tailwind.config.js postcss.config.js
```

- [ ] **Step 5.3: Atualizar `vite.config.ts`**

```ts
import { defineConfig } from 'vite'
import laravel from 'laravel-vite-plugin'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.tsx',
            refresh: true,
        }),
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

**Por que `laravel-vite-plugin`:** Integra o Vite ao Laravel — gera um manifesto de assets para o helper `@vite()` no Blade usar o arquivo correto (com hash de cache-busting).

**Por que `refresh: true`:** Recarrega o browser automaticamente quando arquivos PHP/Blade são alterados durante o desenvolvimento.

- [ ] **Step 5.4: Atualizar `tsconfig.json` com o alias `@/`**

Ler o `tsconfig.json` gerado pelo Breeze primeiro. Localizar o bloco `"compilerOptions"` existente e **adicionar apenas a chave `paths`** dentro dele — não substituir o arquivo todo:

```json
// Dentro de "compilerOptions", adicionar:
"paths": {
    "@/*": ["./resources/js/*"]
}
```

Exemplo do resultado esperado (o arquivo pode ter outras opções — mantê-las):

```json
{
    "compilerOptions": {
        "target": "ESNext",
        "module": "ESNext",
        "strict": true,
        "paths": {
            "@/*": ["./resources/js/*"]
        }
    }
}
```

Se o `tsconfig.json` referenciar um `tsconfig.app.json`, adicionar `paths` nele (é o que compila os arquivos `resources/js/`).

- [ ] **Step 5.5: Atualizar `resources/css/app.css` para Tailwind v4**

```css
@import "tailwindcss";
```

Remover quaisquer diretivas v3 (`@tailwind base`, `@tailwind components`, `@tailwind utilities`).

- [ ] **Step 5.6: Verificar build**

```bash
bun run build
```

Esperado: build sem erros.

- [ ] **Step 5.7: Commit**

```bash
git add vite.config.ts tsconfig.json resources/css/app.css package.json bun.lock
git commit -m "feat: configure Vite with Tailwind v4 and @/ alias"
```

---

## Chunk 2: Migração do Frontend

### Task 6: Migrar Componentes do `arturflix-web`

**O que acontece aqui:** Os componentes React do `arturflix-web` são copiados para `resources/js/components/`. A adaptação principal é substituir imports do `react-router-dom` (`Link`) pelo `Link` do `@inertiajs/react`. Componentes que usam `useAuthStore` (Zustand) precisam ser adaptados para ler auth do Inertia via `usePage`.

**Files:**
- Create: `resources/js/components/layout/Navbar.tsx`
- Create: `resources/js/components/layout/Footer.tsx`
- Create: `resources/js/components/ui/*.tsx` (todos os arquivos de ui/)
- Delete: arquivos de componentes gerados pelo Breeze que não serão usados

- [ ] **Step 6.1: Instalar dependências dos componentes migrados**

Os componentes do `arturflix-web` dependem de pacotes que o Breeze não instala. Instalar antes de copiar os arquivos para evitar erro de build:

```bash
bun add @base-ui/react class-variance-authority clsx tailwind-merge lucide-react
```

- [ ] **Step 6.2: Copiar `lib/utils.ts` e componentes de UI**

```bash
cp ../arturflix-web/src/lib/utils.ts resources/js/lib/utils.ts
cp -r ../arturflix-web/src/components/ui/* resources/js/components/ui/
```

Os componentes em `ui/` são shadcn/ui puros — sem React Router, sem Zustand. Os imports `@/` já funcionarão com o alias configurado na Task 5.

- [ ] **Step 6.3: Criar `resources/js/components/layout/Footer.tsx`**

Adaptar o Footer: substituir `Link` do `react-router-dom` pelo `Link` do `@inertiajs/react`.

```tsx
import { Link } from '@inertiajs/react'

export function Footer() {
    return (
        <footer className="border-t border-[#1e2430] mt-auto">
            <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span
                    className="text-[#E50914] text-xl"
                    style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}
                >
                    ARTURFLIX
                </span>
                <div className="flex items-center gap-6 text-sm text-[#8a8a8a]">
                    <Link href="/suporte" className="hover:text-[#f1f1f1] transition-colors">
                        Suporte
                    </Link>
                    <Link href="/termos" className="hover:text-[#f1f1f1] transition-colors">
                        Termos
                    </Link>
                    <Link href="/privacidade" className="hover:text-[#f1f1f1] transition-colors">
                        Privacidade
                    </Link>
                </div>
                <p className="text-xs text-[#8a8a8a]">© {new Date().getFullYear()} ArturFlix</p>
            </div>
        </footer>
    )
}
```

**Diferença chave:** `Link` do Inertia usa `href` (não `to`). Ele intercepta o clique e faz uma navegação SPA via XHR em vez de recarregar a página.

- [ ] **Step 6.4: Criar `resources/js/components/layout/Navbar.tsx`**

Adaptar o Navbar: `Link` do Inertia, `usePage` para auth, `router.post` para logout.

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
            className="fixed top-0 w-full z-50 bg-[#0d1016]/90 backdrop-blur-md border-b border-[#1e2430]"
        >
            <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
                <Link
                    href="/"
                    className="text-[#E50914] text-2xl tracking-wide"
                    style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}
                >
                    ARTURFLIX
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

**Conceitos importantes:**
- `usePage<PageProps>().props` — acessa os dados compartilhados pelo `HandleInertiaRequests` middleware. `auth.user` é `null` quando não autenticado.
- `router.post('/logout')` — faz um POST para a rota de logout via XHR. O Inertia lida com o redirecionamento automaticamente.
- Sem Zustand, sem localStorage — o estado de auth vem do servidor a cada request.

- [ ] **Step 6.5: Remover componentes gerados pelo Breeze que não serão usados**

O Breeze gera componentes em `resources/js/Components/` (com C maiúsculo). Verificar quais são e remover os que não serão usados (ApplicationLogo, Checkbox, etc. gerados pelo Breeze):

```bash
ls resources/js/Components/
```

Se a pasta `Components/` (maiúsculo) existir e não for necessária, remover:

```bash
rm -rf resources/js/Components
```

Verificar se `resources/js/Pages/` gerado pelo Breeze referencia esses componentes — se sim, essas referências serão substituídas na Task 7.

- [ ] **Step 6.6: Verificar build**

```bash
bun run build
```

Esperado: build sem erros. Erros de TypeScript sobre `PageProps` não sendo encontrado são esperados neste momento (o tipo será definido na Task 8).

- [ ] **Step 6.7: Commit**

```bash
git add resources/js/components/ resources/js/lib/utils.ts package.json bun.lock
git commit -m "feat: migrate layout and UI components from arturflix-web"
```

---

### Task 7: Migrar e Adaptar Páginas para Inertia

**O que muda nas páginas:**
1. Sem `react-router-dom` — `Link` vem de `@inertiajs/react`, sem `useNavigate`
2. Sem Axios — formulários usam `useForm` do Inertia
3. Sem Zustand — auth vem de `usePage`
4. Export default em vez de named export (convenção do Inertia)
5. Inertia cuida dos erros de validação via `form.errors`

**Files:**
- Modify/Replace: `resources/js/Pages/Auth/Login.tsx`
- Modify/Replace: `resources/js/Pages/Auth/Register.tsx`
- Create: `resources/js/Pages/Welcome.tsx` (Landing Page)
- Create: `resources/js/Pages/Cursos/Index.tsx`
- Create: `resources/js/Pages/Suporte/Index.tsx`
- Create: `resources/js/layouts/AppLayout.tsx`
- Create: `resources/js/layouts/GuestLayout.tsx`

- [ ] **Step 7.1: Criar `resources/js/layouts/GuestLayout.tsx`**

Layout para páginas públicas (landing, cursos, suporte). Inclui Navbar e Footer.

```tsx
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import type { PropsWithChildren } from 'react'

export default function GuestLayout({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen flex flex-col bg-[#0d1016]">
            <Navbar />
            <main className="flex-1 pt-14">{children}</main>
            <Footer />
        </div>
    )
}
```

- [ ] **Step 7.2: Criar `resources/js/layouts/AppLayout.tsx`**

Layout para páginas autenticadas (dashboard, etc.). Por ora igual ao GuestLayout, mas separado para evoluir independentemente.

```tsx
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import type { PropsWithChildren } from 'react'

export default function AppLayout({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen flex flex-col bg-[#0d1016]">
            <Navbar />
            <main className="flex-1 pt-14">{children}</main>
            <Footer />
        </div>
    )
}
```

- [ ] **Step 7.3: Substituir `resources/js/Pages/Auth/Login.tsx`**

```tsx
import { Head, Link, useForm } from '@inertiajs/react'

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
    })

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        post('/login')
    }

    return (
        <>
            <Head title="Login" />
            <main className="min-h-screen flex items-center justify-center px-4 bg-[#0d1016]">
                <section className="w-full max-w-sm">
                    <div className="text-center mb-8">
                        <Link
                            href="/"
                            className="text-[#E50914] text-4xl"
                            style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}
                        >
                            ARTURFLIX
                        </Link>
                        <p className="text-[#8a8a8a] text-sm mt-3">Entre na sua conta</p>
                    </div>

                    <div className="bg-[#12151b] border border-[#1e2430] rounded-xl p-6">
                        {errors.email && (
                            <p className="text-red-400 text-sm mb-4 bg-red-950/30 border border-red-900/50 rounded-lg px-3 py-2">
                                {errors.email}
                            </p>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm text-[#f1f1f1] mb-1.5">
                                    E-mail
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="seu@email.com"
                                    required
                                    className="w-full bg-[#171b23] border border-[#1e2430] rounded-lg px-3 py-2.5 text-sm text-[#f1f1f1] placeholder:text-[#555] focus:outline-none focus:border-[#E50914] transition-colors"
                                />
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
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full bg-[#171b23] border border-[#1e2430] rounded-lg px-3 py-2.5 text-sm text-[#f1f1f1] placeholder:text-[#555] focus:outline-none focus:border-[#E50914] transition-colors"
                                />
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
                        <Link
                            href="/register"
                            className="text-[#f1f1f1] hover:text-[#E50914] transition-colors"
                        >
                            Cadastre-se
                        </Link>
                    </p>
                </section>
            </main>
        </>
    )
}
```

**Conceitos importantes:**
- `useForm` — hook do Inertia que gerencia estado do formulário, loading (`processing`) e erros (`errors`)
- `post('/login')` — envia POST para `/login` com CSRF automático. O Inertia lida com redirecionamentos e erros de validação automaticamente
- `errors.email` — erros de validação retornados pelo Laravel (`ValidationException`) ficam disponíveis aqui, sem necessidade de try/catch
- `Head` — componente que atualiza o `<title>` da página dinamicamente (como React Helmet)

- [ ] **Step 7.4: Substituir `resources/js/Pages/Auth/Register.tsx`**

```tsx
import { Head, Link, useForm } from '@inertiajs/react'

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        aceitou_termos: false,
    })

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        post('/register')
    }

    const fields = [
        { id: 'name' as const, label: 'Nome completo', type: 'text', placeholder: 'Seu nome' },
        { id: 'email' as const, label: 'E-mail', type: 'email', placeholder: 'seu@email.com' },
        { id: 'password' as const, label: 'Senha', type: 'password', placeholder: 'Mínimo 8 caracteres' },
        {
            id: 'password_confirmation' as const,
            label: 'Confirmar senha',
            type: 'password',
            placeholder: 'Repita a senha',
        },
    ]

    return (
        <>
            <Head title="Cadastro" />
            <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#0d1016]">
                <section className="w-full max-w-sm">
                    <div className="text-center mb-8">
                        <Link
                            href="/"
                            className="text-[#E50914] text-4xl"
                            style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}
                        >
                            ARTURFLIX
                        </Link>
                        <p className="text-[#8a8a8a] text-sm mt-3">Crie sua conta gratuitamente</p>
                    </div>

                    <div className="bg-[#12151b] border border-[#1e2430] rounded-xl p-6">
                        {errors.email && (
                            <p className="text-red-400 text-sm mb-4 bg-red-950/30 border border-red-900/50 rounded-lg px-3 py-2">
                                {errors.email}
                            </p>
                        )}
                        {errors.password && (
                            <p className="text-red-400 text-sm mb-4 bg-red-950/30 border border-red-900/50 rounded-lg px-3 py-2">
                                {errors.password}
                            </p>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {fields.map(({ id, label, type, placeholder }) => (
                                <div key={id}>
                                    <label htmlFor={id} className="block text-sm text-[#f1f1f1] mb-1.5">
                                        {label}
                                    </label>
                                    <input
                                        id={id}
                                        type={type}
                                        value={data[id] as string}
                                        onChange={(e) => setData(id, e.target.value)}
                                        placeholder={placeholder}
                                        required
                                        minLength={type === 'password' ? 8 : undefined}
                                        className="w-full bg-[#171b23] border border-[#1e2430] rounded-lg px-3 py-2.5 text-sm text-[#f1f1f1] placeholder:text-[#555] focus:outline-none focus:border-[#E50914] transition-colors"
                                    />
                                </div>
                            ))}

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-[#E50914] hover:bg-[#c20710] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg text-sm transition-colors mt-2"
                            >
                                {processing ? 'Criando conta...' : 'Criar conta'}
                            </button>
                        </form>

                        <p className="text-center text-[#8a8a8a] text-xs mt-4 leading-relaxed">
                            Ao criar uma conta você concorda com os{' '}
                            <Link
                                href="/termos"
                                className="hover:text-[#f1f1f1] underline underline-offset-2"
                            >
                                Termos de Uso
                            </Link>{' '}
                            e a{' '}
                            <Link
                                href="/privacidade"
                                className="hover:text-[#f1f1f1] underline underline-offset-2"
                            >
                                Política de Privacidade
                            </Link>
                            .
                        </p>
                    </div>

                    <p className="text-center text-[#8a8a8a] text-sm mt-5">
                        Já tem conta?{' '}
                        <Link
                            href="/login"
                            className="text-[#f1f1f1] hover:text-[#E50914] transition-colors"
                        >
                            Entrar
                        </Link>
                    </p>
                </section>
            </main>
        </>
    )
}
```

- [ ] **Step 7.5: Criar páginas de placeholder para rotas existentes**

Criar páginas simples para as rotas que existiam no `arturflix-web`. O conteúdo real virá em futuras implementações.

Criar `resources/js/Pages/Welcome.tsx` (Landing Page):

```tsx
import { Head } from '@inertiajs/react'
import GuestLayout from '@/layouts/GuestLayout'

export default function Welcome() {
    return (
        <GuestLayout>
            <Head title="ArturFlix" />
            <div className="flex items-center justify-center min-h-[60vh]">
                <h1 className="text-4xl text-[#f1f1f1]">Landing Page</h1>
            </div>
        </GuestLayout>
    )
}
```

Criar `resources/js/Pages/Cursos/Index.tsx`:

```tsx
import { Head } from '@inertiajs/react'
import GuestLayout from '@/layouts/GuestLayout'

export default function CursosIndex() {
    return (
        <GuestLayout>
            <Head title="Cursos" />
            <div className="max-w-6xl mx-auto px-6 py-12">
                <h1 className="text-3xl text-[#f1f1f1]">Cursos</h1>
            </div>
        </GuestLayout>
    )
}
```

Criar `resources/js/Pages/Suporte/Index.tsx`:

```tsx
import { Head } from '@inertiajs/react'
import GuestLayout from '@/layouts/GuestLayout'

export default function SuporteIndex() {
    return (
        <GuestLayout>
            <Head title="Suporte" />
            <div className="max-w-6xl mx-auto px-6 py-12">
                <h1 className="text-3xl text-[#f1f1f1]">Suporte</h1>
            </div>
        </GuestLayout>
    )
}
```

Criar `resources/js/Pages/Dashboard.tsx`:

```tsx
import { Head } from '@inertiajs/react'
import AppLayout from '@/layouts/AppLayout'
import { usePage } from '@inertiajs/react'
import type { PageProps } from '@/types'

export default function Dashboard() {
    const { auth } = usePage<PageProps>().props

    return (
        <AppLayout>
            <Head title="Dashboard" />
            <div className="max-w-6xl mx-auto px-6 py-12">
                <h1 className="text-3xl text-[#f1f1f1]">
                    Bem-vindo, {auth.user?.name}!
                </h1>
            </div>
        </AppLayout>
    )
}
```

- [ ] **Step 7.6: Verificar build**

```bash
bun run build
```

Erros sobre `PageProps` não encontrado são esperados — serão resolvidos na Task 8.

- [ ] **Step 7.7: Commit**

```bash
git add resources/js/Pages/ resources/js/layouts/
git commit -m "feat: migrate pages to Inertia (Login, Register, Dashboard, placeholders)"
```

---

## Chunk 3: Integração Backend

### Task 8: Configurar `HandleInertiaRequests` e Tipos TypeScript

**O que é HandleInertiaRequests:** É um middleware do Laravel que roda em cada requisição. O método `share()` retorna um array que o Inertia serializa e envia para o React junto com cada resposta. No React, esses dados ficam disponíveis via `usePage().props`. É aqui que compartilhamos `auth.user` com todas as páginas sem precisar passar como prop manualmente em cada controller.

**Files:**
- Modify: `app/Http/Middleware/HandleInertiaRequests.php`
- Create/Modify: `resources/js/types/index.d.ts`

- [ ] **Step 8.1: Escrever o teste que verifica os dados compartilhados**

Criar `tests/Feature/InertiaSharedDataTest.php`:

```php
<?php

use App\Models\User;

it('shares auth user as null for guests', function (): void {
    $this->get('/login')
        ->assertInertia(function ($page): void {
            $page->where('auth.user', null);
        });
});

it('shares authenticated user data in all inertia responses', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get('/dashboard')
        ->assertInertia(function ($page) use ($user): void {
            $page->where('auth.user.id', $user->id)
                ->where('auth.user.email', $user->email)
                ->where('auth.user.name', $user->name)
                ->where('auth.user.papel', $user->papel->value);
        });
});

it('shares flash messages in inertia responses', function (): void {
    $this->withSession(['success' => 'Operação realizada com sucesso!'])
        ->get('/login')
        ->assertInertia(function ($page): void {
            $page->where('flash.success', 'Operação realizada com sucesso!')
                ->where('flash.error', null);
        });
});
```

- [ ] **Step 8.2: Rodar o teste para ver falhar**

```bash
./vendor/bin/pest tests/Feature/InertiaSharedDataTest.php --compact
```

Esperado: falha — `HandleInertiaRequests` ainda não compartilha os dados.

- [ ] **Step 8.3: Atualizar `app/Http/Middleware/HandleInertiaRequests.php`**

```php
<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
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
}
```

- [ ] **Step 8.4: Atualizar `resources/js/types/index.d.ts`**

Este arquivo define o contrato TypeScript dos dados que o Laravel envia. Deve refletir exatamente o que `HandleInertiaRequests::share()` retorna.

```ts
export interface User {
    id: number
    public_id: string
    name: string
    email: string
    papel: 'aluno' | 'admin' | 'superuser'
}

export interface PageProps {
    auth: {
        user: User | null
    }
    flash: {
        success: string | null
        error: string | null
    }
    [key: string]: unknown
}
```

**Por que `[key: string]: unknown`:** O Inertia permite que controllers passem props adicionais específicos de cada página. Esse index signature permite que TypeScript aceite props extras sem reclamar.

- [ ] **Step 8.5: Rodar os testes para ver passar**

```bash
./vendor/bin/pest tests/Feature/InertiaSharedDataTest.php --compact
```

Esperado: todos os testes passam.

- [ ] **Step 8.6: Verificar build (TypeScript não deve mais reclamar de PageProps)**

```bash
bun run build
```

- [ ] **Step 8.7: Formatar PHP**

```bash
./vendor/bin/pint --dirty --format agent
```

- [ ] **Step 8.8: Commit**

```bash
git add app/Http/Middleware/HandleInertiaRequests.php resources/js/types/index.d.ts tests/Feature/InertiaSharedDataTest.php
git commit -m "feat: configure HandleInertiaRequests shared data with auth and flash"
```

---

### Task 9: Adaptar Controllers de Auth para Inertia

**O que muda:** Os controllers gerados pelo Breeze para o preset Inertia já estão corretos — retornam `Inertia::render()` para páginas e `redirect()` para formulários. Verificamos que correspondem ao que queremos e ajustamos o `RegisteredUserController` para incluir o campo `aceitou_termos`.

**Files:**
- Modify: `app/Http/Controllers/Auth/RegisteredUserController.php`
- Verify: `app/Http/Controllers/Auth/AuthenticatedSessionController.php`

- [ ] **Step 9.1: Verificar `AuthenticatedSessionController`**

Ler `app/Http/Controllers/Auth/AuthenticatedSessionController.php`. O Breeze com preset Inertia deve ter gerado algo assim:

```php
public function create(): Response
{
    return Inertia::render('Auth/Login');
}

public function store(LoginRequest $request): RedirectResponse
{
    $request->authenticate();
    $request->session()->regenerate();
    return redirect()->intended(route('dashboard', absolute: false));
}

public function destroy(Request $request): RedirectResponse
{
    Auth::guard('web')->logout();
    $request->session()->invalidate();
    $request->session()->regenerateToken();
    return redirect('/');
}
```

Se o controller gerado pelo Breeze tiver essa estrutura, não precisa de alteração. Se ainda tiver `return response()->noContent()`, substituir pelos métodos acima.

- [ ] **Step 9.2: Deletar testes PHPUnit gerados pelo Breeze**

O Breeze gera testes em `tests/Feature/Auth/` que usam estilo PHPUnit e testam comportamento de API (`assertNoContent`). Como os controllers agora retornam redirects Inertia, esses testes vão falhar. Removê-los — serão substituídos pelos testes Pest da Task 12:

```bash
rm tests/Feature/Auth/AuthenticationTest.php
rm tests/Feature/Auth/RegistrationTest.php
rm tests/Feature/Auth/PasswordResetTest.php
rm tests/Feature/Auth/EmailVerificationTest.php
```

Verificar quais arquivos existem antes de deletar:
```bash
ls tests/Feature/Auth/
```

- [ ] **Step 9.3: Substituir `RegisteredUserController`**

O Breeze gera uma versão genérica sem `aceitou_termos`. Substituir com a versão do projeto que hardcoda `aceitou_termos: true` (campo obrigatório pelo model, mas não exposto como checkbox no formulário — toda conta criada aceita os termos automaticamente ao se cadastrar):

```php
<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->string('password')),
            'aceitou_termos' => true,
        ]);

        event(new Registered($user));
        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }
}
```

- [ ] **Step 9.4: Formatar PHP**

```bash
./vendor/bin/pint --dirty --format agent
```

- [ ] **Step 9.5: Rodar todos os testes**

```bash
./vendor/bin/pest --compact
```

- [ ] **Step 9.6: Commit**

```bash
git add app/Http/Controllers/Auth/
git rm tests/Feature/Auth/AuthenticationTest.php tests/Feature/Auth/RegistrationTest.php tests/Feature/Auth/PasswordResetTest.php tests/Feature/Auth/EmailVerificationTest.php
git commit -m "feat: update auth controllers for Inertia; remove stale Breeze PHPUnit tests"
```

---

### Task 10: Migrar Rotas para `web.php` e Deletar `api.php`

**O que muda:** Com Inertia, não há mais API REST. Todas as rotas ficam em `web.php`, que tem suporte a sessão, CSRF e middleware web por padrão. O `api.php` e seu registro em `bootstrap/app.php` são removidos.

**Files:**
- Modify: `routes/web.php`
- Delete: `routes/api.php`
- Modify: `bootstrap/app.php`

- [ ] **Step 10.1: Verificar o `web.php` gerado pelo Breeze**

Ler `routes/web.php`. O Breeze deve ter gerado rotas de auth. Verificar se faltam as rotas de cursos e suporte.

- [ ] **Step 10.2: Atualizar `routes/web.php` com todas as rotas**

```php
<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\VerifyEmailController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Rotas públicas
Route::get('/', fn () => Inertia::render('Welcome'))->name('home');
Route::get('/cursos', fn () => Inertia::render('Cursos/Index'))->name('cursos.index');
Route::get('/suporte', fn () => Inertia::render('Suporte/Index'))->name('suporte.index');

// Autenticação — apenas guests
Route::middleware('guest')->group(function (): void {
    Route::get('/register', [RegisteredUserController::class, 'create'])->name('register');
    Route::post('/register', [RegisteredUserController::class, 'store']);

    Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('/login', [AuthenticatedSessionController::class, 'store']);

    Route::get('/forgot-password', [PasswordResetLinkController::class, 'create'])->name('password.request');
    Route::post('/forgot-password', [PasswordResetLinkController::class, 'store'])->name('password.email');

    Route::get('/reset-password/{token}', [NewPasswordController::class, 'create'])->name('password.reset');
    Route::post('/reset-password', [NewPasswordController::class, 'store'])->name('password.store');
});

// Autenticação — apenas autenticados
Route::middleware('auth')->group(function (): void {
    Route::get('/verify-email', fn () => Inertia::render('Auth/VerifyEmail'))->name('verification.notice');

    Route::get('/verify-email/{id}/{hash}', VerifyEmailController::class)
        ->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verify');

    Route::post('/email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
        ->middleware('throttle:6,1')
        ->name('verification.send');

    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');

    Route::get('/dashboard', fn () => Inertia::render('Dashboard'))->name('dashboard');
});
```

- [ ] **Step 10.3: Deletar `routes/api.php`**

```bash
rm routes/api.php
```

- [ ] **Step 10.4: Remover o registro de `api.php` e Sanctum do `bootstrap/app.php`**

Atualizar `bootstrap/app.php` para remover o `api:` da configuração de routing e o middleware do Sanctum:

```php
<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
        ]);

        $middleware->alias([
            'verified' => \App\Http\Middleware\EnsureEmailIsVerified::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
```

**Mudanças importantes:**
- Removido `api:` do `withRouting()` — sem mais `api.php`
- Removido `EnsureFrontendRequestsAreStateful` do Sanctum
- Adicionado `HandleInertiaRequests` no middleware `web` — se o Breeze ainda não adicionou

- [ ] **Step 10.5: Verificar que as rotas estão corretas**

```bash
php artisan route:list
```

Esperado: ver rotas GET `/`, GET `/login`, POST `/login`, GET `/register`, POST `/register`, GET `/dashboard`, POST `/logout`. Nenhuma rota `/api/`.

- [ ] **Step 10.6: Rodar todos os testes**

```bash
./vendor/bin/pest --compact
```

- [ ] **Step 10.7: Commit**

```bash
git add routes/web.php bootstrap/app.php
git rm routes/api.php
git commit -m "feat: migrate all routes to web.php and remove api.php"
```

---

### Task 11: Remover Sanctum

**Por que remover:** Sanctum é para APIs com tokens Bearer ou autenticação de SPA via cookie para SPAs em domínio diferente. Com Inertia e sessões, Laravel já cuida da autenticação nativamente — Sanctum é overhead desnecessário.

**Files:**
- Modify: `composer.json` (via composer remove)
- Modify: `app/Models/User.php`
- Delete: migração `personal_access_tokens`

- [ ] **Step 11.1: Remover o pacote Sanctum**

```bash
composer remove laravel/sanctum
```

- [ ] **Step 11.2: Verificar que `HasApiTokens` foi removido do `User`**

Na Task 4 já removemos `HasApiTokens` do `User.php`. Verificar que está correto:

```bash
grep -n "HasApiTokens\|sanctum" app/Models/User.php
```

Esperado: nenhum resultado.

- [ ] **Step 11.3: Deletar a migração de personal_access_tokens**

Verificar o nome exato do arquivo:

```bash
ls database/migrations/ | grep personal_access
```

Deletar:

```bash
rm database/migrations/*personal_access_tokens*
```

- [ ] **Step 11.4: Verificar que `bootstrap/app.php` não tem mais referências ao Sanctum**

```bash
grep -n "sanctum\|Sanctum" bootstrap/app.php
```

Esperado: nenhum resultado (já removemos na Task 10).

- [ ] **Step 11.5: Rodar todos os testes**

```bash
./vendor/bin/pest --compact
```

- [ ] **Step 11.6: Verificar build**

```bash
bun run build
```

- [ ] **Step 11.7: Commit**

```bash
git add composer.json composer.lock app/Models/User.php
git rm database/migrations/*personal_access_tokens*
git commit -m "feat: remove Sanctum, migrate to session-based authentication"
```

---

## Chunk 4: Testes e Finalização

### Task 12: Escrever Testes Pest para Autenticação

**Estratégia:** Feature tests verificam o fluxo HTTP completo — request entra, controller processa, resposta sai. Para Inertia, usamos `assertInertia()` para verificar que a página correta foi renderizada com os dados corretos.

**Files:**
- Create: `tests/Feature/Auth/LoginTest.php`
- Create: `tests/Feature/Auth/RegisterTest.php`
- Create: `tests/Feature/Auth/LogoutTest.php`

- [ ] **Step 12.1: Criar `tests/Feature/Auth/LoginTest.php`**

```php
<?php

use App\Models\User;

it('renders login page for guests', function (): void {
    $this->get('/login')
        ->assertInertia(fn ($page) => $page->component('Auth/Login'));
});

it('redirects authenticated users away from login page', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get('/login')
        ->assertRedirect('/dashboard');
});

it('authenticates user with valid credentials', function (): void {
    $user = User::factory()->create();

    $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ])->assertRedirect('/dashboard');

    $this->assertAuthenticatedAs($user);
});

it('rejects invalid credentials', function (): void {
    $user = User::factory()->create();

    $this->post('/login', [
        'email' => $user->email,
        'password' => 'senha-errada',
    ])->assertSessionHasErrors('email');

    $this->assertGuest();
});

it('requires email and password', function (): void {
    $this->post('/login', [])
        ->assertSessionHasErrors(['email', 'password']);
});
```

- [ ] **Step 12.2: Rodar os testes de login**

```bash
./vendor/bin/pest tests/Feature/Auth/LoginTest.php --compact
```

Esperado: todos passam.

- [ ] **Step 12.3: Criar `tests/Feature/Auth/RegisterTest.php`**

```php
<?php

use App\Models\User;

it('renders register page for guests', function (): void {
    $this->get('/register')
        ->assertInertia(fn ($page) => $page->component('Auth/Register'));
});

it('redirects authenticated users away from register page', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get('/register')
        ->assertRedirect('/dashboard');
});

it('creates a new user with valid data', function (): void {
    $this->post('/register', [
        'name' => 'Artur Silva',
        'email' => 'artur@exemplo.com',
        'password' => 'senha12345',
        'password_confirmation' => 'senha12345',
    ])->assertRedirect('/dashboard');

    $this->assertAuthenticated();

    $this->assertDatabaseHas('users', [
        'name' => 'Artur Silva',
        'email' => 'artur@exemplo.com',
        'aceitou_termos' => true,
    ]);
});

it('rejects duplicate email', function (): void {
    User::factory()->create(['email' => 'existente@exemplo.com']);

    $this->post('/register', [
        'name' => 'Outro Usuário',
        'email' => 'existente@exemplo.com',
        'password' => 'senha12345',
        'password_confirmation' => 'senha12345',
    ])->assertSessionHasErrors('email');
});

it('requires password confirmation', function (): void {
    $this->post('/register', [
        'name' => 'Artur Silva',
        'email' => 'artur@exemplo.com',
        'password' => 'senha12345',
        'password_confirmation' => 'senha-diferente',
    ])->assertSessionHasErrors('password');
});
```

- [ ] **Step 12.4: Rodar os testes de registro**

```bash
./vendor/bin/pest tests/Feature/Auth/RegisterTest.php --compact
```

Esperado: todos passam.

- [ ] **Step 12.5: Criar `tests/Feature/Auth/LogoutTest.php`**

```php
<?php

use App\Models\User;

it('logs out authenticated user', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post('/logout')
        ->assertRedirect('/');

    $this->assertGuest();
});

it('redirects guests away from protected routes', function (): void {
    $this->get('/dashboard')
        ->assertRedirect('/login');
});
```

- [ ] **Step 12.6: Rodar os testes de logout**

```bash
./vendor/bin/pest tests/Feature/Auth/LogoutTest.php --compact
```

Esperado: todos passam.

- [ ] **Step 12.7: Rodar todos os testes**

```bash
./vendor/bin/pest --compact
```

Esperado: todos os testes passam.

- [ ] **Step 12.8: Commit**

```bash
git add tests/Feature/Auth/
git commit -m "test: add Pest feature tests for authentication (login, register, logout)"
```

---

### Task 13: Atualizar `CLAUDE.md` com Novas Convenções

**Por que isso importa:** O `CLAUDE.md` é lido por agentes de IA em futuras sessões. Precisamos atualizar as convenções para refletir o uso de Pest (em vez de PHPUnit puro) e a nova estrutura de pastas.

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 13.1: Atualizar a seção de testes no `CLAUDE.md`**

Localizar a seção `=== phpunit/core rules ===` e substituir por:

```
=== pest/core rules ===

# Pest PHP

- This application uses Pest PHP for testing. All tests must be written using Pest syntax: `it('description', fn() => ...)`.
- Use `php artisan make:test {name}` to create a new feature test, and `php artisan make:test --unit {name}` for unit tests. Then convert the generated class to Pest syntax.
- Every time a test has been updated, run that singular test.
- When the tests relating to your feature are passing, ask the user if they would like to also run the entire test suite.
- Tests should cover all happy paths, failure paths, and edge cases.
- You must not remove any tests or test files without approval.

## Running Tests

- To run all tests: `./vendor/bin/pest --compact`.
- To run all tests in a file: `./vendor/bin/pest tests/Feature/Auth/LoginTest.php --compact`.
- To filter on a particular test name: `./vendor/bin/pest --filter="logs out authenticated user" --compact`.
```

- [ ] **Step 13.2: Adicionar seção de arquitetura ao `CLAUDE.md`**

Adicionar após as regras existentes:

```
=== app/architecture rules ===

# Application Architecture

## Directory Structure

Beyond the standard Laravel directories, this application has:

- `app/Actions/` — Single-purpose business operations. One class, one `handle()` method. Use directly in controllers for simple operations.
- `app/Services/` — Orchestrates multiple Actions. Use when business logic spans multiple models or requires coordination.
- `app/Queries/` — Reusable Eloquent query builders. Encapsulate complex queries to keep controllers thin.
- `app/Concerns/` — Traits for Eloquent Models. Example: `HasPublicId` generates UUIDs on creation.
- `app/Traits/` — Generic PHP traits (not tied to Models). Can be used in controllers, jobs, commands.
- `app/Http/Services/` — HTTP-layer specific logic: response formatting, webhook parsing, external HTTP integrations.

## Inertia.js

- All routes are in `routes/web.php`. There is no `routes/api.php`.
- Controllers return `Inertia::render('PageName', $props)` for pages and `redirect()` for form submissions.
- Authentication uses Laravel sessions (cookies), not Sanctum tokens.
- Shared data (auth.user, flash messages) is configured in `app/Http/Middleware/HandleInertiaRequests.php`.
- Frontend TypeScript types for shared data are in `resources/js/types/index.d.ts`.
```

- [ ] **Step 13.3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md with Pest and new architecture conventions"
```

---

### Task 14: Deletar `arturflix-web`

**Por que deletar e não arquivar:** O projeto está em desenvolvimento inicial, sem histórico de produção. Todo código relevante foi migrado para dentro do Laravel. Manter dois diretórios seria overhead desnecessário.

**Antes de deletar, verificar:**
- [ ] `bun run build` passa sem erros
- [ ] `./vendor/bin/pest --compact` passa sem erros
- [ ] Nenhum arquivo do `arturflix-web` ainda é necessário

- [ ] **Step 14.1: Verificação final de build e testes**

```bash
bun run build && ./vendor/bin/pest --compact
```

Esperado: build sem erros, todos os testes passam.

- [ ] **Step 14.2: Confirmar que nada mais é necessário do `arturflix-web`**

```bash
ls ../arturflix-web/src/
```

Verificar se há algo que ainda não foi migrado. Os arquivos de store (`authStore.ts`) e `lib/api.ts` são descartados intencionalmente. Componentes de `course/` são placeholders — confirmar com o usuário se há algum conteúdo relevante.

- [ ] **Step 14.3: Deletar o diretório `arturflix-web`**

```bash
rm -rf ../arturflix-web
```

- [ ] **Step 14.4: Commit final**

```bash
git add -A
git commit -m "chore: remove arturflix-web — frontend fully migrated to Laravel+Inertia"
```

---

## Resumo do que foi feito

| Chunk | O que foi entregue |
|---|---|
| 1 — Fundação | Pest instalado, Breeze + Inertia scaffold, estrutura de pastas, Vite com Tailwind v4 |
| 2 — Frontend | Componentes e páginas migrados do arturflix-web para resources/js/ |
| 3 — Backend | HandleInertiaRequests configurado, controllers adaptados, rotas unificadas em web.php, Sanctum removido |
| 4 — Testes | Testes Pest para auth, CLAUDE.md atualizado, arturflix-web deletado |

**Resultado:** Um único projeto Laravel servindo React via Inertia.js, com autenticação por sessão, Tailwind v4, Pest PHP, e estrutura de pastas organizada para escalar.
