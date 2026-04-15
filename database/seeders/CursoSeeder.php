<?php

namespace Database\Seeders;

use App\Enums\TipoAulaEnum;
use App\Models\Aula;
use App\Models\Curso;
use App\Models\Modulo;
use Illuminate\Database\Seeder;

class CursoSeeder extends Seeder
{
    public function run(): void
    {
        Curso::factory()
            ->count(6)
            ->create()
            ->each(function (Curso $curso): void {
                $modulo = Modulo::factory()->for($curso)->create([
                    'titulo' => 'Módulo introdutório',
                    'ordem' => 1,
                ]);

                Aula::factory()
                    ->for($modulo)
                    ->count(fake()->numberBetween(4, 12))
                    ->sequence(fn ($seq) => ['ordem' => $seq->index + 1])
                    ->create(['tipo_aula' => TipoAulaEnum::VIDEO]);
            });
    }
}
