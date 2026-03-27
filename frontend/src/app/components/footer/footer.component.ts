/**
 * Fichier : frontend/src/app/components/footer/footer.component.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier porte la logique du composant footer.
 */

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { RoleUtilisateur } from '../../enums/RoleUtilisateur/role-utilisateur';
import { UtilisateurService } from '../../services/Utilisateur/utilisateur.service';
import { Utilisateur } from '../../models/Utilisateur/utilisateur';
import { Observable } from 'rxjs';
import { NewsletterService } from '../../services/Newsletter/newsletter.service';
import { ToastService } from '../../services/Toast/toast.service';
import { TypeErreurToast } from '../../enums/TypeErreurToast/type-erreur-toast';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent implements OnInit {
  utilisateurCourant!: Observable<Utilisateur | null>;
  roleUtilisateur = RoleUtilisateur;

  utilisateurService = inject(UtilisateurService);
  private readonly newsletterService = inject(NewsletterService);
  private readonly toastService = inject(ToastService);

  emailNewsletter = "";
  rgpdAccepted = false;
  isSubmitting = false;

  ngOnInit() {
    this.utilisateurCourant = this.utilisateurService.utilisateurCourant;
  }

  setUtilisateur(utilisateur: Utilisateur | null) {
    this.utilisateurService.setUtilisateurCourant(utilisateur);
  }

  onSubscribe(): void {
    if (!this.rgpdAccepted) {
      this.toastService.showWithTimeout("Veuillez accepter le traitement de vos données.", TypeErreurToast.ERROR);
      return;
    }

    if (!this.emailNewsletter || !this.emailNewsletter.includes('@')) {
      this.toastService.showWithTimeout("Veuillez saisir un email valide.", TypeErreurToast.ERROR);
      return;
    }

    this.isSubmitting = true;

    this.newsletterService.subscribe({ email: this.emailNewsletter }).subscribe({
      next: (response) => {
        this.toastService.showWithTimeout(response.message, TypeErreurToast.SUCCESS);
        this.emailNewsletter = ""; 
        this.rgpdAccepted = false;
        this.isSubmitting = false;
      },
      error: (err) => {
        let msg = "Erreur lors de l'inscription.";

        if (err.status === 422 && err.error?.errors?.email) {
          msg = err.error.errors.email[0];
        } else if (err.error?.message) {
          msg = err.error.message;
        }

        this.toastService.showWithTimeout(msg, TypeErreurToast.ERROR);
        this.isSubmitting = false;
      }
    });
  }
}