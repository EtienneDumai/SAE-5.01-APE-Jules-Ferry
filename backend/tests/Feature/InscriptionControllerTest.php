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

    #[Test]
    public function should_return_all_inscriptions_for_index_endpoint(): void
    {
        // GIVEN
        $user = Utilisateur::factory()->create();
        Inscription::factory()->count(2)->create();

        $this->actingAs($user, 'sanctum');

        // WHEN
        $response = $this->getJson('/api/inscriptions');

        // THEN
        $response->assertStatus(200)
            ->assertJsonCount(2);
    }

    #[Test]
    public function should_return_conflict_for_store_endpoint_when_user_is_already_registered(): void
    {
        // GIVEN
        $user = Utilisateur::factory()->create(['role' => 'parent']);
        $creneau = $this->createCreneauForEvent(now()->addDay()->toDateString(), 5);
        Inscription::factory()->create([
            'id_utilisateur' => $user->id_utilisateur,
            'id_creneau' => $creneau->id_creneau,
        ]);

        $this->actingAs($user, 'sanctum');

        // WHEN
        $response = $this->postJson('/api/inscriptions', [
            'id_creneau' => $creneau->id_creneau,
        ]);

        // THEN
        $response->assertStatus(409)
            ->assertJson(['message' => 'Vous êtes déjà inscrit à ce créneau.']);
    }

    #[Test]
    public function should_return_unprocessable_entity_for_store_endpoint_when_creneau_is_full(): void
    {
        // GIVEN
        $user = Utilisateur::factory()->create(['role' => 'parent']);
        $otherUser = Utilisateur::factory()->create();
        $creneau = $this->createCreneauForEvent(now()->addDay()->toDateString(), 1);
        Inscription::factory()->create([
            'id_utilisateur' => $otherUser->id_utilisateur,
            'id_creneau' => $creneau->id_creneau,
        ]);

        $this->actingAs($user, 'sanctum');

        // WHEN
        $response = $this->postJson('/api/inscriptions', [
            'id_creneau' => $creneau->id_creneau,
        ]);

        // THEN
        $response->assertStatus(422)
            ->assertJson(['message' => 'Ce créneau est complet.']);
    }

    #[Test]
    public function should_delete_current_user_inscription_for_destroy_endpoint_when_it_exists(): void
    {
        // GIVEN
        $user = Utilisateur::factory()->create(['role' => 'parent']);
        $creneau = $this->createCreneauForEvent(now()->addDay()->toDateString(), 5);
        Inscription::factory()->create([
            'id_utilisateur' => $user->id_utilisateur,
            'id_creneau' => $creneau->id_creneau,
        ]);

        $this->actingAs($user, 'sanctum');

        // WHEN
        $response = $this->deleteJson("/api/inscriptions/{$creneau->id_creneau}");

        // THEN
        $response->assertStatus(200)
            ->assertJson(['message' => 'Inscription annulée.']);
        $this->assertDatabaseMissing('inscriptions', [
            'id_utilisateur' => $user->id_utilisateur,
            'id_creneau' => $creneau->id_creneau,
        ]);
    }

    #[Test]
    public function should_return_not_found_for_destroy_endpoint_when_inscription_does_not_exist(): void
    {
        // GIVEN
        $user = Utilisateur::factory()->create(['role' => 'parent']);
        $creneau = $this->createCreneauForEvent(now()->addDay()->toDateString(), 5);

        $this->actingAs($user, 'sanctum');

        // WHEN
        $response = $this->deleteJson("/api/inscriptions/{$creneau->id_creneau}");

        // THEN
        $response->assertStatus(404)
            ->assertJson(['message' => 'Inscription introuvable.']);
    }

    #[Test]
    public function should_return_conflict_for_admin_store_endpoint_when_user_is_already_registered(): void
    {
        // GIVEN
        $admin = Utilisateur::factory()->create();
        $user = Utilisateur::factory()->create();
        $creneau = $this->createCreneauForEvent(now()->addDay()->toDateString(), 5);
        Inscription::factory()->create([
            'id_utilisateur' => $user->id_utilisateur,
            'id_creneau' => $creneau->id_creneau,
        ]);

        $this->actingAs($admin, 'sanctum');

        // WHEN
        $response = $this->postJson('/api/admin/inscriptions', [
            'id_utilisateur' => $user->id_utilisateur,
            'id_creneau' => $creneau->id_creneau,
        ]);

        // THEN
        $response->assertStatus(409)
            ->assertJson(['message' => 'L\'utilisateur est déjà inscrit à ce créneau.']);
    }

    #[Test]
    public function should_return_unprocessable_entity_for_admin_store_endpoint_when_creneau_is_full(): void
    {
        // GIVEN
        $admin = Utilisateur::factory()->create();
        $user = Utilisateur::factory()->create();
        $otherUser = Utilisateur::factory()->create();
        $creneau = $this->createCreneauForEvent(now()->addDay()->toDateString(), 1);
        Inscription::factory()->create([
            'id_utilisateur' => $otherUser->id_utilisateur,
            'id_creneau' => $creneau->id_creneau,
        ]);

        $this->actingAs($admin, 'sanctum');

        // WHEN
        $response = $this->postJson('/api/admin/inscriptions', [
            'id_utilisateur' => $user->id_utilisateur,
            'id_creneau' => $creneau->id_creneau,
        ]);

        // THEN
        $response->assertStatus(422)
            ->assertJson(['message' => 'Ce créneau est complet.']);
    }

    #[Test]
    public function should_delete_inscription_for_destroy_admin_endpoint_when_it_exists(): void
    {
        // GIVEN
        $admin = Utilisateur::factory()->create();
        $user = Utilisateur::factory()->create();
        $creneau = $this->createCreneauForEvent(now()->addDay()->toDateString(), 5);
        Inscription::factory()->create([
            'id_utilisateur' => $user->id_utilisateur,
            'id_creneau' => $creneau->id_creneau,
        ]);

        $this->actingAs($admin, 'sanctum');

        // WHEN
        $response = $this->deleteJson('/api/admin/inscriptions', [
            'id_utilisateur' => $user->id_utilisateur,
            'id_creneau' => $creneau->id_creneau,
        ]);

        // THEN
        $response->assertStatus(200)
            ->assertJson(['message' => 'Inscription supprimée par administrateur.']);
    }

    #[Test]
    public function should_return_not_found_for_destroy_admin_endpoint_when_inscription_does_not_exist(): void
    {
        // GIVEN
        $admin = Utilisateur::factory()->create();
        $user = Utilisateur::factory()->create();
        $creneau = $this->createCreneauForEvent(now()->addDay()->toDateString(), 5);

        $this->actingAs($admin, 'sanctum');

        // WHEN
        $response = $this->deleteJson('/api/admin/inscriptions', [
            'id_utilisateur' => $user->id_utilisateur,
            'id_creneau' => $creneau->id_creneau,
        ]);

        // THEN
        $response->assertStatus(404)
            ->assertJson(['message' => 'Inscription introuvable.']);
    }

    #[Test]
    public function should_update_inscription_for_update_admin_endpoint_when_data_is_valid(): void
    {
        // GIVEN
        $admin = Utilisateur::factory()->create();
        $user = Utilisateur::factory()->create();
        $oldCreneau = $this->createCreneauForEvent(now()->addDay()->toDateString(), 5);
        $newCreneau = $this->createCreneauForEvent(now()->addDays(2)->toDateString(), 5);
        Inscription::factory()->create([
            'id_utilisateur' => $user->id_utilisateur,
            'id_creneau' => $oldCreneau->id_creneau,
        ]);

        $this->actingAs($admin, 'sanctum');

        // WHEN
        $response = $this->putJson('/api/admin/inscriptions', [
            'id_utilisateur' => $user->id_utilisateur,
            'old_id_creneau' => $oldCreneau->id_creneau,
            'new_id_creneau' => $newCreneau->id_creneau,
        ]);

        // THEN
        $response->assertStatus(200)
            ->assertJson(['message' => 'Inscription modifiée avec succès.']);
        $this->assertDatabaseHas('inscriptions', [
            'id_utilisateur' => $user->id_utilisateur,
            'id_creneau' => $newCreneau->id_creneau,
        ]);
    }

    #[Test]
    public function should_return_not_found_for_update_admin_endpoint_when_inscription_does_not_exist(): void
    {
        // GIVEN
        $admin = Utilisateur::factory()->create();
        $user = Utilisateur::factory()->create();
        $oldCreneau = $this->createCreneauForEvent(now()->addDay()->toDateString(), 5);
        $newCreneau = $this->createCreneauForEvent(now()->addDays(2)->toDateString(), 5);

        $this->actingAs($admin, 'sanctum');

        // WHEN
        $response = $this->putJson('/api/admin/inscriptions', [
            'id_utilisateur' => $user->id_utilisateur,
            'old_id_creneau' => $oldCreneau->id_creneau,
            'new_id_creneau' => $newCreneau->id_creneau,
        ]);

        // THEN
        $response->assertStatus(404)
            ->assertJson(['message' => 'Inscription introuvable.']);
    }

    #[Test]
    public function should_return_unprocessable_entity_for_update_admin_endpoint_when_new_creneau_is_full(): void
    {
        // GIVEN
        $admin = Utilisateur::factory()->create();
        $user = Utilisateur::factory()->create();
        $otherUser = Utilisateur::factory()->create();
        $oldCreneau = $this->createCreneauForEvent(now()->addDay()->toDateString(), 5);
        $newCreneau = $this->createCreneauForEvent(now()->addDays(2)->toDateString(), 1);
        Inscription::factory()->create([
            'id_utilisateur' => $user->id_utilisateur,
            'id_creneau' => $oldCreneau->id_creneau,
        ]);
        Inscription::factory()->create([
            'id_utilisateur' => $otherUser->id_utilisateur,
            'id_creneau' => $newCreneau->id_creneau,
        ]);

        $this->actingAs($admin, 'sanctum');

        // WHEN
        $response = $this->putJson('/api/admin/inscriptions', [
            'id_utilisateur' => $user->id_utilisateur,
            'old_id_creneau' => $oldCreneau->id_creneau,
            'new_id_creneau' => $newCreneau->id_creneau,
        ]);

        // THEN
        $response->assertStatus(422)
            ->assertJson(['message' => 'Le nouveau créneau est complet.']);
    }

    #[Test]
    public function should_return_conflict_for_update_admin_endpoint_when_user_is_already_registered_on_new_creneau(): void
    {
        // GIVEN
        $admin = Utilisateur::factory()->create();
        $user = Utilisateur::factory()->create();
        $oldCreneau = $this->createCreneauForEvent(now()->addDay()->toDateString(), 5);
        $newCreneau = $this->createCreneauForEvent(now()->addDays(2)->toDateString(), 5);
        Inscription::factory()->create([
            'id_utilisateur' => $user->id_utilisateur,
            'id_creneau' => $oldCreneau->id_creneau,
        ]);
        Inscription::factory()->create([
            'id_utilisateur' => $user->id_utilisateur,
            'id_creneau' => $newCreneau->id_creneau,
        ]);

        $this->actingAs($admin, 'sanctum');

        // WHEN
        $response = $this->putJson('/api/admin/inscriptions', [
            'id_utilisateur' => $user->id_utilisateur,
            'old_id_creneau' => $oldCreneau->id_creneau,
            'new_id_creneau' => $newCreneau->id_creneau,
        ]);

        // THEN
        $response->assertStatus(409)
            ->assertJson(['message' => 'L\'utilisateur est déjà inscrit à ce créneau.']);
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
