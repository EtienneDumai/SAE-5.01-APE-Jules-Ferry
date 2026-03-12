import { Component, inject,  OnInit } from '@angular/core';
import { ToastService } from '../../services/Toast/toast.service';
import { TypeErreurToast } from '../../enums/TypeErreurToast/type-erreur-toast';
import { AlertComponent } from '../../components/alert/alert.component';
import { Actualite } from '../../models/Actualite/actualite';
import { ActualiteService } from '../../services/Actualite/actualite.service';
import { AuthService } from '../../services/Auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SpinnerComponent } from "../../components/spinner/spinner.component";
import { Location, DatePipe } from '@angular/common';
import { UtilisateurService } from '../../services/Utilisateur/utilisateur.service';
import { Utilisateur } from '../../models/Utilisateur/utilisateur';


@Component({
  selector: 'app-actualite-detail',
  standalone: true,
  imports: [SpinnerComponent, DatePipe, AlertComponent],
  templateUrl: './actualite-detail.component.html',
  styleUrl: './actualite-detail.component.css'
})
export class ActualiteDetailComponent implements OnInit {
  showDeleteModal = false;
  actualite !: Actualite;
  loadingActualite = true;
  errorActualite = false;
  errorAuteur= false;
  auteur !: Utilisateur;
  isAdmin =false;
  private readonly utilisateurService : UtilisateurService = inject(UtilisateurService);
  private readonly actualiteService : ActualiteService = inject(ActualiteService);
  protected readonly authService : AuthService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly router: Router = inject(Router);
  private location: Location = inject(Location);

  ngOnInit() : void{
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.actualiteService.getActualiteById(Number(id)).subscribe({
      next: (data) => {
        this.actualite = data;
        this.loadingActualite = false;
        this.utilisateurService.getUtilisateurById(this.actualite.id_auteur).subscribe({
          next : (data) =>{
            this.auteur = data;
            this.isAdmin = this.authService.hasRole('administrateur');
          },
          error: (err) => {
            console.error(err);
            this.errorAuteur = true;
          }
        });
      },
      error: (err) => {
        console.error(err);
        this.loadingActualite = false;
        this.errorActualite = true;
      }
    });
  }
    public convertDateToString(date: Date| string): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }
  goBack(): void {
    this.location.back();
  }
  getImageUrl(url: string | null): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return 'http://localhost:8000' + url;
  }
  editActualite(): void {
    this.router.navigate([`/actualites/${this.actualite.id_actualite}/edit`]);
  }

  confirmDelete(): void {
    this.showDeleteModal = true;
  }

  confirmerSuppression(): void {
    this.actualiteService.deleteActualite(this.actualite.id_actualite).subscribe({
      next: () => {
        this.toastService.showWithTimeout('Actualité supprimée avec succès.', TypeErreurToast.SUCCESS);
        this.router.navigate(['/actualites']);
      },
      error: (error) => {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de l\'actualité.');
      }
    });
    this.showDeleteModal = false;
  }

  annulerSuppression(): void {
    this.showDeleteModal = false;
  }
}