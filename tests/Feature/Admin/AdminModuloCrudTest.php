<?php

use App\Enums\PapelEnum;
use App\Models\Curso;
use App\Models\Modulo;
use App\Models\User;

beforeEach(function (): void {
    $this->admin = User::factory()->create(['papel' => PapelEnum::ADMIN]);
    $this->curso = Curso::create(['titulo' => 'C']);
});

it('cria módulo com ordem incrementada', function (): void {
    Modulo::create(['curso_id' => $this->curso->id, 'titulo' => 'M1', 'ordem' => 1]);

    $this->actingAs($this->admin)
        ->post(route('admin.modulos.store', $this->curso), ['titulo' => 'M2'])
        ->assertRedirect();

    $modulo = $this->curso->modulos()->orderByDesc('ordem')->first();
    expect($modulo->titulo)->toBe('M2')
        ->and($modulo->ordem)->toBe(2);
});

it('atualiza módulo', function (): void {
    $modulo = Modulo::create(['curso_id' => $this->curso->id, 'titulo' => 'old', 'ordem' => 1]);

    $this->actingAs($this->admin)
        ->put(route('admin.modulos.update', $modulo), ['titulo' => 'novo'])
        ->assertRedirect();

    expect($modulo->fresh()->titulo)->toBe('novo');
});

it('reordena módulos', function (): void {
    $m1 = Modulo::create(['curso_id' => $this->curso->id, 'titulo' => 'A', 'ordem' => 1]);
    $m2 = Modulo::create(['curso_id' => $this->curso->id, 'titulo' => 'B', 'ordem' => 2]);

    $this->actingAs($this->admin)
        ->put(route('admin.modulos.reorder', $this->curso), [
            'ordem' => [$m2->public_id, $m1->public_id],
        ])
        ->assertRedirect();

    expect($m1->fresh()->ordem)->toBe(2)
        ->and($m2->fresh()->ordem)->toBe(1);
});

it('exclui módulo', function (): void {
    $modulo = Modulo::create(['curso_id' => $this->curso->id, 'titulo' => 'X', 'ordem' => 1]);

    $this->actingAs($this->admin)
        ->delete(route('admin.modulos.destroy', $modulo))
        ->assertRedirect();

    expect(Modulo::find($modulo->id))->toBeNull();
});
