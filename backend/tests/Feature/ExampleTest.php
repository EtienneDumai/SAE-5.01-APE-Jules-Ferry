<?php

namespace Tests\Feature;

use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    #[Test]
    public function should_return_successful_response_for_application_root(): void
    {
        // GIVEN

        // WHEN
        $response = $this->get('/');

        // THEN
        $response->assertStatus(200);
    }
}
