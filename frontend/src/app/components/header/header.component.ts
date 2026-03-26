import { Component, HostListener, inject, OnInit } from '@angular/core';
import { RouterLink } from "@angular/router";
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/Auth/auth.service';
import { Utilisateur } from '../../models/Utilisateur/utilisateur';
import { RoleUtilisateur } from '../../enums/RoleUtilisateur/role-utilisateur';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterModule, ConfirmationModalComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  menuOpen = false;
  showLogoutModal = false;

  private readonly authService = inject(AuthService);
  
  currentUser: Utilisateur | null = null;
  isAuthenticated = false;
  roleUtilisateur = RoleUtilisateur;

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isAuthenticated = user !== null;
    });
  }

  declencherLogout(): void {
    this.showLogoutModal = true;
  }

  confirmerLogout(): void {
    this.showLogoutModal = false;
    this.authService.logout().subscribe({
      next: () => console.log('Déconnexion réussie'),
      error: (error) => console.error('Erreur lors de la déconnexion', error)
    });
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    this.closeMenu();
    this.showLogoutModal = false;
  }
}