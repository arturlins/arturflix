<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PerfilGamificado extends Model
{
    use HasFactory;

    protected $table = 'perfis_gamificados';

    protected $fillable = [
        'usuario_id',
        'xp_total',
        'nivel_atual',
        'streak_dias',
        'ultima_atividade',
    ];

    protected function casts(): array
    {
        return [
            'xp_total' => 'integer',
            'nivel_atual' => 'integer',
            'streak_dias' => 'integer',
            'ultima_atividade' => 'date',
        ];
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}
