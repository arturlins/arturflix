<?php

use App\Enums\PapelEnum;
use App\Models\User;

beforeEach(function (): void {
    $this->admin = User::factory()->create(['papel' => PapelEnum::ADMIN]);
    $this->superuser = User::factory()->create(['papel' => PapelEnum::SUPERUSER]);
});

it('lista usuários', function (): void {
    User::factory()->count(3)->create(['papel' => PapelEnum::ALUNO]);
    $this->actingAs($this->admin)
        ->get(route('admin.usuarios.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('Admin/Usuarios/Index'));
});

it('admin cria aluno', function (): void {
    $this->actingAs($this->admin)
        ->post(route('admin.usuarios.store'), [
            'nome_completo' => 'Joana Silva',
            'email' => 'joana@example.com',
            'password' => 'senha-forte-123',
            'password_confirmation' => 'senha-forte-123',
            'papel' => PapelEnum::ALUNO->value,
        ])
        ->assertRedirect();
    expect(User::where('email', 'joana@example.com')->first()?->papel)->toBe(PapelEnum::ALUNO);
});

it('admin não pode criar admin', function (): void {
    $this->actingAs($this->admin)
        ->post(route('admin.usuarios.store'), [
            'nome_completo' => 'X', 'email' => 'x@example.com',
            'password' => 'senha-forte-123', 'password_confirmation' => 'senha-forte-123',
            'papel' => PapelEnum::ADMIN->value,
        ])
        ->assertSessionHasErrors('papel');
});

it('superuser cria admin', function (): void {
    $this->actingAs($this->superuser)
        ->post(route('admin.usuarios.store'), [
            'nome_completo' => 'Novo Admin', 'email' => 'admin2@example.com',
            'password' => 'senha-forte-123', 'password_confirmation' => 'senha-forte-123',
            'papel' => PapelEnum::ADMIN->value,
        ])
        ->assertRedirect();
    expect(User::where('email', 'admin2@example.com')->first()?->papel)->toBe(PapelEnum::ADMIN);
});

it('admin não atualiza admin', function (): void {
    $outro = User::factory()->create(['papel' => PapelEnum::ADMIN]);
    $this->actingAs($this->admin)
        ->put(route('admin.usuarios.update', $outro), [
            'nome_completo' => 'mudado', 'email' => $outro->email, 'papel' => PapelEnum::ADMIN->value,
        ])
        ->assertForbidden();
});

it('superuser não pode excluir a si próprio', function (): void {
    $this->actingAs($this->superuser)
        ->delete(route('admin.usuarios.destroy', $this->superuser))
        ->assertForbidden();
});

it('admin exclui aluno', function (): void {
    $aluno = User::factory()->create(['papel' => PapelEnum::ALUNO]);
    $this->actingAs($this->admin)
        ->delete(route('admin.usuarios.destroy', $aluno))
        ->assertRedirect();
    expect(User::find($aluno->id))->toBeNull();
});

it('atualizar senha é opcional', function (): void {
    $aluno = User::factory()->create(['papel' => PapelEnum::ALUNO]);
    $hashAntigo = $aluno->password;
    $this->actingAs($this->admin)
        ->put(route('admin.usuarios.update', $aluno), [
            'nome_completo' => 'Renomeado', 'email' => $aluno->email, 'papel' => PapelEnum::ALUNO->value,
        ])
        ->assertRedirect();
    expect($aluno->fresh()->password)->toBe($hashAntigo);
});
