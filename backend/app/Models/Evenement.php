<?php

/**
 * Fichier : backend/app/Models/Evenement.php
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier definit le modele Evenement du backend.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Evenement extends Model
{
    use HasFactory;

    protected $table = 'evenements';
    protected $primaryKey = 'id_evenement';
    public $incrementing = true;

    protected $fillable = [
        'titre',
        'description',
        'date_evenement',
        'heure_debut',
        'heure_fin',
        'lieu',
        'image_url',
        'statut',
        'id_auteur',
        'id_formulaire'
    ];

    // Cast auto
    protected $casts = [
        'date_evenement' => 'date',
        'heure_debut' => 'datetime:H:i',
        'heure_fin' => 'datetime:H:i',
    ];

    public function auteur()
    {
        return $this->belongsTo(Utilisateur::class, 'id_auteur', 'id_utilisateur');
    }

    public function formulaire()
    {
        return $this->belongsTo(Formulaire::class, 'id_formulaire', 'id_formulaire');
    }
}