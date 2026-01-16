import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.css'
})
export class AlertComponent {
  @Input() message = 'Voulez-vous continuer ?';
  @Input() texteBoutonValider = 'Valider';
  @Input() texteBoutonAnnuler = 'Annuler';

  @Output() valider = new EventEmitter<void>();
  @Output() annuler = new EventEmitter<void>();

  onValider() {
    this.valider.emit();
  }

  onAnnuler() {
    this.annuler.emit();
  }
}