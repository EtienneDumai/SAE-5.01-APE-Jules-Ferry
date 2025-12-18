import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { inject } from '@angular/core'; // ✅ Ajouter
import { AuthService } from '../../services/Auth/auth.service';
import { Utilisateur } from '../../models/Utilisateur/utilisateur';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  private readonly authService = inject(AuthService);
  currentUser: Utilisateur | null = null;
  isAuthenticated: boolean = false;

  constructor() {}

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
}