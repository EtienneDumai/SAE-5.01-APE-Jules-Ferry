import { Component, inject, OnInit } from '@angular/core';
import { EvennementService } from '../../services/Evennement/evennement.service';
import { Evennement } from '../../models/Evennement/evennement';
import { EvennementCardComponent } from "../../components/card/evennement-card/evennement-card.component";
import { SpinnerComponent } from "../../components/spinner/spinner.component";

@Component({
  selector: 'app-evennement-page',
  standalone: true,
  imports: [EvennementCardComponent, SpinnerComponent],
  templateUrl: './evennement-page.component.html',
  styleUrl: './evennement-page.component.css'
})
export class EvennementPageComponent implements OnInit {
  listeEvennements!: Evennement[];
  Date: Date = new Date();
  loadingEvennements: boolean = true;
  errorEvennements: boolean = false;
  private readonly evennementService = inject(EvennementService);
  ngOnInit() {
    this.evennementService.getAllEvennements().subscribe({
      next: (data) => {
        this.listeEvennements = data;
        this.loadingEvennements = false;
      },
      error: (err) => {
        console.error(err);
        this.loadingEvennements = false;
        this.errorEvennements = true;
      }
    });
    this.sortEvennementByDate(this.listeEvennements);
  }
  public sortEvennementByDate(a: Evennement[]): Evennement[] {
    return a.sort((a, b) => a.date_evennement.getTime() - b.date_evennement.getTime());
  }
}
