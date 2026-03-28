<?php

/**
 * Fichier : backend/database/factories/EvenementFactory.php
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier genere des donnees de test pour EvenementFactory.
 */

namespace Database\Factories;

use App\Models\Evenement;
use App\Models\Utilisateur;
use Illuminate\Database\Eloquent\Factories\Factory;

class EvenementFactory extends Factory
{
    protected $model = Evenement::class;

    public function definition(): array
    {
        return [
            'titre' => $this->faker->sentence(),
            'description' => $this->faker->paragraph(),
            'date_evenement' => $this->faker->date(),
            'heure_debut' => $this->faker->time('H:i'),
            'heure_fin' => $this->faker->time('H:i'),
            'lieu' => $this->faker->address(),
            'statut' => 'publie',
            'id_auteur' => Utilisateur::factory(),
            'id_formulaire' => null,
            'image_url' => null,
        ];
    }
}
