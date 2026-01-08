import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { EvenementService } from '../../services/Evenement/evenement.service';
import { Evenement } from '../../models/Evenement/evenement';
import { AuthService } from '../../services/Auth/auth.service';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { EvenementCardComponent } from '../../components/card/evenement-card/evenement-card.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterLink, SpinnerComponent, EvenementCardComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  listeEvenements: Evenement[] = [];
  loadingEvenements = true;
  errorEvenements = false;
  isAdmin = false;

  private readonly evenementService = inject(EvenementService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.isAdmin = this.authService.hasRole('administrateur');
    if (!this.isAdmin) {
      this.router.navigate(['/']);
      return;
    }
    this.evenementService.getAllEvenements().subscribe({
      next: (data) => {
        this.listeEvenements = data;
        this.loadingEvenements = false;
      },
      error: () => {
        this.errorEvenements = true;
        this.loadingEvenements = false;
      }
    });
  }

  handleEventDeleted(id: number): void {
    this.listeEvenements = this.listeEvenements.filter(e => e.id_evenement !== id);
  }

  deleteEvenement(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer cet événement ?')) {
      this.evenementService.deleteEvenement(id).subscribe({
        next: () => {
          this.listeEvenements = this.listeEvenements.filter(e => e.id_evenement !== id);
        },
        error: () => alert('Erreur lors de la suppression de l\'événement.')
      });
    }
  }
}
