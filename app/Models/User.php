<?php

namespace App\Models;

use App\Concerns\HasPublicId;
use App\Enums\PapelEnum;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
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

    public function matriculas(): HasMany
    {
        return $this->hasMany(Matricula::class, 'usuario_id');
    }

    public function progressos(): HasMany
    {
        return $this->hasMany(ProgressoAula::class, 'usuario_id');
    }

    public function historicoXp(): HasMany
    {
        return $this->hasMany(HistoricoXP::class, 'usuario_id');
    }

    public function perfilGamificado(): HasOne
    {
        return $this->hasOne(PerfilGamificado::class, 'usuario_id');
    }

    public function comentarios(): HasMany
    {
        return $this->hasMany(ComentarioAula::class, 'usuario_id');
    }
}
