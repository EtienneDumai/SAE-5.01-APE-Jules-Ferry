import { Component, Input } from '@angular/core';
import { StatutActualite } from '../../../enums/StatutActualite/statut-actualite';
import { RouterLink } from '@angular/router';
import { DatePipe, CommonModule } from '@angular/common';

@Component({
  selector: 'app-actualite-card',
  standalone: true,
  imports: [RouterLink, DatePipe, CommonModule],
  templateUrl: './actualite-card.component.html',
  styleUrl: './actualite-card.component.css'
})
export class ActualiteCardComponent {
  @Input() id_actualite!: number;
  @Input() titre = '';
  @Input() contenu!: string;
  @Input() image_url!: string | null;
  @Input() datePublication!: Date;
  @Input() statut!: StatutActualite;

  getImageUrl(url: string | null): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return 'http://localhost:8000' + url;
  }
}