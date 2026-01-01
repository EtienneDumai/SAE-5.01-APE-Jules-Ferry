import { Component, inject, OnInit } from '@angular/core';
import { Actualite } from '../../models/Actualite/actualite';
import { ActualiteService } from '../../services/Actualite/actualite.service';
import { ActualiteCardComponent } from "../../components/card/actualite-card/actualite-card.component";
import { HeaderComponent } from "../../components/header/header.component";
import { SpinnerComponent } from "../../components/spinner/spinner.component";

@Component({
  selector: 'app-actualite-page',
  standalone: true,
  imports: [ActualiteCardComponent, HeaderComponent, SpinnerComponent],
  templateUrl: './actualite-page.component.html',
  styleUrl: './actualite-page.component.css'
})
export class ActualitePageComponent implements OnInit {
  listeActualites!: Actualite[];
  Date: Date = new Date();
  loadingActualites: boolean = true;
  errorActualites: boolean = false;
  private readonly actualiteService = inject(ActualiteService);
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
    this.sortActualiteByDate(this.listeActualites);
  }
  public sortActualiteByDate(a: Actualite[]): Actualite[] {
    return a.sort((a, b) => a.date_publication.getTime() - b.date_publication.getTime());
  }
}
