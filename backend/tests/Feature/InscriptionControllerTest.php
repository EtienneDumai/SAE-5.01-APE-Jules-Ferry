<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Utilisateur;
use App\Models\Creneau;
use App\Models\Inscription;
use App\Models\Evenement;
use App\Models\Formulaire;
use App\Models\Tache;
use Illuminate\Foundation\Testing\RefreshDatabase;

class InscriptionControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_store_creates_inscription()
    {
        $user = Utilisateur::factory()->create(['role' => 'parent']);
        $this->actingAs($user, 'sanctum');

        // Create hierarchy: Event -> Formulaire -> Tache -> Creneau
        $evenement = Evenement::factory()->create(['date_evenement' => now()->addDay()]);
        $formulaire = Formulaire::factory()->create();
        $evenement->update(['id_formulaire' => $formulaire->id_formulaire]);

        $tache = Tache::factory()->create(['id_formulaire' => $formulaire->id_formulaire]);
        $creneau = Creneau::factory()->create(['id_tache' => $tache->id_tache, 'quota' => 5]);

        $data = [
            'id_creneau' => $creneau->id_creneau,
            'commentaire' => 'Participe'
        ];

        $response = $this->postJson('/api/inscriptions', $data);

        $response->assertStatus(201);
        $this->assertDatabaseHas('inscriptions', [
            'id_utilisateur' => $user->id_utilisateur,
            'id_creneau' => $creneau->id_creneau
        ]);
    }

    public function test_store_fails_if_event_is_past()
    {
        $user = Utilisateur::factory()->create(['role' => 'parent']);
        $this->actingAs($user, 'sanctum');

        $evenement = Evenement::factory()->create(['date_evenement' => now()->subDay()]);
        $formulaire = Formulaire::factory()->create();
        $evenement->update(['id_formulaire' => $formulaire->id_formulaire]);

        $tache = Tache::factory()->create(['id_formulaire' => $formulaire->id_formulaire]);
        $creneau = Creneau::factory()->create(['id_tache' => $tache->id_tache]);

        $data = ['id_creneau' => $creneau->id_creneau];

        $response = $this->postJson('/api/inscriptions', $data);

        $response->assertStatus(422)
            ->assertJsonFragment(['message' => 'Impossible de s\'inscrire à un événement passé.']);
    }

    public function test_store_fails_if_quota_ok()
    {
        $user = Utilisateur::factory()->create(['role' => 'parent']);
        $this->actingAs($user, 'sanctum');

        $evenement = Evenement::factory()->create(['date_evenement' => now()->addDay()]);
        $formulaire = Formulaire::factory()->create();
        $evenement->update(['id_formulaire' => $formulaire->id_formulaire]);

        $tache = Tache::factory()->create(['id_formulaire' => $formulaire->id_formulaire]);
        $creneau = Creneau::factory()->create(['id_tache' => $tache->id_tache, 'quota' => 1]);

        // Fill the quota
        Inscription::factory()->create(['id_creneau' => $creneau->id_creneau]);

        $data = ['id_creneau' => $creneau->id_creneau];

        $response = $this->postJson('/api/inscriptions', $data);

        $response->assertStatus(422)
            ->assertJsonFragment(['message' => 'Ce créneau est complet.']);
    }

    public function test_store_fails_if_already_registered()
    {
        $user = Utilisateur::factory()->create(['role' => 'parent']);
        $this->actingAs($user, 'sanctum');

        $evenement = Evenement::factory()->create(['date_evenement' => now()->addDay()]);
        $formulaire = Formulaire::factory()->create();
        $evenement->update(['id_formulaire' => $formulaire->id_formulaire]);
        $tache = Tache::factory()->create(['id_formulaire' => $formulaire->id_formulaire]);
        $creneau = Creneau::factory()->create(['id_tache' => $tache->id_tache, 'quota' => 5]);

        // Register once
        Inscription::create([
            'id_utilisateur' => $user->id_utilisateur,
            'id_creneau' => $creneau->id_creneau
        ]);

        $data = ['id_creneau' => $creneau->id_creneau];

        $response = $this->postJson('/api/inscriptions', $data);

        $response->assertStatus(409)
            ->assertJsonFragment(['message' => 'Vous êtes déjà inscrit à ce créneau.']);
    }

    public function test_mes_inscriptions_returns_list()
    {
        $user = Utilisateur::factory()->create(['role' => 'parent']);
        $this->actingAs($user, 'sanctum');

        Inscription::factory()->count(3)->create(['id_utilisateur' => $user->id_utilisateur]);

        $response = $this->getJson('/api/inscriptions/mes-inscriptions');

        $response->assertStatus(200)
            ->assertJsonCount(3);
    }

    public function test_destroy_cancels_inscription()
    {
        $user = Utilisateur::factory()->create(['role' => 'parent']);
        $this->actingAs($user, 'sanctum');

        $inscription = Inscription::factory()->create(['id_utilisateur' => $user->id_utilisateur]);

        $response = $this->deleteJson("/api/inscriptions/{$inscription->id_creneau}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('inscriptions', [
            'id_utilisateur' => $user->id_utilisateur,
            'id_creneau' => $inscription->id_creneau
        ]);
    }
    public function test_store_validation_errors()
    {
        $user = Utilisateur::factory()->create(['role' => 'parent']);
        $this->actingAs($user, 'sanctum');

        $response = $this->postJson('/api/inscriptions', ['id_creneau' => 99999]);
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['id_creneau']);
        $creneau = Creneau::factory()->create();

        $longComment = str_repeat('a', 501);
        $response = $this->postJson('/api/inscriptions', [
            'id_creneau' => $creneau->id_creneau,
            'commentaire' => $longComment
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['commentaire']);
    }
}
