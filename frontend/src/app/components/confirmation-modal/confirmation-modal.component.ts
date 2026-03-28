/**
 * Fichier : frontend/src/app/components/confirmation-modal/confirmation-modal.component.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier porte la logique du composant confirmation modal.
 */

import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmation-modal.component.html'
})
export class ConfirmationModalComponent {
  @Output() validateAction = new EventEmitter<void>();
  @Output() cancelAction  = new EventEmitter<void>();

  confirmer() {
    this.validateAction.emit();
  }

  annuler() {
    this.cancelAction .emit();
  }
}