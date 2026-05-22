<?php

namespace App\Http\Controllers;

use App\Models\Aula;
use App\Models\ComentarioAula;
use App\Models\Curso;
use App\Models\Modulo;
use App\Models\ProgressoAula;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AssistirController extends Controller
{
    public function show(Request $request, Curso $curso, ?Aula $aula = null): Response|RedirectResponse
    {
        $curso->load([
            'modulos' => fn ($q) => $q->orderBy('ordem'),
            'modulos.aulas' => fn ($q) => $q->orderBy('ordem'),
        ]);

        $user = $request->user();

        if ($aula === null) {
            $alvo = $this->resolveAulaInicial($curso, $user->id);
            if ($alvo === null) {
                abort(404, 'Curso sem aulas.');
            }

            return redirect()->route('cursos.assistir', [$curso->public_id, $alvo->public_id]);
        }

        if ($aula->modulo->curso_id !== $curso->id) {
            abort(404);
        }

        $progressos = ProgressoAula::query()
            ->where('usuario_id', $user->id)
            ->whereIn('aula_id', $curso->modulos->flatMap->aulas->pluck('id'))
            ->get()
            ->keyBy('aula_id');

        $todasAulas = $curso->modulos->flatMap->aulas->values();
        $idxAtual = $todasAulas->search(fn (Aula $a) => $a->id === $aula->id);
        $proxima = $todasAulas->get($idxAtual + 1);

        $progressoAtual = $progressos->get($aula->id);

        $comentarios = ComentarioAula::query()
            ->where('aula_id', $aula->id)
            ->whereNull('comentario_pai_id')
            ->with([
                'usuario:id,public_id,name',
                'respostas.usuario:id,public_id,name',
            ])
            ->latest()
            ->get();

        return Inertia::render('Cursos/Assistir', [
            'curso' => [
                'public_id' => $curso->public_id,
                'titulo' => $curso->titulo,
            ],
            'modulos' => $curso->modulos->map(fn (Modulo $m) => [
                'public_id' => $m->public_id,
                'titulo' => $m->titulo,
                'ordem' => $m->ordem,
                'aulas' => $m->aulas->map(fn (Aula $a) => [
                    'public_id' => $a->public_id,
                    'titulo' => $a->titulo,
                    'tipo_aula' => $a->tipo_aula->value,
                    'duracao_segundos' => (int) $a->duracao_segundos,
                    'ordem' => $a->ordem,
                    'concluida' => $progressos->get($a->id)?->concluido_em !== null,
                    'em_andamento' => $progressos->get($a->id)
                        && $progressos->get($a->id)->concluido_em === null
                        && $progressos->get($a->id)->posicao_segundos > 0,
                ])->values(),
            ])->values(),
            'aulaAtual' => [
                'public_id' => $aula->public_id,
                'titulo' => $aula->titulo,
                'tipo_aula' => $aula->tipo_aula->value,
                'conteudo' => $aula->conteudo,
                'duracao_segundos' => (int) $aula->duracao_segundos,
                'ordem' => $aula->ordem,
                'youtube_video_id' => $aula->youtube_video_id,
                'xp' => (int) ceil(max(0, (int) $aula->duracao_segundos) / 60),
                'posicao_segundos' => (int) ($progressoAtual?->posicao_segundos ?? 0),
                'concluida' => $progressoAtual?->concluido_em !== null,
            ],
            'proximaAula' => $proxima ? ['public_id' => $proxima->public_id] : null,
            'comentarios' => $comentarios->map(fn (ComentarioAula $c) => $this->mapComentario($c, $user->id)),
        ]);
    }

    private function resolveAulaInicial(Curso $curso, int $usuarioId): ?Aula
    {
        $todas = $curso->modulos->flatMap->aulas->values();
        if ($todas->isEmpty()) {
            return null;
        }

        $emAndamento = ProgressoAula::query()
            ->where('usuario_id', $usuarioId)
            ->whereIn('aula_id', $todas->pluck('id'))
            ->whereNull('concluido_em')
            ->where('posicao_segundos', '>', 0)
            ->orderByDesc('ultima_visualizacao_em')
            ->first();

        if ($emAndamento) {
            return $todas->firstWhere('id', $emAndamento->aula_id);
        }

        return $todas->first();
    }

    private function mapComentario(ComentarioAula $c, int $usuarioId): array
    {
        return [
            'public_id' => $c->public_id,
            'conteudo' => $c->conteudo,
            'foi_editado' => $c->foi_editado,
            'created_at' => $c->created_at->toIso8601String(),
            'autor' => [
                'public_id' => $c->usuario->public_id,
                'name' => $c->usuario->name,
            ],
            'is_owner' => $c->usuario_id === $usuarioId,
            'respostas' => $c->respostas->map(fn (ComentarioAula $r) => [
                'public_id' => $r->public_id,
                'conteudo' => $r->conteudo,
                'foi_editado' => $r->foi_editado,
                'created_at' => $r->created_at->toIso8601String(),
                'autor' => [
                    'public_id' => $r->usuario->public_id,
                    'name' => $r->usuario->name,
                ],
                'is_owner' => $r->usuario_id === $usuarioId,
            ])->values(),
        ];
    }
}
