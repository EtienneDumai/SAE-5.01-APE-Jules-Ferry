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