import { Component, inject, OnInit } from '@angular/core';
import { EvenementService } from '../../services/Evenement/evenement.service';
import { Evenement } from '../../models/Evenement/evenement';
import { EvenementCardComponent } from "../../components/card/evenement-card/evenement-card.component";
import { SpinnerComponent } from "../../components/spinner/spinner.component";
import { RouterLink } from '@angular/router'; 
@Component({
  selector: 'app-evenement-page',
  standalone: true,
  imports: [EvenementCardComponent, SpinnerComponent, RouterLink],
  templateUrl: './evenement-page.component.html',
  styleUrl: './evenement-page.component.css'
})
export class EvenementPageComponent implements OnInit {
  listeEvenements!: Evenement[];
  Date: Date = new Date();
  loadingEvenements = true;
  errorEvenements = false;
  private readonly evenementService = inject(EvenementService);
  ngOnInit() {
    this.evenementService.getAllEvenements().subscribe({
      next: (data) => {
        this.listeEvenements = data;
        this.sortEvenementByDate();
        this.loadingEvenements = false;
      },
      error: (err) => {
        console.error(err);
        this.loadingEvenements = false;
        this.errorEvenements = true;
      }
    });
  }
public sortEvenementByDate(): void {
  const sortedList = [...this.listeEvenements];
    sortedList.sort((a, b) => {
      const dateA = new Date(a.date_evenement).getTime();
      const dateB = new Date(b.date_evenement).getTime();
      return dateB - dateA; 
    });
    this.listeEvenements = sortedList;
  }
}
