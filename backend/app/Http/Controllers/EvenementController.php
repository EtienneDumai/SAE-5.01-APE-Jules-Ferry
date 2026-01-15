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
        if (!$user || strtolower($user->role) !== 'administrateur') {
            return response()->json(['message' => 'Accès refusé'], 403);
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
            return response()->json(['message' => 'Erreur lors de la création de l\'évènement'], 500);
        }
    }
    public function update(Request $request, $id)
    {
        $user = $request->user();
        if (!$user || strtolower($user->role) !== 'administrateur') {
            return response()->json(['message' => 'Accès refusé'], 403);
        }
        $evenement = Evenement::find($id);
        if ($evenement) {
            $data = $request->all();
            if ($request->hasFile('image')) {
                $file = $request->file('image');
                $filename = uniqid('event_') . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('evenements', $filename, 'public');
                $data['image_url'] = '/storage/' . $path;
            }
            $evenement->update($data);
            return response()->json($evenement);
        } else {
            return response()->json(['message' => 'Évènement non trouvé'], 404);
        }
    }
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        if (!$user || strtolower($user->role) !== 'administrateur') {
            return response()->json(['message' => 'Accès refusé'], 403);
        }
        $evenement = Evenement::find($id);
        if ($evenement) {
            $evenement->delete();
            return response()->json(['message' => 'Évènement supprimé']);
        } else {
            return response()->json(['message' => 'Évènement non trouvé'], 404);
        }
    }
}
