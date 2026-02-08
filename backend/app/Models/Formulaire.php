<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Formulaire extends Model
{
    use HasFactory;

    protected $table = 'formulaires';
    protected $primaryKey = 'id_formulaire';
    public $incrementing = true;

    protected $fillable = [
        'nom_formulaire',
        'description',
        'statut',
        'id_createur',
        'is_template'
    ];

    public function createur()
    {
        return $this->belongsTo(Utilisateur::class, 'id_createur', 'id_utilisateur');
    }
    public function evenements()
    {
        return $this->hasMany(Evenement::class, 'id_formulaire', 'id_formulaire');
    }
    public function taches()
    {
        return $this->hasMany(Tache::class, 'id_formulaire', 'id_formulaire');
    }
}