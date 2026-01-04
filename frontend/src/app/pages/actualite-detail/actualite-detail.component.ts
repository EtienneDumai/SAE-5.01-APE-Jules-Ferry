import { Component, inject, Input, OnInit } from '@angular/core';
import { Actualite } from '../../models/Actualite/actualite';
import { ActualiteService } from '../../services/Actualite/actualite.service';
import { ActivatedRoute } from '@angular/router';
import { SpinnerComponent } from "../../components/spinner/spinner.component";
import { ActualiteCardComponent } from "../../components/card/actualite-card/actualite-card.component";

@Component({
  selector: 'app-actualite-detail',
  standalone: true,
  imports: [SpinnerComponent, ActualiteCardComponent],
  templateUrl: './actualite-detail.component.html',
  styleUrl: './actualite-detail.component.css'
})
export class ActualiteDetailComponent implements OnInit {
  actualite !: Actualite;
  loadingActualite: boolean = true;
  errorActualite : boolean = false
  private readonly actualiteService : ActualiteService = inject(ActualiteService);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  ngOnInit() : void{
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.actualiteService.getActualiteById(Number(id)).subscribe({
      next: (data) => {
        this.actualite = data;
        this.loadingActualite = false;
      },
      error: (err) => {
        console.error(err);
        this.loadingActualite = false;
        this.errorActualite = true;
      }
    });
  }
}