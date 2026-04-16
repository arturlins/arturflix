<?php

namespace App\Policies;

use App\Models\Curso;
use App\Models\User;

class CursoPolicy
{
    public function viewAny(User $actor): bool
    {
        return $actor->isAdmin();
    }

    public function view(User $actor, Curso $curso): bool
    {
        return $actor->isAdmin();
    }

    public function create(User $actor): bool
    {
        return $actor->isAdmin();
    }

    public function update(User $actor, Curso $curso): bool
    {
        return $actor->isAdmin();
    }

    public function delete(User $actor, Curso $curso): bool
    {
        return $actor->isAdmin();
    }
}
