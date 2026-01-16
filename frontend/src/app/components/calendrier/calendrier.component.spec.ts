import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalendrierComponent } from './calendrier.component';
import { EvenementService } from '../../services/Evenement/evenement.service';
import { Evenement } from '../../models/Evenement/evenement';
import { of, throwError } from 'rxjs';
import { CalendarApi } from '@fullcalendar/core';
import { StatutEvenement } from '../../enums/StatutEvenement/statut-evenement';
import { EventClickArg } from '@fullcalendar/core';

describe('CalendrierComponent', () => {
  let component: CalendrierComponent;
  let fixture: ComponentFixture<CalendrierComponent>;
  let evenementService: jasmine.SpyObj<EvenementService>;

  // Mock data
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
    },
    {
      id_evenement: 2,
      titre: 'Formation Angular',
      description: 'Atelier de formation',
      date_evenement: new Date('2026-01-20'),
      heure_debut: '14:00',
      heure_fin: '16:00',
      lieu: 'Salle B',
      image_url: 'image2.jpg',
      statut: StatutEvenement.publie,
      id_auteur: 1,
      id_formulaire: null,
    },
  ];

  beforeEach(async () => {
    const evenementServiceSpy = jasmine.createSpyObj('EvenementService', [
      'getAllEvenements',
    ]);

    await TestBed.configureTestingModule({
      imports: [CalendrierComponent],
      providers: [{ provide: EvenementService, useValue: evenementServiceSpy }],
    }).compileComponents();

    evenementService = TestBed.inject(
      EvenementService
    ) as jasmine.SpyObj<EvenementService>;
    fixture = TestBed.createComponent(CalendrierComponent);
    component = fixture.componentInstance;
  });

  //Test création du composant et initialisation des propriétés
  describe('Initialisation du composant', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default properties', () => {
      expect(component.selectedEvent).toBeNull();
      expect(component.eventsList).toEqual([]);
      expect(component.isLoading).toBe(true);
      expect(component.errorMessage).toBeNull();
      expect(component.calendarState).toBe('closed');
    });

    it('should load evenements on init', () => {
      evenementService.getAllEvenements.and.returnValue(of(mockEvenements));
      fixture.detectChanges();

      expect(evenementService.getAllEvenements).toHaveBeenCalled();
      expect(component.eventsList).toEqual(mockEvenements);
      expect(component.isLoading).toBe(false);
    });
  });

  //Tests pour le chargement des événements et gestion des erreurs
  describe('Chargement des événements', () => {
    it('should load evenements successfully', (done) => {
      evenementService.getAllEvenements.and.returnValue(of(mockEvenements));
      component.loadEvenements();

      setTimeout(() => {
        expect(component.eventsList).toEqual(mockEvenements);
        expect(component.isLoading).toBe(false);
        expect(component.errorMessage).toBeNull();
        done();
      }, 0);
    });

    it('should handle error when loading evenements', (done) => {
      const error = new Error('API error');
      evenementService.getAllEvenements.and.returnValue(
        throwError(() => error)
      );

      component.loadEvenements();

      setTimeout(() => {
        expect(component.isLoading).toBe(false);
        expect(component.errorMessage).toBe(
          'Impossible de charger les événements.'
        );
        expect(component.eventsList.length).toBe(0);
        done();
      }, 0);
    });

    it('should set isLoading to false after loading evenements', () => {
      evenementService.getAllEvenements.and.returnValue(of(mockEvenements));
      component.isLoading = true;

      component.loadEvenements();

      expect(component.isLoading).toBe(false);
    });

    it('should clear error message when loading new evenements', () => {
      component.errorMessage = 'Previous error';
      evenementService.getAllEvenements.and.returnValue(of(mockEvenements));

      component.loadEvenements();

      expect(component.errorMessage).toBeNull();
    });

    it('should format calendar events correctly', (done) => {
      evenementService.getAllEvenements.and.returnValue(of(mockEvenements));
      component.loadEvenements();

      setTimeout(() => {
        const calendarEvents = component.calendarOptions.events as {
          id: string;
          title: string;
          start: string;
          end: string;
          extendedProps: { lieu: string };
        }[];
        expect(calendarEvents.length).toBe(2);
        expect(calendarEvents[0].id).toBe('1');
        expect(calendarEvents[0].title).toBe("Réunion d'équipe");
        expect(calendarEvents[0].start).toContain('2026-01-15T10:00');
        expect(calendarEvents[0].end).toContain('2026-01-15T11:00');
        expect(calendarEvents[0].extendedProps.lieu).toBe('Salle A');
        done();
      }, 0);
    });
  });

  //Tests pour le formatage des dates
  describe('Formatage des dates', () => {
    it('should format event date correctly', () => {
      const date = new Date('2026-01-15');
      const time = '10:30';
      const result = component.formatEventDate(date, time);

      expect(result).toBe('2026-01-15T10:30');
    });

    it('should handle different time formats', () => {
      const date = new Date('2026-06-20');
      const time = '23:59';
      const result = component.formatEventDate(date, time);

      expect(result).toBe('2026-06-20T23:59');
    });
  });

  //Tests pour la gestion des clics sur les événements
  describe('Gestion des clics sur événements', () => {
    beforeEach(() => {
      evenementService.getAllEvenements.and.returnValue(of(mockEvenements));
      component.loadEvenements();
      fixture.detectChanges();
    });

    it('should select event when clicked', (done) => {
      const mockEventClickArg: Partial<EventClickArg> = {
        event: {
          id: '1',
        } as EventClickArg['event'],
      };

      component.handleEventClick(mockEventClickArg as EventClickArg);

      setTimeout(() => {
        expect(component.selectedEvent).toBeTruthy();
        expect(component.selectedEvent?.id_evenement).toBe(1);
        expect(component.selectedEvent?.titre).toBe("Réunion d'équipe");
        done();
      }, 100);
    });

    it('should not select event if ID does not match', () => {
      const mockEventClickArg: Partial<EventClickArg> = {
        event: {
          id: '999',
        } as EventClickArg['event'],
      };

      component.handleEventClick(mockEventClickArg as EventClickArg);

      expect(component.selectedEvent).toBeNull();
    });

    it('should close event details', () => {
      component.selectedEvent = mockEvenements[0];

      component.closeEventDetails();

      expect(component.selectedEvent).toBeNull();
    });
  });

  //Tests pour la gestion de l'état du calendrier
  describe("Gestion de l'état du calendrier", () => {
    it('should expand calendar', () => {
      component.calendarState = 'compact';

      component.expandCalendar();

      expect(component.calendarState).toBe('expanded');
    });

    it('should collapse calendar', () => {
      component.calendarState = 'expanded';

      component.collapseCalendar();

      expect(component.calendarState).toBe('compact');
    });

    it('should close calendar', () => {
      component.calendarState = 'expanded';

      component.closeCalendar();

      expect(component.calendarState).toBe('closed');
    });

    it('should open calendar', () => {
      component.calendarState = 'closed';

      component.openCalendar();

      expect(component.calendarState).toBe('expanded');
    });
  });

  //Tests pour la gestion du redimensionnement
  describe('Gestion du redimensionnement', () => {
    it('should handle window resize', () => {
      const mockCalendarApi = {
        setOption: jasmine.createSpy('setOption'),
        view: { type: 'dayGridMonth' },
        changeView: jasmine.createSpy('changeView'),
      } as unknown as CalendarApi;

      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
      component['isMobile'] = false;

      component.handleResize(mockCalendarApi);

      expect(component['isMobile']).toBe(false);
    });

    it('should update headerToolbar when transitioning from mobile to desktop', () => {
      const mockCalendarApi = {
        setOption: jasmine.createSpy('setOption'),
        view: { type: 'dayGridMonth' },
        changeView: jasmine.createSpy('changeView'),
      } as unknown as CalendarApi;

      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      component['isMobile'] = true;
      component.handleResize(mockCalendarApi);

      expect(mockCalendarApi.setOption).toHaveBeenCalledWith(
        'headerToolbar',
        jasmine.objectContaining({
          left: jasmine.any(String),
          center: 'title',
          right: jasmine.any(String),
        })
      );
    });

    it('should update headerToolbar when transitioning from desktop to mobile', () => {
      const mockCalendarApi = {
        setOption: jasmine.createSpy('setOption'),
        view: {
          type: 'dayGridMonth',
        },
        changeView: jasmine.createSpy('changeView'),
      } as unknown as CalendarApi;

      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });

      component['isMobile'] = false;
      component.handleResize(mockCalendarApi);

      expect(mockCalendarApi.setOption).toHaveBeenCalledWith(
        'headerToolbar',
        jasmine.objectContaining({
          left: '',
          center: 'title',
          right: '',
        })
      );
    });
  });

  //Tests pour la configuration du calendrier
  describe('Configuration du calendrier', () => {
    it('should have correct calendar plugins configured', () => {
      expect(component.calendarOptions.plugins).toBeTruthy();
      expect(
        (component.calendarOptions.locale as { code: string })?.code ||
          component.calendarOptions.locale
      ).toBe('fr');
    });

    it('should have correct initial view settings', () => {
      expect(component.calendarOptions.initialView).toBe('dayGridMonth');
      expect(component.calendarOptions.weekNumbers).toBe(true);
      expect(component.calendarOptions.weekends).toBe(true);
    });

    it('should have correct time slot settings', () => {
      expect(component.calendarOptions.slotMinTime).toBe('07:00:00');
      expect(component.calendarOptions.slotMaxTime).toBe('20:00:00');
    });

    it('should have correct event styling', () => {
      expect(component.calendarOptions.eventColor).toBe('#9ae39cff');
      expect(component.calendarOptions.eventTextColor).toBe('#000000');
    });
  });

  //Tests d'intégration complète
  describe('Intégration complète', () => {
    it('should load events and display calendar correctly', (done) => {
      evenementService.getAllEvenements.and.returnValue(of(mockEvenements));
      fixture.detectChanges();

      setTimeout(() => {
        expect(component.eventsList.length).toBe(2);
        expect(component.isLoading).toBe(false);
        expect((component.calendarOptions.events as unknown[]).length).toBe(2);
        done();
      }, 0);
    });

    it('should handle complete user flow', (done) => {
      evenementService.getAllEvenements.and.returnValue(of(mockEvenements));
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
});
