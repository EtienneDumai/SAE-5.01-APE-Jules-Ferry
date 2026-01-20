import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ActualiteService } from '../../services/Actualite/actualite.service';
import { AuthService } from '../../services/Auth/auth.service';
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
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly actualiteService = inject(ActualiteService);
  private readonly authService = inject(AuthService);

  actualiteForm!: FormGroup;
  loading = false;
  saving = false;
  isEditMode = false;
  idActualite?: number;
  currentImageUrl?: string;

  ngOnInit(): void {
    const TODAY = new Date().toISOString().split('T')[0];
    const CURRENT_USER = this.authService.getCurrentUser();
    
    this.actualiteForm = this.fb.group({
      titre: ['', [Validators.required, Validators.maxLength(255)]],
      contenu: ['', [Validators.required]],
      date_publication: [TODAY, [Validators.required]],
      statut: ['publie', [Validators.required]],
      image_url: [''],
      id_auteur: [CURRENT_USER?.id_utilisateur || null, [Validators.required]],
    });

    const ID = this.route.snapshot.paramMap.get('id');
    if (ID) {
      this.idActualite = Number(ID);
      this.isEditMode = true;
      this.loadActualite(this.idActualite);
    }
  }

  loadActualite(ID: number): void {
    this.loading = true;
    this.actualiteService.getActualiteById(ID).subscribe({
      next: (actualite) => {
        this.currentImageUrl = actualite.image_url;
        const dateStr = new Date(actualite.date_publication).toISOString().split('T')[0];
        this.actualiteForm.patchValue({
          titre: actualite.titre,
          contenu: actualite.contenu,
          date_publication: dateStr,
          statut: actualite.statut,
          image_url: actualite.image_url,
          id_auteur: actualite.id_auteur
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'actualité:', error);
        alert('Erreur lors du chargement de l\'actualité');
        this.router.navigate(['/actualites']);
      }
    });
  }

  onImageFileChange(event: Event): void {
    this.imageError = null;
    const INPUT = event.target as HTMLInputElement;
    if (!INPUT.files || INPUT.files.length === 0) {
      this.selectedImageFile = null;
      return;
    }
    const FILE = INPUT.files[0];
    if (!FILE.type.startsWith('image/')) {
      this.imageError = 'Seuls les fichiers images sont autorisés.';
      this.selectedImageFile = null;
      return;
    }
    this.selectedImageFile = FILE;
  }

  onSubmit(): void {
    if (this.actualiteForm.invalid) {
      Object.keys(this.actualiteForm.controls).forEach(key => {
        this.actualiteForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.saving = true;
    const FORM_DATA = new FormData();
    
    Object.entries(this.actualiteForm.value).forEach(([key, value]) => {
      if (value !== null && value !== '') {
        FORM_DATA.append(key, value as string);
      }
    });

    if (this.selectedImageFile) {
      FORM_DATA.append('image', this.selectedImageFile);
    }

    const REQUEST = this.isEditMode && this.idActualite
      ? this.actualiteService.updateActualite(FORM_DATA, this.idActualite)
      : this.actualiteService.createActualite(FORM_DATA);

    REQUEST.subscribe({
      next: () => {
        this.router.navigate(['/actualites']);
      },
      error: (error) => {
        console.error('Erreur lors de la sauvegarde de l\'actualité:', error);
        const MESSAGE = this.isEditMode ? 'Erreur lors de la modification' : 'Erreur lors de la création';
        alert(MESSAGE + ' de l\'actualité. Veuillez réessayer.');
        this.saving = false;
      }
    });
  }

  deleteActualite(): void {
    if (!this.idActualite) return;
    
    if (confirm('Êtes-vous sûr de vouloir supprimer cette actualité ?')) {
      this.actualiteService.deleteActualite(this.idActualite).subscribe({
        next: () => {
          this.router.navigate(['/actualites']);
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          alert('Erreur lors de la suppression de l\'actualité.');
        }
      });
    }
  }

  goBack(): void {
    this.location.back();
  }
}
