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
        Schema::create("certificados", function (Blueprint $table) {
            $table->bigIncrements("id");
            $table->uuid("public_id")->unique();
            $table
                ->foreignId("usuario_id")
                ->constrained("usuarios")
                ->cascadeOnDelete();
            $table
                ->foreignId("curso_id")
                ->constrained("cursos")
                ->cascadeOnDelete();
            $table->string("codigo_verificacao", 100)->unique();
            $table->string("url_arquivo", 255)->nullable();
            $table->timestamp("data_emissao");
            $table->integer("carga_horaria_total")->nullable();
            $table->timestamps();
            $table->unique(["usuario_id", "curso_id"]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists("certificados");
    }
};
