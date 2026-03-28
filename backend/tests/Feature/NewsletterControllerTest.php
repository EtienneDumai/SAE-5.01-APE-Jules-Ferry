<?php

/**
 * Fichier : backend/tests/Feature/NewsletterControllerTest.php
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier contient un test feature (incrémentaux) pour NewsletterControllerTest.
 */

namespace Tests\Feature;

use App\Models\AbonneNewsletter;
use App\Models\Utilisateur;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class NewsletterControllerTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function should_add_email_for_store_endpoint_when_email_is_valid(): void
    {
        // GIVEN
        $data = ['email' => 'test@example.com'];

        // WHEN
        $response = $this->postJson('/api/newsletter/subscribe', $data);

        // THEN
        $response->assertStatus(201)
            ->assertJson(['message' => 'Merci ! Ton inscription est bien prise en compte.']);

        $this->assertDatabaseHas('abonnes_newsletter', [
            'email' => 'test@example.com',
            'statut' => 'actif',
        ]);
    }

    #[Test]
    public function should_return_validation_errors_for_store_endpoint_when_email_is_invalid(): void
    {
        // GIVEN
        $data = ['email' => 'pasUnMail'];

        // WHEN
        $response = $this->postJson('/api/newsletter/subscribe', $data);

        // THEN
        $response->assertStatus(422)
            ->assertJsonPath('errors.email.0', 'Le format de l\'email n\'est pas valide.');
    }

    #[Test]
    public function should_return_validation_errors_for_store_endpoint_when_email_already_exists(): void
    {
        // GIVEN
        AbonneNewsletter::factory()->create(['email' => 'existing@example.com']);

        // WHEN
        $response = $this->postJson('/api/newsletter/subscribe', [
            'email' => 'existing@example.com',
        ]);

        // THEN
        $response->assertStatus(422)
            ->assertJsonPath('errors.email.0', 'Cet email est déjà inscrit à notre newsletter !');
    }

    #[Test]
    public function should_return_validation_errors_for_store_endpoint_when_email_is_missing(): void
    {
        // GIVEN
        $payload = [];

        // WHEN
        $response = $this->postJson('/api/newsletter/subscribe', $payload);

        // THEN
        $response->assertStatus(422)
            ->assertJsonPath('errors.email.0', 'L\'adresse email est obligatoire.');
    }

    #[Test]
    public function should_return_abonnes_for_index_endpoint_when_user_is_admin(): void
    {
        // GIVEN
        $admin = Utilisateur::factory()->create(['role' => 'administrateur']);
        AbonneNewsletter::factory()->count(3)->create();
        $this->actingAs($admin, 'sanctum');

        // WHEN
        $response = $this->getJson('/api/newsletters');

        // THEN
        $response->assertStatus(200)
            ->assertJsonCount(3);
    }

    #[Test]
    public function should_return_forbidden_for_index_endpoint_when_user_is_not_admin(): void
    {
        // GIVEN
        $user = Utilisateur::factory()->create(['role' => 'parent']);
        $this->actingAs($user, 'sanctum');

        // WHEN
        $response = $this->getJson('/api/newsletters');

        // THEN
        $response->assertStatus(403);
    }

    #[Test]
    public function should_add_abonne_for_store_admin_endpoint_when_user_is_admin(): void
    {
        // GIVEN
        $admin = Utilisateur::factory()->create(['role' => 'administrateur']);
        $this->actingAs($admin, 'sanctum');

        // WHEN
        $response = $this->postJson('/api/newsletters', [
            'email' => 'admin-ajout@example.com',
        ]);

        // THEN
        $response->assertStatus(201);
        $this->assertDatabaseHas('abonnes_newsletter', [
            'email' => 'admin-ajout@example.com',
            'statut' => 'actif',
        ]);
    }

    #[Test]
    public function should_return_forbidden_for_store_admin_endpoint_when_user_is_not_admin(): void
    {
        // GIVEN
        $user = Utilisateur::factory()->create(['role' => 'parent']);
        $this->actingAs($user, 'sanctum');

        // WHEN
        $response = $this->postJson('/api/newsletters', [
            'email' => 'admin-ajout@example.com',
        ]);

        // THEN
        $response->assertStatus(403);
        $this->assertDatabaseMissing('abonnes_newsletter', [
            'email' => 'admin-ajout@example.com',
        ]);
    }

    #[Test]
    public function should_delete_abonne_for_destroy_endpoint_when_user_is_admin(): void
    {
        // GIVEN
        $admin = Utilisateur::factory()->create(['role' => 'administrateur']);
        $abonne = AbonneNewsletter::factory()->create();
        $this->actingAs($admin, 'sanctum');

        // WHEN
        $response = $this->deleteJson("/api/newsletters/{$abonne->id_abonne}");

        // THEN
        $response->assertStatus(200);
        $this->assertDatabaseMissing('abonnes_newsletter', [
            'id_abonne' => $abonne->id_abonne,
        ]);
    }

    #[Test]
    public function should_return_forbidden_for_destroy_endpoint_when_user_is_not_admin(): void
    {
        // GIVEN
        $user = Utilisateur::factory()->create(['role' => 'parent']);
        $abonne = AbonneNewsletter::factory()->create();
        $this->actingAs($user, 'sanctum');

        // WHEN
        $response = $this->deleteJson("/api/newsletters/{$abonne->id_abonne}");

        // THEN
        $response->assertStatus(403);
        $this->assertDatabaseHas('abonnes_newsletter', [
            'id_abonne' => $abonne->id_abonne,
        ]);
    }
}
