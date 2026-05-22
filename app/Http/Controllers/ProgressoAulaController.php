<?php

namespace App\Http\Controllers;

use App\Actions\AtualizarProgressoAula;
use App\Actions\ConcluirAula;
use App\Models\Aula;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ProgressoAulaController extends Controller
{
    public function update(Request $request, Aula $aula, AtualizarProgressoAula $action): Response
    {
        $data = $request->validate([
            'posicao_segundos' => ['required', 'integer', 'min:0'],
        ]);

        $action->handle($request->user(), $aula, (int) $data['posicao_segundos']);

        return response()->noContent();
    }

    public function concluir(Request $request, Aula $aula, ConcluirAula $action): RedirectResponse
    {
        $xp = $action->handle($request->user(), $aula);

        return back()->with('success', $xp > 0 ? "Aula concluida! +{$xp} XP" : 'Aula concluida!');
    }
}
