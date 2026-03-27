<?php

/**
 * Fichier : backend/database/factories/FormulaireFactory.php
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier genere des donnees de test pour FormulaireFactory.
 */

namespace Database\Factories;

use App\Models\Formulaire;
use App\Models\Utilisateur;
use Illuminate\Database\Eloquent\Factories\Factory;

class FormulaireFactory extends Factory
{
    protected $model = Formulaire::class;

    public function definition(): array
    {
        return [
            'nom_formulaire' => $this->faker->sentence(),
            'description' => $this->faker->paragraph(),
            'statut' => 'actif',
            'id_createur' => Utilisateur::factory(),
        ];
    }
}
