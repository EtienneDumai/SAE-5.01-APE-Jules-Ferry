<?php

/**
 * Fichier : backend/database/factories/TacheFactory.php
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier genere des donnees de test pour TacheFactory.
 */

namespace Database\Factories;

use App\Models\Tache;
use App\Models\Formulaire;
use Illuminate\Database\Eloquent\Factories\Factory;

class TacheFactory extends Factory
{
    protected $model = Tache::class;

    public function definition(): array
    {
        return [
            'nom_tache' => $this->faker->words(3, true),
            'description' => $this->faker->sentence(),
            'heure_debut_globale' => '08:00',
            'heure_fin_globale' => '18:00',
            'id_formulaire' => Formulaire::factory(),
        ];
    }
}
