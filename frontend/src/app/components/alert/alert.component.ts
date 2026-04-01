/**
 * Fichier : frontend/src/app/components/alert/alert.component.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier porte la logique du composant alert.
 */

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