<?php

namespace App\Http\Requests\Admin;

use App\Models\ChamadoSuporte;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class RespondChamadoRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var ChamadoSuporte $chamado */
        $chamado = $this->route('chamado');

        return $this->user()->can('respond', $chamado);
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'resposta' => ['required', 'string', 'min:5', 'max:5000'],
        ];
    }
}
