<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Tache;
class TacheController extends Controller
{
    public function index()
    {
        $taches = Tache::all();
        if ($taches) {
            return response()->json($taches);
        } else {
            return response()->json(['message' => 'Aucune tâche trouvée'], 404);
        }
    }
    public function show($id)
    {
        $tache = Tache::find($id);
        if ($tache) {
            return response()->json($tache);
        } else {
            return response()->json(['message' => 'Tâche non trouvée'], 404);
        }
    }
    public function store(Request $request)
    {
        $tache = Tache::create($request->all());
        if ($tache) {
            return response()->json($tache, 201);
        } else {
            return response()->json(['message' => 'Erreur lors de la création de la tâche'], 500);
        }
    }
    public function update(Request $request, $id)
    {
        $tache = Tache::find($id);
        if ($tache) {
            $tache->update($request->all());
            return response()->json($tache);
        } else {
            return response()->json(['message' => 'Tâche non trouvée'], 404);
        }
    }
    public function destroy($id)
    {
        $tache = Tache::find($id);
        if ($tache) {
            $tache->delete();
            return response()->json(['message' => 'Tâche supprimée']);
        } else {
            return response()->json(['message' => 'Tâche non trouvée'], 404);
        }
    }
    public function getTachesByEvennement($id_evennement)
    {
        $taches = Tache::where('id_evennement', $id_evennement)->get();
        if ($taches) {
            return response()->json($taches);
        } else {
            return response()->json(['message' => 'Aucune tâche trouvée pour cet événement'], 404);
        }
    }
}
