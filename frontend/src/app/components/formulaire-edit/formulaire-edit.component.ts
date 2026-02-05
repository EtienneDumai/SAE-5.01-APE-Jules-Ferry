import { Component, inject, OnInit } from '@angular/core';
import { ToastService } from '../../services/Toast/toast.service';
import { TypeErreurToast } from '../../enums/TypeErreurToast/type-erreur-toast';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormulaireService } from '../../services/Formulaire/formulaire.service';
import { SpinnerComponent } from '../../components/spinner/spinner.component';

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

  validationErrors: string[] = [];
  apiError: string | null = null;

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private formulaireService = inject(FormulaireService);
  private toastService = inject(ToastService);

  ngOnInit() {
    this.initForm();
    const id = this.route.snapshot.paramMap.get('id');
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
          statut: data.statut
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
        this.apiError = "Erreur chargement formulaire";
        this.loading = false;
      }
    });
  }

  onSubmit() {
    this.validationErrors = [];
    this.apiError = null;

    if (this.mainForm.invalid) {
        this.validationErrors.push("Veuillez remplir tous les champs obligatoires.");
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
        this.apiError = "Erreur technique lors de la sauvegarde.";
      }
    });
  }

  validerLogique(): string[] {
    const erreurs: string[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const taches = this.mainForm.value.taches as any[];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    taches.forEach((tache: any, index: number) => {
        const nom = tache.nom_tache || `Tâche ${index + 1}`;
        const debut = tache.heure_debut_globale; 
        const fin = tache.heure_fin_globale;

        if (debut && fin && debut >= fin) {
            erreurs.push(`[${nom}] Fin (${fin}) doit être après Début (${debut}).`);
        }

        if (tache.creneaux) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            tache.creneaux.forEach((c: any, j: number) => {
                if (c.heure_debut && c.heure_fin && c.heure_debut >= c.heure_fin) {
                    erreurs.push(`[${nom} - Créneau ${j+1}] Fin créneau avant début.`);
                }
                if (debut && c.heure_debut < debut) {
                    erreurs.push(`[${nom} - Créneau ${j+1}] Commence avant la tâche.`);
                }
                if (fin && c.heure_fin > fin) {
                    erreurs.push(`[${nom} - Créneau ${j+1}] Finit après la tâche.`);
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