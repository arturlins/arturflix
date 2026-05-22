<?php

namespace Database\Factories;

use App\Models\Aula;
use App\Models\ProgressoAula;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<ProgressoAula>
 */
class ProgressoAulaFactory extends Factory
{
    protected $model = ProgressoAula::class;

    public function definition(): array
    {
        return [
            'public_id' => (string) Str::uuid(),
            'usuario_id' => User::factory(),
            'aula_id' => Aula::factory(),
            'posicao_segundos' => 0,
            'concluido_em' => null,
            'ultima_visualizacao_em' => now(),
        ];
    }

    public function concluida(): static
    {
        return $this->state(fn () => ['concluido_em' => now()]);
    }

    public function emAndamento(int $segundos = 30): static
    {
        return $this->state(fn () => [
            'posicao_segundos' => $segundos,
            'concluido_em' => null,
        ]);
    }
}
