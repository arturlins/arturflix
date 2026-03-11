<?php

use App\Enums\PapelEnum;
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
        Schema::table('users', function (Blueprint $table) {
            $table->uuid('public_id')->unique()->after('id');
            $table->string('nome_completo')->nullable()->after('name');
            $table->string('papel')->default(PapelEnum::ALUNO->value)->after('email_verified_at');
            $table->boolean('aceitou_termos')->default(false)->after('papel');
            $table->boolean('is_staff')->default(false)->after('aceitou_termos');
            $table->boolean('is_superuser')->default(false)->after('is_staff');
            $table->timestamp('ultimo_login')->nullable()->after('is_superuser');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'public_id',
                'nome_completo',
                'papel',
                'aceitou_termos',
                'is_staff',
                'is_superuser',
                'ultimo_login',
            ]);
        });
    }
};
