<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ImportPlaylistRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'playlist_input' => ['required', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'playlist_input.required' => 'Informe a URL ou ID da playlist.',
        ];
    }

    public function extractedPlaylistId(): ?string
    {
        $input = trim((string) $this->validated('playlist_input'));

        if (preg_match('/[?&]list=([A-Za-z0-9_-]+)/', $input, $m)) {
            return $m[1];
        }

        if (preg_match('/^(PL|UU|FL|RD|LL|OL)[A-Za-z0-9_-]+$/', $input)) {
            return $input;
        }

        return null;
    }
}
