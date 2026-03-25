import { Component, inject, OnInit } from '@angular/core';
import { Utilisateur } from '../../models/Utilisateur/utilisateur';
import { AuthService } from '../../services/Auth/auth.service';
import { UtilisateurService } from '../../services/Utilisateur/utilisateur.service';
import { FormModifierPasswordComponent } from "../../components/forms/form-modifier-password/form-modifier-password.component";
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { ToastService } from '../../services/Toast/toast.service';
import { TypeErreurToast } from '../../enums/TypeErreurToast/type-erreur-toast';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-compte-utilisateur',
  standalone: true,
  imports: [FormModifierPasswordComponent, CommonModule, FormsModule, SpinnerComponent],
  templateUrl: './compte-utilisateur.component.html',
  styleUrl: './compte-utilisateur.component.css'
})
export class CompteUtilisateurComponent implements OnInit {
  currentUser: Utilisateur | null = null;
  isAuthenticated = false;
  loadingUser = true;
  erreurLoadingUser = false;
  
  utilisateurMdp!: Utilisateur;
  modifierMdp = false;
  resetKey = 0;

  showDeleteModal = false;
  deletePassword = '';
  deleteLoading = false;

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
        console.error('Erreur chargement user', error);
      }
    });
  }

  public logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.toastService.showWithTimeout('Deconnexion réussie', TypeErreurToast.SUCCESS);
        this.router.navigate(['/']); //redirect apres logout
      },
      error: (error) => console.error('Erreur logout', error)
    });
  }

  public modifierMotDePasse(): void {
    this.modifierMdp = true;
    this.resetKey++;
  }

  onMdpSubmitted(payload: { motDePasse: string }): void {
    if (!this.currentUser?.id_utilisateur) {
      this.toastService.showWithTimeout('Erreur: Utilisateur non identifié', TypeErreurToast.ERROR);
      return;
    }
    
    this.utilisateurService.updatePassword(this.currentUser.id_utilisateur, payload.motDePasse).subscribe({
      next: () => {
        this.toastService.showWithTimeout('Mot de passe mis à jour', TypeErreurToast.SUCCESS);
        this.modifierMdp = false;
        this.resetKey++;
      },
      error: (error) => {
        this.toastService.showWithTimeout('Erreur mise à jour mot de passe', TypeErreurToast.ERROR);
        console.error(error);
      }
    });
  }

  onMdpCancelled(): void {
    this.modifierMdp = false;
    this.resetKey++;
  }

  deleteAccount(): void {
    if (!this.currentUser?.id_utilisateur) return;

    if(!confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) {
        return;
    }
    //le back se charge de supprimer les inscriptions associees
    this.utilisateurService.deleteUtilisateur(this.currentUser.id_utilisateur).subscribe({
      next: () => {
        this.toastService.showWithTimeout('Compte supprimé avec succès', TypeErreurToast.SUCCESS);
        this.authService.logout().subscribe(() => {
            this.router.navigate(['/']);
        });
      },
      error: (err) => {
        console.error(err);
        this.toastService.showWithTimeout('Erreur lors de la suppression', TypeErreurToast.ERROR);
      }
    });
  }

  openDeleteModal(): void {
    this.showDeleteModal = true;
    this.deletePassword = ''; // On vide le champ par sécurité
  }

  // 2. Ferme la modale
  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.deletePassword = '';
  }

  // 3. Action finale confirmée par la modale
  confirmDeleteAccount(): void {
    if (!this.currentUser?.id_utilisateur) return;
    if (!this.deletePassword) {
        this.toastService.showWithTimeout('Veuillez entrer votre mot de passe', TypeErreurToast.ERROR);
        return;
    }

    this.deleteLoading = true;

    // Suppression via le service Utilisateur (qui gère la cascade inscriptions via le backend maintenant)
    this.utilisateurService.deleteUtilisateur(this.currentUser.id_utilisateur, this.deletePassword).subscribe({
      next: () => {
        this.deleteLoading = false;
        this.showDeleteModal = false;
        this.toastService.showWithTimeout('Compte supprimé avec succès', TypeErreurToast.SUCCESS);
        
        // Déconnexion propre
        this.authService.logout().subscribe(() => {
             this.router.navigate(['/']);
        });
      },
      error: (err) => {
        this.deleteLoading = false;
        console.error(err);
        // Gestion du message d'erreur spécifique (Mot de passe faux)
        if (err.status === 403) {
            this.toastService.showWithTimeout('Mot de passe incorrect', TypeErreurToast.ERROR);
        } else {
            this.toastService.showWithTimeout('Erreur lors de la suppression du compte', TypeErreurToast.ERROR);
        }
      }
    });
  }
}