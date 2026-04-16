<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Admin\DeleteCursoCascade;
use App\Actions\ImportPlaylistAsCurso;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ImportPlaylistRequest;
use App\Http\Requests\Admin\StoreCursoRequest;
use App\Http\Requests\Admin\UpdateCursoRequest;
use App\Models\Curso;
use App\Services\YouTube\YouTubeApiException;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class AdminCursoController extends Controller
{
    use AuthorizesRequests;

    public function index(): Response
    {
        $cursos = Curso::query()
            ->withCount('modulos')
            ->latest('id')
            ->get(['id', 'public_id', 'titulo', 'url_capa', 'youtube_playlist_id', 'youtube_channel_title', 'created_at'])
            ->map(fn (Curso $c) => [
                'public_id' => $c->public_id,
                'titulo' => $c->titulo,
                'url_capa' => $c->url_capa,
                'youtube_playlist_id' => $c->youtube_playlist_id,
                'channel' => $c->youtube_channel_title,
                'modulos_count' => $c->modulos_count,
            ]);

        return Inertia::render('Admin/Cursos/Index', ['cursos' => $cursos]);
    }

    public function create(): Response
    {
        $this->authorize('create', Curso::class);

        return Inertia::render('Admin/Cursos/Create');
    }

    public function store(StoreCursoRequest $request): RedirectResponse
    {
        $curso = Curso::create($request->validated());

        return redirect()
            ->route('admin.cursos.edit', $curso)
            ->with('success', "Curso \"{$curso->titulo}\" criado.");
    }

    public function edit(Curso $curso): Response
    {
        $this->authorize('view', $curso);
        $curso->load(['modulos.aulas']);

        return Inertia::render('Admin/Cursos/Edit', [
            'curso' => [
                'public_id' => $curso->public_id,
                'titulo' => $curso->titulo,
                'descricao' => $curso->descricao,
                'url_capa' => $curso->url_capa,
                'youtube_playlist_id' => $curso->youtube_playlist_id,
                'youtube_channel_title' => $curso->youtube_channel_title,
                'modulos' => $curso->modulos->map(fn ($m) => [
                    'public_id' => $m->public_id,
                    'titulo' => $m->titulo,
                    'ordem' => $m->ordem,
                    'aulas_count' => $m->aulas->count(),
                ]),
            ],
        ]);
    }

    public function update(UpdateCursoRequest $request, Curso $curso): RedirectResponse
    {
        $curso->update($request->validated());

        return back()->with('success', 'Curso atualizado.');
    }

    public function destroy(Curso $curso, DeleteCursoCascade $action): RedirectResponse
    {
        $this->authorize('delete', $curso);
        $action->handle($curso);

        return redirect()
            ->route('admin.cursos.index')
            ->with('success', 'Curso excluído.');
    }

    public function importForm(): Response
    {
        return Inertia::render('Admin/Cursos/Import');
    }

    public function import(ImportPlaylistRequest $request, ImportPlaylistAsCurso $action): RedirectResponse
    {
        $playlistId = $request->extractedPlaylistId();

        if ($playlistId === null) {
            return back()
                ->withErrors(['playlist_input' => 'URL ou ID de playlist inválido.'])
                ->withInput();
        }

        try {
            $curso = $action->handle($playlistId);
        } catch (UniqueConstraintViolationException) {
            return back()
                ->withErrors(['playlist_input' => 'Esta playlist já foi importada.'])
                ->withInput();
        } catch (YouTubeApiException $e) {
            Log::warning('YouTube import falhou', [
                'playlist_id' => $playlistId,
                'admin_id' => $request->user()?->id,
                'message' => $e->getMessage(),
            ]);

            return back()->withErrors(['playlist_input' => $e->getMessage()])->withInput();
        }

        return redirect()
            ->route('admin.cursos.index')
            ->with('success', "Curso \"{$curso->titulo}\" importado com sucesso.");
    }
}
