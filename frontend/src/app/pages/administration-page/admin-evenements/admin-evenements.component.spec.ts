/**
 * Fichier : frontend/src/app/pages/administration-page/admin-evenements/admin-evenements.component.spec.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier teste la page admin evenements.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { AdminEvenementsComponent } from './admin-evenements.component';
import { EvenementService } from '../../../services/Evenement/evenement.service';
import { UtilisateurService } from '../../../services/Utilisateur/utilisateur.service';
import { InscriptionService } from '../../../services/Inscription/inscription.service';
import { TacheService } from '../../../services/Tache/tache.service';
import { CreneauService } from '../../../services/Creneau/creneau.service';
import { FormulaireService } from '../../../services/Formulaire/formulaire.service';
import { ToastService } from '../../../services/Toast/toast.service';
import { ExportCsvService } from '../../../services/ExportCsv/export-csv.service';
import { of, throwError } from 'rxjs';
import { StatutEvenement } from '../../../enums/StatutEvenement/statut-evenement';
import { Evenement } from '../../../models/Evenement/evenement';
import { StatutFormulaire } from '../../../enums/StatutFormulaire/statut-formulaire';
import { TypeErreurToast } from '../../../enums/TypeErreurToast/type-erreur-toast';

describe('AdminEvenementsComponent', () => {
  let component: AdminEvenementsComponent;
  let fixture: ComponentFixture<AdminEvenementsComponent>;
  let evenementServiceSpy: jasmine.SpyObj<EvenementService>;
  let utilisateurServiceSpy: jasmine.SpyObj<UtilisateurService>;
  let inscriptionServiceSpy: jasmine.SpyObj<InscriptionService>;
  let formulaireServiceSpy: jasmine.SpyObj<FormulaireService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let exportCsvServiceSpy: jasmine.SpyObj<ExportCsvService>;

  const mockEvenements: Evenement[] = [
    {
      id_evenement: 1, titre: 'Fête de l\'école', description: 'Desc 1',
      date_evenement: new Date('2026-06-01'), heure_debut: '10:00', heure_fin: '18:00',
      lieu: 'Gymnase', image_url: 'img1.jpg', statut: StatutEvenement.publie,
      id_auteur: 1, id_formulaire: null
    },
    {
      id_evenement: 2, titre: 'Réunion parents', description: 'Desc 2',
      date_evenement: new Date('2026-07-01'), heure_debut: '18:00', heure_fin: '20:00',
      lieu: 'Salle B', image_url: 'img2.jpg', statut: StatutEvenement.publie,
      id_auteur: 1, id_formulaire: null
    },
  ];

  const paginatedResponse = {
    data: mockEvenements,
    current_page: 1,
    last_page: 1,
    total: 2,
  };
  const mockTemplates = [
    {
      id_formulaire: 10,
      nom_formulaire: 'Modèle kermesse',
      description: 'Description',
      statut: StatutFormulaire.actif,
      id_createur: 1,
      is_template: true,
      created_at: '2026-03-20T00:00:00.000000Z',
      taches: []
    }
  ];

  beforeEach(async () => {
    evenementServiceSpy = jasmine.createSpyObj('EvenementService', ['getAllEvenements', 'getEvenementDetails', 'deleteEvenement']);
    utilisateurServiceSpy = jasmine.createSpyObj('UtilisateurService', ['getAllUtilisateurs']);
    inscriptionServiceSpy = jasmine.createSpyObj('InscriptionService', [
      'deleteInscriptionAdmin', 'createInscriptionAdmin', 'updateInscriptionAdmin'
    ]);
    formulaireServiceSpy = jasmine.createSpyObj('FormulaireService', ['getTemplates', 'deleteFormulaire']);
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['show']);
    exportCsvServiceSpy = jasmine.createSpyObj('ExportCsvService', ['exportAsCsvFile']);

    evenementServiceSpy.getAllEvenements.and.returnValue(of(paginatedResponse));
    utilisateurServiceSpy.getAllUtilisateurs.and.returnValue(of([]));
    formulaireServiceSpy.getTemplates.and.returnValue(of(mockTemplates));
    formulaireServiceSpy.deleteFormulaire.and.returnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [AdminEvenementsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: EvenementService, useValue: evenementServiceSpy },
        { provide: UtilisateurService, useValue: utilisateurServiceSpy },
        { provide: InscriptionService, useValue: inscriptionServiceSpy },
        { provide: TacheService, useValue: jasmine.createSpyObj('TacheService', ['getTachesByFormulaire']) },
        { provide: CreneauService, useValue: jasmine.createSpyObj('CreneauService', ['getCreneauxByTache']) },
        { provide: FormulaireService, useValue: formulaireServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: ExportCsvService, useValue: exportCsvServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminEvenementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('devrait être créé', () => {
    expect(component).toBeTruthy();
  });

  describe('templates', () => {
    it('devrait charger les modèles au démarrage', () => {
      expect(formulaireServiceSpy.getTemplates).toHaveBeenCalled();
      expect(component.templates).toEqual(mockTemplates);
      expect(component.loadingTemplates).toBeFalse();
    });

    it('devrait afficher un toast si le chargement des modèles échoue', () => {
      formulaireServiceSpy.getTemplates.and.returnValue(throwError(() => new Error('fail')));

      component.loadTemplates();

      expect(toastServiceSpy.show).toHaveBeenCalledWith(
        'Erreur chargement modèles de formulaire',
        TypeErreurToast.ERROR
      );
      expect(component.loadingTemplates).toBeFalse();
    });

    it('devrait supprimer un modèle puis recharger la liste', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      formulaireServiceSpy.getTemplates.calls.reset();

      component.deleteTemplate(10);

      expect(formulaireServiceSpy.deleteFormulaire).toHaveBeenCalledWith(10);
      expect(formulaireServiceSpy.getTemplates).toHaveBeenCalled();
      expect(toastServiceSpy.show).toHaveBeenCalledWith(
        'Modèle supprimé avec succès',
        TypeErreurToast.SUCCESS
      );
    });
  });

  describe('loadInitialEvents', () => {
    it('devrait charger les événements au démarrage', () => {
      expect(evenementServiceSpy.getAllEvenements).toHaveBeenCalled();
      expect(component.events.length).toBe(2);
      expect(component.loading).toBeFalse();
    });

    it('devrait gérer une erreur de chargement', () => {
      evenementServiceSpy.getAllEvenements.and.returnValue(throwError(() => new Error('fail')));
      component.loadInitialEvents();
      expect(toastServiceSpy.show).toHaveBeenCalled();
      expect(component.loading).toBeFalse();
    });
  });

  describe('filteredEvents', () => {
    it('devrait retourner tous les événements si searchText est vide', () => {
      component.searchText = '';
      expect(component.filteredEvents.length).toBe(2);
    });

    it('devrait filtrer les événements par titre', () => {
      component.searchText = 'fête';
      expect(component.filteredEvents.length).toBe(1);
      expect(component.filteredEvents[0].titre).toBe('Fête de l\'école');
    });

    it('devrait retourner un tableau vide si aucun événement ne correspond', () => {
      component.searchText = 'zzz_introuvable_zzz';
      expect(component.filteredEvents.length).toBe(0);
    });
  });

  describe('activeTab', () => {
    it('devrait démarrer sur l\'onglet INSCRIPTIONS', () => {
      expect(component.activeTab).toBe('INSCRIPTIONS');
    });

    it('devrait pouvoir changer d\'onglet', () => {
      component.activeTab = 'MODIFICATIONS';
      expect(component.activeTab).toBe('MODIFICATIONS');
    });
  });

  describe('toggleExpand', () => {
    it('devrait réduire un événement déjà étendu', () => {
      const event = { ...mockEvenements[0], isExpanded: true };
      component.toggleExpand(event);
      expect(event.isExpanded).toBeFalse();
    });

    it('devrait étendre un événement non étendu sans formulaire', () => {
      const event = { ...mockEvenements[0], isExpanded: false, id_formulaire: null };
      component.toggleExpand(event);
      expect(event.isExpanded).toBeTrue();
    });
  });

  describe('loadMore', () => {
    it('devrait appeler loadEvents si hasMore est true et pas de chargement en cours', () => {
      component.hasMore = true;
      component.loadingMore = false;
      spyOn(component, 'loadEvents');
      component.loadMore();
      expect(component.loadEvents).toHaveBeenCalled();
    });

    it('ne devrait pas charger plus si hasMore est false', () => {
      component.hasMore = false;
      spyOn(component, 'loadEvents');
      component.loadMore();
      expect(component.loadEvents).not.toHaveBeenCalled();
    });

    it('devrait charger la page suivante au lieu de recharger la même page', () => {
      evenementServiceSpy.getAllEvenements.calls.reset();
      evenementServiceSpy.getAllEvenements.and.returnValues(
        of({
          data: [mockEvenements[0]],
          current_page: 1,
          last_page: 2,
          total: 2,
        }),
        of({
          data: [mockEvenements[1]],
          current_page: 2,
          last_page: 2,
          total: 2,
        })
      );

      component.loadInitialEvents();
      component.loadMore();

      expect(evenementServiceSpy.getAllEvenements.calls.argsFor(0)).toEqual(['tous', 1, 5]);
      expect(evenementServiceSpy.getAllEvenements.calls.argsFor(1)).toEqual(['tous', 2, 5]);
      expect(component.events.map(event => event.id_evenement)).toEqual([1, 2]);
      expect(component.hasMore).toBeFalse();
    });
  });

  describe('hasMore pagination', () => {
    it('devrait définir hasMore à true si des pages supplémentaires existent', () => {
      evenementServiceSpy.getAllEvenements.and.returnValue(of({
        data: mockEvenements, current_page: 1, last_page: 3, total: 6
      }));
      component.loadInitialEvents();
      expect(component.hasMore).toBeTrue();
    });

    it('devrait définir hasMore à false sur la dernière page', () => {
      evenementServiceSpy.getAllEvenements.and.returnValue(of(paginatedResponse));
      component.loadInitialEvents();
      expect(component.hasMore).toBeFalse();
    });
  });
});
