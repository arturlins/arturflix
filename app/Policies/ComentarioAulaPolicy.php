<?php

namespace App\Policies;

use App\Models\ComentarioAula;
use App\Models\User;

class ComentarioAulaPolicy
{
    public function update(User $user, ComentarioAula $comentario): bool
    {
        return $user->id === $comentario->usuario_id;
    }

    public function delete(User $user, ComentarioAula $comentario): bool
    {
        return $user->id === $comentario->usuario_id || $user->isAdmin();
    }
}
