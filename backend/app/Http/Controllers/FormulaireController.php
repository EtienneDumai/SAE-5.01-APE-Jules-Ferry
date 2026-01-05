<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Formulaire;
class FormulaireController extends Controller
{
    public function index()
    {
        $formulaires = Formulaire::all();
        if ($formulaires) {
            return response()->json($formulaires);
        } else {
            return response()->json(['message' => 'Aucun formulaire trouvé'], 404);
        }
    }
    public function show($id)
    {
        $formulaire = Formulaire::find($id);
        if ($formulaire) {
            return response()->json($formulaire);
        } else {
            return response()->json(['message' => 'Formulaire non trouvé'], 404);
        }
    }
    public function store(Request $request)
    {
        $formulaire = Formulaire::create($request->all());
        if($formulaire)
        {
            return response()->json($formulaire, 201);
        }
        else {
            return response()->json(['message' => 'Erreur lors de la création du formulaire'], 500);
        }
    }
    public function update(Request $request, $id)
    {
        $formulaire = Formulaire::find($id);
        if ($formulaire) {
            $formulaire->update($request->all());
            return response()->json($formulaire);
        } else {
            return response()->json(['message' => 'Formulaire non trouvé'], 404);
        }
    }
    public function destroy($id)
    {
        $formulaire = Formulaire::find($id);
        if ($formulaire) {
            $formulaire->delete();
            return response()->json(['message' => 'Formulaire supprimé avec succès']);
        } else {
            return response()->json(['message' => 'Formulaire non trouvé'], 404);
        }
    }
}
