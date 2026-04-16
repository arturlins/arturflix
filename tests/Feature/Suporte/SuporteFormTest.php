<?php

use App\Models\ChamadoSuporte;
use App\Models\User;

it('cria chamado de visitante anônimo', function (): void {
    $this->post('/suporte', [
        'name' => 'Visitante', 'email' => 'v@example.com',
        'subject' => 'duvida', 'message' => 'Mensagem com mais de 10 caracteres.',
    ])->assertRedirect();
    expect(ChamadoSuporte::where('email_contato', 'v@example.com')->exists())->toBeTrue();
});

it('associa usuário autenticado', function (): void {
    $user = User::factory()->create();
    $this->actingAs($user)->post('/suporte', [
        'name' => $user->nome_completo, 'email' => $user->email,
        'subject' => 'duvida', 'message' => 'Olá time, preciso de ajuda.',
    ])->assertRedirect();
    $chamado = ChamadoSuporte::latest('id')->first();
    expect($chamado->usuario_id)->toBe($user->id);
});

it('rejeita mensagem curta', function (): void {
    $this->post('/suporte', [
        'name' => 'X', 'email' => 'x@x.com', 'subject' => 'duvida', 'message' => 'curto',
    ])->assertSessionHasErrors('message');
});
