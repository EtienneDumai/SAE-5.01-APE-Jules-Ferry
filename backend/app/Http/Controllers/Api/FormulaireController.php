<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Formulaire;
use Illuminate\Http\Request;

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
        try {
            $formulaire = Formulaire::with([
                'taches.creneaux' => function($query) {
                    $query->withCount('inscriptions')
                          ->with('inscriptions');
                }
            ])->find($id);

            if (!$formulaire) {
                return response()->json(['message' => 'Formulaire non trouvé'], 404);
            }

            return response()->json($formulaire);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 500);
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
