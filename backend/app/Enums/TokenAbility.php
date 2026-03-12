<?php

declare(strict_types=1);

namespace App\Enums;

enum TokenAbility: string
{
    case ACCESS_API = 'access-api';
    case ACCESS_ADMIN_API = 'access-admin-api';
    case REFRESH_TOKENS = 'refresh-tokens';
}
