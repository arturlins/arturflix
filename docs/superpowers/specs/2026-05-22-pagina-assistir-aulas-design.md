# Página "Assistir aulas" + progresso + XP

**Data:** 2026-05-22
**Status:** Aprovado para implementação
**Contexto:** Avaliação acadêmica — fechar o requisito "Site concluído". DB, middlewares, sessão e CRUD já cobertos. Falta a página de consumo das aulas com gamificação.

## Objetivo

Permitir que um usuário matriculado em um curso:

1. Assista cada aula em uma página dedicada (player do YouTube embedado).
2. Tenha o vídeo retomado no segundo em que parou (aula em andamento).
3. Veja quais aulas já concluiu, qual está em andamento e quais faltam.
4. Ganhe XP automaticamente ao concluir cada aula (1 XP por minuto de duração, sem teto).
5. Navegue livremente entre as aulas, em qualquer ordem.

## Decisões de design (do brainstorming)

| Tópico | Decisão |
|---|---|
| "Continuar de onde parou" | **Híbrido:** segundos exatos para a aula em andamento; flag de conclusão para as finalizadas. |
| Marcar como concluída | **Misto:** automático ao atingir 90% do vídeo (via YouTube IFrame API) **+** botão manual "Marcar como concluída" como fallback / para tipos não-vídeo. |
| XP por aula | **Derivado da duração:** `ceil(duracao_segundos / 60)`. Sem mínimo nem máximo. Aulas sem duração → 0 XP. |
| Navegação entre aulas | **Livre** (Netflix-like). Conclusão é opcional para acesso. |

## Arquitetura

### Rotas (em `routes/web.php`, grupo `auth`)

```php
Route::get('/cursos/{curso:public_id}/assistir/{aula:public_id?}', [AssistirController::class, 'show'])
    ->middleware('matriculado')
    ->name('cursos.assistir');

Route::post('/aulas/{aula:public_id}/progresso', [ProgressoAulaController::class, 'update'])
    ->middleware('matriculado.aula')
    ->name('aulas.progresso');

Route::post('/aulas/{aula:public_id}/concluir', [ProgressoAulaController::class, 'concluir'])
    ->middleware('matriculado.aula')
    ->name('aulas.concluir');

Route::post('/aulas/{aula:public_id}/comentarios', [ComentarioAulaController::class, 'store'])
    ->middleware('matriculado.aula')
    ->name('aulas.comentarios.store');

Route::put('/comentarios/{comentario:public_id}', [ComentarioAulaController::class, 'update'])
    ->name('comentarios.update');

Route::delete('/comentarios/{comentario:public_id}', [ComentarioAulaController::class, 'destroy'])
    ->name('comentarios.destroy');
```

### Middleware: `EnsureMatriculadoNoCurso`

Lê o parâmetro de rota `curso` (ou `aula`, e resolve para o curso via `aula.modulo.curso`). Verifica `Matricula::where('usuario_id', $user->id)->where('curso_id', $curso->id)->exists()`. Se não, `abort(403)`. Registrar dois aliases em `bootstrap/app.php`: `matriculado` (param `curso`) e `matriculado.aula` (param `aula`).

### Controllers

- `App\Http\Controllers\AssistirController@show($curso, $aula = null)`
  - Sem `$aula`: redireciona para a última `ProgressoAula` `em_andamento` do usuário no curso, senão para a primeira aula (menor `modulo.ordem`, menor `aula.ordem`).
  - Com `$aula`: valida que pertence ao `$curso`; renderiza `Cursos/Assistir`.
- `App\Http\Controllers\ProgressoAulaController`
  - `update(Request, Aula, AtualizarProgressoAula)` — valida `posicao_segundos:int|min:0`; chama action; retorna `204`.
  - `concluir(Request, Aula, ConcluirAula)` — chama action; retorna `back()->with('flash.xp_ganho', $xp)`.
- `App\Http\Controllers\ComentarioAulaController`
  - `store(StoreComentarioRequest, Aula)` — cria comentário (top-level ou reply, se `comentario_pai_id` enviado e pertencer à mesma aula). Redirect back.
  - `update(UpdateComentarioRequest, ComentarioAula)` — `authorize('update', $comentario)`; atualiza `conteudo` e marca `foi_editado = true`. Redirect back.
  - `destroy(Request, ComentarioAula)` — `authorize('delete', $comentario)`; soft delete não — `delete()` normal (cascade nas replies via FK). Redirect back.

### Policy: `ComentarioAulaPolicy`

