<?php

namespace App\Http\Controllers;

use App\Http\Requests\Comentarios\StoreComentarioRequest;
use App\Http\Requests\Comentarios\UpdateComentarioRequest;
use App\Models\Aula;
use App\Models\ComentarioAula;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ComentarioAulaController extends Controller
{
    public function store(StoreComentarioRequest $request, Aula $aula): RedirectResponse
    {
        $paiId = null;
        if ($request->filled('comentario_pai_id')) {
            $paiId = ComentarioAula::query()
                ->where('public_id', $request->input('comentario_pai_id'))
                ->value('id');
        }

        ComentarioAula::create([
            'aula_id' => $aula->id,
            'usuario_id' => $request->user()->id,
            'comentario_pai_id' => $paiId,
            'conteudo' => $request->string('conteudo')->trim()->value(),
        ]);

        return back()->with('success', 'Comentario publicado.');
    }

    public function update(UpdateComentarioRequest $request, ComentarioAula $comentario): RedirectResponse
    {
        $comentario->update([
            'conteudo' => $request->string('conteudo')->trim()->value(),
            'foi_editado' => true,
        ]);

        return back()->with('success', 'Comentario atualizado.');
    }

    public function destroy(Request $request, ComentarioAula $comentario): RedirectResponse
    {
        Gate::authorize('delete', $comentario);
        $comentario->delete();

        return back()->with('success', 'Comentario removido.');
    }
}
