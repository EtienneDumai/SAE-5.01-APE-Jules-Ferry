/**
 * Fichier : frontend/src/app/components/password-confirm-modal/password-confirm-modal.component.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier porte la logique du composant password confirm modal.
 */

import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-password-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './password-confirm-modal.component.html',
  styleUrl: './password-confirm-modal.component.css'
})
export class PasswordConfirmModalComponent {
  @Output() confirmPassword = new EventEmitter<string>();
  @Output() cancelModal = new EventEmitter<void>();

  onConfirm(): void {
    this.confirmPassword.emit('');
  }

  onCancel(): void {
    this.cancelModal.emit();
  }
}
