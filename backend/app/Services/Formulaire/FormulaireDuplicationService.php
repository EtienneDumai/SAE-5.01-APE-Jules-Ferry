<?php

/**
 * Fichier : backend/app/Services/Formulaire/FormulaireDuplicationService.php
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce service gere la duplication des formulaires.
 * Il permet de recreer un formulaire existant avec sa structure et ses donnees utiles.
 */

namespace App\Services\Formulaire;

use App\Models\Formulaire;
use App\Models\Tache;
use App\Models\Creneau;
use Illuminate\Support\Facades\DB;

class FormulaireDuplicationService
{
    /**
     * Clone un formulaire template et ses enfants pour un événement spécifique.
     *
     * @param int $templateId L'ID du modèle à copier
     * @param int $userId L'ID de l'utilisateur qui crée l'événement
     * @return Formulaire Le nouveau formulaire cloné
     */
    public function clonerPourEvenement($templateId, $userId)
    {
        $template = Formulaire::with('taches.creneaux')->findOrFail($templateId);

        return DB::transaction(function () use ($template, $userId) {
            $nouveauFormulaire = $template->replicate(); // replicate() copie l'objet sauf l'ID
            $nouveauFormulaire->nom_formulaire = $template->nom_formulaire . ' (Copie)';
            $nouveauFormulaire->is_template = false;
            $nouveauFormulaire->id_createur = $userId;
            $nouveauFormulaire->save();

            foreach ($template->taches as $tache) {
                $nouvelleTache = $tache->replicate();
                $nouvelleTache->id_formulaire = $nouveauFormulaire->id_formulaire;
                $nouvelleTache->save();

                foreach ($tache->creneaux as $creneau) {
                    $nouveauCreneau = $creneau->replicate();
                    $nouveauCreneau->id_tache = $nouvelleTache->id_tache;
                    $nouveauCreneau->save();
                }
            }

            return $nouveauFormulaire;
        });
    }
}