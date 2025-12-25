import { Component, inject, OnInit } from '@angular/core';
import { HeaderComponent } from "../../components/header/header.component";
import { FooterComponent } from "../../components/footer/footer.component";
import { ActualiteService } from '../../services/Actualite/actualite.service';
import { EvennementService } from '../../services/Evennement/evennement.service';
import { Evennement } from '../../models/Evennement/evennement';
import { Actualite } from '../../models/Actualite/actualite';
import { ActualiteCardComponent } from '../../components/actualite-card/actualite-card.component';
import { EvennementCardComponent } from "../../components/evennement-card/evennement-card.component";
@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, ActualiteCardComponent, EvennementCardComponent],
  templateUrl: './accueil.component.html',
  styleUrl: './accueil.component.css'
})
export class AccueilComponent implements OnInit {
  public listeActualites: Actualite[] = [];
  public listeEvennements: Evennement[] = [];
  private readonly actualiteService = inject(ActualiteService);
  private readonly evennementService = inject(EvennementService);
  Date: Date = new Date();
  ngOnInit() {
    this.actualiteService.getAllActualites().subscribe((data) => {
      this.listeActualites = data;
    });
    this.sortActualiteByDate(this.listeActualites);
    this.evennementService.getAllEvennements().subscribe((data) => {
      this.listeEvennements = data;
    });
  }
  public sortEvennementByDate(a: Evennement[]): Evennement[] {
    return a.sort((a, b) => a.date_evennement.getTime() - b.date_evennement.getTime());
  }
  public sortActualiteByDate(a: Actualite[]): Actualite[] {
    return a.sort((a, b) => a.date_publication.getTime() - b.date_publication.getTime());
  }
}
