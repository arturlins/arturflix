<?php

use App\Enums\PapelEnum;
use App\Models\Curso;
use App\Models\User;

beforeEach(function (): void {
    $this->admin = User::factory()->create(['papel' => PapelEnum::ADMIN]);
});

it('renderiza form de criação para admin', function (): void {
    $this->actingAs($this->admin)
        ->get(route('admin.cursos.create'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('Admin/Cursos/Create'));
});

it('cria curso manual com dados válidos', function (): void {
    $payload = [
        'titulo' => 'Curso de Laravel',
        'descricao' => 'Aprenda Laravel do zero ao deploy.',
        'url_capa' => 'https://exemplo.com/capa.jpg',
    ];

    $this->actingAs($this->admin)
        ->post(route('admin.cursos.store'), $payload)
        ->assertRedirect();

    expect(Curso::where('titulo', 'Curso de Laravel')->exists())->toBeTrue();
});

it('rejeita criação sem título', function (): void {
    $this->actingAs($this->admin)
        ->post(route('admin.cursos.store'), ['descricao' => 'algo'])
        ->assertSessionHasErrors('titulo');
});

it('aluno é proibido de criar curso', function (): void {
    $aluno = User::factory()->create(['papel' => PapelEnum::ALUNO]);

    $this->actingAs($aluno)
        ->post(route('admin.cursos.store'), ['titulo' => 'X'])
        ->assertForbidden();
});
