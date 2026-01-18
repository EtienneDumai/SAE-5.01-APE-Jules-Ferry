import { Component, inject } from '@angular/core';
import { Utilisateur } from '../../models/Utilisateur/utilisateur';
import { AuthService } from '../../services/Auth/auth.service';
import { UtilisateurService } from '../../services/Utilisateur/utilisateur.service';
import { FormModifierPasswordComponent } from "../../components/forms/form-modifier-password/form-modifier-password.component";
import { ToastService } from '../../services/Toast/toast.service';
import { TypeErreurToast } from '../../enums/TypeErreurToast/type-erreur-toast';
import { Router } from '@angular/router';
import { InscriptionService } from '../../services/Inscription/inscription.service';


@Component({
  selector: 'app-compte-utilisateur',
  standalone: true,
  imports: [FormModifierPasswordComponent],
  templateUrl: './compte-utilisateur.component.html',
  styleUrl: './compte-utilisateur.component.css'
})
export class CompteUtilisateurComponent {
  currentUser: Utilisateur | null = null;
  isAuthenticated: boolean = false;
  loadingUser: boolean = true;
  utilisateurMdp!: Utilisateur;
  erreurLoadingUser: boolean = false;


  // État UI
  modifierMdp: boolean = false;
  resetKey = 0;
  private readonly inscriptionService = inject(InscriptionService);
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  
  ngOnInit(): void {
    this.authService.currentUser$.subscribe({
      next: (user) => {
        this.currentUser = user;
        this.isAuthenticated = user !== null;
        this.loadingUser = false;
      },
      error: (error) => {
        this.erreurLoadingUser = true;
        this.loadingUser = false;
        console.error('Erreur lors de la récupération de l\'utilisateur courant', error);
      }
    });

  }
  public logout(): void {

    this.authService.logout().subscribe({
      next: () => {
        console.log('Déconnexion réussie');
        this.toastService.show('Deconnexion réussie', TypeErreurToast.SUCCESS);
      },
      error: (error) => {
        console.error('Erreur lors de la déconnexion', error);
      }
    });
  }
  public modifierMotDePasse(): void {
    this.modifierMdp = true;
    this.resetKey++;
  }
  onMdpSubmitted(payload: { motDePasse: string }): void {
    if (!this.currentUser || !this.currentUser.id_utilisateur) {
      console.error('Aucun utilisateur connecté — impossible de mettre à jour le mot de passe');
      this.toastService.show('Impossible de mettre à jour le mot de passe veuillez réessayer plus tard', TypeErreurToast.ERROR);
      return;
    }
    this.utilisateurService.updatePassword(this.currentUser.id_utilisateur, payload.motDePasse).subscribe({
      next: () => {
        console.log('Mot de passe mis à jour avec succès');
        this.toastService.show('Mot de passe mis à jour avec succès', TypeErreurToast.SUCCESS);
        this.modifierMdp = false;
        this.resetKey++;
      },
      error: (error) => {
        this.toastService.show('Erreur lors de la mise à jour du mot de passe veuillez réessayer plus tard', TypeErreurToast.ERROR);
        console.error('Erreur lors de la mise à jour du mot de passe', error);
        console.log(error.status);          // 422
        console.log(error.error);           // doit contenir message + errors
        console.log(error.error?.errors);   // détails champs
      }
    });
  }
  onMdpCancelled(): void {
    this.modifierMdp = false;
    this.resetKey++;
  }
  deleteAccount(): void {
    console.log('currentUser =', this.currentUser);
    console.log('id_utilisateur =', this.currentUser?.id_utilisateur);
    console.log('id =', (this.currentUser as any)?.id);
    if (!this.currentUser) return;
    this.inscriptionService.deleteInscription(this.currentUser.id_utilisateur).subscribe({
      next: () => {
        this.toastService.show('Compte utilisateur supprimé avec succès', TypeErreurToast.SUCCESS);
        console.log('Delete de les inscriptions réussie');
      },
      error: () => {
        this.toastService.show('Erreur lors de la suppression du compte', TypeErreurToast.ERROR);
        console.log('Erreur lors du delete des inscriptions');
      }
    });
    this.utilisateurService.deleteUtilisateur(this.currentUser.id_utilisateur).subscribe({
      next: () => {
        this.toastService.show('Compte utilisateur supprimé avec succès', TypeErreurToast.SUCCESS);

        this.authService.logout().subscribe();
      },
      error: () => {
        this.toastService.show('Erreur lors de la suppression du compte', TypeErreurToast.ERROR);
      }
    });
    
  }
}
