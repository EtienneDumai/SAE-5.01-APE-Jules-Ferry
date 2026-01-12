import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { UtilisateurService } from '../../services/Utilisateur/utilisateur.service';
import { Utilisateur } from '../../models/Utilisateur/utilisateur';
import { ToastService } from '../../services/Toast/toast.service';
import { TypeErreurToast } from '../../enums/TypeErreurToast/type-erreur-toast';
import { RoleUtilisateur } from '../../enums/RoleUtilisateur/role-utilisateur';
import { StatutCompte } from '../../enums/StatutCompte/statut-compte';
import { AlertComponent } from '../../components/alert/alert.component';

@Component({
  selector: 'app-admin-utilisateurs',
  standalone: true,
  imports: [CommonModule, SpinnerComponent, FormsModule, AlertComponent],
  templateUrl: './admin-utilisateurs.component.html',
  styleUrls: ['./admin-utilisateurs.component.css']
})
export class AdminGestionUtilisateursComponent implements OnInit {
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly toastService = inject(ToastService);
  utilisateurs: Utilisateur[] = [];
  chargementEnCours = true;
  texteRecherche: string = '';

  idEnEdition: number | null = null;
  utilisateurOriginal: Utilisateur | null = null;
  idConnecte: number | null = null;
  idUtilisateurASupprimer: number | null = null; // Pour gérer l'affichage de l'alerte quand on demande a supprimer

  modeCreation: boolean = false;
  nouvelUtilisateur: Utilisateur = this.creerUtilisateurVide();

  RoleUtilisateur = RoleUtilisateur;
  StatutCompte = StatutCompte;
  listeRoles = Object.values(RoleUtilisateur);
  listeStatuts = Object.values(StatutCompte);

  @ViewChild('bottomAnchor') bottomAnchor!: ElementRef;

  constructor() { }

  private creerUtilisateurVide(): Utilisateur {
    return {
      id_utilisateur: 0,
      nom: '',
      prenom: '',
      email: '',
      mot_de_passe: '',
      role: RoleUtilisateur.parent,
      statut_compte: StatutCompte.actif
    };
  }

  ngOnInit(): void {
    this.recupererIdConnecte();
    this.chargerUtilisateurs();
  }

  recupererIdConnecte(): void {
    const userString = localStorage.getItem('user');
    const idConnecteString = localStorage.getItem('idConnecte');

    // On tente de récupérer l'idConnecte depuis le localStorage
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

    // On tente de récupérer l'idConnecte depuis le localStorage
    if (idConnecteString) {
      const idNum = Number(idConnecteString);
      this.idConnecte = Number.isFinite(idNum) ? idNum : null;
      return;
    }

    // Si rien trouvé
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
        this.toastService.show('Erreur chargement utilisateurs', TypeErreurToast.ERROR);
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
    this.utilisateurService.updateUtilisateur(user, user.id_utilisateur).subscribe({
      next: (updatedUser) => {
        this.toastService.show('Utilisateur modifié', TypeErreurToast.SUCCESS);
        this.idEnEdition = null;
        this.utilisateurOriginal = null;
      },
      error: () => {
        this.toastService.show('Erreur lors de la modification', TypeErreurToast.ERROR);
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

  private estMotDePasseRobuste(mdp: string): boolean {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
    return regex.test(mdp);
  }

  private estEmailValide(email: string): boolean {
    const mail = (email ?? '').trim();
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    return regex.test(mail);
  }


  validerCreation(): void {
    if (!this.nouvelUtilisateur.nom || !this.nouvelUtilisateur.prenom || !this.nouvelUtilisateur.email || !this.nouvelUtilisateur.mot_de_passe) {
      this.toastService.show('Champs obligatoires manquants', TypeErreurToast.WARNING);
      return;
    }

    if (!this.estEmailValide(this.nouvelUtilisateur.email)) {
      this.toastService.show('Email invalide', TypeErreurToast.WARNING);
      return;
    }


    if (!this.estMotDePasseRobuste(this.nouvelUtilisateur.mot_de_passe)) {
      this.toastService.show(
        'Le mot de passe doit contenir 12 caractères, 1 majuscule, 1 chiffre et 1 caractère spécial.',
        TypeErreurToast.WARNING
      );
      return;
    }

    this.utilisateurService.createUtilisateur(this.nouvelUtilisateur).subscribe({
      next: (userCree) => {
        this.toastService.show('Utilisateur créé !', TypeErreurToast.SUCCESS);
        this.utilisateurs.push(userCree);
        this.modeCreation = false;
        this.reinitialiserNouvelUtilisateur();
      },
      error: () => {
        this.toastService.show('Erreur création (Email pris ?)', TypeErreurToast.ERROR);
      }
    });
  }

  annulerCreation(): void {
    this.modeCreation = false;
    this.reinitialiserNouvelUtilisateur();
  }

  reinitialiserNouvelUtilisateur(): void {
    this.nouvelUtilisateur = this.creerUtilisateurVide();
  }

  demanderSuppression(id: number): void {
    if (this.idConnecte !== null && Number(id) === this.idConnecte) {
      console.warn('Tentative de suppression de soi-même bloquée. id=', id);
      return;
    }
    this.idUtilisateurASupprimer = id;
  }

  confirmerSuppression(): void {
    if (this.idUtilisateurASupprimer === null) return;

    if (this.idConnecte !== null && this.idUtilisateurASupprimer === this.idConnecte) {
      this.toastService.show('Tu peux pas supprimer ton propre compte', TypeErreurToast.WARNING);
      this.idUtilisateurASupprimer = null;
      return;
    }

    const id = this.idUtilisateurASupprimer;

    this.utilisateurService.deleteUtilisateur(id).subscribe({
      next: () => {
        this.utilisateurs = this.utilisateurs.filter(u => u.id_utilisateur !== id);
        this.toastService.show('Utilisateur supprimé', TypeErreurToast.SUCCESS);
        this.idUtilisateurASupprimer = null;
      },
      error: () => {
        this.toastService.show('Erreur suppression', TypeErreurToast.ERROR);
        this.idUtilisateurASupprimer = null;
      }
    });
  }


  annulerSuppression(): void {
    this.idUtilisateurASupprimer = null;
  }

  get utilisateursFiltres(): Utilisateur[] {
    if (!this.texteRecherche) return this.utilisateurs;
    const s = this.texteRecherche.toLowerCase();
    return this.utilisateurs.filter(u =>
      u.nom.toLowerCase().includes(s) || u.prenom.toLowerCase().includes(s) || u.email.toLowerCase().includes(s)
    );
  }
}