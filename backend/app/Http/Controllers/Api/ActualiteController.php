<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Actualite;
use App\Services\Image\ImageConverterService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ActualiteController extends Controller
{
    protected $imageConverter;

    public function __construct(ImageConverterService $imageConverter)
    {
        $this->imageConverter = $imageConverter;
    }

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
                $imagePath = $this->processAndStoreImage($request->file('image'));
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
                // Supprimer l'ancienne image si elle existe
                $this->deleteOldImage($actualite->image_url);
                // Traiter la nouvelle
                $actualite->image_url = $this->processAndStoreImage($request->file('image'));
            }

            $actualite->update([
                'titre' => $validatedData['titre'],
                'contenu' => $validatedData['contenu'],
                'date_publication' => $validatedData['date_publication'],
                'statut' => $validatedData['statut'],
                'image_url' => $actualite->image_url
            ]);

            return response()->json($actualite);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $actualite = Actualite::find($id);
            if (!$actualite) {
                return response()->json(['message' => 'Actualité non trouvée'], 404);
            }

            $this->deleteOldImage($actualite->image_url);
            $actualite->delete();

            return response()->json(['message' => 'Actualité supprimée avec succès']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Gère la conversion et le stockage de l'image
     */
    private function processAndStoreImage($file): string
    {
        $fileName = Str::random(20) . '.webp';
        $destinationPath = storage_path('app/public/actualites/' . $fileName);

        // Assurer que le dossier existe
        if (!Storage::disk('public')->exists('actualites')) {
            Storage::disk('public')->makeDirectory('actualites');
        }

        // Conversion en WebP via le service
        $this->imageConverter->convertImageToWebp($file->getRealPath(), $destinationPath, 80);

        return '/storage/actualites/' . $fileName;
    }

    /**
     * Supprime proprement un fichier du storage
     */
    private function deleteOldImage(?string $url): void
    {
        if ($url) {
            $path = str_replace('/storage/', '', $url);
            Storage::disk('public')->delete($path);
        }
    }
}