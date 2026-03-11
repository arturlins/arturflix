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
        Schema::create("historico_xp", function (Blueprint $table) {
            $table->bigIncrements("id");
            $table
                ->foreignId("usuario_id")
                ->constrained("usuarios")
                ->cascadeOnDelete();
            $table->integer("quantidade");
            $table->string("motivo", 100);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists("historico_x_p_s");
    }
};
