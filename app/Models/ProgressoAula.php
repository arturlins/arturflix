<?php

namespace App\Models;

use App\Concerns\HasPublicId;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProgressoAula extends Model
{
    use HasFactory;
    use HasPublicId;

    protected $table = 'progressos_aulas';

    protected $fillable = [
        'public_id',
        'usuario_id',
        'aula_id',
        'posicao_segundos',
        'concluido_em',
        'ultima_visualizacao_em',
    ];

    protected function casts(): array
    {
        return [
            'posicao_segundos' => 'integer',
            'concluido_em' => 'datetime',
            'ultima_visualizacao_em' => 'datetime',
        ];
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function aula(): BelongsTo
    {
        return $this->belongsTo(Aula::class);
    }

    public function scopeConcluida(Builder $query): Builder
    {
        return $query->whereNotNull('concluido_em');
    }

    public function scopeEmAndamento(Builder $query): Builder
    {
        return $query->whereNull('concluido_em')->where('posicao_segundos', '>', 0);
    }
}
