<?php

use App\Actions\AtualizarProgressoAula;
use App\Models\Aula;
use App\Models\Modulo;
use App\Models\ProgressoAula;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('cria row no primeiro update', function () {
    $user = User::factory()->create();
    $aula = Aula::factory()->create(['modulo_id' => Modulo::factory()]);

    app(AtualizarProgressoAula::class)->handle($user, $aula, 42);

    $progresso = ProgressoAula::where('aula_id', $aula->id)->first();
    expect($progresso)->not->toBeNull();
    expect($progresso->posicao_segundos)->toBe(42);
    expect($progresso->ultima_visualizacao_em)->not->toBeNull();
    expect($progresso->concluido_em)->toBeNull();
});

it('nao regride posicao quando nova eh menor', function () {
    $user = User::factory()->create();
    $aula = Aula::factory()->create(['modulo_id' => Modulo::factory()]);

    app(AtualizarProgressoAula::class)->handle($user, $aula, 100);
    app(AtualizarProgressoAula::class)->handle($user, $aula, 30);

    $progresso = ProgressoAula::where('aula_id', $aula->id)->first();
    expect($progresso->posicao_segundos)->toBe(100);
});

it('atualiza ultima_visualizacao_em em aula ja concluida sem mexer em concluido_em', function () {
    $user = User::factory()->create();
    $aula = Aula::factory()->create(['modulo_id' => Modulo::factory()]);
    $progresso = ProgressoAula::factory()->concluida()->create([
        'usuario_id' => $user->id,
        'aula_id' => $aula->id,
        'posicao_segundos' => 100,
    ]);
    $concluidoOriginal = $progresso->concluido_em;

    app(AtualizarProgressoAula::class)->handle($user, $aula, 150);

    $progresso->refresh();
    expect($progresso->concluido_em->toIso8601String())->toBe($concluidoOriginal->toIso8601String());
    expect($progresso->posicao_segundos)->toBe(150);
});
