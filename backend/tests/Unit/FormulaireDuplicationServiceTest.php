<?php

namespace Tests\Unit;

use App\Models\Creneau;
use App\Models\Formulaire;
use App\Models\Tache;
use App\Models\Utilisateur;
use App\Services\Formulaire\FormulaireDuplicationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class FormulaireDuplicationServiceTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function should_clone_template_formulaire_with_taches_and_creneaux(): void
    {
        $template = Formulaire::factory()->create([
            'nom_formulaire' => 'Template bénévole',
            'is_template' => true,
        ]);
        $tache = Tache::factory()->create([
            'id_formulaire' => $template->id_formulaire,
            'nom_tache' => 'Accueil',
        ]);
        Creneau::factory()->create([
            'id_tache' => $tache->id_tache,
            'quota' => 3,
        ]);
        $user = Utilisateur::factory()->create();

        $service = app(FormulaireDuplicationService::class);
        $clone = $service->clonerPourEvenement($template->id_formulaire, $user->id_utilisateur);

        $this->assertNotSame($template->id_formulaire, $clone->id_formulaire);
        $this->assertSame('Template bénévole (Copie)', $clone->nom_formulaire);
        $this->assertFalse($clone->is_template);
        $this->assertSame($user->id_utilisateur, $clone->id_createur);
        $this->assertCount(1, $clone->fresh()->taches);
        $this->assertCount(1, $clone->fresh()->taches->first()->creneaux);
    }
}
