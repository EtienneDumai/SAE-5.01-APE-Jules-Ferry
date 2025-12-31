import { Component, inject, OnInit } from '@angular/core';
import { HeaderComponent } from "../../components/header/header.component";
import { FooterComponent } from "../../components/footer/footer.component";
import { ActualiteService } from '../../services/Actualite/actualite.service';
import { EvennementService } from '../../services/Evennement/evennement.service';
import { Evennement } from '../../models/Evennement/evennement';
import { Actualite } from '../../models/Actualite/actualite';
import { ActualiteCardComponent } from '../../components/card/actualite-card/actualite-card.component';
import { EvennementCardComponent } from "../../components/card/evennement-card/evennement-card.component";
import { SpinnerComponent } from '../../components/spinner/spinner.component';

@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, ActualiteCardComponent, EvennementCardComponent, SpinnerComponent],
  templateUrl: './accueil.component.html',
  styleUrl: './accueil.component.css'
})
export class AccueilComponent implements OnInit {
  public listeActualites: Actualite[] = [];
  public listeEvennements: Evennement[] = [];
  loadingEvents: boolean = true;
  loadingActualites: boolean = true;
  errorEvents: boolean = false;
  errorActualites: boolean = false;
  private readonly actualiteService = inject(ActualiteService);
  private readonly evennementService = inject(EvennementService);
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
    this.evennementService.getAllEvennements().subscribe({
      next: (data) => {
        this.listeEvennements = data;
        this.loadingEvents = false;
      },
      error: (err) => {
        console.error(err);
        this.loadingEvents = false;
        this.errorEvents = true;
      }
    });
    this.sortEvennementByDate(this.listeEvennements);
  }
  public sortEvennementByDate(a: Evennement[]): Evennement[] {
    return a.sort((a, b) => a.date_evennement.getTime() - b.date_evennement.getTime());
  }
  public sortActualiteByDate(a: Actualite[]): Actualite[] {
    return a.sort((a, b) => a.date_publication.getTime() - b.date_publication.getTime());
  }
}
