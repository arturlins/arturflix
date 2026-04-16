<?php

use App\Enums\PapelEnum;
use App\Models\User;
use App\Policies\UserPolicy;

beforeEach(function (): void {
    $this->policy = new UserPolicy;
});

it('aluno não acessa nada', function (): void {
    $aluno = User::factory()->create(['papel' => PapelEnum::ALUNO]);
    $alvo = User::factory()->create(['papel' => PapelEnum::ALUNO]);

    expect($this->policy->viewAny($aluno))->toBeFalse()
        ->and($this->policy->update($aluno, $alvo))->toBeFalse()
        ->and($this->policy->delete($aluno, $alvo))->toBeFalse();
});

it('admin gerencia alunos mas não admin/superuser', function (): void {
    $admin = User::factory()->create(['papel' => PapelEnum::ADMIN]);
    $aluno = User::factory()->create(['papel' => PapelEnum::ALUNO]);
    $outroAdmin = User::factory()->create(['papel' => PapelEnum::ADMIN]);
    $superuser = User::factory()->create(['papel' => PapelEnum::SUPERUSER]);

    expect($this->policy->viewAny($admin))->toBeTrue()
        ->and($this->policy->update($admin, $aluno))->toBeTrue()
        ->and($this->policy->delete($admin, $aluno))->toBeTrue()
        ->and($this->policy->update($admin, $outroAdmin))->toBeFalse()
        ->and($this->policy->delete($admin, $outroAdmin))->toBeFalse()
        ->and($this->policy->update($admin, $superuser))->toBeFalse();
});

it('superuser gerencia tudo exceto a si próprio em delete', function (): void {
    $superuser = User::factory()->create(['papel' => PapelEnum::SUPERUSER]);
    $admin = User::factory()->create(['papel' => PapelEnum::ADMIN]);
    $outro = User::factory()->create(['papel' => PapelEnum::SUPERUSER]);

    expect($this->policy->update($superuser, $admin))->toBeTrue()
        ->and($this->policy->delete($superuser, $admin))->toBeTrue()
        ->and($this->policy->delete($superuser, $outro))->toBeTrue()
        ->and($this->policy->delete($superuser, $superuser))->toBeFalse();
});

it('admin não cria admin/superuser; superuser cria qualquer', function (): void {
    $admin = User::factory()->create(['papel' => PapelEnum::ADMIN]);
    $superuser = User::factory()->create(['papel' => PapelEnum::SUPERUSER]);

    expect($this->policy->createWithRole($admin, PapelEnum::ALUNO))->toBeTrue()
        ->and($this->policy->createWithRole($admin, PapelEnum::ADMIN))->toBeFalse()
        ->and($this->policy->createWithRole($admin, PapelEnum::SUPERUSER))->toBeFalse()
        ->and($this->policy->createWithRole($superuser, PapelEnum::ADMIN))->toBeTrue()
        ->and($this->policy->createWithRole($superuser, PapelEnum::SUPERUSER))->toBeTrue();
});
