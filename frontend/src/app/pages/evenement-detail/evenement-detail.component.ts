import { Component, inject, OnInit } from '@angular/core';

import { AuthService } from '../../services/Auth/auth.service';
import { Evenement } from '../../models/Evenement/evenement';
import { EvenementService } from '../../services/Evenement/evenement.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { Location } from '@angular/common';

@Component({
  selector: 'app-evenement-detail',
  standalone: true,
  imports: [SpinnerComponent, RouterModule],
  templateUrl: './evenement-detail.component.html',
  styleUrl: './evenement-detail.component.css'
})
export class EvenementDetailComponent implements OnInit {
    getImageUrl(image_url: string): string {
      if (!image_url) return '';
      if (image_url.startsWith('http')) return image_url;
      return 'http://localhost:8000' + image_url;
    }
  Date: Date = new Date();
  evenement !: Evenement;
  loadingEvenement = true;
  errorEvenement = false;
  private readonly appServices = {
    evenement: inject(EvenementService),
    auth: inject(AuthService)
  };
  private readonly angularServices = {
    route: inject(ActivatedRoute),
    location: inject(Location)
  };
  ngOnInit(): void {
    const id = Number(this.angularServices.route.snapshot.paramMap.get('id'));
    this.appServices.evenement.getEvenementById(id).subscribe({
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
    this.angularServices.location.back();
  }
}
