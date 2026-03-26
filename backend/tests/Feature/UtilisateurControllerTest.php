<?php

namespace Tests\Feature;

use App\Models\Evenement;
use App\Models\Utilisateur;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

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
}
