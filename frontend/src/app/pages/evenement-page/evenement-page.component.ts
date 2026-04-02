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
import { FormsModule } from '@angular/forms';
import { StatutEvenement } from '../../enums/StatutEvenement/statut-evenement';

@Component({
  selector: 'app-evenement-page',
  standalone: true,
  imports: [EvenementCardComponent, SpinnerComponent, RouterLink, CommonModule, AsyncPipe, FormsModule],
  templateUrl: './evenement-page.component.html',
  styleUrl: './evenement-page.component.css'
})
export class EvenementPageComponent implements OnInit {
  listeEvenements: Evenement[] = [];
  loadingEvenements = true;
  errorEvenements = false;

  currentUser$: Observable<Utilisateur | null> | undefined;
  searchText = '';
  currentFilter = 'tous';
  currentSort: 'recent' | 'oldest' = 'recent';

  private readonly evenementService = inject(EvenementService);
  private readonly authService = inject(AuthService);

  get canManage(): boolean {
    return this.authService.hasRole(RoleUtilisateur.administrateur) ||
      this.authService.hasRole(RoleUtilisateur.membre_bureau);
  }

  ngOnInit() {
    this.currentUser$ = this.authService.currentUser$;
    // On charge tous les événements par défaut
    this.fetchEvenements();
  }

  fetchEvenements() {
    this.loadingEvenements = true;
    this.evenementService.getAllEvenements('tous').subscribe({
      next: (response: PaginatedEvenements | Evenement[]) => {
        this.listeEvenements = Array.isArray(response) ? response : (response?.data || []);
        this.loadingEvenements = false;
      },
      error: (err) => {
        console.error(err);
        this.loadingEvenements = false;
        this.errorEvenements = true;
      }
    });
  }

  setFilter(statut: string) {
    this.currentFilter = statut;
  }

  handleEventDeleted(id: number): void {
    this.listeEvenements = this.listeEvenements.filter(e => e.id_evenement !== id);
  }

  setSort(sort: 'recent' | 'oldest'): void {
    this.currentSort = sort;
  }

  toggleSort(): void {
    this.currentSort = this.currentSort === 'recent' ? 'oldest' : 'recent';
  }

  getAsDate(date: string | Date): Date {
    return new Date(date);
  }

  get displayedEvenements(): Evenement[] {
    const search = this.searchText.trim().toLowerCase();
    const now = new Date().getTime();

    return this.listeEvenements
      .filter((evenement) => {
        if (!evenement.titre.toLowerCase().includes(search)) return false;

        const eventEndTime = this.getEventEndTimestamp(evenement);
        const isPassed = eventEndTime < now;

        if (this.currentFilter === 'tous') return true;
        
        if (this.currentFilter === 'termine') {
          return evenement.statut === StatutEvenement.publie && isPassed;
        }
        
        if (this.currentFilter === 'publie') {
          return evenement.statut === StatutEvenement.publie && !isPassed;
        }

        return true;

      })
      .sort((a, b) => {
        const delta = this.getEventTimestamp(b) - this.getEventTimestamp(a);
        return this.currentSort === 'recent' ? delta : -delta;
      });
  }

  private getEventTimestamp(evenement: Evenement): number {
    const date = evenement.date_evenement;
    const time = evenement.heure_debut || '00:00';
    return this.calculateTimestamp(date, time);
  }

  private getEventEndTimestamp(evenement: Evenement): number {
    const date = evenement.date_evenement;
    const time = evenement.heure_fin || evenement.heure_debut || '23:59';
    return this.calculateTimestamp(date, time);
  }

  private calculateTimestamp(date: string | Date, time: string): number {
    if (date instanceof Date) {
      const [hours, minutes] = time.split(':').map(Number);
      const localDate = new Date(date);
      localDate.setHours(hours || 0, minutes || 0, 0, 0);
      return localDate.getTime();
    }

    const [year, month, day] = String(date).split('T')[0].split('-').map(Number);
    const [hours, minutes] = time.split(':').map(Number);

    return new Date(year, (month || 1) - 1, day || 1, hours || 0, minutes || 0, 0, 0).getTime();
  }
}