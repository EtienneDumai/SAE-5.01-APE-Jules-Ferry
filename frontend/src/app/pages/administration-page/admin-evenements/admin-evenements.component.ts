/**
 * Fichier : frontend/src/app/pages/administration-page/admin-evenements/admin-evenements.component.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier gere la logique de la page admin evenements.
 */

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { EvenementService, PaginatedEvenements } from '../../../services/Evenement/evenement.service';
import { TacheService } from '../../../services/Tache/tache.service';
import { CreneauService } from '../../../services/Creneau/creneau.service';
import { InscriptionService } from '../../../services/Inscription/inscription.service';
import { UtilisateurService } from '../../../services/Utilisateur/utilisateur.service';
import { FormulaireService } from '../../../services/Formulaire/formulaire.service';
import { ToastService } from '../../../services/Toast/toast.service';
import { TypeErreurToast } from '../../../enums/TypeErreurToast/type-erreur-toast';

import { Evenement } from '../../../models/Evenement/evenement';
import { Tache } from '../../../models/Tache/tache';
import { Creneau } from '../../../models/Creneau/creneau';
import { Inscription } from '../../../models/Inscription/inscription';
import { Utilisateur } from '../../../models/Utilisateur/utilisateur';
import { Formulaire } from '../../../models/Formulaire/formulaire';
import { StatutFormulaire } from '../../../enums/StatutFormulaire/statut-formulaire';
import { PasswordConfirmModalComponent } from '../../../components/password-confirm-modal/password-confirm-modal.component';
import { ExportModalComponent } from '../../../components/export-modal/export-modal.component';
import { ExportCsvService } from '../../../services/ExportCsv/export-csv.service';
import { SpinnerComponent } from '../../../components/spinner/spinner.component';
import { ConfirmationModalComponent } from '../../../components/confirmation-modal/confirmation-modal.component';

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
  imports: [CommonModule, FormsModule, PasswordConfirmModalComponent, RouterLink, ExportModalComponent, SpinnerComponent, ConfirmationModalComponent],
  templateUrl: './admin-evenements.component.html',
  styleUrl: './admin-evenements.component.css'
})
export class AdminEvenementsComponent implements OnInit {
  protected readonly StatutFormulaire = StatutFormulaire;
  protected readonly statutLabels: Record<StatutFormulaire, string> = {
    [StatutFormulaire.actif]: 'Actif',
    [StatutFormulaire.archive]: 'Archivé'
  };
  private readonly evenementService = inject(EvenementService);
  private readonly tacheService = inject(TacheService);
  private readonly creneauService = inject(CreneauService);
  private readonly inscriptionService = inject(InscriptionService);
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly formulaireService = inject(FormulaireService);
  private readonly toastService = inject(ToastService);
  private readonly exportCsvService = inject(ExportCsvService);

  events: ExtendedEvenement[] = [];
  currentPage = 1;
  limit = 5;
  hasMore = true;
  loading = false;
  loadingMore = false;
  searchText = '';

  showPasswordModal = false;
  showMoveModal = false;

  activeTab: 'MODIFICATIONS' | 'INSCRIPTIONS' | 'MODELES' = 'INSCRIPTIONS';

  idEvenementASupprimer: number | null = null;

  templates: Formulaire[] = [];
  loadingTemplates = false;
  showDeleteTemplateModal = false;
  templateIdToDelete: number | null = null;

  allUsers: Utilisateur[] = [];
  showAddModal = false;
  selectedAddCreneau: ExtendedCreneau | null = null;
  selectedAddEvent: ExtendedEvenement | null = null;
  selectedAddUserId: number | null = null;
  addCommentaire = '';

  // Custom user dropdown state
  searchUserText = '';
  showUserDropdown = false;

  selectedInscription: ExtendedInscription | null = null;
  selectedCurrentCreneau: ExtendedCreneau | null = null;
  selectedEvent: ExtendedEvenement | null = null;

  availableSlots: ExtendedCreneau[] = [];
  targetCreneauId: number | null = null;

  pendingAction: 'DELETE' | 'MOVE' | 'DELETE_EVENT' | 'ADD' | null = null;

