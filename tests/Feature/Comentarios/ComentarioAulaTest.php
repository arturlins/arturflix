<?php

use App\Enums\PapelEnum;
use App\Models\Aula;
use App\Models\ComentarioAula;
use App\Models\Curso;
use App\Models\Matricula;
use App\Models\Modulo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\assertDatabaseHas;
use function Pest\Laravel\assertDatabaseMissing;
use function Pest\Laravel\delete;
use function Pest\Laravel\post;
use function Pest\Laravel\put;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->curso = Curso::factory()->create();
    $this->modulo = Modulo::factory()->create(['curso_id' => $this->curso->id]);
    $this->aula = Aula::factory()->create(['modulo_id' => $this->modulo->id]);
    $this->user = User::factory()->create();
    Matricula::create(['usuario_id' => $this->user->id, 'curso_id' => $this->curso->id, 'matriculado_em' => now()]);
});

it('matriculado cria comentario top-level', function () {
    actingAs($this->user);

    post(route('aulas.comentarios.store', $this->aula->public_id), ['conteudo' => 'Otima aula'])
        ->assertRedirect();

    assertDatabaseHas('comentarios_aulas', ['aula_id' => $this->aula->id, 'usuario_id' => $this->user->id, 'comentario_pai_id' => null]);
});

it('matriculado responde a comentario top-level', function () {
    $pai = ComentarioAula::factory()->create(['aula_id' => $this->aula->id, 'usuario_id' => $this->user->id]);
    actingAs($this->user);

    post(route('aulas.comentarios.store', $this->aula->public_id), [
        'conteudo' => 'Concordo',
        'comentario_pai_id' => $pai->public_id,
    ])->assertRedirect();

    assertDatabaseHas('comentarios_aulas', ['comentario_pai_id' => $pai->id]);
});

it('rejeita reply de reply', function () {
    $pai = ComentarioAula::factory()->create(['aula_id' => $this->aula->id, 'usuario_id' => $this->user->id]);
    $reply = ComentarioAula::factory()->create([
        'aula_id' => $this->aula->id,
        'usuario_id' => $this->user->id,
        'comentario_pai_id' => $pai->id,
    ]);
    actingAs($this->user);

    post(route('aulas.comentarios.store', $this->aula->public_id), [
        'conteudo' => 'reply de reply',
        'comentario_pai_id' => $reply->public_id,
    ])->assertSessionHasErrors('comentario_pai_id');
});

it('bloqueia comentario sem matricula', function () {
    actingAs(User::factory()->create());

    post(route('aulas.comentarios.store', $this->aula->public_id), ['conteudo' => 'oi'])
        ->assertForbidden();
});

it('dono edita seu comentario e marca foi_editado', function () {
    $c = ComentarioAula::factory()->create(['aula_id' => $this->aula->id, 'usuario_id' => $this->user->id]);
    actingAs($this->user);

    put(route('comentarios.update', $c->public_id), ['conteudo' => 'editado'])
        ->assertRedirect();

    assertDatabaseHas('comentarios_aulas', ['id' => $c->id, 'conteudo' => 'editado', 'foi_editado' => true]);
});

it('nao-dono nao pode editar', function () {
    $c = ComentarioAula::factory()->create(['aula_id' => $this->aula->id, 'usuario_id' => $this->user->id]);
    actingAs(User::factory()->create());

    put(route('comentarios.update', $c->public_id), ['conteudo' => 'hackeado'])
        ->assertForbidden();
});

it('dono deleta e respostas cascade', function () {
    $pai = ComentarioAula::factory()->create(['aula_id' => $this->aula->id, 'usuario_id' => $this->user->id]);
    $resp = ComentarioAula::factory()->create([
        'aula_id' => $this->aula->id,
        'usuario_id' => $this->user->id,
        'comentario_pai_id' => $pai->id,
    ]);
    actingAs($this->user);

    delete(route('comentarios.destroy', $pai->public_id))->assertRedirect();

    assertDatabaseMissing('comentarios_aulas', ['id' => $pai->id]);
    assertDatabaseMissing('comentarios_aulas', ['id' => $resp->id]);
});

it('admin pode deletar comentario de outro', function () {
    $c = ComentarioAula::factory()->create(['aula_id' => $this->aula->id, 'usuario_id' => $this->user->id]);
    $admin = User::factory()->create(['papel' => PapelEnum::ADMIN]);
    actingAs($admin);

    delete(route('comentarios.destroy', $c->public_id))->assertRedirect();
    assertDatabaseMissing('comentarios_aulas', ['id' => $c->id]);
});
