<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Votre rôle a été mis à jour</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f4; padding: 40px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e0e0e0; max-width: 600px;">
                    <tr>
                        <td align="center" style="padding: 40px 40px 20px 40px;">
                            <h2 style="margin: 0 0 16px 0; font-size: 20px; color: #1a3a5c;">Bonjour {{ $prenom }} !</h2>
                            <p style="margin: 0 0 12px 0; font-size: 15px; color: #444444; line-height: 1.6;">
                                Votre rôle sur l'espace de l'<strong>APE Jules Ferry</strong> a été mis à jour.
                            </p>
                            <p style="margin: 0 0 30px 0; font-size: 15px; color: #444444; line-height: 1.6;">
                                Votre nouveau rôle est : <strong>{{ $nouveauRole }}</strong>
                            </p>
                            <p style="margin: 0; font-size: 15px; color: #444444; line-height: 1.6;">
                                Vous pouvez dès maintenant vous connecter à votre espace avec vos identifiants habituels.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 10px 40px 20px 40px;">
                            <p style="margin: 0; font-size: 12px; color: #aaaaaa; line-height: 1.4;">
                                Si vous pensez que c'est une erreur, contactez un administrateur de l'APE.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>