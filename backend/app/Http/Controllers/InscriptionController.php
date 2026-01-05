<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Inscription;
class InscriptionController extends Controller
{
    public function index()
    {
        $inscriptions = Inscription::all();
        if ($inscriptions) {
            return response()->json($inscriptions);
        } else {
            return response()->json(['message' => 'Aucune inscription trouvée'], 404);
        }
    }
    public function show($id)
    {
        $inscription = Inscription::find($id);
        if ($inscription) {
            return response()->json($inscription);
        } else {
            return response()->json(['message' => 'Inscription non trouvée'], 404);
        }
    }
    public function store(Request $request)
    {
        $inscription = Inscription::create($request->all());
        if($inscription)
        {
            return response()->json($inscription, 201);
        }
        else {
            return response()->json(['message' => 'Erreur lors de la création de l\'inscription'], 500);
        }
    }
    public function update(Request $request, $id)
    {
        $inscription = Inscription::find($id);
        if ($inscription) {
            $inscription->update($request->all());
            return response()->json($inscription);
        } else {
            return response()->json(['message' => 'Inscription non trouvée'], 404);
        }
    }
    public function destroy($id)
    {
        $inscription = Inscription::find($id);
        if ($inscription) {
            $inscription->delete();
            return response()->json(['message' => 'Inscription supprimée']);
        } else {
            return response()->json(['message' => 'Inscription non trouvée'], 404);
        }
    }
}
