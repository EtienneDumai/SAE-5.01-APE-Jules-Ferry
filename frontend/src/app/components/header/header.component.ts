import { Component, HostListener, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoleUtilisateur } from '../../enums/RoleUtilisateur/role-utilisateur';
import { UtilisateurService } from '../../services/Utilisateur/utilisateur.service';
import { Utilisateur } from '../../models/Utilisateur/utilisateur';
import { Observable } from 'rxjs';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  utilisateurCourant!: Observable<Utilisateur | null>;
  RoleUtilisateur = RoleUtilisateur;
  menuOpen: boolean = false;
  private readonly utilisateurService = inject(UtilisateurService);
  constructor() { }
  ngOnInit(): void {
    this.utilisateurCourant = this.utilisateurService.utilisateurCourant;
  }
  setUtilisateur(utilisateur: Utilisateur | null) {
    this.utilisateurService.setUtilisateurCourant(utilisateur);
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

