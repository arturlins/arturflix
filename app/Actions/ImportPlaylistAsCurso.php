<?php

namespace App\Actions;

use App\Enums\TipoAulaEnum;
use App\Models\Aula;
use App\Models\Curso;
use App\Models\Modulo;
use App\Services\YouTube\PlaylistData;
use App\Services\YouTube\YouTubeApiException;
use App\Services\YouTube\YouTubePlaylistService;
use Illuminate\Support\Facades\DB;

class ImportPlaylistAsCurso
{
    public function __construct(private readonly YouTubePlaylistService $youtube) {}

    public function handle(string $playlistId): Curso
    {
        if (Curso::query()->where('youtube_playlist_id', $playlistId)->exists()) {
            throw new YouTubeApiException('Esta playlist já foi importada.');
        }

        $data = $this->youtube->fetch($playlistId);

        return DB::transaction(fn () => $this->persist($data));
    }

    private function persist(PlaylistData $data): Curso
    {
        $curso = Curso::query()->create([
            'titulo' => $data->title,
            'descricao' => $data->description,
            'url_capa' => $data->thumbnailUrl,
            'youtube_playlist_id' => $data->playlistId,
            'youtube_channel_title' => $data->channelTitle,
            'synced_at' => now(),
        ]);

        $modulo = Modulo::query()->create([
            'curso_id' => $curso->id,
            'titulo' => 'Playlist',
            'ordem' => 1,
        ]);

        foreach ($data->videos as $index => $video) {
            Aula::query()->create([
                'modulo_id' => $modulo->id,
                'titulo' => $video->title,
                'tipo_aula' => TipoAulaEnum::VIDEO,
                'url_video' => $video->youtubeUrl(),
                'youtube_video_id' => $video->videoId,
                'duracao_segundos' => $video->durationSeconds,
                'ordem' => $index + 1,
            ]);
        }

        return $curso->fresh(['modulos.aulas']);
    }
}
