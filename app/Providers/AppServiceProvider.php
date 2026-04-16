<?php

namespace App\Providers;

use App\Models\ChamadoSuporte;
use App\Models\Curso;
use App\Models\User;
use App\Policies\ChamadoSuportePolicy;
use App\Policies\CursoPolicy;
use App\Policies\UserPolicy;
use App\Services\YouTube\YouTubePlaylistService;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(YouTubePlaylistService::class, fn () => YouTubePlaylistService::make());
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        Gate::policy(User::class, UserPolicy::class);
        Gate::policy(Curso::class, CursoPolicy::class);
        Gate::policy(ChamadoSuporte::class, ChamadoSuportePolicy::class);
    }
}
