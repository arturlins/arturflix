<?php

use App\Enums\StatusChamadoEnum;
use App\Models\ChamadoSuporte;
use App\Models\User;

it('cria chamado com defaults', function (): void {
    $chamado = ChamadoSuporte::create([
        'email_contato' => 'a@b.com',
        'assunto' => 'Bug',
        'mensagem' => 'Não funciona.',
    ]);
    expect($chamado->status)->toBe(StatusChamadoEnum::NOVO)
        ->and($chamado->public_id)->not->toBeEmpty();
});

it('relação usuario opcional', function (): void {
    $user = User::factory()->create();
    $chamado = ChamadoSuporte::create([
        'usuario_id' => $user->id,
        'email_contato' => $user->email,
        'assunto' => 'X',
        'mensagem' => 'Y',
    ]);
    expect($chamado->usuario->id)->toBe($user->id);
});
