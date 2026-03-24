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
            'mot_de_passe' => ['nullable', Password::min(8)],
        ]);

        $utilisateur = Utilisateur::create($request->all());

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
            $donnees = $request->all();
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

        $adminId = 1;

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
