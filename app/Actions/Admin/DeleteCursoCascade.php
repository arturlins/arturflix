<?php

namespace App\Actions\Admin;

use App\Models\Curso;
use Illuminate\Support\Facades\DB;

class DeleteCursoCascade
{
    public function handle(Curso $curso): void
    {
        DB::transaction(function () use ($curso): void {
            $curso->modulos()->each(function ($modulo): void {
                $modulo->aulas()->delete();
                $modulo->delete();
            });
            $curso->delete();
        });
    }
}
