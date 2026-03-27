<?php

/**
 * Fichier : backend/database/factories/ActualiteFactory.php
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier genere des donnees de test pour ActualiteFactory.
 */

class ActualiteFactory extends Factory
{

    protected $model = Actualite::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'titre' => $this->faker->sentence,
            'contenu' => $this->faker->paragraph,
            'date_publication' => $this->faker->date(),
            'statut' => 'publie',
            'image_url' => null,
            'id_auteur' => Utilisateur::factory(),
        ];
    }
}
