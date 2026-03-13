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
        $admin = Utilisateur::factory()->create(['role' => 'administrateur']);
        Utilisateur::factory()->count(3)->create();

        $this->actingAs($admin, 'sanctum');

        $response = $this->getJson('/api/utilisateurs');

        $response->assertStatus(200)
            ->assertJsonCount(4);
    }

    public function test_show_retourne_un_utilisateur()
    {
        $admin = Utilisateur::factory()->create(['role' => 'administrateur']);
        $user = Utilisateur::factory()->create();

        $this->actingAs($admin, 'sanctum');

        $response = $this->getJson("/api/utilisateurs/{$user->id_utilisateur}");

        $response->assertStatus(200)
            ->assertJson(['id_utilisateur' => $user->id_utilisateur]);
    }

    public function test_update_modifie_profil_utilisateur()
    {
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

        $response = $this->putJson("/api/utilisateurs/{$user->id_utilisateur}", $data);

        $response->assertStatus(200);
        $this->assertDatabaseHas('utilisateurs', ['nom' => 'NouveauNom', 'prenom' => 'NouveauPrenom']);
    }

    public function test_update_mot_de_passe_change_le_mot_de_passe()
    {
        $user = Utilisateur::factory()->create();
        $this->actingAs($user, 'sanctum');

        $data = ['mot_de_passe' => 'nouveauMotDePasse123'];

        $response = $this->patchJson("/api/utilisateurs/{$user->id_utilisateur}/mot-de-passe", $data);

        $response->assertStatus(204);

        $updatedUser = $user->fresh();
        $this->assertTrue(Hash::check('nouveauMotDePasse123', $updatedUser->mot_de_passe));
    }

    public function test_destroy_supprime_utilisateur_fiablement()
    {
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

        $this->actingAs($admin, 'sanctum');

        $data = [
            'password' => 'motdepassedelete' 
        ];

        $response = $this->deleteJson("/api/utilisateurs/{$userToDelete->id_utilisateur}", $data);

        $response->assertStatus(200);
        $this->assertDatabaseMissing('utilisateurs', ['id_utilisateur' => $userToDelete->id_utilisateur]);

        $this->assertDatabaseHas('evenements', ['id_auteur' => 1]);
    }
}
