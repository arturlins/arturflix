<?php

use App\Models\User;

it('renders login page for guests', function (): void {
    $this->get('/login')
        ->assertInertia(fn ($page) => $page->component('Auth/Login'));
});

it('redirects authenticated users away from login page', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get('/login')
        ->assertRedirect('/dashboard');
});

it('authenticates user with valid credentials', function (): void {
    $user = User::factory()->create();

    $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ])->assertRedirect('/dashboard');

    $this->assertAuthenticatedAs($user);
});

it('rejects invalid credentials', function (): void {
    $user = User::factory()->create();

    $this->post('/login', [
        'email' => $user->email,
        'password' => 'senha-errada',
    ])->assertSessionHasErrors('email');

    $this->assertGuest();
});

it('requires email and password', function (): void {
    $this->post('/login', [])
        ->assertSessionHasErrors(['email', 'password']);
});
