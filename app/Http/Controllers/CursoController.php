<?php

namespace App\Http\Controllers;

use App\Models\Curso;
use Inertia\Inertia;
use Inertia\Response;

class CursoController extends Controller
{
    public function index(): Response
    {
        $cursos = Curso::query()
            ->with(['modulos.aulas:id,modulo_id,duracao_segundos'])
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
}
