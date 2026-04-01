/**
 * Fichier : frontend/src/app/components/confirmation-modal/confirmation-modal.component.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier porte la logique du composant confirmation modal.
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmation-modal.component.html'
})
export class ConfirmationModalComponent {
  @Input() title = 'DÉCONNEXION';
  @Input() message = 'Êtes-vous sûr de vouloir quitter votre session ?';
  @Input() confirmLabel = 'Oui, me déconnecter';
  @Input() cancelLabel = 'Annuler';

  @Output() validateAction = new EventEmitter<void>();
  @Output() cancelAction  = new EventEmitter<void>();

  confirmer() {
    this.validateAction.emit();
  }

  annuler() {
    this.cancelAction .emit();
  }
}