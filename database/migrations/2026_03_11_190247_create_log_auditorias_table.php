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
        Schema::create("logs_auditoria", function (Blueprint $table) {
            $table->bigIncrements("id");
            $table
                ->foreignId("admin_id")
                ->nullable()
                ->constrained("usuarios")
                ->nullOnDelete();
            $table->string("acao", 20);
            $table->string("entidade_alvo", 100);
            $table->bigInteger("alvo_id_interno")->nullable();
            $table->uuid("alvo_id_publico")->nullable();
            $table->jsonb("detalhes_antigos")->nullable();
            $table->jsonb("detalhes_novos")->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists("log_auditorias");
    }
};
