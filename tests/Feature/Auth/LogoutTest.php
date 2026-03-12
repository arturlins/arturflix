<?php

use App\Models\User;

it('logs out authenticated user', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post('/logout')
        ->assertRedirect('/');

    $this->assertGuest();
});

it('redirects guests away from protected routes', function (): void {
    $this->get('/dashboard')
        ->assertRedirect('/login');
});
