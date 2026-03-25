import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SpinnerComponent } from '../../../components/spinner/spinner.component';
import { UtilisateurService } from '../../../services/Utilisateur/utilisateur.service';
import { Utilisateur } from '../../../models/Utilisateur/utilisateur';
import { ToastService } from '../../../services/Toast/toast.service';
import { TypeErreurToast } from '../../../enums/TypeErreurToast/type-erreur-toast';
import { RoleUtilisateur } from '../../../enums/RoleUtilisateur/role-utilisateur';
import { StatutCompte } from '../../../enums/StatutCompte/statut-compte';
import { UserFormComponent } from '../../../components/user-form/user-form.component';
import { PasswordConfirmModalComponent } from '../../../components/password-confirm-modal/password-confirm-modal.component';
import { ExportModalComponent } from '../../../components/export-modal/export-modal.component';
import { ExportCsvService } from '../../../services/ExportCsv/export-csv.service';

@Component({
  selector: 'app-admin-comptes',
  standalone: true,
  imports: [CommonModule, SpinnerComponent, FormsModule, UserFormComponent, PasswordConfirmModalComponent, ExportModalComponent],
  templateUrl: './admin-comptes.component.html',
  styleUrls: ['./admin-comptes.component.css']
})
export class AdminComptesComponent implements OnInit {
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly toastService = inject(ToastService);
  private readonly exportCsvService = inject(ExportCsvService);
  utilisateurs: Utilisateur[] = [];
  chargementEnCours = true;
  texteRecherche = '';

  idEnEdition: number | null = null;
  utilisateurOriginal: Utilisateur | null = null;
  idConnecte: number | null = null;
  idUtilisateurASupprimer: number | null = null;

  modeCreation = false;

  showPasswordModal = false;
  pendingAction: 'CREATE' | 'UPDATE' | 'DELETE' | null = null;
  pendingUserFormPayload: Utilisateur | null = null;

  showExportModal = false;
  exportColumnsComptes = [
    { key: 'nom', label: 'Nom', selected: true },
    { key: 'prenom', label: 'Prénom', selected: true },
    { key: 'email', label: 'E-mail', selected: true },
    { key: 'role', label: 'Rôle', selected: true },
    { key: 'statut_compte', label: 'Statut', selected: true }
  ];

  roleUtilisateur = RoleUtilisateur;
  statutCompte = StatutCompte;
  listeRoles = Object.values(RoleUtilisateur);
  listeStatuts = Object.values(StatutCompte);

  @ViewChild('bottomAnchor') bottomAnchor!: ElementRef;

  ngOnInit(): void {
    this.recupererIdConnecte();
    this.chargerUtilisateurs();
  }

  recupererIdConnecte(): void {
    const userString = localStorage.getItem('user');
    const idConnecteString = localStorage.getItem('idConnecte');

    if (userString) {
      try {
        const user = JSON.parse(userString);
        const rawId = user.id_utilisateur ?? user.id;
        const idNum = Number(rawId);

        this.idConnecte = Number.isFinite(idNum) ? idNum : null;
        return;
      } catch (e) {
        console.warn('Impossible de parser localStorage.user', e);
      }
    }

    if (idConnecteString) {
      const idNum = Number(idConnecteString);
      this.idConnecte = Number.isFinite(idNum) ? idNum : null;
      return;
    }

    this.idConnecte = null;
  }


  chargerUtilisateurs(): void {
    this.chargementEnCours = true;
    this.utilisateurService.getAllUtilisateurs().subscribe({
      next: (data) => {
        this.utilisateurs = data;
        this.chargementEnCours = false;
      },
      error: () => {
        this.toastService.showWithTimeout('Erreur chargement utilisateurs', TypeErreurToast.ERROR);
        this.chargementEnCours = false;
      }
    });
  }

  demarrerEdition(user: Utilisateur): void {
    if (this.idEnEdition !== null) {
      this.annulerEdition();
    }
    this.idEnEdition = user.id_utilisateur;
    this.utilisateurOriginal = { ...user };
  }

  validerEdition(user: Utilisateur): void {
    this.pendingUserFormPayload = user;
    this.pendingAction = 'UPDATE';
    this.showPasswordModal = true;
  }

  private executeEdition(password: string): void {
    if (!this.pendingUserFormPayload) return;
    this.utilisateurService.updateUtilisateur(this.pendingUserFormPayload, this.pendingUserFormPayload.id_utilisateur!, password).subscribe({
      next: (userMisAJour) => {
        const index = this.utilisateurs.findIndex(u => u.id_utilisateur === userMisAJour.id_utilisateur);
        if (index !== -1) {
          this.utilisateurs[index] = userMisAJour;
        }
        this.toastService.showWithTimeout('Utilisateur modifié', TypeErreurToast.SUCCESS);
        this.idEnEdition = null;
        this.utilisateurOriginal = null;
        this.closePasswordModal();
      },
      error: (err) => {
        if (err.status === 403) {
          this.toastService.showWithTimeout('Mot de passe administrateur incorrect', TypeErreurToast.ERROR);
        } else {
          this.toastService.showWithTimeout('Erreur lors de la modification', TypeErreurToast.ERROR);
        }
      }
    });
  }

