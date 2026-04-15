<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cursos', function (Blueprint $table): void {
            $table->string('youtube_playlist_id', 64)->nullable()->unique()->after('url_capa');
            $table->string('youtube_channel_title', 255)->nullable()->after('youtube_playlist_id');
            $table->timestamp('synced_at')->nullable()->after('youtube_channel_title');
        });

        Schema::table('aulas', function (Blueprint $table): void {
            $table->string('youtube_video_id', 32)->nullable()->after('url_video');
            $table->index('youtube_video_id');
        });
    }

    public function down(): void
    {
        Schema::table('aulas', function (Blueprint $table): void {
            $table->dropIndex(['youtube_video_id']);
            $table->dropColumn('youtube_video_id');
        });

        Schema::table('cursos', function (Blueprint $table): void {
            $table->dropColumn(['youtube_playlist_id', 'youtube_channel_title', 'synced_at']);
        });
    }
};
