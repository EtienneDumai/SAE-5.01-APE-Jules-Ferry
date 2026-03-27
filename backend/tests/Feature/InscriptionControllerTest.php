<?php

/**
 * Fichier : backend/tests/Feature/InscriptionControllerTest.php
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier contient un test feature (incrémentaux) pour InscriptionControllerTest.
 */

namespace Tests\Feature;

use App\Models\Creneau;
use App\Models\Evenement;
use App\Models\Formulaire;
use App\Models\Inscription;
use App\Models\Tache;
use App\Models\Utilisateur;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class InscriptionControllerTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function should_return_created_response_for_store_endpoint_when_data_is_valid(): void
    {
        // GIVEN
        $user = Utilisateur::factory()->create(['role' => 'parent']);
        $creneau = $this->createCreneauForEvent(now()->addDay()->toDateString(), 5);

        $this->actingAs($user, 'sanctum');

        // WHEN
        $response = $this->postJson('/api/inscriptions', [
            'id_creneau' => $creneau->id_creneau,
            'commentaire' => 'Participe',
        ]);

        // THEN
        $response->assertStatus(201)
            ->assertJson(['message' => 'Inscription validée !']);

        $this->assertDatabaseHas('inscriptions', [
            'id_utilisateur' => $user->id_utilisateur,
            'id_creneau' => $creneau->id_creneau,
            'commentaire' => 'Participe',
        ]);
    }

    #[Test]
    public function should_return_unprocessable_entity_for_store_endpoint_when_event_is_past(): void
    {
        // GIVEN
        $user = Utilisateur::factory()->create(['role' => 'parent']);
        $creneau = $this->createCreneauForEvent(now()->subDay()->toDateString(), 5);

        $this->actingAs($user, 'sanctum');

        // WHEN
        $response = $this->postJson('/api/inscriptions', [
            'id_creneau' => $creneau->id_creneau,
        ]);

        // THEN
        $response->assertStatus(422)
            ->assertJson(['message' => 'Impossible de s\'inscrire à un événement passé.']);
    }

    #[Test]
    public function should_return_user_inscriptions_for_mes_inscriptions_endpoint(): void
    {
        // GIVEN
        $user = Utilisateur::factory()->create(['role' => 'parent']);
        $this->actingAs($user, 'sanctum');

        Inscription::factory()->count(3)->create([
            'id_utilisateur' => $user->id_utilisateur,
        ]);

        Inscription::factory()->create();

        // WHEN
        $response = $this->getJson('/api/inscriptions/mes-inscriptions');

        // THEN
        $response->assertStatus(200)
            ->assertJsonCount(3);
    }

    #[Test]
    public function should_return_success_for_admin_store_endpoint_when_data_is_valid(): void
    {
        // GIVEN
        $admin = Utilisateur::factory()->create(['role' => 'parent']);
        $user = Utilisateur::factory()->create();
        $creneau = $this->createCreneauForEvent(now()->addDay()->toDateString(), 5);

        $this->actingAs($admin, 'sanctum');

        // WHEN
        $response = $this->postJson('/api/admin/inscriptions', [
            'id_utilisateur' => $user->id_utilisateur,
            'id_creneau' => $creneau->id_creneau,
            'commentaire' => 'Inscrit par admin',
        ]);

        // THEN
        $response->assertStatus(201)
            ->assertJson(['message' => 'Inscription ajoutée avec succès !']);

        $this->assertDatabaseHas('inscriptions', [
            'id_utilisateur' => $user->id_utilisateur,
            'id_creneau' => $creneau->id_creneau,
        ]);
    }

    private function createCreneauForEvent(string $eventDate, int $quota): Creneau
    {
        $formulaire = Formulaire::factory()->create();

        Evenement::factory()->create([
            'id_formulaire' => $formulaire->id_formulaire,
            'date_evenement' => $eventDate,
        ]);

        $tache = Tache::factory()->create([
            'id_formulaire' => $formulaire->id_formulaire,
        ]);

        return Creneau::factory()->create([
            'id_tache' => $tache->id_tache,
            'quota' => $quota,
        ]);
    }
}
