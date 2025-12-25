import { Component, inject, OnInit } from '@angular/core';
import { EvennementService } from '../../services/Evennement/evennement.service';
import { Evennement } from '../../models/Evennement/evennement';
import { EvennementCardComponent } from "../../components/evennement-card/evennement-card.component";

@Component({
  selector: 'app-evennement-page',
  standalone: true,
  imports: [EvennementCardComponent],
  templateUrl: './evennement-page.component.html',
  styleUrl: './evennement-page.component.css'
})
export class EvennementPageComponent implements OnInit {
  listeEvennements!: Evennement[];
    Date: Date = new Date();
    private readonly evennementService = inject(EvennementService);
    ngOnInit() {
      this.evennementService.getAllEvennements().subscribe((data) => {
        this.listeEvennements = data;
      });
      this.sortEvennementByDate(this.listeEvennements);
    }
    public sortEvennementByDate(a: Evennement[]): Evennement[] {
      return a.sort((a, b) => a.date_evennement.getTime() - b.date_evennement.getTime());
    }
}
