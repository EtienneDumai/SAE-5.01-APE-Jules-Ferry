import { Component, inject, OnInit } from '@angular/core';
import { ToastService } from '../../services/Toast/toast.service';
import { TypeErreurToast } from '../../enums/TypeErreurToast/type-erreur-toast';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router'; // RouterLink retiré si inutilisé
import { EvenementService } from '../../services/Evenement/evenement.service';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { FormulaireService } from '../../services/Formulaire/formulaire.service';
import { Formulaire } from '../../models/Formulaire/formulaire';

// On définit des types partiels pour éviter le 'any' lors de la copie
interface TacheData {
  nom_tache: string;
  description?: string;
  heure_debut_globale: string;
  heure_fin_globale: string;
  creneaux?: CreneauData[];
}

interface CreneauData {
  heure_debut: string;
  heure_fin: string;
  quota: number;
}

@Component({
  selector: 'app-evenement-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SpinnerComponent],
  templateUrl: './evenement-edit.component.html',
})
export class EvenementEditComponent implements OnInit {
  imageError: string | null = null;
  selectedImageFile: File | null = null;
  previewImage: string | ArrayBuffer | null = null;

  templates: Formulaire[] = [];

  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly evenementService = inject(EvenementService);
  private readonly formulaireService = inject(FormulaireService);
  private readonly toastService = inject(ToastService);

  evenementForm!: FormGroup;
  loading = true;
  saving = false;
  idEvenement?: number;
  isEditMode = false;
  currentFormulaireId: number | null = null;

  timeRangeValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    const debut = group.get('heure_debut')?.value || group.get('heure_debut_globale')?.value;
    const fin = group.get('heure_fin')?.value || group.get('heure_fin_globale')?.value;

