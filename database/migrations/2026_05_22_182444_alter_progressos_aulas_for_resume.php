<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('progressos_aulas', function (Blueprint $table): void {
            $table->timestamp('concluido_em')->nullable()->change();
            $table->unsignedInteger('posicao_segundos')->default(0)->after('aula_id');
            $table->timestamp('ultima_visualizacao_em')->nullable()->after('posicao_segundos');
            $table->index(['usuario_id', 'ultima_visualizacao_em'], 'progressos_user_recent_idx');
        });
    }

    public function down(): void
    {
        Schema::table('progressos_aulas', function (Blueprint $table): void {
            $table->dropIndex('progressos_user_recent_idx');
            $table->dropColumn(['posicao_segundos', 'ultima_visualizacao_em']);
            $table->timestamp('concluido_em')->nullable(false)->change();
        });
    }
};
