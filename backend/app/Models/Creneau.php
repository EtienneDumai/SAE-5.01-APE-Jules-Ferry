<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Creneau extends Model
{
    use HasFactory;

    protected $table = 'creneaux';
    protected $primaryKey = 'id_creneau';
    public $incrementing = true;
    protected $fillable = [
        'heure_debut',
        'heure_fin',
        'quota',
        'id_tache'
    ];

    protected $casts = [
        'heure_debut' => 'datetime:H:i',
        'heure_fin' => 'datetime:H:i',
    ];

    public function tache(){
        return $this->belongsTo(Tache::class, 'id_tache', 'id_tache');
    }
    public function inscriptions()
    {
        return $this->hasMany(Inscription::class, 'id_creneau', 'id_creneau');
    }

    // many-to-many avec Utilisateur via inscriptions
    public function utilisateurs()
    {
        return $this->belongsToMany(
            Utilisateur::class, 
            'inscriptions', 
            'id_creneau', 
            'id_utilisateur'
        )->withPivot('commentaire')
         ->withTimestamps();
    }

    // Méthode utilitaires
    public function estComplet()
    {
        return $this->inscriptions()->count() >= $this->quota;
    }
    public function placesRestantes()
    {
        return $this->quota - $this->inscriptions()->count();
    }
}
