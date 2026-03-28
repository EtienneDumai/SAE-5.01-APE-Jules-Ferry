/**
 * Fichier : frontend/src/app/pages/administration-page/administration-page.component.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier gere la logique de la page administration page.
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminComptesComponent } from './admin-comptes/admin-comptes.component';
import { AdminEvenementsComponent } from './admin-evenements/admin-evenements.component';
import { AdminNewslettersComponent } from './admin-newsletters/admin-newsletters.component';

@Component({
  selector: 'app-administration-page',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminComptesComponent, AdminEvenementsComponent, AdminNewslettersComponent],
  templateUrl: './administration-page.component.html',
  styleUrl: './administration-page.component.css'
})
export class AdministrationPageComponent {
  activeTab: 'comptes' | 'evenements' | 'newsletters' = 'comptes';

  switchTab(tab: 'comptes' | 'evenements' | 'newsletters') {
    this.activeTab = tab;
  }
}
