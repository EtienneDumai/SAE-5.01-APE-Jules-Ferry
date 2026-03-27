/**
 * Fichier : frontend/src/app/pages/evenement-page/evenement-page.component.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier gere la logique de la page evenement page.
 */

import { Component, inject, OnInit } from '@angular/core';
import { EvenementService, PaginatedEvenements } from '../../services/Evenement/evenement.service';
import { Evenement } from '../../models/Evenement/evenement';
import { EvenementCardComponent } from "../../components/card/evenement-card/evenement-card.component";
import { SpinnerComponent } from "../../components/spinner/spinner.component";
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/Auth/auth.service';
import { RoleUtilisateur } from '../../enums/RoleUtilisateur/role-utilisateur';
import { CommonModule } from '@angular/common';
import { Utilisateur } from '../../models/Utilisateur/utilisateur';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-evenement-page',
  standalone: true,
  imports: [EvenementCardComponent, SpinnerComponent, RouterLink, CommonModule, AsyncPipe],
  templateUrl: './evenement-page.component.html',
  styleUrl: './evenement-page.component.css'
})
export class EvenementPageComponent implements OnInit {
  listeEvenements!: Evenement[];
  loadingEvenements = true;
  errorEvenements = false;

  currentUser$: Observable<Utilisateur | null> | undefined;
  currentFilter = 'tous';

  private readonly evenementService = inject(EvenementService);
  private readonly authService = inject(AuthService);

  get canManage(): boolean {
    return this.authService.hasRole(RoleUtilisateur.administrateur) ||
      this.authService.hasRole(RoleUtilisateur.membre_bureau);
  }

  ngOnInit() {
    this.currentUser$ = this.authService.currentUser$;
    // On charge tous les événements par défaut
    this.loadEvenements('tous');
  }

  // AJOUT : Méthode pour charger selon le filtre
  loadEvenements(statut: string) {
    this.currentFilter = statut;
    this.loadingEvenements = true;

    this.evenementService.getAllEvenements(statut).subscribe({
      next: (response: PaginatedEvenements | Evenement[]) => {
        this.listeEvenements = Array.isArray(response) ? response : (response?.data || []);
        this.sortEvenementByDate();
        this.loadingEvenements = false;
      },
      error: (err) => {
        console.error(err);
        this.loadingEvenements = false;
        this.errorEvenements = true;
      }
    });
  }

  handleEventDeleted(id: number): void {
    this.listeEvenements = this.listeEvenements.filter(e => e.id_evenement !== id);
  }

  public sortEvenementByDate(): void {
    const sortedList = [...this.listeEvenements];
    sortedList.sort((a, b) => {
      const dateA = new Date(a.date_evenement).getTime();
      const dateB = new Date(b.date_evenement).getTime();
      return dateB - dateA;
    });
    this.listeEvenements = sortedList;
  }

  getAsDate(date: string | Date): Date {
    return new Date(date);
  }
}