- `update($user, $comentario)` e `delete($user, $comentario)` → `$user->id === $comentario->usuario_id`.
- Admin (`is_admin`) também pode deletar (moderação básica).

### Actions (`app/Actions/`)

- `AtualizarProgressoAula::handle(User $user, Aula $aula, int $posicaoSegundos): void`
  - `updateOrCreate(['usuario_id'=>…, 'aula_id'=>…], ['posicao_segundos'=>$posicaoSegundos, 'ultima_visualizacao_em'=>now()])`.
  - Não regride `posicao_segundos` se a nova for menor (`max(antiga, nova)`).
  - Não toca `concluido_em`.
- `ConcluirAula::handle(User $user, Aula $aula): int` (retorna XP creditado, 0 se já concluída)
  - Transação. `updateOrCreate` com `concluido_em = now()` se ainda NULL.
  - Se a row já tinha `concluido_em`, retorna 0 (idempotente).
  - Caso contrário chama `CreditarXP::handle($user, $aula)` e retorna XP.
- `CreditarXP::handle(User $user, Aula $aula): int`
  - `$xp = (int) ceil(max(0, $aula->duracao_segundos ?? 0) / 60);`
  - Se `$xp === 0`, retorna 0 sem gravar.
  - `HistoricoXp::create([...quantidade=>$xp, motivo=>'aula:concluida'])`.
  - `PerfilGamificado::firstOrCreate(['usuario_id'=>…])` → `xp_total += $xp`; `nivel_atual = floor(sqrt(xp_total / 100)) + 1`; `ultima_atividade = today()`.
  - Retorna `$xp`.

### Models (preencher os stubs)

- `ProgressoAula` (tabela `progressos_aulas`): fillable `usuario_id, aula_id, posicao_segundos, concluido_em, ultima_visualizacao_em`; casts; `usuario()`, `aula()` belongsTo. Scope `concluida()`, `emAndamento()`.
- `HistoricoXp` (renomear classe `HistoricoXP` → `HistoricoXp`; tabela `historico_xp`): fillable `usuario_id, quantidade, motivo`; cast `quantidade:int`; `usuario()`.
- `PerfilGamificado` (tabela `perfis_gamificados`): fillable `usuario_id, xp_total, nivel_atual, streak_dias, ultima_atividade`; casts; `usuario()`.
- `ComentarioAula` (tabela `comentarios_aulas`): fillable `aula_id, usuario_id, comentario_pai_id, conteudo, foi_editado`; cast `foi_editado:bool`. Relations: `aula()`, `usuario()`, `pai()` belongsTo, `respostas()` hasMany self-referencing (ordenadas por `created_at` asc).
- `User` ganha `progressos()`, `historicoXp()`, `perfilGamificado()` (hasOne), `comentarios()` (hasMany).

## Schema — nova migration

Arquivo: `database/migrations/2026_05_22_000000_alter_progressos_aulas_for_resume.php`.

```php
Schema::table('progressos_aulas', function (Blueprint $table) {
    $table->timestamp('concluido_em')->nullable()->change();
    $table->unsignedInteger('posicao_segundos')->default(0)->after('aula_id');
    $table->timestamp('ultima_visualizacao_em')->nullable()->after('posicao_segundos');
    $table->index(['usuario_id', 'ultima_visualizacao_em'], 'progressos_user_recent_idx');
});
```

`down()` reverte: dropar índice, dropar `posicao_segundos` e `ultima_visualizacao_em`, voltar `concluido_em` para NOT NULL (com cuidado — pode falhar se houver rows com NULL; aceitável em down).

Semântica de uma linha por `(usuario_id, aula_id)`:

| Estado | `posicao_segundos` | `concluido_em` |
|---|---|---|
| Não iniciada | (sem row) | (sem row) |
| Em andamento | `> 0` | `NULL` |
| Concluída | qualquer | `NOT NULL` |

Constraint UNIQUE em `(usuario_id, aula_id)` já existe.

## Frontend — `resources/js/pages/Cursos/Assistir.tsx`

### Layout (dark, em linha com o resto do projeto)

```
┌────────────────────────────────────────────┬────────────────────────┐
│ ← Voltar ao curso                          │ Conteúdo do curso      │
│                                            │                        │
│  ┌──────────────────────────────────────┐  │ Módulo 01              │
│  │     YouTube iframe (16:9)            │  │   ✓  Aula 1 · 8min     │
│  └──────────────────────────────────────┘  │   ●  Aula 2 · 12min    │ ← atual
│                                            │   ○  Aula 3 · 6min     │
│  Título da aula • Módulo X                 │                        │
│  12 min · vale 12 XP                       │ Módulo 02              │
│                                            │   ○  Aula 4 · 10min    │
│  [✓ Marcar como concluída]    Próxima →    │   ○  Aula 5 · 9min     │
└────────────────────────────────────────────┴────────────────────────┘
```

