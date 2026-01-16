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
        {
          if (c.selected) creneauxSelectionnes.push(c.id_creneau);
        }
      }
    }
    this.formSubmitted.emit({
      creneauxSelectionnes,
      commentaire: this.commentaire
    });
  }
}