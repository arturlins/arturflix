<?php

use App\Services\YouTube\PlaylistData;
use App\Services\YouTube\VideoData;

it('calculates total duration from videos', function (): void {
    $playlist = new PlaylistData(
        playlistId: 'PL1',
        title: 'Test',
        description: 'desc',
        thumbnailUrl: 'https://img',
        channelTitle: 'Canal',
        videos: [
            new VideoData('v1', 'Aula 1', 120),
            new VideoData('v2', 'Aula 2', 300),
            new VideoData('v3', 'Aula 3', 60),
        ],
    );

    expect($playlist->totalDurationSeconds())->toBe(480);
    expect($playlist->videoCount())->toBe(3);
});

it('handles empty playlist', function (): void {
    $playlist = new PlaylistData('PL2', 'x', null, null, 'Canal', []);

    expect($playlist->totalDurationSeconds())->toBe(0);
    expect($playlist->videoCount())->toBe(0);
});
