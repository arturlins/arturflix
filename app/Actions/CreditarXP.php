<?php

namespace App\Actions;

use App\Models\Aula;
use App\Models\HistoricoXP;
use App\Models\PerfilGamificado;
use App\Models\User;

class CreditarXP
{
    public function handle(User $user, Aula $aula, string $motivo = 'aula:concluida'): int
    {
        $xp = (int) ceil(max(0, (int) $aula->duracao_segundos) / 60);

        if ($xp === 0) {
            return 0;
        }

        HistoricoXP::create([
            'usuario_id' => $user->id,
            'quantidade' => $xp,
            'motivo' => $motivo,
        ]);

        $perfil = PerfilGamificado::firstOrCreate(['usuario_id' => $user->id]);
        $perfil->xp_total += $xp;
        $perfil->nivel_atual = (int) floor(sqrt($perfil->xp_total / 100)) + 1;
        $perfil->ultima_atividade = now()->toDateString();
        $perfil->save();

        return $xp;
    }
}
