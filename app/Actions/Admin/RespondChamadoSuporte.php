<?php

namespace App\Actions\Admin;

use App\Enums\StatusChamadoEnum;
use App\Models\ChamadoSuporte;

class RespondChamadoSuporte
{
    public function handle(ChamadoSuporte $chamado, string $resposta): void
    {
        $chamado->update([
            'resposta' => $resposta,
            'status' => StatusChamadoEnum::EM_ANDAMENTO,
        ]);
    }
}