### Player

- Hook `useYouTubePlayer(videoId: string, startSeconds: number)` que carrega o script `https://www.youtube.com/iframe_api` uma única vez e cria um `YT.Player` num `<div>` controlado por ref.
- Eventos:
  - `onReady`: se `startSeconds > 5`, `player.seekTo(startSeconds, true)`.
  - `onStateChange === PLAYING`: inicia `setInterval` de 10s para heartbeat.
  - `onStateChange === PAUSED`: heartbeat imediato; limpa intervalo.
  - `onStateChange === ENDED`: heartbeat + tenta conclusão.
- A cada tick: `posicao = Math.floor(player.getCurrentTime())`, `duracao = player.getDuration()`.
  - `fetch(route('aulas.progresso', aula.public_id), { method:'POST', headers:{'X-CSRF-TOKEN':…, 'X-Requested-With':'XMLHttpRequest'}, body: JSON.stringify({ posicao_segundos: posicao }) })`. Não Inertia para não recarregar props.
  - Se `posicao / duracao >= 0.9` e aula ainda não concluída (flag local), dispara conclusão via `router.post(route('aulas.concluir', aula.public_id), {}, { preserveScroll: true })` (Inertia para recarregar status + receber flash de XP).

### Sidebar

- Renderiza `modulos[]` (mesma estrutura de `Cursos/Show`), cada aula com ícone de status:
  - `✓` emerald — `concluida`
  - `●` amber — `em_andamento`
  - `○` zinc — não iniciada
- Aula atual: fundo destacado, sem link.
- Demais aulas: `<Link>` Inertia para `cursos.assistir`.

### Footer da aula

- "Marcar como concluída" — `router.post(route('aulas.concluir', …))`. Esconde se `aulaAtual.concluida`.
- "Próxima aula": `<Link>` para `proximaAula.public_id` se houver; some na última.
- Toast/badge flash com `+{xp} XP` ao concluir (lê `flash.xp_ganho` da página global).

### Seção de comentários (abaixo do player / conteúdo)

```
┌────────────────────────────────────────────┐
│ Comentários · 14                           │
│                                            │
│ ┌────────────────────────────────────────┐ │
│ │ [textarea] Escreva um comentário...    │ │
│ │                          [Comentar]    │ │
│ └────────────────────────────────────────┘ │
│                                            │
│ ─ Avatar  Nome do usuário · há 2h          │
│   Conteúdo do comentário aqui...           │
│   Responder · Editar · Excluir             │
│       └─ Avatar  Outro usuário · há 1h     │
│          Resposta aqui... (editado)        │
│          Responder · Editar · Excluir      │
│                                            │
│ ─ Avatar  ...                              │
└────────────────────────────────────────────┘
```

- Render: lista de comentários top-level (`comentario_pai_id IS NULL`) ordenada `created_at` desc, com `respostas` aninhadas (1 nível, ordenadas asc).
- **Criar:** textarea + botão "Comentar". `router.post(route('aulas.comentarios.store', aula.public_id), { conteudo })`.
- **Responder:** botão "Responder" abre textarea inline; submit envia `{ conteudo, comentario_pai_id }`. Threading limitado a 1 nível visual (reply de reply vira reply do top-level — backend valida que `pai` é top-level).
- **Editar:** se `usuario_id === auth.user.id`, botão "Editar" transforma o conteúdo em textarea com botões Salvar/Cancelar. PUT `comentarios.update`. Marca `(editado)` no header quando `foi_editado`.
- **Excluir:** se dono (ou admin), botão "Excluir" com confirm; DELETE `comentarios.destroy`. Cascade remove respostas.
- Validação: `conteudo` required, max 2000 chars, trim.

### Tipos `texto` e `quiz`

- Sem iframe. Renderiza `aula.conteudo` (texto plano com `whitespace-pre-line`; placeholder para quiz).
- Mostra apenas o botão "Marcar como concluída". Não há heartbeat. XP só credita se `duracao_segundos > 0` — para texto/quiz será 0 por default (aceitável no MVP).

### Props da página

