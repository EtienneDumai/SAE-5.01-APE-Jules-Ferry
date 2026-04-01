<?php

/**
 * Fichier : backend/database/factories/AbonneNewsletterFactory.php
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier genere des donnees de test pour AbonneNewsletterFactory.
 */

namespace Database\Factories;

use App\Models\AbonneNewsletter;
use Illuminate\Database\Eloquent\Factories\Factory;

class AbonneNewsletterFactory extends Factory
{
    protected $model = AbonneNewsletter::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'email' => fake()->unique()->safeEmail(),
            'statut' => 'actif',
        ];
    }
}
