<?php

use App\Models\Aula;
use App\Models\Curso;
use App\Models\Matricula;
use App\Models\Modulo;
use App\Models\ProgressoAula;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->curso = Curso::factory()->create();
    $this->modulo = Modulo::factory()->create(['curso_id' => $this->curso->id, 'ordem' => 1]);
    $this->aula1 = Aula::factory()->create(['modulo_id' => $this->modulo->id, 'ordem' => 1, 'tipo_aula' => 'video', 'duracao_segundos' => 600]);
    $this->aula2 = Aula::factory()->create(['modulo_id' => $this->modulo->id, 'ordem' => 2, 'tipo_aula' => 'video', 'duracao_segundos' => 300]);

    $this->user = User::factory()->create();
    Matricula::create(['usuario_id' => $this->user->id, 'curso_id' => $this->curso->id, 'matriculado_em' => now()]);
});

it('guest eh redirecionado para login', function () {
    get(route('cursos.assistir', $this->curso->public_id))->assertRedirect(route('login'));
});

it('usuario sem matricula recebe 403', function () {
    actingAs(User::factory()->create());
    get(route('cursos.assistir', $this->curso->public_id))->assertForbidden();
});

it('matriculado sem {aula} eh redirecionado para primeira aula', function () {
    actingAs($this->user);
    get(route('cursos.assistir', $this->curso->public_id))
        ->assertRedirect(route('cursos.assistir', [$this->curso->public_id, $this->aula1->public_id]));
});

it('matriculado com aula em andamento eh redirecionado pra ela', function () {
    ProgressoAula::factory()->emAndamento()->create([
        'usuario_id' => $this->user->id,
        'aula_id' => $this->aula2->id,
    ]);
    actingAs($this->user);

    get(route('cursos.assistir', $this->curso->public_id))
        ->assertRedirect(route('cursos.assistir', [$this->curso->public_id, $this->aula2->public_id]));
});

it('matriculado com aula valida renderiza a pagina', function () {
    actingAs($this->user);
    get(route('cursos.assistir', [$this->curso->public_id, $this->aula1->public_id]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('Cursos/Assistir'));
});

it('aula que nao pertence ao curso retorna 404', function () {
    $outroCurso = Curso::factory()->create();
    $outroModulo = Modulo::factory()->create(['curso_id' => $outroCurso->id]);
    $aulaForasteira = Aula::factory()->create(['modulo_id' => $outroModulo->id]);

    actingAs($this->user);
    get(route('cursos.assistir', [$this->curso->public_id, $aulaForasteira->public_id]))
        ->assertNotFound();
});
