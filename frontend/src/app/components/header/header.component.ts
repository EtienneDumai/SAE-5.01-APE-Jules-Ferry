import { Component, HostListener, inject, OnInit } from '@angular/core';
import { RouterLink } from "@angular/router";
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/Auth/auth.service';
import { Utilisateur } from '../../models/Utilisateur/utilisateur';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  menuOpen = false;
  private readonly authService = inject(AuthService);
  currentUser: Utilisateur | null = null;
  isAuthenticated = false;


  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isAuthenticated = user !== null;
    });
  }

  logout(): void {
    if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
      this.authService.logout().subscribe({
        next: () => {
          console.log('Déconnexion réussie');
        },
        error: (error) => {
          console.error('Erreur lors de la déconnexion', error);
        }
      });
    }
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
  }
}