<?php

/**
 * Fichier : backend/database/factories/AbonneNewsletterFactory.php
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier genere des donnees de test pour AbonneNewsletterFactory.
 */

class AbonneNewsletterFactory extends Factory
{
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
