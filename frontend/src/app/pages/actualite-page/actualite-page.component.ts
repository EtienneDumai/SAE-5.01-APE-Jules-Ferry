/**
 * Fichier : frontend/src/app/pages/actualite-page/actualite-page.component.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier gere la logique de la page actualite page.
 */

import { Component, inject, OnInit } from '@angular/core';
import { Actualite } from '../../models/Actualite/actualite';
import { ActualiteService } from '../../services/Actualite/actualite.service';
import { AuthService } from '../../services/Auth/auth.service';
import { ActualiteCardComponent } from "../../components/card/actualite-card/actualite-card.component";
import { SpinnerComponent } from "../../components/spinner/spinner.component";
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-actualite-page',
  standalone: true,
  imports: [ActualiteCardComponent, SpinnerComponent, RouterLink, FormsModule],
  templateUrl: './actualite-page.component.html',
  styleUrl: './actualite-page.component.css'
})
export class ActualitePageComponent implements OnInit {
  listeActualites: Actualite[] = [];
  Date: Date = new Date();
  loadingActualites = true;
  errorActualites = false;
  searchText = '';
  currentSort: 'recent' | 'oldest' = 'recent';
  private readonly actualiteService = inject(ActualiteService);
  protected readonly authService = inject(AuthService);
  ngOnInit() {
    this.actualiteService.getAllActualites().subscribe({
      next: (data) => {
        this.listeActualites = data;
        this.sortActualiteByDate();
        this.loadingActualites = false;
    },
      error: (err) => {
        console.error(err);
        this.loadingActualites = false;
        this.errorActualites = true;
      }
    });
  }
  public sortActualiteByDate(): void {
    const sortedList = [...this.listeActualites];
    sortedList.sort((a, b) => {
      const dateA = new Date(a.date_publication).getTime();
      const dateB = new Date(b.date_publication).getTime();
      return dateB - dateA; 
    });
    this.listeActualites = sortedList;
  }

  onActualiteDeleted(id: number): void {
    this.listeActualites = this.listeActualites.filter(a => a.id_actualite !== id);
  }

  setSort(sort: 'recent' | 'oldest'): void {
    this.currentSort = sort;
  }

  toggleSort(): void {
    this.currentSort = this.currentSort === 'recent' ? 'oldest' : 'recent';
  }

  get displayedActualites(): Actualite[] {
    const search = this.searchText.trim().toLowerCase();

    return [...this.listeActualites]
      .filter((actualite) => actualite.titre.toLowerCase().includes(search))
      .sort((a, b) => {
        const delta = new Date(b.date_publication).getTime() - new Date(a.date_publication).getTime();
        return this.currentSort === 'recent' ? delta : -delta;
      });
  }
}
