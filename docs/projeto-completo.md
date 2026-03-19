# ArturFlix — Documentação Completa do Projeto

> **Objetivo deste documento:** Guia de estudo e referência técnica da plataforma ArturFlix. Cobre arquitetura, decisões de design, fluxo de dados e os trechos de código mais importantes — com explicações do "por quê" de cada escolha.

---

## Índice

1. [O que é o ArturFlix](#1-o-que-é-o-arturflix)
2. [Stack tecnológica](#2-stack-tecnológica)
3. [Por que Inertia.js — a decisão central](#3-por-que-inertiajs--a-decisão-central)
4. [Como o Inertia conecta Laravel e React](#4-como-o-inertia-conecta-laravel-e-react)
5. [Estrutura de pastas](#5-estrutura-de-pastas)
6. [Fluxo completo de uma requisição](#6-fluxo-completo-de-uma-requisição)
7. [Autenticação — sessão, middleware e estado global](#7-autenticação--sessão-middleware-e-estado-global)
8. [Banco de dados — modelos, migrations e padrões](#8-banco-de-dados--modelos-migrations-e-padrões)
9. [Páginas e layouts React](#9-páginas-e-layouts-react)
10. [Ferramentas de desenvolvimento](#10-ferramentas-de-desenvolvimento)

---

## 1. O que é o ArturFlix

ArturFlix é uma plataforma de cursos online com gamificação, vídeos legendados e certificados digitais. O backend é uma aplicação **Laravel 12** que serve como fonte de dados, autenticação e lógica de negócio. O frontend é uma **SPA (Single Page Application) em React 18 com TypeScript**. Os dois são conectados pelo **Inertia.js**, que elimina a necessidade de uma API REST separada.

---

## 2. Stack tecnológica

### Backend (PHP)

| Tecnologia      | Versão | Função                                    |
| --------------- | ------ | ----------------------------------------- |
| PHP             | 8.4    | Linguagem do servidor                     |
| Laravel         | 12     | Framework principal                       |
| Inertia Laravel | 2.x    | Adaptador Inertia para o servidor         |
| Laravel Breeze  | 2.x    | Scaffold de autenticação                  |
| Ziggy           | 2.x    | Expõe rotas nomeadas do Laravel para o JS |
| SQLite          | —      | Banco de dados (desenvolvimento)          |
| Pest PHP        | 3.x    | Framework de testes                       |
| Laravel Pint    | 1.x    | Formatador de código PHP                  |

### Frontend (JavaScript/TypeScript)

| Tecnologia            | Versão | Função                                |
| --------------------- | ------ | ------------------------------------- |
| React                 | 18     | Biblioteca de UI                      |
| TypeScript            | 5.x    | Tipagem estática                      |
| Inertia React         | 2.x    | Adaptador Inertia para o cliente      |
| Vite                  | 6.x    | Bundler e dev server                  |
| Tailwind CSS          | 4.x    | Estilização utilitária                |
| Tailwind Merge + clsx | —      | Utilitários para classes condicionais |
| Lucide React          | —      | Ícones SVG                            |

---

## 3. Por que Inertia.js — a decisão central

### O problema que o Inertia resolve

Construir um frontend moderno em React com um backend Laravel normalmente exige **duas aplicações separadas**:

```
Opção tradicional (sem Inertia):

[React SPA]  ←——— HTTP/JSON ———→  [Laravel API]
  porta 3000                          porta 8000

Problemas:
  - Dois projetos para manter
  - Autenticação via JWT ou tokens (complexo)
  - CORS configurado manualmente
  - Rotas duplicadas (frontend + backend)
  - TypeScript types gerados manualmente ou via OpenAPI
```

### O que o Inertia faz

O Inertia permite usar o **roteamento e controllers do Laravel** diretamente, enquanto o **frontend continua sendo React**. Não é uma API REST — é um protocolo que transporta componentes React com seus dados.

```
Com Inertia:

[React SPA]  ←——— Inertia Protocol ———→  [Laravel]
  mesmo servidor                          mesmo domínio

Benefícios:
  - Um projeto só
  - Autenticação por sessão (cookie), igual a uma app Laravel tradicional
  - Sem CORS
  - Rotas definidas apenas no Laravel
  - Props tipadas diretamente do controller para o componente
```

### A analogia

Pense no Inertia como um **sistema de template moderno**. No Laravel tradicional, um controller retorna uma view Blade. Com o Inertia, o controller retorna um **componente React com props** — mas o Laravel não precisa saber nada sobre React, e o React não precisa saber nada sobre rotas.

```
Sem Inertia (Blade):           Com Inertia:
  return view('dashboard',       return Inertia::render('Dashboard',
      ['user' => $user]);            ['user' => $user]);

O controller não mudou de ideia. Só mudou o que ele retorna.
```

---

## 4. Como o Inertia conecta Laravel e React

### As quatro peças fundamentais

#### 4.1 O template HTML único — `resources/views/app.blade.php`

Todo o site sai deste único arquivo. Ele é renderizado **apenas uma vez** (na primeira visita). Nas navegações seguintes, ele não é re-renderizado.

```html
<!-- Versão simplificada — o arquivo real inclui <meta charset>, <meta viewport> e link de fontes -->
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        @routes          <!-- injeta as rotas Laravel no window (via Ziggy) -->
        @viteReactRefresh <!-- hot reload do React em desenvolvimento -->
        @vite(['resources/js/app.tsx', "resources/js/Pages/{$page['component']}.tsx"])
        @inertiaHead     <!-- renderiza <title>, <meta> definidos nos componentes React -->
    </head>
    <body class="font-sans antialiased">
        @inertia         <!-- gera <div id="app" data-page="...JSON..."> -->
    </body>
</html>
```

**O que cada diretiva faz:**

- `@routes` — serializa todas as rotas nomeadas do Laravel em `window.Ziggy` (os dados) e expõe a função `route()` em `window.route`. Isso permite usar `route('dashboard')` no TypeScript, igual a como você usaria no PHP.
- `@vite(...)` — em desenvolvimento, injeta scripts do dev server Vite. Em produção, resolve os hashes do `manifest.json` para os assets compilados.
- `@inertia` — gera a `<div id="app">` com o componente inicial e seus props serializados como JSON no atributo `data-page`.

#### 4.2 O entry point JavaScript — `resources/js/app.tsx`

Este é o primeiro arquivo JS executado no browser. Ele inicializa o Inertia e monta o React:

```tsx
import { createInertiaApp } from '@inertiajs/react'
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers'
import { createRoot } from 'react-dom/client'

createInertiaApp({
    // Formata o título da aba: "Dashboard - ArturFlix"
    title: (title) => `${title} - ${appName}`,

    // Recebe o nome do componente (ex: 'Auth/Login') e encontra o arquivo
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'), // carrega todos os arquivos de Pages/
        ),

    // Monta o React na <div id="app"> gerada pelo @inertia do Blade
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />)
    },

    // Barra de progresso que aparece durante navegações Inertia
    progress: {
        color: '#4B5563',
    },
})
```

**Como a resolução de páginas funciona:**
Quando o Laravel faz `Inertia::render('Auth/Login', $props)`, o nome `'Auth/Login'` chega ao frontend. O `resolvePageComponent` mapeia isso para `./Pages/Auth/Login.tsx`. O `import.meta.glob` é uma feature do Vite que cria um mapa de todos os arquivos `.tsx` em `Pages/` em tempo de build.

#### 4.3 O middleware de dados compartilhados — `HandleInertiaRequests.php`

Este middleware roda em **toda requisição web** e injeta dados que ficam disponíveis em **todos os componentes React** automaticamente:

```php
class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app'; // aponta para resources/views/app.blade.php

    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(), // null se não autenticado
            ],
            'flash' => [
                'success' => session('success'),
                'error'   => session('error'),
            ],
        ];
    }
}
```

**Por que isso é importante:** Sem este middleware, cada controller teria que passar `auth.user` manualmente para cada `Inertia::render()`. Com ele, qualquer componente React pode ler o usuário logado via `usePage().props.auth.user` sem receber a informação como prop explícita.

#### 4.4 Os tipos TypeScript compartilhados — `resources/js/types/index.d.ts`

Define os tipos das props que o middleware acima compartilha. É a "ponte de tipos" entre o PHP e o TypeScript:

```typescript
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
    [key: string]: unknown // props adicionais de cada página
}
```

Estes tipos são usados em qualquer componente para acessar as props de forma tipada:

```tsx
const { auth } = usePage<PageProps>().props
// auth.user é User | null — TypeScript sabe disso
```

### O protocolo Inertia em ação

```
Primeira visita a qualquer URL:

  Browser ──GET /dashboard──► Laravel
                              Controller: Inertia::render('Dashboard', ['user' => $user])
                              Middleware: adiciona auth.user, flash
                              Resposta: HTML completo (app.blade.php)
                                        com <div data-page='{"component":"Dashboard","props":{...}}'>
  Browser ◄────HTML──────────

  React monta, hidrata o componente Dashboard com os props.


Navegação seguinte (clique em <Link href="/cursos">):

  Browser ──GET /cursos──► Laravel
           Header:          Controller: Inertia::render('Cursos/Index')
           X-Inertia: true  Resposta: JSON apenas
                            {"component":"Cursos/Index","props":{...},"url":"/cursos"}
  Browser ◄────JSON────────

  React troca o componente Dashboard pelo Cursos/Index sem recarregar a página.
  A URL muda via History API.
```

O header `X-Inertia: true` é o que diferencia uma requisição Inertia de uma requisição normal. O Laravel detecta esse header e, em vez de retornar o HTML completo, retorna apenas o JSON do próximo componente.

---

## 5. Estrutura de pastas

```
arturflix/
│
├── app/                          # Lógica de aplicação (PHP)
│   ├── Concerns/                 # Traits para Eloquent Models
│   │   └── HasPublicId.php       # Gera UUID automaticamente ao criar qualquer model
│   ├── Enums/                    # Enumerações PHP tipadas
│   │   ├── PapelEnum.php         # aluno | admin | superuser
│   │   ├── StatusChamadoEnum.php # status dos tickets de suporte
│   │   └── TipoAulaEnum.php      # tipo de aula (vídeo, texto, etc.)
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Auth/             # Controllers de autenticação (Breeze)
│   │   └── Middleware/
│   │       ├── HandleInertiaRequests.php  # dados globais para o React
│   │       └── EnsureEmailIsVerified.php  # proteção de rota por email verificado
│   ├── Models/                   # Eloquent Models (um por tabela)
│   │   ├── User.php              # model principal de autenticação
│   │   ├── Curso.php             # cursos da plataforma
│   │   ├── Modulo.php            # módulos de um curso
│   │   ├── Aula.php              # aulas de um módulo
│   │   ├── Matricula.php         # relação usuário ↔ curso
│   │   ├── ProgressoAula.php     # progresso por aula
│   │   ├── Certificado.php       # certificado emitido
│   │   ├── PerfilGamificado.php  # XP, conquistas, gamificação
│   │   ├── HistoricoXP.php       # log de ganho de XP
│   │   ├── AvaliacaoAula.php     # avaliação/rating de uma aula
│   │   ├── ComentarioAula.php    # comentários nas aulas
│   │   ├── ChamadoSuporte.php    # tickets de suporte
│   │   ├── Legenda.php           # legendas de vídeos
│   │   ├── Material.php          # materiais complementares
│   │   └── LogAuditoria.php      # log de ações para auditoria
│   └── Providers/
│       └── AppServiceProvider.php
│
├── bootstrap/
│   └── app.php                   # ponto de entrada da aplicação Laravel 12
│                                 # registra middleware, rotas, exceções
│
├── config/                       # arquivos de configuração
│   ├── app.php                   # nome, timezone, locale
│   ├── auth.php                  # guards e providers de autenticação
│   ├── database.php              # conexões de banco (SQLite em dev)
│   └── ...
│
├── database/
│   ├── migrations/               # histórico do schema do banco
│   ├── factories/                # dados falsos para testes
│   └── seeders/                  # seed inicial do banco
│
├── docs/                         # documentação do projeto
│   ├── projeto-completo.md       # este arquivo
│   ├── autenticacao.md           # detalhes do fluxo de auth
│   ├── breeze-inertia-files-explained.md  # explicação dos arquivos do Breeze
│   ├── arturflix.dbml            # schema do banco em DBML
│   └── arturflix.dbdiagram       # diagrama visual do banco
│
├── public/                       # arquivos acessíveis diretamente pelo browser
│   ├── index.php                 # entry point PHP (toda requisição passa aqui)
│   ├── logo-arturflix.png        # logo
│   └── fonts/                   # fontes customizadas (Bebas Neue)
│
├── resources/
│   ├── css/
│   │   └── app.css               # importa o Tailwind CSS v4
│   ├── js/                       # todo o frontend React
│   │   ├── app.tsx               # entry point — inicializa o Inertia + React
│   │   ├── bootstrap.ts          # configura Axios globalmente
│   │   ├── Pages/                # um arquivo por rota (convenção Inertia)
│   │   │   ├── Welcome.tsx       # página inicial pública
│   │   │   ├── Dashboard.tsx     # painel do aluno (requer auth)
│   │   │   ├── Auth/             # login, register, reset de senha
│   │   │   ├── Cursos/
│   │   │   │   └── Index.tsx     # listagem de cursos
│   │   │   └── Suporte/
│   │   │       └── Index.tsx     # página de suporte
│   │   ├── layouts/              # estrutura visual das páginas
│   │   │   ├── AppLayout.tsx     # layout com Navbar + Footer (usuários autenticados)
│   │   │   └── GuestLayout.tsx   # layout com Navbar + Footer (visitantes)
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.tsx    # barra de navegação global
│   │   │   │   └── Footer.tsx    # rodapé global
│   │   │   └── ui/               # componentes de interface reutilizáveis
│   │   │       ├── button.tsx
│   │   │       ├── card.tsx
│   │   │       ├── input.tsx
│   │   │       └── ...
│   │   ├── lib/
│   │   │   └── utils.ts          # função cn() para classes Tailwind condicionais
│   │   └── types/
│   │       ├── index.d.ts        # tipos principais (User, PageProps)
│   │       ├── global.d.ts       # tipos globais (window.route, etc.)
│   │       └── vite-env.d.ts     # tipos do Vite (import.meta.env)
│   └── views/
│       └── app.blade.php         # o único template HTML do projeto
│
├── routes/
│   ├── web.php                   # todas as rotas HTTP (inclui as rotas de auth diretamente)
│   ├── auth.php                  # arquivo gerado pelo Breeze, não utilizado pelo web.php atual
│   └── console.php               # comandos Artisan personalizados
│
├── tests/
│   ├── Feature/                  # testes de integração
│   └── Unit/                     # testes unitários
│
├── bootstrap/app.php             # configura middleware, rotas, exceções (Laravel 12)
├── vite.config.ts                # configuração do bundler Vite
├── tsconfig.json                 # configuração do TypeScript
├── composer.json                 # dependências PHP
└── package.json                  # dependências JavaScript
```

---

## 6. Fluxo completo de uma requisição

### 6.1 Primeira visita — `/dashboard`

```
1. Browser digita arturflix.test/dashboard
        ↓
2. public/index.php
   (toda requisição HTTP chega aqui — é o entry point do PHP)
        ↓
3. bootstrap/app.php
   Laravel configura a aplicação, registra middleware e rotas
        ↓
4. routes/web.php
   Route::middleware('auth')->group(function (): void {
       Route::get('/dashboard', fn () => Inertia::render('Dashboard'))->name('dashboard');
   })
   O middleware 'auth' verifica a sessão.
   Se não autenticado → redireciona para /login
   Se autenticado → continua
        ↓
5. HandleInertiaRequests middleware (roda em toda requisição web)
   Injeta nos props globais:
   - auth.user = User autenticado
   - flash.success, flash.error = mensagens de sessão
        ↓
6. Inertia::render('Dashboard') é chamado
   Laravel detecta que é a primeira visita (sem header X-Inertia)
   Renderiza resources/views/app.blade.php com:
   <div id="app" data-page='{"component":"Dashboard","props":{"auth":{"user":{...}},...}}'/>
        ↓
7. HTML chega ao browser
        ↓
8. Vite carrega app.tsx
   createInertiaApp() lê o data-page da div#app
   resolve('Dashboard') → carrega Pages/Dashboard.tsx
   React monta o componente Dashboard com os props deserializados
        ↓
9. Usuário vê a página renderizada
```

### 6.2 Navegação SPA — clique em "Cursos"

```
1. Usuário clica em <Link href="/cursos"> do Inertia (não um <a> comum)
        ↓
2. Inertia intercepta o clique
   Faz fetch GET /cursos com o header:
   X-Inertia: true
   X-Inertia-Version: [hash do manifest Vite]
        ↓
3. Laravel processa normalmente (middleware, rota, controller)
   Detecta o header X-Inertia: true
   Retorna JSON em vez de HTML:
   {
     "component": "Cursos/Index",
     "props": { "auth": {...}, ... },
     "url": "/cursos"
   }
        ↓
4. Inertia no frontend recebe o JSON
   Atualiza a URL via History API (sem reload)
   Troca o componente atual (Dashboard) pelo novo (Cursos/Index)
   Passa os novos props
        ↓
5. React re-renderiza apenas o componente que mudou
   Navbar e Footer permanecem intactos (estão no layout)
```

### 6.3 Submit de formulário — login

```
1. Usuário preenche o form de login e clica em "Entrar"
        ↓
2. Login.tsx — o hook useForm do Inertia gerencia o estado:
   const { data, setData, post, processing, errors } = useForm({
       email: '',
       password: '',
   })
        ↓
3. handleSubmit chama: post('/login')
   Inertia faz POST /login com os dados do form
   Header X-Inertia: true incluído automaticamente
        ↓
4. Laravel — AuthenticatedSessionController@store
   Valida as credenciais
   Se inválidas: retorna erros de validação → Inertia popula errors.email, errors.password
   Se válidas: autentica a sessão, redireciona para /dashboard
        ↓
5. Inertia segue o redirect automaticamente
   Faz GET /dashboard com X-Inertia: true
   Recebe o componente Dashboard com os novos props (agora com auth.user preenchido)
        ↓
6. Navbar atualiza — agora mostra o nome do usuário e o botão "Sair"
```

---

## 7. Autenticação — sessão, middleware e estado global

### Como a autenticação funciona

O projeto usa **autenticação por sessão com cookie**, o mesmo mecanismo do Laravel tradicional. Não há JWT, não há tokens Bearer — é um cookie `laravel_session` que o browser envia automaticamente em toda requisição.

```
Login bem-sucedido:
  Laravel cria a sessão no servidor
  Envia Set-Cookie: laravel_session=... para o browser
  O browser guarda e reenvia esse cookie em toda requisição seguinte
  Laravel lê o cookie, encontra a sessão, sabe quem é o usuário
```

### Por que não JWT?

JWT (JSON Web Tokens) é mais adequado quando a API precisa ser consumida por **apps mobile** ou **serviços externos** — contextos onde não há cookie. Para uma SPA no mesmo domínio, cookies de sessão são mais seguros:

- Cookies `HttpOnly` não são acessíveis pelo JavaScript → protege contra XSS
- Proteção CSRF automática via token
- Não requer gerenciar refresh tokens no frontend

### Como o React sabe quem está logado

O fluxo é:

```
1. HandleInertiaRequests::share() roda em toda requisição
   Coloca $request->user() nos props globais como auth.user

2. Qualquer componente React pode ler:
   const { auth } = usePage<PageProps>().props
   // auth.user é User | null

3. Navbar.tsx usa isso para decidir o que renderizar:
   {auth.user ? (
       // mostra nome + botão Sair
   ) : (
       // mostra links Entrar + Cadastrar
   )}
```

### Proteção de rotas

No Laravel, rotas protegidas usam o middleware `auth`:

```php
// routes/web.php
Route::middleware('auth')->group(function (): void {
    Route::get('/dashboard', fn () => Inertia::render('Dashboard'))->name('dashboard');
});
```

Se o usuário não estiver autenticado e tentar acessar `/dashboard`, o Laravel redireciona automaticamente para `/login`. Não é preciso fazer nenhuma verificação no frontend.

### Rotas só para visitantes (guests)

O middleware `guest` faz o oposto — se o usuário já estiver logado e tentar acessar `/login` ou `/register`, é redirecionado para `/dashboard`:

```php
Route::middleware('guest')->group(function (): void {
    Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('/login', [AuthenticatedSessionController::class, 'store']);
    // ...
});
```

### Logout

O logout é feito via POST (não GET) por segurança — evita que um link externo faça logout do usuário sem sua intenção:

```tsx
// Navbar.tsx
function handleLogout() {
    router.post('/logout') // router do Inertia, não fetch manual
}
```

---

## 8. Banco de dados — modelos, migrations e padrões

### Banco de dados em desenvolvimento

O projeto usa **SQLite** em desenvolvimento — um único arquivo `database/database.sqlite`. Isso simplifica o setup: sem servidor de banco, sem credenciais, sem configuração. Em produção, seria trocado para PostgreSQL ou MySQL via `.env`.

### Padrão `public_id` (UUID)

Todos os models principais têm dois identificadores:

| Campo       | Tipo                  | Uso                                    |
| ----------- | --------------------- | -------------------------------------- |
| `id`        | bigint auto-increment | chave primária interna, usado em JOINs |
| `public_id` | UUID                  | ID exposto para o frontend e APIs      |

**Por que dois IDs?**

Expor o `id` inteiro sequencial na URL (ex: `/usuarios/42`) revela informações sobre o volume de dados e permite enumeração. O UUID não vaza essa informação e é impossível de adivinhar:

```
/usuarios/42             → ruim: dá para saber que tem pelo menos 42 usuários
/usuarios/f47ac10b-...   → bom: opaco, impossível de enumerar
```

O UUID é gerado automaticamente pelo trait `HasPublicId` usando um Model Event do Eloquent:

```php
// app/Concerns/HasPublicId.php
trait HasPublicId
{
    protected static function bootHasPublicId(): void
    {
        // "creating" roda antes de INSERT no banco
        static::creating(function (self $model): void {
            $model->public_id = (string) Str::uuid();
        });
    }
}

// Uso nos models:
class User extends Authenticatable
{
    use HasPublicId; // basta adicionar o trait
}
```

### Roles com PHP Enum

O sistema de permissões usa um **PHP Enum** tipado (recurso do PHP 8.1+):

```php
// app/Enums/PapelEnum.php
enum PapelEnum: string
{
    case ALUNO     = 'aluno';
    case ADMIN     = 'admin';
    case SUPERUSER = 'superuser';
}
```

O Eloquent faz o cast automaticamente — o valor no banco é a string `'aluno'`, mas ao acessar `$user->papel` você recebe o enum `PapelEnum::ALUNO`:

```php
// app/Models/User.php
protected function casts(): array
{
    return [
        'papel' => PapelEnum::class, // cast automático string ↔ enum
    ];
}

// Uso:
if ($user->papel === PapelEnum::ADMIN) {
    // acesso administrativo
}
```

### Estrutura do banco

O banco modela uma plataforma completa de EAD com gamificação:

```
Hierarquia de conteúdo:
  Curso
    └── Módulo (vários por curso)
          └── Aula (várias por módulo)
                ├── Legenda (legendas do vídeo)
                ├── Material (PDFs, links, etc.)
                ├── ComentarioAula
                └── AvaliacaoAula (rating)

Relação usuário ↔ conteúdo:
  User
    ├── Matricula (cursos em que está inscrito)
    ├── ProgressoAula (progresso por aula)
    ├── Certificado (cursos concluídos)
    ├── PerfilGamificado (XP, conquistas)
    ├── HistoricoXP (log de ganho de XP)
    └── ChamadoSuporte (tickets)

Tabela de auditoria:
  LogAuditoria (registra ações importantes no sistema)
```

---

## 9. Páginas e layouts React

### Convenção de páginas

Cada rota do Laravel corresponde a **um arquivo em `resources/js/Pages/`**. A estrutura de diretórios reflete a URL:

```
Route::get('/cursos', ...)          →  Pages/Cursos/Index.tsx
Route::get('/dashboard', ...)       →  Pages/Dashboard.tsx
Route::get('/login', ...)           →  Pages/Auth/Login.tsx
```

Não é uma regra técnica do Inertia — é uma convenção do projeto que torna a navegação pelo código intuitiva.

### Como uma página recebe dados do backend

O controller passa props via `Inertia::render()`. A página os recebe como props React:

```php
// Controller (PHP):
Route::get('/dashboard', function () {
    return Inertia::render('Dashboard', [
        'cursos' => Curso::all(), // seria um Eloquent Resource em produção
    ]);
});
```

```tsx
// Pages/Dashboard.tsx (TypeScript):
interface Props {
    cursos: Array<{ id: number; titulo: string }>
}

export default function Dashboard({ cursos }: Props) {
    // cursos está tipado e disponível diretamente
}
```

### O hook `usePage` — dados globais

Para acessar dados compartilhados (auth, flash), use `usePage` do Inertia. Ele não precisa de prop explícita:

```tsx
import { usePage } from '@inertiajs/react'
import type { PageProps } from '@/types'

export function Navbar() {
    const { auth } = usePage<PageProps>().props
    // auth.user: User | null — tipado, vem do HandleInertiaRequests
}
```

### Layouts

Os layouts envolvem as páginas com a estrutura visual comum (Navbar + Footer):

```tsx
// layouts/AppLayout.tsx
export default function AppLayout({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen flex flex-col bg-[#0d1016]">
            <Navbar />
            <main className="flex-1 pt-14">{children}</main>
            <Footer />
        </div>
    )
}

// Uso em uma página:
export default function Dashboard() {
    return (
        <AppLayout>
            <Head title="Dashboard" />
            {/* conteúdo da página */}
        </AppLayout>
    )
}
```

O projeto tem dois layouts com a mesma estrutura visual (por enquanto):
- `AppLayout` — para páginas que requerem autenticação (`Dashboard`, etc.)
- `GuestLayout` — para páginas públicas (`Welcome`, `Cursos/Index`, etc.)

> **Nota:** As páginas de autenticação (`Login`, `Register`, etc.) **não usam esses layouts**. Elas renderizam sua própria estrutura de página diretamente, com layout próprio centrado e sem Navbar/Footer — um padrão visual distinto para o fluxo de auth.

### O componente `<Head>`

O `<Head>` do Inertia define o `<title>` e outras meta tags da página. Ele se integra com `@inertiaHead` no Blade:

```tsx
<Head title="Dashboard" />
// Resultado no browser: <title>Dashboard - ArturFlix</title>
// O formato "Título - AppName" é configurado no app.tsx
```

### O componente `<Link>` vs `<a>`

Sempre use `<Link>` do Inertia no lugar de `<a>` para navegação interna. O `<Link>` intercepta o clique e faz a navegação via XHR (SPA), mantendo o estado da aplicação:

```tsx
import { Link } from '@inertiajs/react'

// Correto — navegação SPA, sem reload
<Link href="/cursos">Cursos</Link>

// Evitar para navegação interna — causa reload completo da página
<a href="/cursos">Cursos</a>
```

### Formulários com `useForm`

O hook `useForm` do Inertia gerencia estado, envio e erros de validação do backend:

```tsx
// Pages/Auth/Login.tsx
const { data, setData, post, processing, errors } = useForm({
    email: '',
    password: '',
})

function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    post('/login') // faz POST /login com data, segue redirect automaticamente
}
```

Erros de validação do Laravel chegam automaticamente em `errors` após o submit. No `Login.tsx` atual, o erro de email é exibido como um **banner acima do formulário** (não inline por campo):

```tsx
{errors.email && (
    <p className="text-red-400 text-sm mb-4 bg-red-950/30 border border-red-900/50 rounded-lg px-3 py-2">
        {errors.email}
    </p>
)}
```

Erros de **validação client-side** (antes do submit) usam um estado local `clientErrors` e aparecem inline sob cada campo. Os dois sistemas convivem: `clientErrors` valida em tempo real no browser, `errors` exibe falhas vindas do servidor.

**O que `useForm` gerencia automaticamente:**
- `processing: boolean` — `true` enquanto a requisição está em andamento (usado para desabilitar o botão)
- `errors` — erros de validação do Laravel por campo, populados após resposta do servidor
- Segue redirects do Laravel automaticamente
- Envia o token CSRF automaticamente

---

## 10. Ferramentas de desenvolvimento

### Vite — bundler e dev server

O Vite substitui o webpack. É significativamente mais rápido porque usa ES Modules nativos do browser em desenvolvimento, sem bundle step:

```typescript
// vite.config.ts
export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.tsx', // entry point único
            refresh: true,                 // recarrega o browser quando PHP muda
        }),
        react(),       // suporte a JSX/TSX + React Fast Refresh
        tailwindcss(), // Tailwind v4 via plugin Vite
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'resources/js'), // @/ → resources/js/
        },
    },
})
```

**Para rodar em desenvolvimento:**
```bash
composer run dev
# Inicia em paralelo: PHP server, queue worker, pail (logs), Vite dev server
```

**Para produção:**
```bash
npm run build
# TypeScript verifica tipos, Vite compila e gera public/build/
```

### Tailwind CSS v4

O projeto usa Tailwind CSS v4, que tem uma abordagem diferente das versões anteriores — não há `tailwind.config.js`. A configuração é feita via CSS:

```css
/* resources/css/app.css */
@import "tailwindcss";
```

O Tailwind v4 detecta automaticamente os arquivos do projeto. Toda estilização é feita com classes utilitárias diretamente no JSX:

```tsx
<div className="bg-[#12151b] border border-[#1e2430] rounded-xl p-6">
```

Valores arbitrários como `bg-[#12151b]` permitem usar cores exatas do design sem configuração extra.

### Ziggy — rotas nomeadas no JavaScript

O Ziggy expõe as rotas nomeadas do Laravel para o TypeScript via a função `route()`. A diretiva `@routes` no `app.blade.php` serializa os dados das rotas em `window.Ziggy` e disponibiliza a função `route()` em `window.route`:

```tsx
// Em vez de string hardcoded:
post('/login')

// Com Ziggy (quando a rota tem nome):
post(route('login'))
// route('login') resolve para '/login' usando a tabela de rotas do Laravel
```

Isso evita que URLs fiquem espalhadas pelo frontend — se uma rota mudar no Laravel, só precisa mudar em `routes/web.php`.

### Laravel Pint — formatador de código PHP

O Pint é o formatador oficial do Laravel (similar ao Prettier para JS). Roda automaticamente antes de finalizar qualquer alteração PHP:

```bash
vendor/bin/pint --dirty --format agent
# Formata apenas os arquivos modificados
```

### Pest PHP — framework de testes

O projeto usa Pest, um framework de testes com sintaxe funcional mais concisa que o PHPUnit puro:

```php
// Sintaxe Pest (usada neste projeto):
it('redireciona usuários não autenticados para o login', function () {
    $response = $this->get('/dashboard');
    $response->assertRedirect('/login');
});

// Sintaxe PHPUnit (não usada):
public function test_redireciona_usuarios_nao_autenticados(): void
{
    $response = $this->get('/dashboard');
    $response->assertRedirect('/login');
}
```

```bash
# Rodar todos os testes:
./vendor/bin/pest --compact

# Rodar um arquivo específico:
./vendor/bin/pest tests/Feature/InertiaSharedDataTest.php --compact
```

---

*Documentação gerada em 2026-03-12. Reflete o estado atual do projeto: frontend básico implementado, backend com modelos e migrations criados, autenticação funcional via Laravel Breeze + Inertia.js.*
