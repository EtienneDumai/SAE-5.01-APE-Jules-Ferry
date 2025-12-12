<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Utilisateur extends Model
{
    use HasFactory;

    protected $table = 'utilisateurs';
    protected $primaryKey = 'id_utilisateur';
    public $incrementing = true;

    protected $fillable = [
        'nom',
        'prenom',
        'email',
        'mot_de_passe',
        'role',
        'statut_compte'
        // PAS date_inscription : timestamps() gere created_at automatiquement
    ];

    protected $hidden = [
        'mot_de_passe',
    ];

    public function actualites()
    {
        return $this->hasMany(Actualite::class, 'id_auteur', 'id_utilisateur');
    }

    public function evenements()
    {
        return $this->hasMany(Evenement::class, 'id_auteur', 'id_utilisateur');
    }

    public function formulaires()
    {
        return $this->hasMany(Formulaire::class, 'id_createur', 'id_utilisateur');
    }

    public function inscriptions()
    {
        return $this->hasMany(Inscription::class, 'id_utilisateur', 'id_utilisateur');
    }

    // many-to-many avec Creneau via la table inscriptions
    public function creneaux()
    {
        return $this->belongsToMany(
            Creneau::class, 
            'inscriptions', 
            'id_utilisateur', 
            'id_creneau'
        )->withPivot('commentaire')
         ->withTimestamps();
    }
}