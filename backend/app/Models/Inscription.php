<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inscription extends Model
{
    protected $table = 'inscriptions';
    protected $primaryKey = null;
    public $incrementing = false;

    protected $fillable = [
        'id_utilisateur',
        'id_creneau',
        'date_inscription',
        'commentaire'
    ];
    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class, 'id_utilisateur');
    }
    public function creneau(){
        return $this->belongsTo(Creneau::class, 'id_creneau');
    }
}
