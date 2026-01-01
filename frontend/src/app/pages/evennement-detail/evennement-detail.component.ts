import { Component, inject, OnInit } from '@angular/core';
import { Evennement } from '../../models/Evennement/evennement';
import { EvennementService } from '../../services/Evennement/evennement.service';
import { ActivatedRoute } from '@angular/router';
import { EvennementCardComponent } from "../../components/card/evennement-card/evennement-card.component";
import { SpinnerComponent } from '../../components/spinner/spinner.component';

@Component({
  selector: 'app-evennement-detail',
  standalone: true,
  imports: [EvennementCardComponent, SpinnerComponent],
  templateUrl: './evennement-detail.component.html',
  styleUrl: './evennement-detail.component.css'
})
export class EvennementDetailComponent implements OnInit {
  Date: Date = new Date();
  evennement !: Evennement;
  loadingEvennement: boolean = true;
  errorEvennement : boolean = false;
  private readonly evennementService: EvennementService = inject(EvennementService);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.evennementService.getEvennementById(id).subscribe({
      next: (data) => {
        this.evennement = data;
        this.loadingEvennement = false;
      },
      error: (err) => {
        console.error(err);
        this.loadingEvennement = false;
        this.errorEvennement = true;
      }
    });
  }
}
