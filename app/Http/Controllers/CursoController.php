<?php

namespace App\Http\Controllers;

use App\Actions\MatricularUsuarioEmCurso;
use App\Models\Aula;
use App\Models\Curso;
use App\Models\Modulo;
use App\Models\ProgressoAula;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CursoController extends Controller
{
    public function index(): Response
    {
        $cursos = Curso::query()
            ->with([
                'modulos' => fn ($q) => $q->orderBy('ordem'),
                'modulos.aulas' => fn ($q) => $q->orderBy('ordem')->select(['id', 'modulo_id', 'duracao_segundos']),
            ])
            ->latest('id')
            ->get()
            ->map(function (Curso $curso): array {
                $aulas = $curso->modulos->flatMap->aulas;

                return [
                    'public_id' => $curso->public_id,
                    'titulo' => $curso->titulo,
                    'descricao' => $curso->descricao,
                    'url_capa' => $curso->url_capa,
                    'channel' => $curso->youtube_channel_title,
                    'total_aulas' => $aulas->count(),
                    'duracao_total_segundos' => (int) $aulas->sum('duracao_segundos'),
                ];
            });

        return Inertia::render('Cursos/Index', ['cursos' => $cursos]);
    }

    public function show(Request $request, Curso $curso): Response
    {
        $curso->load([
            'modulos' => fn ($q) => $q->orderBy('ordem'),
            'modulos.aulas' => fn ($q) => $q->orderBy('ordem'),
        ]);

        $aulas = $curso->modulos->flatMap->aulas;

        $user = $request->user();
        $matriculado = $user
            ? $curso->matriculas()->where('usuario_id', $user->id)->exists()
            : null;

        $progressosPorAula = collect();
        if ($user && $matriculado) {
            $progressosPorAula = ProgressoAula::query()
                ->where('usuario_id', $user->id)
                ->whereIn('aula_id', $curso->modulos->flatMap->aulas->pluck('id'))
                ->get()
                ->keyBy('aula_id');
        }

        $modulos = $curso->modulos->map(fn (Modulo $modulo): array => [
            'public_id' => $modulo->public_id,
            'titulo' => $modulo->titulo,
            'ordem' => $modulo->ordem,
            'aulas' => $modulo->aulas->map(fn (Aula $aula): array => [
                'public_id' => $aula->public_id,
                'titulo' => $aula->titulo,
                'tipo_aula' => $aula->tipo_aula->value,
                'duracao_segundos' => (int) $aula->duracao_segundos,
                'ordem' => $aula->ordem,
                'youtube_video_id' => $aula->youtube_video_id,
                'concluida' => $progressosPorAula->get($aula->id)?->concluido_em !== null,
                'em_andamento' => $progressosPorAula->get($aula->id)
                    && $progressosPorAula->get($aula->id)->concluido_em === null
                    && $progressosPorAula->get($aula->id)->posicao_segundos > 0,
            ])->values(),
        ])->values();

        return Inertia::render('Cursos/Show', [
            'curso' => [
                'public_id' => $curso->public_id,
                'titulo' => $curso->titulo,
                'descricao' => $curso->descricao,
                'url_capa' => $curso->url_capa,
                'channel' => $curso->youtube_channel_title,
                'total_aulas' => $aulas->count(),
                'duracao_total_segundos' => (int) $aulas->sum('duracao_segundos'),
            ],
            'modulos' => $modulos,
            'matriculado' => $matriculado,
        ]);
    }

    public function matricular(Request $request, Curso $curso, MatricularUsuarioEmCurso $action): RedirectResponse
    {
        $action->handle($request->user(), $curso);

        return redirect()
            ->route('cursos.show', $curso->public_id)
            ->with('success', 'Matrícula realizada com sucesso!');
    }
}
