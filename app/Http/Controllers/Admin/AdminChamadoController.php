<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Admin\RespondChamadoSuporte;
use App\Enums\StatusChamadoEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\RespondChamadoRequest;
use App\Models\ChamadoSuporte;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminChamadoController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', ChamadoSuporte::class);

        $query = ChamadoSuporte::query()->with('usuario')->latest('id');

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $paginator = $query->paginate(20)->withQueryString();

        $counts = [
            'novo' => ChamadoSuporte::where('status', StatusChamadoEnum::NOVO)->count(),
            'em_andamento' => ChamadoSuporte::where('status', StatusChamadoEnum::EM_ANDAMENTO)->count(),
            'resolvido' => ChamadoSuporte::where('status', StatusChamadoEnum::RESOLVIDO)->count(),
        ];

        $meta = [
            'from' => $paginator->firstItem(),
            'to' => $paginator->lastItem(),
            'total' => $paginator->total(),
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'prev_page_url' => $paginator->previousPageUrl(),
            'next_page_url' => $paginator->nextPageUrl(),
        ];

        $chamados = $paginator->getCollection()->map(fn (ChamadoSuporte $c) => [
            'public_id' => $c->public_id,
            'assunto' => $c->assunto,
            'email_contato' => $c->email_contato,
            'status' => $c->status->value,
            'usuario' => $c->usuario ? [
                'public_id' => $c->usuario->public_id,
                'nome_completo' => $c->usuario->nome_completo,
                'email' => $c->usuario->email,
            ] : null,
            'created_at' => $c->created_at?->toISOString(),
        ]);

        return Inertia::render('Admin/Suporte/Index', [
            'chamados' => $chamados,
            'meta' => $meta,
            'counts' => $counts,
            'filters' => ['status' => $request->query('status', '')],
        ]);
    }

    public function show(ChamadoSuporte $chamado): Response
    {
        $this->authorize('view', $chamado);

        $chamado->load('usuario');

        return Inertia::render('Admin/Suporte/Show', [
            'chamado' => [
                'public_id' => $chamado->public_id,
                'assunto' => $chamado->assunto,
                'mensagem' => $chamado->mensagem,
                'resposta' => $chamado->resposta,
                'email_contato' => $chamado->email_contato,
                'status' => $chamado->status->value,
                'resolvido_em' => $chamado->resolvido_em?->toISOString(),
                'created_at' => $chamado->created_at?->toISOString(),
                'updated_at' => $chamado->updated_at?->toISOString(),
                'usuario' => $chamado->usuario ? [
                    'public_id' => $chamado->usuario->public_id,
                    'nome_completo' => $chamado->usuario->nome_completo,
                    'email' => $chamado->usuario->email,
                ] : null,
            ],
        ]);
    }

    public function respond(
        RespondChamadoRequest $request,
        ChamadoSuporte $chamado,
        RespondChamadoSuporte $action
    ): RedirectResponse {
        $data = $request->validated();
        $action->handle($chamado, $data['resposta']);

        return back()->with('success', 'Resposta enviada.');
    }

    public function resolve(Request $request, ChamadoSuporte $chamado): RedirectResponse
    {
        $this->authorize('resolve', $chamado);

        $chamado->update([
            'status' => StatusChamadoEnum::RESOLVIDO,
            'resolvido_em' => now(),
        ]);

        return back()->with('success', 'Chamado resolvido.');
    }
}
