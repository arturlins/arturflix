<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('matriculas', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->uuid('public_id')->unique();
            $table
                ->foreignId('usuario_id')
                ->constrained('usuarios')
                ->cascadeOnDelete();
            $table
                ->foreignId('curso_id')
                ->constrained('cursos')
                ->cascadeOnDelete();
            $table->timestamp('matriculado_em');
            $table->timestamp('concluido_em')->nullable();
            $table->timestamps();
            $table->unique(['usuario_id', 'curso_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('matriculas');
    }
};
