import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { EvenementService, PaginatedEvenements } from '../../../services/Evenement/evenement.service';
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

import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-evenements',
  standalone: true,
  imports: [CommonModule, FormsModule, PasswordConfirmModalComponent, RouterLink],
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

  activeTab: 'MODIFICATIONS' | 'INSCRIPTIONS' = 'INSCRIPTIONS';

  pendingAction: 'DELETE' | 'MOVE' | 'DELETE_EVENT' | null = null;
  selectedInscription: ExtendedInscription | null = null;
  selectedCurrentCreneau: ExtendedCreneau | null = null;

  selectedEvent: ExtendedEvenement | null = null;

  availableSlots: ExtendedCreneau[] = [];
  targetCreneauId: number | null = null;

  idEvenementASupprimer: number | null = null;

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
    if (this.loading || !this.hasMore) return;

    if (this.events.length === 0) this.loading = true;
    else this.loadingMore = true;

    this.evenementService.getAllEvenements('tous', this.currentPage, this.limit).subscribe({
      next: (response: PaginatedEvenements) => {
        const newEvents: ExtendedEvenement[] = (response.data || []).map((e: Evenement) => ({
          ...e,
          isExpanded: false,
          totalInscrits: (e as Evenement & { inscriptions_count?: number }).inscriptions_count || 0
        }));

        this.events = [...this.events, ...newEvents];
        this.hasMore = response.current_page < response.last_page;
        this.loading = false;
        this.loadingMore = false;
      },
      error: (error) => {
        console.error('Erreur de chargement des évènements', error);
        this.loading = false;
        this.loadingMore = false;
        this.toastService.show('Erreur de chargement des évènements', TypeErreurToast.ERROR);
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
      next: (details: Evenement & { inscriptions?: Inscription[] }) => {
        if (details.formulaire && details.formulaire.taches) {
          event.extendedTaches = details.formulaire.taches.map((t: Tache) => {
            const extTache: ExtendedTache = { ...t };
            extTache.extendedCreneaux = (t.creneaux || []).map((c: Creneau) => {
              const extCreneau: ExtendedCreneau = { ...c };
              extCreneau.filledInscriptions = (details.inscriptions || [])
                .filter((i: Inscription) => i.id_creneau === c.id_creneau)
                .map((i: Inscription) => ({
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
    if (!this.searchText) {
      return this.events;
    }
    const search = this.searchText.toLowerCase();
    return this.events.filter(e =>
      e.titre.toLowerCase().includes(search) ||
      e.lieu.toLowerCase().includes(search) ||
      (e.date_evenement && new Date(e.date_evenement).toLocaleDateString().includes(search))
    );
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

    if (this.pendingAction === 'DELETE_EVENT') {
      this.executeDeleteEvent(password);
      return;
    }

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
    this.idEvenementASupprimer = null;
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

  demanderSuppressionEvenement(id: number): void {
    this.idEvenementASupprimer = id;
    this.pendingAction = 'DELETE_EVENT';
    this.showPasswordModal = true;
  }

  private executeDeleteEvent(password: string): void {
    if (this.idEvenementASupprimer === null) return;
    const id = this.idEvenementASupprimer;

    this.evenementService.deleteEvenement(id, password).subscribe({
      next: (response: { message?: string }) => {
        this.events = this.events.filter(e => e.id_evenement !== id);
        this.toastService.show(response?.message || 'Évènement supprimé', TypeErreurToast.SUCCESS);
        this.idEvenementASupprimer = null;
      },
      error: (err) => {
        if (err.status === 403) {
          this.toastService.show('Mot de passe administrateur incorrect', TypeErreurToast.ERROR);
        } else {
          this.toastService.show('Erreur lors de la suppression de l\'événement', TypeErreurToast.ERROR);
        }
        this.idEvenementASupprimer = null;
      }
    });
  }
}
