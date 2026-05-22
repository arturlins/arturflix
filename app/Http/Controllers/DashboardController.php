<?php

namespace App\Http\Controllers;

use App\Models\Matricula;
use App\Models\ProgressoAula;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $matriculas = $request->user()
            ->matriculas()
            ->with(['curso.modulos.aulas:id,modulo_id,duracao_segundos'])
            ->latest('matriculado_em')
            ->get()
            ->map(function (Matricula $matricula) use ($request): array {
                $curso = $matricula->curso;
                $aulas = $curso->modulos->flatMap->aulas;
                $aulaIds = $aulas->pluck('id');

                $aulasConcluidas = ProgressoAula::query()
                    ->where('usuario_id', $request->user()->id)
                    ->whereIn('aula_id', $aulaIds)
                    ->whereNotNull('concluido_em')
                    ->count();

                return [
                    'public_id' => $curso->public_id,
                    'titulo' => $curso->titulo,
                    'url_capa' => $curso->url_capa,
                    'channel' => $curso->youtube_channel_title,
                    'total_aulas' => $aulas->count(),
                    'aulas_concluidas' => $aulasConcluidas,
                    'duracao_total_segundos' => (int) $aulas->sum('duracao_segundos'),
                    'matriculado_em' => $matricula->matriculado_em?->toIso8601String(),
                    'concluido_em' => $matricula->concluido_em?->toIso8601String(),
                ];
            });

        return Inertia::render('Dashboard', [
            'meusCursos' => $matriculas,
        ]);
    }
}
