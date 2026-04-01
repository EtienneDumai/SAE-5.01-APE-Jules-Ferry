<?php

namespace Tests\Unit;

use App\Models\Actualite;
use App\Models\Creneau;
use App\Models\Evenement;
use App\Models\Formulaire;
use App\Models\Inscription;
use App\Models\Utilisateur;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ModelBehaviorTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function should_return_model_relationships_and_auth_password_for_utilisateur(): void
    {
        $user = Utilisateur::factory()->create([
            'mot_de_passe' => Hash::make('password123'),
        ]);
        $actualite = Actualite::factory()->create(['id_auteur' => $user->id_utilisateur]);
        $formulaire = Formulaire::factory()->create(['id_createur' => $user->id_utilisateur]);
        $evenement = Evenement::factory()->create([
            'id_auteur' => $user->id_utilisateur,
            'id_formulaire' => $formulaire->id_formulaire,
        ]);
        $creneau = Creneau::factory()->create();
        $inscription = Inscription::factory()->create([
            'id_utilisateur' => $user->id_utilisateur,
            'id_creneau' => $creneau->id_creneau,
        ]);

        $this->assertSame($user->mot_de_passe, $user->getAuthPassword());
        $this->assertTrue($user->actualites->contains($actualite));
        $this->assertTrue($user->formulaires->contains($formulaire));
        $this->assertTrue($user->evenements->contains($evenement));
        $this->assertTrue($user->inscriptions->contains(function (Inscription $item) use ($inscription) {
            return $item->id_utilisateur === $inscription->id_utilisateur
                && $item->id_creneau === $inscription->id_creneau;
        }));
        $this->assertTrue($user->creneaux->contains('id_creneau', $creneau->id_creneau));
    }

    #[Test]
    public function should_compute_creneau_completion_and_remaining_places(): void
    {
        $creneau = Creneau::factory()->create(['quota' => 2]);
        Inscription::factory()->create(['id_creneau' => $creneau->id_creneau]);

        $this->assertFalse($creneau->fresh()->estComplet());
        $this->assertSame(1, $creneau->fresh()->placesRestantes());

        Inscription::factory()->create(['id_creneau' => $creneau->id_creneau]);

        $this->assertTrue($creneau->fresh()->estComplet());
        $this->assertSame(0, $creneau->fresh()->placesRestantes());
        $this->assertNotNull($creneau->tache);
        $this->assertCount(2, $creneau->fresh()->utilisateurs);
    }

    #[Test]
    public function should_use_composite_key_when_updating_inscription(): void
    {
        $inscription = Inscription::factory()->create(['commentaire' => 'Avant']);

        $inscription->commentaire = 'Après';
        $inscription->save();

        $this->assertDatabaseHas('inscriptions', [
            'id_utilisateur' => $inscription->id_utilisateur,
            'id_creneau' => $inscription->id_creneau,
            'commentaire' => 'Après',
        ]);
        $this->assertNotNull($inscription->utilisateur);
        $this->assertNotNull($inscription->creneau);
    }

    #[Test]
    public function should_expose_expected_model_casts_and_relationships(): void
    {
        $actualite = Actualite::factory()->create(['date_publication' => '2026-04-01']);
        $formulaire = Formulaire::factory()->create(['is_template' => 1]);
        $evenement = Evenement::factory()->create([
            'id_formulaire' => $formulaire->id_formulaire,
            'date_evenement' => '2026-05-01',
        ]);

        $this->assertSame('2026-04-01', $actualite->date_publication->format('Y-m-d'));
        $this->assertTrue($formulaire->is_template);
        $this->assertTrue($formulaire->evenements->contains($evenement));
        $this->assertNotNull($actualite->auteur);
        $this->assertNotNull($evenement->auteur);
        $this->assertSame($formulaire->id_formulaire, $evenement->formulaire->id_formulaire);
    }
}
