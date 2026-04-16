<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * @var array<int, array{table: string, column: string}>
     */
    private array $fks = [
        ['table' => 'matriculas', 'column' => 'usuario_id'],
        ['table' => 'certificados', 'column' => 'usuario_id'],
        ['table' => 'progressos_aulas', 'column' => 'usuario_id'],
        ['table' => 'avaliacoes_aulas', 'column' => 'usuario_id'],
        ['table' => 'comentarios_aulas', 'column' => 'usuario_id'],
        ['table' => 'historico_xp', 'column' => 'usuario_id'],
        ['table' => 'perfis_gamificados', 'column' => 'usuario_id'],
        ['table' => 'chamados_suportes', 'column' => 'usuario_id'],
        ['table' => 'logs_auditoria', 'column' => 'admin_id'],
    ];

    public function up(): void
    {
        foreach ($this->fks as $fk) {
            Schema::table($fk['table'], function (Blueprint $table) use ($fk): void {
                $table->dropForeign([$fk['column']]);
                $table->foreign($fk['column'])
                    ->references('id')
                    ->on('users')
                    ->cascadeOnDelete();
            });
        }

        Schema::dropIfExists('usuarios');
    }

    public function down(): void
    {
        Schema::create('usuarios', function (Blueprint $table): void {
            $table->bigIncrements('id');
            $table->uuid('public_id')->unique();
            $table->string('email')->unique();
            $table->string('senha_hash');
            $table->string('nome_completo');
            $table->boolean('aceitou_termos')->default(false);
            $table->timestamp('ultimo_login')->nullable();
            $table->boolean('is_staff')->default(false);
            $table->boolean('is_superuser')->default(false);
            $table->string('papel')->default('aluno');
            $table->timestamps();
        });

        foreach ($this->fks as $fk) {
            Schema::table($fk['table'], function (Blueprint $table) use ($fk): void {
                $table->dropForeign([$fk['column']]);
                $table->foreign($fk['column'])
                    ->references('id')
                    ->on('usuarios')
                    ->cascadeOnDelete();
            });
        }
    }
};
