<?php

namespace App\Http\Controllers;

use App\Http\Requests\Suporte\StoreChamadoRequest;
use App\Models\ChamadoSuporte;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;

class SuporteController extends Controller
{
    public function store(StoreChamadoRequest $request): RedirectResponse
    {
        $data = $request->validated();

        ChamadoSuporte::create([
            'usuario_id' => $request->user()?->id,
            'email_contato' => $data['email'],
            'assunto' => ucfirst($data['subject']).': '.Str::limit($data['message'], 60),
            'mensagem' => $data['message'],
        ]);

        return back()->with('success', 'Mensagem enviada.');
    }
}
