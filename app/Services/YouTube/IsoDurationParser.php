<?php

namespace App\Services\YouTube;

class IsoDurationParser
{
    public static function toSeconds(string $iso): int
    {
        if (! preg_match('/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/', $iso, $m)) {
            return 0;
        }

        $hours = (int) ($m[1] ?? 0);
        $minutes = (int) ($m[2] ?? 0);
        $seconds = (int) ($m[3] ?? 0);

        return $hours * 3600 + $minutes * 60 + $seconds;
    }
}
