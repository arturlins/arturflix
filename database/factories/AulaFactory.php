<?php

namespace Database\Factories;

use App\Enums\TipoAulaEnum;
use App\Models\Aula;
use App\Models\Modulo;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Aula>
 */
class AulaFactory extends Factory
{
    protected $model = Aula::class;

    public function definition(): array
    {
        return [
            'modulo_id' => Modulo::factory(),
            'titulo' => fake()->sentence(6),
            'tipo_aula' => TipoAulaEnum::VIDEO,
            'url_video' => 'https://www.youtube.com/watch?v='.fake()->regexify('[A-Za-z0-9_-]{11}'),
            'duracao_segundos' => fake()->numberBetween(120, 3600),
            'ordem' => 1,
        ];
    }
}
