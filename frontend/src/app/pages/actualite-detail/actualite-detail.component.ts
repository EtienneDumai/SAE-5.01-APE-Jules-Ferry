import { Component, inject,  OnInit } from '@angular/core';
import { Actualite } from '../../models/Actualite/actualite';
import { ActualiteService } from '../../services/Actualite/actualite.service';
import { ActivatedRoute } from '@angular/router';
import { SpinnerComponent } from "../../components/spinner/spinner.component";
import { ErreurModaleComponent } from '../../components/erreur-modale/erreur-modale.component';
import { Location } from '@angular/common';
@Component({
  selector: 'app-actualite-detail',
  standalone: true,
  imports: [SpinnerComponent, ErreurModaleComponent],
  templateUrl: './actualite-detail.component.html',
  styleUrl: './actualite-detail.component.css'
})
export class ActualiteDetailComponent implements OnInit {
  actualite !: Actualite;
  loadingActualite: boolean = true;
  errorActualite : boolean = false
  private readonly actualiteService : ActualiteService = inject(ActualiteService);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private location: Location = inject(Location);
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
    public convertDateToString(date: Date| string): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }
  goBack(): void {
    this.location.back();
  }
}