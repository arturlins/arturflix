<?php

namespace Database\Seeders;

use App\Enums\PapelEnum;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Aluno Teste',
            'email' => 'aluno@example.com',
            'papel' => PapelEnum::ALUNO,
        ]);

        User::factory()->create([
            'name' => 'Admin Teste',
            'email' => 'admin@example.com',
            'papel' => PapelEnum::ADMIN,
        ]);

        $this->call(CursoSeeder::class);
        $this->call(AdminUserSeeder::class);
    }
}
