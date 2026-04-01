# AV2 — Plano de Implementação Backend

## Critérios de Avaliação

| Critério | Peso | Status |
|---|---|---|
| 10 Telas/Rotas implementadas (com CRUD) | 3 | 🔧 Parcial |
| Organização do Projeto (MVC / separação de lógica) | 2 | ✅ Estrutura pronta |
| Visual e qualidade do projeto | 2 | 🔧 Parcial |
| Validação de formulário | 2 | 🔧 Parcial |
| Upload de arquivos | 1 | ❌ Não implementado |

---

## O Que Já Existe

### Rotas/Telas prontas (5)
1. **`/`** — Landing page (Welcome)
2. **`/cursos`** — Catálogo de cursos (dados estáticos no frontend)
3. **`/suporte`** — Página de suporte (sem funcionalidade backend)
4. **`/login`** — Login (funcional com validação)
5. **`/register`** — Registro (funcional com validação)
6. **`/dashboard`** — Dashboard do aluno (dados estáticos no frontend)

### Arquitetura
- MVC com Laravel 12 + Inertia.js + React/TypeScript
- 16 Models Eloquent criados com migrations
- Enums tipados (`PapelEnum`, `TipoAulaEnum`, `StatusChamadoEnum`)
- Trait `HasPublicId` para UUIDs públicos
- Diretórios `Actions/`, `Services/`, `Queries/` preparados
- Form Requests para login e perfil

### Validação existente
- Login: email + password + rate limiting (5 tentativas)
- Registro: name, email (unique), password (confirmed)
- Perfil: name (max:255), email (unique)

---

## Plano de Implementação

### 1. Cursos — CRUD Completo (Admin) + Listagem (Aluno)

**Prioridade:** Alta — é o CRUD principal exigido na avaliação.

#### O que fazer:
- [ ] `CursoController` com CRUD completo (index, create, store, show, edit, update, destroy)
- [ ] `StoreCursoRequest` — validação: titulo (required, max:255), descricao (required), url_capa (image, max:2MB)
- [ ] `UpdateCursoRequest` — mesma validação, url_capa opcional
- [ ] Seeders com dados reais (cursos de programação, design, etc.) para popular o banco
- [ ] Página `Cursos/Index.tsx` puxando dados do banco via Inertia props (substituir dados estáticos)
- [ ] Página `Cursos/Show.tsx` — detalhes do curso com módulos e aulas
- [ ] Página `Cursos/Create.tsx` — formulário de criação (admin)
- [ ] Página `Cursos/Edit.tsx` — formulário de edição (admin)
- [ ] Upload de imagem de capa do curso (storage/public)

#### Rotas:
```
GET    /cursos              → CursoController@index      (pública)
GET    /cursos/criar        → CursoController@create     (admin)
POST   /cursos              → CursoController@store      (admin)
GET    /cursos/{curso}      → CursoController@show       (pública)
GET    /cursos/{curso}/edit → CursoController@edit       (admin)
PUT    /cursos/{curso}      → CursoController@update     (admin)
DELETE /cursos/{curso}      → CursoController@destroy    (admin)
```

---

### 2. Módulos e Aulas — CRUD aninhado

**Prioridade:** Alta — complementa o CRUD de cursos.

#### O que fazer:
- [ ] `ModuloController` — CRUD dentro de um curso
- [ ] `AulaController` — CRUD dentro de um módulo
- [ ] `StoreModuloRequest` / `StoreAulaRequest` com validação
- [ ] Seeders com módulos e aulas reais por curso
- [ ] Página `Cursos/Show.tsx` exibir módulos e aulas vindos do banco
- [ ] Formulários inline ou modal para criar/editar módulos e aulas (admin)

#### Rotas:
```
POST   /cursos/{curso}/modulos              → ModuloController@store
PUT    /modulos/{modulo}                    → ModuloController@update
DELETE /modulos/{modulo}                    → ModuloController@destroy

POST   /modulos/{modulo}/aulas              → AulaController@store
GET    /aulas/{aula}                        → AulaController@show
PUT    /aulas/{aula}                        → AulaController@update
DELETE /aulas/{aula}                        → AulaController@destroy
```

---

### 3. Matrículas — Inscrição em cursos

**Prioridade:** Alta — conecta alunos a cursos com dados reais.

#### O que fazer:
- [ ] `MatriculaController` — store (matricular) e destroy (cancelar)
- [ ] Lógica: aluno autenticado se matricula, evitar duplicatas (unique constraint já existe)
- [ ] Dashboard puxar cursos matriculados do banco (substituir mock)
- [ ] Página `Cursos/Show.tsx` mostrar botão "Matricular-se" / "Já matriculado"
- [ ] Seeder de matrículas para o usuário de teste

#### Rotas:
```
POST   /cursos/{curso}/matricula   → MatriculaController@store
DELETE /cursos/{curso}/matricula   → MatriculaController@destroy
```

---

### 4. Chamados de Suporte — CRUD

**Prioridade:** Média — já tem a página, falta o backend.