    if (debut && fin && debut >= fin) {
      return { timeRangeInvalid: true };
    }
    return null;
  };

  taskValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    const taskDebut = group.get('heure_debut_globale')?.value;
    const taskFin = group.get('heure_fin_globale')?.value;
    const creneaux = group.get('creneaux') as FormArray;

    if (!taskDebut || !taskFin) return null;

    if (taskDebut >= taskFin) return { timeRangeInvalid: true };

    if (creneaux && creneaux.controls) {
        for (let i = 0; i < creneaux.controls.length; i++) {
            const cDebut = creneaux.at(i).get('heure_debut')?.value;
            const cFin = creneaux.at(i).get('heure_fin')?.value;

            if (cDebut && cFin) {
                if (cDebut < taskDebut || cFin > taskFin) {
                    return { slotOutsideTaskBounds: true };
                }
            }
        }
    }
    return null;
  };

  ngOnInit(): void {
    this.initForm();
    this.loadData();
  }

  private initForm(): void {
    this.evenementForm = this.fb.group(
      {
        titre: ['', [Validators.required, Validators.maxLength(255)]],
        description: ['', [Validators.required]],
        date_evenement: ['', [Validators.required]],
        heure_debut: ['', [Validators.required]],
        heure_fin: ['', [Validators.required]],
        lieu: ['', [Validators.required, Validators.maxLength(255)]],
        image_url: [''],
        select_template_id: [null],
        taches: this.fb.array([]),
      },
      {
        validators: this.timeRangeValidator,
      },
    );

    this.evenementForm
      .get('select_template_id')
      ?.valueChanges.subscribe((id) => {
        // Conversion explicite en number ou null pour éviter les soucis de type
        this.applyTemplate(id ? Number(id) : null);
      });
  }

  get taches(): FormArray {
    return this.evenementForm.get('taches') as FormArray;
  }

  getCreneaux(tacheIndex: number): FormArray {
    return this.taches.at(tacheIndex).get('creneaux') as FormArray;
  }

  addTache(data: TacheData | null = null) {
    const tacheGroup = this.fb.group(
      {
        nom_tache: [data?.nom_tache || '', Validators.required],
        description: [data?.description || ''],
        heure_debut_globale: [
          data?.heure_debut_globale || '',
          Validators.required,
        ],
        heure_fin_globale: [data?.heure_fin_globale || '', Validators.required],
        creneaux: this.fb.array([]),
      },
      {
        validators: this.taskValidator,
      },
    );

    this.taches.push(tacheGroup);

    if (data && data.creneaux) {
      const index = this.taches.length - 1;
      data.creneaux.forEach((c) => this.addCreneau(index, c));
    } else {
      this.addCreneau(this.taches.length - 1);
    }
  }

  removeTache(index: number) {
    this.taches.removeAt(index);
  }

  addCreneau(tacheIndex: number, data: CreneauData | null = null) {
    const creneauxArray = this.getCreneaux(tacheIndex);
    creneauxArray.push(
      this.fb.group(
        {
          heure_debut: [data?.heure_debut || '', Validators.required],
          heure_fin: [data?.heure_fin || '', Validators.required],
          quota: [data?.quota || 1, [Validators.required, Validators.min(1)]],
        },
        {
          validators: this.timeRangeValidator,
        },
      ),
    );
    this.taches.at(tacheIndex).updateValueAndValidity();
  }

  removeCreneau(tacheIndex: number, creneauIndex: number) {
    this.getCreneaux(tacheIndex).removeAt(creneauIndex);
  }

  // Typage strict de l'ID
  applyTemplate(templateId: number | null) {
    this.taches.clear();

    if (!templateId) return;

    const template = this.templates.find((t) => t.id_formulaire == templateId);

    if (template && template.taches) {
      // TypeScript ne sait pas que tes taches modèles correspondent à TacheData
      // On force le typage ici car on sait que la structure JSON est la même
      (template.taches as unknown as TacheData[]).forEach((t) =>
        this.addTache(t),
      );
    }
  }

  loadData() {
    this.formulaireService.getAllFormulaires().subscribe({
      next: (forms: Formulaire[]) => {
        // Filtre strict
        this.templates = forms.filter(
          (f) => f.is_template === true || f.is_template === 1,
        );

        const id = this.route.snapshot.paramMap.get('id');
        if (id && id !== 'new') {
          this.idEvenement = Number(id);
          this.isEditMode = true;
          this.loadEvenement(this.idEvenement);
        } else {
          this.loading = false;
        }
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  loadEvenement(id: number): void {
    this.evenementService.getEvenementById(id).subscribe({
      next: (evenement) => {
        let dateStr = '';
        if (evenement.date_evenement) {
          dateStr = evenement.date_evenement.toString().split('T')[0];
        }

        this.currentFormulaireId = evenement.id_formulaire || null;

        this.evenementForm.patchValue({
          titre: evenement.titre,
          description: evenement.description,
          date_evenement: dateStr,
          heure_debut: evenement.heure_debut,
          heure_fin: evenement.heure_fin,
          lieu: evenement.lieu,
          image_url: evenement.image_url,
          select_template_id: null,
        });

        this.loading = false;
      },
      error: () => {
        alert("Erreur lors du chargement de l'événement");
        this.router.navigate(['/evenements']);
      },
    });
  }

  onImageFileChange(event: Event): void {
    this.imageError = null;
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.selectedImageFile = null;
      this.previewImage = null;
      return;
    }
    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      this.imageError = 'Seuls les fichiers images sont autorisés.';
      return;
    }
    this.selectedImageFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.previewImage = reader.result;
    };
    reader.readAsDataURL(file);
  }

  onSubmit(): void {
    if (this.evenementForm.invalid) {
      this.evenementForm.markAllAsTouched();
      this.toastService.show("Veuillez corriger les erreurs dans le formulaire.", TypeErreurToast.ERROR);
      return;
    }
    
    this.imageError = null;
    this.saving = true;
    const formData = new FormData();
    const val = this.evenementForm.value;

    Object.keys(val).forEach((key) => {
      if (key !== 'taches' && key !== 'select_template_id') {
        formData.append(key, val[key]);
      }
    });

    if (this.selectedImageFile) {
      formData.append('image', this.selectedImageFile);
    }
    
    formData.append('statut', 'publie');
    
    if (!this.isEditMode) {
        formData.append('taches', JSON.stringify(val.taches));
    }

    if (this.isEditMode) {
      formData.append('_method', 'PUT');
      if (this.currentFormulaireId) {
          formData.append('id_formulaire', this.currentFormulaireId.toString());
      } else {
          formData.append('id_formulaire', '');
      }
    }

    const request$ = this.isEditMode && this.idEvenement
        ? this.evenementService.updateEvenement(formData, this.idEvenement)
        : this.evenementService.createEvenement(formData);

    request$.subscribe({
      next: () => {
        this.saving = false;
        this.toastService.showWithTimeout(
          this.isEditMode ? 'Événement modifié avec succès.' : 'Événement créé avec succès.',
          TypeErreurToast.SUCCESS
        );
        this.goBack();
      },
      error: (err) => {
        console.error(err);
        this.saving = false;
        
        let errorMessage = "Une erreur est survenue lors de l'enregistrement.";

        if (err.status === 413) {
            errorMessage = "L'image est trop volumineuse pour le serveur (Poids maximum dépassé).";
            this.imageError = errorMessage;
        }
        else if (err.status === 422 && err.error && err.error.errors) {
            const firstErrorKey = Object.keys(err.error.errors)[0];
            errorMessage = err.error.errors[firstErrorKey][0];
            
            if (firstErrorKey === 'image' || errorMessage.includes('image failed to upload')) {
                errorMessage = "L'image n'a pas pu être téléchargée (Fichier invalide ou trop lourd).";
                this.imageError = errorMessage;
            }
        } 
        else if (err.error && err.error.message) {
            errorMessage = err.error.message;
        }

        this.toastService.show(errorMessage, TypeErreurToast.ERROR);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/evenements']);
  }
}