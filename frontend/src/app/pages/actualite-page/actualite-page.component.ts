import { Component, inject, OnInit } from '@angular/core';
import { Actualite } from '../../models/Actualite/actualite';
import { ActualiteService } from '../../services/Actualite/actualite.service';
import { ActualiteCardComponent } from "../../components/card/actualite-card/actualite-card.component";
import { SpinnerComponent } from "../../components/spinner/spinner.component";
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-actualite-page',
  standalone: true,
  imports: [ActualiteCardComponent, SpinnerComponent, RouterLink],
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
}