#### O que fazer:
- [ ] `ChamadoSuporteController` — index (listar meus chamados), store (criar), show (ver detalhes)
- [ ] `StoreChamadoRequest` — validação: assunto (required, max:255), mensagem (required, min:10), email_contato (required, email)
- [ ] Página `Suporte/Index.tsx` com formulário funcional + listagem de chamados do usuário
- [ ] Página `Suporte/Show.tsx` — detalhes do chamado e resposta (se houver)
- [ ] Dados reais no banco, sem mock

#### Rotas:
```
GET    /suporte              → ChamadoSuporteController@index
POST   /suporte              → ChamadoSuporteController@store
GET    /suporte/{chamado}    → ChamadoSuporteController@show
```

---

### 5. Dashboard — Dados reais do banco

**Prioridade:** Alta — atualmente usa dados estáticos.

#### O que fazer:
- [ ] Dashboard controller buscar dados reais: XP, cursos matriculados, progresso, certificados
- [ ] Criar `PerfilGamificado` automaticamente ao registrar usuário (via Observer ou Action)
- [ ] Seeder para popular perfil gamificado e histórico XP
- [ ] Progresso de aulas vindo do banco

---

### 6. Perfil do Usuário — Edição

**Prioridade:** Média — já tem controller, falta a tela.

#### O que fazer:
- [ ] Página `Profile/Edit.tsx` — formulário de edição de perfil
- [ ] Usar `ProfileController` existente (update, destroy)
- [ ] Adicionar upload de foto de perfil (segundo ponto de upload)

#### Rotas (já existem no auth scaffolding):
```
GET    /profile       → ProfileController@edit
PATCH  /profile       → ProfileController@update
DELETE /profile       → ProfileController@destroy
```

---

### 7. Upload de Arquivos

**Prioridade:** Alta — critério avaliado separadamente (1 ponto).

#### O que fazer:
- [ ] Configurar `storage:link` para acesso público
- [ ] Upload de capa do curso (`url_capa`) no `CursoController@store/update`
- [ ] Validação: image, mimes:jpg,png,webp, max:2048
- [ ] Exibir imagens via `Storage::url()` no frontend
- [ ] (Opcional) Upload de foto de perfil no `ProfileController`

---

### 8. Validação de Formulários

**Prioridade:** Alta — critério avaliado separadamente (2 pontos).

#### O que fazer:
- [ ] `StoreCursoRequest` — titulo, descricao, url_capa (image)
- [ ] `UpdateCursoRequest` — mesmas regras, capa opcional
- [ ] `StoreModuloRequest` — titulo (required), ordem (integer, min:1)
- [ ] `StoreAulaRequest` — titulo, tipo_aula (enum), conteudo, url_video, duracao_segundos, ordem
- [ ] `StoreChamadoRequest` — assunto, mensagem, email_contato
- [ ] Exibir erros de validação no frontend (Inertia já propaga `$errors`)
- [ ] Validação client-side com feedback visual nos formulários React

---

## Contagem de Telas/Rotas Final

| # | Tela | Tipo | Dados |
|---|------|------|-------|
| 1 | `/` | Landing page | — |
| 2 | `/login` | Auth | Banco |
| 3 | `/register` | Auth | Banco |
| 4 | `/dashboard` | Painel do aluno | Banco (matrículas, XP, progresso) |
| 5 | `/cursos` | Catálogo de cursos | Banco |
| 6 | `/cursos/{curso}` | Detalhes do curso | Banco (módulos, aulas) |
| 7 | `/cursos/criar` | Criar curso (admin) | Banco + Upload |
| 8 | `/cursos/{curso}/edit` | Editar curso (admin) | Banco + Upload |
| 9 | `/suporte` | Chamados de suporte | Banco |
| 10 | `/suporte/{chamado}` | Detalhes do chamado | Banco |
| 11 | `/profile` | Edição de perfil | Banco |
| 12 | `/aulas/{aula}` | Visualizar aula | Banco |

**Total: 12 telas/rotas** — todas com dados reais do banco de dados.

---

## Seeders Necessários

Para evitar dados mockados no frontend, todos os dados devem vir do banco:

- [ ] `CursoSeeder` — 6+ cursos com título, descrição e imagem de capa
- [ ] `ModuloSeeder` — 2-3 módulos por curso
- [ ] `AulaSeeder` — 3-5 aulas por módulo
- [ ] `UserSeeder` — Usuário admin + usuário aluno de teste
- [ ] `MatriculaSeeder` — Matricular usuário teste em 2-3 cursos
- [ ] `PerfilGamificadoSeeder` — XP e nível para usuário teste
- [ ] `HistoricoXPSeeder` — Histórico de XP do usuário teste
- [ ] `ProgressoAulaSeeder` — Progresso parcial em aulas
- [ ] `ChamadoSuporteSeeder` — 2-3 chamados de exemplo

---

## Ordem de Execução Sugerida

1. **Seeders + Factories** — Popular o banco com dados reais
2. **CursoController + CRUD** — Eixo central do sistema
3. **Upload de imagem** — Capa do curso (critério de avaliação)
4. **Módulos + Aulas** — Conteúdo dos cursos
5. **Matrículas** — Inscrição do aluno
6. **Dashboard com dados reais** — Substituir mocks por queries
7. **Suporte com backend** — Formulário funcional
8. **Perfil do usuário** — Tela de edição
9. **Validação completa** — Form Requests + feedback visual
10. **Revisão geral** — Visual, organização, testes
