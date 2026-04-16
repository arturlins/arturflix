<?php

namespace App\Policies;

use App\Models\ChamadoSuporte;
use App\Models\User;

class ChamadoSuportePolicy
{
    public function viewAny(User $actor): bool
    {
        return $actor->isAdmin();
    }

    public function view(User $actor, ChamadoSuporte $chamado): bool
    {
        return $actor->isAdmin();
    }

    public function respond(User $actor, ChamadoSuporte $chamado): bool
    {
        return $actor->isAdmin();
    }

    public function resolve(User $actor, ChamadoSuporte $chamado): bool
    {
        return $actor->isAdmin();
    }
}
