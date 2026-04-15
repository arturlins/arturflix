<?php

namespace App\Models;

use App\Concerns\HasPublicId;
use App\Enums\PapelEnum;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasPublicId, Notifiable;

    protected $fillable = [
        'name',
        'nome_completo',
        'email',
        'password',
        'papel',
        'aceitou_termos',
        'is_staff',
        'is_superuser',
        'ultimo_login',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'ultimo_login' => 'datetime',
            'password' => 'hashed',
            'aceitou_termos' => 'boolean',
            'is_staff' => 'boolean',
            'is_superuser' => 'boolean',
            'papel' => PapelEnum::class,
        ];
    }

    public function isAdmin(): bool
    {
        return in_array($this->papel, [PapelEnum::ADMIN, PapelEnum::SUPERUSER], true);
    }
}
