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
        Schema::create('avaliacoes_aulas', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table
                ->foreignId('aula_id')
                ->constrained('aulas')
                ->cascadeOnDelete();
            $table
                ->foreignId('usuario_id')
                ->constrained('usuarios')
                ->cascadeOnDelete();
            $table->integer('nota'); // 1-5
            $table->text('comentario_feedback')->nullable();
            $table->timestamps();
            $table->unique(['aula_id', 'usuario_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('avaliacao_aulas');
    }
};
