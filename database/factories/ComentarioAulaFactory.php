<?php

namespace Database\Factories;

use App\Models\Aula;
use App\Models\ComentarioAula;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<ComentarioAula>
 */
class ComentarioAulaFactory extends Factory
{
    protected $model = ComentarioAula::class;

    public function definition(): array
    {
        return [
            'public_id' => (string) Str::uuid(),
            'aula_id' => Aula::factory(),
            'usuario_id' => User::factory(),
            'comentario_pai_id' => null,
            'conteudo' => $this->faker->paragraph(),
            'foi_editado' => false,
        ];
    }
}
