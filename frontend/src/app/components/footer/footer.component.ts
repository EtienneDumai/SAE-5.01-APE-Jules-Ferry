import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoleUtilisateur } from '../../enums/RoleUtilisateur/role-utilisateur';
import { UtilisateurService } from '../../services/Utilisateur/utilisateur.service';
import { Utilisateur } from '../../models/Utilisateur/utilisateur';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent implements OnInit {
  utilisateurCourant!: Observable<Utilisateur | null>;
  roleUtilisateur = RoleUtilisateur;

  utilisateurService = inject(UtilisateurService);

  ngOnInit() {
    this.utilisateurCourant = this.utilisateurService.utilisateurCourant;
  }

  setUtilisateur(utilisateur: Utilisateur | null) {
    this.utilisateurService.setUtilisateurCourant(utilisateur);
  }
}
