<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cursos', function (Blueprint $table): void {
            $table->text('url_capa')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('cursos', function (Blueprint $table): void {
            $table->string('url_capa', 255)->nullable()->change();
        });
    }
};
