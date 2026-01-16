<?php

namespace App\Http\Controllers\Api;

use Hash;
use Illuminate\Http\Request;
use App\Models\Utilisateur;
use App\Http\Controllers\Controller;

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
            'mot_de_passe' => ['required', Password::min(8)],
        ]);
        $donnees = $request->all();

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
    public function destroy($id)
    {
        $utilisateur = Utilisateur::find($id);
        if ($utilisateur) {
            $utilisateur->delete();
            return response()->json(['message' => 'Utilisateur supprimé']);
        } else {
            return response()->json(['message' => 'Utilisateur non trouvé'], 404);
        }
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