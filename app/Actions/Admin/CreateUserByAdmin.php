<?php

namespace App\Actions\Admin;

use App\Enums\PapelEnum;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class CreateUserByAdmin
{
    /**
     * @param  array{nome_completo: string, name?: string|null, email: string, password: string, papel: string}  $data
     */
    public function handle(array $data): User
    {
        $papel = PapelEnum::from($data['papel']);

        return User::create([
            'nome_completo' => $data['nome_completo'],
            'name' => $data['name'] ?? $data['nome_completo'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'papel' => $papel,
            'is_staff' => in_array($papel, [PapelEnum::ADMIN, PapelEnum::SUPERUSER], true),
            'is_superuser' => $papel === PapelEnum::SUPERUSER,
            'aceitou_termos' => true,
        ]);
    }
}
