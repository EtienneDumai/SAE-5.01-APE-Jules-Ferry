import { Component, inject, OnInit } from '@angular/core';
import { Actualite } from '../../models/Actualite/actualite';
import { ActualiteService } from '../../services/Actualite/actualite.service';
import { ActualiteCardComponent } from "../../components/actualite-card/actualite-card.component";
import { HeaderComponent } from "../../components/header/header.component";

@Component({
  selector: 'app-actualite-page',
  standalone: true,
  imports: [ActualiteCardComponent, HeaderComponent],
  templateUrl: './actualite-page.component.html',
  styleUrl: './actualite-page.component.css'
})
export class ActualitePageComponent implements OnInit {
  listeActualites!: Actualite[];
  Date: Date = new Date();
  private readonly actualiteService = inject(ActualiteService);
  ngOnInit() {
    this.actualiteService.getAllActualites().subscribe((data) => {
      this.listeActualites = data;
    });
    this.sortActualiteByDate(this.listeActualites);
  }
  public sortActualiteByDate(a: Actualite[]): Actualite[] {
    return a.sort((a, b) => a.date_publication.getTime() - b.date_publication.getTime());
  }
}
