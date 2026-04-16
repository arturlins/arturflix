<?php

namespace App\Enums;

enum TipoAulaEnum: string
{
    case VIDEO = 'video';
    case TEXTO = 'texto';
    case QUIZ = 'quiz';
}
