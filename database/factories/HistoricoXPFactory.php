<?php

namespace Database\Factories;

use App\Models\HistoricoXP;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<HistoricoXP>
 */
class HistoricoXPFactory extends Factory
{
    protected $model = HistoricoXP::class;

    public function definition(): array
    {
        return [
            'usuario_id' => User::factory(),
            'quantidade' => $this->faker->numberBetween(1, 50),
            'motivo' => 'aula:concluida',
        ];
    }
}
