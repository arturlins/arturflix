<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create("comentarios_aulas", function (Blueprint $table) {
            $table->bigIncrements("id");
            $table->uuid("public_id")->unique();
            $table
                ->foreignId("aula_id")
                ->constrained("aulas")
                ->cascadeOnDelete();
            $table
                ->foreignId("usuario_id")
                ->constrained("usuarios")
                ->cascadeOnDelete();
            $table
                ->foreignId("comentario_pai_id")
                ->nullable()
                ->constrained("comentarios_aulas")
                ->cascadeOnDelete();
            $table->text("conteudo");
            $table->boolean("foi_editado")->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists("comentario_aulas");
    }
};
