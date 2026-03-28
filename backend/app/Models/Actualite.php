<?php

/**
 * Fichier : backend/app/Models/Actualite.php
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier definit le modele Actualite du backend.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Actualite extends Model
{
    use HasFactory;

    protected $table = "actualites";

    protected $primaryKey = 'id_actualite';
    public $incrementing = true;

    protected $fillable = [
        'titre',
        'contenu',
        'image_url',
        'date_publication',
        'statut',
        'id_auteur'
    ];
    
    protected $casts = [
        'date_publication' => 'date:Y-m-d',
    ];

    public function auteur()
    {
        return $this->belongsTo(Utilisateur::class, 'id_auteur', 'id_utilisateur');
    }


}
