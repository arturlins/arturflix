<?php

namespace App\Http\Requests\Comentarios;

use App\Models\ComentarioAula;
use Closure;
use Illuminate\Foundation\Http\FormRequest;

class StoreComentarioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $aulaId = $this->route('aula')->id;

        return [
            'conteudo' => ['required', 'string', 'max:2000'],
            'comentario_pai_id' => [
                'nullable',
                'uuid',
                function (string $attribute, mixed $value, Closure $fail) use ($aulaId): void {
                    $pai = ComentarioAula::query()->where('public_id', $value)->first();
                    if ($pai === null || $pai->aula_id !== $aulaId) {
                        $fail('Comentario pai invalido.');

                        return;
                    }
                    if ($pai->comentario_pai_id !== null) {
                        $fail('Nao eh possivel responder a uma resposta.');
                    }
                },
            ],
        ];
    }
}
