<?php

/**
 * Fichier : backend/tests/Unit/ExampleTest.php
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier contient les tests unitaires pour [TITRE].
 */

namespace Tests\Unit;

use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class ExampleTest extends TestCase
{
    #[Test]
    public function should_return_true_for_basic_assertion(): void
    {
        // GIVEN

        // WHEN
        $result = true;

        // THEN
        $this->assertTrue($result);
    }
}
