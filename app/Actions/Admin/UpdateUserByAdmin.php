<?php

namespace App\Actions\Admin;

use App\Enums\PapelEnum;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UpdateUserByAdmin
{
    /**
     * @param  array{nome_completo: string, name?: string|null, email: string, password?: string|null, papel: string}  $data
     */
    public function handle(User $user, array $data): User
    {
        $papel = PapelEnum::from($data['papel']);

        $fields = [
            'nome_completo' => $data['nome_completo'],
            'name' => $data['name'] ?? $data['nome_completo'],
            'email' => $data['email'],
            'papel' => $papel,
            'is_staff' => in_array($papel, [PapelEnum::ADMIN, PapelEnum::SUPERUSER], true),
            'is_superuser' => $papel === PapelEnum::SUPERUSER,
        ];

        if (! empty($data['password'])) {
            $fields['password'] = Hash::make($data['password']);
        }

        $user->update($fields);

        return $user->fresh();
    }
}
