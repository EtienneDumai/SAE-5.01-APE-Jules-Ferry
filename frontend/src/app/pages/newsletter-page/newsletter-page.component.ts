import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NewsletterService } from '../../services/Newsletter/newsletter.service';
import { ToastService } from '../../services/Toast/toast.service';
import { TypeErreurToast } from '../../enums/TypeErreurToast/type-erreur-toast';

@Component({
  selector: 'app-newsletter-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './newsletter-page.component.html',
  styleUrls: ['./newsletter-page.component.css']
})
export class NewsletterPageComponent {
  private readonly newsletterService = inject(NewsletterService);
  private readonly toastService = inject(ToastService);
  
  emailNewsletter: string = '';
  rgpdAccepted: boolean = false;

  /**
   * Méthode appelée pendant de la soumission du formulaire
   */
  onSubscribe(): void {
    if (!this.rgpdAccepted) {
      this.toastService.show("Veuillez accepter le traitement de vos données.", TypeErreurToast.ERROR);
      return;
    }

    if (!this.emailNewsletter || !this.emailNewsletter.includes('@')) {
      this.toastService.show("Veuillez saisir un email valide.", TypeErreurToast.ERROR);
      return;
    }

    // Appel au service API
    this.newsletterService.subscribe({ email: this.emailNewsletter }).subscribe({
      next: (response) => {
        this.toastService.show(response.message, TypeErreurToast.SUCCESS);
        this.emailNewsletter = ''; 
        this.rgpdAccepted = false;
      },
      error: (err) => {
        const msg = err.error?.errors?.email?.[0] || "Erreur lors de l'inscription.";
        this.toastService.show(msg, TypeErreurToast.ERROR);
      }
    });
  }
}