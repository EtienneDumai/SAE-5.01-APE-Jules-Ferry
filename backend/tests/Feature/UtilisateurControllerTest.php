<?php

/**
 * Fichier : backend/tests/Feature/UtilisateurControllerTest.php
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier contient un test feature (incrémentaux) pour UtilisateurControllerTest.
 */

namespace Tests\Feature;

use App\Models\Evenement;
use App\Models\Utilisateur;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;
use App\Mail\RoleChangedEmail;
use App\Mail\SetPasswordEmail;

class UtilisateurControllerTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function should_return_all_utilisateurs_for_index_endpoint(): void
    {
        // GIVEN
        $admin = Utilisateur::factory()->create(['role' => 'administrateur']);
        Utilisateur::factory()->count(3)->create();

        $this->actingAs($admin, 'sanctum');

        // WHEN
        $response = $this->getJson('/api/utilisateurs');

        // THEN
        $response->assertStatus(200)
            ->assertJsonCount(4);
    }

    #[Test]
    public function should_return_utilisateur_for_show_endpoint_when_utilisateur_exists(): void
    {
        // GIVEN
        $admin = Utilisateur::factory()->create(['role' => 'administrateur']);
        $user = Utilisateur::factory()->create();

        $this->actingAs($admin, 'sanctum');

        // WHEN
        $response = $this->getJson("/api/utilisateurs/{$user->id_utilisateur}");

        // THEN
        $response->assertStatus(200)
            ->assertJson(['id_utilisateur' => $user->id_utilisateur]);
    }

    #[Test]
    public function should_update_utilisateur_profile_for_update_endpoint_when_data_is_valid(): void
    {
        // GIVEN
        $user = Utilisateur::factory()->create([
            'mot_de_passe' => Hash::make('password123'),
        ]);
        $this->actingAs($user, 'sanctum');

        $data = [
            'nom' => 'NouveauNom',
            'prenom' => 'NouveauPrenom',
            'email' => $user->email,
            'role' => 'parent',
            'admin_password' => 'password123',
        ];

        // WHEN
        $response = $this->putJson("/api/utilisateurs/{$user->id_utilisateur}", $data);

        // THEN
        $response->assertStatus(200);
        $this->assertDatabaseHas('utilisateurs', [
            'nom' => 'NouveauNom',
            'prenom' => 'NouveauPrenom',
        ]);
    }

    #[Test]
    public function should_update_password_for_update_password_endpoint_when_data_is_valid(): void
    {
        // GIVEN
        $user = Utilisateur::factory()->create();
        $this->actingAs($user, 'sanctum');

        $data = ['mot_de_passe' => 'nouveauMotDePasse123'];

        // WHEN
        $response = $this->patchJson("/api/utilisateurs/{$user->id_utilisateur}/mot-de-passe", $data);

        // THEN
        $response->assertStatus(204);

        $updatedUser = $user->fresh();
        $this->assertTrue(Hash::check('nouveauMotDePasse123', $updatedUser->mot_de_passe));
    }

    #[Test]
    public function should_delete_utilisateur_reliably_for_destroy_endpoint_when_data_is_valid(): void
    {
        // GIVEN
        $admin = Utilisateur::factory()->create([
            'mot_de_passe' => Hash::make('password123'),
        ]);

        $userToDelete = Utilisateur::factory()->create([
            'mot_de_passe' => Hash::make('motdepassedelete'),
        ]);

        if (!Utilisateur::find(1)) {
            Utilisateur::factory()->create(['id_utilisateur' => 1]);
        }

        $this->actingAs($admin, '');
        Evenement::factory()->create(['id_auteur' => $userToDelete->id_utilisateur]);

        $this->actingAs($admin, 'sanctum');

        $data = [
            'password' => 'motdepassedelete',
        ];

        // WHEN
        $response = $this->deleteJson("/api/utilisateurs/{$userToDelete->id_utilisateur}", $data);

        // THEN
        $response->assertStatus(200);
        $this->assertDatabaseMissing('utilisateurs', ['id_utilisateur' => $userToDelete->id_utilisateur]);
        $this->assertDatabaseHas('evenements', ['id_auteur' => 1]);
    }

    #[Test]
    public function should_create_utilisateur_for_store_endpoint_when_data_is_valid(): void
    {
        // GIVEN
        $admin = Utilisateur::factory()->create(['role' => 'administrateur']);
        $this->actingAs($admin, 'sanctum');

        // WHEN
        $response = $this->postJson('/api/utilisateurs', [
            'nom' => 'Martin',
            'prenom' => 'Alice',
            'email' => 'alice@example.com',
            'mot_de_passe' => 'password123',
            'role' => 'parent',
            'statut_compte' => 'actif',
        ]);

        // THEN
        $response->assertStatus(201)
            ->assertJsonPath('email', 'alice@example.com');

        $this->assertDatabaseHas('utilisateurs', ['email' => 'alice@example.com']);
    }

    #[Test]
    public function should_return_not_found_for_show_endpoint_when_utilisateur_does_not_exist(): void
    {
        // GIVEN
        $admin = Utilisateur::factory()->create(['role' => 'administrateur']);
        $this->actingAs($admin, 'sanctum');

        // WHEN
        $response = $this->getJson('/api/utilisateurs/999999');

        // THEN
        $response->assertStatus(404)
            ->assertJson(['message' => 'Utilisateur non trouvé']);
    }

    #[Test]
    public function should_send_set_password_email_when_user_role_changes_from_parent_to_membre_bureau(): void
    {
        // GIVEN
        Mail::fake();
        Cache::flush();

        $admin = Utilisateur::factory()->create(['role' => 'administrateur']);
        $user = Utilisateur::factory()->create([
            'role' => 'parent',
            'email' => 'bureau@example.com',
            'prenom' => 'Alice',
        ]);

        $this->actingAs($admin, 'sanctum');

        // WHEN
        $response = $this->putJson("/api/utilisateurs/{$user->id_utilisateur}", [
            'nom' => $user->nom,
            'prenom' => $user->prenom,
            'email' => $user->email,
            'role' => 'membre_bureau',
            'statut_compte' => $user->statut_compte,
        ]);

        // THEN
        $response->assertStatus(200)
            ->assertJsonPath('role', 'membre_bureau');

        $this->assertNotNull(Cache::get('set_password_' . $user->id_utilisateur));
        Mail::assertSent(SetPasswordEmail::class);
    }

    #[Test]
    public function should_send_role_changed_email_when_user_role_changes_from_membre_bureau_to_administrateur(): void
    {
        // GIVEN
        Mail::fake();

        $admin = Utilisateur::factory()->create(['role' => 'administrateur']);
        $user = Utilisateur::factory()->create([
            'role' => 'membre_bureau',
            'email' => 'admin2@example.com',
            'prenom' => 'Bob',
        ]);

        $this->actingAs($admin, 'sanctum');

        // WHEN
        $response = $this->putJson("/api/utilisateurs/{$user->id_utilisateur}", [
            'nom' => $user->nom,
            'prenom' => $user->prenom,
            'email' => $user->email,
            'role' => 'administrateur',
            'statut_compte' => $user->statut_compte,
        ]);

        // THEN
        $response->assertStatus(200)
            ->assertJsonPath('role', 'administrateur');

        Mail::assertSent(RoleChangedEmail::class);
    }

    #[Test]
    public function should_return_not_found_for_destroy_endpoint_when_utilisateur_does_not_exist(): void
    {
        // GIVEN
        $admin = Utilisateur::factory()->create(['role' => 'administrateur']);
        $this->actingAs($admin, 'sanctum');

        // WHEN
        $response = $this->deleteJson('/api/utilisateurs/999999');

        // THEN
        $response->assertStatus(404)
            ->assertJson(['message' => 'Utilisateur non trouvé']);
    }

    #[Test]
    public function should_return_forbidden_for_destroy_endpoint_when_current_non_parent_user_provides_wrong_password(): void
    {
        // GIVEN
        $user = Utilisateur::factory()->create([
            'role' => 'administrateur',
            'mot_de_passe' => Hash::make('correct-password'),
        ]);
        $this->actingAs($user, 'sanctum');

        // WHEN
        $response = $this->deleteJson("/api/utilisateurs/{$user->id_utilisateur}", [
            'mot_de_passe' => 'bad-password',
        ]);

        // THEN
        $response->assertStatus(403)
            ->assertJson(['message' => 'Mot de passe incorrect ou manquant']);
        $this->assertDatabaseHas('utilisateurs', ['id_utilisateur' => $user->id_utilisateur]);
    }

    #[Test]
    public function should_delete_current_parent_account_without_password_confirmation(): void
    {
        // GIVEN
        $user = Utilisateur::factory()->create(['role' => 'parent']);
        $this->actingAs($user, 'sanctum');

        // WHEN
        $response = $this->deleteJson("/api/utilisateurs/{$user->id_utilisateur}");

        // THEN
        $response->assertStatus(200)
            ->assertJson(['message' => 'Compte supprimé avec succès']);
        $this->assertDatabaseMissing('utilisateurs', ['id_utilisateur' => $user->id_utilisateur]);
    }
}
