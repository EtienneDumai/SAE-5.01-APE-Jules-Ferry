/**
 * Fichier : frontend/src/app/components/formulaire-edit/formulaire-edit.component.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier porte la logique du composant formulaire edit.
 */

import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TypeErreurToast } from '../../enums/TypeErreurToast/type-erreur-toast';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { FormulaireService } from '../../services/Formulaire/formulaire.service';
import { ToastService } from '../../services/Toast/toast.service';

interface ValidationError {
  contexte?: string;
  message: string;
}

@Component({
  selector: 'app-formulaire-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SpinnerComponent],
  templateUrl: './formulaire-edit.component.html',
  styleUrl: './formulaire-edit.component.css'
})
export class FormulaireEditComponent implements OnInit {
  mainForm!: FormGroup;
  loading = true;
  saving = false;
  isEditMode = false;
  idFormulaire?: number;

  validationErrors: ValidationError[] = [];
  apiError: string | null = null;
  readonly statutsFormulaire = [
    { value: 'actif', label: 'Actif' },
    { value: 'archive', label: 'Archivé' }
  ];

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private formulaireService = inject(FormulaireService);
  private toastService = inject(ToastService);

  ngOnInit() {
    this.initForm();
    const id = this.route.snapshot.paramMap.get('id');

    if (this.router.url.includes('/admin/formulaires')) {
      this.mainForm.patchValue({ is_template: true });
    }

    if (id && id !== 'new') {
      this.isEditMode = true;
      this.idFormulaire = Number(id);
      this.loadFormulaire(this.idFormulaire);
    } else {
      this.addTache();
      this.loading = false;
    }
  }

  initForm() {
    this.mainForm = this.fb.group({
      nom_formulaire: ['', [Validators.required, Validators.maxLength(255)]],
      description: [''],
      statut: ['actif'],
      is_template: [false],
      taches: this.fb.array([])
    });
  }

  get taches(): FormArray {
    return this.mainForm.get('taches') as FormArray;
  }

  newTache(): FormGroup {
    return this.fb.group({
      id_tache: [null],
      nom_tache: ['', Validators.required],
      description: [''],
      heure_debut_globale: ['', Validators.required],
      heure_fin_globale: ['', Validators.required],
      creneaux: this.fb.array([])
    });
  }

  addTache() {
    const tacheGroup = this.newTache();
    (tacheGroup.get('creneaux') as FormArray).push(this.newCreneau());
    this.taches.push(tacheGroup);
  }

  removeTache(index: number) {
    if (confirm('Supprimer cette tâche ?')) {
      this.taches.removeAt(index);
      this.toastService.showWithTimeout('Tâche supprimée avec succès.', TypeErreurToast.SUCCESS);
    }
  }

  getCreneaux(tacheIndex: number): FormArray {
    return this.taches.at(tacheIndex).get('creneaux') as FormArray;
  }

  newCreneau(): FormGroup {
    return this.fb.group({
      id_creneau: [null],
      heure_debut: ['', Validators.required],
      heure_fin: ['', Validators.required],
      quota: [1, [Validators.required, Validators.min(1)]]
    });
  }

  addCreneau(tacheIndex: number) {
    this.getCreneaux(tacheIndex).push(this.newCreneau());
  }

  removeCreneau(tacheIndex: number, creneauIndex: number) {
    this.getCreneaux(tacheIndex).removeAt(creneauIndex);
  }

  loadFormulaire(id: number) {
    this.formulaireService.getFormulaireById(id).subscribe({
      next: (data) => {
        this.mainForm.patchValue({
          nom_formulaire: data.nom_formulaire,
          description: data.description,
          statut: data.statut,
          is_template: data.is_template
        });

        this.taches.clear();
        if (data.taches) {
          data.taches.forEach(tache => {
            const tacheGroup = this.newTache();
            tacheGroup.patchValue({
              id_tache: tache.id_tache,
              nom_tache: tache.nom_tache,
              description: tache.description,
              heure_debut_globale: tache.heure_debut_globale,
              heure_fin_globale: tache.heure_fin_globale
            });

            const creneauxArray = tacheGroup.get('creneaux') as FormArray;
            if (tache.creneaux) {
              tache.creneaux.forEach(creneau => {
                const creneauGroup = this.newCreneau();
                creneauGroup.patchValue(creneau);
                creneauxArray.push(creneauGroup);
              });
            }
            this.taches.push(tacheGroup);
          });
        }
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.apiError = 'Erreur chargement formulaire';
        this.loading = false;
      }
    });
  }

  onSubmit() {
    this.validationErrors = [];
    this.apiError = null;

    if (this.mainForm.invalid) {
      this.validationErrors.push({ message: 'Veuillez remplir tous les champs obligatoires.' });
      return;
    }

    const erreursLogiques = this.validerLogique();
    if (erreursLogiques.length > 0) {
      this.validationErrors = erreursLogiques;
      window.scrollTo(0, 0);
      return;
    }

    this.saving = true;
    const request$ = this.isEditMode && this.idFormulaire
      ? this.formulaireService.updateFormulaire(this.mainForm.value, this.idFormulaire)
      : this.formulaireService.createFormulaire(this.mainForm.value);

    request$.subscribe({
      next: () => {
        this.saving = false;
        this.goBack();
      },
      error: (err) => {
        console.error(err);
        this.saving = false;
        this.apiError = 'Erreur technique lors de la sauvegarde.';
      }
    });
  }

  validerLogique(): ValidationError[] {
    const erreurs: ValidationError[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const taches = this.mainForm.value.taches as any[];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    taches.forEach((tache: any, index: number) => {
      const nom = tache.nom_tache || `Tâche ${index + 1}`;
      const debut = tache.heure_debut_globale;
      const fin = tache.heure_fin_globale;

      if (debut && fin && debut >= fin) {
        erreurs.push({ contexte: nom, message: `Fin (${fin}) doit être après Début (${debut}).` });
      }

      if (tache.creneaux) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tache.creneaux.forEach((c: any, j: number) => {
          const contexteCreneau = `${nom} - Créneau ${j + 1}`;
          if (c.heure_debut && c.heure_fin && c.heure_debut >= c.heure_fin) {
            erreurs.push({ contexte: contexteCreneau, message: 'Fin créneau avant début.' });
          }
          if (debut && c.heure_debut < debut) {
            erreurs.push({ contexte: contexteCreneau, message: 'Commence avant la tâche.' });
          }
          if (fin && c.heure_fin > fin) {
            erreurs.push({ contexte: contexteCreneau, message: 'Finit après la tâche.' });
          }
        });
      }
    });

    return erreurs;
  }

  goBack() {
    window.history.back();
  }
}
