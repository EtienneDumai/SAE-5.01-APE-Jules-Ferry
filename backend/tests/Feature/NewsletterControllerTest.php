<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class NewsletterControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_store_ajoute_email_valide()
    {
        $data = ['email' => 'test@example.com'];

        $response = $this->postJson('/api/newsletter/subscribe', $data);

        $response->assertStatus(201)
            ->assertJson(['message' => 'Merci ! Ton inscription est bien prise en compte.']);

        $this->assertDatabaseHas('abonnes_newsletter', [
            'email' => 'test@example.com',
            'statut' => 'actif'
        ]);
    }

    public function test_store_refuse_email_invalide()
    {
        $data = ['email' => 'pasUnMail'];

        $response = $this->postJson('/api/newsletter/subscribe', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_store_refuse_email_existant()
    {
        \App\Models\AbonneNewsletter::factory()->create(['email' => 'existing@example.com']);

        $this->assertDatabaseHas('abonnes_newsletter', ['email' => 'existing@example.com']);

        $data = ['email' => 'existing@example.com'];

        $response = $this->postJson('/api/newsletter/subscribe', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_store_refuse_sans_email()
    {
        $response = $this->postJson('/api/newsletter/subscribe', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }
}
