import { Component, inject, OnInit } from '@angular/core';
import { Tache } from '../../models/Tache/tache';
import { TacheService } from '../../services/Tache/tache.service';
import { EvennementService } from '../../services/Evennement/evennement.service';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from '../../services/Toast/toast.service';
import { TypeErreurToast } from '../../enums/TypeErreurToast/type-erreur-toast';
import { Evennement } from '../../models/Evennement/evennement';

@Component({
  selector: 'app-inscription-evenement',
  standalone: true,
  imports: [],
  templateUrl: './inscription-evenement.component.html',
  styleUrl: './inscription-evenement.component.css'
})
export class InscriptionEvenementComponent implements OnInit {
  listeTaches: Tache[] = [];
  evenement!: Evennement;
  private readonly tacheService = inject(TacheService);
  private readonly evenementService = inject(EvennementService);
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
    this.evenementService.getEvennementById(Number(id_evennement)).subscribe({
      next: (data) => {
        this.evenement = data;
      },
      error: (err) => {
        console.error(err);
        this.toastService.show('Erreur lors du chargement de l\'événement', TypeErreurToast.ERROR);
      }
    });
  }
}
