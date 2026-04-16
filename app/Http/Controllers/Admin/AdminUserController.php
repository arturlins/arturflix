<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Admin\CreateUserByAdmin;
use App\Actions\Admin\UpdateUserByAdmin;
use App\Enums\PapelEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Models\User;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminUserController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request): Response
    {
        $query = User::query()
            ->latest('id');

        if ($search = $request->query('q')) {
            $query->where(function ($q) use ($search): void {
                $q->whereRaw('LOWER(nome_completo) LIKE ?', ['%'.strtolower($search).'%'])
                    ->orWhereRaw('LOWER(email) LIKE ?', ['%'.strtolower($search).'%']);
            });
        }

        if ($papel = $request->query('papel')) {
            $query->where('papel', $papel);
        }

        $paginator = $query->paginate(20)->withQueryString();

        $meta = [
            'from' => $paginator->firstItem(),
            'to' => $paginator->lastItem(),
            'total' => $paginator->total(),
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'prev_page_url' => $paginator->previousPageUrl(),
            'next_page_url' => $paginator->nextPageUrl(),
        ];

        $usuarios = $paginator->getCollection()->map(fn (User $u) => [
            'public_id' => $u->public_id,
            'nome_completo' => $u->nome_completo,
            'email' => $u->email,
            'papel' => $u->papel->value,
            'ultimo_login' => $u->ultimo_login?->toIso8601String(),
            'created_at' => $u->created_at?->toIso8601String(),
        ]);

        return Inertia::render('Admin/Usuarios/Index', [
            'usuarios' => $usuarios,
            'meta' => $meta,
            'filters' => [
                'q' => $request->query('q', ''),
                'papel' => $request->query('papel', ''),
            ],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', User::class);

        return Inertia::render('Admin/Usuarios/Create', [
            'papeis_permitidos' => $this->papeisPara($this->actor()),
        ]);
    }

    public function store(StoreUserRequest $request, CreateUserByAdmin $action): RedirectResponse
    {
        $usuario = $action->handle($request->validated());

        return redirect()
            ->route('admin.usuarios.index')
            ->with('success', "Usuário \"{$usuario->nome_completo}\" criado.");
    }

    public function edit(User $user): Response
    {
        $this->authorize('update', $user);

        return Inertia::render('Admin/Usuarios/Edit', [
            'usuario' => [
                'public_id' => $user->public_id,
                'nome_completo' => $user->nome_completo,
                'email' => $user->email,
                'papel' => $user->papel->value,
            ],
            'papeis_permitidos' => $this->papeisPara($this->actor()),
        ]);
    }

    public function update(UpdateUserRequest $request, User $user, UpdateUserByAdmin $action): RedirectResponse
    {
        $action->handle($user, $request->validated());

        return back()->with('success', 'Usuário atualizado.');
    }

    public function destroy(User $user): RedirectResponse
    {
        $this->authorize('delete', $user);
        $user->delete();

        return redirect()
            ->route('admin.usuarios.index')
            ->with('success', 'Usuário excluído.');
    }

    /** @return list<string> */
    private function papeisPara(User $actor): array
    {
        $papeis = [PapelEnum::ALUNO->value];

        if ($actor->papel === PapelEnum::SUPERUSER) {
            $papeis[] = PapelEnum::ADMIN->value;
            $papeis[] = PapelEnum::SUPERUSER->value;
        }

        return $papeis;
    }

    private function actor(): User
    {
        /** @var User $user */
        $user = request()->user();

        return $user;
    }
}
