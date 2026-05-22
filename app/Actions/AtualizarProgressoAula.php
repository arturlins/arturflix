<?php

namespace App\Actions;

use App\Models\Aula;
use App\Models\ProgressoAula;
use App\Models\User;
use Illuminate\Support\Str;

class AtualizarProgressoAula
{
    public function handle(User $user, Aula $aula, int $posicaoSegundos): ProgressoAula
    {
        $progresso = ProgressoAula::query()
            ->where('usuario_id', $user->id)
            ->where('aula_id', $aula->id)
            ->first();

        if ($progresso === null) {
            return ProgressoAula::create([
                'public_id' => (string) Str::uuid(),
                'usuario_id' => $user->id,
                'aula_id' => $aula->id,
                'posicao_segundos' => max(0, $posicaoSegundos),
                'ultima_visualizacao_em' => now(),
            ]);
        }

        $progresso->posicao_segundos = max($progresso->posicao_segundos, max(0, $posicaoSegundos));
        $progresso->ultima_visualizacao_em = now();
        $progresso->save();

        return $progresso;
    }
}
