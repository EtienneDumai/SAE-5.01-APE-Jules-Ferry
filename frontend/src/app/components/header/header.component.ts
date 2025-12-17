import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoleUtilisateur } from '../../enums/RoleUtilisateur/role-utilisateur';
import { UtilisateurService } from '../../services/Utilisateur/utilisateur.service';
import { Utilisateur } from '../../models/Utilisateur/utilisateur';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  utilisateurCourant$: Observable<Utilisateur | null>;
  RoleUtilisateur = RoleUtilisateur;

  constructor(public utilisateurService: UtilisateurService) {
    this.utilisateurCourant$ = this.utilisateurService.utilisateurCourant;
  }

  setUtilisateur(utilisateur: Utilisateur | null) {
    this.utilisateurService.setUtilisateurCourant(utilisateur);
  }
}

