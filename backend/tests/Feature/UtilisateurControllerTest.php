<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Utilisateur;
use App\Models\Evenement;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class UtilisateurControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_retourne_tous_les_utilisateurs()
    {
        // Given
        $admin = Utilisateur::factory()->create(['role' => 'administrateur']);
        Utilisateur::factory()->count(3)->create();
        $this->actingAs($admin, 'sanctum');

        // When
        $response = $this->getJson('/api/utilisateurs');

        // Then
        $response->assertStatus(200)
            ->assertJsonCount(4);
    }

    public function test_show_retourne_un_utilisateur()
    {
        // Given
        $admin = Utilisateur::factory()->create(['role' => 'administrateur']);
        $user = Utilisateur::factory()->create();
        $this->actingAs($admin, 'sanctum');

        // When
        $response = $this->getJson("/api/utilisateurs/{$user->id_utilisateur}");

        // Then
        $response->assertStatus(200)
            ->assertJson(['id_utilisateur' => $user->id_utilisateur]);
    }

    public function test_update_modifie_profil_utilisateur()
    {
        // Given
        $user = Utilisateur::factory()->create([
            'mot_de_passe' => Hash::make('password123')
        ]);
        $this->actingAs($user, 'sanctum');

        $data = [
            'nom' => 'NouveauNom',
            'prenom' => 'NouveauPrenom',
            'email' => $user->email,
            'role' => 'parent',
            'admin_password' => 'password123',
        ];

        // When
        $response = $this->putJson("/api/utilisateurs/{$user->id_utilisateur}", $data);

        // Then
        $response->assertStatus(200);
        $this->assertDatabaseHas('utilisateurs', ['nom' => 'NouveauNom', 'prenom' => 'NouveauPrenom']);
    }

    public function test_update_mot_de_passe_change_le_mot_de_passe()
    {
        // Given
        $user = Utilisateur::factory()->create();
        $this->actingAs($user, 'sanctum');
        $data = ['mot_de_passe' => 'nouveauMotDePasse123'];

        // When
        $response = $this->patchJson("/api/utilisateurs/{$user->id_utilisateur}/mot-de-passe", $data);

        // Then
        $response->assertStatus(204);
        $updatedUser = $user->fresh();
        $this->assertTrue(Hash::check('nouveauMotDePasse123', $updatedUser->mot_de_passe));
    }

    public function test_destroy_supprime_utilisateur_fiablement()
    {
        // Given
        $admin = Utilisateur::factory()->create([
            'mot_de_passe' => Hash::make('password123')
        ]);

        $userToDelete = Utilisateur::factory()->create([
            'mot_de_passe' => Hash::make('motdepassedelete')
        ]);

        if (!Utilisateur::find(1)) {
            Utilisateur::factory()->create(['id_utilisateur' => 1]);
        }

        $this->actingAs($admin, '');
        Evenement::factory()->create(['id_auteur' => $userToDelete->id_utilisateur]);
        \App\Models\Actualite::factory()->create(['id_auteur' => $userToDelete->id_utilisateur]);
        \App\Models\Formulaire::factory()->create(['id_createur' => $userToDelete->id_utilisateur]);

        $this->actingAs($admin, 'sanctum');

        $data = [
            'password' => 'motdepassedelete' 
        ];

        // When
        $response = $this->deleteJson("/api/utilisateurs/{$userToDelete->id_utilisateur}", $data);

        // Then
        $response->assertStatus(200);
        $this->assertDatabaseMissing('utilisateurs', ['id_utilisateur' => $userToDelete->id_utilisateur]);

        $this->assertDatabaseHas('evenements', ['id_auteur' => 1]);
        $this->assertDatabaseHas('actualites', ['id_auteur' => 1]);
        $this->assertDatabaseHas('formulaires', ['id_createur' => 1]);
    }

    public function test_show_retourne_404_si_utilisateur_inexistant()
    {
        // Given
        $admin = Utilisateur::factory()->create(['role' => 'administrateur']);
        $this->actingAs($admin, 'sanctum');

        // When
        $response = $this->getJson("/api/utilisateurs/99999");

        // Then
        $response->assertStatus(404)
            ->assertJson(['message' => 'Utilisateur non trouvé']);
    }

    public function test_store_cree_un_utilisateur_avec_succes()
    {
        // Given
        $admin = Utilisateur::factory()->create(['role' => 'administrateur']);
        $this->actingAs($admin, 'sanctum');

        $data = [
            'nom' => 'Doe',
            'prenom' => 'John',
            'email' => 'john.doe@example.com',
            'mot_de_passe' => 'password123',
            'role' => 'parent'
        ];

        // When
        $response = $this->postJson('/api/utilisateurs', $data);

        // Then
        $response->assertStatus(201)
            ->assertJsonFragment(['email' => 'john.doe@example.com']);
        
        $this->assertDatabaseHas('utilisateurs', ['email' => 'john.doe@example.com']);
    }

    public function test_store_echoue_si_mot_de_passe_trop_court()
    {
        // Given
        $admin = Utilisateur::factory()->create(['role' => 'administrateur']);
        $this->actingAs($admin, 'sanctum');

        $data = [
            'nom' => 'Doe',
            'prenom' => 'John',
            'email' => 'john.doe@example.com',
            'mot_de_passe' => 'short',
            'role' => 'parent'
        ];

        // When
        $response = $this->postJson('/api/utilisateurs', $data);

        // Then
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['mot_de_passe']);
    }

    public function test_update_retourne_404_si_utilisateur_inexistant()
    {
        // Given
        $admin = Utilisateur::factory()->create(['role' => 'administrateur']);
        $this->actingAs($admin, 'sanctum');

        // When
        $response = $this->putJson("/api/utilisateurs/99999", ['nom' => 'Test']);

        // Then
        $response->assertStatus(404);
    }

    public function test_update_ne_remplace_pas_le_mot_de_passe_si_vide()
    {
        // Given
        $user = Utilisateur::factory()->create([
            'mot_de_passe' => Hash::make('ancien_mot_de_passe')
        ]);
        $this->actingAs($user, 'sanctum');

        $data = [
            'nom' => 'NouveauNom',
            'mot_de_passe' => '' // Vide, ne devrait pas écraser l'ancien
        ];

        // When
        $response = $this->putJson("/api/utilisateurs/{$user->id_utilisateur}", $data);

        // Then
        $response->assertStatus(200);
        $user->refresh();
        $this->assertTrue(Hash::check('ancien_mot_de_passe', $user->mot_de_passe));
    }

    public function test_destroy_retourne_404_si_utilisateur_inexistant()
    {
        // Given
        $admin = Utilisateur::factory()->create(['role' => 'administrateur']);
        $this->actingAs($admin, 'sanctum');

        // When
        $response = $this->deleteJson("/api/utilisateurs/99999");

        // Then
        $response->assertStatus(404);
    }

    public function test_update_mot_de_passe_echoue_si_trop_court()
    {
        // Given
        $user = Utilisateur::factory()->create();
        $this->actingAs($user, 'sanctum');
        $data = ['mot_de_passe' => 'short'];

        // When
        $response = $this->patchJson("/api/utilisateurs/{$user->id_utilisateur}/mot-de-passe", $data);

        //Then
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['mot_de_passe']);
    }
}
