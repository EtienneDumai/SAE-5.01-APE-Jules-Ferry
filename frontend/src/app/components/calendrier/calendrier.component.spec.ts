import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { CalendrierComponent } from './calendrier.component';
import { EvenementService } from '../../services/Evenement/evenement.service';
import { Evenement } from '../../models/Evenement/evenement';
import { of, throwError } from 'rxjs';
import { CalendarApi } from '@fullcalendar/core';
import { StatutEvenement } from '../../enums/StatutEvenement/statut-evenement';
import { EventClickArg } from '@fullcalendar/core';
import { provideRouter } from '@angular/router';

describe('CalendrierComponent', () => {
  let component: CalendrierComponent;
  let fixture: ComponentFixture<CalendrierComponent>;
  let evenementService: jasmine.SpyObj<EvenementService>;

  const mockEvenements: Evenement[] = [
    {
      id_evenement: 1,
      titre: "Réunion d'équipe",
      description: 'Réunion mensuelle',
      date_evenement: new Date('2026-01-15'),
      heure_debut: '10:00',
      heure_fin: '11:00',
      lieu: 'Salle A',
      image_url: 'image1.jpg',
      statut: StatutEvenement.publie,
      id_auteur: 1,
      id_formulaire: null,
    }
  ];

  beforeEach(async () => {
    const evenementServiceSpy = jasmine.createSpyObj('EvenementService', ['getAllEvenements']);
    evenementServiceSpy.getAllEvenements.and.returnValue(of({ data: [], current_page: 1, last_page: 1, total: 0 }));

    await TestBed.configureTestingModule({
      imports: [CalendrierComponent],
      providers: [
        { provide: EvenementService, useValue: evenementServiceSpy },
        provideRouter([])
      ],
    }).compileComponents();

    evenementService = TestBed.inject(EvenementService) as jasmine.SpyObj<EvenementService>;
    fixture = TestBed.createComponent(CalendrierComponent);
    component = fixture.componentInstance;
  });

  describe('Initialisation du composant', () => {
    it('devrait créer', () => {
      expect(component).toBeTruthy();
    });

    it('devrait initialiser avec les propriétés par défaut', () => {
      expect(component.selectedEvent).toBeNull();
      expect(component.eventsList).toEqual([]);
      expect(component.isLoading).toBe(true);
      expect(component.calendarState).toBe('expanded');
    });

    it('devrait charger les événements à l\'initialisation', fakeAsync(() => {
      evenementService.getAllEvenements.and.returnValue(of({ data: mockEvenements, current_page: 1, last_page: 1, total: mockEvenements.length }));
      
      component.ngOnInit();
      tick(300); // Wait for loadEvents + resize timeout

      expect(evenementService.getAllEvenements).toHaveBeenCalled();
      expect(component.eventsList.length).toBe(1);
      expect(component.isLoading).toBe(false);
      
      flush(); // Flush remaining timers
    }));
  });

  describe('Chargement des événements', () => {
    it('devrait charger les événements avec succès', fakeAsync(() => {
      evenementService.getAllEvenements.and.returnValue(of({ data: mockEvenements, current_page: 1, last_page: 1, total: mockEvenements.length }));
      component.loadEvenements();
      tick(300);

      expect(component.eventsList).toEqual(mockEvenements);
      expect(component.isLoading).toBe(false);
      expect(component.errorMessage).toBeNull();
      flush();
    }));

    it('devrait gérer les erreurs lors du chargement', fakeAsync(() => {
      evenementService.getAllEvenements.and.returnValue(throwError(() => new Error('API error')));
      component.loadEvenements();
      tick();

      expect(component.isLoading).toBe(false);
      expect(component.errorMessage).toBe('Impossible de charger les événements.');
      expect(component.eventsList.length).toBe(0);
    }));
  });

  describe('Gestion des clics sur événements', () => {
    beforeEach(() => {
        evenementService.getAllEvenements.and.returnValue(of({ data: mockEvenements, current_page: 1, last_page: 1, total: mockEvenements.length }));
        component.loadEvenements();
    });

    it('devrait sélectionner un événement lorsqu\'il est cliqué', fakeAsync(() => {
      const mockEventClickArg: Partial<EventClickArg> = {
        event: { id: '1' } as unknown as EventClickArg['event'],
      };

      component.handleEventClick(mockEventClickArg as EventClickArg);
      tick(100);

      expect(component.selectedEvent).toBeTruthy();
      expect(component.selectedEvent?.id_evenement).toBe(1);
      flush();
    }));

    it('devrait fermer les détails de l\'événement', () => {
      component.selectedEvent = mockEvenements[0];
      component.closeEventDetails();
      expect(component.selectedEvent).toBeNull();
    });
  });

  describe('Intégration complète', () => {
    it('devrait gérer le flux utilisateur complet', fakeAsync(() => {
      evenementService.getAllEvenements.and.returnValue(of({ data: mockEvenements, current_page: 1, last_page: 1, total: mockEvenements.length }));
      component.loadEvenements();
      tick(300);

      // Ouvrir/Fermer
      component.openCalendar();
      expect(component.calendarState).toBe('expanded');
      component.collapseCalendar();
      expect(component.calendarState).toBe('compact');

      // Click event
      const mockEventClickArg: Partial<EventClickArg> = {
        event: { id: '1' } as unknown as EventClickArg['event'],
      };
      component.handleEventClick(mockEventClickArg as EventClickArg);
      tick(150);

      expect(component.selectedEvent).toBeTruthy();
      
      component.closeEventDetails();
      expect(component.selectedEvent).toBeNull();
      
      flush();
    }));
  });
  
 describe('Gestion du redimensionnement', () => {
    it('devrait gérer le redimensionnement de la fenêtre', () => {
        // Mock simple window resize logic
        const mockCalendarApi = {
            setOption: jasmine.createSpy('setOption'),
            view: { type: 'dayGridMonth' },
            changeView: jasmine.createSpy('changeView'),
        } as unknown as CalendarApi;

        // Force 'isMobile' state to be mismatched with current window width to ensure update logic triggers
        const currentWindowIsMobile = window.innerWidth < 768;
        (component as unknown as { isMobile: boolean }).isMobile = !currentWindowIsMobile;

        component.handleResize(mockCalendarApi);
        expect(mockCalendarApi.setOption).toHaveBeenCalled();
    });
 });


  //Tests d'intégration complète
  describe('Intégration complète', () => {
    it('devrait charger les événements et afficher correctement le calendrier', (done) => {
      evenementService.getAllEvenements.and.returnValue(of({ data: mockEvenements, current_page: 1, last_page: 1, total: mockEvenements.length }));
      fixture.detectChanges();

      setTimeout(() => {
        expect(component.eventsList.length).toBe(1); // MATCH MOCK DATA
        expect(component.isLoading).toBe(false);
        expect((component.calendarOptions.events as unknown[]).length).toBe(1); // MATCH MOCK DATA
        done();
      }, 0);
    });

    it('devrait gérer le flux utilisateur complet', (done) => {
      evenementService.getAllEvenements.and.returnValue(of({ data: mockEvenements, current_page: 1, last_page: 1, total: mockEvenements.length }));
      component.loadEvenements();

      setTimeout(() => {
        // Ouvrir le calendrier
        component.openCalendar();
        expect(component.calendarState).toBe('expanded');

        // Réduire le calendrier
        component.collapseCalendar();
        expect(component.calendarState).toBe('compact');

        // Cliquer sur un événement
        const mockEventClickArg: Partial<EventClickArg> = {
          event: { id: '1' } as EventClickArg['event'],
        };
        component.handleEventClick(mockEventClickArg as EventClickArg);

        setTimeout(() => {
          expect(component.selectedEvent).toBeTruthy();

          // Fermer les détails
          component.closeEventDetails();
          expect(component.selectedEvent).toBeNull();

          done();
        }, 100);
      }, 0);
    });
  });

  describe('Redirection vers formulaire d\'inscription', () => {
    it('devrait sélectionner un événement au clic', fakeAsync(() => {
      evenementService.getAllEvenements.and.returnValue(of({ data: mockEvenements, current_page: 1, last_page: 1, total: mockEvenements.length }));
      component.loadEvenements();
      tick();

      expect(component.eventsList.length).toBe(1); // MATCH MOCK DATA

      const mockEventClickArg: Partial<EventClickArg> = {
        event: { id: '1' } as EventClickArg['event'],
      };
      component.handleEventClick(mockEventClickArg as EventClickArg);

      expect(component.selectedEvent).toBeTruthy();
      expect(component.selectedEvent?.id_evenement).toBe(1);
      expect(component.selectedEvent?.titre).toBe("Réunion d'équipe");

      flush();
    }));

    it('devrait permettre de fermer les détails d\'un événement', fakeAsync(() => {
      evenementService.getAllEvenements.and.returnValue(of({ data: mockEvenements, current_page: 1, last_page: 1, total: mockEvenements.length }));
      component.loadEvenements();
      tick();

      const mockEventClickArg: Partial<EventClickArg> = {
        event: { id: '1' } as EventClickArg['event'],
      };
      component.handleEventClick(mockEventClickArg as EventClickArg);

      expect(component.selectedEvent).toBeTruthy();

      component.closeEventDetails();

      expect(component.selectedEvent).toBeNull();

      flush();
    }));
  });
});
