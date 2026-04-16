<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ReorderAulasRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('modulo')->curso) ?? false;
    }

    /** @return array<string, array<int|string, string>> */
    public function rules(): array
    {
        return [
            'ordem' => ['required', 'array', 'min:1'],
            'ordem.*' => ['required', 'string', 'uuid', 'exists:aulas,public_id'],
        ];
    }
}
