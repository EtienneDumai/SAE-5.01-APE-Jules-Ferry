import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';

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
import { ErreurModaleComponent } from '../../components/erreur-modale/erreur-modale.component';

@Component({
  selector: 'app-evenement-detail',
  standalone: true,
  imports: [SpinnerComponent, ErreurModaleComponent, DatePipe, CommonModule, FormsModule],
  templateUrl: './evenement-detail.component.html',
  styleUrl: './evenement-detail.component.css'
})
export class EvenementDetailComponent implements OnInit {
  
  // Données
  evenement!: Evenement;
  auteur: Utilisateur | undefined;
  formulaire?: Formulaire;
  
  loadingEvenement = true;
  loadingFormulaire = false;
  errorEvenement = false;
  errorAuteur = false;
  errorFormulaire = false;

  showInscriptionForm = false;
  commentaire = '';
  isSubmitting = false;
  inscriptionSuccess = false;
  inscriptionError: string | null = null;

  mesCreneauxActuels: Creneau[] = [];

  private readonly utilisateurService = inject(UtilisateurService);
  private readonly evenementService = inject(EvenementService);
  private readonly formulaireService = inject(FormulaireService);
  private readonly inscriptionService = inject(InscriptionService);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadEvenement(id);
  }

  loadEvenement(id: number) {
    this.loadingEvenement = true;
    this.evenementService.getEvenementById(id).subscribe({
      next: (data) => {
        this.evenement = data;
        this.loadingEvenement = false;
        
        if(this.evenement.id_auteur) {
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
    
    console.log("UTILISATEUR CONNECTÉ :", user); //a suppr c'est du debug pour moi
    console.log("FORMULAIRE REÇU :", this.formulaire); // Pareil

    //verif formulaire et tâches existent avant de continuer
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

  // --- VALIDATION (AJOUT / SUPPRESSION) ---

  validerModification() {
    // SÉCURITÉ : On vérifie que tout est chargé
    if (!this.formulaire || !this.formulaire.taches) return;

    const ajouts: number[] = [];
    const suppressions: number[] = [];

    this.formulaire.taches.forEach(tache => {
      tache.creneaux?.forEach(creneau => {
        // Cas 1 : Je n'étais pas inscrit -> J'ai coché -> AJOUT
        if (!creneau.est_inscrit && creneau.selected) {
           ajouts.push(creneau.id_creneau);
        }
        // Cas 2 : J'étais inscrit -> J'ai décoché -> SUPPRESSION
        if (creneau.est_inscrit && !creneau.selected) {
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

    // On prépare toutes les requêtes (RxJS forkJoin)
    // Note : le "as any" ici évite des erreurs de type strict sur le body
    const requetes = [
      ...ajouts.map(id => this.inscriptionService.createInscription({ id_creneau: id, commentaire: this.commentaire } as any)),
      ...suppressions.map(id => this.inscriptionService.deleteInscription(id))
    ];

    forkJoin(requetes).subscribe({
      next: () => {
        this.inscriptionSuccess = true;
        this.isSubmitting = false;
        
        // On recharge tout pour mettre à jour les quotas et l'affichage
        // Le "!" dit à TypeScript qu'on est sûr que l'ID existe ici
        this.loadFormulaire(this.evenement.id_formulaire!);
        
        setTimeout(() => {
          this.showInscriptionForm = false;
          this.inscriptionSuccess = false;
          this.commentaire = '';
        }, 2000);
      },
      error: (err) => {
        console.error(err);
        this.inscriptionError = err.error?.message || "Erreur lors de la mise à jour des inscriptions.";
        this.isSubmitting = false;
      }
    });
  }

  goBack(): void {
    this.location.back();
  }
}