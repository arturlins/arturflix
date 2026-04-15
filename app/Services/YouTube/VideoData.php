<?php

namespace App\Services\YouTube;

final readonly class VideoData
{
    public function __construct(
        public string $videoId,
        public string $title,
        public int $durationSeconds,
    ) {}

    public function youtubeUrl(): string
    {
        return "https://www.youtube.com/watch?v={$this->videoId}";
    }
}
