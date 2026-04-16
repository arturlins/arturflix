<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ReorderModulosRequest;
use App\Http\Requests\Admin\StoreModuloRequest;
use App\Http\Requests\Admin\UpdateModuloRequest;
use App\Models\Curso;
use App\Models\Modulo;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AdminModuloController extends Controller
{
    use AuthorizesRequests;

    public function store(StoreModuloRequest $request, Curso $curso): RedirectResponse
    {
        $proximaOrdem = (int) $curso->modulos()->max('ordem') + 1;

        $curso->modulos()->create([
            'titulo' => $request->validated()['titulo'],
            'ordem' => $proximaOrdem,
        ]);

        return back()->with('success', 'Módulo criado.');
    }

    public function edit(Modulo $modulo): Response
    {
        $this->authorize('update', $modulo->curso);

        $modulo->load(['curso', 'aulas' => fn ($q) => $q->orderBy('ordem')]);

        return Inertia::render('Admin/Modulos/Edit', [
            'modulo' => [
                'public_id' => $modulo->public_id,
                'titulo' => $modulo->titulo,
                'ordem' => $modulo->ordem,
                'curso' => [
                    'public_id' => $modulo->curso->public_id,
                    'titulo' => $modulo->curso->titulo,
                ],
                'aulas' => $modulo->aulas->map(fn ($a) => [
                    'public_id' => $a->public_id,
                    'titulo' => $a->titulo,
                    'tipo_aula' => $a->tipo_aula->value,
                    'ordem' => $a->ordem,
                    'duracao_segundos' => $a->duracao_segundos,
                ]),
            ],
        ]);
    }

    public function update(UpdateModuloRequest $request, Modulo $modulo): RedirectResponse
    {
        $modulo->update($request->validated());

        return back()->with('success', 'Módulo atualizado.');
    }

    public function destroy(Modulo $modulo): RedirectResponse
    {
        $this->authorize('update', $modulo->curso);

        $cursoPublicId = $modulo->curso->public_id;

        DB::transaction(function () use ($modulo): void {
            $modulo->aulas()->delete();
            $modulo->delete();
        });

        return redirect()
            ->route('admin.cursos.edit', $cursoPublicId)
            ->with('success', 'Módulo excluído.');
    }

    public function reorder(ReorderModulosRequest $request, Curso $curso): RedirectResponse
    {
        $ordemList = $request->validated()['ordem'];

        DB::transaction(function () use ($ordemList): void {
            $offset = count($ordemList) + 1000;

            foreach ($ordemList as $position => $publicId) {
                Modulo::where('public_id', $publicId)
                    ->update(['ordem' => $offset + $position]);
            }

            foreach ($ordemList as $position => $publicId) {
                Modulo::where('public_id', $publicId)
                    ->update(['ordem' => $position + 1]);
            }
        });

        return back()->with('success', 'Módulos reordenados.');
    }
}
