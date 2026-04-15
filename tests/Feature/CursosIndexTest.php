<?php

use App\Models\Aula;
use App\Models\Curso;
use App\Models\Modulo;

it('renders cursos index with DB data', function (): void {
    $curso = Curso::factory()->create(['titulo' => 'Curso Real']);
    $modulo = Modulo::factory()->for($curso)->create();
    Aula::factory()
        ->for($modulo)
        ->count(3)
        ->sequence(fn ($seq) => ['ordem' => $seq->index + 1])
        ->create(['duracao_segundos' => 600]);

    $this->get('/cursos')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Cursos/Index')
            ->has('cursos', 1)
            ->where('cursos.0.titulo', 'Curso Real')
            ->where('cursos.0.total_aulas', 3)
            ->where('cursos.0.duracao_total_segundos', 1800)
        );
});

it('renders empty state when no cursos', function (): void {
    $this->get('/cursos')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('Cursos/Index')->has('cursos', 0));
});
