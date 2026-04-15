<?php

use App\Enums\PapelEnum;
use App\Models\User;

it('redirects guest', function (): void {
    $this->get('/admin')->assertRedirect(route('login'));
});

it('forbids aluno', function (): void {
    $this->actingAs(User::factory()->create(['papel' => PapelEnum::ALUNO]))
        ->get('/admin')
        ->assertForbidden();
});

it('renders admin dashboard for admin', function (): void {
    $admin = User::factory()->create(['papel' => PapelEnum::ADMIN]);

    $this->actingAs($admin)
        ->get('/admin')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('Admin/Dashboard'));
});
