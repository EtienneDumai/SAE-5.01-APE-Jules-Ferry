/**
 * Fichier : frontend/src/app/components/card/evenement-card/evenement-card.component.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier porte la logique du composant evenement card.
 */

  import { Component, Input, inject, Output, EventEmitter, OnChanges, SimpleChanges, ChangeDetectorRef,OnInit } from '@angular/core';
  import { ToastService } from '../../../services/Toast/toast.service';
  import { TypeErreurToast } from '../../../enums/TypeErreurToast/type-erreur-toast';
  import { StatutEvenement } from '../../../enums/StatutEvenement/statut-evenement';
  import { RouterLink, Router } from '@angular/router';
  import { DatePipe, CommonModule } from '@angular/common';
  import { FormsModule } from '@angular/forms';
  import { EvenementService } from '../../../services/Evenement/evenement.service';
  import { Utilisateur } from '../../../models/Utilisateur/utilisateur';
  import { environment } from '../../../environments/environment';
  import { AuthService } from '../../../services/Auth/auth.service';
  @Component({
    selector: 'app-evenement-card',
    standalone: true,
    imports: [RouterLink, DatePipe, CommonModule, FormsModule],
    templateUrl: './evenement-card.component.html',
    styleUrl: './evenement-card.component.css'
  })
  export class EvenementCardComponent implements OnInit, OnChanges {

    showDeleteModal = false;
    deletePassword = '';
    isDeleting = false;

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
    @Input() id_formulaire?: number | null;

    @Output() eventDeleted = new EventEmitter<number>();

    private readonly evenementService = inject(EvenementService);
    private readonly router = inject(Router);
    private readonly cdr = inject(ChangeDetectorRef);
    private readonly toastService = inject(ToastService);
    private readonly authService = inject(AuthService);

    isAuthenticated = false;

    ngOnInit(): void {
      this.authService.currentUser$.subscribe(user => {
        this.isAuthenticated = !!user;
        this.cdr.markForCheck();
      });
    }

    ngOnChanges(changes: SimpleChanges): void {
      if (changes['currentUser']) {
        this.cdr.markForCheck();
      }
    }

    get canManage(): boolean {
      if (!this.currentUser) return false;
      const role = this.currentUser.role.toLowerCase();
      if (role === 'administrateur') return true;
      if (role === 'membre_bureau') return this.currentUser.id_utilisateur === this.id_auteur;
      return false;
    }

    get isInscriptionOuverte(): boolean {
      if (!this.date_evenement) return false;
      const dateEvent = new Date(this.date_evenement);
      const aujourdhui = new Date();
      dateEvent.setHours(0, 0, 0, 0);
      aujourdhui.setHours(0, 0, 0, 0);

      return this.statut !== StatutEvenement.termine &&
        this.statut !== StatutEvenement.annule &&
        aujourdhui.getTime() <= dateEvent.getTime();
    }

    getImageUrl(image_url: string): string {
      if (!image_url) return '';
      if (image_url.startsWith('http')) return image_url;
      const baseUrl = environment?.apiUrl ? environment.apiUrl.replace(/\/api$/, '') : 'http://localhost:8000';
      const cleanBase = baseUrl.replace(/\/$/, '');
      const cleanPath = image_url.replace(/^\//, '');
      return `${cleanBase}/${cleanPath}`;
    }

    onDelete(event: Event): void {
      event.stopPropagation();
      this.deletePassword = '';
      this.showDeleteModal = true;
    }
    closeDeleteModal(): void {
      this.showDeleteModal = false;
      this.deletePassword = '';
    }

    confirmerSuppression(): void {
      if (!this.deletePassword) {
        this.toastService.showWithTimeout("Le mot de passe est requis.", TypeErreurToast.ERROR);
        return;
      }

      this.isDeleting = true;
      this.evenementService.deleteEvenement(this.id_evenement, this.deletePassword).subscribe({
        next: () => {
          this.isDeleting = false;
          this.showDeleteModal = false;
          this.toastService.showWithTimeout('Événement supprimé avec succès.', TypeErreurToast.SUCCESS);
          this.eventDeleted.emit(this.id_evenement);
        },
        error: (err) => {
          this.isDeleting = false;
          console.error(err);

          if (err.status === 403 || err.status === 422) {
            this.toastService.showWithTimeout("Mot de passe administrateur incorrect.", TypeErreurToast.ERROR);
          } else {
            this.toastService.showWithTimeout("Erreur lors de la suppression de l'événement.", TypeErreurToast.ERROR);
          }
        }
      });
    }

    onEdit(event: Event): void {
      event.stopPropagation();
      this.router.navigate(['/evenements', this.id_evenement, 'edit']);
    }
  }