<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;

class RegisteredUserController extends Controller
{
    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): Response
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'nome_completo' => ['nullable', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'aceitou_termos' => ['required', 'accepted'],
        ]);

        $user = User::create([
            'name' => $request->name,
            'nome_completo' => $request->nome_completo,
            'email' => $request->email,
            'password' => Hash::make($request->string('password')),
            'aceitou_termos' => true,
        ]);

        event(new Registered($user));

        Auth::login($user);

        return response()->noContent();
    }
}
