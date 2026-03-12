<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create("usuarios", function (Blueprint $table) {
            $table->bigIncrements("id"); // bigserial
            $table->uuid("public_id")->unique();
            $table->string("email", 200)->unique();
            $table->string("senha_hash", 255);
            $table->string("nome_completo", 300);
            $table->boolean("aceitou_termos")->default(false);
            $table->timestamp("ultimo_login")->nullable();
            $table->boolean("is_staff")->default(false);
            $table->boolean("is_superuser")->default(false);
            $table
                ->enum("papel", ["aluno", "admin", "superuser"])
                ->default("aluno");
            $table->timestamps(); // criado_em, atualizado_em

            $table->index(["is_staff", "is_superuser"]);
        });
    }

    public function down()
    {
        Schema::dropIfExists("usuarios");
    }
};
