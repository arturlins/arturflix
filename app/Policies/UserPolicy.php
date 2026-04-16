<?php

namespace App\Policies;

use App\Enums\PapelEnum;
use App\Models\User;

class UserPolicy
{
    public function viewAny(User $actor): bool
    {
        return $actor->isAdmin();
    }

    public function view(User $actor, User $alvo): bool
    {
        return $actor->isAdmin();
    }

    public function create(User $actor): bool
    {
        return $actor->isAdmin();
    }

    public function createWithRole(User $actor, PapelEnum $papel): bool
    {
        if (! $actor->isAdmin()) {
            return false;
        }

        if ($papel === PapelEnum::ALUNO) {
            return true;
        }

        return $actor->papel === PapelEnum::SUPERUSER;
    }

    public function update(User $actor, User $alvo): bool
    {
        if (! $actor->isAdmin()) {
            return false;
        }

        if ($alvo->papel === PapelEnum::ALUNO) {
            return true;
        }

        return $actor->papel === PapelEnum::SUPERUSER;
    }

    public function delete(User $actor, User $alvo): bool
    {
        if (! $actor->isAdmin()) {
            return false;
        }

        if ($actor->id === $alvo->id) {
            return false;
        }

        if ($alvo->papel === PapelEnum::ALUNO) {
            return true;
        }

        return $actor->papel === PapelEnum::SUPERUSER;
    }
}
