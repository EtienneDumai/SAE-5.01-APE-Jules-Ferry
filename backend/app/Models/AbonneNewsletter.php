<?php

/**
 * Fichier : backend/app/Models/AbonneNewsletter.php
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier definit le modele AbonneNewsletter du backend.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AbonneNewsletter extends Model
{
    use HasFactory;

    protected $table = 'abonnes_newsletter';
    protected $primaryKey = 'id_abonne';
    public $incrementing = true;

    protected $fillable = [
        'email',
        'statut'
    ];
}