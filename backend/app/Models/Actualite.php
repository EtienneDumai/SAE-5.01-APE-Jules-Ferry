<?php

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
        'date_creation',
        'statut',
        'id_auteur'
    ];
    
    protected $casts = [
        'date_publication' => 'date',
    ];

    public function auteur()
    {
        return $this->belongsTo(Utilisateur::class, 'id_auteur', 'id_utilisateur');
    }


}
