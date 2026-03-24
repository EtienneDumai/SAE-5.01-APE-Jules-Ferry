import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-password-confirm-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './password-confirm-modal.component.html',
  styleUrl: './password-confirm-modal.component.css'
})
export class PasswordConfirmModalComponent {
  @Output() confirmPassword = new EventEmitter<string>();
  @Output() cancelModal = new EventEmitter<void>();


  password = '';
  showPassword = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onConfirm() {
    if (this.password) {
      this.confirmPassword.emit(this.password);
      this.password = '';
    }

  }

  onCancel(): void {
    this.cancelModal.emit();
  }
}
