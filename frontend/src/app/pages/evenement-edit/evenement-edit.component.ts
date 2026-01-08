import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EvenementService } from '../../services/Evenement/evenement.service';
import { SpinnerComponent } from '../../components/spinner/spinner.component';

@Component({
  selector: 'app-evenement-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SpinnerComponent, RouterLink],
  templateUrl: './evenement-edit.component.html',
})
export class EvenementEditComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly evenementService = inject(EvenementService);

  evenementForm: FormGroup;
  loading = true;
  saving = false;
  idEvenement?: number;
  isEditMode = false;

  constructor() {
    this.evenementForm = this.fb.group({
      titre: ['', [Validators.required, Validators.maxLength(255)]],
      description: ['', [Validators.required]],
      date_evenement: ['', [Validators.required]],
      heure_debut: ['', [Validators.required]],
      heure_fin: ['', [Validators.required]],
      lieu: ['', [Validators.required, Validators.maxLength(255)]],
      image_url: ['', [Validators.maxLength(255)]],
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.idEvenement = Number(id);
      this.isEditMode = true;
      this.loadEvenement(this.idEvenement);
    } else {
      this.loading = false;
    }
  }

  loadEvenement(id: number): void {
    this.evenementService.getEvenementById(id).subscribe({
      next: (evenement) => {
        this.evenementForm.patchValue({
          titre: evenement.titre,
          description: evenement.description,
          date_evenement: evenement.date_evenement,
          heure_debut: evenement.heure_debut,
          heure_fin: evenement.heure_fin,
          lieu: evenement.lieu,
          image_url: evenement.image_url,
        });
        this.loading = false;
      },
      error: () => {
        alert('Erreur lors du chargement de l\'événement');
        this.router.navigate(['/admin']);
      }
    });
  }

  onSubmit(): void {
    if (this.evenementForm.invalid) return;

    this.saving = true;
    const body = this.evenementForm.value;

    if (this.isEditMode && this.idEvenement) {
      this.evenementService.updateEvenement(body, this.idEvenement).subscribe({
        next: () => {
          this.saving = false;
          this.router.navigate(['/admin']);
        },
        error: () => {
          this.saving = false;
          alert('Erreur lors de la mise à jour');
        }
      });
    } else {
      this.evenementService.createEvenement(body).subscribe({
        next: () => {
          this.saving = false;
          this.router.navigate(['/admin']);
        },
        error: () => {
          this.saving = false;
          alert('Erreur lors de la création');
        }
      });
    }
  }
}
