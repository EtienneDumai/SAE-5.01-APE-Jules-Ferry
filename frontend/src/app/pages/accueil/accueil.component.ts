import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ActualiteService } from '../../services/Actualite/actualite.service';
import { EvenementService, PaginatedEvenements } from '../../services/Evenement/evenement.service';
import { Evenement } from '../../models/Evenement/evenement';
import { Actualite } from '../../models/Actualite/actualite';
import { ActualiteCardComponent } from '../../components/card/actualite-card/actualite-card.component';
import { EvenementCardComponent } from "../../components/card/evenement-card/evenement-card.component";
import { SpinnerComponent } from '../../components/spinner/spinner.component';
@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [ActualiteCardComponent, EvenementCardComponent, 
    SpinnerComponent, RouterLink],
  templateUrl: './accueil.component.html',
  styleUrl: './accueil.component.css'
})
export class AccueilComponent implements OnInit {
  public listeActualites: Actualite[] = [];
  public listeEvenements: Evenement[] = [];

  loadingEvents = true;
  loadingActualites = true;
  errorEvents = false;
  errorActualites = false;

  private readonly actualiteService = inject(ActualiteService);
  private readonly evenementService = inject(EvenementService);
  date: Date = new Date();

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

    this.evenementService.getAllEvenements().subscribe({
      next: (response: PaginatedEvenements | Evenement[]) => {
        this.listeEvenements = Array.isArray(response) ? response : (response?.data || []);
        this.sortEvenementByDate();
        this.loadingEvents = false;
      },
      error: (err) => {
        console.error(err);
        this.loadingEvents = false;
        this.errorEvents = true;
      }
    });
  }

  handleEventDeleted(id: number): void {
    this.listeEvenements = this.listeEvenements.filter(e => e.id_evenement !== id);
  }

  public sortEvenementByDate(): void {
    this.listeEvenements.sort((a, b) => {
      return new Date(a.date_evenement).getTime() - new Date(b.date_evenement).getTime();
    });
  }

  public sortActualiteByDate(): void {
    this.listeActualites.sort((a, b) => {
      return new Date(b.date_publication).getTime() - new Date(a.date_publication).getTime();
    });
  }

  getAsDate(date: string | Date): Date {
    return new Date(date);
  }
}