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
        $evenement = Evenement::create($request->all());
        if ($evenement) {
            return response()->json($evenement, 201);
        } else {
            return response()->json(['message' => 'Erreur lors de la création de l\'évènement'], 500);
        }
    }
    public function update(Request $request, $id)
    {
        $evenement = Evenement::find($id);
        if ($evenement) {
            $evenement->update($request->all());
            return response()->json($evenement);
        } else {
            return response()->json(['message' => 'Évènement non trouvé'], 404);
        }
    }
    public function destroy($id)
    {
        $evenement = Evenement::find($id);
        if ($evenement) {
            $evenement->delete();
            return response()->json(['message' => 'Évènement supprimé']);
        } else {
            return response()->json(['message' => 'Évènement non trouvé'], 404);
        }
    }
}
