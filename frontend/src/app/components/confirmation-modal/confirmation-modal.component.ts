import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmation-modal.component.html'
})
export class ConfirmationModalComponent {
  @Output() confirmAction = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  confirmer() {
    this.confirmAction.emit();
  }

  annuler() {
    this.cancel.emit();
  }
}