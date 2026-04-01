/**
 * Fichier : frontend/src/app/components/forms/form-inscription-evenement/form-inscription-evenement.component.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier porte la logique du composant form inscription evenement.
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Formulaire } from '../../../models/Formulaire/formulaire';
import { Creneau } from '../../../models/Creneau/creneau';
import { SpinnerComponent } from "../../spinner/spinner.component";
import { FormsModule } from '@angular/forms';

export interface InscriptionSubmitPayload {
  creneauxSelectionnes: number[];
  commentaire: string;
}
@Component({
  selector: 'app-form-inscription-evenement',
  standalone: true,
  imports: [SpinnerComponent, FormsModule],
  templateUrl: './form-inscription-evenement.component.html',
  styleUrl: './form-inscription-evenement.component.css'
})
export class FormInscriptionEvenementComponent {
  @Input({ required: true }) mesCreneauxActuels: Creneau[] = [];
  @Input({ required: true }) formulaire!: Formulaire;
  @Input() loadingFormulaire = false;
  @Input() errorFormulaire = false;

  @Input() isSubmitting = false;
  @Input() inscriptionSuccess = false;
  @Input() inscriptionError: string | null = null;

  @Input() isCreneauComplet!: (c: Creneau) => boolean;
  @Input() getPlacesRestantes!: (c: Creneau) => number;

  @Output() formSubmitted = new EventEmitter<InscriptionSubmitPayload>();
  @Output() formCancelled = new EventEmitter<void>();

  commentaire = '';

  onCancel() {
    this.formCancelled.emit();
  }

  onSubmit() {
    const creneauxSelectionnes: number[] = [];
    for (const tache of this.formulaire?.taches ?? []) {
      for (const c of tache.creneaux ?? []) {
        if (c.selected) creneauxSelectionnes.push(c.id_creneau);
      }
    }
    this.formSubmitted.emit({
      creneauxSelectionnes,
      commentaire: this.commentaire
    });
  }

  /**
   * Permet de vérifier si un créneau sélectionné chevauche un autre créneau déjà sélectionné
   * @param creneau 
   * @returns True si le créneau chevauche un autre créneau sélectionné sinon false
   */
  isOverlapping(creneau: Creneau): boolean {
    if (creneau.selected) return false;

    // Récupérer tous les créneaux sélectionnés
    const selectedCreneaux: Creneau[] = [];
    for (const tache of this.formulaire?.taches ?? []) {
      for (const c of tache.creneaux ?? []) {
        if (c.selected && c.id_creneau !== creneau.id_creneau) {
          selectedCreneaux.push(c);
        }
      }
    }

    const start = this.timeToMinutes(creneau.heure_debut);
    const end = this.timeToMinutes(creneau.heure_fin);

    return selectedCreneaux.some(selected => {
      const sStart = this.timeToMinutes(selected.heure_debut);
      const sEnd = this.timeToMinutes(selected.heure_fin);
      return Math.max(start, sStart) < Math.min(end, sEnd);
    });
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
}