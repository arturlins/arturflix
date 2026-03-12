<?php

namespace App\Concerns;

use Illuminate\Support\Str;

trait HasPublicId
{
    protected static function bootHasPublicId(): void
    {
        static::creating(function (self $model): void {
            $model->public_id = (string) Str::uuid();
        });
    }
}
