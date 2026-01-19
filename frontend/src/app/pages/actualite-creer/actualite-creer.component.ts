import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ActualiteService } from '../../services/Actualite/actualite.service';
import { SpinnerComponent } from '../../components/spinner/spinner.component';

@Component({
  selector: 'app-actualite-creer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SpinnerComponent],
  templateUrl: './actualite-creer.component.html',
  styleUrl: './actualite-creer.component.css'
})
export class ActualiteCreerComponent implements OnInit {
  imageError: string | null = null;
  selectedImageFile: File | null = null;

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly actualiteService = inject(ActualiteService);

  actualiteForm!: FormGroup;
  loading = false;
  saving = false;

  ngOnInit(): void {
    this.actualiteForm = this.fb.group({
      titre: ['', [Validators.required, Validators.maxLength(255)]],
      contenu: ['', [Validators.required]],
      date_publication: ['', [Validators.required]],
      statut: ['', [Validators.required]],
      image_url: [''],
    });
  }

  onImageFileChange(event: Event): void {
    this.imageError = null;
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.selectedImageFile = null;
      return;
    }
    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      this.imageError = 'Seuls les fichiers images sont autorisés.';
      this.selectedImageFile = null;
      return;
    }
    this.selectedImageFile = file;
  }

  onSubmit(): void {
    if (this.actualiteForm.invalid) {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.actualiteForm.controls).forEach(key => {
        this.actualiteForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.saving = true;
    const formData = new FormData();
    
    // Ajouter tous les champs du formulaire au FormData
    Object.entries(this.actualiteForm.value).forEach(([key, value]) => {
      if (value !== null && value !== '') {
        formData.append(key, value as string);
      }
    });

    // Ajouter l'image si elle est sélectionnée
    if (this.selectedImageFile) {
      formData.append('image', this.selectedImageFile);
    }

    this.actualiteService.createActualite(formData).subscribe({
      next: (actualite) => {
        alert('Actualité créée avec succès !');
        this.router.navigate(['/actualites', actualite.id_actualite]);
      },
      error: (error) => {
        console.error('Erreur lors de la création de l\'actualité:', error);
        alert('Erreur lors de la création de l\'actualité. Veuillez réessayer.');
        this.saving = false;
      }
    });
  }

  goBack(): void {
    this.location.back();
  }
}
