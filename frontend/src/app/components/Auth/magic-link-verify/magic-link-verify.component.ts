/**
 * Fichier : frontend/src/app/components/Auth/magic-link-verify/magic-link-verify.component.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier porte la logique du composant magic link verify.
 */

import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/Auth/auth.service';

@Component({
  selector: 'app-magic-link-verify',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './magic-link-verify.component.html'
})
export class MagicLinkVerifyComponent implements OnInit {
  message = 'Vérification de votre lien magique en cours...';
  erreur = false;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const targetUrl = params['cible'];

      if (targetUrl) {
        this.verifierLien(targetUrl);
      } else {
        this.erreur = true;
        this.message = "Aucun lien à vérifier. Veuillez refaire une demande.";
      }
    });
  }

  verifierLien(url: string) {
    this.authService.verifyMagicLink(url).subscribe({
      next: () => {
        this.message = "Connexion réussie ! Redirection en cours...";
        
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1500); 
      },
      error: () => {
        this.erreur = true;
        this.message = "Le lien est invalide ou a expiré (plus de 2 heures).";
      }
    });
  }
}