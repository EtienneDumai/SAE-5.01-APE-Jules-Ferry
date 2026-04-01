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
import { AuthService } from '../../../services/Auth/auth.service';

describe('AdminEvenementsComponent', () => {
  let component: AdminEvenementsComponent;
  let fixture: ComponentFixture<AdminEvenementsComponent>;
  let evenementServiceSpy: jasmine.SpyObj<EvenementService>;
  let utilisateurServiceSpy: jasmine.SpyObj<UtilisateurService>;
  let inscriptionServiceSpy: jasmine.SpyObj<InscriptionService>;
  let formulaireServiceSpy: jasmine.SpyObj<FormulaireService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let exportCsvServiceSpy: jasmine.SpyObj<ExportCsvService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

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

    authServiceSpy = jasmine.createSpyObj('AuthService', ['hasRole', 'getCurrentUser'], {
      currentUser$: of(null)
    });

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
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminEvenementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should_be_create', () => {
  // GIVEN

  // WHEN

  // THEN
    expect(component).toBeTruthy();
  });

  describe('templates', () => {
    it('should_load_modeles_startup', () => {
    // GIVEN

    // WHEN

    // THEN
      expect(formulaireServiceSpy.getTemplates).toHaveBeenCalled();
      expect(component.templates).toEqual(mockTemplates);
      expect(component.loadingTemplates).toBeFalse();
    });

    it('should_display_toast_chargement_modeles_echoue', () => {
    // GIVEN
      formulaireServiceSpy.getTemplates.and.returnValue(throwError(() => new Error('fail')));
      spyOn(console, 'error');

    // WHEN
      component.loadTemplates();

    // THEN
      expect(toastServiceSpy.show).toHaveBeenCalledWith(
        'Erreur chargement modèles de formulaire',
        TypeErreurToast.ERROR
      );
      expect(component.loadingTemplates).toBeFalse();
    });

    it('should_delete_modele_puis_recharger_liste', () => {
    // GIVEN
      formulaireServiceSpy.getTemplates.calls.reset();

    // WHEN
      component.deleteTemplate(10);

      component.confirmDeleteTemplate();

    // THEN
      expect(formulaireServiceSpy.deleteFormulaire).toHaveBeenCalledWith(10);
      expect(formulaireServiceSpy.getTemplates).toHaveBeenCalled();
      expect(toastServiceSpy.show).toHaveBeenCalledWith(
        'Modèle supprimé avec succès',
        TypeErreurToast.SUCCESS
      );
    });
  });

  describe('loadInitialEvents', () => {
    it('should_load_events_startup', () => {
    // GIVEN

    // WHEN

    // THEN
      expect(evenementServiceSpy.getAllEvenements).toHaveBeenCalled();
      expect(component.events.length).toBe(2);
      expect(component.loading).toBeFalse();
    });

    it('should_handle_error_chargement', () => {
    // GIVEN
      evenementServiceSpy.getAllEvenements.and.returnValue(throwError(() => new Error('fail')));
      spyOn(console, 'error');

    // WHEN
      component.loadInitialEvents();

    // THEN
      expect(toastServiceSpy.show).toHaveBeenCalled();
      expect(component.loading).toBeFalse();
    });
  });

  describe('filteredEvents', () => {
    it('should_return_all_events_searchtext_empty', () => {
    // GIVEN
      component.searchText = '';

    // WHEN

    // THEN
      expect(component.filteredEvents.length).toBe(2);
    });

    it('should_filtrer_events_par_title', () => {
    // GIVEN
      component.searchText = 'fête';

    // WHEN

    // THEN
      expect(component.filteredEvents.length).toBe(1);
      expect(component.filteredEvents[0].titre).toBe('Fête de l\'école');
    });

    it('should_return_tableau_empty_no_event_ne_correspond', () => {
    // GIVEN
      component.searchText = 'zzz_introuvable_zzz';

    // WHEN

    // THEN
      expect(component.filteredEvents.length).toBe(0);
    });
  });

  describe('activeTab', () => {
    it('should_demarrer_onglet_inscriptions', () => {
    // GIVEN

    // WHEN

    // THEN
      expect(component.activeTab).toBe('INSCRIPTIONS');
    });

    it('should_pouvoir_changer_onglet', () => {
    // GIVEN
      component.activeTab = 'MODIFICATIONS';

    // WHEN

    // THEN
      expect(component.activeTab).toBe('MODIFICATIONS');
    });
  });

  describe('toggleExpand', () => {
    it('should_reduire_event_deja_etendu', () => {
    // GIVEN
      const event = { ...mockEvenements[0], isExpanded: true };

    // WHEN
      component.toggleExpand(event);

    // THEN
      expect(event.isExpanded).toBeFalse();
    });

    it('should_etendre_event_non_etendu_sans_form', () => {
    // GIVEN
      const event = { ...mockEvenements[0], isExpanded: false, id_formulaire: null };

    // WHEN
      component.toggleExpand(event);

    // THEN
      expect(event.isExpanded).toBeTrue();
    });
  });

  describe('loadMore', () => {
    it('should_call_loadevents_hasmore_true_pas_chargement_cours', () => {
    // GIVEN
      component.hasMore = true;
      component.loadingMore = false;
      spyOn(component, 'loadEvents');

    // WHEN
      component.loadMore();

    // THEN
      expect(component.loadEvents).toHaveBeenCalled();
    });

    it('should_not_load_hasmore_false', () => {
    // GIVEN
      component.hasMore = false;
      spyOn(component, 'loadEvents');

    // WHEN
      component.loadMore();

    // THEN
      expect(component.loadEvents).not.toHaveBeenCalled();
    });

    it('should_load_page_suivante_lieu_recharger_meme_page', () => {
    // GIVEN
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

    // WHEN
      component.loadInitialEvents();

      component.loadMore();

    // THEN
      expect(evenementServiceSpy.getAllEvenements.calls.argsFor(0)).toEqual(['tous', 1, 5]);
      expect(evenementServiceSpy.getAllEvenements.calls.argsFor(1)).toEqual(['tous', 2, 5]);
      expect(component.events.map(event => event.id_evenement)).toEqual([1, 2]);
      expect(component.hasMore).toBeFalse();
    });
  });

  describe('hasMore pagination', () => {
    it('should_definir_hasmore_true_pages_supplementaires_existent', () => {
    // GIVEN
      evenementServiceSpy.getAllEvenements.and.returnValue(of({
        data: mockEvenements, current_page: 1, last_page: 3, total: 6
      }));

    // WHEN
      component.loadInitialEvents();

    // THEN
      expect(component.hasMore).toBeTrue();
    });

    it('should_definir_hasmore_false_derniere_page', () => {
    // GIVEN
      evenementServiceSpy.getAllEvenements.and.returnValue(of(paginatedResponse));

    // WHEN
      component.loadInitialEvents();

    // THEN
      expect(component.hasMore).toBeFalse();
    });
  });
});
