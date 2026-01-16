<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class LoginController extends Controller
{
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'mot_de_passe' => ['required'],
        ], [
            'email.required' => 'L\'email est obligatoire',
            'email.email' => 'L\'email doit être valide',
            'mot_de_passe.required' => 'Le mot de passe est obligatoire',
        ]);

        $utilisateur = Utilisateur::where('email', $validated['email'])->first();
        // vérif si l'utilisateur existe et si mot de passe correct
        if (!$utilisateur || !Hash::check($validated['mot_de_passe'], $utilisateur->mot_de_passe)) {
            return response()->json([
                'message' => 'Email ou mot de passe incorrect',
            ], 401);
        }

        // Vérif si compte actif
        if ($utilisateur->statut_compte !== 'actif') {
            return response()->json([
                'message' => 'Votre compte est désactivé',
            ], 403);
        }

        //create token Sanctum
        $token = $utilisateur->createToken('auth_token')->plainTextToken;

        // Retourner la réponse
        return response()->json([
            'message' => 'Connexion réussie',
            'user' => [
                'id_utilisateur' => $utilisateur->id_utilisateur,
                'nom' => $utilisateur->nom,
                'prenom' => $utilisateur->prenom,
                'email' => $utilisateur->email,
                'role' => $utilisateur->role,
            ],
            'token' => $token,
        ], 200);
    }
}