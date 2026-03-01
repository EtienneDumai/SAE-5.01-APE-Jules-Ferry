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
  @Output() confirm = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();

  password = '';

  onConfirm() {
    if (this.password) {
      this.confirm.emit(this.password);
      this.password = '';
    }
  }

  onCancel() {
    this.cancel.emit();
    this.password = '';
  }
}
