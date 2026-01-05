<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Creneau;
class CreneauController extends Controller
{
    public function index()
    {
        $creneaux = Creneau::all();
        if ($creneaux) {
            return response()->json($creneaux);
        } else {
            return response()->json(['message' => 'Aucun créneau trouvé'], 404);
        }
    }
    public function show($id)
    {
        $creneau = Creneau::find($id);
        if ($creneau) {
            return response()->json($creneau);
        } else {
            return response()->json(['message' => 'Créneau non trouvé'], 404);
        }
    }
    public function store(Request $request)
    {
        $creneau = Creneau::create($request->all());
        if($creneau)
        {
            return response()->json($creneau, 201);
        }
        else {
            return response()->json(['message' => 'Erreur lors de la création du créneau'], 500);
        }
        
    }
    public function update(Request $request, $id)
    {
        $creneau = Creneau::find($id);
        if ($creneau) {
            $creneau->update($request->all());
            return response()->json($creneau);
        } else {
            return response()->json(['message' => 'Créneau non trouvé'], 404);
        }
    }
    public function destroy($id)
    {
        $creneau = Creneau::find($id);
        if ($creneau) {
            $creneau->delete();
            return response()->json(['message' => 'Créneau supprimé']);
        } else {
            return response()->json(['message' => 'Créneau non trouvé'], 404);
        }
    }
}
