/**
 * Fichier : frontend/src/app/pages/accueil/accueil.component.spec.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier teste la page accueil.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccueilComponent } from './accueil.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ActualiteService } from '../../services/Actualite/actualite.service';
import { EvenementService } from '../../services/Evenement/evenement.service';
import { of, throwError } from 'rxjs';
import { Actualite } from '../../models/Actualite/actualite';
import { Evenement } from '../../models/Evenement/evenement';
import { By } from '@angular/platform-browser';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { ActualiteCardComponent } from '../../components/card/actualite-card/actualite-card.component';
import { EvenementCardComponent } from '../../components/card/evenement-card/evenement-card.component';
import { StatutActualite } from '../../enums/StatutActualite/statut-actualite';
import { StatutEvenement } from '../../enums/StatutEvenement/statut-evenement';

describe('AccueilComponent', () => {
  let component: AccueilComponent;
  let fixture: ComponentFixture<AccueilComponent>;
  let actualiteServiceSpy: jasmine.SpyObj<ActualiteService>;
  let evenementServiceSpy: jasmine.SpyObj<EvenementService>;

  const mockActualites: Actualite[] = [
    { id_actualite: 1, titre: 'Actu 1', contenu: 'Contenu 1', image_url: 'img1.jpg', date_publication: new Date('2024-01-01'), statut: StatutActualite.publie, id_auteur: 1 },
    { id_actualite: 2, titre: 'Actu 2', contenu: 'Contenu 2', image_url: 'img2.jpg', date_publication: new Date('2024-02-01'), statut: StatutActualite.publie, id_auteur: 1 },
    { id_actualite: 3, titre: 'Actu 3', contenu: 'Contenu 3', image_url: 'img3.jpg', date_publication: new Date('2024-03-01'), statut: StatutActualite.publie, id_auteur: 1 },
    { id_actualite: 4, titre: 'Actu 4', contenu: 'Contenu 4', image_url: 'img4.jpg', date_publication: new Date('2024-04-01'), statut: StatutActualite.publie, id_auteur: 1 }
  ];

  const mockEvenements: Evenement[] = [
    { id_evenement: 1, titre: 'Event 1', description: 'Desc 1', image_url: 'img1.jpg', date_evenement: new Date('2024-05-01'), heure_debut: '10:00', heure_fin: '12:00', lieu: 'Lieu 1', statut: StatutEvenement.publie, id_auteur: 1, id_formulaire: null },
    { id_evenement: 2, titre: 'Event 2', description: 'Desc 2', image_url: 'img2.jpg', date_evenement: new Date('2024-06-01'), heure_debut: '14:00', heure_fin: '16:00', lieu: 'Lieu 2', statut: StatutEvenement.publie, id_auteur: 1, id_formulaire: null },
    { id_evenement: 3, titre: 'Event 3', description: 'Desc 3', image_url: 'img3.jpg', date_evenement: new Date('2024-07-01'), heure_debut: '09:00', heure_fin: '10:00', lieu: 'Lieu 3', statut: StatutEvenement.publie, id_auteur: 1, id_formulaire: null },
    { id_evenement: 4, titre: 'Event 4', description: 'Desc 4', image_url: 'img4.jpg', date_evenement: new Date('2024-08-01'), heure_debut: '18:00', heure_fin: '20:00', lieu: 'Lieu 4', statut: StatutEvenement.publie, id_auteur: 1, id_formulaire: null }
  ];

  beforeEach(async () => {
    actualiteServiceSpy = jasmine.createSpyObj('ActualiteService', ['getAllActualites']);
    evenementServiceSpy = jasmine.createSpyObj('EvenementService', ['getAllEvenements']);

    actualiteServiceSpy.getAllActualites.and.returnValue(of([]));
    evenementServiceSpy.getAllEvenements.and.returnValue(of({ data: [], current_page: 1, last_page: 1, total: 0 }));

    await TestBed.configureTestingModule({
      imports: [AccueilComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ActualiteService, useValue: actualiteServiceSpy },
        { provide: EvenementService, useValue: evenementServiceSpy }
      ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(AccueilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should_create', () => {
  // GIVEN

  // WHEN

  // THEN
    expect(component).toBeTruthy();
  });

  describe('Initialisation et Chargement des données', () => {
    it('should_load_trier_actualites_events_initialisation', () => {
    // GIVEN
      actualiteServiceSpy.getAllActualites.and.returnValue(of(mockActualites));
      evenementServiceSpy.getAllEvenements.and.returnValue(of({ data: mockEvenements, current_page: 1, last_page: 1, total: mockEvenements.length }));

    // WHEN
      component.ngOnInit();

    // THEN
      expect(component.loadingActualites).toBeFalse();
      expect(component.loadingEvents).toBeFalse();

      expect(component.listeActualites.length).toBe(4);
      expect(component.listeEvenements.length).toBe(4);
    });

    it('should_handle_errors_chargement_actualites', () => {
    // GIVEN
      const error = new Error('Erreur API');
      actualiteServiceSpy.getAllActualites.and.returnValue(throwError(() => error));
      evenementServiceSpy.getAllEvenements.and.returnValue(of({ data: [], current_page: 1, last_page: 1, total: 0 }));

      spyOn(console, 'error');

    // WHEN
      component.ngOnInit();

    // THEN
      expect(component.loadingActualites).toBeFalse();
      expect(component.errorActualites).toBeTrue();
      expect(console.error).toHaveBeenCalledWith(error);
    });

    it('should_handle_errors_chargement_events', () => {
    // GIVEN
      actualiteServiceSpy.getAllActualites.and.returnValue(of([]));
      const error = new Error('Erreur API Event');
      evenementServiceSpy.getAllEvenements.and.returnValue(throwError(() => error));

      spyOn(console, 'error');

    // WHEN
      component.ngOnInit();

    // THEN
      expect(component.loadingEvents).toBeFalse();
      expect(component.errorEvents).toBeTrue();
      expect(console.error).toHaveBeenCalledWith(error);
    });
  });

  describe('Affichage', () => {
    it('should_display_spinners_pendant_chargement', () => {
    // GIVEN
      component.loadingActualites = true;
      component.loadingEvents = true;

    // WHEN
      fixture.detectChanges();

      const spinners = fixture.debugElement.queryAll(By.directive(SpinnerComponent));

    // THEN
      expect(spinners.length).toBe(2);
    });

    it('should_display_maximum_3_cartes_actualites', () => {
    // GIVEN
      component.listeActualites = mockActualites;
      component.loadingActualites = false;
      component.errorActualites = false;

    // WHEN
      fixture.detectChanges();

      const cards = fixture.debugElement.queryAll(By.directive(ActualiteCardComponent));

    // THEN
      expect(cards.length).toBe(3);
    });

    it('should_display_maximum_3_cartes_evenements', () => {
    // GIVEN
      component.listeEvenements = mockEvenements;
      component.loadingEvents = false;
      component.errorEvents = false;

    // WHEN
      fixture.detectChanges();

      const cards = fixture.debugElement.queryAll(By.directive(EvenementCardComponent));

    // THEN
      expect(cards.length).toBe(3);
    });
  });

  describe('Interaction', () => {
    it('should_delete_event_liste_when_suppression', () => {
    // GIVEN
      component.listeEvenements = [...mockEvenements];

    // WHEN
      fixture.detectChanges();

      const initialCount = component.listeEvenements.length;
      const idToDelete = 1;

      component.handleEventDeleted(idToDelete);

    // THEN
      expect(component.listeEvenements.length).toBe(initialCount - 1);
      expect(component.listeEvenements.find(e => e.id_evenement === idToDelete)).toBeUndefined();
    });
  });
});
