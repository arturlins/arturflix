<?php

use App\Models\User;

it('shares auth user as null for guests', function (): void {
    $this->get('/login')
        ->assertInertia(function ($page): void {
            $page->where('auth.user', null);
        });
});

it('shares authenticated user data in all inertia responses', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get('/dashboard')
        ->assertInertia(function ($page) use ($user): void {
            $page->where('auth.user.id', $user->id)
                ->where('auth.user.email', $user->email)
                ->where('auth.user.name', $user->name)
                ->where('auth.user.papel', $user->papel->value);
        });
});

it('shares flash messages in inertia responses', function (): void {
    $this->withSession(['success' => 'Operação realizada com sucesso!'])
        ->get('/login')
        ->assertInertia(function ($page): void {
            $page->where('flash.success', 'Operação realizada com sucesso!')
                ->where('flash.error', null);
        });
});
