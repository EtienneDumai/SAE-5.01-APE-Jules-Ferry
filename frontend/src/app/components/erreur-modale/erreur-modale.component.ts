import { Component,Input,inject } from '@angular/core';
import { Location } from '@angular/common';
@Component({
  selector: 'app-erreur-modale',
  standalone: true,
  imports: [],
  templateUrl: './erreur-modale.component.html',
  styleUrl: './erreur-modale.component.css'
})
export class ErreurModaleComponent {

@Input() messageErreur: string = "";
@Input() routeRedirection!: string;
private location: Location = inject(Location);

  fermer(): void {
    if (this.routeRedirection) {
      this.location.go(this.routeRedirection);
    } else {
      this.location.back();
    }
  }
}
