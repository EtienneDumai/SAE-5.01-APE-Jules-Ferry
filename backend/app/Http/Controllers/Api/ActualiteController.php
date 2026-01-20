<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Actualite;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

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
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        try {
            $actualite = Actualite::find($id);
            if (!$actualite) {
                return response()->json(['message' => 'Actualité non trouvée'], 404);
            }
            return response()->json($actualite);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'titre' => 'required|string|max:255',
                'contenu' => 'required|string',
                'date_publication' => 'required|date',
                'statut' => 'required|in:brouillon,publie,archive',
                'image' => 'nullable|image|max:2048',
                'id_auteur' => 'nullable|integer'
            ]);

            $imagePath = null;
            if ($request->hasFile('image')) {
                $path = $request->file('image')->store('actualites', 'public');
                $imagePath = '/storage/' . $path;
            }

            $actualite = Actualite::create([
                'titre' => $validatedData['titre'],
                'contenu' => $validatedData['contenu'],
                'date_publication' => $validatedData['date_publication'],
                'statut' => $validatedData['statut'],
                'image_url' => $imagePath,
                'id_auteur' => $validatedData['id_auteur'] ?? 1
            ]);

            return response()->json($actualite, 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $actualite = Actualite::find($id);
            if (!$actualite) {
                return response()->json(['message' => 'Actualité non trouvée'], 404);
            }

            $validatedData = $request->validate([
                'titre' => 'required|string|max:255',
                'contenu' => 'required|string',
                'date_publication' => 'required|date',
                'statut' => 'required|in:brouillon,publie,archive',
                'image' => 'nullable|image|max:2048',
            ]);

            if ($request->hasFile('image')) {
                if ($actualite->image_url) {
                    $oldPath = str_replace('/storage/', '', $actualite->image_url);
                    Storage::disk('public')->delete($oldPath);
                }

                $path = $request->file('image')->store('actualites', 'public');
                $actualite->image_url = '/storage/' . $path;
            }

            $actualite->update([
                'titre' => $validatedData['titre'],
                'contenu' => $validatedData['contenu'],
                'date_publication' => $validatedData['date_publication'],
                'statut' => $validatedData['statut'],
            ]);

            if ($request->hasFile('image')) {
                $actualite->save();
            }

            return response()->json($actualite);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $actualite = Actualite::find($id);
            if ($actualite) {
                if ($actualite->image_url) {
                    $oldPath = str_replace('/storage/', '', $actualite->image_url);
                    Storage::disk('public')->delete($oldPath);
                }
                
                $actualite->delete();
                return response()->json(['message' => 'Actualité supprimée avec succès']);
            }
            return response()->json(['message' => 'Actualité non trouvée'], 404);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}