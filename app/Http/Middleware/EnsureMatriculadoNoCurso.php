<?php

namespace App\Http\Middleware;

use App\Models\Aula;
use App\Models\Curso;
use App\Models\Matricula;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureMatriculadoNoCurso
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if ($user === null) {
            return redirect()->route('login');
        }

        $cursoId = $this->resolveCursoId($request);
        if ($cursoId === null) {
            abort(404);
        }

        $matriculado = Matricula::query()
            ->where('usuario_id', $user->id)
            ->where('curso_id', $cursoId)
            ->exists();

        if (! $matriculado) {
            abort(403, 'Voce precisa estar matriculado neste curso.');
        }

        return $next($request);
    }

    private function resolveCursoId(Request $request): ?int
    {
        $curso = $request->route('curso');
        if ($curso instanceof Curso) {
            return $curso->id;
        }

        $aula = $request->route('aula');
        if ($aula instanceof Aula) {
            return $aula->modulo()->value('curso_id');
        }

        return null;
    }
}
