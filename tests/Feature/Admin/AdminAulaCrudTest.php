<?php

use App\Enums\PapelEnum;
use App\Enums\TipoAulaEnum;
use App\Models\Aula;
use App\Models\Curso;
use App\Models\Modulo;
use App\Models\User;

beforeEach(function (): void {
    $this->admin = User::factory()->create(['papel' => PapelEnum::ADMIN]);
    $curso = Curso::create(['titulo' => 'C']);
    $this->modulo = Modulo::create(['curso_id' => $curso->id, 'titulo' => 'M', 'ordem' => 1]);
});

it('cria aula tipo VIDEO', function (): void {
    $this->actingAs($this->admin)
        ->post(route('admin.aulas.store', $this->modulo), [
            'titulo' => 'Aula 1',
            'tipo_aula' => TipoAulaEnum::VIDEO->value,
            'url_video' => 'https://youtu.be/abc',
            'duracao_segundos' => 600,
        ])
        ->assertRedirect();

    expect(Aula::where('titulo', 'Aula 1')->exists())->toBeTrue();
});

it('cria aula tipo TEXTO sem url_video', function (): void {
    $this->actingAs($this->admin)
        ->post(route('admin.aulas.store', $this->modulo), [
            'titulo' => 'Leitura',
            'tipo_aula' => TipoAulaEnum::TEXTO->value,
            'conteudo' => '# Markdown content here',
        ])
        ->assertRedirect();

    expect(Aula::where('titulo', 'Leitura')->exists())->toBeTrue();
});

it('rejeita aula video sem url_video', function (): void {
    $this->actingAs($this->admin)
        ->post(route('admin.aulas.store', $this->modulo), [
            'titulo' => 'X',
            'tipo_aula' => TipoAulaEnum::VIDEO->value,
        ])
        ->assertSessionHasErrors('url_video');
});

it('atualiza aula', function (): void {
    $aula = Aula::create([
        'modulo_id' => $this->modulo->id,
        'titulo' => 'old', 'tipo_aula' => TipoAulaEnum::TEXTO,
        'ordem' => 1,
    ]);

    $this->actingAs($this->admin)
        ->put(route('admin.aulas.update', $aula), [
            'titulo' => 'novo',
            'tipo_aula' => TipoAulaEnum::TEXTO->value,
            'conteudo' => 'novo conteudo',
        ])
        ->assertRedirect();

    expect($aula->fresh()->titulo)->toBe('novo');
});

it('reordena aulas', function (): void {
    $a1 = Aula::create(['modulo_id' => $this->modulo->id, 'titulo' => 'A', 'tipo_aula' => TipoAulaEnum::TEXTO, 'ordem' => 1]);
    $a2 = Aula::create(['modulo_id' => $this->modulo->id, 'titulo' => 'B', 'tipo_aula' => TipoAulaEnum::TEXTO, 'ordem' => 2]);

    $this->actingAs($this->admin)
        ->put(route('admin.aulas.reorder', $this->modulo), [
            'ordem' => [$a2->public_id, $a1->public_id],
        ])
        ->assertRedirect();

    expect($a1->fresh()->ordem)->toBe(2)
        ->and($a2->fresh()->ordem)->toBe(1);
});

it('exclui aula', function (): void {
    $aula = Aula::create(['modulo_id' => $this->modulo->id, 'titulo' => 'X', 'tipo_aula' => TipoAulaEnum::TEXTO, 'ordem' => 1]);

    $this->actingAs($this->admin)
        ->delete(route('admin.aulas.destroy', $aula))
        ->assertRedirect();

    expect(Aula::find($aula->id))->toBeNull();
});
