<?php

namespace App\Models;

use App\Concerns\HasPublicId;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ComentarioAula extends Model
{
    use HasFactory;
    use HasPublicId;

    protected $table = 'comentarios_aulas';

    protected $fillable = [
        'public_id',
        'aula_id',
        'usuario_id',
        'comentario_pai_id',
        'conteudo',
        'foi_editado',
    ];

    protected function casts(): array
    {
        return [
            'foi_editado' => 'boolean',
        ];
    }

    public function aula(): BelongsTo
    {
        return $this->belongsTo(Aula::class);
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function pai(): BelongsTo
    {
        return $this->belongsTo(ComentarioAula::class, 'comentario_pai_id');
    }

    public function respostas(): HasMany
    {
        return $this->hasMany(ComentarioAula::class, 'comentario_pai_id')->orderBy('created_at');
    }
}
