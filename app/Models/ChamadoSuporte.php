<?php

namespace App\Models;

use App\Concerns\HasPublicId;
use App\Enums\StatusChamadoEnum;
use Database\Factories\ChamadoSuporteFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChamadoSuporte extends Model
{
    /** @use HasFactory<ChamadoSuporteFactory> */
    use HasFactory, HasPublicId;

    protected $table = 'chamados_suportes';

    /** @var array<string, mixed> */
    protected $attributes = [
        'status' => 'novo',
    ];

    protected $fillable = [
        'public_id',
        'usuario_id',
        'email_contato',
        'assunto',
        'mensagem',
        'anexo_path',
        'resposta',
        'status',
        'resolvido_em',
    ];

    protected function casts(): array
    {
        return [
            'status' => StatusChamadoEnum::class,
            'resolvido_em' => 'datetime',
        ];
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}
