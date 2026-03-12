<?php

use App\Models\User;

it('renders register page for guests', function (): void {
    $this->get('/register')
        ->assertInertia(fn ($page) => $page->component('Auth/Register'));
});

it('redirects authenticated users away from register page', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get('/register')
        ->assertRedirect('/dashboard');
});

it('creates a new user with valid data', function (): void {
    $this->post('/register', [
        'name' => 'Artur Silva',
        'email' => 'artur@exemplo.com',
        'password' => 'senha12345',
        'password_confirmation' => 'senha12345',
    ])->assertRedirect('/dashboard');

    $this->assertAuthenticated();

    $this->assertDatabaseHas('users', [
        'name' => 'Artur Silva',
        'email' => 'artur@exemplo.com',
        'aceitou_termos' => true,
    ]);
});

it('rejects duplicate email', function (): void {
    User::factory()->create(['email' => 'existente@exemplo.com']);

    $this->post('/register', [
        'name' => 'Outro Usuário',
        'email' => 'existente@exemplo.com',
        'password' => 'senha12345',
        'password_confirmation' => 'senha12345',
    ])->assertSessionHasErrors('email');
});

it('requires password confirmation', function (): void {
    $this->post('/register', [
        'name' => 'Artur Silva',
        'email' => 'artur@exemplo.com',
        'password' => 'senha12345',
        'password_confirmation' => 'senha-diferente',
    ])->assertSessionHasErrors('password');
});
