<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; }
        .button { display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .footer { margin-top: 30px; font-size: 12px; color: #888888; }
    </style>
</head>
<body>
    <div class="container">
        <h2>Bonjour !</h2>
        <p>Vous avez demandé à vous connecter à l'espace de l'<strong>APE Jules Ferry</strong>.</p>
        <p>Cliquez sur le bouton ci-dessous pour accéder directement à votre compte (aucun mot de passe n'est requis).</p>
        
        <a href="{{ $url }}" class="button">Me connecter maintenant</a>
        
        <p><em>Ce lien est valide pendant 2 heures. S'il a expiré, vous pourrez en demander un nouveau sur l'application.</em></p>
        
        <div class="footer">
            <p>Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.</p>
        </div>
    </div>
</body>
</html>