  showExportEventsModal = false;
  exportColumnsEvents = [
    { key: 'titre', label: 'Titre', selected: true },
    { key: 'date', label: 'Date', selected: true },
    { key: 'inscrits', label: 'Inscrits', selected: true },
    { key: 'lieu', label: 'Lieu', selected: true }
  ];

  showExportParticipantsModal = false;
  exportColumnsParticipants = [
    { key: 'nom', label: 'Nom du participant', selected: true },
    { key: 'email', label: 'Email du participant', selected: true },
    { key: 'tache', label: 'Tâche', selected: true },
    { key: 'creneau', label: 'Créneau', selected: true },
    { key: 'commentaire', label: 'Commentaire', selected: true }
  ];
  selectedEventForExport: ExtendedEvenement | null = null;

  ngOnInit(): void {
    this.loadInitialEvents();
    this.loadUsers();
    this.loadTemplates();
  }

  loadUsers(): void {
    this.utilisateurService.getAllUtilisateurs().subscribe({
      next: (users) => this.allUsers = users,
      error: (err) => console.error('Erreur chargement utilisateurs', err)
    });
  }

  loadTemplates(): void {
    this.loadingTemplates = true;
    this.formulaireService.getTemplates().subscribe({
      next: (templates) => {
        this.templates = templates;
        this.loadingTemplates = false;
      },
      error: (err) => {
        console.error('Erreur chargement modèles', err);
        this.loadingTemplates = false;
        this.toastService.show('Erreur chargement modèles de formulaire', TypeErreurToast.ERROR);
      }
    });
  }

  deleteTemplate(id: number): void {
    this.templateIdToDelete = id;
    this.showDeleteTemplateModal = true;
  }

  confirmDeleteTemplate(): void {
    if (this.templateIdToDelete === null) return;

    this.formulaireService.deleteFormulaire(this.templateIdToDelete).subscribe({
      next: () => {
        this.toastService.show('Modèle supprimé avec succès', TypeErreurToast.SUCCESS);
        this.templateIdToDelete = null;
        this.showDeleteTemplateModal = false;
        this.loadTemplates();
      },
      error: (err) => {
        console.error(err);
        this.toastService.show('Erreur lors de la suppression du modèle', TypeErreurToast.ERROR);
        this.templateIdToDelete = null;
        this.showDeleteTemplateModal = false;
      }
    });
  }

