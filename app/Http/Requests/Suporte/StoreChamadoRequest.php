<?php

namespace App\Http\Requests\Suporte;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreChamadoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:2', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'subject' => ['required', 'string', 'in:tecnico,cobranca,sugestao,outro'],
            'message' => ['required', 'string', 'min:10', 'max:1000'],
            'attachment' => ['nullable', 'image', 'mimes:jpeg,png,gif', 'max:5120'],
        ];
    }
}
