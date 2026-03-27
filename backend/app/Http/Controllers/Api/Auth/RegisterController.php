<?php

/**
 * Fichier : backend/app/Http/Controllers/Api/Auth/RegisterController.php
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce controleur gere l'inscription de nouveaux utilisateurs.
 * Il valide les donnees recues et cree les comptes autorises dans l'application.
 */

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class RegisterController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'nom' => ['required', 'string', 'max:50'],
            'prenom' => ['required', 'string', 'max:50'],
            'email' => ['required', 'string', 'email', 'max:100', 'unique:utilisateurs,email'],
            'mot_de_passe' => ['nullable', 'confirmed', Password::min(8)],
        ], [
            'nom.required' => 'Le nom est obligatoire',
            'prenom.required' => 'Le prénom est obligatoire',
            'email.required' => 'L\'email est obligatoire',
            'email.email' => 'L\'email doit être valide',
            'email.unique' => 'Cet email est déjà utilisé',
            'mot_de_passe.confirmed' => 'Les mots de passe ne correspondent pas',
            'mot_de_passe.min' => 'Le mot de passe doit contenir au moins 8 caractères',
        ]);

        // Créer l'utilisateur
        $utilisateur = Utilisateur::create([
            'nom' => $validated['nom'],
            'prenom' => $validated['prenom'],
            'email' => $validated['email'],
            'mot_de_passe' => isset($validated['mot_de_passe']) ? Hash::make($validated['mot_de_passe']) : null,
            'role' => 'parent', // Rôle par défaut
            'statut_compte' => 'actif',
        ]);

        // Retourner la réponse
        return response()->json([
            'message' => 'Inscription réussie',
            'user' => [
                'id_utilisateur' => $utilisateur->id_utilisateur,
                'nom' => $utilisateur->nom,
                'prenom' => $utilisateur->prenom,
                'email' => $utilisateur->email,
                'role' => $utilisateur->role,
            ],
        ], 201);
    }
}