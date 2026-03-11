# Arturflix — Autenticação com Sanctum

## Visão geral

O sistema usa **Laravel Sanctum** no modo **SPA Cookie Auth** — o mesmo que o
Django usa com `SessionAuthentication`. O frontend React e a API precisam estar
no mesmo domínio (ou subdomínio configurado) para os cookies funcionarem.

> **Analogia com Django/DRF**: É equivalente ao `SessionAuthentication` do DRF
> combinado com `CSRF middleware`. O Sanctum injeta automaticamente o cookie de
> sessão após o login.

---

## Fluxo de autenticação

```
React (localhost:3000)                API (localhost:8000)
       |                                      |
       |-- GET /sanctum/csrf-cookie --------> |
       |<-- Set-Cookie: XSRF-TOKEN ---------- |
       |                                      |
       |-- POST /api/login (+ X-XSRF-TOKEN) > |
       |<-- Set-Cookie: laravel_session ------ |
       |                                      |
       |-- GET /api/user (com cookies) -----> |
       |<-- { id, email, nome_completo, ... } |
```

---

## Endpoints de autenticação

### POST /api/register

Registra um novo usuário.

**Body:**
```json
{
  "name": "artur",
  "nome_completo": "Artur Silva",
  "email": "artur@email.com",
  "password": "senha123",
  "password_confirmation": "senha123",
  "aceitou_termos": true
}
```

**Resposta:** `204 No Content`

---

### POST /api/login

**Body:**
```json
{
  "email": "artur@email.com",
  "password": "senha123"
}
```

**Resposta:** `204 No Content` (sessão criada via cookie)

---

### POST /api/logout

Requer autenticação. Destrói a sessão.

**Resposta:** `204 No Content`

---

### GET /api/user

Retorna os dados do usuário autenticado.

**Resposta:**
```json
{
  "id": 1,
  "public_id": "uuid-gerado",
  "name": "artur",
  "nome_completo": "Artur Silva",
  "email": "artur@email.com",
  "papel": "aluno",
  "aceitou_termos": true,
  "is_staff": false,
  "is_superuser": false,
  "email_verified_at": "...",
  "created_at": "..."
}
```

---

## Model User (app/Models/User.php)

O `User` é o model central de autenticação. Campos relevantes:

| Campo          | Tipo      | Descrição                          |
|----------------|-----------|------------------------------------|
| `public_id`    | UUID      | ID público para a API (não expõe o ID interno) |
| `name`         | string    | Username/apelido                   |
| `nome_completo`| string    | Nome real do usuário               |
| `email`        | string    | Email único                        |
| `papel`        | PapelEnum | `aluno`, `admin`, ou `superuser`   |
| `aceitou_termos` | boolean | Aceite dos termos de uso           |
| `is_staff`     | boolean   | Acesso ao painel admin             |
| `is_superuser` | boolean   | Acesso total                       |
| `ultimo_login` | datetime  | Último login registrado            |

---

## Configuração no frontend React

```js
// axios config (src/lib/axios.js)
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true,        // ESSENCIAL para enviar cookies
  withXSRFToken: true,          // ESSENCIAL para CSRF
  headers: {
    'Accept': 'application/json',
  },
})

export default api
```

```js
// Antes de qualquer login/register, buscar o CSRF cookie:
await api.get('/sanctum/csrf-cookie')
await api.post('/api/login', { email, password })
```

---

## Papéis (Roles) — PapelEnum

```php
// app/Enums/PapelEnum.php
enum PapelEnum: string {
    case ALUNO      = 'aluno';
    case ADMIN      = 'admin';
    case SUPERUSER  = 'superuser';
}
```

Para verificar o papel no controller:
```php
if ($request->user()->papel === PapelEnum::ADMIN) {
    // lógica de admin
}
```

---

## Por que não JWT?

O Sanctum SPA Cookie Auth é **mais seguro** que JWT para SPAs:
- Cookies `HttpOnly` não são acessíveis por JavaScript (previne XSS)
- Proteção CSRF automática via XSRF-TOKEN
- Não precisa gerenciar refresh tokens no frontend

JWT é mais adequado quando a API serve **apps mobile** ou **serviços externos**.
Para o caso do Arturflix (React SPA + Laravel API no mesmo domínio), Sanctum
SPA auth é a escolha correta.
