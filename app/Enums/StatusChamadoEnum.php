<?php
namespace App\Enums;

enum StatusChamadoEnum: string
{
    case NOVO = "novo";
    case EM_ANDAMENTO = "em_andamento";
    case RESOLVIDO = "resolvido";
}
