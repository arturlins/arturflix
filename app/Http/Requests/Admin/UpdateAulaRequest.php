<?php

namespace App\Http\Requests\Admin;

use App\Enums\TipoAulaEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAulaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('aula')->modulo->curso) ?? false;
    }

    /** @return array<string, array<int|string, mixed>> */
    public function rules(): array
    {
        return [
            'titulo' => ['required', 'string', 'max:255'],
            'tipo_aula' => ['required', Rule::enum(TipoAulaEnum::class)],
            'url_video' => ['nullable', 'url', 'max:2000', 'required_if:tipo_aula,video'],
            'youtube_video_id' => ['nullable', 'string', 'max:32'],
            'conteudo' => ['nullable', 'string', 'max:50000', 'required_if:tipo_aula,texto'],
            'duracao_segundos' => ['nullable', 'integer', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'titulo.required' => 'O título é obrigatório.',
            'tipo_aula.required' => 'O tipo de aula é obrigatório.',
            'url_video.required_if' => 'A URL do vídeo é obrigatória para aulas do tipo vídeo.',
            'conteudo.required_if' => 'O conteúdo é obrigatório para aulas do tipo texto.',
        ];
    }
}
