import { Component, inject, OnInit } from '@angular/core';
import { ToastService } from '../../services/Toast/toast.service';
import { TypeErreurToast } from '../../enums/TypeErreurToast/type-erreur-toast';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EvenementService } from '../../services/Evenement/evenement.service';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { FormulaireService } from '../../services/Formulaire/formulaire.service';
import { Formulaire } from '../../models/Formulaire/formulaire';

@Component({
  selector: 'app-evenement-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SpinnerComponent, RouterLink],
  templateUrl: './evenement-edit.component.html',
})
export class EvenementEditComponent implements OnInit {
  imageError: string | null = null;
  selectedImageFile: File | null = null;
  previewImage: string | ArrayBuffer | null = null;

  formulaires: Formulaire[] = [];
  selectedFormulaire: Formulaire | null = null;

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

  ngOnInit(): void {
    this.evenementForm = this.fb.group({
      titre: ['', [Validators.required, Validators.maxLength(255)]],
      description: ['', [Validators.required]],
      date_evenement: ['', [Validators.required]],
      heure_debut: ['', [Validators.required]],
      heure_fin: ['', [Validators.required]],
      lieu: ['', [Validators.required, Validators.maxLength(255)]],
      image_url: [''],
      id_formulaire: [null] 
    }, { 
      validators: this.timeRangeValidator 
    });

    this.evenementForm.get('id_formulaire')?.valueChanges.subscribe(() => {
        this.onFormulaireChange(null); 
    });

    this.loadData();
  }

  // verif erreurs des heures
  timeRangeValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    const debut = group.get('heure_debut')?.value;
    const fin = group.get('heure_fin')?.value;
    if (debut && fin && debut >= fin) {
      return { timeRangeInvalid: true };
    }
    return null;
  };

  loadData() {
    this.formulaireService.getAllFormulaires().subscribe({
        next: (forms: Formulaire[]) => {
            this.formulaires = forms;
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
            console.error('Erreur chargement formulaires');
            this.loading = false;
        }
    });
  }

  loadEvenement(id: number): void {
    this.evenementService.getEvenementById(id).subscribe({
      next: (evenement) => {
        let dateStr = '';
        if (evenement.date_evenement) {
             dateStr = evenement.date_evenement.toString().split('T')[0];
        }

        this.evenementForm.patchValue({
          titre: evenement.titre,
          description: evenement.description,
          date_evenement: dateStr,
          heure_debut: evenement.heure_debut,
          heure_fin: evenement.heure_fin,
          lieu: evenement.lieu,
          image_url: evenement.image_url,
          id_formulaire: evenement.id_formulaire || null 
        });

        this.onFormulaireChange(null);
        this.loading = false;
      },
      error: () => {
        alert('Erreur lors du chargement de l\'événement');
        this.router.navigate(['/evenements']);
      }
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  onFormulaireChange(event: any = null): void {
    const formId = this.evenementForm.get('id_formulaire')?.value;
    if (formId && formId != 'null') {
      this.selectedFormulaire = this.formulaires.find(f => f.id_formulaire == formId) || null;
    } else {
      this.selectedFormulaire = null;
    }
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
      this.selectedImageFile = null;
      this.previewImage = null;
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
    if (this.evenementForm.invalid) return;
    this.saving = true;
    const formData = new FormData();
    
    Object.entries(this.evenementForm.value).forEach(([key, value]) => {
      if (key === 'id_formulaire') return;
      formData.append(key, value as string);
    });

    formData.append('statut', 'publie');

    if (this.selectedImageFile) {
      formData.append('image', this.selectedImageFile);
    }

    const formId = this.evenementForm.get('id_formulaire')?.value;
    if(formId && formId != 'null') {
        formData.append('id_formulaire', formId);
    } else {
        formData.append('id_formulaire', ''); 
    }

    if (this.isEditMode) {
        formData.append('_method', 'PUT');
    }

    const request$ = (this.isEditMode && this.idEvenement)
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
        alert('Erreur lors de l\'enregistrement');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/evenements']);
  }
}