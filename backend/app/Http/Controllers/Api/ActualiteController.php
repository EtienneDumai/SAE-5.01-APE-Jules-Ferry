<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Actualite;
use Illuminate\Http\Request;

class ActualiteController extends Controller
{
    public function index()
    {
        try {
            $actualites = Actualite::where('statut', 'publie')
                ->orderBy('date_publication', 'desc')
                ->get();
            return response()->json($actualites);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        $actualite = Actualite::find($id);
        if ($actualite) {
            return response()->json($actualite);
        } else {
            return response()->json(['message' => 'Actualité non trouvée'], 404);
        }
    }
    public function store(Request $request)
    {
        $actualite = Actualite::create($request->all());
        if ($actualite) {
            return response()->json($actualite, 201);
        } else {
            return response()->json(['message' => 'Erreur lors de la création de l\'actualité'], 500);
        }
    }
    public function update(Request $request, $id)
    {
        $actualite = Actualite::find($id);
        if ($actualite) {
            $actualite->update($request->all());
            return response()->json($actualite);
        } else {
            return response()->json(['message' => 'Actualité non trouvée'], 404);
        }
    }
    public function destroy($id)
    {
        $actualite = Actualite::find($id);
        if ($actualite) {
            $actualite->delete();
            return response()->json(['message' => 'Actualité supprimée']);
        } else {
            return response()->json(['message' => 'Actualité non trouvée'], 404);
        }
    }
}
