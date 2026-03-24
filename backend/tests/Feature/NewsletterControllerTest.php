<?php

namespace Tests\Feature;

use App\Models\AbonneNewsletter;
use App\Models\Utilisateur;
use Illuminate\Foundation\Testing\RefreshDatabase;
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
        AbonneNewsletter::factory()->create(['email' => 'existing@example.com']);

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

    public function test_index_retourne_la_liste_des_abonnes_pour_un_admin()
    {
        $admin = Utilisateur::factory()->create(['role' => 'administrateur']);
        AbonneNewsletter::factory()->count(3)->create();

        $this->actingAs($admin, 'sanctum');

        $response = $this->getJson('/api/newsletters');

        $response->assertStatus(200)
            ->assertJsonCount(3);
    }

    public function test_index_refuse_un_utilisateur_non_admin()
    {
        $user = Utilisateur::factory()->create(['role' => 'parent']);

        $this->actingAs($user, 'sanctum');

        $response = $this->getJson('/api/newsletters');

        $response->assertStatus(403);
    }

    public function test_store_admin_ajoute_un_abonne_pour_un_admin()
    {
        $admin = Utilisateur::factory()->create([
            'role' => 'administrateur',
        ]);

        $this->actingAs($admin, 'sanctum');

        $response = $this->postJson('/api/newsletters', [
            'email' => 'admin-ajout@example.com',
        ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('abonnes_newsletter', [
            'email' => 'admin-ajout@example.com',
            'statut' => 'actif',
        ]);
    }

    public function test_store_admin_refuse_un_utilisateur_non_admin()
    {
        $user = Utilisateur::factory()->create([
            'role' => 'parent',
        ]);

        $this->actingAs($user, 'sanctum');

        $response = $this->postJson('/api/newsletters', [
            'email' => 'admin-ajout@example.com',
        ]);

        $response->assertStatus(403);

        $this->assertDatabaseMissing('abonnes_newsletter', [
            'email' => 'admin-ajout@example.com',
        ]);
    }

    public function test_destroy_supprime_un_abonne_pour_un_admin()
    {
        $admin = Utilisateur::factory()->create([
            'role' => 'administrateur',
        ]);
        $abonne = AbonneNewsletter::factory()->create();

        $this->actingAs($admin, 'sanctum');

        $response = $this->deleteJson("/api/newsletters/{$abonne->id_abonne}");

        $response->assertStatus(200);

        $this->assertDatabaseMissing('abonnes_newsletter', [
            'id_abonne' => $abonne->id_abonne,
        ]);
    }

    public function test_destroy_refuse_un_utilisateur_non_admin()
    {
        $user = Utilisateur::factory()->create([
            'role' => 'parent',
        ]);
        $abonne = AbonneNewsletter::factory()->create();

        $this->actingAs($user, 'sanctum');

        $response = $this->deleteJson("/api/newsletters/{$abonne->id_abonne}");

        $response->assertStatus(403);

        $this->assertDatabaseHas('abonnes_newsletter', [
            'id_abonne' => $abonne->id_abonne,
        ]);
    }
}
