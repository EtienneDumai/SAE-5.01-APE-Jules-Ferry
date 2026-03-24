<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Votre lien de connexion</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f4; padding: 40px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e0e0e0; max-width: 600px;">
                    <tr>
                        <td align="center" style="padding: 40px 40px 20px 40px;">
                            <h2 style="margin: 0 0 16px 0; font-size: 20px; color: #1a3a5c;">Bonjour !</h2>
                            <p style="margin: 0 0 12px 0; font-size: 15px; color: #444444; line-height: 1.6;">
                                Vous avez demandé à vous connecter à l'espace de l'<strong>APE Jules Ferry</strong>.
                            </p>
                            <p style="margin: 0 0 30px 0; font-size: 15px; color: #444444; line-height: 1.6;">
                                Cliquez sur le bouton ci-dessous pour accéder directement à votre compte.<br>
                                <em>Aucun mot de passe n'est requis.</em>
                            </p>
                            <a href="{{ $url }}"
                               style="display: inline-block; padding: 14px 32px; background-color: #4CAF50; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold;">
                                Me connecter maintenant
                            </a>
                            <p style="margin: 20px 0 0 0; font-size: 13px; color: #888888; font-style: italic; line-height: 1.6;">
                                Ce lien est valide pendant <strong>2 heures</strong>.
                                S'il a expiré, vous pourrez en demander un nouveau sur l'application.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 10px 40px 20px 40px;">
                            <p style="margin: 0; font-size: 12px; color: #aaaaaa; line-height: 1.4;">
                                Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>