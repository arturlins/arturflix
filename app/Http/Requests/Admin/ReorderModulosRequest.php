<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ReorderModulosRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('curso')) ?? false;
    }

    /** @return array<string, array<int|string, string>> */
    public function rules(): array
    {
        return [
            'ordem' => ['required', 'array', 'min:1'],
            'ordem.*' => ['required', 'string', 'uuid', 'exists:modulos,public_id'],
        ];
    }
}
