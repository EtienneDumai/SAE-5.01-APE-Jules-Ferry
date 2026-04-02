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
      id_evenement: 1,
      titre: 'Événement Ancien Terminé',
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
      id_evenement: 2,
      titre: 'Événement Futur Publié',
      description: 'Description 2',
      date_evenement: new Date('2028-03-01'),
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
      id_evenement: 3,
      titre: 'Événement Futur Brouillon',
      description: 'Description 3',
      date_evenement: new Date('2028-12-01'),
      heure_debut: '09:00',
      heure_fin: '11:00',
      lieu: 'Lieu 3',
      image_url: 'https://example.com/image3.jpg',
      statut: StatutEvenement.brouillon,
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
    
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date('2026-04-02T08:00:00Z'));
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('should_create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialisation', () => {
    it('should_initialize_loadingevenements_true', () => {
      expect(component.loadingEvenements).toBe(true);
    });

    it('should_initialize_errorevenements_false', () => {
      expect(component.errorEvenements).toBe(false);
    });
  });

  describe('ngOnInit et fetchEvenements', () => {
    it('should_load_all_events_startup_once', () => {
      fixture.detectChanges();

      expect(evenementService.getAllEvenements).toHaveBeenCalledWith('tous');
      expect(component.listeEvenements.length).toBe(mockEvenements.length);
      expect(component.loadingEvenements).toBe(false);
    });

    it('should_handle_errors_chargement', () => {
      evenementService.getAllEvenements.and.returnValue(throwError(() => new Error('Erreur de chargement')));
      spyOn(console, 'error');

      fixture.detectChanges();

      expect(component.loadingEvenements).toBe(false);
      expect(component.errorEvenements).toBe(true);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('canManage', () => {
    it('should_return_true_utilisateur_est_administrateur', () => {
      authService.hasRole.and.callFake((role: RoleUtilisateur) => role === RoleUtilisateur.administrateur);
      expect(component.canManage).toBe(true);
    });

    it('should_return_false_utilisateur_est_parent', () => {
      authService.hasRole.and.returnValue(false);
      expect(component.canManage).toBe(false);
    });
  });

  describe('handleEventDeleted', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should_delete_event_liste', () => {
      const initialLength = component.listeEvenements.length;
      component.handleEventDeleted(1);
      expect(component.listeEvenements.length).toBe(initialLength - 1);
      expect(component.listeEvenements.find(e => e.id_evenement === 1)).toBeUndefined();
    });
  });

  describe('Filtrage et Tri en temps réel (displayedEvenements)', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should_display_all_events_by_default_and_sort_recent', () => {
      expect(component.currentFilter).toBe('tous');
      
      const displayed = component.displayedEvenements;
      expect(displayed.length).toBe(3);
      
      expect(displayed[0].id_evenement).toBe(3);
      expect(displayed[1].id_evenement).toBe(2);
      expect(displayed[2].id_evenement).toBe(1);
    });

    it('should_filter_only_published_events', () => {
      component.setFilter('publie');
      
      const displayed = component.displayedEvenements;
      expect(displayed.length).toBe(1);
      expect(displayed[0].id_evenement).toBe(2);
    });

    it('should_filter_only_terminated_events', () => {
      component.setFilter('termine');
      
      const displayed = component.displayedEvenements;
      expect(displayed.length).toBe(1);
      expect(displayed[0].id_evenement).toBe(1);
    });

    it('should_search_by_text', () => {
      component.setFilter('tous');
      component.searchText = 'Ancien';
      
      const displayed = component.displayedEvenements;
      expect(displayed.length).toBe(1);
      expect(displayed[0].titre).toContain('Ancien');
    });

    it('should_toggle_sort_order', () => {
      component.toggleSort();
      
      const displayed = component.displayedEvenements;
      expect(displayed[0].id_evenement).toBe(1);
      expect(displayed[2].id_evenement).toBe(3);
    });
  });
});