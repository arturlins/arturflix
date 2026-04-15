<?php

use App\Enums\PapelEnum;
use App\Models\User;
use Illuminate\Support\Facades\Route;

beforeEach(function (): void {
    Route::middleware(['web', 'auth', 'admin'])->get('/__test-admin', fn () => 'ok');
});

it('redirects guest to login', function (): void {
    $this->get('/__test-admin')->assertRedirect(route('login'));
});

it('returns 403 for aluno', function (): void {
    $aluno = User::factory()->create(['papel' => PapelEnum::ALUNO]);
    $this->actingAs($aluno)->get('/__test-admin')->assertForbidden();
});

it('allows admin', function (): void {
    $admin = User::factory()->create(['papel' => PapelEnum::ADMIN]);
    $this->actingAs($admin)->get('/__test-admin')->assertOk();
});

it('allows superuser', function (): void {
    $super = User::factory()->create(['papel' => PapelEnum::SUPERUSER]);
    $this->actingAs($super)->get('/__test-admin')->assertOk();
});
