import { Component, inject, OnInit } from '@angular/core';
import { DatePipe, Location, CommonModule, AsyncPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { Evenement } from '../../models/Evenement/evenement';
import { Formulaire } from '../../models/Formulaire/formulaire';
import { Creneau } from '../../models/Creneau/creneau';
import { Utilisateur } from '../../models/Utilisateur/utilisateur';
import { EvenementService } from '../../services/Evenement/evenement.service';
import { FormulaireService } from '../../services/Formulaire/formulaire.service';
import { InscriptionService } from '../../services/Inscription/inscription.service';
import { UtilisateurService } from '../../services/Utilisateur/utilisateur.service';
import { AuthService } from '../../services/Auth/auth.service';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { FormsModule } from '@angular/forms';
import { FormInscriptionEvenementComponent, InscriptionSubmitPayload } from '../../components/forms/form-inscription-evenement/form-inscription-evenement.component';

@Component({
  selector: 'app-evenement-detail',
  standalone: true,
  imports: [SpinnerComponent, DatePipe, FormsModule, FormInscriptionEvenementComponent, AsyncPipe, RouterLink, CommonModule],
  templateUrl: './evenement-detail.component.html',
  styleUrl: './evenement-detail.component.css'
})
export class EvenementDetailComponent implements OnInit {

  //Données pour le formulaire d'inscription
  mesCreneauxActuels: Creneau[] = [];
  loadingFormulaire = false;
  errorFormulaire = false;
  formulaire?: Formulaire;
  isSubmitting = false;
  inscriptionSuccess = false;
  inscriptionError: string | null = null;
  evenement!: Evenement;
  auteur: Utilisateur | undefined;
  loadingEvenement = true;
  errorEvenement = false;
  errorAuteur = false;
  showInscriptionForm = false;

  currentUser$: Observable<Utilisateur | null> | undefined;

  //injection de dependances
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly evenementService = inject(EvenementService);
  private readonly formulaireService = inject(FormulaireService);
  private readonly inscriptionService = inject(InscriptionService);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  ngOnInit() {
    this.currentUser$ = this.authService.currentUser$;
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadEvenement(id);
  }

  loadEvenement(id: number) {
    this.loadingEvenement = true;
    this.evenementService.getEvenementById(id).subscribe({
      next: (data) => {
        this.evenement = data;
        this.loadingEvenement = false;
        if (this.evenement.id_auteur) {
          this.utilisateurService.getUtilisateurById(this.evenement.id_auteur).subscribe({
            next: (u) => this.auteur = u,
            error: () => this.errorAuteur = true
          });
        }
        if (this.evenement.id_formulaire) {
          this.loadFormulaire(this.evenement.id_formulaire);
        }
      },
      error: (err) => {
        console.error(err);
        this.loadingEvenement = false;
        this.errorEvenement = true;
      }
    });
  }

  loadFormulaire(idFormulaire: number) {
    this.loadingFormulaire = true;
    this.formulaireService.getFormulaireById(idFormulaire).subscribe({
      next: (data) => {
        this.formulaire = data;
        this.loadingFormulaire = false;
        this.calculerInscriptionsExistantes();
      },
      error: (err) => {
        console.error(err);
        this.errorFormulaire = true;
        this.loadingFormulaire = false;
      }
    });
  }

  canManage(user: Utilisateur | null): boolean {
    if (!user || !this.evenement) return false;
    
    const role = String(user.role).toLowerCase();

    if (role === 'administrateur') return true;

    if (role === 'membre_bureau') {
      // securisation des types avec ==
      return user.id_utilisateur == this.evenement.id_auteur;
    }

    return false;
  }

  onDeleteEvent() {
    if (!this.evenement) return;
    if (confirm('Voulez-vous vraiment supprimer cet événement ? Cette action est irréversible.')) {
      this.evenementService.deleteEvenement(this.evenement.id_evenement).subscribe({
        next: () => {
          this.router.navigate(['/evenements']);
        },
        error: (err) => console.error(err)
      });
    }
  }

  isEvenementTermine(): boolean {
    return (this.evenement?.statut as unknown as string) === 'termine';
  }

  isInscriptionOuverte(): boolean {
    if (!this.evenement?.date_evenement) return false;
    const dateEvent = new Date(this.evenement.date_evenement);
    const aujourdhui = new Date();
    dateEvent.setHours(0, 0, 0, 0);
    aujourdhui.setHours(0, 0, 0, 0);
    return aujourdhui.getTime() < dateEvent.getTime();
  }

  calculerInscriptionsExistantes() {
    const user = this.authService.getCurrentUser();
    // verif formulaire et tâches existent avant de continuer
    if (!user || !this.formulaire || !this.formulaire.taches) return;
    this.mesCreneauxActuels = [];
    this.formulaire.taches.forEach(tache => {
      tache.creneaux?.forEach(creneau => {
        const estInscrit = creneau.inscriptions?.some(i => i.id_utilisateur === user.id_utilisateur);
        if (estInscrit) {
          creneau.est_inscrit = true;
          creneau.selected = true;
          this.mesCreneauxActuels.push(creneau);
        } else {
          creneau.est_inscrit = false;
          creneau.selected = false;
        }
      });
    });
  }

  toggleInscriptionForm() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: `/evenements/${this.evenement.id_evenement}` }
      });
      return;
    }
    this.showInscriptionForm = !this.showInscriptionForm;
    if (!this.showInscriptionForm) {
      this.inscriptionError = null;
      this.inscriptionSuccess = false;
      this.calculerInscriptionsExistantes();
    }
  }

  isCreneauComplet(creneau: Creneau): boolean {
    //si déjà inscrit, le créneau n'est pas "complet" pour moi (je prends une place)
    // Sinon on regarde le count
    const count = creneau.inscriptions_count || 0;
    return count >= creneau.quota && !creneau.est_inscrit;
  }

  getPlacesRestantes(creneau: Creneau): number {
    return creneau.quota - (creneau.inscriptions_count || 0);
  }

  validerModification(payload: InscriptionSubmitPayload) {
    if (!this.formulaire || !this.formulaire.taches) return;
    // Set pour optimiser les recherches
    const selectedSet = new Set(payload.creneauxSelectionnes);
    const ajouts: number[] = [];
    const suppressions: number[] = [];
    this.formulaire.taches.forEach(tache => {
      tache.creneaux?.forEach(creneau => {
        const isSelected = selectedSet.has(creneau.id_creneau);
        const estInscrit = !!creneau.est_inscrit;
        // pas inscrit + sélectionné => ajout
        if (!estInscrit && isSelected) {
          ajouts.push(creneau.id_creneau);
        }
        // inscrit + non sélectionné => suppression
        if (estInscrit && !isSelected) {
          suppressions.push(creneau.id_creneau);
        }
      });
    });
    if (ajouts.length === 0 && suppressions.length === 0) {
      this.inscriptionError = "Aucune modification détectée.";
      return;
    }
    this.isSubmitting = true;
    this.inscriptionError = null;
    const requetes = [
      ...ajouts.map(id =>
        this.inscriptionService.createInscription({
          id_creneau: id,
          commentaire: payload.commentaire // commentaire qui vient du formulaire enfant de la page
        })
      ),
      ...suppressions.map(id =>
        this.inscriptionService.deleteInscription(id)
      )
    ];
    forkJoin(requetes).subscribe({
      next: () => {
        // update local immédiatement pour une meilleure UX
        const selectedSet = new Set(payload.creneauxSelectionnes);
        this.formulaire?.taches?.forEach(t => {
          t.creneaux?.forEach(c => {
            const was = !!c.est_inscrit;
            const now = selectedSet.has(c.id_creneau);
            if (!was && now) {
              c.est_inscrit = true;
              c.selected = true;
              c.inscriptions_count = (c.inscriptions_count || 0) + 1;
            }
            if (was && !now) {
              c.est_inscrit = false;
              c.selected = false;
              c.inscriptions_count = Math.max(0, (c.inscriptions_count || 0) - 1);
            }
          });
        });
        this.calculerInscriptionsExistantes(); // => met à jour mesCreneauxActuels
        this.inscriptionSuccess = true;
        this.isSubmitting = false;
        this.showInscriptionForm = false;
        // refresh de la page pour refléter les changements
        this.loadFormulaire(this.evenement.id_formulaire!);
        setTimeout(() => this.inscriptionSuccess = false, 2000);
      },
      error: (err) => {
        console.error(err);
        this.inscriptionError = err.error?.message || "Erreur lors de la mise à jour des inscriptions.";
        this.isSubmitting = false;
      }
    });
  }

  handleCancel(): void {
    this.toggleInscriptionForm();
  }

  async handleSubmit(payload: InscriptionSubmitPayload): Promise<void> {
    // payload.creneauxSelectionnes + payload.commentaire
    // => appelez votre service puis mettez à jour success/error
    this.validerModification(payload);
  }
  goBack(): void {
    this.location.back();
  }

  getImageUrl(image_url: string): string {
    if (!image_url) return '';
    if (image_url.startsWith('http')) return image_url;
    return 'http://localhost:8000' + image_url;
  }
}