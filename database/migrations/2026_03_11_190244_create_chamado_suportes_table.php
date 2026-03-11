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
        Schema::create("chamados_suportes", function (Blueprint $table) {
            $table->bigIncrements("id");
            $table->uuid("public_id")->unique();
            $table
                ->foreignId("usuario_id")
                ->nullable()
                ->constrained("usuarios")
                ->nullOnDelete();
            $table->string("email_contato", 255);
            $table->string("assunto", 255);
            $table->text("mensagem");
            $table->text("resposta")->nullable();
            $table
                ->enum("status", ["novo", "em_andamento", "resolvido"])
                ->default("novo");
            $table->timestamp("resolvido_em")->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists("chamado_suportes");
    }
};
