<?php

use App\Models\Aula;
use App\Models\Curso;
use App\Models\Matricula;
use App\Models\Modulo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\post;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->curso = Curso::factory()->create();
    $this->modulo = Modulo::factory()->create(['curso_id' => $this->curso->id]);
    $this->aula = Aula::factory()->create(['modulo_id' => $this->modulo->id]);
});

it('bloqueia progresso sem matricula', function () {
    actingAs(User::factory()->create());

    post(route('aulas.progresso', $this->aula->public_id), ['posicao_segundos' => 10])
        ->assertForbidden();
});

it('bloqueia conclusao sem matricula', function () {
    actingAs(User::factory()->create());

    post(route('aulas.concluir', $this->aula->public_id))->assertForbidden();
});

it('permite progresso com matricula', function () {
    $user = User::factory()->create();
    Matricula::create([
        'usuario_id' => $user->id,
        'curso_id' => $this->curso->id,
        'matriculado_em' => now(),
    ]);
    actingAs($user);

    post(route('aulas.progresso', $this->aula->public_id), ['posicao_segundos' => 10])
        ->assertNoContent();
});
