/**
 * Fichier : frontend/src/app/pages/evenement-page/evenement-page.component.spec.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier teste la page evenement page.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EvenementPageComponent } from './evenement-page.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { EvenementService } from '../../services/Evenement/evenement.service';
import { AuthService } from '../../services/Auth/auth.service';
import { of, throwError } from 'rxjs';
import { Evenement } from '../../models/Evenement/evenement';
import { StatutEvenement } from '../../enums/StatutEvenement/statut-evenement';
import { RoleUtilisateur } from '../../enums/RoleUtilisateur/role-utilisateur';

describe('EvenementPageComponent', () => {
  let component: EvenementPageComponent;
  let fixture: ComponentFixture<EvenementPageComponent>;
  let evenementService: jasmine.SpyObj<EvenementService>;
  let authService: jasmine.SpyObj<AuthService>;

  const mockEvenements: Evenement[] = [
    {
      id_evenement: 2,
      titre: 'Événement Récent',
      description: 'Description 2',
      date_evenement: new Date('2026-03-01'),
      heure_debut: '14:00',
      heure_fin: '16:00',
      lieu: 'Lieu 2',
      image_url: 'https://example.com/image2.jpg',
      statut: StatutEvenement.publie,
      id_auteur: 1,
      id_formulaire: null,
      created_at: '2026-01-02T00:00:00Z',
      updated_at: '2026-01-02T00:00:00Z'
    },
    {
      id_evenement: 1,
      titre: 'Événement Ancien',
      description: 'Description 1',
      date_evenement: new Date('2025-01-01'),
      heure_debut: '10:00',
      heure_fin: '12:00',
      lieu: 'Lieu 1',
      image_url: 'https://example.com/image1.jpg',
      statut: StatutEvenement.publie,
      id_auteur: 1,
      id_formulaire: null,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z'
    },
    {
      id_evenement: 3,
      titre: 'Événement Futur',
      description: 'Description 3',
      date_evenement: new Date('2026-12-01'),
      heure_debut: '09:00',
      heure_fin: '11:00',
      lieu: 'Lieu 3',
      image_url: 'https://example.com/image3.jpg',
      statut: StatutEvenement.publie,
      id_auteur: 1,
      id_formulaire: null,
      created_at: '2026-01-03T00:00:00Z',
      updated_at: '2026-01-03T00:00:00Z'
    }
  ];

  beforeEach(async () => {
    const evenementServiceSpy = jasmine.createSpyObj('EvenementService', ['getAllEvenements']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['hasRole', 'getCurrentUser'], {
      currentUser$: of(null)
    });

    await TestBed.configureTestingModule({
      imports: [EvenementPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: EvenementService, useValue: evenementServiceSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ],
    }).compileComponents();

    evenementService = TestBed.inject(EvenementService) as jasmine.SpyObj<EvenementService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    evenementService.getAllEvenements.and.returnValue(of({ data: mockEvenements, current_page: 1, last_page: 1, total: mockEvenements.length }));
    authService.hasRole.and.returnValue(false);

    fixture = TestBed.createComponent(EvenementPageComponent);
    component = fixture.componentInstance;
  });

  it('should_create', () => {
  // GIVEN

  // WHEN

  // THEN
    expect(component).toBeTruthy();
  });

  describe('Initialisation', () => {
    it('should_initialize_loadingevenements_true', () => {
    // GIVEN

    // WHEN

    // THEN
      expect(component.loadingEvenements).toBe(true);
    });

    it('should_initialize_errorevenements_false', () => {
    // GIVEN

    // WHEN

    // THEN
      expect(component.errorEvenements).toBe(false);
    });
  });

  describe('ngOnInit', () => {
    it('should_load_all_events_startup', () => {
    // GIVEN

    // WHEN
      fixture.detectChanges();

    // THEN
      expect(evenementService.getAllEvenements).toHaveBeenCalled();
      expect(component.listeEvenements.length).toBe(mockEvenements.length);
      expect(component.listeEvenements).toContain(jasmine.objectContaining({ id_evenement: 1 }));
      expect(component.listeEvenements).toContain(jasmine.objectContaining({ id_evenement: 2 }));
      expect(component.listeEvenements).toContain(jasmine.objectContaining({ id_evenement: 3 }));
    });

    it('should_trier_events_par_date_chargement', () => {
    // GIVEN

    // WHEN
      fixture.detectChanges();

    // THEN
      expect(component.listeEvenements[0].id_evenement).toBe(3); // Événement le plus récent
      expect(component.listeEvenements[1].id_evenement).toBe(2);
      expect(component.listeEvenements[2].id_evenement).toBe(1); // Événement le plus ancien
    });

    it('should_mettre_loadingevenements_false_chargement_reussi', () => {
    // GIVEN

    // WHEN
      fixture.detectChanges();

    // THEN
      expect(component.loadingEvenements).toBe(false);
    });

    it('should_handle_errors_chargement', () => {
    // GIVEN
      evenementService.getAllEvenements.and.returnValue(throwError(() => new Error('Erreur de chargement')));
      spyOn(console, 'error');

    // WHEN
      fixture.detectChanges();

    // THEN
      expect(component.loadingEvenements).toBe(false);
      expect(component.errorEvenements).toBe(true);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('canManage', () => {
    it('should_return_true_utilisateur_est_administrateur', () => {
    // GIVEN
      authService.hasRole.and.callFake((role: RoleUtilisateur) => role === RoleUtilisateur.administrateur);

    // WHEN

    // THEN
      expect(component.canManage).toBe(true);
    });

    it('should_return_true_utilisateur_est_membre_du_bureau', () => {
    // GIVEN
      authService.hasRole.and.callFake((role: RoleUtilisateur) => role === RoleUtilisateur.membre_bureau);

    // WHEN

    // THEN
      expect(component.canManage).toBe(true);
    });

    it('should_return_false_utilisateur_est_parent', () => {
    // GIVEN
      authService.hasRole.and.returnValue(false);

    // WHEN

    // THEN
      expect(component.canManage).toBe(false);
    });

    it('should_return_false_utilisateur_est_eleve', () => {
    // GIVEN
      authService.hasRole.and.returnValue(false);

    // WHEN

    // THEN
      expect(component.canManage).toBe(false);
    });
  });

  describe('handleEventDeleted', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should_delete_event_liste', () => {
    // GIVEN

    // WHEN
      const initialLength = component.listeEvenements.length;

      component.handleEventDeleted(1);

    // THEN
      expect(component.listeEvenements.length).toBe(initialLength - 1);
      expect(component.listeEvenements.find(e => e.id_evenement === 1)).toBeUndefined();
    });

    it('should_conserver_autres_events', () => {
    // GIVEN

    // WHEN
      component.handleEventDeleted(1);

    // THEN
      expect(component.listeEvenements.find(e => e.id_evenement === 2)).toBeDefined();
      expect(component.listeEvenements.find(e => e.id_evenement === 3)).toBeDefined();
    });

    it('should_not_rien_faire_evenement_n_existe_pas', () => {
    // GIVEN

    // WHEN
      const initialLength = component.listeEvenements.length;

      component.handleEventDeleted(999);

    // THEN
      expect(component.listeEvenements.length).toBe(initialLength);
    });
  });

  describe('sortEvenementByDate', () => {
    it('should_trier_events_recent_ancien', () => {
    // GIVEN
      component.listeEvenements = [
        { ...mockEvenements[0], date_evenement: new Date('2025-01-01') },
        { ...mockEvenements[1], date_evenement: new Date('2026-06-01') },
        { ...mockEvenements[2], date_evenement: new Date('2026-03-01') }
      ];

    // WHEN
      component.sortEvenementByDate();

    // THEN
      expect(new Date(component.listeEvenements[0].date_evenement).getTime())
        .toBeGreaterThan(new Date(component.listeEvenements[1].date_evenement).getTime());
      expect(new Date(component.listeEvenements[1].date_evenement).getTime())
        .toBeGreaterThan(new Date(component.listeEvenements[2].date_evenement).getTime());
    });

    it('should_handle_liste_empty', () => {
    // GIVEN
      component.listeEvenements = [];

    // WHEN

    // THEN
      expect(() => component.sortEvenementByDate()).not.toThrow();
      expect(component.listeEvenements.length).toBe(0);
    });

    it('should_handle_liste_seul_event', () => {
    // GIVEN
      component.listeEvenements = [mockEvenements[0]];

    // WHEN
      component.sortEvenementByDate();

    // THEN
      expect(component.listeEvenements.length).toBe(1);
      expect(component.listeEvenements[0]).toEqual(mockEvenements[0]);
    });

    it('should_not_modifier_liste_originale', () => {
    // GIVEN
      const originalList = [...mockEvenements];
      component.listeEvenements = [...mockEvenements];

    // WHEN
      component.sortEvenementByDate();

      // Vérifier que l'ordre a changé

    // THEN
      expect(component.listeEvenements).not.toEqual(originalList);
      // Vérifier que tous les éléments sont toujours présents
      expect(component.listeEvenements.length).toBe(originalList.length);
    });
  });

  describe('Intégration', () => {
    it('should_load_display_events_tries', () => {
    // GIVEN

    // WHEN
      fixture.detectChanges();

    // THEN
      expect(component.listeEvenements).toBeDefined();
      expect(component.listeEvenements.length).toBe(3);
      expect(component.loadingEvenements).toBe(false);
      expect(component.errorEvenements).toBe(false);

      // Vérifier le tri
      const firstDate = new Date(component.listeEvenements[0].date_evenement).getTime();
      const secondDate = new Date(component.listeEvenements[1].date_evenement).getTime();
      const thirdDate = new Date(component.listeEvenements[2].date_evenement).getTime();

      expect(firstDate).toBeGreaterThanOrEqual(secondDate);
      expect(secondDate).toBeGreaterThanOrEqual(thirdDate);
    });

    it('should_handle_suppression_un_evenement_et_maintenir_le_tri', () => {
    // GIVEN

    // WHEN
      fixture.detectChanges();

      const initialLength = component.listeEvenements.length;

      component.handleEventDeleted(2);

    // THEN
      expect(component.listeEvenements.length).toBe(initialLength - 1);

      // Vérifier que le tri est toujours maintenu
      if (component.listeEvenements.length > 1) {
        const firstDate = new Date(component.listeEvenements[0].date_evenement).getTime();
        const secondDate = new Date(component.listeEvenements[1].date_evenement).getTime();
        expect(firstDate).toBeGreaterThanOrEqual(secondDate);
      }
    });
  });
});
