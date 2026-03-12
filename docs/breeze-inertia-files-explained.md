# Arquivos do Breeze + Inertia — O que cada um faz

Este documento explica cada arquivo gerado pelo Laravel Breeze com o preset `react --typescript`.
O objetivo é entender o papel de cada um antes de começar a modificar qualquer coisa.

---

## Backend

### `app/Http/Middleware/HandleInertiaRequests.php`

**O que é:** Middleware que roda em toda requisição web ao servidor.

**O que faz:** Define dados compartilhados globalmente com o frontend via o método `share()`. O arquivo atual compartilha um único objeto `auth` contendo o usuário autenticado:

```php
'auth' => [
    'user' => $request->user(),
],
```

O método `version()` delega ao pai para controle de versão de assets — quando o hash do manifesto Vite muda, o Inertia força um reload completo da página automaticamente.

**Por que importa:** Sem este middleware, cada controller teria que passar `auth.user` manualmente para cada `Inertia::render()`. Com ele, `usePage().props.auth.user` está disponível em qualquer componente React automaticamente.

---

### `resources/views/app.blade.php`

**O que é:** O único template HTML do projeto — todo o site sai deste arquivo.

**O que faz:** É uma página HTML mínima com quatro diretivas Blade especiais no `<head>`:

- `@routes` — injeta as rotas nomeadas do Laravel como JSON no `window`, permitindo usar `route('dashboard')` no JavaScript via o pacote Ziggy
- `@viteReactRefresh` — injeta o script de React Fast Refresh do Vite (recarrega componentes React sem perder estado durante desenvolvimento)
- `@vite([...])` — injeta as tags `<script>` e `<link>` para `app.tsx` e para o componente da página atual (`$page['component']`), resolvendo os hashes de produção automaticamente
- `@inertiaHead` — renderiza tags `<title>`, `<meta>` e similares definidas nos componentes React via `<Head>` do Inertia

No `<body>` há apenas `@inertia`, que gera a `<div id="app">` contendo os dados da primeira página como JSON em `data-page`.

**O fluxo:**
- **Primeira visita:** Laravel renderiza este arquivo completo com o componente React hidratado dentro de `@inertia`
- **Navegações seguintes:** Inertia intercepta cliques em `<Link>` e faz XHR, recebendo apenas o próximo componente + props em JSON — este template não é re-renderizado

---

### `routes/web.php`

**O que é:** Arquivo de rotas HTTP do projeto.

**O que faz:** Define quatro grupos de rotas:

1. **Rota raiz `/`** — pública, renderiza a página `Welcome` passando `canLogin`, `canRegister`, `laravelVersion` e `phpVersion` como props
2. **`/dashboard`** — protegida por `auth` e `verified`, renderiza a página `Dashboard`
3. **Grupo `auth`** — rotas de perfil (`/profile`) com edição (`GET`), atualização (`PATCH`) e exclusão (`DELETE`), todas protegidas por `auth`
4. **`require __DIR__.'/auth.php'`** — inclui as rotas de autenticação do Breeze (login, register, logout, password reset, etc.)

Todas as rotas retornam `Inertia::render('NomeDaPagina', $props)` em vez de `view()` ou JSON.

**Diferença de antes:** As rotas web substituem completamente as rotas API para o frontend. Com Inertia não há mais `/api/` endpoints para o cliente React — tudo passa por `web.php` com sessão e CSRF.

---

### `bootstrap/app.php` (middleware adicionado)

**O que foi adicionado pelo Breeze:** Dois middlewares registrados no grupo `web` via `$middleware->web(append: [...])`:

1. `HandleInertiaRequests::class` — compartilha `auth.user` com todas as páginas (explicado acima)
2. `AddLinkHeadersForPreloadedAssets::class` — adiciona headers HTTP `Link: <url>; rel=preload` para assets, melhorando performance em HTTP/2

Também está presente o `EnsureFrontendRequestsAreStateful::class` no grupo `api` (via Sanctum), que permite que o frontend web faça requisições autenticadas à rota `/api` usando cookies de sessão em vez de tokens.

---

## Frontend

### `resources/js/app.tsx`

**O que é:** Entry point do frontend — o primeiro arquivo JavaScript executado no browser.

**O que faz:** Inicializa o aplicativo Inertia com `createInertiaApp()`, configurando:

- **`title`** — formata o título de cada página como `"Título da Página - NomeDoApp"` usando `VITE_APP_NAME` do `.env`
- **`resolve`** — função que recebe o nome de um componente (ex: `'Auth/Login'`) e o transforma no módulo correto usando `resolvePageComponent` com o glob `import.meta.glob('./Pages/**/*.tsx')`
- **`setup`** — monta o React na `<div id="app">` gerada pelo `@inertia` do Blade usando `createRoot(el).render(<App {...props} />)`
- **`progress`** — configura a barra de progresso de cor `#4B5563` (cinza) que aparece durante navegações Inertia

