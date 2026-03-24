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

<<<<<<< HEAD
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
=======
  onConfirm(): void {
    this.confirmPassword.emit('');
>>>>>>> 7c41a8e253eb75550380da7871174a5e51f03978
  }

  onCancel(): void {
    this.cancelModal.emit();
  }
}
