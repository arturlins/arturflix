<?php

use App\Http\Controllers\Admin\AdminAulaController;
use App\Http\Controllers\Admin\AdminChamadoController;
use App\Http\Controllers\Admin\AdminCursoController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminModuloController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\ConfirmablePasswordController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\VerifyEmailController;
use App\Http\Controllers\CursoController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Rotas públicas
Route::get('/', fn () => Inertia::render('Welcome'))->name('home');
Route::get('/cursos', [CursoController::class, 'index'])->name('cursos.index');
Route::get('/cursos/{curso:public_id}', [CursoController::class, 'show'])->name('cursos.show');
Route::get('/suporte', fn () => Inertia::render('Suporte/Index'))->name('suporte.index');

// Autenticação — apenas guests
Route::middleware('guest')->group(function (): void {
    Route::get('/register', [RegisteredUserController::class, 'create'])->name('register');
    Route::post('/register', [RegisteredUserController::class, 'store']);

    Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('/login', [AuthenticatedSessionController::class, 'store']);

    Route::get('/forgot-password', [PasswordResetLinkController::class, 'create'])->name('password.request');
    Route::post('/forgot-password', [PasswordResetLinkController::class, 'store'])->name('password.email');

    Route::get('/reset-password/{token}', [NewPasswordController::class, 'create'])->name('password.reset');
    Route::post('/reset-password', [NewPasswordController::class, 'store'])->name('password.store');
});

// Autenticação — apenas autenticados
Route::middleware('auth')->group(function (): void {
    Route::get('/verify-email', fn () => Inertia::render('Auth/VerifyEmail'))->name('verification.notice');

    Route::get('/verify-email/{id}/{hash}', VerifyEmailController::class)
        ->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verify');

    Route::post('/email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
        ->middleware('throttle:6,1')
        ->name('verification.send');

    Route::get('/confirm-password', [ConfirmablePasswordController::class, 'show'])->name('password.confirm');
    Route::post('/confirm-password', [ConfirmablePasswordController::class, 'store']);

    Route::put('/password', [PasswordController::class, 'update'])->name('password.update');

    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');

    Route::get('/dashboard', DashboardController::class)->name('dashboard');

    Route::post('/cursos/{curso:public_id}/matricular', [CursoController::class, 'matricular'])->name('cursos.matricular');
});

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function (): void {
    Route::get('/', AdminDashboardController::class)->name('dashboard');

    // Cursos
    Route::get('/cursos', [AdminCursoController::class, 'index'])->name('cursos.index');
    Route::get('/cursos/criar', [AdminCursoController::class, 'create'])->name('cursos.create');
    Route::post('/cursos', [AdminCursoController::class, 'store'])->name('cursos.store');
    Route::get('/cursos/importar', [AdminCursoController::class, 'importForm'])->name('cursos.import.form');
    Route::post('/cursos/importar', [AdminCursoController::class, 'import'])->name('cursos.import');
    Route::get('/cursos/{curso:public_id}', [AdminCursoController::class, 'edit'])->name('cursos.edit');
    Route::put('/cursos/{curso:public_id}', [AdminCursoController::class, 'update'])->name('cursos.update');
    Route::delete('/cursos/{curso:public_id}', [AdminCursoController::class, 'destroy'])->name('cursos.destroy');

    // Módulos (escopo: curso)
    Route::post('/cursos/{curso:public_id}/modulos', [AdminModuloController::class, 'store'])->name('modulos.store');
    Route::put('/cursos/{curso:public_id}/modulos/reordenar', [AdminModuloController::class, 'reorder'])->name('modulos.reorder');
    Route::get('/modulos/{modulo:public_id}', [AdminModuloController::class, 'edit'])->name('modulos.edit');
    Route::put('/modulos/{modulo:public_id}', [AdminModuloController::class, 'update'])->name('modulos.update');
    Route::delete('/modulos/{modulo:public_id}', [AdminModuloController::class, 'destroy'])->name('modulos.destroy');

    // Aulas (escopo: módulo)
    Route::post('/modulos/{modulo:public_id}/aulas', [AdminAulaController::class, 'store'])->name('aulas.store');
    Route::put('/modulos/{modulo:public_id}/aulas/reordenar', [AdminAulaController::class, 'reorder'])->name('aulas.reorder');
    Route::get('/aulas/{aula:public_id}', [AdminAulaController::class, 'edit'])->name('aulas.edit');
    Route::put('/aulas/{aula:public_id}', [AdminAulaController::class, 'update'])->name('aulas.update');
    Route::delete('/aulas/{aula:public_id}', [AdminAulaController::class, 'destroy'])->name('aulas.destroy');

    // Usuários
    Route::get('/usuarios', [AdminUserController::class, 'index'])->name('usuarios.index');
    Route::get('/usuarios/criar', [AdminUserController::class, 'create'])->name('usuarios.create');
    Route::post('/usuarios', [AdminUserController::class, 'store'])->name('usuarios.store');
    Route::get('/usuarios/{user:public_id}', [AdminUserController::class, 'edit'])->name('usuarios.edit');
    Route::put('/usuarios/{user:public_id}', [AdminUserController::class, 'update'])->name('usuarios.update');
    Route::delete('/usuarios/{user:public_id}', [AdminUserController::class, 'destroy'])->name('usuarios.destroy');

    // Chamados de suporte
    Route::get('/suporte', [AdminChamadoController::class, 'index'])->name('suporte.index');
    Route::get('/suporte/{chamado:public_id}', [AdminChamadoController::class, 'show'])->name('suporte.show');
    Route::post('/suporte/{chamado:public_id}/responder', [AdminChamadoController::class, 'respond'])->name('suporte.respond');
    Route::post('/suporte/{chamado:public_id}/resolver', [AdminChamadoController::class, 'resolve'])->name('suporte.resolve');
});
