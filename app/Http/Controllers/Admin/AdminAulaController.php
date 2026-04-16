<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ReorderAulasRequest;
use App\Http\Requests\Admin\StoreAulaRequest;
use App\Http\Requests\Admin\UpdateAulaRequest;
use App\Models\Aula;
use App\Models\Modulo;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AdminAulaController extends Controller
{
    use AuthorizesRequests;

    public function store(StoreAulaRequest $request, Modulo $modulo): RedirectResponse
    {
        $proximaOrdem = (int) $modulo->aulas()->max('ordem') + 1;

        $modulo->aulas()->create(array_merge(
            $request->validated(),
            ['ordem' => $proximaOrdem]
        ));

        return back()->with('success', 'Aula criada.');
    }

    public function edit(Aula $aula): Response
    {
        $this->authorize('update', $aula->modulo->curso);

        $aula->load('modulo.curso');

        return Inertia::render('Admin/Aulas/Edit', [
            'aula' => [
                'public_id' => $aula->public_id,
                'titulo' => $aula->titulo,
                'tipo_aula' => $aula->tipo_aula->value,
                'conteudo' => $aula->conteudo,
                'url_video' => $aula->url_video,
                'youtube_video_id' => $aula->youtube_video_id,
                'duracao_segundos' => $aula->duracao_segundos,
                'ordem' => $aula->ordem,
                'modulo' => [
                    'public_id' => $aula->modulo->public_id,
                    'titulo' => $aula->modulo->titulo,
                    'curso' => [
                        'public_id' => $aula->modulo->curso->public_id,
                        'titulo' => $aula->modulo->curso->titulo,
                    ],
                ],
            ],
        ]);
    }

    public function update(UpdateAulaRequest $request, Aula $aula): RedirectResponse
    {
        $aula->update($request->validated());

        return back()->with('success', 'Aula atualizada.');
    }

    public function destroy(Aula $aula): RedirectResponse
    {
        $this->authorize('update', $aula->modulo->curso);

        $moduloPublicId = $aula->modulo->public_id;

        DB::transaction(function () use ($aula): void {
            $aula->delete();
        });

        return redirect()
            ->route('admin.modulos.edit', $moduloPublicId)
            ->with('success', 'Aula excluída.');
    }

    public function reorder(ReorderAulasRequest $request, Modulo $modulo): RedirectResponse
    {
        $ordemList = $request->validated()['ordem'];

        DB::transaction(function () use ($ordemList): void {
            $offset = count($ordemList) + 1000;

            foreach ($ordemList as $position => $publicId) {
                Aula::where('public_id', $publicId)
                    ->update(['ordem' => $offset + $position]);
            }

            foreach ($ordemList as $position => $publicId) {
                Aula::where('public_id', $publicId)
                    ->update(['ordem' => $position + 1]);
            }
        });

        return back()->with('success', 'Aulas reordenadas.');
    }
}
