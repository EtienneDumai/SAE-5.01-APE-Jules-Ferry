<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AbonneNewsletter;
use App\Models\Utilisateur;
use App\Services\NewsletterService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class NewsletterController extends Controller
{
    protected NewsletterService $newsletterService;

    public function __construct(NewsletterService $newsletterService)
    {
        $this->newsletterService = $newsletterService;
    }

    public function store(Request $request)
    {
        $validator = $this->makeEmailValidator($request->all());

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $this->newsletterService->inscrire($request->email);

        return response()->json(['message' => 'Merci ! Ton inscription est bien prise en compte.'], 201);
    }

    public function storeAdmin(Request $request): JsonResponse
    {
        if ($response = $this->ensureAdmin($request)) {
            return $response;
        }

        $validator = $this->makeEmailValidator($request->all());

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $this->newsletterService->inscrire($request->email);

        return response()->json(['message' => 'Adresse email ajoutée à la newsletter.'], 201);
    }

    public function index(Request $request): JsonResponse
    {
        if ($response = $this->ensureAdmin($request)) {
            return $response;
        }

        $abonnes = AbonneNewsletter::query()
            ->orderByDesc('created_at')
            ->get();

        return response()->json($abonnes);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        if ($response = $this->ensureAdmin($request)) {
            return $response;
        }

        $abonne = AbonneNewsletter::find($id);

        if (!$abonne) {
            return response()->json(['message' => 'Abonné introuvable'], 404);
        }

        $abonne->delete();

        return response()->json(['message' => 'Abonné supprimé avec succès']);
    }

    private function ensureAdmin(Request $request): ?JsonResponse
    {
        /** @var Utilisateur|null $user */
        $user = $request->user();

        if (!$user || $user->role !== 'administrateur') {
            return response()->json(['message' => 'Accés réservé aux administrateurs'], 403);
        }

        return null;
    }

    private function makeEmailValidator(array $data)
    {
        return Validator::make($data, [
            'email' => 'required|email|unique:abonnes_newsletter,email'
        ], [
            'email.required' => 'L\'adresse email est obligatoire.',
            'email.email' => 'Le format de l\'email n\'est pas valide.',
            'email.unique' => 'Cet email est déjà inscrit à notre newsletter !',
        ]);
    }
}
