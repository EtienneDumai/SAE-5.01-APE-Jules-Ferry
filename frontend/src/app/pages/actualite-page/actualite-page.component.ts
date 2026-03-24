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
  listeActualites!: Actualite[];
  Date: Date = new Date();
  loadingActualites = true;
  errorActualites = false;
  private readonly actualiteService = inject(ActualiteService);
  protected readonly authService = inject(AuthService);
  searchQuery = '';
  sortOrder: 'desc' | 'asc' = 'desc';

  ngOnInit() {
    this.actualiteService.getAllActualites().subscribe({
      next: (data) => {
        this.listeActualites = data;
        this.loadingActualites = false;
    },
      error: (err) => {
        console.error(err);
        this.loadingActualites = false;
        this.errorActualites = true;
      }
    });
  }

  get filteredActualites(): Actualite[] {
    if (!this.listeActualites) return [];

    const filtered = this.listeActualites.filter(actu => {
      const qs = this.searchQuery.toLowerCase();
      return (actu.titre && actu.titre.toLowerCase().includes(qs)) || 
             (actu.contenu && actu.contenu.toLowerCase().includes(qs));
    });

    filtered.sort((a, b) => {
      const dateA = new Date(a.date_publication).getTime();
      const dateB = new Date(b.date_publication).getTime();
      return this.sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }

  onActualiteDeleted(id: number): void {
    this.listeActualites = this.listeActualites.filter(a => a.id_actualite !== id);
  }
}
