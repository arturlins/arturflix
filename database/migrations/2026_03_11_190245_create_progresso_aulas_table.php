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
        Schema::create('progressos_aulas', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->uuid('public_id')->unique();
            $table
                ->foreignId('usuario_id')
                ->constrained('usuarios')
                ->cascadeOnDelete();
            $table
                ->foreignId('aula_id')
                ->constrained('aulas')
                ->cascadeOnDelete();
            $table->timestamp('concluido_em');
            $table->timestamps();
            $table->unique(['usuario_id', 'aula_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('progresso_aulas');
    }
};
