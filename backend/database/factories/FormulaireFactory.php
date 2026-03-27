<?php

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
            'nom_formulaire' => $this->faker->sentence(4),
            'description' => $this->faker->text(200),
            'statut' => 'actif',
            'id_createur' => Utilisateur::factory(),
        ];
    }
}
