import { Component, inject } from '@angular/core';
import { HeaderComponent } from "../../components/header/header.component";
import { FooterComponent } from "../../components/footer/footer.component";
import { ActualiteService } from '../../services/Actualite/actualite.service';
import { EvennementService } from '../../services/Evennement/evennement.service';
import { Evennement } from '../../models/Evennement/evennement';
import { Actualite } from '../../models/Actualite/actualite';
import { ActualiteCardComponent } from '../../components/actualite-card/actualite-card.component';
@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, ActualiteCardComponent],
  templateUrl: './accueil.component.html',
  styleUrl: './accueil.component.css'
})
export class AccueilComponent {
  public listeActualites: Actualite[] = [];
  public listeEvennements: Evennement[] = [];
  private readonly actualiteService = inject(ActualiteService);
  private readonly evennementService = inject(EvennementService);
  ngOnInit() {
    this.actualiteService.getAllActualites().subscribe((data) => {
      this.listeActualites = data;
    });
    this.evennementService.getAllEvennements().subscribe((data) => {
      this.listeEvennements = data;
    });
  }
}
