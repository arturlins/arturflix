<?php

namespace App\Services\YouTube;

use Google\Client as GoogleClient;
use Google\Service\Exception as GoogleServiceException;
use Google\Service\YouTube as YouTubeService;

class YouTubePlaylistService
{
    public function __construct(private readonly YouTubeService $youtube) {}

    public static function make(): self
    {
        $client = new GoogleClient;
        $client->setApplicationName((string) config('youtube.application_name'));
        $client->setDeveloperKey((string) config('youtube.api_key'));

        return new self(new YouTubeService($client));
    }

    public function fetch(string $playlistId): PlaylistData
    {
        if (empty(config('youtube.api_key'))) {
            throw new YouTubeApiException('YOUTUBE_API_KEY não configurada.');
        }

        try {
            $playlistInfo = $this->fetchPlaylistMeta($playlistId);
            $videos = $this->fetchAllPlaylistVideos($playlistId);
        } catch (GoogleServiceException $e) {
            throw new YouTubeApiException(
                'Erro ao consultar a YouTube API: '.$e->getMessage(),
                previous: $e,
            );
        }

        return new PlaylistData(
            playlistId: $playlistId,
            title: $playlistInfo['title'],
            description: $playlistInfo['description'],
            thumbnailUrl: $playlistInfo['thumbnail'],
            channelTitle: $playlistInfo['channelTitle'],
            videos: $videos,
        );
    }

    /**
     * @return array{title: string, description: ?string, thumbnail: ?string, channelTitle: string}
     */
    private function fetchPlaylistMeta(string $playlistId): array
    {
        $response = $this->youtube->playlists->listPlaylists('snippet', [
            'id' => $playlistId,
            'maxResults' => 1,
        ]);

        $items = $response->getItems();

        if (empty($items)) {
            throw new YouTubeApiException("Playlist {$playlistId} não encontrada.");
        }

        $snippet = $items[0]->getSnippet();
        $thumbnails = $snippet->getThumbnails();

        return [
            'title' => $snippet->getTitle(),
            'description' => $snippet->getDescription() ?: null,
            'thumbnail' => $thumbnails?->getHigh()?->getUrl()
                ?? $thumbnails?->getDefault()?->getUrl(),
            'channelTitle' => $snippet->getChannelTitle(),
        ];
    }

    /**
     * @return array<int, VideoData>
     */
    private function fetchAllPlaylistVideos(string $playlistId): array
    {
        $perPage = (int) config('youtube.playlist_items_per_page', 50);
        $videoIds = [];
        $titlesById = [];
        $pageToken = null;

        do {
            $response = $this->youtube->playlistItems->listPlaylistItems('snippet', [
                'playlistId' => $playlistId,
                'maxResults' => $perPage,
                'pageToken' => $pageToken,
            ]);

            foreach ($response->getItems() as $item) {
                $snippet = $item->getSnippet();
                $videoId = $snippet->getResourceId()->getVideoId();
                $videoIds[] = $videoId;
                $titlesById[$videoId] = $snippet->getTitle();
            }

            $pageToken = $response->getNextPageToken();
        } while ($pageToken);

        if (empty($videoIds)) {
            return [];
        }

        $durationsById = $this->fetchDurations($videoIds);

        $out = [];
        foreach ($videoIds as $id) {
            $out[] = new VideoData(
                videoId: $id,
                title: $titlesById[$id] ?? '(sem título)',
                durationSeconds: $durationsById[$id] ?? 0,
            );
        }

        return $out;
    }

    /**
     * @param  array<int, string>  $videoIds
     * @return array<string, int>
     */
    private function fetchDurations(array $videoIds): array
    {
        $durations = [];

        foreach (array_chunk($videoIds, 50) as $chunk) {
            $response = $this->youtube->videos->listVideos('contentDetails', [
                'id' => implode(',', $chunk),
                'maxResults' => 50,
            ]);

            foreach ($response->getItems() as $item) {
                $durations[$item->getId()] = IsoDurationParser::toSeconds(
                    $item->getContentDetails()->getDuration(),
                );
            }
        }

        return $durations;
    }
}
