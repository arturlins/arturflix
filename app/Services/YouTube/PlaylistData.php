<?php

namespace App\Services\YouTube;

final readonly class PlaylistData
{
    /**
     * @param  array<int, VideoData>  $videos
     */
    public function __construct(
        public string $playlistId,
        public string $title,
        public ?string $description,
        public ?string $thumbnailUrl,
        public string $channelTitle,
        public array $videos,
    ) {}

    public function totalDurationSeconds(): int
    {
        return array_sum(array_map(fn (VideoData $v) => $v->durationSeconds, $this->videos));
    }

    public function videoCount(): int
    {
        return count($this->videos);
    }
}
