<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Actualite extends Model
{
    protected $table = "actualites";

    protected $primaryKey = 'id_actualite';
    public $incrementing = true;

    protected $fillable = [
        'titre',
        'contenu',
        'image_url',
        'date_publication',
        'date_creation',
        'statut'
    ];
    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class, 'id_utilisateur');
    }


}
