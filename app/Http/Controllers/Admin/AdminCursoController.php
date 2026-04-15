<?php

namespace App\Http\Controllers\Admin;

use App\Actions\ImportPlaylistAsCurso;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ImportPlaylistRequest;
use App\Models\Curso;
use App\Services\YouTube\YouTubeApiException;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class AdminCursoController extends Controller
{
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
