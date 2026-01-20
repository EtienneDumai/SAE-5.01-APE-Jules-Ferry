import { Component, Input, inject, Output, EventEmitter } from '@angular/core';
import { StatutActualite } from '../../../enums/StatutActualite/statut-actualite';
import { RouterLink, Router } from '@angular/router';
import { DatePipe, CommonModule } from '@angular/common';
import { AuthService } from '../../../services/Auth/auth.service';
import { ActualiteService } from '../../../services/Actualite/actualite.service';

@Component({
  selector: 'app-actualite-card',
  standalone: true,
  imports: [RouterLink, DatePipe, CommonModule],
  templateUrl: './actualite-card.component.html',
  styleUrl: './actualite-card.component.css'
})
export class ActualiteCardComponent {
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
    if (confirm('Êtes-vous sûr de vouloir supprimer cette actualité ?')) {
      this.actualiteService.deleteActualite(this.id_actualite).subscribe({
        next: () => {
          this.actualiteDeleted.emit(this.id_actualite);
        },
        error: (err) => {
          console.error('Erreur lors de la suppression de l\'actualité', err);
          alert('Erreur lors de la suppression de l\'actualité');
        }
      });
    }
  }

  onEdit(event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/actualites', this.id_actualite, 'edit']);
  }
}
