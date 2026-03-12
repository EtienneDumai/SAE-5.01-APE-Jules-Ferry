<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Models\Utilisateur;
use App\Models\Actualite;
use App\Models\Evenement;
use App\Models\Formulaire;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class UtilisateurController extends Controller
{
    public function index()
    {
        $utilisateurs = Utilisateur::all();
        if ($utilisateurs) {
            return response()->json($utilisateurs);
        } else {
            return response()->json(['message' => 'Aucun utilisateur trouvé'], 404);
        }
    }
    public function show($id)
    {
        $utilisateur = Utilisateur::find($id);
        if ($utilisateur) {
            return response()->json($utilisateur);
        } else {
            return response()->json(['message' => 'Utilisateur non trouvé'], 404);
        }
    }
    public function store(Request $request)
    {
        $request->validate([
<<<<<<< HEAD
            'mot_de_passe' => ['nullable', Password::min(8)],
=======
            'mot_de_passe' => ['required', Password::min(8)],
            'admin_password' => 'required|string',
>>>>>>> e5bd1ee7605261ebca38d3b5b5a92371994721a8
        ]);

        $admin = $request->user();
        if (!Hash::check($request->admin_password, $admin->getAuthPassword())) {
            return response()->json(['message' => 'Mot de passe administrateur incorrect.'], 403);
        }

        $donnees = $request->except(['admin_password']);

        $utilisateur = Utilisateur::create($donnees);

        if ($utilisateur) {
            return response()->json($utilisateur, 201);
        } else {
            return response()->json(['message' => 'Erreur lors de la création de l\'utilisateur'], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $utilisateur = Utilisateur::find($id);
        if ($utilisateur) {
            $request->validate([
                'admin_password' => 'required|string',
            ]);

            $admin = $request->user();
            if (!Hash::check($request->admin_password, $admin->getAuthPassword())) {
                return response()->json(['message' => 'Mot de passe administrateur incorrect.'], 403);
            }

            $donnees = $request->except(['admin_password']);
            if (empty($donnees['mot_de_passe'])) {
                unset($donnees['mot_de_passe']);
            }
            $utilisateur->update($donnees);
            return response()->json($utilisateur);
        } else {
            return response()->json(['message' => 'Utilisateur non trouvé'], 404);
        }
    }
    public function destroy(Request $request, $id)
    {
        $utilisateur = Utilisateur::find($id);

        if (!$utilisateur) {
            return response()->json(['message' => 'Utilisateur non trouvé'], 404);
        }
<<<<<<< HEAD

        // On vérifie le mot de passe uniquement si l'utilisateur en a un
        if (!empty($utilisateur->mot_de_passe)) {
            $request->validate([
                'password' => 'required|string'
            ]);

            if (!Hash::check($request->password, $utilisateur->mot_de_passe)) {
                return response()->json([
                    'message' => 'Mot de passe incorrect. Suppression impossible.'
                ], 403);
            }
=======
        //securité on verifie le mot de passe avant suppression
        $request->validate([
            'admin_password' => 'required|string'
        ]);

        $admin = $request->user();
        if (!Hash::check($request->admin_password, $admin->getAuthPassword())) {
            return response()->json([
                'message' => 'Mot de passe administrateur incorrect. Suppression impossible.'
            ], 403);
>>>>>>> e5bd1ee7605261ebca38d3b5b5a92371994721a8
        }

        $adminId = 1; // réattribution des événements et actualités à l'admin si le user en avait créé
        if (!Utilisateur::where('id_utilisateur', $adminId)->exists()) {
        }

        if ($utilisateur->id_utilisateur !== $adminId) {
            Evenement::where('id_auteur', $utilisateur->id_utilisateur)
                ->update(['id_auteur' => $adminId]);

            Actualite::where('id_auteur', $utilisateur->id_utilisateur)
                ->update(['id_auteur' => $adminId]);

            Formulaire::where('id_createur', $utilisateur->id_utilisateur)
                ->update(['id_createur' => $adminId]);
        }

        $utilisateur->inscriptions()->delete();
        $utilisateur->tokens()->delete();
        $utilisateur->delete();
        return response()->json(['message' => 'Compte supprimé avec succès']);
    }

    public function updatePassword(Request $request, $id)
    {
        $validated = $request->validate([
            'mot_de_passe' => ['required', 'string', 'min:8'],
        ]);

        $user = Utilisateur::findOrFail($id);
        $user->mot_de_passe = Hash::make($validated['mot_de_passe']);
        $user->save();

        return response()->noContent();
    }
}
