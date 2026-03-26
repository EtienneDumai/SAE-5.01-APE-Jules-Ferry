<?php

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
