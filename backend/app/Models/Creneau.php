<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Creneau extends Model
{
    protected $table = 'creneaux';
    protected $primaryKey = 'id_creneau';
    public $incrementing = true;
    protected $fillable = [
        'heure_debut',
        'heure_fin',
        'quota'
    ];

    public function tache(){
        return $this->belongsTo(Tache::class, 'id_tache');
    }
    public function inscription(){
        return $this->hasMany(Inscription::class, 'id_creneau', 'id_creneau');
    }
}