  annulerEdition(): void {
    if (this.idEnEdition !== null && this.utilisateurOriginal) {
      const index = this.utilisateurs.findIndex(u => u.id_utilisateur === this.idEnEdition);
      if (index !== -1) {
        this.utilisateurs[index] = { ...this.utilisateurOriginal };
      }
    }
    this.idEnEdition = null;
    this.utilisateurOriginal = null;
  }

  afficherLigneCreation(): void {
    if (this.idEnEdition) this.annulerEdition();

    this.modeCreation = true;
    setTimeout(() => {
      this.bottomAnchor.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }

  validerCreation(nouvelUtilisateur: Utilisateur): void {
    this.pendingUserFormPayload = nouvelUtilisateur;
    this.pendingAction = 'CREATE';
    this.showPasswordModal = true;
  }

  private executeCreation(password: string): void {
    if (!this.pendingUserFormPayload) return;
    this.utilisateurService.createUtilisateur(this.pendingUserFormPayload, password).subscribe({
      next: (userCree) => {
        this.toastService.showWithTimeout('Utilisateur créé !', TypeErreurToast.SUCCESS);
        this.utilisateurs.push(userCree);
        this.modeCreation = false;
        this.closePasswordModal();
      },
      error: (err) => {
        if (err.status === 403) {
          this.toastService.showWithTimeout('Mot de passe administrateur incorrect', TypeErreurToast.ERROR);
        } else {
          this.toastService.showWithTimeout('Erreur création (Email pris ?)', TypeErreurToast.ERROR);
        }
      }
    });
  }

  annulerCreation(): void {
    this.modeCreation = false;
  }

  demanderSuppression(id: number): void {
    if (this.idConnecte !== null && Number(id) === this.idConnecte) {
      this.toastService.show('Tu peux pas supprimer ton propre compte', TypeErreurToast.WARNING);
      return;
    }
    this.idUtilisateurASupprimer = id;
    this.pendingAction = 'DELETE';
    this.showPasswordModal = true;
  }

  private executeSuppression(password: string): void {
    if (this.idUtilisateurASupprimer === null) return;

    if (this.idConnecte !== null && this.idUtilisateurASupprimer === this.idConnecte) {
      this.toastService.showWithTimeout('Tu peux pas supprimer ton propre compte', TypeErreurToast.WARNING);
      this.idUtilisateurASupprimer = null;
      return;
    }

    const id = this.idUtilisateurASupprimer;

    this.utilisateurService.deleteUtilisateur(id, password).subscribe({
      next: (data) => {
        this.utilisateurs = this.utilisateurs.filter(u => u.id_utilisateur !== id);
        this.toastService.showWithTimeout(data.message, TypeErreurToast.SUCCESS);
        this.idUtilisateurASupprimer = null;
        this.closePasswordModal();
      },
      error: (err) => {
        if (err.status === 403) {
          this.toastService.showWithTimeout('Mot de passe administrateur incorrect', TypeErreurToast.ERROR);
        } else {
          this.toastService.showWithTimeout('Erreur suppression', TypeErreurToast.ERROR);
          this.idUtilisateurASupprimer = null;
        }
      }
    });
  }


  // annulerSuppression is no longer needed since we use PasswordConfirmModal


  onPasswordConfirmed(password: string): void {
    if (this.pendingAction === 'CREATE') {
      this.executeCreation(password);
    } else if (this.pendingAction === 'UPDATE') {
      this.executeEdition(password);
    } else if (this.pendingAction === 'DELETE') {
      this.executeSuppression(password);
    }
  }

  closePasswordModal(): void {
    this.showPasswordModal = false;
    this.pendingAction = null;
    this.pendingUserFormPayload = null;
  }

  get utilisateursFiltres(): Utilisateur[] {
    if (!this.texteRecherche) return this.utilisateurs;
    const s = this.texteRecherche.toLowerCase();
    return this.utilisateurs.filter(u =>
      u.nom.toLowerCase().includes(s) || u.prenom.toLowerCase().includes(s) || u.email.toLowerCase().includes(s)
    );
  }

  exportData(selectedKeys: string[]): void {
    const dataToExport = this.utilisateursFiltres.map(user => {
      const row: Record<string, string | undefined> = {};
      if (selectedKeys.includes('nom')) row['Nom'] = user.nom.toUpperCase();
      if (selectedKeys.includes('prenom')) row['Prénom'] = user.prenom;
      if (selectedKeys.includes('email')) row['E-mail'] = user.email;
      if (selectedKeys.includes('role')) row['Rôle'] = user.role;
      if (selectedKeys.includes('statut_compte')) row['Statut'] = user.statut_compte;
      return row;
    });

    this.exportCsvService.exportAsCsvFile(dataToExport, 'Comptes_Utilisateurs');
    this.showExportModal = false;
  }
}