**O processo de resolução de páginas:** Quando o Laravel faz `Inertia::render('Auth/Login', $props)`, o `name` recebido no frontend é `'Auth/Login'`. O `resolvePageComponent` mapeia isso para `./Pages/Auth/Login.tsx` via o glob `import.meta.glob('./Pages/**/*.tsx')`.

---

### `resources/js/bootstrap.ts`

**O que é:** Configurações globais do JavaScript, importado antes de qualquer outra coisa em `app.tsx`.

**O que faz:** Importa o Axios e o expõe globalmente como `window.axios`, configurando o header padrão:

```ts
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
```

Este header sinaliza ao Laravel que a requisição é AJAX (não um browser direto), o que afeta como certos erros e redirecionamentos são tratados pelo framework. O Inertia usa seus próprios mecanismos de fetch, mas o Axios configurado aqui fica disponível para qualquer uso manual eventual.

---

### `vite.config.js`

**O que é:** Configuração do bundler Vite.

**O que faz:** Define dois plugins para o processo de build e dev server:

```js
laravel({
    input: 'resources/js/app.tsx',
    refresh: true,
}),
react(),
```

- `input` define o único entry point do bundle — o Vite parte de `app.tsx` e resolve todas as dependências
- `refresh: true` ativa o reload automático do browser quando arquivos PHP (rotas, controllers, views Blade) são modificados durante desenvolvimento

**Plugins em uso:**
- `laravel(...)` — integra Vite com Laravel: gera o `public/build/manifest.json` que o `@vite()` do Blade lê para resolver os hashes de assets em produção, e configura o proxy do dev server
- `react()` — adiciona suporte a JSX/TSX e React Fast Refresh (atualização de componentes sem perda de estado)

**Nota:** O arquivo é `vite.config.js` (não `.ts`) — o Breeze gerou sem tipagem TypeScript na configuração do Vite.

---

### `tsconfig.json`

**O que é:** Configuração do compilador TypeScript.

**O que faz:** Configura o TypeScript para o ambiente específico do projeto:

- `"jsx": "react-jsx"` — usa o transform automático do React 17+ (sem necessidade de `import React` em cada arquivo)
- `"module": "ESNext"` e `"moduleResolution": "bundler"` — usa módulos ES modernos com resolução delegada ao Vite
- `"strict": true` — habilita todas as checagens estritas do TypeScript
- `"noEmit": true` — TypeScript só valida tipos, não gera arquivos `.js` (quem compila é o Vite/esbuild)
- `"paths"` — define dois aliases:
  - `@/*` → `./resources/js/*` (componentes, layouts, etc.)
  - `ziggy-js` → `./vendor/tightenco/ziggy` (tipagem para a função `route()`)
- `"include"` — aplica a configuração apenas aos arquivos em `resources/js/`

**Alias `@`:** O `paths: { "@/*": ["./resources/js/*"] }` permite imports como:

```ts
import { Button } from '@/components/ui/button'
// em vez de: import { Button } from '../../../components/ui/button'
```

---

### `resources/js/Pages/Auth/Login.tsx`

**O que é:** Componente React que representa a página de login.

**O que faz:** Recebe duas props do Laravel: `status` (mensagem opcional, ex: após reset de senha) e `canResetPassword` (boolean que controla o link "Forgot your password?").

Usa o hook `useForm` do Inertia para gerenciar o formulário:

```ts
const { data, setData, post, processing, errors, reset } = useForm({
    email: '',
    password: '',
    remember: false as boolean,
});
```

No submit, chama `post(route('login'))` — o Inertia faz um XHR `POST /login`, e ao finalizar limpa o campo `password` com `reset('password')`. Os erros de validação do Laravel voltam automaticamente em `errors.email` e `errors.password`, renderizados pelos componentes `<InputError>`.

O layout usado é `<GuestLayout>` (para usuários não autenticados). O `<Head title="Log in" />` define o título da aba via `@inertiaHead` no Blade.

**Diferença de antes (Axios):**

| Antes (Axios) | Agora (Inertia useForm) |
|---|---|
| `axios.post('/api/login', data)` | `post(route('login'))` |
| Token JWT no header | Cookie de sessão automático |
| Zustand para erros de validação | `errors.email` direto do hook |
| Redirect manual no `.then()` | Laravel redireciona, Inertia segue |
| Loading state manual | `processing` embutido no hook |

---

### `resources/js/Pages/Dashboard.tsx`

**O que é:** Página inicial após o login — o destino do redirect após autenticação bem-sucedida.

**O que faz:** Componente minimalista sem props próprias. Usa `<AuthenticatedLayout>` (layout para usuários logados, que inclui a navbar com o nome do usuário e menu de logout) e renderiza uma mensagem simples "You're logged in!" dentro de um card branco com sombra.

O `<Head title="Dashboard" />` define o título da aba. O `auth.user` não é passado como prop diretamente — o `AuthenticatedLayout` o lê de `usePage().props.auth.user`, que vem do `HandleInertiaRequests` middleware.

Esta página é o ponto de partida para implementar as funcionalidades reais do ArturFlix — será substituída pelo conteúdo da aplicação nas próximas tarefas.
