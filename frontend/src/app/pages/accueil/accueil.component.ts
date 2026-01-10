import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ActualiteService } from '../../services/Actualite/actualite.service';
import { EvenementService } from '../../services/Evenement/evenement.service';
import { Evenement } from '../../models/Evenement/evenement';
import { Actualite } from '../../models/Actualite/actualite';
import { ActualiteCardComponent } from '../../components/card/actualite-card/actualite-card.component';
import { EvenementCardComponent } from "../../components/card/evenement-card/evenement-card.component";
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { ErreurModaleComponent } from '../../components/erreur-modale/erreur-modale.component';
import { CalendrierComponent } from '../../components/calendrier/calendrier.component';
@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [ActualiteCardComponent, EvenementCardComponent, SpinnerComponent, RouterLink, ErreurModaleComponent, CalendrierComponent],
  templateUrl: './accueil.component.html',
  styleUrl: './accueil.component.css'
})
export class AccueilComponent implements OnInit {
  public listeActualites: Actualite[] = [];
  public listeEvenements: Evenement[] = [];
  loadingEvents: boolean = true;
  loadingActualites: boolean = true;
  errorEvents: boolean = false;
  errorActualites: boolean = false;
  private readonly actualiteService = inject(ActualiteService);
  private readonly evenementService = inject(EvenementService);
  Date: Date = new Date();
  ngOnInit() {
    this.actualiteService.getAllActualites().subscribe( {
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
    this.sortActualiteByDate(this.listeActualites);
    this.evenementService.getAllEvenements().subscribe({
      next: (data) => {
        this.listeEvenements = data;
        this.loadingEvents = false;
      },
      error: (err) => {
        console.error(err);
        this.loadingEvents = false;
        this.errorEvents = true;
      }
    });
    this.sortEvenementByDate(this.listeEvenements);
  }
  public sortEvenementByDate(a: Evenement[]): Evenement[] {
    return a.sort((a, b) => a.date_evenement.getTime() - b.date_evenement.getTime());
  }
  public sortActualiteByDate(a: Actualite[]): Actualite[] {
    return a.sort((a, b) => a.date_publication.getTime() - b.date_publication.getTime());
  }
}
