import { Component, Input, inject, Output, EventEmitter } from '@angular/core';
import { StatutEvenement } from '../../../enums/StatutEvenement/statut-evenement';
import { RouterLink, Router } from '@angular/router';
import { DatePipe, CommonModule } from '@angular/common';
import { AuthService } from '../../../services/Auth/auth.service';
import { RoleUtilisateur } from '../../../enums/RoleUtilisateur/role-utilisateur';
import { EvenementService } from '../../../services/Evenement/evenement.service';

@Component({
  selector: 'app-evenement-card',
  standalone: true,
  imports: [RouterLink, DatePipe, CommonModule],
  templateUrl: './evenement-card.component.html',
  styleUrl: './evenement-card.component.css'
})
export class EvenementCardComponent {
  @Input() id_evenement!: number;
  @Input() titre!: string;
  @Input() description!: string;
  @Input() date_evenement!: Date;
  @Input() heure_debut!: string;
  @Input() heure_fin!: string;
  @Input() lieu!: string;
  @Input() image_url!: string;
  @Input() statut!: StatutEvenement;

  @Output() eventDeleted = new EventEmitter<number>();

  private readonly authService = inject(AuthService);
  private readonly evenementService = inject(EvenementService);
  private readonly router = inject(Router);

  get canManage(): boolean {
    return this.authService.hasRole(RoleUtilisateur.administrateur) || 
           this.authService.hasRole(RoleUtilisateur.membre_bureau);
  }

  onDelete(event: Event): void {
    event.stopPropagation();
    if (confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      this.evenementService.deleteEvenement(this.id_evenement).subscribe({
        next: () => {
          this.eventDeleted.emit(this.id_evenement);
        },
        error: (err) => {
          console.error('Erreur lors de la suppression de l\'événement', err);
        }
      });
    }
  }

  onEdit(event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/evenements', this.id_evenement, 'edit']);
  }
}
