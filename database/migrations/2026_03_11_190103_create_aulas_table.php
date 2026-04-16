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
        Schema::create('aulas', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->uuid('public_id')->unique();
            $table
                ->foreignId('modulo_id')
                ->constrained('modulos')
                ->cascadeOnDelete();
            $table->string('titulo', 255);
            $table->enum('tipo_aula', ['video', 'texto', 'quiz']);
            $table->text('conteudo')->nullable();
            $table->string('url_video', 255)->nullable();
            $table->integer('duracao_segundos')->nullable();
            $table->integer('ordem');
            $table->timestamps();
            $table->unique(['modulo_id', 'ordem']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('aulas');
    }
};
