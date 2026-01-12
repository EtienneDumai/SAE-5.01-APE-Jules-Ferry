import { Component, Input } from '@angular/core';
import { StatutEvenement } from '../../../enums/StatutEvenement/statut-evenement';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-evenement-card',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './evenement-card.component.html',
  styleUrl: './evenement-card.component.css'
})
export class EvenementCardComponent {
  @Input() id_evenement!: number;
  @Input() titre = '';
  @Input() description!: string;
  @Input() date_evenement!: Date;
  @Input() heure_debut!: string;
  @Input() heure_fin!: string;
  @Input() lieu!: string;
  @Input() image_url!: string;
  @Input() statut!: StatutEvenement;
}
