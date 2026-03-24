import { Component, Input, inject, Output, EventEmitter, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { ToastService } from '../../../services/Toast/toast.service';
import { TypeErreurToast } from '../../../enums/TypeErreurToast/type-erreur-toast';
import { StatutEvenement } from '../../../enums/StatutEvenement/statut-evenement';
import { RouterLink, Router } from '@angular/router';
import { DatePipe, CommonModule } from '@angular/common';
import { EvenementService } from '../../../services/Evenement/evenement.service';
import { Utilisateur } from '../../../models/Utilisateur/utilisateur';

import { AlertComponent } from '../../../components/alert/alert.component';
import { environment } from '../../../environments/environment';
@Component({
  selector: 'app-evenement-card',
  standalone: true,
  imports: [RouterLink, DatePipe, CommonModule, AlertComponent],
  templateUrl: './evenement-card.component.html',
  styleUrl: './evenement-card.component.css'
})
export class EvenementCardComponent implements OnChanges {
  showDeleteAlert = false;
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
  private readonly toastService = inject(ToastService);

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
    return `${environment.apiImage}/${image_url}`;
  }

  onDeletes(event: Event): void {
    event.stopPropagation();
    this.showDeleteAlert = true;
  }
  onDelete(event: Event): void {
    event.stopPropagation();
    if (window.confirm('Voulez-vous vraiment supprimer cet événement ?')) {
      this.evenementService.deleteEvenement(this.id_evenement).subscribe({
        next: () => {
          this.eventDeleted.emit(this.id_evenement);
          this.toastService.showWithTimeout('Événement supprimé avec succès.', TypeErreurToast.SUCCESS);
        },
        error: (err) => {
          console.error('Erreur lors de la suppression de l\'événement', err);
        }
      });
    }
  }
  confirmerSuppression(): void {
    this.evenementService.deleteEvenement(this.id_evenement).subscribe({
      next: () => {
        this.eventDeleted.emit(this.id_evenement);
        this.toastService.showWithTimeout('Événement supprimé avec succès.', TypeErreurToast.SUCCESS);
      },
      error: (err) => {
        console.error('Erreur lors de la suppression de l\'événement', err);
      }
    });
    this.showDeleteAlert = false;
  }
  annulerSuppression(): void {
    this.showDeleteAlert = false;
  }

  onEdit(event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/evenements', this.id_evenement, 'edit']);
  }
}