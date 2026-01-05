<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Utilisateur extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

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
    ];

    // Cacher le mot de passe dans les réponses JSON
    protected $hidden = [
        'mot_de_passe',
    ];

    // Cast automatique
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public function getAuthPassword()
    {
        return $this->mot_de_passe;
    }

    // Relations
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