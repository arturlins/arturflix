<?php

namespace App\Actions;

use App\Models\Curso;
use App\Models\Matricula;
use App\Models\User;

class MatricularUsuarioEmCurso
{
    public function handle(User $user, Curso $curso): Matricula
    {
        return Matricula::query()->firstOrCreate(
            [
                'usuario_id' => $user->id,
                'curso_id' => $curso->id,
            ],
            [
                'matriculado_em' => now(),
            ],
        );
    }
}
