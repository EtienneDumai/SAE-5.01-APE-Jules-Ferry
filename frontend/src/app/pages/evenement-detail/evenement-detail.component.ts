import { Component, inject, OnInit } from '@angular/core';
import { Evenement } from '../../models/Evenement/evenement';
import { EvenementService } from '../../services/Evenement/evenement.service';
import { ActivatedRoute } from '@angular/router';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { Location } from '@angular/common';
@Component({
  selector: 'app-evenement-detail',
  standalone: true,
  imports: [SpinnerComponent],
  templateUrl: './evenement-detail.component.html',
  styleUrl: './evenement-detail.component.css'
})
export class EvenementDetailComponent implements OnInit {
  Date: Date = new Date();
  evenement !: Evenement;
  loadingEvenement = true;
  errorEvenement = false;
  private readonly evenementService: EvenementService = inject(EvenementService);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private location: Location = inject(Location);
  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.evenementService.getEvenementById(id).subscribe({
      next: (data) => {
        this.evenement = data;
        this.loadingEvenement = false;
      },
      error: (err) => {
        console.error(err);
        this.loadingEvenement = false;
        this.errorEvenement = true;
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
