<?php

namespace Tests\Feature;

use App\Models\Evenement;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class UpdateEvenementStatutCommandTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function should_mark_past_published_events_as_termine(): void
    {
        $evenement = Evenement::factory()->create([
            'statut' => 'publie',
            'date_evenement' => now()->subDay()->toDateString(),
            'titre' => 'Ancien événement',
        ]);

        $this->artisan('evenements:update-statut')
            ->expectsOutput("Événement 'Ancien événement' passé en terminé.");

        $this->assertDatabaseHas('evenements', [
            'id_evenement' => $evenement->id_evenement,
            'statut' => 'termine',
        ]);
    }

    #[Test]
    public function should_display_message_when_no_event_needs_update(): void
    {
        Evenement::factory()->create([
            'statut' => 'publie',
            'date_evenement' => now()->addDay()->toDateString(),
        ]);

        $this->artisan('evenements:update-statut')
            ->expectsOutput('Aucun événement à mettre à jour.');
    }
}
