import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { EvenementService } from '../../../services/Evenement/evenement.service';
import { TacheService } from '../../../services/Tache/tache.service';
import { CreneauService } from '../../../services/Creneau/creneau.service';
import { InscriptionService } from '../../../services/Inscription/inscription.service';
import { UtilisateurService } from '../../../services/Utilisateur/utilisateur.service';
import { ToastService } from '../../../services/Toast/toast.service';
import { TypeErreurToast } from '../../../enums/TypeErreurToast/type-erreur-toast';

import { Evenement } from '../../../models/Evenement/evenement';
import { Tache } from '../../../models/Tache/tache';
import { Creneau } from '../../../models/Creneau/creneau';
import { Inscription } from '../../../models/Inscription/inscription';
import { Utilisateur } from '../../../models/Utilisateur/utilisateur';
import { PasswordConfirmModalComponent } from '../../../components/password-confirm-modal/password-confirm-modal.component';

interface ExtendedCreneau extends Creneau {
  filledInscriptions?: ExtendedInscription[];
}

interface ExtendedTache extends Tache {
  extendedCreneaux?: ExtendedCreneau[];
}

interface ExtendedEvenement extends Evenement {
  extendedTaches?: ExtendedTache[];
  totalInscrits?: number;
  isExpanded?: boolean;
  loadingDetails?: boolean;
}

interface ExtendedInscription extends Inscription {
  userNomComplet?: string;
  userEmail?: string;
}

@Component({
  selector: 'app-admin-evenements',
  standalone: true,
  imports: [CommonModule, FormsModule, PasswordConfirmModalComponent],
  templateUrl: './admin-evenements.component.html',
  styleUrl: './admin-evenements.component.css'
})
export class AdminEvenementsComponent implements OnInit {
  private readonly evenementService = inject(EvenementService);
  private readonly tacheService = inject(TacheService);
  private readonly creneauService = inject(CreneauService);
  private readonly inscriptionService = inject(InscriptionService);
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly toastService = inject(ToastService);

  events: ExtendedEvenement[] = [];
  currentPage = 1;
  limit = 5;
  hasMore = true;
  loading = false;
  loadingMore = false;
  searchText = '';

  showPasswordModal = false;
  showMoveModal = false;

  pendingAction: 'DELETE' | 'MOVE' | null = null;
  selectedInscription: ExtendedInscription | null = null;
  selectedCurrentCreneau: ExtendedCreneau | null = null;

  selectedEvent: ExtendedEvenement | null = null;

  availableSlots: ExtendedCreneau[] = [];
  targetCreneauId: number | null = null;

  ngOnInit(): void {
    this.loadInitialEvents();
  }

  loadInitialEvents(): void {
    this.currentPage = 1;
    this.events = [];
    this.hasMore = true;
    this.loadEvents();
  }

  loadEvents(): void {
    if (this.currentPage === 1) this.loading = true;
    else this.loadingMore = true;

    this.evenementService.getAllEvenements('tous', this.currentPage, this.limit).subscribe({
      next: (response: any) => {
        const newEvents: ExtendedEvenement[] = (response.data || []).map((e: any) => ({
          ...e,
          isExpanded: false,
          totalInscrits: e.inscriptions_count || 0
        }));

        this.events = [...this.events, ...newEvents];
        this.hasMore = !!response.next_page_url;
        if (this.hasMore) this.currentPage++;

        this.loading = false;
        this.loadingMore = false;
      },
      error: (err) => {
        console.error('Erreur loading events', err);
        this.toastService.show('Erreur chargement des événements', TypeErreurToast.ERROR);
        this.loading = false;
        this.loadingMore = false;
      }
    });
  }

  loadMore(): void {
    if (!this.loadingMore && this.hasMore) {
      this.loadEvents();
    }
  }

  toggleExpand(event: ExtendedEvenement): void {
    if (event.isExpanded) {
      event.isExpanded = false;
    } else {
      event.isExpanded = true;
      if (!event.extendedTaches && event.id_formulaire) {
        this.loadEventDetails(event);
      }
    }
  }

