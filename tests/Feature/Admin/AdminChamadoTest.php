<?php

use App\Enums\PapelEnum;
use App\Enums\StatusChamadoEnum;
use App\Models\ChamadoSuporte;
use App\Models\User;

beforeEach(function (): void {
    $this->admin = User::factory()->create(['papel' => PapelEnum::ADMIN]);
});

it('lista chamados', function (): void {
    ChamadoSuporte::create(['email_contato' => 'a@b.com', 'assunto' => 'X', 'mensagem' => 'msg']);
    $this->actingAs($this->admin)
        ->get(route('admin.suporte.index'))
        ->assertOk()
        ->assertInertia(fn ($p) => $p->component('Admin/Suporte/Index'));
});

it('responde chamado e marca em_andamento', function (): void {
    $chamado = ChamadoSuporte::create(['email_contato' => 'a@b.com', 'assunto' => 'X', 'mensagem' => 'msg']);
    $this->actingAs($this->admin)
        ->post(route('admin.suporte.respond', $chamado), ['resposta' => 'Olá, vamos verificar.'])
        ->assertRedirect();
    $fresh = $chamado->fresh();
    expect($fresh->resposta)->toBe('Olá, vamos verificar.')
        ->and($fresh->status)->toBe(StatusChamadoEnum::EM_ANDAMENTO);
});

it('resolve chamado', function (): void {
    $chamado = ChamadoSuporte::create(['email_contato' => 'a@b.com', 'assunto' => 'X', 'mensagem' => 'msg']);
    $this->actingAs($this->admin)
        ->post(route('admin.suporte.resolve', $chamado))
        ->assertRedirect();
    $fresh = $chamado->fresh();
    expect($fresh->status)->toBe(StatusChamadoEnum::RESOLVIDO)
        ->and($fresh->resolvido_em)->not->toBeNull();
});

it('aluno não acessa', function (): void {
    $aluno = User::factory()->create(['papel' => PapelEnum::ALUNO]);
    $this->actingAs($aluno)
        ->get(route('admin.suporte.index'))
        ->assertForbidden();
});
