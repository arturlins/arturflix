<?php

use App\Enums\PapelEnum;
use App\Models\Aula;
use App\Models\Curso;
use App\Models\Modulo;
use App\Models\User;
use App\Services\YouTube\PlaylistData;
use App\Services\YouTube\VideoData;
use App\Services\YouTube\YouTubeApiException;
use App\Services\YouTube\YouTubePlaylistService;

function fakePlaylistService(PlaylistData $data): void
{
    $fake = new class($data) extends YouTubePlaylistService
    {
        public function __construct(private PlaylistData $data) {}

        public function fetch(string $playlistId): PlaylistData
        {
            return $this->data;
        }
    };

    app()->instance(YouTubePlaylistService::class, $fake);
}

beforeEach(function (): void {
    $this->admin = User::factory()->create(['papel' => PapelEnum::ADMIN]);
});

it('imports playlist creating curso, modulo and aulas', function (): void {
    fakePlaylistService(new PlaylistData(
        playlistId: 'PLabc123',
        title: 'Laravel do Zero',
        description: 'Curso completo',
        thumbnailUrl: 'https://img/thumb.jpg',
        channelTitle: 'Canal Dev',
        videos: [
            new VideoData('vid1', 'Aula 1', 300),
            new VideoData('vid2', 'Aula 2', 600),
        ],
    ));

    $response = $this->actingAs($this->admin)->post('/admin/cursos/importar', [
        'playlist_input' => 'https://youtube.com/playlist?list=PLabc123',
    ]);

    $response->assertRedirect(route('admin.cursos.index'));
    $response->assertSessionHas('success');

    expect(Curso::count())->toBe(1);
    expect(Modulo::count())->toBe(1);
    expect(Aula::count())->toBe(2);

    $curso = Curso::first();
    expect($curso->titulo)->toBe('Laravel do Zero');
    expect($curso->youtube_playlist_id)->toBe('PLabc123');
    expect($curso->youtube_channel_title)->toBe('Canal Dev');

    $aulas = Aula::orderBy('ordem')->get();
    expect($aulas[0]->youtube_video_id)->toBe('vid1');
    expect($aulas[0]->duracao_segundos)->toBe(300);
    expect($aulas[0]->ordem)->toBe(1);
    expect($aulas[1]->ordem)->toBe(2);
});

it('accepts raw playlist id', function (): void {
    fakePlaylistService(new PlaylistData('PLabc123', 'x', null, null, 'Canal', []));

    $this->actingAs($this->admin)
        ->post('/admin/cursos/importar', ['playlist_input' => 'PLabc123'])
        ->assertRedirect(route('admin.cursos.index'));

    expect(Curso::where('youtube_playlist_id', 'PLabc123')->exists())->toBeTrue();
});

it('rejects invalid playlist input', function (): void {
    $this->actingAs($this->admin)
        ->post('/admin/cursos/importar', ['playlist_input' => 'nao-eh-playlist'])
        ->assertSessionHasErrors('playlist_input');

    expect(Curso::count())->toBe(0);
});

it('prevents duplicate import', function (): void {
    Curso::factory()->create(['youtube_playlist_id' => 'PLdup']);

    fakePlaylistService(new PlaylistData('PLdup', 'x', null, null, 'Canal', []));

    $this->actingAs($this->admin)
        ->post('/admin/cursos/importar', ['playlist_input' => 'PLdup'])
        ->assertSessionHasErrors('playlist_input');

    expect(Curso::count())->toBe(1);
});

it('forbids import for aluno', function (): void {
    $aluno = User::factory()->create(['papel' => PapelEnum::ALUNO]);

    $this->actingAs($aluno)
        ->post('/admin/cursos/importar', ['playlist_input' => 'PLx'])
        ->assertForbidden();
});

it('wraps api errors as validation errors', function (): void {
    $fake = new class extends YouTubePlaylistService
    {
        public function __construct() {}

        public function fetch(string $playlistId): PlaylistData
        {
            throw new YouTubeApiException('Playlist não encontrada.');
        }
    };
    app()->instance(YouTubePlaylistService::class, $fake);

    $this->actingAs($this->admin)
        ->post('/admin/cursos/importar', ['playlist_input' => 'PLfail'])
        ->assertSessionHasErrors('playlist_input');

    expect(Curso::count())->toBe(0);
});
