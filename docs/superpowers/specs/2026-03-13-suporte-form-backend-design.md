# Suporte Form — Backend Integration Design

**Date:** 2026-03-13

## Goal

Make the support contact form functional by persisting submissions to the `chamados_suportes` database table.

## Scope

- Remove the `name` field from the form (not present in DB schema).
- Wire the form to submit via Inertia POST and store in the database.
- Show success feedback via Inertia flash message on redirect.

## Backend Changes

### 1. `ChamadoSuporte` Model (`app/Models/ChamadoSuporte.php`)

- Add `HasPublicId` concern (auto-generates `public_id` UUID on create).
- Set `$fillable`: `['email_contato', 'assunto', 'mensagem']`.
- Note: `usuario_id` is left nullable/null because the FK references `usuarios` (not `users`), which is a separate table from Laravel's auth system. Linking is out of scope.

### 2. Form Request (`app/Http/Requests/StoreChamadoSuporteRequest.php`)

Rules:
- `email_contato` — required, string, email, max:255
- `assunto` — required, string, in:tecnico,cobranca,sugestao,outro
- `mensagem` — required, string, min:10

### 3. Controller (`app/Http/Controllers/SuporteController.php`)

- `store(StoreChamadoSuporteRequest $request): RedirectResponse`
- Creates `ChamadoSuporte` from validated data (`email_contato`, `assunto`, `mensagem`).
- `usuario_id` is left null.
- Redirects to `route('suporte.index')` with `with('success', '...')`.

### 4. Routes (`routes/web.php`)

- GET `/suporte` → `SuporteController@index` named `suporte.index`.
- POST `/suporte` → `SuporteController@store` named `suporte.store` with `throttle:10,1`.

## Frontend Changes

### `resources/js/Pages/Suporte/Index.tsx`

- Remove `name` field from `FormState`, UI, and validation.
- Use Inertia `useForm` with keys: `email_contato`, `assunto`, `mensagem`.
- On submit, call `form.post(route('suporte.store'))`.
- Show success banner when `usePage().props.flash.success` is truthy.
- Remove local `validate()` function; rely on Inertia server-side errors (`form.errors`).

## Data Flow

```
User fills form → Inertia POST /suporte (throttled 10/min)
→ StoreChamadoSuporteRequest validates
→ SuporteController::store saves ChamadoSuporte (usuario_id null)
→ redirect(route('suporte.index'))->with('success', '...')
→ Inertia re-renders page with flash.success prop
→ Frontend shows success banner
```

## Out of Scope

- Linking `usuario_id` to the authenticated user (FK mismatch between `users` and `usuarios` tables).
- Admin panel or listing of chamados.
- Email notifications.
- Status management (`resolvido_em`, `resposta` fields).
