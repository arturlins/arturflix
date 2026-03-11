# Arturflix API — Setup e Configuração

## Tecnologias

| Camada       | Tecnologia                        |
|--------------|-----------------------------------|
| Backend      | Laravel 12 (PHP 8.4)              |
| Banco        | PostgreSQL 18                     |
| Autenticação | Laravel Sanctum (via Breeze API)  |
| Build JS     | Vite 7 + Bun 1.3                  |
| Formatador   | Laravel Pint                      |

---

## Pré-requisitos

- PHP >= 8.2
- Composer
- Bun >= 1.3
- PostgreSQL 18

---

## Instalação

```bash
# 1. Clonar o repositório
git clone <repo-url>
cd arturflix-api

# 2. Instalar dependências PHP
composer install

# 3. Copiar .env e gerar chave
cp .env.example .env
php artisan key:generate

# 4. Configurar banco no .env
# DB_CONNECTION=pgsql
# DB_HOST=127.0.0.1
# DB_PORT=5432
# DB_DATABASE=arturflix
# DB_USERNAME=postgres
# DB_PASSWORD=sua_senha

# 5. Rodar migrations
php artisan migrate

# 6. Instalar dependências JS
bun install
```

## Rodando em desenvolvimento

```bash
composer run dev
```

Isso inicia em paralelo:
- `php artisan serve` — servidor Laravel na porta 8000
- `php artisan queue:listen` — processamento de filas
- `php artisan pail` — visualizador de logs
- `bun run dev` — Vite com hot reload

## Build para produção

```bash
bun run build
```

---

## Variáveis de ambiente importantes

```env
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000   # URL do frontend React

SANCTUM_STATEFUL_DOMAINS=localhost:3000
SESSION_DOMAIN=localhost

DB_CONNECTION=pgsql
```

> **Por que FRONTEND_URL?** O Sanctum usa isso para identificar requisições SPA
> legítimas e autenticar via cookie de sessão.

---

## Estrutura de rotas

| Método | Rota                               | Descrição                   |
|--------|------------------------------------|-----------------------------|
| POST   | /api/register                      | Registro de novo usuário    |
| POST   | /api/login                         | Login                       |
| POST   | /api/logout                        | Logout (requer auth)        |
| GET    | /api/user                          | Usuário autenticado         |
| POST   | /api/forgot-password               | Solicitar reset de senha    |
| POST   | /api/reset-password                | Redefinir senha             |
| GET    | /api/verify-email/{id}/{hash}      | Verificar email             |
| POST   | /api/email/verification-notification | Reenviar verificação      |
