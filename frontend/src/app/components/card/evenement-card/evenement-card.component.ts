import { Component, Input, inject, Output, EventEmitter, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { StatutEvenement } from '../../../enums/StatutEvenement/statut-evenement';
import { RouterLink, Router } from '@angular/router';
import { DatePipe, CommonModule } from '@angular/common';
import { EvenementService } from '../../../services/Evenement/evenement.service';
import { Utilisateur } from '../../../models/Utilisateur/utilisateur';

@Component({
  selector: 'app-evenement-card',
  standalone: true,
  imports: [RouterLink, DatePipe, CommonModule],
  templateUrl: './evenement-card.component.html',
  styleUrl: './evenement-card.component.css'
})
export class EvenementCardComponent implements OnChanges {
  
  @Input() id_evenement!: number;
  @Input() titre = '';
  @Input() description!: string;
  @Input() date_evenement!: Date;
  @Input() heure_debut!: string;
  @Input() heure_fin!: string;
  @Input() lieu!: string;
  @Input() image_url!: string;
  @Input() statut!: StatutEvenement;
  @Input() id_auteur!: number; 
  @Input() currentUser: Utilisateur | null = null;

  @Output() eventDeleted = new EventEmitter<number>();

  private readonly evenementService = inject(EvenementService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentUser']) {
        this.cdr.markForCheck();
    }
  }

  get canManage(): boolean {
    if (!this.currentUser) return false;

    const role = this.currentUser.role.toLowerCase();

    if (role === 'administrateur') {
      return true;
    }

    if (role === 'membre_bureau') {
      return this.currentUser.id_utilisateur === this.id_auteur;
    }

    return false;
  }

  getImageUrl(image_url: string): string {
    if (!image_url) return '';
    if (image_url.startsWith('http')) return image_url;
    return 'http://localhost:8000' + image_url;
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