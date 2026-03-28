<?php

/**
 * Fichier : backend/app/Enums/TokenAbility.php
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier regroupe les valeurs possibles de TokenAbility.
 */

declare(strict_types=1);

namespace App\Enums;

enum TokenAbility: string
{
    case ACCESS_API = 'access-api';
    case ACCESS_ADMIN_API = 'access-admin-api';
    case REFRESH_TOKENS = 'refresh-tokens';
}
