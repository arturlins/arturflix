<?php

namespace Database\Factories;

use App\Models\PerfilGamificado;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PerfilGamificado>
 */
class PerfilGamificadoFactory extends Factory
{
    protected $model = PerfilGamificado::class;

    public function definition(): array
    {
        return [
            'usuario_id' => User::factory(),
            'xp_total' => 0,
            'nivel_atual' => 1,
            'streak_dias' => 0,
            'ultima_atividade' => null,
        ];
    }
}
