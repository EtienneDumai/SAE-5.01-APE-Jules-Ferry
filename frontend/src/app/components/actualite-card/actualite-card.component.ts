import { Component, Input } from '@angular/core';
import { StatutActualite } from '../../enums/StatutActualite/statut-actualite';

@Component({
  selector: 'app-actualite-card',
  standalone: true,
  imports: [],
  templateUrl: './actualite-card.component.html',
  styleUrl: './actualite-card.component.css'
})
export class ActualiteCardComponent {
  @Input() titre!: string;
  @Input() contenu!: string;
  @Input() image_url!: string;
  @Input() datePublication!: Date;
  @Input() statut!: StatutActualite;
}
