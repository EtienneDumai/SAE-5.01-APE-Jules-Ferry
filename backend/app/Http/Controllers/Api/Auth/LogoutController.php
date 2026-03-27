<?php

/**
 * Fichier : backend/app/Http/Controllers/Api/Auth/LogoutController.php
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce controleur gere la deconnexion des utilisateurs.
 * Il invalide la session ou les jetons utilises pour acceder a l'application.
 */

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class LogoutController extends Controller
{
    public function logout(Request $request)
    {
        // Suppr le token actuel de l'utilisateur
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Déconnexion réussie',
        ], 200);
    }
}