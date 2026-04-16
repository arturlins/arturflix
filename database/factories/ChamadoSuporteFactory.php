<?php

namespace Database\Factories;

use App\Enums\StatusChamadoEnum;
use App\Models\ChamadoSuporte;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ChamadoSuporte>
 */
class ChamadoSuporteFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'email_contato' => fake()->safeEmail(),
            'assunto' => fake()->sentence(4),
            'mensagem' => fake()->paragraph(),
            'status' => StatusChamadoEnum::NOVO,
        ];
    }

    public function emAndamento(): static
    {
        return $this->state(['status' => StatusChamadoEnum::EM_ANDAMENTO]);
    }

    public function resolvido(): static
    {
        return $this->state([
            'status' => StatusChamadoEnum::RESOLVIDO,
            'resolvido_em' => now(),
        ]);
    }
}
