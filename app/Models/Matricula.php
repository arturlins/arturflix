<?php

namespace App\Models;

use App\Concerns\HasPublicId;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Matricula extends Model
{
    use HasPublicId;

    protected $table = 'matriculas';

    protected $fillable = [
        'usuario_id',
        'curso_id',
        'matriculado_em',
        'concluido_em',
    ];

    protected function casts(): array
    {
        return [
            'matriculado_em' => 'datetime',
            'concluido_em' => 'datetime',
        ];
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function curso(): BelongsTo
    {
        return $this->belongsTo(Curso::class);
    }
}