  loadEventDetails(event: ExtendedEvenement): void {
    event.loadingDetails = true;
    this.evenementService.getEvenementDetails(event.id_evenement).subscribe({
      next: (details: any) => {
        if (details.formulaire && details.formulaire.taches) {
          event.extendedTaches = details.formulaire.taches.map((t: any) => {
            const extTache: ExtendedTache = { ...t };
            extTache.extendedCreneaux = (t.creneaux || []).map((c: any) => {
              const extCreneau: ExtendedCreneau = { ...c };
              extCreneau.filledInscriptions = (c.inscriptions || []).map((i: any) => ({
                ...i,
                userNomComplet: i.utilisateur ? `${i.utilisateur.prenom} ${i.utilisateur.nom.toUpperCase()}` : 'Inconnu',
                userEmail: i.utilisateur ? i.utilisateur.email : ''
              }));
              return extCreneau;
            });
            return extTache;
          });

          let total = 0;
          event.extendedTaches?.forEach(t => {
            t.extendedCreneaux?.forEach(c => {
              total += c.filledInscriptions?.length || 0;
            });
          });
          event.totalInscrits = total;
        } else {
          event.extendedTaches = [];
          event.totalInscrits = 0;
        }
        event.loadingDetails = false;
      },
      error: (err) => {
        console.error(err);
        this.toastService.show('Erreur chargement détails', TypeErreurToast.ERROR);
        event.loadingDetails = false;
      }
    });
  }

  get filteredEvents(): ExtendedEvenement[] {
    if (!this.searchText) return this.events;
    return this.events.filter(e => e.titre.toLowerCase().includes(this.searchText.toLowerCase()));
  }

  initiateDelete(inscription: ExtendedInscription, creneau: ExtendedCreneau, event: ExtendedEvenement): void {
    this.selectedInscription = inscription;
    this.selectedCurrentCreneau = creneau;
    this.selectedEvent = event;
    this.pendingAction = 'DELETE';
    this.showPasswordModal = true;
  }

  initiateMove(inscription: ExtendedInscription, currentCreneau: ExtendedCreneau, tache: ExtendedTache, event: ExtendedEvenement): void {
    this.selectedInscription = inscription;
    this.selectedCurrentCreneau = currentCreneau;
    this.selectedEvent = event;

    this.availableSlots = (tache.extendedCreneaux || [])
      .filter(c => c.id_creneau !== currentCreneau.id_creneau);

    this.targetCreneauId = null;
    this.showMoveModal = true;
  }

  confirmMoveSelection(): void {
    if (!this.targetCreneauId) return;
    this.showMoveModal = false;
    this.pendingAction = 'MOVE';
    this.showPasswordModal = true;
  }

  onPasswordConfirmed(password: string): void {
    this.showPasswordModal = false;

    if (!this.selectedInscription || !this.selectedCurrentCreneau) return;

    if (this.pendingAction === 'DELETE') {
      this.executeDelete(password);
    } else if (this.pendingAction === 'MOVE') {
      this.executeMove(password);
    }
  }

  closeModals(): void {
    this.showPasswordModal = false;
    this.showMoveModal = false;
    this.pendingAction = null;
    this.selectedInscription = null;
    this.selectedCurrentCreneau = null;
    this.targetCreneauId = null;
    this.selectedEvent = null;
  }

  private executeDelete(password: string): void {
    if (!this.selectedInscription || !this.selectedCurrentCreneau) return;

    this.inscriptionService.deleteInscriptionAdmin(
      this.selectedInscription.id_utilisateur,
      this.selectedCurrentCreneau.id_creneau,
      password
    ).subscribe({
      next: () => {
        this.toastService.show('Désinscription réussie', TypeErreurToast.SUCCESS);
        if (this.selectedEvent) {
          this.loadEventDetails(this.selectedEvent);
        }
        this.closeModals();
      },
      error: (err) => {
        console.error(err);
        if (err.status === 403) {
          this.toastService.show('Mot de passe incorrect', TypeErreurToast.ERROR);
        } else {
          this.toastService.show('Erreur lors de la désinscription', TypeErreurToast.ERROR);
        }
      }
    });
  }

  private executeMove(password: string): void {
    if (!this.selectedInscription || !this.selectedCurrentCreneau || !this.targetCreneauId) return;

    this.inscriptionService.updateInscriptionAdmin(
      this.selectedInscription.id_utilisateur,
      this.selectedCurrentCreneau.id_creneau,
      this.targetCreneauId,
      password
    ).subscribe({
      next: () => {
        this.toastService.show('Déplacement réussi', TypeErreurToast.SUCCESS);
        if (this.selectedEvent) {
          this.loadEventDetails(this.selectedEvent);
        }
        this.closeModals();
      },
      error: (err) => {
        console.error(err);
        if (err.status === 403) {
          this.toastService.show('Mot de passe incorrect', TypeErreurToast.ERROR);
        } else if (err.status === 409 || err.status === 422) {
          this.toastService.show(err.error?.message || 'Erreur: Créneau invalide', TypeErreurToast.ERROR);
        } else {
          this.toastService.show('Erreur lors du déplacement', TypeErreurToast.ERROR);
        }
      }
    });
  }
}
