import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InscriptionEvenementComponent } from './inscription-evenement.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { TacheService } from '../../services/Tache/tache.service';
import { EvenementService } from '../../services/Evenement/evenement.service';
import { ToastService } from '../../services/Toast/toast.service';
import { TypeErreurToast } from '../../enums/TypeErreurToast/type-erreur-toast';
import { Evenement } from '../../models/Evenement/evenement';
import { Tache } from '../../models/Tache/tache';
import { StatutEvenement } from '../../enums/StatutEvenement/statut-evenement';

describe('InscriptionEvenementComponent', () => {
  let component: InscriptionEvenementComponent;
  let fixture: ComponentFixture<InscriptionEvenementComponent>;
  let tacheServiceSpy: jasmine.SpyObj<TacheService>;
  let evenementServiceSpy: jasmine.SpyObj<EvenementService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;

  const mockEvenement: Evenement = {
    id_evenement: 1,
    titre: 'Événement test',
    description: 'Description test',
    date_evenement: new Date(),
    heure_debut: '10:00',
    heure_fin: '12:00',
    lieu: 'Salle test',
    image_url: 'test.jpg',
    statut: StatutEvenement.publie,
    id_auteur: 1,
    id_formulaire: 1
  };

  const mockTaches: Tache[] = [
    {
      id_tache: 1,
      nom_tache: 'Tache 1',
      description: 'Description 1',
      heure_debut_globale: '10:00',
      heure_fin_globale: '11:00',
      id_formulaire: 1,
      creneaux: []
    }
  ];

  beforeEach(async () => {
    tacheServiceSpy = jasmine.createSpyObj('TacheService', ['getAlltachesByIdEvennement']);
    evenementServiceSpy = jasmine.createSpyObj('EvenementService', ['getEvenementById']);
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['show']);

    tacheServiceSpy.getAlltachesByIdEvennement.and.returnValue(of(mockTaches));
    evenementServiceSpy.getEvenementById.and.returnValue(of(mockEvenement));

    await TestBed.configureTestingModule({
      imports: [InscriptionEvenementComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: TacheService, useValue: tacheServiceSpy },
        { provide: EvenementService, useValue: evenementServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => '1'
              }
            }
          }
        }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(InscriptionEvenementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('devrait créer', () => {
    expect(component).toBeTruthy();
  });

  it('devrait charger les tâches et l\'événement à l\'initialisation', () => {
    expect(tacheServiceSpy.getAlltachesByIdEvennement).toHaveBeenCalledWith(1);
    expect(evenementServiceSpy.getEvenementById).toHaveBeenCalledWith(1);
    expect(component.listeTaches).toEqual(mockTaches);
    expect(component.evenement).toEqual(mockEvenement);
  });

  it('devrait afficher une erreur si le chargement des tâches échoue', () => {
    tacheServiceSpy.getAlltachesByIdEvennement.and.returnValue(throwError(() => new Error('Erreur')));
    component.ngOnInit();
    expect(toastServiceSpy.show).toHaveBeenCalledWith('Erreur lors du chargement des tâches de l\'événement', TypeErreurToast.ERROR);
  });

  it('devrait afficher une erreur si le chargement de l\'événement échoue', () => {
    evenementServiceSpy.getEvenementById.and.returnValue(throwError(() => new Error('Erreur')));
    component.ngOnInit();
    expect(toastServiceSpy.show).toHaveBeenCalledWith('Erreur lors du chargement de l\'événement', TypeErreurToast.ERROR);
  });
});
