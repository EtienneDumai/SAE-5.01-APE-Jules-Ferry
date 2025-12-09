<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Formulaire extends Model
{
    protected $table = 'formulaires';
    protected $primaryKey = 'id_formulaire';
    public $incrementing = true;
    protected $fillable = [
        'id_evennement',
        'titre',
        'description',
        'date_creation',
        'statut'
    ];
    public function evennements(){
        return $this->belongsTo(Evennement::class, 'id_evennement');
    }
    public function taches(){
        return $this->hasMany(Tache::class, 'id_formulaire');
    }
}