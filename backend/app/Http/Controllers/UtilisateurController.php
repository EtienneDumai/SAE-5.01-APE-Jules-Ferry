<?php

namespace App\Http\Controllers;

use Hash;
use Illuminate\Http\Request;
use App\Models\Utilisateur;
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
            $utilisateur->update($request->all());
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