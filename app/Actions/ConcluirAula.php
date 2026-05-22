<?php

namespace App\Actions;

use App\Models\Aula;
use App\Models\ProgressoAula;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ConcluirAula
{
    public function __construct(private CreditarXP $creditarXP) {}

    public function handle(User $user, Aula $aula): int
    {
        return DB::transaction(function () use ($user, $aula): int {
            $progresso = ProgressoAula::query()
                ->where('usuario_id', $user->id)
                ->where('aula_id', $aula->id)
                ->lockForUpdate()
                ->first();

            if ($progresso && $progresso->concluido_em !== null) {
                return 0;
            }

            if ($progresso === null) {
                $progresso = ProgressoAula::create([
                    'public_id' => (string) Str::uuid(),
                    'usuario_id' => $user->id,
                    'aula_id' => $aula->id,
                    'posicao_segundos' => 0,
                    'ultima_visualizacao_em' => now(),
                ]);
            }

            $progresso->concluido_em = now();
            $progresso->ultima_visualizacao_em = now();
            $progresso->save();

            return $this->creditarXP->handle($user, $aula);
        });
    }
}
