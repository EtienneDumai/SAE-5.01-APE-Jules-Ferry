<?php

namespace Database\Factories;

use App\Models\Inscription;
use App\Models\Utilisateur;
use App\Models\Creneau;
use Illuminate\Database\Eloquent\Factories\Factory;

class InscriptionFactory extends Factory
{
    protected $model = Inscription::class;

    public function definition(): array
    {
        return [
            'id_utilisateur' => Utilisateur::factory(),
            'id_creneau' => Creneau::factory(),
            'commentaire' => $this->faker->sentence(),
        ];
    }
}
