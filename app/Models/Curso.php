<?php

namespace App\Models;

use App\Concerns\HasPublicId;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Curso extends Model
{
    use HasFactory;
    use HasPublicId;

    protected $table = 'cursos';

    protected $fillable = [
        'public_id',
        'titulo',
        'descricao',
        'url_capa',
        'youtube_playlist_id',
        'youtube_channel_title',
        'synced_at',
    ];

    protected function casts(): array
    {
        return [
            'synced_at' => 'datetime',
        ];
    }

    public function modulos(): HasMany
    {
        return $this->hasMany(Modulo::class)->orderBy('ordem');
    }

    public function aulas(): HasManyThrough
    {
        return $this->hasManyThrough(Aula::class, Modulo::class);
    }
}
