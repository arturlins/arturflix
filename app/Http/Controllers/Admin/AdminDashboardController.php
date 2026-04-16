<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ChamadoSuporte;
use App\Models\Curso;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'total_cursos' => Curso::query()->count(),
                'total_usuarios' => User::query()->count(),
                'chamados_abertos' => ChamadoSuporte::whereIn('status', ['novo', 'em_andamento'])->count(),
            ],
        ]);
    }
}
