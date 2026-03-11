<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Enums\PapelEnum;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
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

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
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

    protected static function boot(): void
    {
        parent::boot();
        static::creating(function (User $user): void {
            $user->public_id = (string) Str::uuid();
        });
    }
}
