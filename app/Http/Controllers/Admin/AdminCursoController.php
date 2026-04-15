<?php

namespace App\Http\Controllers\Admin;

use App\Actions\ImportPlaylistAsCurso;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ImportPlaylistRequest;
use App\Models\Curso;
use App\Services\YouTube\YouTubeApiException;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AdminCursoController extends Controller
{
    public function index(): Response
    {
        $cursos = Curso::query()
            ->withCount('modulos')
            ->latest('id')
            ->get(['id', 'public_id', 'titulo', 'url_capa', 'youtube_playlist_id', 'youtube_channel_title', 'synced_at', 'created_at'])
            ->map(fn (Curso $c) => [
                'public_id' => $c->public_id,
                'titulo' => $c->titulo,
                'url_capa' => $c->url_capa,
                'youtube_playlist_id' => $c->youtube_playlist_id,
                'channel' => $c->youtube_channel_title,
                'synced_at' => $c->synced_at?->toIso8601String(),
                'modulos_count' => $c->modulos_count,
            ]);

        return Inertia::render('Admin/Cursos/Index', ['cursos' => $cursos]);
    }

    public function importForm(): Response
    {
        return Inertia::render('Admin/Cursos/Import');
    }

    public function import(ImportPlaylistRequest $request): RedirectResponse
    {
        $playlistId = $request->extractedPlaylistId();

        if ($playlistId === null) {
            return back()
                ->withErrors(['playlist_input' => 'URL ou ID de playlist inválido.'])
                ->withInput();
        }

        try {
            $curso = app(ImportPlaylistAsCurso::class)->handle($playlistId);
        } catch (YouTubeApiException $e) {
            return back()->withErrors(['playlist_input' => $e->getMessage()])->withInput();
        }

        return redirect()
            ->route('admin.cursos.index')
            ->with('success', "Curso \"{$curso->titulo}\" importado com sucesso.");
    }
}
