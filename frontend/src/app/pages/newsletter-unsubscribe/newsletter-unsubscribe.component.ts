import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NewsletterService } from '../../services/Newsletter/newsletter.service';

@Component({
  selector: 'app-newsletter-unsubscribe',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './newsletter-unsubscribe.component.html',
})
export class NewsletterUnsubscribeComponent {
  private readonly newsletterService = inject(NewsletterService);
  
  email = '';
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  desinscrire(): void {
    if (!this.email) return;
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.newsletterService.unsubscribe(this.email).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMessage = res.message; 
        this.email = '';
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Une erreur est survenue lors de la désinscription.';
      }
    });
  }
}