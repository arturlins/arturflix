<?php

namespace Database\Factories;

use App\Models\Curso;
use App\Models\Modulo;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Modulo>
 */
class ModuloFactory extends Factory
{
    protected $model = Modulo::class;

    public function definition(): array
    {
        return [
            'curso_id' => Curso::factory(),
            'titulo' => fake()->words(3, true),
            'ordem' => 1,
        ];
    }
}
