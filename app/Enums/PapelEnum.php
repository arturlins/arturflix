<?php

namespace App\Enums;

enum PapelEnum: string
{
    case ALUNO = 'aluno';
    case ADMIN = 'admin';
    case SUPERUSER = 'superuser';
}
