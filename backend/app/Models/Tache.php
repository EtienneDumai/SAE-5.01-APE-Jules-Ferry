<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Tache extends Model
{
    use HasFactory;

    protected $table = 'taches';
    protected $primaryKey = 'id_tache';
    public $incrementing = true;

    protected $fillable = [
        'nom_tache',
        'description',
        'heure_debut_globale',
        'heure_fin_globale',
        'id_formulaire'
    ];

    // Cast auto
    protected $casts = [
        'heure_debut_globale' => 'datetime:H:i',
        'heure_fin_globale' => 'datetime:H:i',
    ];

    public function formulaire()
    {
        return $this->belongsTo(Formulaire::class, 'id_formulaire', 'id_formulaire');
    }
    public function creneaux()
    {
        return $this->hasMany(Creneau::class, 'id_tache', 'id_tache');
    }
}