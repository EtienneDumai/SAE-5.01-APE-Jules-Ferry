<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Evenement;
use Carbon\Carbon;

class UpdateEvenementStatut extends Command
{
    protected $signature = 'evenements:update-statut';
    protected $description = 'Passe les événements expirés en statut "termine"';

    public function handle()
    {
        $aujourdhui = Carbon::today();
        $evenements = Evenement::where('statut', 'publie')
                                ->whereDate('date_evenement', '<', $aujourdhui)
                                ->get();

        if ($evenements->isEmpty()) {
            $this->info('Aucun événement à mettre à jour.');
            return;
        }

        foreach ($evenements as $evenement) {
            $evenement->update(['statut' => 'termine']);
            $this->info("Événement '{$evenement->titre}' passé en terminé.");
        }
    }
}