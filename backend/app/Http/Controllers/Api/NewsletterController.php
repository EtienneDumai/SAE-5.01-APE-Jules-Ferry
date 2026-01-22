<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Services\NewsletterService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class NewsletterController extends Controller
{
    protected $newsletterService;

    public function __construct(NewsletterService $newsletterService)
    {
        $this->newsletterService = $newsletterService;
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|unique:abonnes_newsletter,email'
        ], [
            'email.required' => 'L\'adresse email est obligatoire.',
            'email.email'    => 'Le format de l\'email n\'est pas valide.',
            'email.unique'   => 'Cet email est déjà inscrit à notre newsletter !',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $this->newsletterService->inscrire($request->email);

        return response()->json(['message' => 'Merci ! Ton inscription est bien prise en compte.'], 201);
    }
}