  cancelDeleteTemplate(): void {
    this.templateIdToDelete = null;
    this.showDeleteTemplateModal = false;
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
        this.currentPage = response.current_page + 1;
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
              extCreneau.filledInscriptions = (c.inscriptions || [])
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

  get filteredUsersForSearch(): Utilisateur[] {
    if (!this.searchUserText) {
      return this.allUsers;
    }
    const search = this.searchUserText.toLowerCase();
    return this.allUsers.filter(u =>
      u.prenom.toLowerCase().includes(search) ||
      u.nom.toLowerCase().includes(search) ||
      u.email.toLowerCase().includes(search)
    );
  }

  get selectedUserName(): string {
    if (!this.selectedAddUserId) return 'Sélectionner un utilisateur';
    const user = this.allUsers.find(u => u.id_utilisateur === this.selectedAddUserId);
    if (!user) return 'Sélectionner un utilisateur';
    return `${user.prenom} ${user.nom.toUpperCase()} (${user.email})`;
  }

  selectAddUser(user: Utilisateur): void {
    this.selectedAddUserId = user.id_utilisateur;
    this.showUserDropdown = false;
    this.searchUserText = '';
  }

  toggleUserDropdown(): void {
    this.showUserDropdown = !this.showUserDropdown;
    if (this.showUserDropdown) {
      setTimeout(() => {
        const doc = document.querySelector('input[placeholder="Rechercher un utilisateur..."]') as HTMLInputElement;
        if (doc) doc.focus();
      }, 0);
    }
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

  initiateAdd(creneau: ExtendedCreneau, event: ExtendedEvenement): void {
    this.selectedAddCreneau = creneau;
    this.selectedAddEvent = event;
    this.selectedAddUserId = null;
    this.addCommentaire = '';
    this.searchUserText = '';
    this.showUserDropdown = false;
    this.showAddModal = true;
  }

  confirmMoveSelection(): void {
    if (!this.targetCreneauId) return;
    this.showMoveModal = false;
    this.pendingAction = 'MOVE';
    this.showPasswordModal = true;
  }

  confirmAddSelection(): void {
    if (!this.selectedAddUserId) return;
    this.showAddModal = false;
    this.pendingAction = 'ADD';
    this.showPasswordModal = true;
  }

  onPasswordConfirmed(password: string): void {
    this.showPasswordModal = false;

    if (this.pendingAction === 'DELETE_EVENT') {
      this.executeDeleteEvent(password);
      return;
    }

    if (this.pendingAction === 'ADD') {
      this.executeAdd(password);
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
    this.showAddModal = false;
    this.pendingAction = null;
    this.selectedInscription = null;
    this.selectedCurrentCreneau = null;
    this.targetCreneauId = null;
    this.selectedEvent = null;
    this.idEvenementASupprimer = null;
    this.selectedAddCreneau = null;
    this.selectedAddEvent = null;
    this.selectedAddUserId = null;
    this.addCommentaire = '';
    this.searchUserText = '';
    this.showUserDropdown = false;
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

  private executeAdd(password: string): void {
    if (!this.selectedAddUserId || !this.selectedAddCreneau) return;

    this.inscriptionService.createInscriptionAdmin(
      this.selectedAddUserId,
      this.selectedAddCreneau.id_creneau,
      password,
      this.addCommentaire
    ).subscribe({
      next: () => {
        this.toastService.show('Inscription ajoutée', TypeErreurToast.SUCCESS);
        if (this.selectedAddEvent) {
          this.loadEventDetails(this.selectedAddEvent);
        }
        this.closeModals();
      },
      error: (err) => {
        console.error(err);
        if (err.status === 403) {
          this.toastService.show('Mot de passe incorrect', TypeErreurToast.ERROR);
        } else if (err.status === 409 || err.status === 422) {
          this.toastService.show(err.error?.message || 'Erreur: Impossible d\'ajouter', TypeErreurToast.ERROR);
        } else {
          this.toastService.show('Erreur lors de l\'ajout', TypeErreurToast.ERROR);
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

  exportEvents(selectedKeys: string[]): void {
    const dataToExport = this.filteredEvents.map(event => {
      const row: Record<string, string | number | undefined> = {};
      if (selectedKeys.includes('titre')) row['Titre'] = event.titre;
      if (selectedKeys.includes('date')) {
        row['Date'] = event.date_evenement ? new Date(event.date_evenement).toLocaleDateString() : '';
      }
      if (selectedKeys.includes('inscrits')) row['Inscrits'] = event.totalInscrits;
      if (selectedKeys.includes('lieu')) row['Lieu'] = event.lieu;
      return row;
    });
    this.exportCsvService.exportAsCsvFile(dataToExport, 'Evenements');
    this.showExportEventsModal = false;
  }

  openExportParticipantsModal(event: ExtendedEvenement): void {
    this.selectedEventForExport = event;
    this.showExportParticipantsModal = true;
  }

  exportParticipants(selectedKeys: string[]): void {
    if (!this.selectedEventForExport || !this.selectedEventForExport.extendedTaches) return;
    const dataToExport: Record<string, string | undefined>[] = [];

    this.selectedEventForExport.extendedTaches.forEach(tache => {
      tache.extendedCreneaux?.forEach(creneau => {
        creneau.filledInscriptions?.forEach(insc => {
          const row: Record<string, string | undefined> = {};
          if (selectedKeys.includes('nom')) row['Nom'] = insc.userNomComplet;
          if (selectedKeys.includes('email')) row['Email'] = insc.userEmail;
          if (selectedKeys.includes('tache')) row['Tâche'] = tache.nom_tache;
          if (selectedKeys.includes('creneau')) {
            row['Créneau'] = `${creneau.heure_debut} - ${creneau.heure_fin}`;
          }
          if (selectedKeys.includes('commentaire')) row['Commentaire'] = insc.commentaire || '';
          dataToExport.push(row);
        });
      });
    });

    const fileName = this.selectedEventForExport.titre.replace(/\s+/g, '_');
    this.exportCsvService.exportAsCsvFile(dataToExport, fileName);
    this.showExportParticipantsModal = false;
    this.selectedEventForExport = null;
  }
}
