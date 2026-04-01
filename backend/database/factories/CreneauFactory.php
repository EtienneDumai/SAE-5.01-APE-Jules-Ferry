<?php

/**
 * Fichier : backend/database/factories/CreneauFactory.php
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier genere des donnees de test pour CreneauFactory.
 */

namespace Database\Factories;

use App\Models\Creneau;
use App\Models\Tache;
use Illuminate\Database\Eloquent\Factories\Factory;

class CreneauFactory extends Factory
{
    protected $model = Creneau::class;

    public function definition(): array
    {
        return [
            'heure_debut' => '09:00',
            'heure_fin' => '10:00',
            'quota' => 5,
            'id_tache' => Tache::factory(),
        ];
    }
}