```ts
{
  curso: { public_id, titulo },
  modulos: Array<{
    public_id, titulo, ordem,
    aulas: Array<{
      public_id, titulo, tipo_aula, duracao_segundos, ordem,
      concluida: boolean,
      em_andamento: boolean,
    }>,
  }>,
  aulaAtual: {
    public_id, titulo, tipo_aula, conteudo, duracao_segundos, ordem,
    youtube_video_id: string | null,
    xp: number,                // ceil(duracao_segundos/60)
    posicao_segundos: number,  // 0 se nunca abriu
    concluida: boolean,
  },
  proximaAula: { public_id } | null,
  comentarios: Array<{
    public_id, conteudo, foi_editado, created_at,
    autor: { public_id, name, avatar_url | null },
    is_owner: boolean,
    respostas: Array<{
      public_id, conteudo, foi_editado, created_at,
      autor: { public_id, name, avatar_url | null },
      is_owner: boolean,
    }>,
  }>,
}
```

## Integrações com telas existentes

- `Cursos/Show.tsx`:
  - Quando `matriculado === true`, o badge "Você está matriculado" vira CTA "Continuar assistindo" (ou "Começar curso" se nenhum progresso), linkando para `cursos.assistir`.
  - Lista de aulas ganha ícones de status (`✓`/`●`/`○`) usando o mesmo conjunto de IDs concluídos/em-andamento (controller precisa passar essa info quando o usuário estiver autenticado e matriculado).
- `Dashboard.tsx`:
  - Cada card de curso ganha barra de progresso `aulas_concluidas / total_aulas` e CTA "Continuar".
  - Header ganha bloco com **XP total** e **nível** lidos de `perfis_gamificados` (firstOrCreate lazy no controller).

## Tratamento de erros

- Heartbeat com falha de rede: silencioso (apenas log no console). O próximo tick tenta de novo.
- Conclusão dupla (race condition entre auto-90% e botão manual): protegida pelo `concluido_em IS NOT NULL` check dentro da transação — segunda chamada vira no-op e retorna 0 XP.
- `youtube_video_id` ausente em aula `video`: renderiza placeholder "Vídeo indisponível" + botão manual de conclusão.

## Testes (Pest, em `tests/Feature/`)

1. `AssistirControllerTest`
   - guest → redirect login
   - autenticado sem matrícula → 403
   - matriculado sem `{aula}` → redireciona para primeira aula
   - matriculado com `em_andamento` sem `{aula}` → redireciona para aula em andamento
   - matriculado com aula que não pertence ao curso → 404
2. `ConcluirAulaTest`
   - primeira conclusão de aula de 12min credita 12 XP em `historico_xp`, atualiza `perfis_gamificados.xp_total`
   - segunda chamada na mesma aula não duplica XP nem altera `concluido_em`
   - aula com `duracao_segundos = 0` conclui mas credita 0 XP (nenhuma linha em `historico_xp`)
3. `AtualizarProgressoAulaTest`
   - primeiro POST cria linha com `posicao_segundos` e `ultima_visualizacao_em`
   - POST com posição menor não regride o valor
   - POST em aula já concluída atualiza `ultima_visualizacao_em` mas não mexe em `concluido_em`
4. `MatriculaGateTest`
   - `POST /aulas/{aula}/progresso` e `/concluir` → 403 sem matrícula no curso da aula
5. `ComentarioAulaTest`
   - matriculado cria comentário top-level → 201/redirect, row persistida
   - matriculado responde com `comentario_pai_id` válido → row persistida
   - reply com `comentario_pai_id` apontando para um reply (não-top-level) → 422
   - sem matrícula → 403
   - dono edita seu comentário → `foi_editado = true`
   - usuário tenta editar comentário de outro → 403
   - dono deleta → comentário e replies cascade removidas
   - admin deleta comentário de qualquer um → ok

## Fora de escopo (deixar explícito)

- Streak diário automático (campo existe, mas atualização robusta exige cron — fica para depois).
- Conquistas/badges.
- Quiz funcional (apenas placeholder + botão manual).
- Geração de certificado (tabela existe, fluxo não entra agora).
- Suporte a vídeos não-YouTube (`url_video` direto) — `tipo_aula = video` sem `youtube_video_id` renderiza placeholder.

## Critérios de aceitação

- Usuário matriculado consegue abrir `/cursos/{x}/assistir`, ver player carregado na aula correta, e o vídeo retoma no segundo onde parou na sessão anterior.
- Ao atingir 90% do vídeo, a aula vira "concluída" sem clique, ícone na sidebar muda para `✓`, flash de XP aparece.
- Botão "Marcar como concluída" funciona para qualquer tipo de aula, é idempotente (não duplica XP).
- Dashboard mostra XP total e nível do usuário, e cada curso mostra progresso.
- Suite de testes Pest passa: `./vendor/bin/pest --compact`.
