import { Component, inject, OnInit } from '@angular/core';
import { Tache } from '../../models/Tache/tache';
import { TacheService } from '../../services/Tache/tache.service';
import { EvenementService } from '../../services/Evenement/evenement.service';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from '../../services/Toast/toast.service';
import { TypeErreurToast } from '../../enums/TypeErreurToast/type-erreur-toast';
import { Evenement } from '../../models/Evenement/evenement';

@Component({
  selector: 'app-inscription-evenement',
  standalone: true,
  imports: [],
  templateUrl: './inscription-evenement.component.html',
  styleUrl: './inscription-evenement.component.css'
})
export class InscriptionEvenementComponent implements OnInit {
  listeTaches: Tache[] = [];
  evenement!: Evenement;
  private readonly tacheService = inject(TacheService);
  private readonly evenementService = inject(EvenementService);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly toastService = inject(ToastService);
  ngOnInit(): void {
    const id_evennement = this.route.snapshot.paramMap.get('id');
    this.tacheService.getAlltachesByIdEvennement(Number(id_evennement)).subscribe({
      next: (data) => {
        this.listeTaches = data;
      },
      error: (err) => {
        console.error(err);
        this.toastService.show('Erreur lors du chargement des tâches de l\'événement', TypeErreurToast.ERROR);
      }
    });
    this.evenementService.getEvenementById(Number(id_evennement)).subscribe({
      next: (data: Evenement) => {
        this.evenement = data;
      },
      error: (err: any) => {
        console.error(err);
        this.toastService.show('Erreur lors du chargement de l\'événement', TypeErreurToast.ERROR);
      }
    });
  }
}
