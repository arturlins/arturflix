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
        Schema::create("perfis_gamificados", function (Blueprint $table) {
            $table->bigIncrements("id");
            $table
                ->foreignId("usuario_id")
                ->unique()
                ->constrained("usuarios")
                ->cascadeOnDelete();
            $table->bigInteger("xp_total")->default(0);
            $table->integer("nivel_atual")->default(1);
            $table->integer("streak_dias")->default(0);
            $table->date("ultima_atividade")->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists("perfil_gamificados");
    }
};
