<?php

/**
 * Fichier : backend/app/Models/Inscription.php
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier definit le modele Inscription du backend.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Inscription extends Model
{
    use HasFactory;

    protected $table = 'inscriptions';
    
    // Clé primaire composite
    protected $primaryKey = ['id_utilisateur', 'id_creneau'];
    public $incrementing = false;
    protected $keyType = 'array';

    protected $fillable = [
        'id_utilisateur',
        'id_creneau',
        'commentaire'
    ];

    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class, 'id_utilisateur', 'id_utilisateur');
    }

    public function creneau()
    {
        return $this->belongsTo(Creneau::class, 'id_creneau', 'id_creneau');
    }

    // setKeysForSaveQuery pour clé composite (clc cette clé composite heureusement merci tonton..)
    protected function setKeysForSaveQuery($query)
    {
        $keys = $this->getKeyName();
        if (!is_array($keys)) {
            return parent::setKeysForSaveQuery($query);
        }

        foreach ($keys as $keyName) {
            $query->where($keyName, '=', $this->getKeyForSaveQuery($keyName));
        }

        return $query;
    }

    protected function getKeyForSaveQuery($keyName = null)
    {
        if (is_null($keyName)) {
            $keyName = $this->getKeyName();
        }

        if (isset($this->original[$keyName])) {
            return $this->original[$keyName];
        }

        return $this->getAttribute($keyName);
    }
}