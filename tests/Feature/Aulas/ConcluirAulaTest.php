<?php

use App\Actions\ConcluirAula;
use App\Models\Aula;
use App\Models\Modulo;
use App\Models\PerfilGamificado;
use App\Models\ProgressoAula;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

use function Pest\Laravel\assertDatabaseCount;
use function Pest\Laravel\assertDatabaseHas;

uses(RefreshDatabase::class);

it('credita XP correto e marca conclusao na primeira chamada', function () {
    $user = User::factory()->create();
    $modulo = Modulo::factory()->create();
    $aula = Aula::factory()->create(['modulo_id' => $modulo->id, 'duracao_segundos' => 720]);

    $xp = app(ConcluirAula::class)->handle($user, $aula);

    expect($xp)->toBe(12);
    assertDatabaseHas('historico_xp', ['usuario_id' => $user->id, 'quantidade' => 12]);
    assertDatabaseHas('perfis_gamificados', ['usuario_id' => $user->id, 'xp_total' => 12]);
    assertDatabaseHas('progressos_aulas', ['usuario_id' => $user->id, 'aula_id' => $aula->id]);
    $progresso = ProgressoAula::where('aula_id', $aula->id)->first();
    expect($progresso->concluido_em)->not->toBeNull();
});

it('eh idempotente: segunda chamada nao duplica XP', function () {
    $user = User::factory()->create();
    $modulo = Modulo::factory()->create();
    $aula = Aula::factory()->create(['modulo_id' => $modulo->id, 'duracao_segundos' => 600]);

    app(ConcluirAula::class)->handle($user, $aula);
    $xp = app(ConcluirAula::class)->handle($user, $aula);

    expect($xp)->toBe(0);
    assertDatabaseCount('historico_xp', 1);
    assertDatabaseHas('perfis_gamificados', ['usuario_id' => $user->id, 'xp_total' => 10]);
});

it('aula sem duracao conclui mas nao credita XP', function () {
    $user = User::factory()->create();
    $modulo = Modulo::factory()->create();
    $aula = Aula::factory()->create(['modulo_id' => $modulo->id, 'duracao_segundos' => 0]);

    $xp = app(ConcluirAula::class)->handle($user, $aula);

    expect($xp)->toBe(0);
    assertDatabaseCount('historico_xp', 0);
    expect(PerfilGamificado::where('usuario_id', $user->id)->first())->toBeNull();
    $progresso = ProgressoAula::where('aula_id', $aula->id)->first();
    expect($progresso->concluido_em)->not->toBeNull();
});

it('preserva posicao_segundos quando conclui aula em andamento', function () {
    $user = User::factory()->create();
    $modulo = Modulo::factory()->create();
    $aula = Aula::factory()->create(['modulo_id' => $modulo->id, 'duracao_segundos' => 600]);
    ProgressoAula::factory()->create([
        'usuario_id' => $user->id,
        'aula_id' => $aula->id,
        'posicao_segundos' => 200,
    ]);

    app(ConcluirAula::class)->handle($user, $aula);

    $progresso = ProgressoAula::where('aula_id', $aula->id)->first();
    expect($progresso->posicao_segundos)->toBe(200);
    expect($progresso->concluido_em)->not->toBeNull();
});
