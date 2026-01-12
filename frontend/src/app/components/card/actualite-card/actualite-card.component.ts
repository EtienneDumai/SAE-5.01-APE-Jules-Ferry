import { Component, Input } from '@angular/core';
import { StatutActualite } from '../../../enums/StatutActualite/statut-actualite';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-actualite-card',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './actualite-card.component.html',
  styleUrl: './actualite-card.component.css'
})
export class ActualiteCardComponent {
  @Input() id_actualite!: number;
  @Input() titre: string = '';
  @Input() contenu!: string;
  @Input() image_url!: string;
  @Input() datePublication!: Date;
  @Input() statut!: StatutActualite;
}
