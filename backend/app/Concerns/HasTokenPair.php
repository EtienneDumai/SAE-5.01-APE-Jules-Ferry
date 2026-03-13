<?php

declare(strict_types=1);

namespace App\Concerns;

use App\Enums\TokenAbility;
use Carbon\Carbon;

trait HasTokenPair
{
    public function createTokens(): array
    {
        $ttlAccessToken = now()->addMinutes(15);
        $ttlRefreshToken = now()->addHours(24);

        return $this->generateTokens($ttlAccessToken, $ttlRefreshToken);
    }

    public function createTokensWithoutExpiration(): array
    {
        $ttlAccessToken = null;
        $ttlRefreshToken = null;

        return $this->generateTokens($ttlAccessToken, $ttlRefreshToken);
    }

    private function generateTokens(?Carbon $expirationAccessToken, ?Carbon $expirationRefreshToken): array
    {
        $ability = $this->getTokenAbility();

        $accessToken = $this->createToken('access_token', [$ability], $expirationAccessToken)->plainTextToken;
        $refreshToken = $this->createToken('refresh_token', [TokenAbility::REFRESH_TOKENS->value], $expirationRefreshToken)->plainTextToken;

        return [$accessToken, $refreshToken];
    }

    public function getTokenAbility(): string
    {
        // On vérifie le rôle exact de ta base de données
        if ($this->role !== 'administrateur') {
            return TokenAbility::ACCESS_API->value;
        }

        return TokenAbility::ACCESS_ADMIN_API->value;
    }
}