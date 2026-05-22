<?php

namespace App\Http\Requests\Comentarios;

use Illuminate\Foundation\Http\FormRequest;

class UpdateComentarioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('comentario')) ?? false;
    }

    public function rules(): array
    {
        return [
            'conteudo' => ['required', 'string', 'max:2000'],
        ];
    }
}
