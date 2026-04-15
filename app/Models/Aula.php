<?php

namespace App\Models;

use App\Concerns\HasPublicId;
use App\Enums\TipoAulaEnum;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Aula extends Model
{
    use HasFactory;
    use HasPublicId;

    protected $table = 'aulas';

    protected $fillable = [
        'public_id',
        'modulo_id',
        'titulo',
        'tipo_aula',
        'conteudo',
        'url_video',
        'duracao_segundos',
        'ordem',
    ];

    protected function casts(): array
    {
        return [
            'tipo_aula' => TipoAulaEnum::class,
            'duracao_segundos' => 'integer',
            'ordem' => 'integer',
        ];
    }

    public function modulo(): BelongsTo
    {
        return $this->belongsTo(Modulo::class);
    }
}
