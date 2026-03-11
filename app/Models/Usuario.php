<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Usuario extends Model
{
    protected $table = "usuarios";
    protected $fillable = [
        "public_id",
        "email",
        "senha_hash",
        "nome_completo",
        "aceitou_termos",
        "ultimo_login",
        "is_staff",
        "is_superuser",
        "papel",
    ];

    protected $casts = [
        "ultimo_login" => "datetime",
        "aceitou_termos" => "boolean",
        "is_staff" => "boolean",
        "is_superuser" => "boolean",
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($usuario) {
            $usuario->public_id = (string) Str::uuid();
        });
    }
}
