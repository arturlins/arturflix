<?php

namespace Database\Seeders;

use App\Enums\PapelEnum;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $email = config('app.admin_seed_email', 'admin@arturflix.local');
        $password = config('app.admin_seed_password', 'change-me-on-first-login');

        User::query()->updateOrCreate(
            ['email' => $email],
            [
                'nome_completo' => 'Superuser ArturFlix',
                'name' => 'Superuser',
                'password' => Hash::make($password),
                'papel' => PapelEnum::SUPERUSER,
                'is_staff' => true,
                'is_superuser' => true,
                'aceitou_termos' => true,
            ],
        );
    }
}
