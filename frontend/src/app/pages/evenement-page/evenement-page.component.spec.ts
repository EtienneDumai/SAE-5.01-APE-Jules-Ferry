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
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['hasRole']);

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

  it('devrait créer', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialisation', () => {
    it('devrait initialiser avec loadingEvenements à true', () => {
      expect(component.loadingEvenements).toBe(true);
    });

    it('devrait initialiser avec errorEvenements à false', () => {
      expect(component.errorEvenements).toBe(false);
    });
  });

  describe('ngOnInit', () => {
    it('devrait charger tous les événements au démarrage', () => {
      fixture.detectChanges();

      expect(evenementService.getAllEvenements).toHaveBeenCalled();
      expect(component.listeEvenements.length).toBe(mockEvenements.length);
      expect(component.listeEvenements).toContain(jasmine.objectContaining({ id_evenement: 1 }));
      expect(component.listeEvenements).toContain(jasmine.objectContaining({ id_evenement: 2 }));
      expect(component.listeEvenements).toContain(jasmine.objectContaining({ id_evenement: 3 }));
    });

    it('devrait trier les événements par date après le chargement', () => {
      fixture.detectChanges();

      expect(component.listeEvenements[0].id_evenement).toBe(3); // Événement le plus récent
      expect(component.listeEvenements[1].id_evenement).toBe(2);
      expect(component.listeEvenements[2].id_evenement).toBe(1); // Événement le plus ancien
    });

    it('devrait mettre loadingEvenements à false après le chargement réussi', () => {
      fixture.detectChanges();

      expect(component.loadingEvenements).toBe(false);
    });

    it('devrait gérer les erreurs de chargement', () => {
      evenementService.getAllEvenements.and.returnValue(throwError(() => new Error('Erreur de chargement')));
      spyOn(console, 'error');

      fixture.detectChanges();

      expect(component.loadingEvenements).toBe(false);
      expect(component.errorEvenements).toBe(true);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('canManage', () => {
    it('devrait retourner true si l\'utilisateur est administrateur', () => {
      authService.hasRole.and.callFake((role: RoleUtilisateur) => role === RoleUtilisateur.administrateur);

      expect(component.canManage).toBe(true);
    });

    it('devrait retourner true si l\'utilisateur est membre du bureau', () => {
      authService.hasRole.and.callFake((role: RoleUtilisateur) => role === RoleUtilisateur.membre_bureau);

      expect(component.canManage).toBe(true);
    });

    it('devrait retourner false si l\'utilisateur est parent', () => {
      authService.hasRole.and.returnValue(false);

      expect(component.canManage).toBe(false);
    });

    it('devrait retourner false si l\'utilisateur est eleve', () => {
      authService.hasRole.and.returnValue(false);

      expect(component.canManage).toBe(false);
    });
  });

  describe('handleEventDeleted', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('devrait supprimer un événement de la liste', () => {
      const initialLength = component.listeEvenements.length;

      component.handleEventDeleted(1);

      expect(component.listeEvenements.length).toBe(initialLength - 1);
      expect(component.listeEvenements.find(e => e.id_evenement === 1)).toBeUndefined();
    });

    it('devrait conserver les autres événements', () => {
      component.handleEventDeleted(1);

      expect(component.listeEvenements.find(e => e.id_evenement === 2)).toBeDefined();
      expect(component.listeEvenements.find(e => e.id_evenement === 3)).toBeDefined();
    });

    it('ne devrait rien faire si l\'événement n\'existe pas', () => {
      const initialLength = component.listeEvenements.length;

      component.handleEventDeleted(999);

      expect(component.listeEvenements.length).toBe(initialLength);
    });
  });

  describe('sortEvenementByDate', () => {
    it('devrait trier les événements du plus récent au plus ancien', () => {
      component.listeEvenements = [
        { ...mockEvenements[0], date_evenement: new Date('2025-01-01') },
        { ...mockEvenements[1], date_evenement: new Date('2026-06-01') },
        { ...mockEvenements[2], date_evenement: new Date('2026-03-01') }
      ];

      component.sortEvenementByDate();

      expect(new Date(component.listeEvenements[0].date_evenement).getTime())
        .toBeGreaterThan(new Date(component.listeEvenements[1].date_evenement).getTime());
      expect(new Date(component.listeEvenements[1].date_evenement).getTime())
        .toBeGreaterThan(new Date(component.listeEvenements[2].date_evenement).getTime());
    });

    it('devrait gérer une liste vide', () => {
      component.listeEvenements = [];

      expect(() => component.sortEvenementByDate()).not.toThrow();
      expect(component.listeEvenements.length).toBe(0);
    });

    it('devrait gérer une liste avec un seul événement', () => {
      component.listeEvenements = [mockEvenements[0]];

      component.sortEvenementByDate();

      expect(component.listeEvenements.length).toBe(1);
      expect(component.listeEvenements[0]).toEqual(mockEvenements[0]);
    });

    it('ne devrait pas modifier la liste originale', () => {
      const originalList = [...mockEvenements];
      component.listeEvenements = [...mockEvenements];

      component.sortEvenementByDate();

      // Vérifier que l'ordre a changé
      expect(component.listeEvenements).not.toEqual(originalList);
      // Vérifier que tous les éléments sont toujours présents
      expect(component.listeEvenements.length).toBe(originalList.length);
    });
  });

  describe('Intégration', () => {
    it('devrait charger et afficher les événements triés', () => {
      fixture.detectChanges();

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

    it('devrait gérer la suppression d\'un événement et maintenir le tri', () => {
      fixture.detectChanges();

      const initialLength = component.listeEvenements.length;
      component.handleEventDeleted(2);

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
