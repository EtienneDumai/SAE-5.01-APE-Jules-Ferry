import { Component, Input, inject, Output, EventEmitter } from '@angular/core';
import { StatutActualite } from '../../../enums/StatutActualite/statut-actualite';
import { RouterLink, Router } from '@angular/router';
import { DatePipe, CommonModule } from '@angular/common';
import { AuthService } from '../../../services/Auth/auth.service';
import { ActualiteService } from '../../../services/Actualite/actualite.service';

import { AlertComponent } from '../../../components/alert/alert.component';
@Component({
  selector: 'app-actualite-card',
  standalone: true,
  imports: [RouterLink, DatePipe, CommonModule, AlertComponent],
  templateUrl: './actualite-card.component.html',
  styleUrl: './actualite-card.component.css'
})
export class ActualiteCardComponent {
  showDeleteAlert = false;
  @Input() id_actualite!: number;
  @Input() titre = '';
  @Input() contenu!: string;
  @Input() image_url!: string;
  @Input() datePublication!: Date;
  @Input() statut!: StatutActualite;
  @Input() id_auteur?: number;
  @Input() disableEdit = false;

  @Output() actualiteDeleted = new EventEmitter<number>();

  private readonly authService = inject(AuthService);
  private readonly actualiteService = inject(ActualiteService);
  private readonly router = inject(Router);

  get canManage(): boolean {
    return this.authService.hasRole('administrateur') && !this.disableEdit;
  }

  onDelete(event: Event): void {
    event.stopPropagation();
    this.showDeleteAlert = true;
  }

  confirmerSuppression(): void {
    this.actualiteService.deleteActualite(this.id_actualite).subscribe({
      next: () => {
        this.actualiteDeleted.emit(this.id_actualite);
      },
      error: (err) => {
        console.error('Erreur lors de la suppression de l\'actualité', err);
        alert('Erreur lors de la suppression de l\'actualité');
      }
    });
    this.showDeleteAlert = false;
  }

  annulerSuppression(): void {
    this.showDeleteAlert = false;
  }

  onEdit(event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/actualites', this.id_actualite, 'edit']);
  }
  getImageUrl(url: string | null): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return 'http://localhost:8000' + url;
  }
}