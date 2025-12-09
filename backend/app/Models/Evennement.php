<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Evennement extends Model
{
    protected $table = 'evennements';
    protected $primaryKey = 'id_evennement';
    public $incrementing = true;
    protected $fillable = [
        'titre',
        'description',
        'date_debut',
        'date_fin',
        'lieu',
        'organisateur',
        'statut'
    ];
    public function formulaires()
    {
        return $this->hasMany(Formulaire::class, 'id_evennement');
    }
    public function utilisateurs()
    {
        return $this->belongsToMany(Utilisateur::class, 'inscription', 'id_evennement', 'id_utilisateur');
    }
}
