<?php

namespace App\Http\Controllers;

use App\Models\Evenement;
use Illuminate\Http\Request;

class EvenementController extends Controller
{
    public function index()
    {
        $evenements = Evenement::all();
        if ($evenements) {
            return response()->json($evenements);
        } else {
            return response()->json(['message' => 'Aucun évènement trouvé'], 404);
        }
    }

    public function show($id)
    {
        $evenement = Evenement::find($id);
        if ($evenement) {
            return response()->json($evenement);
        } else {
            return response()->json(['message' => 'Évènement non trouvé'], 404);
        }
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $role = $user ? strtolower($user->role) : '';
        
        if (!$user || !in_array($role, ['administrateur', 'membre_bureau'])) {
            return response()->json(['message' => 'Accès refusé. Réservé aux administrateurs et membres du bureau.'], 403);
        }
        $data = $request->all();
        $data['id_auteur'] = $user->id_utilisateur;

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = uniqid('event_') . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('evenements', $filename, 'public');
            $data['image_url'] = '/storage/' . $path;
        }

        $evenement = Evenement::create($data);

        if ($evenement) {
            return response()->json($evenement, 201);
        } else {
            return response()->json(['message' => 'Erreur lors de la création'], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $user = $request->user();
        $evenement = Evenement::find($id);

        if (!$evenement) {
            return response()->json(['message' => 'Évènement non trouvé'], 404);
        }

        // logique des perms de modifs/suppr
        $role = $user ? strtolower($user->role) : '';
        $isAuteur = ($evenement->id_auteur === $user->id_utilisateur);

        if ($role !== 'administrateur' && ($role !== 'membre_bureau' || !$isAuteur)) {
            return response()->json(['message' => 'Accès refusé. Vous ne pouvez modifier que vos propres événements.'], 403);
        }
        $data = $request->all();

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = uniqid('event_') . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('evenements', $filename, 'public');
            $data['image_url'] = '/storage/' . $path;
        }
        unset($data['id_auteur']);

        $evenement->update($data);
        return response()->json($evenement);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $evenement = Evenement::find($id);

        if (!$evenement) {
            return response()->json(['message' => 'Évènement non trouvé'], 404);
        }
        //j'aurais pu faire un helper ici pour empecher le DRY mais galere avec le temps
        $role = $user ? strtolower($user->role) : '';
        $isAuteur = ($evenement->id_auteur === $user->id_utilisateur);

        if ($role !== 'administrateur' && ($role !== 'membre_bureau' || !$isAuteur)) {
             return response()->json(['message' => 'Accès refusé. Vous ne pouvez supprimer que vos propres événements.'], 403);
        }

        $evenement->delete();
        return response()->json(['message' => 'Évènement supprimé']);
    }
}




