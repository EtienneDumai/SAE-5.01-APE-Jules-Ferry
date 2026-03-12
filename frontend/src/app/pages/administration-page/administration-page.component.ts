import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminComptesComponent } from './admin-comptes/admin-comptes.component';
import { AdminEvenementsComponent } from './admin-evenements/admin-evenements.component';

@Component({
  selector: 'app-administration-page',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminComptesComponent, AdminEvenementsComponent],
  templateUrl: './administration-page.component.html',
  styleUrl: './administration-page.component.css'
})
export class AdministrationPageComponent {
  activeTab: 'comptes' | 'evenements' = 'comptes';

  switchTab(tab: 'comptes' | 'evenements') {
    this.activeTab = tab;
  }
}
